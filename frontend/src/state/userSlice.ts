import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { ExtendedUser } from "../shared/types";
import authoredApi from "../api/authoredApi";

export const fetchUser = createAsyncThunk(
    "user/fetchUser",
    async (id: string, { rejectWithValue }) => {
        try {
            const response = await authoredApi.get(`/users/${id}`);
            return response.data;
        } catch (error) {
            return rejectWithValue(error);
        }
    }
);

interface UserState {
    user: ExtendedUser | null;
    loading: boolean;
    error: string | null;
}

const initialState: UserState = {
    user: null,
    loading: false,
    error: null,
};

const userSlice = createSlice({
    name: "user",
    initialState,
    reducers: {
        clearUserInfo: (state) => {
            state.user = null;
            state.loading = false;
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchUser.fulfilled, (state, action) => {
                state.loading = false;
                state.user = action.payload;
            })
            .addCase(fetchUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    },
});

export const { clearUserInfo } = userSlice.actions;
export default userSlice.reducer;
