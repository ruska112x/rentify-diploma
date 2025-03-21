import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';

interface AuthState {
  accessToken: string | null;
  userEmail: string;
  isAuthenticated: boolean;
  hasTriedInitialRefresh: boolean;
}

const initialState: AuthState = {
  accessToken: null,
  userEmail: "",
  isAuthenticated: false,
  hasTriedInitialRefresh: false,
};

export const logoutUser = createAsyncThunk(
  'auth/logoutUser',
  async (_, { rejectWithValue }) => {
    try {
      await axios.post('http://localhost:8080/api/auth/logout', {}, { withCredentials: true });
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

export const refresh = createAsyncThunk(
  'auth/refresh',
  async (_, { rejectWithValue }) => {
    try {
      await axios.post('http://localhost:8080/api/auth/refresh', {}, { withCredentials: true });
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
      state.hasTriedInitialRefresh = true;
    },
    setUserMail: (state, action: PayloadAction<{ userEmail: string; }>) => {
      state.userEmail = action.payload.userEmail;
    },
    logout: (state) => {
      state.accessToken = null;
      state.isAuthenticated = false;
    },
    setHasTriedRefresh: (state) => {
      state.hasTriedInitialRefresh = true;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(logoutUser.fulfilled, (state) => {
      state.accessToken = null;
      state.isAuthenticated = false;
    });
    builder.addCase(refresh.fulfilled, (state) => {
      state.isAuthenticated = true;
    }
    );
  },
});

export const { setTokens, setUserMail, logout, setHasTriedRefresh } = authSlice.actions;
export default authSlice.reducer;