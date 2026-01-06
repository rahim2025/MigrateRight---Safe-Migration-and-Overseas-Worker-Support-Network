import api from './api';

export const getDashboardStats = async () => {
    try {
        const response = await api.get('/dashboard/stats');
        return response;
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        throw error;
    }
};
