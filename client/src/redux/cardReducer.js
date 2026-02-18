const initialState = {
    items: [],
    currentCard: null,
    isLoading: false,
    error: null,
};

const cardReducer = (state = initialState, action) => {
    switch (action.type) {
        case "cards/fetchAll/pending":
        case "cards/fetchById/pending":
        case "cards/create/pending":
        case "cards/update/pending":
        case "cards/delete/pending":
            return { ...state, isLoading: true, error: null };

        case "cards/fetchAll/fulfilled":
            return { ...state, isLoading: false, items: action.payload, error: null };

        case "cards/fetchAll/rejected":
            return { ...state, isLoading: false, error: action.payload };

        case "cards/fetchById/fulfilled":
            return { ...state, isLoading: false, currentCard: action.payload, error: null };

        case "cards/fetchById/rejected":
            return { ...state, isLoading: false, currentCard: null, error: action.payload };

        case "cards/create/fulfilled":
            return { ...state, isLoading: false, items: [action.payload, ...state.items], error: null };

        case "cards/create/rejected":
            return { ...state, isLoading: false, error: action.payload };

        case "cards/update/fulfilled": {
            const items = state.items.map((c) => (c.id === action.payload.id ? action.payload : c));
            return {
                ...state,
                isLoading: false,
                items,
                currentCard: state.currentCard?.id === action.payload.id ? action.payload : state.currentCard,
                error: null,
            };
        }

        case "cards/update/rejected":
            return { ...state, isLoading: false, error: action.payload };

        case "cards/delete/fulfilled":
            return {
                ...state,
                isLoading: false,
                items: state.items.filter((c) => c.id !== action.payload),
                currentCard: state.currentCard?.id === action.payload ? null : state.currentCard,
                error: null,
            };

        case "cards/delete/rejected":
            return { ...state, isLoading: false, error: action.payload };

        default:
            return state;
    }
};

export default cardReducer;
