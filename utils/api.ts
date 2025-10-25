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
  (error) => {
    return Promise.reject(error);
  }
);

// Attach the tokens to requests if available
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
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
