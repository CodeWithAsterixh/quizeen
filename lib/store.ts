import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./features/authSlice";
import quizReducer from "./features/quizSlice";
import settingsReducer from "./features/settingsSlice";

// Configure Redux Store
export const store = configureStore({
  reducer: {
    auth: authReducer,
    quiz: quizReducer,
    settings: settingsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

// Types for Redux
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
