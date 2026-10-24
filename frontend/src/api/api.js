import axios from 'axios';

// Cria a instância do axios apontando pra sua API
const api = axios.create({ 
  baseURL: import.meta.env.VITE_API_URL, 
  withCredentials: true // obrigatório pra enviar o cookie de refresh
});

let isRefreshing = false; // trava pra não fazer 2 refreshs ao mesmo tempo
let failedQueue = []; // fila de requisições que falharam enquanto refreshava

// Função que avisa todo mundo da fila se o refresh deu certo ou não
const processQueue = (error, token = null) => {
  failedQueue.forEach(p => { 
    if (error) p.reject(error); 
    else p.resolve(token); 
  });
  failedQueue = [];
};

// INTERCEPTOR DE REQUEST - roda antes de TODA requisição
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// INTERCEPTOR DE RESPONSE - roda quando a API responde com erro
api.interceptors.response.use(null, async (error) => {
  const original = error.config; // a requisição que falhou

  // Se deu 401 (token expirou) e ainda não tentamos de novo
  if (error.response?.status === 401 && !original._retry) {
    
    // Se já tem um refresh rolando, entra na fila e espera
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      }).then(token => {
        original.headers.Authorization = `Bearer ${token}`;
        return api(original); // tenta de novo com token novo
      });
    }

    original._retry = true; // marca que já tentou pra não entrar em loop infinito
    isRefreshing = true;

    try {
      // Tenta renovar usando o refresh token que está no cookie
      const { data } = await api.post('/auth/refresh');
      
      // Salva o novo accessToken
      localStorage.setItem('accessToken', data.accessToken);
      
      // Avisa a fila que deu certo
      processQueue(null, data.accessToken);
      
      // Tenta a requisição original de novo
      original.headers.Authorization = `Bearer ${data.accessToken}`;
      return api(original);

    } catch (err) {
      // Se o refresh também falhou -> refresh expirou, tem que deslogar
      processQueue(err, null);
      
      // CORREÇÃO AQUI: não use clear(), use removeItem
      localStorage.removeItem('accessToken'); 
      
      // CORREÇÃO AQUI: manda pro /login, não pro /
      window.location.href = '/login';
      return Promise.reject(err);
    } finally {
      isRefreshing = false; // libera a trava
    }
  }
  return Promise.reject(error);
});

export default api;