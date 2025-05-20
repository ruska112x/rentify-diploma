import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Box, Card, CardContent, Typography, Pagination, Grid2 } from "@mui/material";
import { Link, useSearchParams } from "react-router";
import SearchBar from "../components/SearchBar";
import { RootState, AppDispatch } from "../state/store";
import { searchListings } from "../state/searchSlice";

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
                    <Grid2 container spacing={2} sx={{ mt: 2 }}>
                        {listings.map((listing) => (
                            <Grid2 size={{ xs: 12, sm: 6, md: 4 }} key={listing.id}>
                                <Card>
                                    <CardContent>
                                        <img
                                            src={listing.mainImageData.link}
                                            alt={listing.title}
                                            style={{ width: "100%", height: 200, objectFit: "cover" }}
                                        />
                                        <Link key={listing.id} to={`/rentalListings/${listing.id}`} style={{ textDecoration: "none" }}>
                                            <Typography variant="h6">{listing.title}</Typography>
                                        </Link>
                                        <Typography color="text.secondary">{listing.address}</Typography>
                                        <Typography variant="body2">{listing.description}</Typography>
                                    </CardContent>
                                </Card>
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
