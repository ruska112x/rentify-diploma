import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { PartialRentalListing } from "../shared/types";
import api from "../api/api";

interface SearchState {
    listings: PartialRentalListing[];
    totalPages: number;
    currentPage: number;
    isLoading: boolean;
    error: string | null;
}

const initialState: SearchState = {
    listings: [],
    totalPages: 0,
    currentPage: 0,
    isLoading: false,
    error: null
};

export const searchListings = createAsyncThunk(
    "search/searchListings",
    async ({ query, page }: { query: string; page: number }) => {
        const response = await api.get("/searchRentalListings", {
            params: { q: query, page, size: 10 }
        });
        return response.data;
    }
);

const searchSlice = createSlice({
    name: "search",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(searchListings.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(searchListings.fulfilled, (state, action) => {
                state.isLoading = false;
                state.listings = action.payload.content;
                state.totalPages = action.payload.totalPages;
                state.currentPage = action.payload.number;
            })
            .addCase(searchListings.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.error.message || "Failed to search listings";
            });
    }
});

export default searchSlice.reducer;