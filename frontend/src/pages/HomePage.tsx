import { Container, Paper, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { PartialRentalListing } from "../shared/types";
import api from "../api/api";
import RentalListingBigCard from "../components/RentalListingBigCard";
import { Link } from "react-router";
import LoadingSpinner from "../components/LoadingSpinner";

const HomePage = () => {
    const [rentalListings, setRentalListings] = useState<Array<PartialRentalListing>>([]);
    const [loading, setLoading] = useState(true);
    const initializeRentalListings = async () => {
        await api.get(`/rentalListings`)
            .then((response) => {
                setRentalListings(response.data);
            }).catch((error) => {
                console.error('Error fetching rental listings:', error);
            });
    };
    useEffect(() => {
        initializeRentalListings();
        setLoading(false);
    }, [])


    if (loading) {
        return (
            <LoadingSpinner />
        );
    }
    return (
        <Container sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', mt: 4 }}>
            <Paper sx={{ minHeight: '10vh', minWidth: '50vw', maxWidth: '50vw', justifyContent: 'center', display: 'flex', alignItems: 'center' }}>
                <Typography variant="h4">Welcome to Rentify</Typography>
            </Paper>
            {
                rentalListings.length === 0 ?
                    (<Typography variant="body1" sx={{ mt: 2 }}>
                        No rental listings found.
                    </Typography>
                    ) : (
                        <Container sx={{
                            display: 'grid',
                            gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
                            gap: 2,
                            mt: 2,
                            width: '100%',
                            maxWidth: '50vw',
                        }}>
                            {rentalListings.map((rental) => (
                                <Link key={rental.id} to={`/rentalListings/${rental.id}`} style={{ textDecoration: 'none' }}>
                                    <RentalListingBigCard rental={rental} />
                                </Link>
                            ))}
                        </Container>
                    )
            }
        </Container>
    );
}
export default HomePage;
