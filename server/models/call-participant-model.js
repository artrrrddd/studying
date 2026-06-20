const { Schema, model, models } = require('mongoose');

const CallParticipantSchema = new Schema(
  {
    callRoom: {
      type: Schema.Types.ObjectId,
      ref: 'CallRoom',
      required: true,
      index: true,
    },

    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    role: {
      type: String,
      enum: ['owner', 'moderator', 'participant'],
      default: 'participant',
    },

    status: {
      type: String,
      enum: ['invited', 'joined', 'left', 'removed'],
      default: 'invited',
    },

    joinedAt: Date,
    leftAt: Date,

    permissions: {
      canSendAudio: { type: Boolean, default: true },
      canSendVideo: { type: Boolean, default: true },
      canScreenshare: { type: Boolean, default: false },
      canAdmin: { type: Boolean, default: false },
    },
  },
  { timestamps: true }
);

CallParticipantSchema.index({ callRoom: 1, user: 1 }, { unique: true });

module.exports =
  models.CallParticipant || model('CallParticipant', CallParticipantSchema);
