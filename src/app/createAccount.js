import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
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
    <View style={styles.container}>
      <Text style={styles.title}>Cadastro</Text>

      <TextInput
        style={styles.input}
        placeholder="Nome"
        placeholderTextColor="#666"
        value={nome}
        onChangeText={setName}
      />

      <TextInput
        style={styles.input}
        placeholder="E-mail"
        placeholderTextColor="#666"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />

      <TextInput
        style={styles.input}
        placeholder="Número de Contato"
        placeholderTextColor="#666"
        keyboardType="phone-pad"  // Teclado numérico para telefones
        value={contato}
        onChangeText={setContato}
        maxLength={15}  // Limite razoável para números com DDD e código de país
        autoComplete="tel"  // Autocompletar para números de telefone
      />

      <TextInput
        style={styles.input}
        placeholder="Senha"
        placeholderTextColor="#666"
        secureTextEntry
        value={senha}
        onChangeText={setPassword}
      />

      <TextInput
        style={styles.input}
        placeholder="Confirmar Senha"
        placeholderTextColor="#666"
        secureTextEntry
        value={confirmPassword}
        onChangeText={setConfirmPassword}
      />

      <TouchableOpacity style={styles.button} onPress={handleCadastro}>
        <Text style={styles.buttonText}>Cadastrar</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1,
    padding: 20,
    justifyContent: 'center',},
  title: { fontSize: 24, marginBottom: 20, textAlign: 'center' },
  input: {
    height: 40,
    borderWidth: 1,
    borderColor: '#ccc',
    marginBottom: 5,
    padding: 10,
    borderRadius: 5
  },
  button: {
    backgroundColor: '#3498db',
    padding: 15,
    borderRadius: 5,
    marginTop: 10
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold'
  }
});

export default CadastroScreen;