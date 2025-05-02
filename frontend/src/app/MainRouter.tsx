import { Routes } from 'react-router'
import { Route } from 'react-router'
import Login from '../pages/Login'
import Register from '../pages/Register'
import MyProfile from '../pages/MyProfile'
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch, RootState } from '../state/store'
import { useEffect } from 'react'
import { refresh } from '../state/authSlice'
import { Box } from '@mui/material'
import Navbar from '../components/Navbar'
import HomePage from '../pages/HomePage'
import RentalListingPage from '../pages/RentalListingPage'
import UserProfilePage from '../pages/UserProfilePage'
import LoadingSpinner from '../components/LoadingSpinner'

const MainRouter: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { isRefreshing } = useSelector((state: RootState) => state.auth);

    useEffect(() => {
        const initialize = async () => {
            await dispatch(refresh()).unwrap();
        };
        initialize();
    }, [dispatch]);

    if (isRefreshing) {
        return (
            <LoadingSpinner />
        );
    }

    return (
        <Box sx={{ minHeight: '100vh', maxWidth: '70vw', display: 'flex', flexDirection: 'column', margin: '0 auto' }}>
            <Navbar />
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/profile" element={<MyProfile />} />
                <Route path="/" element={<HomePage />} />
                <Route path="/rentalListings/:rentalListingId" element={<RentalListingPage />} />
                <Route path="/users/:userId" element={<UserProfilePage />} />
            </Routes>
        </Box>
    )
}

export default MainRouter
