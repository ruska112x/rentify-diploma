import Navbar from './components/Navbar'
import { Routes } from 'react-router'
import { Route } from 'react-router'
import Login from './pages/Login'
import Register from './pages/Register'
import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { AppDispatch } from './state/store'
import { initializeAuth } from './api/api'

const App = () => {
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    dispatch(initializeAuth());
  }, [dispatch]);

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
