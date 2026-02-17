import React from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'

import SignIn from './Pages/SignIn'
import ViewUsers from './Pages/ViewUsers'
import Reports from './Pages/Reports'
import Bookings from './Pages/Bookings'
import BookingDetails from './Pages/BookingDetails'
import UserDetails from './Pages/UserDetails'
import GigDetails from './Pages/GigDetails';
import CommunityManagement from './Pages/CommunityManagement';
import { isAuthenticated } from './utils/auth'

const ProtectedRoute = ({ children }) => {
  if (!isAuthenticated()) {
    return <Navigate to="/" replace />;
  }
  return children;
};

const PublicOnlyRoute = ({ children }) => {
  if (isAuthenticated()) {
    return <Navigate to="/users" replace />;
  }
  return children;
};

const App = () => {
  return (
    <Routes>
      <Route path="/" element={
        <PublicOnlyRoute>
          <SignIn />
        </PublicOnlyRoute>
      } />



      <Route path="/users" element={
        <ProtectedRoute>
          <ViewUsers />
        </ProtectedRoute>
      } />

      <Route path="/communities" element={
        <ProtectedRoute>
          <CommunityManagement />
        </ProtectedRoute>
      } />

      <Route path="/reports" element={
        <ProtectedRoute>
          <Reports />
        </ProtectedRoute>
      } />

      <Route path="/bookings" element={
        <ProtectedRoute>
          <Bookings />
        </ProtectedRoute>
      } />

      <Route path="/bookings/:id" element={
        <ProtectedRoute>
          <BookingDetails />
        </ProtectedRoute>
      } />

      <Route path="/gig/:id" element={ // Added new route for /gig/:id
        <ProtectedRoute>
          <GigDetails />
        </ProtectedRoute>
      } />

      <Route path="/users/:id" element={
        <ProtectedRoute>
          <UserDetails />
        </ProtectedRoute>
      } />

      <Route path="/settings" element={
        <ProtectedRoute>
          <div className="p-20 pt-24">Settings Page (Placeholder)</div>
        </ProtectedRoute>
      } />

      <Route path="/logs" element={
        <ProtectedRoute>
          <div className="p-20 pt-24">Logs Page (Placeholder)</div>
        </ProtectedRoute>
      } />

      <Route path="/notifications" element={
        <ProtectedRoute>
          <div className="p-20 pt-24">Notifications Page (Placeholder)</div>
        </ProtectedRoute>
      } />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App