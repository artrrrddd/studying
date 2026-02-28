import $api from "../http";

export default class AuthService {
    static login(email, password) {
        return $api.post('/login', {email, password})
        .then(response => response.data);
    }

    static registration(email, password) {
        return $api.post('/registration', {email, password})
        .then(response => response.data)
        
    }

    static logout() {
        return $api.post('/logout')
        .then(response => response.data)
    }

    static check() {
        return $api.get('/refresh')
        .then(response => response.data)
    }

}


