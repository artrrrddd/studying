import { createAsyncThunk } from "@reduxjs/toolkit";
import LessonService from "../../services/LessonService";

export const fetchLessonsThunk = createAsyncThunk(
  "lessons/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      return await LessonService.getAll();
    } catch (e) {
      return rejectWithValue(
        e.response?.data?.message || "Ошибка загрузки уроков"
      );
    }
  }
);

export const fetchLessonByIdThunk = createAsyncThunk(
  "lessons/fetchById",
  async (id, { rejectWithValue }) => {
    try {
      return await LessonService.getById(id);
    } catch (e) {
      return rejectWithValue(
        e.response?.data?.message || "Ошибка загрузки урока"
      );
    }
  }
);

export const createLessonThunk = createAsyncThunk(
  "lessons/create",
  async ({ title, description, cards }, { rejectWithValue }) => {
    try {
      if (!title?.trim()) {
        return rejectWithValue("Введите название урока");
      }
      return await LessonService.create({
        title: title.trim(),
        description: description?.trim?.() || "",
        cards: cards || [],
      });
    } catch (e) {
      return rejectWithValue(
        e.response?.data?.message || "Ошибка создания урока"
      );
    }
  }
);

export const updateLessonThunk = createAsyncThunk(
  "lessons/update",
  async ({ id, title, description, cards }, { rejectWithValue }) => {
    try {
      return await LessonService.update(id, { title, description, cards });
    } catch (e) {
      return rejectWithValue(
        e.response?.data?.message || "Ошибка обновления урока"
      );
    }
  }
);

export const deleteLessonThunk = createAsyncThunk(
  "lessons/delete",
  async (id, { rejectWithValue }) => {
    try {
      await LessonService.delete(id);
      return id;
    } catch (e) {
      return rejectWithValue(
        e.response?.data?.message || "Ошибка удаления урока"
      );
    }
  }
);

export const fetchMyLessonsThunk = createAsyncThunk(
  "lessons/fetchMine",
  async (_, { rejectWithValue }) => {
    try {
      return await LessonService.getMine();
    } catch (e) {
      return rejectWithValue(e.response?.data?.message || "Ошибка загрузки уроков");
    }
  }
);

