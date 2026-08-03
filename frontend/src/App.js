import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthContext, AuthProvider } from './context/AuthContext';

import Welcome from './pages/welcome';
import Login from './pages/login';
import Register from './pages/register';
import ForgotPassword from './pages/forgotpassword';
import Home from './pages/home';
import ViewTrips from './pages/viewtrips';
import CreateTrip from './pages/createtrip';
import TripDetail from './pages/tripdetail';
import DestinationDetail from './pages/destinationdetail';
import TripSummary from './pages/tripsummary';
import Dashboard from './pages/dashboard';
import Admin from './pages/admin';

import './App.css';

const ProtectedRoute = ({ children }) => {
  const { token } = useContext(AuthContext);
  return token ? children : <Navigate to="/login" />;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Welcome />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />

      <Route
        path="/home"
        element={
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        }
      />

      <Route
        path="/view-trips"
        element={
          <ProtectedRoute>
            <ViewTrips />
          </ProtectedRoute>
        }
      />

      <Route
        path="/create-trip"
        element={
          <ProtectedRoute>
            <CreateTrip />
          </ProtectedRoute>
        }
      />

      <Route
        path="/trip/:tripId"
        element={
          <ProtectedRoute>
            <TripDetail />
          </ProtectedRoute>
        }
      />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <Admin />
          </ProtectedRoute>
        }
      />

      <Route
        path="/destination/:destinationId"
        element={
          <ProtectedRoute>
            <DestinationDetail />
          </ProtectedRoute>
        }
      />
      <Route
        path="/trip/:tripId/summary"
        element={
          <ProtectedRoute>
            <TripSummary />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}

export default App;