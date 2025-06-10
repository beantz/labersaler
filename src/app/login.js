import React, { useState } from 'react';
import { 
  Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, KeyboardAvoidingView, Platform, View, ActivityIndicator, Alert
} from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api.js';

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async () => {
    if (!email || !email.trim()) {
      Alert.alert('Erro', 'Por favor, informe seu e-mail');
      return;
    }

    if (!password) {
      Alert.alert('Erro', 'Por favor, informe sua senha');
      return;
    }

    setIsLoading(true);

    try {
      const response = await api.post('/login', { 
        email: email.trim(), 
        password 
      }, { timeout: 10000 });

      if (response.data?.token) {
        await AsyncStorage.setItem('@auth_token', response.data.token);
        router.push('/home');
      } else {
        throw new Error('Resposta inesperada do servidor');
      }

    } catch (error) {
      setIsLoading(false);
      console.error('Login Error:', error);

      let errorMessage = 'Erro ao realizar login';

      if (error.response?.status === 400) {
        const firstError = error.response.data?.errors?.[0];
        errorMessage = firstError?.msg || 'Dados inválidos';
        if (firstError?.field === 'password') {
          errorMessage = 'A senha é obrigatória';
        }
      } else if (error.response?.status === 404) {
        errorMessage = 'E-mail não encontrado';
      } else if (error.response?.status === 401) {
        errorMessage = 'Senha incorreta';
      } else if (error.code === 'ECONNABORTED') {
        errorMessage = 'Tempo de conexão esgotado. Tente novamente.';
      } else if (!error.response) {
        errorMessage = 'Sem conexão com o servidor';
      }

      Alert.alert('Erro', errorMessage);
    }
  };

  const handleCreateAccount = () => router.push('/createAccount');
  const handleForgotPassword = () => router.push('/forgotPassword');

  return (
    <SafeAreaView style={styles.container}>
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <MaterialCommunityIcons name="book-open-variant" size={60} color="blue" />
          <Text style={styles.loadingText}>Estamos processando suas informações...</Text>
          <ActivityIndicator size="large" color="#007BFF" />
        </View>
      ) : (
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.innerContainer}>
          <MaterialCommunityIcons name="book-open-variant" size={60} color='#007BFF' />
          <Text style={styles.title}>Liber-Sale</Text>
          <Text style={styles.title}>Realize seu Login</Text>

          <View style={styles.inputWrapper}>
            <MaterialCommunityIcons name="email-outline" size={24} color="#666" style={styles.inputIcon} />
            <TextInput
              style={styles.inputWithIcon}
              placeholder="Email"
              placeholderTextColor="#666"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputWrapper}>
            <MaterialCommunityIcons name="lock-outline" size={24} color="#666" style={styles.inputIcon} />
            <TextInput
              style={styles.inputWithIcon}
              placeholder="Senha"
              placeholderTextColor="#666"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!isPasswordVisible}
            />
            <TouchableOpacity onPress={() => setIsPasswordVisible(!isPasswordVisible)}>
              <Feather
                name={isPasswordVisible ? 'eye-off' : 'eye'}
                size={22}
                color="#666"
              />
            </TouchableOpacity>
          </View>

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
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 12,
    height: 50,
    width: '100%',
  },
  inputIcon: {
    marginRight: 8,
  },
  inputWithIcon: {
    flex: 1,
    color: '#000',
    fontSize: 16,
  },
  button: {
    width: '100%',
    backgroundColor: 'blue',
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