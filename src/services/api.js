
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Configuração base da API
const api = axios.create({
  baseURL: 'http://192.168.0.105:3000',
  timeout: 10000,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  }
});

/**
 * Interceptor para logging de requisições
 */
const setupRequestInterceptors = () => {
  // Log de requisições
  api.interceptors.request.use(config => {
    console.debug(`[Request] ${config.method?.toUpperCase()} ${config.url}`, {
      data: config.data,
      headers: config.headers
    });
    return config;
  }, error => {
    console.error('[Request Error]', error);
    return Promise.reject(error);
  });

  // Adição automática do token JWT
  api.interceptors.request.use(async (config) => {
    try {
      const token = await AsyncStorage.getItem('@auth_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    } catch (error) {
      console.error('[Token Storage Error]', error);
      return Promise.reject(error);
    }
  });
};

api.interceptors.request.use(async (config) => {
  if (config.data instanceof FormData) {
    config.headers['Content-Type'] = 'multipart/form-data';
    
    // Adiciona cabeçalho adicional para Android
    if (Platform.OS === 'android') {
      config.headers['Accept'] = 'application/json';
      config.headers['Content-Type'] = 'multipart/form-data; boundary=someArbitraryBoundary';
    }
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

/**
 * Interceptor para tratamento de respostas
 */
const setupResponseInterceptors = () => {
  // Log de respostas bem-sucedidas
  api.interceptors.response.use(response => {
    console.debug(`[Response] ${response.status} ${response.config.url}`, response.data);
    return response;
  });

  // Tratamento centralizado de erros
  api.interceptors.response.use(
    response => response,
    async (error) => {
      const { response, config } = error;
      const status = response?.status;
      const data = response?.data;
      const url = config?.url;

      // Tratamento específico para token expirado/inválido (401)
      if (status === 401 && !data?.message?.includes('logout realizado')) {
        try {
          await AsyncStorage.removeItem('@auth_token');
          delete api.defaults.headers.common['Authorization'];
        } catch (storageError) {
          console.error('[Token Removal Error]', storageError);
        }
      }

      // Log de erros não silenciosos (todos exceto 400 e 404)
      if (![400, 404].includes(status)) {
        console.error('[API Error]', {
          message: error.message,
          code: error.code,
          status,
          data,
          url
        });
      }

      return Promise.reject({
        ...error,
        silent: [400, 404].includes(status) // Marca erros que não devem ser logados
      });
    }
  );
};

// Configura os interceptors
setupRequestInterceptors();
setupResponseInterceptors();

export default api;