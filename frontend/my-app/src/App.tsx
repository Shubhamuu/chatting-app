import { useState } from 'react'

import './App.css'
import Login from './pages/auth/login.tsx'
import { Navigate, Outlet, Route, Routes } from 'react-router'

function App() {
  return (
     <Routes >
        <Route path="/" element={<Login />} />
     </Routes>
 
  ) 

}

export default App
