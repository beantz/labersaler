import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform, Alert } from 'react-native';


const api = axios.create({
  baseURL: `http://192.168.1.9:3000`,
  timeout: 10000,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  }
});

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
    
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

/**
 * Interceptor para tratamento de respostas
 */
const setupResponseInterceptors = () => {
  api.interceptors.response.use(
    response => {
      console.debug(`[Response] ${response.status} ${response.config.url}`, response.data);
      return response;
    },
    async (error) => {
      const { response, config } = error;
      const status = response?.status;
      const data = response?.data;
      const url = config?.url;

      //aqui filtra os erros
      const isLoginError = status === 401 && url?.includes('/login');
      const isCodeValidationError = status === 400 && url?.includes('/validar-codigo');
      const isValidationError = status === 400 && data?.errors;
      const isDeleteComment403 = status === 403 && url?.includes('/Review/DeletarComentario/');
      const isEmailNotFound404 = status === 404 && url?.includes('/login') && data?.message === 'E-mail não encontrado'; 
      const isHtmlError = typeof data === 'string' && data.includes('<!DOCTYPE html>');
      const isNetworkError = error.message === 'Network Error';
      const isCategoryError = status === 400 && 
                      url?.includes('/livros/cadastrar') && 
                      data?.message?.includes('Categoria');

      // Log detalhado para debugging
      if (!isCategoryError && !isDeleteComment403 && !isHtmlError && !isValidationError && !isCodeValidationError && !isLoginError && !isEmailNotFound404  && !isNetworkError) {
        console.error('[API Error]', {
          status,
          url,
          message: error.message,
          data,
          config: {
            method: config?.method,
            data: config?.data
          }
        });
      }
  
      //tratamento específico para erros conhecidos
      let userMessage = 'Erro desconhecido';
      if (isNetworkError) {
          userMessage = 'Falha na conexão. Verifique sua internet e tente novamente.';
      } else if (isCategoryError) {
          // Tratamento especial para erros de categoria - não mostra mensagem genérica
          return Promise.reject({
            ...error,
            userMessage: '', // Mensagem vazia - será tratada no componente
            isCategoryError: true,
            isValidationError: true
          }) } 
        else if (status === 400 && data?.errors) {
          userMessage = data.errors.map(err => err.msg).join('\n') || 'Dados inválidos';
          
      } else if (status === 400 && url?.includes('/validar-codigo')) {
        userMessage = data?.error || 'Código inválido';
      } else if (status === 401) {
        userMessage = data?.message || 'Sessão expirada. Faça login novamente.';
        if (!url?.includes('/login')) {
          await AsyncStorage.removeItem('@auth_token');
          delete api.defaults.headers.common['Authorization'];
        }
        await AsyncStorage.removeItem('@auth_token');
        delete api.defaults.headers.common['Authorization'];
      } else if (status === 403) {
        userMessage = data?.message || 'Você não tem permissão para esta ação';
      } else if (status === 404) {
        if (isEmailNotFound404) {
          userMessage = 'Credenciais inválidas';
        } else {
          userMessage = 'Recurso não encontrado';
        }
      } else if (status === 500) {
        if (isHtmlError) {
          userMessage = 'Erro no processamento do servidor';
        } else {
          userMessage = data?.message || 'Erro interno no servidor';
        }
      } else if (data?.message) {
        userMessage = data.message;
      }
  
      // Retorna um erro formatado para o frontend
      return Promise.reject({
        ...error,
        userMessage,
        isAuthError: status === 401,
        isValidationError: status === 400 && data?.errors || isCodeValidationError,
        isServerError: status >= 500,
        isLoginError: isLoginError,
        isEmailNotFound: isEmailNotFound404,
        isCategoryError: isCategoryError
      });
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
