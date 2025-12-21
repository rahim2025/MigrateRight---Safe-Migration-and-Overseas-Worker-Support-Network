import api from './api';

/**
 * User Service
 * Handles all user-related API calls
 */
const userService = {
  /**
   * Get current user profile
   */
  getProfile: async () => {
    try {
      const response = await api.get('/users/me');
      return response.data.user;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Update user profile
   */
  updateProfile: async (profileData) => {
    try {
      const response = await api.patch('/users/me', profileData);
      return response.data.user;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Change password
   */
  changePassword: async (passwordData) => {
    try {
      const response = await api.patch('/users/me/password', passwordData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Upload profile picture
   */
  uploadProfilePicture: async (file) => {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await api.post('/users/me/profile-picture', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data.profilePicture;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Upload verification document
   */
  uploadDocument: async (documentType, file) => {
    try {
      const formData = new FormData();
      formData.append('documentType', documentType);
      formData.append('file', file);

      const response = await api.post('/users/me/verification-documents', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data.document;
    } catch (error) {
      throw error;
    }
  },
};

export default userService;
