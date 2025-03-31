import { Routes } from 'react-router'
import { Route } from 'react-router'
import Login from '../pages/Login'
import Register from '../pages/Register'
import MyProfile from '../pages/MyProfile'
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch, RootState } from '../state/store'
import { useEffect } from 'react'
import { refresh } from '../state/authSlice'
import { Box, CircularProgress, Container, Typography } from '@mui/material'
import Navbar from '../components/Navbar'

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
            <Container sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <CircularProgress />
            </Container>
        );
    }

    return (
        <Box sx={{ minHeight: '100vh' }}>
            <Navbar />
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/profile" element={<MyProfile />} />
                <Route path="/" element={
                    <Container sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                        <Typography variant="h4">Welcome to Rentify</Typography>
                    </Container>
                } />
            </Routes>
        </Box>
    )
}

export default MainRouter
