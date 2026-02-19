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
import SosPage from './Pages/SosPage'

import ErrorBoundary from './components/ErrorBoundary';
import JourneyPlanner from './Pages/JourneyPlanner';
import Community from './Pages/Community';
import CommunityDetails from './Pages/CommunityDetails';

import AuroraBackground from './components/layout/AuroraBackground';

const App = () => {
  return (
    <AuroraBackground>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/marketplace" element={<MarketPlace />} />
        <Route path="/service/:id" element={<ServiceDetailPage />} />
        <Route path="/scanner" element={<LiveARScanner />} />
        <Route path="/sos" element={
          <ErrorBoundary>
            <SosPage />
          </ErrorBoundary>
        } />
        <Route path="/journey-planner" element={<JourneyPlanner />} />
        <Route path="/community" element={<Community />} />
        <Route path="/community/:id" element={<CommunityDetails />} />
      </Routes>
    </AuroraBackground>
  )
}

export default App