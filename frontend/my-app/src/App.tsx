import { Navigate, Route, Routes } from 'react-router-dom';
import { Toaster } from 'sonner';

import Login from './pages/auth/login';
import Register from './pages/auth/register';
import MessagingDashboard from './pages/MessagingDashboard';
import MessagingDashboards from './pages/chat/chat.dashboard';
// import './App.css';

const ProtectedRoute = () => {
  const user = localStorage.getItem('user');

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <MessagingDashboards />;
};

function App() {
  return (
    <>
      <Toaster richColors position="top-right" />
      <Routes>
        {/* Redirect root */}
        <Route path="/" element={<Navigate to="/chat/general" replace />} />

        {/* Auth */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Chat */}
        <Route path="/chat/general" element={<ProtectedRoute />} />

        {/* 404 */}
        <Route path="*" element={<Navigate to="/chat/general" replace />} />
      </Routes>
    </>
  );
}

export default App;