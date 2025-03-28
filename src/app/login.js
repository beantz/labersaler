import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import uuid from 'react-native-uuid';

let ip = "192.168.0.104";

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  // Função que é chamada ao clicar em "Entrar"
  const handleLogin = async () => {

    try {
      let response = await fetch(`http://${ip}:3000/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          password: password,
        }),
      });

      if(response.ok) {

        router.push('/home');

      } else {

        let data = await response.json();

        //resgatando os erros retornados no controller caso tiver algum
        if (data.errors) {
          // Junta todas as mensagens de erro em uma string
          const errorMessages = data.errors.map(err => err.msg).join('\n');
          alert(errorMessages);
        } 
      }

    } catch (error) {
      
      alert('Ocorreu um erro ao tentar fazer login.');

    }

  };

  const handleCreateAccount = () => {
    router.push('/createAccount'); // Navega para a tela de criação de conta
  };

  const handleForgotPassword = () => {
    router.push('/forgotPassword'); // Navega para a tela de recuperação de senha
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.innerContainer}>
        <MaterialCommunityIcons name="book-open-variant" size={60} color="#007BFF" />
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
        
        {/* Botão para login */}
        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>Entrar</Text>
        </TouchableOpacity>

        {/* Link para recuperação de senha */}
        <TouchableOpacity onPress={handleForgotPassword}>
          <Text style={styles.link}>Esqueceu a senha?</Text>
        </TouchableOpacity>
        
        {/* Link para criar conta */}
        <TouchableOpacity onPress={handleCreateAccount}>
          <Text style={styles.link}>Criar Conta</Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
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
    color: '#000', // Garante que o texto digitado seja visível
  },
  button: {
    width: '100%',
    backgroundColor: 'blue', // Cor azul para o botão
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