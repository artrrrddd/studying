import { createAsyncThunk } from "@reduxjs/toolkit"
import AuthService from "../../services/AuthService"


export const loginThunk = createAsyncThunk(
    'auth/login',
    async ({email, pwd}) => {

        if (!email || !pwd) {
            alert('Введите логин и пароль')
            return
        };
            const response = await AuthService.login(email, pwd);
            localStorage.setItem('token', response.accessToken);
            
            return response;
    }
);

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


