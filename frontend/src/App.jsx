import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Signup from './Pages/Signup'
import Login from './Pages/Login'

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
    </Routes>
  )
}

export default App