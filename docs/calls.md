# Calls subsystem

Документация описывает независимую подсистему видеозвонков, добавленную поверх Daily. Подсистема не связана с lessons/cards: у нее свои модели, сервисы, API routes, клиентский API layer, hooks и React-компоненты.

## Главный принцип

Frontend не обращается к Daily REST API напрямую и не знает `DAILY_API_KEY`.

Поток выглядит так:

```text
User открывает Calls
  -> client вызывает backend /api/calls
  -> backend создает CallRoom в MongoDB
  -> backend создает Daily room через Daily REST API
  -> backend создает Daily meeting token для текущего user
  -> client получает roomUrl + token
  -> React подключается к Daily через @daily-co/daily-js/@daily-co/daily-react
```

Daily остается техническим провайдером. Бизнес-сущность приложения - `CallRoom`.

## Файлы

Backend:

```text
server/models/call-room-model.js
server/models/call-participant-model.js
server/models/call-invite-model.js
server/service/daily-service.js
server/service/call-service.js
server/controllers/call-controller.js
server/router/index.js
```

Frontend:

```text
client/src/api/callsApi.js
client/src/hooks/calls/useCallRoom.js
client/src/hooks/calls/useDailyCall.js
client/src/components/calls/CallsPage.jsx
client/src/components/calls/CreateCallPage.jsx
client/src/components/calls/CallRoomPage.jsx
client/src/components/calls/JoinCallByInvitePage.jsx
client/src/components/calls/CallRoom.jsx
client/src/components/calls/CallControls.jsx
client/src/components/calls/ParticipantsGrid.jsx
client/src/components/calls/ParticipantTile.jsx
client/src/components/calls/IncomingCallModal.jsx
client/src/components/calls/CreateCallModal.jsx
client/src/components/calls/CallLobby.jsx
client/src/components/calls/calls.module.css
```

## Environment

В `server/.env` нужны переменные:

```env
DAILY_API_URL=https://api.daily.co/v1
DAILY_API_KEY=your_daily_api_key_here
CLIENT_URL=http://localhost:5173
```

`DAILY_API_KEY` должен быть только на backend. Не добавлять его в `VITE_*`, потому что такие переменные попадают во frontend bundle.

## Backend architecture

### CallRoom

`server/models/call-room-model.js`

Главная бизнес-сущность звонка. Хранит:

- `title`, `type`, `visibility`
- `owner`
- `allowedUsers`
- Daily technical fields: `dailyRoomName`, `dailyRoomUrl`, `dailyRoomId`
- `status`: `created`, `active`, `ended`, `expired`
- `maxParticipants`
- `startsAt`, `expiresAt`, `endedAt`
- `settings`: старт с выключенным видео/аудио, screen share, chat, recording, lobby

Даже если Daily потом заменить на LiveKit/Agora, frontend и продуктовая логика могут продолжить работать вокруг `CallRoom`.

### CallParticipant

`server/models/call-participant-model.js`

Участники вынесены в отдельную коллекцию. Это нужно для истории, статусов, ролей и будущей аналитики.

Основные поля:

- `callRoom`
- `user`
- `role`: `owner`, `moderator`, `participant`
- `status`: `invited`, `joined`, `left`, `removed`
- `joinedAt`, `leftAt`
- `permissions`: audio/video/screenshare/admin

Есть уникальный индекс:

```js
{ callRoom: 1, user: 1 }
```

Один user не может быть добавлен в одну комнату несколько раз.

### CallInvite

`server/models/call-invite-model.js`

Приглашения отделены от комнат. В базе хранится не plain invite code, а SHA-256 hash.

Поля:

- `callRoom`
- `createdBy`
- `invitedUser`
- `inviteCodeHash`
- `status`: `active`, `used`, `revoked`, `expired`
- `expiresAt`

Текущая реализация помечает invite как `used` после успешного join by code. То есть invite code одноразовый.

### DailyService

`server/service/daily-service.js`

Единственное место, где backend знает про Daily REST API.

Методы:

- `createRoom(...)`
- `createMeetingToken(...)`

`createRoom` вызывает:

```text
POST https://api.daily.co/v1/rooms
Authorization: Bearer DAILY_API_KEY
```

Daily room создается как `privacy: "private"`. Доступ контролируется meeting token.

`createMeetingToken` вызывает:

```text
POST https://api.daily.co/v1/meeting-tokens
Authorization: Bearer DAILY_API_KEY
```

Meeting token выдается только после backend-проверки доступа.

### CallService

`server/service/call-service.js`

Основной слой бизнес-логики.

Реализованные методы:

