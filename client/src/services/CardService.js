import $api from "../http";

export default class CardService {

    static create({ word, translate, lang }) {
        return $api.post('/cards', { word, translate, lang })
            .then(response => response.data);
    }

    static getAll() {
        return $api.get('/cards')
            .then(response => response.data);
    }

    static getById(id) {
        return $api.get(`/cards/${id}`)
            .then(response => response.data);
    }

    static delete(id) {
        return $api.delete(`/cards/${id}`)
            .then(response => response.data);
    }

    static update(id, { word, translate, lang }) {
        return $api.patch(`/cards/${id}`, { word, translate, lang })
            .then(response => response.data);
    }
}
