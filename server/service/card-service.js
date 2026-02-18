const CardModel = require('../models/card-model');
const CardDto = require('../dtos/card-dto');
const ApiError = require('../exceptions/api-error');

class CardService {
    async create(word, translate, lang) {
        if (!word?.trim() || !translate?.trim() || !lang?.trim()) {
            throw ApiError.BadRequest('Заполните слово, перевод и язык');
        }
        const card = await CardModel.create({ word: word.trim(), translate: translate.trim(), lang: lang.trim() });
        return new CardDto(card);
    }

    async getAll() {
        const cards = await CardModel.find().sort({ createdAt: -1 });
        return cards.map((c) => new CardDto(c));
    }

    async getById(id) {
        const card = await CardModel.findById(id);
        if (!card) {
            throw ApiError.BadRequest('Карточка не найдена');
        }
        return new CardDto(card);
    }

    async update(id, { word, translate, lang }) {
        const card = await CardModel.findById(id);
        if (!card) {
            throw ApiError.BadRequest('Карточка не найдена');
        }
        if (word !== undefined) card.word = word.trim();
        if (translate !== undefined) card.translate = translate.trim();
        if (lang !== undefined) card.lang = lang.trim();
        await card.save();
        return new CardDto(card);
    }

    async delete(id) {
        const card = await CardModel.findByIdAndDelete(id);
        if (!card) {
            throw ApiError.BadRequest('Карточка не найдена');
        }
        return { success: true };
    }
}

module.exports = new CardService();
