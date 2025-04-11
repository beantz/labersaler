import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const api = axios.create({
  baseURL: 'http://192.168.0.105:3000',
  timeout: 10000, 
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  }
});

// Log de todas as requisições enviadas
api.interceptors.request.use(config => {
  console.log(`[Request] ${config.method?.toUpperCase()} ${config.url}`, {
    data: config.data,
    headers: config.headers
  });
  return config;
}, error => {
  console.log('[Request Error]', error);
  return Promise.reject(error);
});

// Adiciona token JWT automaticamente
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('@auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  console.log('[Token Error]', error);
  return Promise.reject(error);
});

// Tratamento global de respostas
api.interceptors.response.use(response => {
  console.log(`[Response] ${response.status} ${response.config.url}`, response.data);
  return response;
}, async (error) => {
  // Log detalhado do erro
  console.log('[Response Error]', {
    message: error.message,
    code: error.code,
    status: error.response?.status,
    data: error.response?.data,
    url: error.config?.url
  });

  // Tratamento específico para token expirado
  if (error.response?.status === 401) {
    await AsyncStorage.removeItem('@auth_token');
    // Adicione aqui qualquer redirecionamento global se necessário
  }

  // Mantém o fluxo de erro para ser tratado localmente
  return Promise.reject(error);
});

export default api;