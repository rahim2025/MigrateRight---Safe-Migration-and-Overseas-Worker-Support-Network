import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from '@components/layout/Layout';
import Home from '@pages/Home/Home';
import Login from '@pages/Auth/Login';
import Register from '@pages/Auth/Register';
import ForgotPassword from '@pages/Auth/ForgotPassword';
import ResetPassword from '@pages/Auth/ResetPassword';
import SearchAgencies from '@pages/Agencies/SearchAgencies';
import AgencyDetails from '@pages/Agencies/AgencyDetails';
import UserProfile from '@pages/Profile/UserProfile';
import NotFound from '@pages/NotFound/NotFound';

// Placeholder pages for future features
import SavedAgencies from '@pages/Placeholder/SavedAgencies';
import Documents from '@pages/Placeholder/Documents';
import Help from '@pages/Placeholder/Help';

import ProtectedRoute from './ProtectedRoute';

/**
 * Application Routes Configuration
 * Defines all routes with public and protected access
 */
const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        {/* Public Routes */}
        <Route index element={<Home />} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route path="forgot-password" element={<ForgotPassword />} />
        <Route path="reset-password/:token" element={<ResetPassword />} />
        <Route path="agencies" element={<SearchAgencies />} />
        <Route path="agencies/:id" element={<AgencyDetails />} />

        {/* Protected Routes */}
        <Route
          path="profile"
          element={
            <ProtectedRoute>
              <UserProfile />
            </ProtectedRoute>
          }
        />

        {/* Placeholder Routes - Future Features */}
        <Route
          path="saved"
          element={
            <ProtectedRoute>
              <SavedAgencies />
            </ProtectedRoute>
          }
        />
        <Route
          path="documents"
          element={
            <ProtectedRoute>
              <Documents />
            </ProtectedRoute>
          }
        />
        <Route path="help" element={<Help />} />

        {/* 404 Not Found */}
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;
