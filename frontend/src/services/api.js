import axios from 'axios';

let rawBaseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
rawBaseURL = rawBaseURL.trim().replace(/\/+$/, '');
if (!rawBaseURL.endsWith('/api')) {
  rawBaseURL += '/api';
}

const api = axios.create({
  baseURL: rawBaseURL,
  withCredentials: true, // Sends HTTP-Only cookie across origins
});

// Attach Authorization header if user token exists in localStorage (redundant safety for cross-site cookie blocking)
api.interceptors.request.use((config) => {
  try {
    const stored = localStorage.getItem('userInfo');
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed?.token) {
        config.headers.Authorization = `Bearer ${parsed.token}`;
      }
    }
  } catch (e) {
    // Ignore JSON parse errors
  }
  return config;
});

export default api;