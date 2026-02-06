import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Signup from './Pages/Signup'
import Login from './Pages/Login'
import LandingPage from './Pages/LandingPage'
import Dashboard from './Pages/Dashboard'
import Profile from './Pages/Profile'
import MarketPlace from './Pages/MarketPlace'
import ServiceDetailPage from './Pages/ServiceDetailPage'
import LiveARScanner from './components/Scanner/LiveARScanner'

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/marketplace" element={<MarketPlace />} />
      <Route path="/service/:id" element={<ServiceDetailPage />} />
      <Route path="/scanner" element={<LiveARScanner />} />
    </Routes>
  )
}

export default App