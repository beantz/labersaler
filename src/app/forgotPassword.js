// app/forgotPassword.js
import React from 'react';
import { View, Text, StyleSheet, TextInput, Button, ActivityIndicator, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { Alert } from 'react-native';
import api from '../services/api.js';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const ForgotPasswordScreen = () => {
  const [email, setEmail] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  const handleResetPassword = async () => {
    setLoading(true);
    try {
      let response = await api.post('/esqueci-senha', { email });

      
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
      <MaterialCommunityIcons
        name="book-open-variant"
        size={60}
        color="#FFF"
        style={styles.icon}
      />
      <Text style={styles.title}>Esqueceu a Senha</Text>

      <View style={styles.inputWrapper}>
      <MaterialCommunityIcons name="email-outline" size={24} color="#666" style={styles.inputIcon} />
      <TextInput
        style={styles.inputWithIcon}
        placeholder="Digite seu email"
        placeholderTextColor="#666"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
    </View>

    <TouchableOpacity style={styles.button} onPress={handleResetPassword}>
        <Text style={styles.buttonText}>Recuperar Senha</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#8B008B',
  },
  icon: {
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    marginBottom: 24,
    textAlign: 'center',
    color: '#fff',
  },
  input: {
    height: 40,
    width: '100%',
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 12,
    paddingHorizontal: 8,
    backgroundColor: '#fff',
    borderRadius: 8,
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
    fontSize: 16,
    fontWeight: 'bold',
  },

  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 12,
    height: 40,
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
});

export default ForgotPasswordScreen;
