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
import AgenciesList from '@pages/Agencies/AgenciesList';
import AgencyProfile from '@pages/Agencies/AgencyProfile';
import UserProfile from '@pages/Profile/UserProfile';
import NotFound from '@pages/NotFound/NotFound';

// Country Guide pages
import CountryGuideList from '@pages/CountryGuides/CountryGuideList';
import CountryGuideDetail from '@pages/CountryGuides/CountryGuideDetail';

// Cost Calculator page
import CostCalculator from '@pages/CostCalculator';

// Worker Dashboard page
import WorkerDashboard from '@pages/WorkerDashboard';

// Emergency SOS page
import EmergencySOS from '@pages/EmergencySOS/EmergencySOS';

// Agency Dashboard page
import AgencyDashboard from '@pages/AgencyDashboard/AgencyDashboard';

// New Features: Records & Salary
import MyRecords from '@pages/Records/MyRecords';
import SalaryTracker from '@pages/Records/SalaryTracker';

// Placeholder pages for future features
import SavedAgencies from '@pages/Placeholder/SavedAgencies';
import Help from '@pages/Placeholder/Help';

// Admin Pages
import AdminDashboard from '@pages/Admin/Dashboard/AdminDashboard';
import AdminCountryGuideList from '@pages/Admin/CountryGuides/CountryGuideList';
import CountryGuideForm from '@pages/Admin/CountryGuides/CountryGuideForm';
import AdminUserList from '@pages/Admin/Users/AdminUserList';
import AdminAgencyList from '@pages/Admin/Agencies/AdminAgencyList';
import AdminComplaintList from '@pages/Admin/Complaints/AdminComplaintList';
import AdminEmergencyAlerts from '@pages/Admin/EmergencyAlerts/AdminEmergencyAlerts';

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

        {/* Agencies Browse Routes (Public) */}
        <Route path="browse-agencies" element={<AgenciesList />} />
        <Route path="agency-profile/:id" element={<AgencyProfile />} />

        {/* Protected Routes */}
        <Route
          path="dashboard"
          element={
            <ProtectedRoute>
              <WorkerDashboard />
            </ProtectedRoute>
          }
        />

        {/* Agency Dashboard Route (Protected - Agency Only) */}
        <Route
          path="agency-dashboard"
          element={
            <ProtectedRoute>
              <AgencyDashboard />
            </ProtectedRoute>
          }
        />

        {/* Emergency SOS Route (Protected - All users) */}
        <Route
          path="emergency-sos"
          element={
            <ProtectedRoute>
              <EmergencySOS />
            </ProtectedRoute>
          }
        />

        {/* Admin Country Guide Routes */}
        <Route
          path="admin/dashboard"
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="admin/country-guides"
          element={
            <ProtectedRoute>
              <AdminCountryGuideList />
            </ProtectedRoute>
          }
        />
        <Route
          path="admin/country-guides/new"
          element={
            <ProtectedRoute>
              <CountryGuideForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="admin/country-guides/edit/:id"
          element={
            <ProtectedRoute>
              <CountryGuideForm />
            </ProtectedRoute>
          }
        />

        <Route
          path="admin/users"
          element={
            <ProtectedRoute>
              <AdminUserList />
            </ProtectedRoute>
          }
        />
        <Route
          path="admin/agencies"
          element={
            <ProtectedRoute>
              <AdminAgencyList />
            </ProtectedRoute>
          }
        />
        <Route
          path="admin/complaints"
          element={
            <ProtectedRoute>
              <AdminComplaintList />
            </ProtectedRoute>
          }
        />
        <Route
          path="admin/emergencies"
          element={
            <ProtectedRoute>
              <AdminEmergencyAlerts />
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
          path="records"
          element={
            <ProtectedRoute>
              <MyRecords />
            </ProtectedRoute>
          }
        />
        <Route
          path="salary-tracker"
          element={
            <ProtectedRoute>
              <SalaryTracker />
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
