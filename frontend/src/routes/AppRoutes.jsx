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

// Country Guide pages
import CountryGuideList from '@pages/CountryGuides/CountryGuideList';
import CountryGuideDetail from '@pages/CountryGuides/CountryGuideDetail';

// Cost Calculator page
import CostCalculator from '@pages/CostCalculator';

// Worker Dashboard page
import WorkerDashboard from '@pages/WorkerDashboard';

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

        {/* Country Guide Routes */}
        <Route path="countries" element={<CountryGuideList />} />
        <Route path="countries/:countryCode" element={<CountryGuideDetail />} />
        <Route path="country-guides" element={<CountryGuideList />} />
        <Route path="country-guides/:country" element={<CountryGuideDetail />} />

        {/* Cost Calculator Routes */}
        <Route path="calculator" element={<CostCalculator />} />
        <Route path="cost-calculator" element={<CostCalculator />} />

        {/* Protected Routes */}
        <Route
          path="dashboard"
          element={
            <ProtectedRoute>
              <WorkerDashboard />
            </ProtectedRoute>
          }
        />
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
