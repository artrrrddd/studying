const lessonService = require('../service/lesson-service');
const { validationResult } = require('express-validator');
const ApiError = require('../exceptions/api-error');

class LessonController {
  async create(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return next(
          ApiError.BadRequest('Ошибка при валидации', errors.array())
        );
      }

      const userId = req.user.id;
      const { title, description, cards } = req.body;
      const lesson = await lessonService.create(userId, title, description, cards);
      return res.json(lesson);
    } catch (e) {
      next(e);
    }
  }

  async getAll(req, res, next) {
    try {
      const userId = req.user.id;
      const lessons = await lessonService.getAll(userId);
      return res.json(lessons);
    } catch (e) {
      next(e);
    }
  }

  async getById(req, res, next) {
    try {
      const userId = req.user.id;
      const { id } = req.params;
      const lesson = await lessonService.getById(userId, id);
      return res.json(lesson);
    } catch (e) {
      next(e);
    }
  }

  async update(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return next(
          ApiError.BadRequest('Ошибка при валидации', errors.array())
        );
      }

      const userId = req.user.id;
      const { id } = req.params;
      const { title, description, cards } = req.body;
      const lesson = await lessonService.update(userId, id, {
        title,
        description,
        cards,
      });
      return res.json(lesson);
    } catch (e) {
      next(e);
    }
  }

  async delete(req, res, next) {
    try {
      const userId = req.user.id;
      const { id } = req.params;
      await lessonService.delete(userId, id);
      return res.json({ success: true });
    } catch (e) {
      next(e);
    }
  }
}

module.exports = new LessonController();

