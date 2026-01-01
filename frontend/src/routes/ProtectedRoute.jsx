import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import PropTypes from 'prop-types';
import { useAuth } from '@context/AuthContext';
import authService from '@services/authService';
import api from '@services/api';

/**
 * Protected Route Component
 * Redirects to login if user is not authenticated
 * Includes token refresh mechanism
 */
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    const refreshTokenIfNeeded = async () => {
      const token = authService.getToken();
      const refreshToken = localStorage.getItem('refreshToken');

      if (token && refreshToken && !isAuthenticated && !loading) {
        try {
          setIsRefreshing(true);
          // Try to refresh the token
          const response = await api.post('/auth/refresh-token', { refreshToken });
          if (response?.data?.token) {
            localStorage.setItem('authToken', response.data.token);
            // Reload to trigger checkAuth
            window.location.reload();
          }
        } catch (error) {
          // Refresh failed, clear tokens
          authService.logout();
        } finally {
          setIsRefreshing(false);
        }
      }
    };

    refreshTokenIfNeeded();
  }, [isAuthenticated, loading]);

  if (loading || isRefreshing) {
    return <div className="loading">Loading...</div>;
  }

  if (!isAuthenticated) {
    // Save the attempted location for redirect after login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired,
};

export default ProtectedRoute;
