import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RefreshResponse } from '../shared/types';
import api from '../api/api';

interface AuthState {
  accessToken: string | null;
  userId: string;
  isAuthenticated: boolean;
  isRefreshing: boolean;
  refreshError: string | null;
}

const initialState: AuthState = {
  accessToken: null,
  userId: "",
  isAuthenticated: false,
  isRefreshing: false,
  refreshError: null,
};

export const logoutUser = createAsyncThunk(
  'auth/logoutUser',
  async (_, { rejectWithValue }) => {
    try {
      await api.post('http://localhost:8080/api/auth/logout', {}, { withCredentials: true });
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

export const refresh = createAsyncThunk(
  'auth/refresh',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.post('http://localhost:8080/api/auth/refresh', {}, { withCredentials: true });
      const responseData = response.data as RefreshResponse;
      return responseData;
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setTokens: (state, action: PayloadAction<{ accessToken: string; }>) => {
      state.accessToken = action.payload.accessToken;
      state.isAuthenticated = true;
    },
    setUserId: (state, action: PayloadAction<{ userId: string; }>) => {
      state.userId = action.payload.userId;
    },
    logout: (state) => {
      state.accessToken = null;
      state.isAuthenticated = false;
      state.isRefreshing = false;
      state.refreshError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(logoutUser.fulfilled, (state) => {
        state.accessToken = null;
        state.isAuthenticated = false;
      })
      .addCase(refresh.pending, (state) => {
        state.isRefreshing = true;
        state.refreshError = null;
      })
      .addCase(refresh.fulfilled, (state, action) => {
        state.accessToken = action.payload.accessToken;
        state.userId = action.payload.userId;
        state.isAuthenticated = true;
        state.isRefreshing = false;
      })
      .addCase(refresh.rejected, (state, action) => {
        state.isRefreshing = false;
        state.refreshError = action.payload as string;
        state.isAuthenticated = false;
        state.accessToken = null;
      });
  },
});

export const { setTokens, setUserId, logout } = authSlice.actions;
export default authSlice.reducer;
