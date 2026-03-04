const initialState = {
  items: [],
  currentLesson: null,
  isLoading: false,
  error: null,
};

const lessonReducer = (state = initialState, action) => {
  switch (action.type) {
    case "lessons/fetchAll/pending":
    case "lessons/fetchById/pending":
    case "lessons/create/pending":
    case "lessons/update/pending":
    case "lessons/delete/pending":
    case "lessons/fetchMine/pending":
      return { ...state, isLoading: true, error: null };

    case "lessons/fetchAll/fulfilled":
      case "lessons/fetchMine/fulfilled":
      return {
        ...state,
        isLoading: false,
        items: action.payload,
        error: null,
      };

    case "lessons/fetchAll/rejected":
    case "lessons/fetchMine/rejected":
      
      return { ...state, isLoading: false, error: action.payload };

    case "lessons/fetchById/fulfilled":      
      return {
        ...state,
        isLoading: false,
        currentLesson: action.payload,
        error: null,
      };

    case "lessons/fetchById/rejected":
      return {
        ...state,
        isLoading: false,
        currentLesson: null,
        error: action.payload,
      };

    case "lessons/create/fulfilled":
      return {
        ...state,
        isLoading: false,
        items: [action.payload, ...state.items],
        error: null,
      };

    case "lessons/create/rejected":
      return { ...state, isLoading: false, error: action.payload };

    case "lessons/update/fulfilled": {
      const items = state.items.map((l) =>
        l.id === action.payload.id ? action.payload : l
      );
      return {
        ...state,
        isLoading: false,
        items,
        currentLesson:
          state.currentLesson?.id === action.payload.id
            ? action.payload
            : state.currentLesson,
        error: null,
      };
    }

    case "lessons/update/rejected":
      return { ...state, isLoading: false, error: action.payload };

    case "lessons/delete/fulfilled":
      return {
        ...state,
        isLoading: false,
        items: state.items.filter((l) => l.id !== action.payload),
        currentLesson:
          state.currentLesson?.id === action.payload ? null : state.currentLesson,
        error: null,
      };

    case "lessons/delete/rejected":
      return { ...state, isLoading: false, error: action.payload };

    default:
      return state;
  }
};

export default lessonReducer;

