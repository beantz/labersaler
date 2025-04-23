// app/forgotPassword.js
import React from 'react';
import { View, Text, StyleSheet, TextInput, Button, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { Alert } from 'react-native';
import api from '../services/api.js';

const ForgotPasswordScreen = () => {
  const [email, setEmail] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  const handleResetPassword = async () => {
    setLoading(true);
    try {
      let response = await api.post('/esqueci-senha', { email });

       // Verifica se a requisição foi bem-sucedida (status 2xx)
       if (response.status >= 200 && response.status < 300) {
        Alert.alert('Sucesso', 'Verifique seu email para redefinir a senha.', [
            {
                text: 'OK',
                onPress: () => router.replace({ 
                    pathname: '/verificationScreen', 
                    params: { email: email }
                }),
            },
        ]);
        } else {
            // Se a API retornar um erro com corpo JSON
            const errorData = response.data || {};
            const errorMessage = errorData.errors?.[0]?.msg || 
                                errorData.message || 
                                'Erro ao processar solicitação';
            throw new Error(errorMessage);
        }
    } catch (error) {
      if (error.response?.status === 400 && error.response?.data?.errors) {
        const fieldErrors = {};
  
        error.response.data.errors.forEach(err => {
          if (!fieldErrors[err.path]) {
            fieldErrors[err.path] = [];
          }
          fieldErrors[err.path].push(err.msg);
        });
      
        // Mostra apenas o primeiro erro do primeiro campo com erro
        const firstField = Object.keys(fieldErrors)[0];
        Alert.alert(
          firstField === 'email' ? 'Erro no email' : 'Erro no formulário',
          fieldErrors[firstField][0]
        );
      } else {
        Alert.alert('Erro', error.message || 'Erro ao tentar redefinir a senha');
      }
    } finally {
      setLoading(false);
    }
};

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Esqueceu a Senha</Text>
      <TextInput
        style={styles.input}
        placeholder="Digite seu email"
        placeholderTextColor="#666"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <Button title="Recuperar Senha" onPress={handleResetPassword} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
  },
  title: {
    fontSize: 24,
    marginBottom: 24,
    textAlign: 'center',
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 12,
    paddingHorizontal: 8,
  },
});

export default ForgotPasswordScreen;
