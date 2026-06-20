const { Schema, model, models } = require('mongoose');

const CallRoomSchema = new Schema(
  {
    title: {
      type: String,
      default: 'Video call',
    },

    type: {
      type: String,
      enum: ['instant', 'scheduled', 'permanent'],
      default: 'instant',
    },

    visibility: {
      type: String,
      enum: ['private', 'link', 'public'],
      default: 'private',
    },

    owner: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    allowedUsers: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],

    dailyRoomName: {
      type: String,
      required: true,
      unique: true,
    },

    dailyRoomUrl: {
      type: String,
      required: true,
    },

    dailyRoomId: {
      type: String,
    },

    status: {
      type: String,
      enum: ['created', 'active', 'ended', 'expired'],
      default: 'created',
      index: true,
    },

    maxParticipants: {
      type: Number,
      default: 10,
    },

    startsAt: {
      type: Date,
    },

    expiresAt: {
      type: Date,
      required: true,
      index: true,
    },

    endedAt: {
      type: Date,
    },

    settings: {
      startVideoOff: { type: Boolean, default: false },
      startAudioOff: { type: Boolean, default: false },
      enableScreenshare: { type: Boolean, default: true },
      enableChat: { type: Boolean, default: false },
      enableRecording: { type: Boolean, default: false },
      requireLobby: { type: Boolean, default: false },
    },
  },
  { timestamps: true }
);

module.exports = models.CallRoom || model('CallRoom', CallRoomSchema);
