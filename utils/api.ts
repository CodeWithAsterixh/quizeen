import axios from "axios";
import Cookies from 'js-cookie'

// Create an Axios instance for API calls
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "/api",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Important for CSRF cookie handling
});

// Track the current CSRF token
let currentCsrfToken: string | null = null;

// Intercept responses to capture CSRF token
api.interceptors.response.use(
  (response) => {
    const newToken = response.headers['x-csrf-token'];
    if (newToken) {
      currentCsrfToken = newToken;
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    // If we receive 401 and the request was not already retried, try to call refresh endpoint
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Attempt to refresh tokens (server will read HttpOnly refresh cookie)
        const refreshResponse = await axios.post(`${api.defaults.baseURL}/auth/refresh`, {}, { withCredentials: true });
        if (refreshResponse.status === 200 || refreshResponse.status === 201 || refreshResponse.status === 204 || (refreshResponse.data && refreshResponse.data.ok)) {
          // Retry original request (cookies will be sent automatically)
          return api(originalRequest);
        }
      } catch (refreshErr) {
        // Refresh failed — fall through to reject original error
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);

// Attach the tokens to requests if available
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    // If an access token is available in a readable cookie (non-HttpOnly), attach it as Authorization.
    // Note: in this app access tokens are HttpOnly and will be sent by the browser automatically.
    const token = Cookies.get("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    if (currentCsrfToken) {
      config.headers["x-csrf-token"] = currentCsrfToken;
    }
  }
  return config;
});

export default api;
