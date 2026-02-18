const cardService = require('../service/card-service');
const { validationResult } = require('express-validator');
const ApiError = require('../exceptions/api-error');

class CardController {
    async create(req, res, next) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return next(ApiError.BadRequest('Ошибка при валидации', errors.array()));
            }
            const { word, translate, lang } = req.body;
            const card = await cardService.create(word, translate, lang);
            return res.json(card);
        } catch (e) {
            next(e);
        }
    }

    async getAll(req, res, next) {
        try {
            const cards = await cardService.getAll();
            return res.json(cards);
        } catch (e) {
            next(e);
        }
    }

    async getById(req, res, next) {
        try {
            const { id } = req.params;
            const card = await cardService.getById(id);
            return res.json(card);
        } catch (e) {
            next(e);
        }
    }

    async update(req, res, next) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return next(ApiError.BadRequest('Ошибка при валидации', errors.array()));
            }
            const { id } = req.params;
            const { word, translate, lang } = req.body;
            const card = await cardService.update(id, { word, translate, lang });
            return res.json(card);
        } catch (e) {
            next(e);
        }
    }

    async delete(req, res, next) {
        try {
            const { id } = req.params;
            await cardService.delete(id);
            return res.json({ success: true });
        } catch (e) {
            next(e);
        }
    }
}

module.exports = new CardController();
