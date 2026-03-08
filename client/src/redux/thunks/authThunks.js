import { createAsyncThunk } from "@reduxjs/toolkit"
import AuthService from "../../services/AuthService"


export const loginThunk = createAsyncThunk(
    'auth/login',
    async ({email, pwd}, { rejectWithValue }) => {
        if (!email || !pwd) {
            return rejectWithValue('Введите логин и пароль')
        }
        try {
            const response = await AuthService.login(email, pwd)
            localStorage.setItem('token', response.accessToken)
            return response
        } catch (e) {
            return rejectWithValue(e.response?.data?.message || 'Ошибка входа')
        }
    }
)

export const logoutThunk = createAsyncThunk(
    'auth/logout',
    async() => {
        const response = await AuthService.logout();
        localStorage.removeItem('token')

        return response
    }
)

export const checkThunk = createAsyncThunk (
    'auth/check',
    async () => {
        const response = await AuthService.check();
        localStorage.setItem('token', response.accessToken);
        
        return response;
    }
)

export const registrationThunk = createAsyncThunk(
    'auth/registration',
    async ({email, pwd}, { rejectWithValue }) => {
        try {
            await AuthService.registration(email, pwd)
            const response = await AuthService.login(email, pwd)
            localStorage.setItem('token', response.accessToken)
            return response
        } catch (e) {
            return rejectWithValue(e.response?.data?.message || 'Ошибка регистрации')
        }
    }
)