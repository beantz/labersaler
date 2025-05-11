import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform, Alert } from 'react-native';

// Configuração base da API
const api = axios.create({
  baseURL: `http://192.168.1.9:3000`,
  timeout: 10000,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  }
});

// Objeto para controle de erros exibidos
const errorDisplay = {
  lastShown: null,
  cooldown: 5000 // 5 segundos entre erros iguais
};

/**
 * Mostra alerta de erro formatado
 */
const showErrorAlert = (message) => {
  const now = Date.now();
  if (errorDisplay.lastShown !== message || 
      (now - errorDisplay.lastShown?.timestamp > errorDisplay.cooldown)) {
    Alert.alert(
      'Erro',
      message,
      [{ text: 'OK' }],
      { cancelable: false }
    );
    errorDisplay.lastShown = {
      message,
      timestamp: now
    };
  }
};

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

// Interceptor para FormData
api.interceptors.request.use(async (config) => {
  if (config.data instanceof FormData) {
    config.headers['Content-Type'] = 'multipart/form-data';
    
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

      // Tratamento específico para erros de autenticação
      if (status === 401) {
        const isLoginRoute = url?.includes('/login');
        const isWrongPassword = data?.message?.includes('Senha incorreta');
        
        if (isLoginRoute && isWrongPassword) {
          // Não remove token pois é tentativa de login
          return Promise.reject({
            ...error,
            isAuthError: true,
            userMessage: 'E-mail ou senha incorretos'
          });
        } else {
          // Token inválido/expirado - faz logout
          try {
            await AsyncStorage.removeItem('@auth_token');
            delete api.defaults.headers.common['Authorization'];
          } catch (storageError) {
            console.error('[Token Removal Error]', storageError);
          }
          return Promise.reject({
            ...error,
            isAuthError: true,
            userMessage: 'Sessão expirada. Faça login novamente.'
          });
        }
      }

      // Tratamento de outros erros
      const errorToReject = {
        ...error,
        isAuthError: false,
        userMessage: 'Ocorreu um erro. Tente novamente.'
      };

      // // Log de erros não silenciosos
      // if (![400, 404].includes(status)) {
      //   console.error('[API Error]', {
      //     message: error.message,
      //     code: error.code,
      //     status,
      //     data,
      //     url
      //   });
      // }

      // return Promise.reject(errorToReject);
    }
  );
};

// Configura os interceptors
setupRequestInterceptors();
setupResponseInterceptors();

// Função auxiliar para tratamento de erros nos componentes
export const handleApiError = (error, customHandler) => {
  if (error.isAuthError && error.userMessage) {
    showErrorAlert(error.userMessage);
  } else if (customHandler) {
    customHandler(error);
  } else {
    showErrorAlert(error.userMessage || 'Erro desconhecido');
  }
};

export default api;
