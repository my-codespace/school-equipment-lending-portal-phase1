import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Unauthorized from './pages/Unauthorized';
import EquipmentList from './pages/EquipmentList';
import AdminDashboard from './pages/AdminDashboard';
import MyRequests from './pages/MyRequests';
import RequestManagement from "./pages/RequestManagement";
import ErrorPage from "./pages/ErrorPage";

function App() {
  return (
      <AuthProvider>
        <Router>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/unauthorized" element={<Unauthorized />} />
            <Route
                path="/equipment"
                element={
                  <ProtectedRoute>
                    <EquipmentList />
                  </ProtectedRoute>
                }
            />
              <Route
                  path="/admin/dashboard"
                  element={
                      <ProtectedRoute allowedRoles={['admin']}>
                          <AdminDashboard />
                      </ProtectedRoute>
                  }
              />

              <Route
                  path="/requests"
                  element={
                      <ProtectedRoute allowedRoles={['admin', 'staff']}>
                          <RequestManagement />
                      </ProtectedRoute>
                  }
              />
              <Route
                  path="/my-requests"
                  element={
                      <ProtectedRoute>
                          <MyRequests />
                      </ProtectedRoute>
                  }
              />

            <Route path="/" element={<Navigate to="/login" replace />} />

            <Route path="*" element={<ErrorPage />} />
          </Routes>
        </Router>
      </AuthProvider>
  );
}

export default App;
