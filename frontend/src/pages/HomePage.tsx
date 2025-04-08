import { CircularProgress, Container, List, ListItem, ListItemText, Paper, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { OneRentalListing } from "../shared/types";
import authoredApi from "../api/authoredApi";

const HomePage = () => {
    const [rentalListings, setRentalListings] = useState<Array<OneRentalListing>>([]);
    const [loading, setLoading] = useState(true);
    const initializeRentalListings = async () => {
        await authoredApi.get(`/api/rentalListings`)
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
            <Container sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <Typography variant="h4">Welcome to Rentify</Typography>
                <CircularProgress />
            </Container>
        );
    }
    return (
        <Container sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', mt: 4 }}>
            <Typography variant="h4">Welcome to Rentify</Typography>
            {
                rentalListings.length === 0 ?
                    (<Typography variant="body1" sx={{ mt: 2 }}>
                        No rental listings found.
                    </Typography>
                    ) : (
                        <List>
                            {rentalListings.map((rental, index) => (
                                <Paper key={index} elevation={2} sx={{ mb: 2 }}>
                                    <ListItem>
                                        <ListItemText
                                            primary={rental.title}
                                            secondary={
                                                <>
                                                    <Typography component="span" variant="body2">
                                                        {rental.description}
                                                    </Typography>
                                                    <br />
                                                    <Typography component="span" variant="body2">
                                                        Address: {rental.address}
                                                    </Typography>
                                                    <br />
                                                    <Typography component="span" variant="body2">
                                                        Tariff: {rental.tariffDescription}
                                                    </Typography>
                                                    <br />
                                                </>
                                            }
                                        />
                                    </ListItem>
                                </Paper>
                            ))}
                        </List>
                    )
            }
        </Container>
    );
}
export default HomePage;
