import api from './api';

/**
 * Authentication Service
 * Handles all authentication-related API calls
 */
const authService = {
  /**
   * Register a new user
   */
  register: async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);
      // API interceptor returns response.data, so response is already the data object
      // Backend returns: { success: true, message: '...', data: { user, token, refreshToken } }
      if (response?.data?.token) {
        localStorage.setItem('authToken', response.data.token);
        if (response.data.refreshToken) {
          localStorage.setItem('refreshToken', response.data.refreshToken);
        }
      }
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Register a new agency
   */
  registerAgency: async (agencyData) => {
    try {
      const response = await api.post('/auth/register-agency', agencyData);
      if (response?.data?.token) {
        localStorage.setItem('authToken', response.data.token);
        if (response.data.refreshToken) {
          localStorage.setItem('refreshToken', response.data.refreshToken);
        }
      }
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Login user
   */
  login: async (credentials) => {
    try {
      const response = await api.post('/auth/login', credentials);
      // API interceptor returns response.data, so response is already the data object
      // Backend returns: { success: true, message: '...', data: { user, token, refreshToken } }
      if (response?.data?.token) {
        localStorage.setItem('authToken', response.data.token);
        if (response.data.refreshToken) {
          localStorage.setItem('refreshToken', response.data.refreshToken);
        }
      }
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Logout user
   */
  logout: () => {
    localStorage.removeItem('authToken');
    window.location.href = '/login';
  },

  /**
   * Get current authenticated user
   */
  getCurrentUser: async () => {
    try {
      const response = await api.get('/auth/me');
      return response.data.user;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated: () => {
    return !!localStorage.getItem('authToken');
  },

  /**
   * Get stored auth token
   */
  getToken: () => {
    return localStorage.getItem('authToken');
  },

  /**
   * Forgot password
   */
  forgotPassword: async (email) => {
    try {
      const response = await api.post('/auth/forgot-password', { email });
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Reset password
   */
  resetPassword: async (token, password) => {
    try {
      const response = await api.post(`/auth/reset-password/${token}`, {
        password,
        confirmPassword: password,
      });
      return response;
    } catch (error) {
      throw error;
    }
  },
};

export default authService;
