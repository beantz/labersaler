import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert,
  KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api.js';

const CadastroScreen = () => {
  const [nome, setName] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setPassword] = useState('');
  const [contato, setContato] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const router = useRouter();

  const handleCadastro = async () => {
    try {
      const response = await api.post('/cadastro', {
        nome,
        email,
        senha,
        confirmPassword,
        contato
      });
  
      // Se chegou aqui, cadastro foi bem-sucedido
      Alert.alert('Sucesso', 'Cadastro realizado com sucesso!');
      router.push('/login');
  
    } catch (error) {
      // Tratamento específico para erros de validação (400)
      if (error.response?.status === 400 && error.response?.data?.errors) {
  
        // Processa os erros para exibição
        const errorMessages = error.response.data.errors.map(err => {
          // const fieldName = fieldNames[err.field] || err.field;
          return ` ${err.message}`;
        }).join('\n\n');
  
        Alert.alert('Erros no formulário', errorMessages);
  
      } 
      // Tratamento para outros tipos de erro
      else {
        const errorMessage = error.response?.data?.message || 
                           'Erro ao processar o cadastro. Tente novamente.';
        Alert.alert('Erro', errorMessage);
      }
    }
  };

  return (
    <KeyboardAvoidingView 
    style={styles.container}
    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
  >
    {/* Barra Superior */}
    <View style={styles.topBar}>
      <Text style={styles.header}>LiberSale</Text>
    </View>

    <View style={styles.innerContainer}>
      <Text style={styles.title}>Cadastro</Text>

      <TextInput
        style={styles.input}
        placeholder="Nome"
        placeholderTextColor="#888"
        value={nome}
        onChangeText={setName}
      />

      <TextInput
        style={styles.input}
        placeholder="E-mail"
        placeholderTextColor="#888"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />

      <TextInput
        style={styles.input}
        placeholder="Número de Contato"
        placeholderTextColor="#888"
        keyboardType="phone-pad"  // Teclado numérico para telefones
        value={contato}
        onChangeText={setContato}
        maxLength={15}  // Limite razoável para números com DDD e código de país
        autoComplete="tel"  // Autocompletar para números de telefone
      />

      <TextInput
        style={styles.input}
        placeholder="Senha"
        placeholderTextColor="#888"
        secureTextEntry
        value={senha}
        onChangeText={setPassword}
      />

      <TextInput
        style={styles.input}
        placeholder="Confirmar Senha"
        placeholderTextColor="#888"
        secureTextEntry
        value={confirmPassword}
        onChangeText={setConfirmPassword}
      />

      <TouchableOpacity style={styles.button} onPress={handleCadastro}>
        <Text style={styles.buttonText}>Cadastrar</Text>
      </TouchableOpacity>
    </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#8B008B',
  },
  topBar: {
    height: 60,
    backgroundColor: '#6A006A',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
  },
  header: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#fff',
  },
  innerContainer: {
    flex: 1,
    padding: 20,
    paddingTop: 30,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center',
    color: '#fff',
    fontWeight: 'bold',
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#ccc',
    marginBottom: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#FFF',
    color: '#000',
  },
  button: {
    backgroundColor: '#0000CD',
    padding: 15,
    borderRadius: 8,
    marginTop: 10,
  },
  buttonText: {
    color: '#FFF',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default CadastroScreen;