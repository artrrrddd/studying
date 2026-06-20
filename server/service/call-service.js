const crypto = require('crypto');
const mongoose = require('mongoose');
const ApiError = require('../exceptions/api-error');
const CallRoomModel = require('../models/call-room-model');
const CallParticipantModel = require('../models/call-participant-model');
const CallInviteModel = require('../models/call-invite-model');
const UserModel = require('../models/user-model');
const dailyService = require('./daily-service');

const DEFAULT_CALL_MINUTES = 180;
const PERMANENT_ROOM_DAYS = 30;

function toObjectId(id) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw ApiError.BadRequest('Invalid id');
  }

  return new mongoose.Types.ObjectId(id);
}

function sameId(left, right) {
  return String(left) === String(right);
}

function clampNumber(value, min, max, fallback) {
  const number = Number(value);
  if (!Number.isFinite(number)) {
    return fallback;
  }

  return Math.min(Math.max(Math.round(number), min), max);
}

function hashInviteCode(inviteCode) {
  return crypto.createHash('sha256').update(inviteCode).digest('hex');
}

function addMinutes(date, minutes) {
  return new Date(date.getTime() + minutes * 60 * 1000);
}

function serializeCall(room) {
  return {
    id: room._id,
    title: room.title,
    type: room.type,
    visibility: room.visibility,
    owner: room.owner,
    allowedUsers: room.allowedUsers,
    status: room.status,
    maxParticipants: room.maxParticipants,
    startsAt: room.startsAt,
    expiresAt: room.expiresAt,
    endedAt: room.endedAt,
    settings: room.settings,
    createdAt: room.createdAt,
    updatedAt: room.updatedAt,
  };
}

function serializeParticipant(participant) {
  if (!participant) {
    return null;
  }

  return {
    id: participant._id,
    callRoom: participant.callRoom,
    user: participant.user,
    role: participant.role,
    status: participant.status,
    joinedAt: participant.joinedAt,
    leftAt: participant.leftAt,
    permissions: participant.permissions,
  };
}

function getDefaultPermissions(role) {
  const isAdmin = role === 'owner' || role === 'moderator';

  return {
    canSendAudio: true,
    canSendVideo: true,
    canScreenshare: isAdmin,
    canAdmin: isAdmin,
  };
}

function getTokenExpiresAt(room) {
  const tokenExpiresAt = addMinutes(new Date(), DEFAULT_CALL_MINUTES);
  return tokenExpiresAt < room.expiresAt ? tokenExpiresAt : room.expiresAt;
}

class CallService {
  normalizeSettings(settings = {}) {
    return {
      startVideoOff: Boolean(settings.startVideoOff),
      startAudioOff: Boolean(settings.startAudioOff),
      enableScreenshare: settings.enableScreenshare !== false,
      enableChat: Boolean(settings.enableChat),
      enableRecording: Boolean(settings.enableRecording),
      requireLobby: Boolean(settings.requireLobby),
    };
  }

  getExpiresAt(type, dto) {
    if (dto.expiresAt) {
      const expiresAt = new Date(dto.expiresAt);
      if (!Number.isNaN(expiresAt.getTime()) && expiresAt > new Date()) {
        return expiresAt;
      }
    }

    if (type === 'permanent') {
      return addMinutes(new Date(), PERMANENT_ROOM_DAYS * 24 * 60);
    }

    if (type === 'scheduled' && dto.startsAt) {
      const startsAt = new Date(dto.startsAt);
      if (!Number.isNaN(startsAt.getTime())) {
        return addMinutes(startsAt, DEFAULT_CALL_MINUTES);
      }
    }

    return addMinutes(new Date(), DEFAULT_CALL_MINUTES);
  }

  createDailyRoomName(userId) {
    return `call-${String(userId).slice(-6)}-${Date.now()}-${crypto
      .randomBytes(4)
      .toString('hex')}`;
  }

  async getUserName(userId) {
    const user = await UserModel.findById(userId).select('email name');
    return user?.name || user?.email || 'User';
  }

