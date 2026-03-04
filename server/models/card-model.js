const { Schema, model } = require('mongoose');

const CardSchema = new Schema(
  {
    word: { type: String, required: true },
    translate: { type: String, required: true },
    lang: { type: String, required: true },
    user: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

module.exports = model('Card', CardSchema);