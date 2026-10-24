import axios from 'axios';

const api = axios.create({ 
  baseURL: import.meta.env.VITE_API_URL, 
  withCredentials: true
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(p => { 
    if (error) p.reject(error); 
    else p.resolve(token); 
  });
  failedQueue = [];
};

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(null, async (error) => {
  const original = error.config;

  // FIX SENIOR: não tenta refresh em rotas de auth
  if (
    original.url?.includes('/auth/login') ||
    original.url?.includes('/auth/register') ||
    original.url?.includes('/auth/forgot') ||
    original.url?.includes('/auth/reset') ||
    original.url?.includes('/auth/refresh')
  ) {
    return Promise.reject(error);
  }

  if (error.response?.status === 401 && !original._retry) {
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      }).then(token => {
        original.headers.Authorization = `Bearer ${token}`;
        return api(original);
      });
    }

    original._retry = true;
    isRefreshing = true;

    try {
      const { data } = await api.post('/auth/refresh');
      localStorage.setItem('accessToken', data.accessToken);
      processQueue(null, data.accessToken);
      original.headers.Authorization = `Bearer ${data.accessToken}`;
      return api(original);
    } catch (err) {
      processQueue(err, null);
      localStorage.removeItem('accessToken'); 
      window.location.href = '/login';
      return Promise.reject(err);
    } finally {
      isRefreshing = false;
    }
  }
  return Promise.reject(error);
});

export default api;