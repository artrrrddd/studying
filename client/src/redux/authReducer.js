const initialState = {
    isLogged: false,
    isLoading: false,
    shouldRedirect: false,
    myId: '',
    error: null,
    success: null,
};

const authReducer = (state = initialState, action) => {
    switch(action.type) {

        case 'auth/login/pending':
            return {...state, isLoading: true, error: null, success: null};

        case 'auth/login/fulfilled':
            return {...state, isLoading: false, isLogged: true, shouldRedirect: true, myId: action.payload.user.id, success: 'Вы вошли'}

        case 'auth/login/rejected':
            return {...state, isLoading: false, isLogged: false, error: action.payload}

        case 'auth/registration/pending':
            return {...state, isLoading: true, error: null, success: null}

        case 'auth/registration/fulfilled':
            return {...state, isLoading: false, isLogged: true, shouldRedirect: true, myId: action.payload.user.id, success: 'Регистрация успешна'}

        case 'auth/registration/rejected':
            return {...state, isLoading: false, error: action.payload}

        case 'CLEAR_REDIRECT_FLAG':
            return {...state, shouldRedirect: false}

        case 'auth/logout/fulfilled':
            return {...state, isLogged: false, isLoading: false, success: null, error: null}

        case 'auth/logout/pending':
            return {...state, isLoading: true}

        case 'LOGOUT':
            return {...state, isLogged: false, myId: ''};

        case 'auth/check/pending':
            return {...state, isLoading: true, isLogged: false};
        
        case 'auth/check/fulfilled':
            return {...state, isLoading: false, isLogged: true, myId: action.payload.user.id}

        case 'auth/check/rejected':
            return {...state, isLoading: false, isLogged: false}

        default:
            return state;
    }
}

export default authReducer;


