import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Box, Typography, Pagination, Grid2 } from "@mui/material";
import { Link, useSearchParams } from "react-router";
import SearchBar from "../components/SearchBar";
import { RootState, AppDispatch } from "../state/store";
import { searchListings } from "../state/searchSlice";
import RentalListingBigCard from "../components/RentalListingBigCard";

const SearchPage: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { listings, totalPages, currentPage, isLoading, error } = useSelector((state: RootState) => state.search);
    const [searchParams, setSearchParams] = useSearchParams();
    const query = searchParams.get("q") || "";
    const pageParam = searchParams.get("page") || "0";

    useEffect(() => {
        dispatch(searchListings({ query, page: parseInt(pageParam, 10) || 0 }));
    }, [query, pageParam, dispatch]);

    const handlePageChange = (_: React.ChangeEvent<unknown>, page: number) => {
        dispatch(searchListings({ query, page: page - 1 }));
        setSearchParams({ q: query, page: (page - 1).toString() });
    };

    return (
        <Box sx={{ p: { xs: 1, sm: 2, md: 3 } }}>
            <SearchBar />
            {isLoading ? (
                <Typography>Загрузка...</Typography>
            ) : error ? (
                <Typography color="error" sx={{ mt: 2 }}>
                    Ошибка: {error}
                </Typography>
            ) : (
                <>
                    <Grid2 container rowSpacing={1} columnSpacing={{ xs: 1, sm: 2, md: 1 }} sx={{ mt: 2 }}>
                        {listings.map((listing) => (
                            <Grid2 size={{ xs: 16, sm: 12, md: 8 }} sx={{ m: 2}} key={listing.id}>
                                <Link key={listing.id} to={`/rentalListings/${listing.id}`} style={{ textDecoration: "none" }}>
                                    <RentalListingBigCard rental={listing} />
                                </Link>
                            </Grid2>
                        ))}
                    </Grid2>
                    {totalPages > 1 && (
                        <Box sx={{ mt: 3, display: "flex", justifyContent: "center" }}>
                            <Pagination
                                count={totalPages}
                                page={currentPage + 1}
                                onChange={handlePageChange}
                            />
                        </Box>
                    )}
                </>
            )}
        </Box>
    );
};

export default SearchPage;