- `createCall(userId, dto)`
- `getMyCalls(userId)`
- `getCallById(userId, callId)`
- `joinCall(userId, callId)`
- `joinCallByInviteCode(userId, inviteCode)`
- `createInvite(userId, callId, dto)`
- `endCall(userId, callId)`
- `removeParticipant(userId, callId, participantUserId)`
- `updateParticipantPermissions(userId, callId, participantUserId, permissions)`

Что делает `createCall`:

1. Нормализует DTO.
2. Считает `expiresAt`.
3. Создает Daily room.
4. Создает `CallRoom` в MongoDB.
5. Создает `CallParticipant` для owner.
6. Возвращает serialized call.

Что делает `joinCall`:

1. Проверяет доступ к `CallRoom`.
2. Проверяет, что звонок не ended/expired.
3. Создает или обновляет `CallParticipant`.
4. Переводит call из `created` в `active`.
5. Запрашивает Daily meeting token.
6. Возвращает `roomUrl`, `token`, `call`, `participant`, `user`.

## Backend API

Все endpoints подключены в `server/router/index.js` и доступны под `/api`, потому что `server/app.js` монтирует router как:

```js
app.use('/api', router)
```

Все routes требуют `authMiddleware`.

### POST /api/calls

Создать звонок.

Request:

```json
{
  "title": "Team call",
  "type": "instant",
  "visibility": "private",
  "maxParticipants": 10,
  "settings": {
    "startVideoOff": false,
    "startAudioOff": false,
    "enableScreenshare": true,
    "enableChat": false
  },
  "allowedUsers": []
}
```

Response:

```json
{
  "id": "callRoomMongoId",
  "title": "Team call",
  "type": "instant",
  "visibility": "private",
  "status": "created",
  "maxParticipants": 10,
  "expiresAt": "2026-06-15T15:00:00.000Z",
  "settings": {}
}
```

### GET /api/calls

Получить мои звонки.

Возвращает комнаты, где user:

- owner
- находится в `allowedUsers`
- есть в `CallParticipant`

### GET /api/calls/:id

Получить звонок, текущего участника и список участников.

Response:

```json
{
  "call": {},
  "participant": {},
  "participants": []
}
```

### POST /api/calls/:id/join

Выдать Daily token и данные для подключения.

Response:

```json
{
  "roomUrl": "https://your-domain.daily.co/room-name",
  "token": "daily-meeting-token",
  "call": {
    "id": "callRoomMongoId",
    "title": "Team call",
    "status": "active"
  },
  "participant": {
    "role": "owner",
    "permissions": {
      "canSendAudio": true,
      "canSendVideo": true,
      "canScreenshare": true,
      "canAdmin": true
    }
  },
  "user": {
    "id": "currentUserId",
    "name": "user@example.com"
  }
}
```

### POST /api/calls/:id/invites

Создать invite code/link.

Request:

```json
{
  "expiresInMinutes": 60,
  "invitedUserId": "optional-user-id"
}
```

Response:

```json
{
  "inviteCode": "plain-code-shown-once",
  "joinUrl": "http://localhost:5173/calls/join/plain-code-shown-once"
}
```

Plain invite code возвращается только один раз. В MongoDB хранится hash.

### POST /api/calls/join-by-code

Зайти по invite code.

Request:

```json
{
  "inviteCode": "plain-code-from-url"
}
```

Response такой же, как у `POST /api/calls/:id/join`.

### POST /api/calls/:id/end

Завершить звонок. Доступно owner/moderator/admin participant.

Переводит room в `ended`, ставит `endedAt`, joined participants переводит в `left`.

### PATCH /api/calls/:id/participants/:userId/permissions

Обновить permissions участника.

Request:

```json
{
  "permissions": {
    "canSendAudio": true,
    "canSendVideo": true,
    "canScreenshare": false,
    "canAdmin": false
  }
}
```

### DELETE /api/calls/:id/participants/:userId

Удалить участника из звонка. Owner удалить нельзя.

## Frontend architecture

### API layer

`client/src/api/callsApi.js`

Использует существующий `$api` из `client/src/http/index.js`, где access token добавляется автоматически.

Методы:

- `createCall(payload)`
- `getMyCalls()`
- `getCall(id)`
- `joinCall(id)`
- `endCall(id)`
- `createInvite(id, payload)`
- `joinByCode(inviteCode)`
- `updateParticipantPermissions(id, userId, permissions)`
- `removeParticipant(id, userId)`

### Routes

Подключены в `client/src/AppContent.jsx`:

```jsx
<Route path="calls" element={<CallsPage />} />
<Route path="calls/new" element={<CreateCallPage />} />
<Route path="calls/join/:inviteCode" element={<JoinCallByInvitePage />} />
<Route path="calls/:id" element={<CallRoomPage />} />
```

Также ссылка `Calls` добавлена в `Header.jsx` и `Navbar.jsx`.

### Hooks

#### useCallRoom

`client/src/hooks/calls/useCallRoom.js`

