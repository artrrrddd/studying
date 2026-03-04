import $api from "../http";

export default class LessonService {
  static create({ title, description, cards }) {
    return $api
      .post("/lessons", { title, description, cards })
      .then((response) => response.data);
  }

  static getAll() {
    return $api.get("/lessons").then((response) => response.data);
  }

  static getById(id) {
    return $api.get(`/lessons/${id}`).then((response) => response.data);
  }

  static update(id, { title, description, cards }) {
    return $api
      .patch(`/lessons/${id}`, { title, description, cards })
      .then((response) => response.data);
  }

  static delete(id) {
    return $api.delete(`/lessons/${id}`).then((response) => response.data);
  }

  static getMine() {
    return $api.get("/my/lessons").then((response) => response.data);
  }
}