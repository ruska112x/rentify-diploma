import Navbar from './components/Navbar'
import { Routes } from 'react-router'
import { Route } from 'react-router'
import Login from './pages/Login'
import Register from './pages/Register'

const App = () => {
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
