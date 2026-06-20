const ApiError = require('../exceptions/api-error');

function getDailyApiUrl() {
  return (process.env.DAILY_API_URL || 'https://api.daily.co/v1').replace(/\/$/, '');
}

async function dailyRequest(path, options = {}) {
  if (!process.env.DAILY_API_KEY) {
    throw ApiError.BadRequest('DAILY_API_KEY is not configured');
  }

  const dailyApiUrl = getDailyApiUrl();

  if (!/^https?:\/\//.test(dailyApiUrl)) {
    throw ApiError.BadRequest(
      'DAILY_API_URL must be https://api.daily.co/v1, not your Daily subdomain'
    );
  }

  const response = await fetch(`${dailyApiUrl}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${process.env.DAILY_API_KEY}`,
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw ApiError.BadRequest(`Daily API error ${response.status}: ${errorText}`);
  }

  return response.json();
}

class DailyService {
  async createRoom({
    name,
    expiresAt,
    maxParticipants,
    startVideoOff,
    startAudioOff,
    enableScreenshare,
    enableChat,
  }) {
    const exp = Math.floor(expiresAt.getTime() / 1000);

    return dailyRequest('/rooms', {
      method: 'POST',
      body: JSON.stringify({
        name,
        privacy: 'private',
        properties: {
          exp,
          eject_at_room_exp: true,
          max_participants: maxParticipants,
          enable_prejoin_ui: true,
          enable_screenshare: enableScreenshare,
          enable_chat: enableChat,
          start_video_off: startVideoOff,
          start_audio_off: startAudioOff,
          enforce_unique_user_ids: true,
        },
      }),
    });
  }

  async createMeetingToken({
    roomName,
    userId,
    userName,
    role,
    expiresAt,
    permissions,
  }) {
    const exp = Math.floor(expiresAt.getTime() / 1000);
    const isAdmin = role === 'owner' || role === 'moderator';
    const canSend = [];

    if (permissions.canSendAudio) {
      canSend.push('audio');
    }

    if (permissions.canSendVideo) {
      canSend.push('video');
    }

    if (permissions.canScreenshare) {
      canSend.push('screenVideo', 'screenAudio');
    }

    const result = await dailyRequest('/meeting-tokens', {
      method: 'POST',
      body: JSON.stringify({
        properties: {
          room_name: roomName,
          exp,
          eject_at_token_exp: true,
          is_owner: isAdmin,
          user_id: String(userId),
          user_name: userName,
          enable_screenshare: Boolean(permissions.canScreenshare),
          start_video_off: false,
          start_audio_off: false,
          permissions: {
            hasPresence: true,
            canSend,
            canReceive: {
              base: true,
            },
            canAdmin: Boolean(permissions.canAdmin),
          },
        },
      }),
    });

    return result.token;
  }
}

module.exports = new DailyService();
