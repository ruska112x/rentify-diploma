import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import {
    Container,
    Paper,
    Typography,
    Box,
    List,
    ListItem,
    ListItemText,
    Tabs,
    Tab,
} from '@mui/material';
import ProfileCard from '../components/ProfileCard';
import { RootState } from '../state/store';
import RentalListingsCard from '../components/RentalListingsCard';

const MyProfile: React.FC = () => {
    const { userId } = useSelector((state: RootState) => state.auth);

    const [tabValue, setTabValue] = useState(0);
    const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
        setTabValue(newValue);
    };

    return (
        <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
            <Paper elevation={3} sx={{ p: 3 }}>
                <Typography variant="h4" gutterBottom>
                    Account Details
                </Typography>
            </Paper>

            <Paper elevation={3} sx={{ mt: 1, p: 3 }}>
                <Tabs value={tabValue} onChange={handleTabChange} centered>
                    <Tab label="Profile" />
                    <Tab label="Rentail Listngs" />
                    <Tab label="Bookings" />
                    <Tab label="Reviews" />
                </Tabs>

                {tabValue === 0 && (
                    <ProfileCard userId={userId} />
                )}

                {tabValue === 1 && (
                    <RentalListingsCard userId={userId} />
                )}

                {tabValue === 2 && (
                    <Box sx={{ mt: 1 }}>
                        <Typography variant="h5">Bookings</Typography>
                        <List>
                            <ListItem>
                                <ListItemText primary="2.1" secondary="2.2" />
                            </ListItem>
                        </List>
                    </Box>
                )}

                {tabValue === 3 && (
                    <Box sx={{ mt: 1 }}>
                        <Typography variant="h5">Reviews</Typography>
                        <List>
                            <ListItem>
                                <ListItemText primary="3.1" secondary="3.2" />
                            </ListItem>
                        </List>
                    </Box>
                )}
            </Paper>

        </Container>
    );
};

export default MyProfile;