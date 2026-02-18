module.exports = class CardDto {
    id;
    word;
    translate;
    lang;

    constructor(model) {
        this.id = model._id?.toString?.() ?? model._id;
        this.word = model.word;
        this.translate = model.translate;
        this.lang = model.lang;
    }
}