Используется для списка звонков и создания звонка:

- загружает `callsApi.getMyCalls()`
- хранит `calls`, `loading`, `error`
- предоставляет `createCall(payload)`

#### useDailyCall

`client/src/hooks/calls/useDailyCall.js`

Создает Daily call object:

```js
DailyIframe.createCallObject()
```

Потом вызывает переданный `joinRequest`, получает `roomUrl` и `token`, и подключается:

```js
callObject.join({
  url: data.roomUrl,
  token: data.token,
  userName: data.user?.name || data.user?.email || 'User',
})
```

При unmount делает `leave()` и `destroy()`.

### Pages/components

#### CallsPage

`client/src/components/calls/CallsPage.jsx`

Показывает список звонков текущего пользователя и кнопку создания нового звонка.

#### CreateCallPage

`client/src/components/calls/CreateCallPage.jsx`

Форма создания instant call. После успешного создания делает redirect на `/calls/:id`.

#### CallRoomPage

`client/src/components/calls/CallRoomPage.jsx`

Получает `id` из route, вызывает `callsApi.joinCall(id)`, оборачивает комнату в:

```jsx
<DailyProvider callObject={callObject}>
  <CallRoom />
</DailyProvider>
```

#### JoinCallByInvitePage

`client/src/components/calls/JoinCallByInvitePage.jsx`

Получает `inviteCode` из route, вызывает `callsApi.joinByCode(inviteCode)` и подключает пользователя к Daily.

#### CallRoom

`client/src/components/calls/CallRoom.jsx`

Основной UI звонка:

- header с названием и ролью
- `ParticipantsGrid`
- sidebar участников
- invite panel
- `CallControls`

#### ParticipantsGrid / ParticipantTile

Используют Daily React hooks:

- `useParticipantIds`
- `useLocalSessionId`
- `useActiveSpeakerId`
- `useParticipantProperty`

`ParticipantTile` подключает media tracks к `video`/`audio` через `MediaStream`.

Показывает:

- remote/local video
- fallback avatar с initials
- speaking indicator
- muted state

#### CallControls

Управление звонком:

- microphone on/off
- camera on/off
- screen share on/off
- create invite link
- leave call
- end call для admin/owner/moderator

Иконки берутся из `lucide-react`.

## Security notes

- `DAILY_API_KEY` хранится только на backend.
- Daily rooms создаются как private.
- Frontend получает только `dailyRoomUrl` и short-lived meeting token.
- Meeting token создается только после `authMiddleware` и проверки доступа в `CallService`.
- Invite code хранится в базе только как SHA-256 hash.
- `auth-middleware` больше не логирует user data из JWT.
- User model расширен полями `name` и `avatarUrl`, но UI сейчас fallback-ится на email/name.

## Current MVP behavior

Реализовано:

- создать звонок
- получить список моих звонков
- открыть звонок
- получить Daily token через backend
- подключиться к Daily
- включить/выключить микрофон
- включить/выключить камеру
- screen share
- создать invite link
- зайти по invite code
- выйти
- завершить звонок owner/moderator/admin
- базовые participant permissions endpoints

Не реализовано в MVP:

- realtime incoming calls
- ringing state
- accept/decline через WebSocket
- live online/offline presence вне Daily room
- recording/transcription
- billing/limits
- moderation logs
- scheduled call UI

## Dependencies

Client dependencies:

```json
{
  "@daily-co/daily-js": "...",
  "@daily-co/daily-react": "...",
  "lucide-react": "..."
}
```

Daily packages нужны для custom UI. Prebuilt UI не используется.

## Проверка

Production build:

```bash
cd client
npm run build
```

Синтаксическая проверка server-файлов:

```bash
node --check server/service/call-service.js
node --check server/service/daily-service.js
node --check server/controllers/call-controller.js
node --check server/router/index.js
```

Lint на момент добавления подсистемы падает на старых unused-переменных в существующих компонентах (`Card.jsx`, `ComparisonMode.jsx`, `MainPage.jsx`, `AppContent.jsx`). Новые call-файлы не были источником lint errors.

## Known local issue

В текущем Windows workspace путь содержит кириллицу (`Рабочий стол`). `npm run build` проходит, но `npm run dev` в sandbox падал внутри Vite/esbuild с ошибкой чтения `vite.config.js`. Это не связано с Daily-кодом; это локальная проблема dev-mode/esbuild/path/access. Если повторится локально, самый простой обход - перенести рабочую копию в ASCII-only путь, например:

```text
C:\Projects\quizlet
```

## Future stages

Следующий естественный этап:

- роли moderator в UI
- управление permissions из sidebar
- remove participant из UI
- scheduled calls
- call history/duration
- Socket.IO для incoming calls
- recording/transcription после решения вопросов хранения, стоимости и приватности
