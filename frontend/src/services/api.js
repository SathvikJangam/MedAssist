import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  withCredentials: true, // IMPORTANT: This sends the JWT cookie to the backend
});

export default api;