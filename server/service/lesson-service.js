const mongoose = require('mongoose');
const LessonModel = require('../models/lesson-model');
const LessonDto = require('../dtos/lesson-dto');
const ApiError = require('../exceptions/api-error');
const CardModel = require('../models/card-model');

class LessonService {
  async create(userId, title, description, cards = []) {
    if (!title?.trim()) {
      throw ApiError.BadRequest('Введите название урока');
    }

    const normalizedCards = Array.isArray(cards) ? cards : [];

    const cardIds = await Promise.all(
      normalizedCards.map(async (card) => {
        if (card && typeof card === 'object' && card.word !== undefined) {
          const { word, translate, lang } = card;

          if (!word?.trim() || !translate?.trim() || !lang?.trim()) {
            throw ApiError.BadRequest(
              'Заполните слово, перевод и язык для всех карточек'
            );
          }

          const createdCard = await CardModel.create({
            word: word.trim(),
            translate: translate.trim(),
            lang: lang.trim(),
            user: userId,
          });

          return createdCard._id;
        }

        if (card && typeof card === 'object' && card._id) {
          return card._id;
        }

        return card;
      })
    );

    const lesson = await LessonModel.create({
      title: title.trim(),
      description: description?.trim?.() || '',
      user: userId,
      cards: cardIds,
    });

    return new LessonDto(lesson);
  }

  async getAll(userId) {
    const lessons = await LessonModel.find()
      .populate('cards')
      .sort({ createdAt: -1 });

    return lessons.map((l) => new LessonDto(l));
  }

  async getMine(userId) {

    console.log(userId);
    
    const lessons = await LessonModel.find({ user: new mongoose.Types.ObjectId(userId) })
      .sort({ createdAt: -1 });

    return lessons.map((l) => new LessonDto(l));
  }

async getById(id) {
  // Проверяем, валидный ли ObjectId
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw ApiError.BadRequest('Некорректный ID урока');
  }

  // findById сам преобразует строку в ObjectId
  const lesson = await LessonModel.findById(id);

  if (!lesson) {
    throw ApiError.BadRequest('Урок не найден');
  }
  console.log(lesson);
  
  return new LessonDto(lesson);
}

  async update(userId, id, { title, description, cards }) {
    const lesson = await LessonModel.findOne({ _id: id, user: userId });
    if (!lesson) {
      throw ApiError.BadRequest('Урок не найден');
    }

    if (title !== undefined) {
      if (!title.trim()) {
        throw ApiError.BadRequest('Название урока не может быть пустым');
      }
      lesson.title = title.trim();
    }

    if (description !== undefined) {
      lesson.description = description?.trim?.() || '';
    }

    if (cards !== undefined) {
      if (!Array.isArray(cards)) {
        throw ApiError.BadRequest('Поле cards должно быть массивом');
      }

      const cardIds = await Promise.all(
        cards.map(async (card) => {
          if (card && typeof card === 'object' && card.word !== undefined) {
            const { word, translate, lang } = card;

            if (!word?.trim() || !translate?.trim() || !lang?.trim()) {
              throw ApiError.BadRequest(
                'Заполните слово, перевод и язык для всех карточек'
              );
            }

            const createdCard = await CardModel.create({
              word: word.trim(),
              translate: translate.trim(),
              lang: lang.trim(),
              user: userId,
            });

            return createdCard._id;
          }

          if (card && typeof card === 'object' && card._id) {
            return card._id;
          }

          return card;
        })
      );

      lesson.cards = cardIds;
    }

    await lesson.save();

    await lesson.populate('cards');

    return new LessonDto(lesson);
  }

  async delete(userId, id) {
    const lesson = await LessonModel.findOneAndDelete({ _id: id, user: userId });
    if (!lesson) {
      throw ApiError.BadRequest('Урок не найден');
    }
    return { success: true };
  }
}

module.exports = new LessonService();