  async createCall(userId, dto = {}) {
    const type = ['instant', 'scheduled', 'permanent'].includes(dto.type)
      ? dto.type
      : 'instant';
    const visibility = ['private', 'link', 'public'].includes(dto.visibility)
      ? dto.visibility
      : 'private';
    const settings = this.normalizeSettings(dto.settings);
    const expiresAt = this.getExpiresAt(type, dto);
    const startsAt = dto.startsAt ? new Date(dto.startsAt) : undefined;
    const maxParticipants = clampNumber(dto.maxParticipants, 2, 200, 10);
    const allowedUsers = Array.isArray(dto.allowedUsers)
      ? dto.allowedUsers.filter((id) => mongoose.Types.ObjectId.isValid(id))
      : [];
    const dailyRoomName = this.createDailyRoomName(userId);

    const dailyRoom = await dailyService.createRoom({
      name: dailyRoomName,
      expiresAt,
      maxParticipants,
      startVideoOff: settings.startVideoOff,
      startAudioOff: settings.startAudioOff,
      enableScreenshare: settings.enableScreenshare,
      enableChat: settings.enableChat,
    });

    const room = await CallRoomModel.create({
      title: dto.title?.trim?.() || 'Video call',
      type,
      visibility,
      owner: userId,
      allowedUsers,
      dailyRoomName: dailyRoom.name || dailyRoomName,
      dailyRoomUrl: dailyRoom.url,
      dailyRoomId: dailyRoom.id,
      maxParticipants,
      startsAt: startsAt && !Number.isNaN(startsAt.getTime()) ? startsAt : undefined,
      expiresAt,
      settings,
    });

    await CallParticipantModel.create({
      callRoom: room._id,
      user: userId,
      role: 'owner',
      status: 'invited',
      permissions: getDefaultPermissions('owner'),
    });

    return serializeCall(room);
  }

  async getMyCalls(userId) {
    const participantCallIds = await CallParticipantModel.distinct('callRoom', {
      user: userId,
      status: { $ne: 'removed' },
    });

    const rooms = await CallRoomModel.find({
      $or: [
        { owner: userId },
        { allowedUsers: userId },
        { _id: { $in: participantCallIds } },
      ],
    }).sort({ createdAt: -1 });

    return rooms.map(serializeCall);
  }

  async getCallById(userId, callId) {
    const room = await this.getAccessibleRoom(userId, callId);
    const participant = await CallParticipantModel.findOne({
      callRoom: room._id,
      user: userId,
    });
    const participants = await CallParticipantModel.find({
      callRoom: room._id,
      status: { $ne: 'removed' },
    }).sort({ createdAt: 1 });

    return {
      call: serializeCall(room),
      participant: serializeParticipant(participant),
      participants: participants.map(serializeParticipant),
    };
  }

  async getAccessibleRoom(userId, callId) {
    const room = await CallRoomModel.findById(toObjectId(callId));
    if (!room) {
      throw ApiError.NotFound('Call not found');
    }

    await this.refreshExpiredRoom(room);

    const hasAccess = await this.checkAccess(userId, room);
    if (!hasAccess) {
      throw ApiError.Forbidden('No access to this call');
    }

    return room;
  }

  async refreshExpiredRoom(room) {
    if (room.status !== 'ended' && room.expiresAt <= new Date()) {
      room.status = 'expired';
      await room.save();
    }
  }

  async checkAccess(userId, room) {
    if (sameId(room.owner, userId)) {
      return true;
    }

    if (room.visibility === 'public' || room.visibility === 'link') {
      return true;
    }

    const allowed = room.allowedUsers.some((id) => sameId(id, userId));
    if (allowed) {
      return true;
    }

    const participant = await CallParticipantModel.findOne({
      callRoom: room._id,
      user: userId,
      status: { $ne: 'removed' },
    });

    return Boolean(participant);
  }

  async ensureCanJoin(room) {
    if (room.status === 'ended') {
      throw ApiError.BadRequest('Call has ended');
    }

    if (room.status === 'expired' || room.expiresAt <= new Date()) {
      room.status = 'expired';
      await room.save();
      throw ApiError.BadRequest('Call has expired');
    }
  }

  async getOrCreateParticipant(userId, room) {
    const role = sameId(room.owner, userId) ? 'owner' : 'participant';
    const existing = await CallParticipantModel.findOne({
      callRoom: room._id,
      user: userId,
    });

    if (existing) {
      if (existing.status === 'removed') {
        throw ApiError.Forbidden('Participant was removed from this call');
      }

      return existing;
    }

    return CallParticipantModel.create({
      callRoom: room._id,
      user: userId,
      role,
      status: 'invited',
      permissions: getDefaultPermissions(role),
    });
  }

  async joinCall(userId, callId) {
    const room = await this.getAccessibleRoom(userId, callId);
    await this.ensureCanJoin(room);

    const participant = await this.getOrCreateParticipant(userId, room);
    participant.status = 'joined';
    participant.joinedAt = participant.joinedAt || new Date();
    participant.leftAt = undefined;
    await participant.save();

    if (room.status === 'created') {
      room.status = 'active';
      await room.save();
    }

    const token = await dailyService.createMeetingToken({
      roomName: room.dailyRoomName,
      userId,
      userName: await this.getUserName(userId),
      role: participant.role,
      expiresAt: getTokenExpiresAt(room),
      permissions: participant.permissions,
    });

    return {
      roomUrl: room.dailyRoomUrl,
      token,
      call: serializeCall(room),
      participant: serializeParticipant(participant),
      user: {
        id: userId,
        name: await this.getUserName(userId),
      },
    };
  }

