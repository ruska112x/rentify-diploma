import Navbar from './components/Navbar'
import { Routes } from 'react-router'
import { Route } from 'react-router'
import Login from './pages/Login'
import Register from './pages/Register'
import { useEffect } from 'react'
import { AppDispatch } from './state/store'
import { refresh } from './state/authSlice'
import { useDispatch } from 'react-redux'

const App = () => {
  const dispatch = useDispatch<AppDispatch>();
  useEffect(() => {
    dispatch(refresh());
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
