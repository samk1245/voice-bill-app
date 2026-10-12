import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider, useSelector } from 'react-redux';
import { store } from './store/index.js';

// Auth Views
import Login from './pages/Auth/Login.jsx';

// Dashboards
import VendorDashboard from './pages/Dashboards/VendorDashboard.jsx';

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useSelector(state => state.auth);
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

function RootRedirect() {
  const { isAuthenticated } = useSelector(state => state.auth);
  return isAuthenticated ? <Navigate to="/vendor/dashboard" replace /> : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <Provider store={store}>
      <Router>
        <Routes>
          {/* Main Routing */}
          <Route path="/" element={<RootRedirect />} />
          <Route path="/login" element={<Login />} />
          
          <Route 
            path="/vendor/dashboard" 
            element={
              <ProtectedRoute>
                <VendorDashboard />
              </ProtectedRoute>
            } 
          />

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </Provider>
  );
}
