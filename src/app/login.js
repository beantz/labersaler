import React, { useState } from 'react';
import { 
  Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, KeyboardAvoidingView, Platform, View, ActivityIndicator, Alert
} from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '/home/beatrizm/Documentos/js/labersaler/services/api.js';

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async () => {
    setIsLoading(true);
  
    try {
      const response = await api.post('/login', { 
        email, 
        password 
      }, {
        timeout: 10000 // 10 segundos de timeout
      });
  
      // Verificação mais segura
      if (response.data?.token) {

        await AsyncStorage.setItem('@auth_token', response.data.token);
        router.push('/home');

      } else {
        throw new Error('Resposta inesperada do servidor');
      }
  
    } catch (error) {
      setIsLoading(false);
    
      let errorMessage = 'Erro desconhecido';
  
      // Erros de rede/timeout
      if (error.code === 'ECONNABORTED' || !error.response) {
        errorMessage = 'Servidor não respondeu. Verifique sua conexão.';
      }
      // Erros de validação (400)
      else if (error.response?.status === 400) {
        if (error.response.data?.errors) {
          errorMessage = error.response.data.errors
            .map(err => `• ${err.msg || err.message}`)
            .join('\n');
        } else {
          errorMessage = error.response.data?.message || 'Dados inválidos';
        }
      }
      // Outros erros HTTP
      else if (error.response?.status) {
        errorMessage = error.response.data?.message || `Erro ${error.response.status}`;
      }
  
      Alert.alert('Erro', errorMessage);
    }
  };

  const handleCreateAccount = () => {
    router.push('/createAccount');
  };

  const handleForgotPassword = () => {
    router.push('/forgotPassword');
  };

  return (
    <SafeAreaView style={styles.container}>
      {isLoading ? (
        // Tela de processamento
        <View style={styles.loadingContainer}>
          <MaterialCommunityIcons name="book-open-variant" size={60} color='#007BFF' />
          <Text style={styles.loadingText}>Estamos processando suas informações...</Text>
          <ActivityIndicator size="large" color="#007BFF" />
        </View>
      ) : (
        // Tela de login
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.innerContainer}>
          <MaterialCommunityIcons name="book-open-variant" size={60} color='#007BFF' />
          <Text style={styles.title}>Laber-Sale</Text>
          <Text style={styles.title}>Realize seu Login</Text>
          
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#666"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TextInput
            style={styles.input}
            placeholder="Senha"
            placeholderTextColor="#666"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          
          <TouchableOpacity style={styles.button} onPress={handleLogin}>
            <Text style={styles.buttonText}>Entrar</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleForgotPassword}>
            <Text style={styles.link}>Esqueceu a senha?</Text>
          </TouchableOpacity>
          
          <TouchableOpacity onPress={handleCreateAccount}>
            <Text style={styles.link}>Criar Conta</Text>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#8B008B',
  },
  innerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: "#fff",
  },
  loadingText: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    color: "#333",
    marginVertical: 10,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
    color: '#f5f5f5',
  },
  input: {
    width: '100%',
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 12,
    backgroundColor: '#FFF',
    color: '#000',
  },
  button: {
    width: '100%',
    backgroundColor: '#007BFF',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  link: {
    color: '#f5f5f5',
    marginTop: 12,
    textAlign: 'center',
  },
});

export default LoginScreen;