import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authReducer";
import cardReducer from "./cardReducer";
import lessonReducer from "./lessonReducer";

const store = configureStore({
  reducer: {
    auth: authReducer,
    cards: cardReducer,
    lessons: lessonReducer,
  },
});

export default store;


