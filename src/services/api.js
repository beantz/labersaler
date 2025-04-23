import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

//Cuida de toda essa parte de lidar com as rotas autenticadas e tokens

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

  console.log(`token recebido: ${token}`);

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
    const errorMessage = error.response?.data?.message;

    // Se foi um logout intencional, não limpe o token automaticamente
    if (errorMessage.includes('logout realizado')) {
      console.log('Logout intencional - mantendo estado');
    } else {
      // Para outros casos de 401 (token expirado, inválido, etc.)
      await AsyncStorage.removeItem('@auth_token');
      delete api.defaults.headers.common['Authorization'];
      
    }
    }

    // Mantém o fluxo de erro para ser tratado localmente
    return Promise.reject(error);
   }
  
);

export default api;