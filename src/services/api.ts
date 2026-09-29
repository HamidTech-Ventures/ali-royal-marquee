import axios from 'axios';

// Create Axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : '/api',
  withCredentials: true, // Send cookies (refresh token) with every request
});

// We'll store the access token in memory
let currentAccessToken: string | null = null;
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

export const setAccessToken = (token: string | null) => {
  currentAccessToken = token;
};

// Request interceptor to attach access token
api.interceptors.request.use(
  (config) => {
    if (currentAccessToken && config.headers) {
      config.headers['Authorization'] = `Bearer ${currentAccessToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle 401s and token refresh
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // If 401 and it's not a retry or the refresh endpoint itself
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      originalRequest.url !== '/auth/refresh' &&
      originalRequest.url !== '/auth/login'
    ) {
      if (isRefreshing) {
        // If already refreshing, queue the request
        return new Promise(function (resolve, reject) {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers['Authorization'] = 'Bearer ' + token;
            return api(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const baseURL = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : '/api';
        const { data } = await axios.post(`${baseURL}/auth/refresh`, {}, { withCredentials: true });
        
        setAccessToken(data.accessToken);
        processQueue(null, data.accessToken);
        
        originalRequest.headers['Authorization'] = 'Bearer ' + data.accessToken;
        
        return api(originalRequest);
      } catch (err) {
        processQueue(err, null);
        setAccessToken(null);
        // Dispatch custom event to trigger logout in React tree
        window.dispatchEvent(new Event('auth:logout'));
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
