import { createAsyncThunk } from "@reduxjs/toolkit";
import CardService from "../../services/CardService";

export const fetchCardsThunk = createAsyncThunk(
    "cards/fetchAll",
    async (_, { rejectWithValue }) => {
        try {
            return await CardService.getAll();
        } catch (e) {
            return rejectWithValue(e.response?.data?.message || "Ошибка загрузки карточек");
        }
    }
);

export const fetchCardByIdThunk = createAsyncThunk(
    "cards/fetchById",
    async (id, { rejectWithValue }) => {
        try {
            return await CardService.getById(id);
        } catch (e) {
            return rejectWithValue(e.response?.data?.message || "Ошибка загрузки карточки");
        }
    }
);

export const createCardThunk = createAsyncThunk(
    "cards/create",
    async ({ word, translate, lang }, { rejectWithValue }) => {
        try {
            if (!word?.trim() || !translate?.trim() || !lang?.trim()) {
                return rejectWithValue("Заполните все поля");
            }
            return await CardService.create({ word: word.trim(), translate: translate.trim(), lang: lang.trim() });
        } catch (e) {
            return rejectWithValue(e.response?.data?.message || "Ошибка создания карточки");
        }
    }
);

export const deleteCardThunk = createAsyncThunk(
    "cards/delete",
    async (id, { rejectWithValue }) => {
        try {
            await CardService.delete(id);
            return id;
        } catch (e) {
            return rejectWithValue(e.response?.data?.message || "Ошибка удаления карточки");
        }
    }
);

export const updateCardThunk = createAsyncThunk(
    "cards/update",
    async ({ id, word, translate, lang }, { rejectWithValue }) => {
        try {
            return await CardService.update(id, { word, translate, lang });
        } catch (e) {
            return rejectWithValue(e.response?.data?.message || "Ошибка обновления карточки");
        }
    }
);
