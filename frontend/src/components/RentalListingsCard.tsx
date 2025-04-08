import { useEffect, useState } from "react";
import authoredApi from "../api/authoredApi";
import { OneRentalListing } from "../shared/types";
import {
    Paper,
    Typography,
    Box,
    List,
    ListItem,
    ListItemText,
    Container,
    CircularProgress
} from '@mui/material';

const RentalListingsCard: React.FC<{ userId: string }> = ({ userId }) => {
    const [rentalListings, setRentalListings] = useState<Array<OneRentalListing>>([]);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        const initializeRentalListings = async () => {
            await authoredApi.get(`/api/user/${userId}/rentalListings`)
                .then((response) => {
                    setRentalListings(response.data);
                }).catch((error) => {
                    console.error('Error fetching rental listings:', error);
                });
        };
        initializeRentalListings();
        setLoading(false);
    }, [])
    if (loading) {
        return (
            <Container sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <CircularProgress />
            </Container>
        );
    }
    return (
        <Box sx={{ mt: 1 }}>
            <Typography variant="h5">Rentail Listngs</Typography>
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
                                                    <Typography component="span" variant="body2">
                                                        Auto Renew: {rental.autoRenew ? 'Yes' : 'No'}
                                                    </Typography>
                                                </>
                                            }
                                        />
                                    </ListItem>
                                </Paper>
                            ))}
                        </List>
                    )
            }
        </Box>
    );
}
export default RentalListingsCard;