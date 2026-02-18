const { Schema, model } = require('mongoose');

// У каждого документа есть уникальный _id (ObjectId), по нему ищем/обновляем/удаляем карточки
const CardSchema = new Schema({
    word: { type: String, required: true },
    translate: { type: String, required: true },
    lang: { type: String, required: true },
}, { timestamps: true })

module.exports = model('Card', CardSchema)