  async joinCallByInviteCode(userId, inviteCode) {
    if (!inviteCode) {
      throw ApiError.BadRequest('Invite code is required');
    }

    const invite = await CallInviteModel.findOne({
      inviteCodeHash: hashInviteCode(inviteCode),
      status: 'active',
    });

    if (!invite) {
      throw ApiError.BadRequest('Invite not found');
    }

    if (invite.expiresAt <= new Date()) {
      invite.status = 'expired';
      await invite.save();
      throw ApiError.BadRequest('Invite has expired');
    }

    if (invite.invitedUser && !sameId(invite.invitedUser, userId)) {
      throw ApiError.Forbidden('Invite belongs to another user');
    }

    await CallRoomModel.updateOne(
      { _id: invite.callRoom },
      { $addToSet: { allowedUsers: userId } }
    );

    await CallParticipantModel.findOneAndUpdate(
      { callRoom: invite.callRoom, user: userId },
      {
        $setOnInsert: {
          role: 'participant',
          permissions: getDefaultPermissions('participant'),
        },
        $set: { status: 'invited' },
      },
      { upsert: true, new: true }
    );

    invite.status = 'used';
    await invite.save();

    return this.joinCall(userId, invite.callRoom);
  }

  async createInvite(userId, callId, dto = {}) {
    const room = await this.getAccessibleRoom(userId, callId);
    const actor = await this.requireAdmin(userId, room);
    const expiresInMinutes = clampNumber(dto.expiresInMinutes, 5, 24 * 60, 60);
    const inviteCode = crypto.randomBytes(24).toString('hex');
    const invitedUserId = dto.invitedUserId;

    if (invitedUserId && !mongoose.Types.ObjectId.isValid(invitedUserId)) {
      throw ApiError.BadRequest('Invalid invited user id');
    }

    await CallInviteModel.create({
      callRoom: room._id,
      createdBy: actor.user,
      invitedUser: invitedUserId || undefined,
      inviteCodeHash: hashInviteCode(inviteCode),
      expiresAt: addMinutes(new Date(), expiresInMinutes),
    });

    const clientUrl = (process.env.CLIENT_URL || 'http://localhost:5173').replace(
      /\/$/,
      ''
    );

    return {
      inviteCode,
      joinUrl: `${clientUrl}/calls/join/${inviteCode}`,
    };
  }

  async requireAdmin(userId, room) {
    const participant = await CallParticipantModel.findOne({
      callRoom: room._id,
      user: userId,
      status: { $ne: 'removed' },
    });

    if (
      !participant ||
      (participant.role !== 'owner' &&
        participant.role !== 'moderator' &&
        !participant.permissions.canAdmin)
    ) {
      throw ApiError.Forbidden('Only call admins can perform this action');
    }

    return participant;
  }

  async endCall(userId, callId) {
    const room = await this.getAccessibleRoom(userId, callId);
    await this.requireAdmin(userId, room);

    room.status = 'ended';
    room.endedAt = new Date();
    await room.save();

    await CallParticipantModel.updateMany(
      { callRoom: room._id, status: 'joined' },
      { $set: { status: 'left', leftAt: new Date() } }
    );

    return serializeCall(room);
  }

  async removeParticipant(userId, callId, participantUserId) {
    const room = await this.getAccessibleRoom(userId, callId);
    await this.requireAdmin(userId, room);

    if (sameId(room.owner, participantUserId)) {
      throw ApiError.BadRequest('Owner cannot be removed');
    }

    const participant = await CallParticipantModel.findOneAndUpdate(
      { callRoom: room._id, user: toObjectId(participantUserId) },
      { $set: { status: 'removed', leftAt: new Date() } },
      { new: true }
    );

    if (!participant) {
      throw ApiError.NotFound('Participant not found');
    }

    return serializeParticipant(participant);
  }

  async updateParticipantPermissions(userId, callId, participantUserId, permissions) {
    const room = await this.getAccessibleRoom(userId, callId);
    await this.requireAdmin(userId, room);

    const nextPermissions = {};
    for (const key of [
      'canSendAudio',
      'canSendVideo',
      'canScreenshare',
      'canAdmin',
    ]) {
      if (permissions && Object.prototype.hasOwnProperty.call(permissions, key)) {
        nextPermissions[`permissions.${key}`] = Boolean(permissions[key]);
      }
    }

    if (!Object.keys(nextPermissions).length) {
      throw ApiError.BadRequest('Permissions payload is empty');
    }

    const participant = await CallParticipantModel.findOneAndUpdate(
      { callRoom: room._id, user: toObjectId(participantUserId) },
      { $set: nextPermissions },
      { new: true }
    );

    if (!participant) {
      throw ApiError.NotFound('Participant not found');
    }

    return serializeParticipant(participant);
  }
}

module.exports = new CallService();
