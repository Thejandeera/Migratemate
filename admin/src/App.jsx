import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Dashboard from './Pages/Dashboard'
import SignIn from './Pages/SignIn'
import ViewUsers from './Pages/ViewUsers'

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/login" element={<SignIn />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/users" element={<ViewUsers />} />
      <Route path="/reports" element={<div className="p-20">Reports Page (Placeholder)</div>} />
      <Route path="/settings" element={<div className="p-20">Settings Page (Placeholder)</div>} />
      <Route path="/logs" element={<div className="p-20">Logs Page (Placeholder)</div>} />
      <Route path="/notifications" element={<div className="p-20">Notifications Page (Placeholder)</div>} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}

export default App