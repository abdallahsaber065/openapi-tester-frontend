import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
    baseURL: process.env.REACT_APP_API_URL || '',
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Function to set API base URL dynamically
export const setApiBaseUrl = (baseUrl) => {
    api.defaults.baseURL = baseUrl;
};

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
        // Try default path first
        const response = await api.get('/api/v1/openapi.json');
        return response.data;
    } catch (error) {
        console.error('Failed to fetch OpenAPI spec:', error);
        throw error;
    }
};

export const executeRequest = async ({ path, method, data, authToken, config: customConfig }) => {
    try {
        const config = customConfig || {
            url: path,
            method: method.toLowerCase(),
            headers: {},
        };

        // Add auth token if provided and no custom config
        if (!customConfig && authToken) {
            config.headers.Authorization = `Bearer ${authToken}`;
        }

        // Add data based on method if no custom config
        if (!customConfig && ['post', 'put', 'patch'].includes(method.toLowerCase()) && data.body) {
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
