import React, { useState } from "react";
import { TextField, InputAdornment, Button, Box } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router";
import { searchListings } from "../state/searchSlice";
import type { AppDispatch } from "../state/store";

const SearchBar: React.FC = () => {
    const [query, setQuery] = useState("");
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setQuery(value);
    };

    const handleSearchSubmit = () => {
        if (query.trim()) {
            dispatch(searchListings({ query, page: 0 }));
            navigate(`/search?q=${encodeURIComponent(query)}`);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            e.preventDefault();
            handleSearchSubmit();
        }
    };

    return (
        <Box sx={{ display: "flex", gap: 1, minWidth: "40vw", maxWidth: "50vw", alignItems: "center" }}>
            <TextField
                fullWidth
                value={query}
                onChange={handleSearchChange}
                onKeyDown={handleKeyDown}
                placeholder="Поиск по названию, описанию или адресу..."
                slotProps={{
                    input: {
                        inputProps: {
                            "aria-label": "search",
                        },
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon />
                            </InputAdornment>
                        ),
                    },
                }}
            />
            <Button
                variant="contained"
                onClick={handleSearchSubmit}
                aria-label="search-button"
                sx={{ minWidth: "100px" }}
            >
                Поиск
            </Button>
        </Box>
    );
};

export default SearchBar;
