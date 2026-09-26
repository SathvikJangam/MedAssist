import { create } from 'zustand';
import api from '../services/api';

// Helper: safely parse localStorage
const getStoredUser = () => {
  try {
    const stored = localStorage.getItem('userInfo');
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
};

const useAuthStore = create((set) => ({
  // Hydrate immediately from localStorage so page refresh keeps you logged in
  user: getStoredUser(),
  isAuthenticated: !!getStoredUser(),
  isLoading: false,

  // Login action — also persists to localStorage
  login: async (email, password) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      localStorage.setItem('userInfo', JSON.stringify(res.data));
      set({ user: res.data, isAuthenticated: true });
      return { success: true, role: res.data.role };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Login failed' };
    }
  },

  // Logout action — clears cookie + localStorage
  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout request failed:', error);
    } finally {
      localStorage.removeItem('userInfo');
      set({ user: null, isAuthenticated: false });
    }
  },

  // Manually set user (used after register)
  setUser: (userData) => {
    localStorage.setItem('userInfo', JSON.stringify(userData));
    set({ user: userData, isAuthenticated: true, isLoading: false });
  },

  setLoading: (status) => set({ isLoading: status }),
}));

export default useAuthStore;