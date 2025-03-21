import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import useReducer from './userSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    user: useReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
