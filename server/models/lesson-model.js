const { Schema, model } = require('mongoose');

const LessonSchema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    cards: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Card',
      },
    ],
  },
  { timestamps: true }
);

module.exports = model('Lesson', LessonSchema);
