import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authReducer";
import cardReducer from "./cardReducer";

const store = configureStore({ reducer: {
  auth: authReducer,
  cards: cardReducer,
}
});

export default store;


