import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import {
    Container,
    Paper,
    Typography,
    Tabs,
    Tab,
} from "@mui/material";
import ProfileCard from "../components/ProfileCard";
import { RootState } from "../state/store";
import RentalListingsCard from "../components/RentalListingsCard";
import { Navigate } from "react-router";
import LoadingSpinner from "../components/LoadingSpinner";
import { parseJwtPayload } from "../shared/jwtDecode";
import BookingsCard from "../components/UserBookingsCard";

const MyProfile: React.FC = () => {
    const { accessToken, isRefreshing } = useSelector((state: RootState) => state.auth);
    const [loading, setLoading] = useState(true);

    const [tabValue, setTabValue] = useState(0);
    const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
        setTabValue(newValue);
    };

    let userId = "";

    useEffect(() => {
        if (isRefreshing) {
            setLoading(true);
        } else {
            setLoading(false);
        }
    }, [isRefreshing])

    if (loading) {
        return (
            <LoadingSpinner />
        );
    }

    if (!accessToken) {
        return (
            <Navigate to="/login" replace={true} />
        );
    } else {
        userId = parseJwtPayload(accessToken).sub
    }

    return (
        <Container sx={{ maxWidth: "40vw", mt: 4, mb: 4 }}>
            <Paper elevation={3} sx={{ p: 3 }}>
                <Typography variant="h4" gutterBottom>
                    Личный кабинет
                </Typography>
            </Paper>

            <Paper elevation={3} sx={{ mt: 1, p: 3 }}>
                <Tabs value={tabValue} onChange={handleTabChange} centered>
                    <Tab label="Данные профиля" />
                    <Tab label="Ваши объявления" />
                    <Tab label="Ваши аренды" />
                    <Tab label="Отзывы" />
                </Tabs>

                {tabValue === 0 && (
                    <ProfileCard userId={userId} />
                )}

                {tabValue === 1 && (
                    <RentalListingsCard userId={userId} />
                )}

                {tabValue === 2 && (
                    <BookingsCard userId={userId} />
                )}
            </Paper>

        </Container>
    );
};

export default MyProfile;