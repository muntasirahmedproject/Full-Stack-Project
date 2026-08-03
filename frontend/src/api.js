import axios from 'axios';

export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Add token to requests
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Auth endpoints
export const authAPI = {
    register: (name, email, password) =>
        api.post('/auth/register', { name, email, password }),
    login: (email, password) =>
        api.post('/auth/login', { email, password }),
    forgotPassword: (email) =>
        api.post('/auth/forgot-password', { email }),
    resetPassword: (email, resetToken, newPassword) =>
        api.post('/auth/reset-password', { email, resetToken, newPassword })
};

// Trip endpoints
export const tripAPI = {
    getTrips: () => api.get('/trips'),
    getTrip: (tripId) => api.get(`/trips/${tripId}`),
    getDashboardStats: () => api.get('/trips/stats/dashboard'),
    createTrip: (title, description, startDate, endDate, currency) =>
        api.post('/trips', { title, description, startDate, endDate, currency }),
    updateTrip: (tripId, data) => api.put(`/trips/${tripId}`, data),
    deleteTrip: (tripId) => api.delete(`/trips/${tripId}`)
};

// Destination endpoints
export const destinationAPI = {
    getDestinations: (tripId) => api.get(`/destinations/trip/${tripId}`),
    getDestination: (destinationId) => api.get(`/destinations/${destinationId}`),
    createDestination: (tripId, name, orderIndex) =>
        api.post('/destinations', { tripId, name, orderIndex }),
    updateDestination: (destinationId, data) =>
        api.put(`/destinations/${destinationId}`, data),
    deleteDestination: (destinationId) =>
        api.delete(`/destinations/${destinationId}`)
};

// Activity endpoints
export const activityAPI = {
    getActivities: (destinationId) =>
        api.get(`/activities/destination/${destinationId}`),
    getActivity: (activityId) => api.get(`/activities/${activityId}`),
    createActivity: (destinationId, categoryId, name, dateTime, budgetPlanned) =>
        api.post('/activities', { destinationId, categoryId, name, dateTime, budgetPlanned }),
    updateActivity: (activityId, data) =>
        api.put(`/activities/${activityId}`, data),
    deleteActivity: (activityId) => api.delete(`/activities/${activityId}`)
};

// Category endpoints
export const categoryAPI = {
    getCategories: () => api.get('/categories'),
    createCategory: (name) => api.post('/categories', { name }),
    updateCategory: (categoryId, name) =>
        api.put(`/categories/${categoryId}`, { name }),
    deleteCategory: (categoryId) => api.delete(`/categories/${categoryId}`)
};

// Admin endpoints
export const adminAPI = {
    getUsers: () => api.get('/admin/users'),
    disableUser: (userId) => api.put(`/admin/users/${userId}/disable`),
    enableUser: (userId) => api.put(`/admin/users/${userId}/enable`),
    getStats: () => api.get('/admin/stats')
};

// Image endpoints
export const imageAPI = {
    upload: (formData) =>
        api.post('/images/upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        }),
    getDestinationImages: (destinationId) =>
        api.get(`/images/destination/${destinationId}`),
    deleteImage: (imageId) => api.delete(`/images/${imageId}`)
};

export default api;