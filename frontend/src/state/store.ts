import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";
import userReducer from "./userSlice";
import searchReducer from "./searchSlice";
import { configureAuthInterceptors } from "../api/authoredApi";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    user: userReducer,
    search: searchReducer,
  },
});

configureAuthInterceptors(store.dispatch, () => store.getState());

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
