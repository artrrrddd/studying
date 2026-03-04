const CardDto = require('./card-dto');

module.exports = class LessonDto {
  id;
  title;
  description;
  userId;
  cards;

  constructor(model) {
    this.id = model._id?.toString?.() ?? model._id;
    this.title = model.title;
    this.description = model.description;
    this.userId =
      model.user?._id?.toString?.() ??
      model.user?.toString?.() ??
      model.user;

    if (Array.isArray(model.cards)) {
      this.cards = model.cards.map((card) => {
        if (!card) return null;
        if (card.word !== undefined) {
          return new CardDto(card);
        }
        return card._id?.toString?.() ?? card.toString?.() ?? card;
      });
    } else {
      this.cards = [];
    }
  }
};

