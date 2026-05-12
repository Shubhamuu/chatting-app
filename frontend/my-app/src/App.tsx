import { useState } from 'react'

import './App.css'
import Login from './pages/auth/login.tsx'
import ChatDashboard from './pages/chat/chat.dashboard.tsx'
import { Navigate, Outlet, Route, Routes } from 'react-router'

function App() {
  return (
     <Routes >
        <Route path="/" element={<Login />} />
        <Route path="/chat/general" element={<ChatDashboard />} />
     </Routes>
 
  ) 

}

export default App
