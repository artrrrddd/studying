const { Schema, model, models } = require('mongoose');

const CallInviteSchema = new Schema(
  {
    callRoom: {
      type: Schema.Types.ObjectId,
      ref: 'CallRoom',
      required: true,
      index: true,
    },

    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    invitedUser: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },

    inviteCodeHash: {
      type: String,
      required: true,
      unique: true,
    },

    status: {
      type: String,
      enum: ['active', 'used', 'revoked', 'expired'],
      default: 'active',
    },

    expiresAt: {
      type: Date,
      required: true,
      index: true,
    },
  },
  { timestamps: true }
);

module.exports = models.CallInvite || model('CallInvite', CallInviteSchema);
