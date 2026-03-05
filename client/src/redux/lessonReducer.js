const initialState = {
  items: [],
  myItems: [],
  currentLesson: null,

  fetchAllIsLoading: false,
  fetchByIdIsLoading: false,
  createIsLoading: false,
  updateIsLoading: false,
  deleteIsLoading: false,
  fetchMineIsLoading: false,

  fetchAllSuccess: false,
  fetchByIdSuccess: false,
  createSuccess: false,
  updateSuccess: false,
  deleteSuccess: false,
  fetchMineSuccess: false,

  fetchAllRejected: false,
  fetchByIdRejected: false,
  createRejected: false,
  updateRejected: false,
  deleteRejected: false,
  fetchMineRejected: false,

  error: null,
};

const lessonReducer = (state = initialState, action) => {
  switch (action.type) {
    case "lessons/fetchAll/pending":
      return { ...state, fetchAllIsLoading: true, error: null };
    case "lessons/fetchById/pending":
      return { ...state, fetchByIdIsLoading: true, error: null };
    case "lessons/create/pending":
      return { ...state, createIsLoading: true, error: null };
    case "lessons/update/pending":
      return { ...state, updateIsLoading: true, error: null };
    case "lessons/delete/pending":
      return { ...state, deleteIsLoading: true, error: null };
    case "lessons/fetchMine/pending":
      return { ...state, fetchMineIsLoading: true, error: null };

    case "lessons/fetchAll/fulfilled":
      return {
        ...state,
        fetchAllSuccess: true,
        fetchAllIsLoading: false,
        items: action.payload,
        error: null,
      };

    case "lessons/fetchMine/fulfilled":
      
      return {
        ...state,
        fetchMineSuccess: true,
        fetchMineIsLoading: false,
        myItems: action.payload,
        error: null,
      };

    case "lessons/fetchAll/rejected":
      return { ...state, fetchAllRejected: true, fetchAllIsLoading: false, error: action.payload };

    case "lessons/fetchMine/rejected":
      return { ...state, fetchMineRejected: true, fetchMineIsLoading: false, error: action.payload };

    case "lessons/fetchById/fulfilled":      
      return {
        ...state,
        fetchByIdSuccess: true,
        fetchByIdIsLoading: false,
        currentLesson: action.payload,
        error: null,
      };

    case "lessons/fetchById/rejected":
      return {
        ...state,
        fetchByIdRejected: true,
        fetchByIdIsLoading: false,
        currentLesson: null,
        error: action.payload,
      };

    case "lessons/create/fulfilled":
      return {
        ...state,
        createSuccess: true,
        createIsLoading: false,
        items: [action.payload, ...state.items],
        error: null,
      };

    case "lessons/create/rejected":
      return { ...state, createRejected: true, createIsLoading: false, error: action.payload };

    case "lessons/update/fulfilled": {
      const items = state.items.map((l) =>
        l.id === action.payload.id ? action.payload : l
      );
      return {
        ...state,
        updateSuccess: true,
        updateIsLoading: false,
        items,
        currentLesson:
          state.currentLesson?.id === action.payload.id
            ? action.payload
            : state.currentLesson,
        error: null,
      };
    }

    case "lessons/update/rejected":
      return { ...state, updateRejected: true, updateIsLoading: false, error: action.payload };

    case "lessons/delete/fulfilled":
      return {
        ...state,
        deleteSuccess: true,
        deleteIsLoading: false,
        items: state.items.filter((l) => l.id !== action.payload),
        currentLesson:
          state.currentLesson?.id === action.payload ? null : state.currentLesson,
        error: null,
      };

    case "lessons/delete/rejected":
      return { ...state, deleteRejected: true, deleteIsLoading: false, error: action.payload };

    case "lessons/resetFlags":
  return {
    ...state,
    fetchAllIsLoading: false,
    fetchByIdIsLoading: false,
    createIsLoading: false,
    updateIsLoading: false,
    deleteIsLoading: false,
    fetchMineIsLoading: false,
    
    fetchAllSuccess: false,
    fetchByIdSuccess: false,
    createSuccess: false,
    updateSuccess: false,
    deleteSuccess: false,
    fetchMineSuccess: false,
    
    fetchAllRejected: false,
    fetchByIdRejected: false,
    createRejected: false,
    updateRejected: false,
    deleteRejected: false,
    fetchMineRejected: false,
    
    error: null,
  };
  
    default:
      return state;
  }
};

export default lessonReducer;