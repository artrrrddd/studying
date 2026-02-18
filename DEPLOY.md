# Деплой Quizlet

Поддерживаются два варианта:

- **Render** — один сервис: Node-сервер раздаёт API и собранный фронт (Vite).
- **Vercel** — фронт как статика, бэкенд как одна serverless-функция (Express в `/api`).

## Переменные окружения

В продакшене обязательно задать:

- **DB_URL** — строка подключения MongoDB (например `mongodb+srv://user:pass@cluster.mongodb.net/quizlet`).

При деплое с одного домена **CLIENT_URL** не нужен.

## Vercel (клиент + сервер)

И клиент, и API деплоятся в одном проекте: статика из `client/dist`, все запросы `/api/*` обрабатывает одна serverless-функция (Express).

1. Залей репозиторий на GitHub.
2. [Vercel](https://vercel.com) → Add New → Project, подключи репозиторий.
3. **Root Directory**: укажи `quizlet` (папка с `client/`, `server/`, `api/`, `vercel.json`).
4. В **Environment Variables** добавь **DB_URL**.
5. Deploy (команды сборки уже заданы в `vercel.json`).

Локальная проверка с эмуляцией Vercel: из корня проекта `quizlet` выполни `npx vercel dev` (предварительно `npm i -g vercel`).

## Render.com

1. Залей репозиторий на GitHub.
2. [Render](https://render.com) → New → Web Service, подключи репозиторий.
3. **Root Directory**: укажи `quizlet` (папка, где лежат `client/`, `server/` и этот `package.json`).
4. **Build Command**: `npm run build`
5. **Start Command**: `npm run start`
6. В разделе Environment добавь переменную **DB_URL**.
7. Deploy.

Либо используй Blueprint: в корне репо положи `render.yaml` (из этой папки), в Render создай New → Blueprint и подключи репо — сервис подтянет команды из `render.yaml`. Root Directory для сервиса задай `quizlet`.

## Локальная проверка продакшен-сборки (Render-вариант)

Из папки `quizlet` (где лежит этот файл):

```bash
npm run build
set NODE_ENV=production
npm run start
```

Открой в браузере `http://localhost:5000` (или тот порт, который выведет сервер).
