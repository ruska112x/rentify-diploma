import Navbar from './components/Navbar'
import { Routes } from 'react-router'
import { Route } from 'react-router'
import Login from './pages/Login'
import Register from './pages/Register'
import { useEffect } from 'react'
import { store } from './state/store'
import api from './api/api'
import { logout, setTokens } from './state/authSlice'

interface RefreshResponse {
  accessToken: string;
}

async function initializeAuth() {
  const isTriedRefresh = store.getState().auth.accessToken;
  if (isTriedRefresh) {
    return;
  } else {
    try {
      const { data } = await api.post<RefreshResponse>('/api/auth/refresh');
      store.dispatch(setTokens({ accessToken: data.accessToken }));
    } catch (error) {
      store.dispatch(logout());
    }
  }
}

const App = () => {
  useEffect(() => {
    initializeAuth();
  }, []);

  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<div>Home Page</div>} />
      </Routes>
    </>
  )
}

export default App
