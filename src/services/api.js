import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
    baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8000',
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor for adding auth token
api.interceptors.request.use(
    (config) => {
        // Don't add auth to the openapi.json endpoint
        if (config.url?.includes('/openapi.json')) {
            return config;
        }

        const token = localStorage.getItem('authToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor for handling common errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Token expired or invalid
            localStorage.removeItem('authToken');
        }
        return Promise.reject(error);
    }
);

export const fetchOpenAPISpec = async () => {
    try {
        const response = await api.get('/api/v1/openapi.json');
        return response.data;
    } catch (error) {
        console.error('Failed to fetch OpenAPI spec:', error);
        throw error;
    }
};

export const executeRequest = async ({ path, method, data, authToken }) => {
    try {
        const config = {
            url: path,
            method: method.toLowerCase(),
            headers: {},
        };

        // Add auth token if provided
        if (authToken) {
            config.headers.Authorization = `Bearer ${authToken}`;
        }

        // Add data based on method
        if (['post', 'put', 'patch'].includes(method.toLowerCase()) && data.body) {
            config.data = data.body;
        }

        const response = await api.request(config);

        return {
            status: response.status,
            statusText: response.statusText,
            headers: response.headers,
            data: response.data,
        };
    } catch (error) {
        // Re-throw with response data if available
        const enhancedError = new Error(error.message || 'Request failed');
        enhancedError.response = error.response ? {
            status: error.response.status,
            statusText: error.response.statusText,
            headers: error.response.headers,
            data: error.response.data,
        } : null;
        enhancedError.code = error.code;
        throw enhancedError;
    }
};

export default api;
