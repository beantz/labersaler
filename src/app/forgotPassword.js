// app/forgotPassword.js
import React from 'react';
import { View, Text, StyleSheet, TextInput, Button } from 'react-native';
import { router } from 'expo-router';
import { Alert } from 'react-native';

const ForgotPasswordScreen = () => {
  const [email, setEmail] = React.useState('');

  const handleResetPassword = async () => {
    
    try {
      let response = await fetch('http://192.168.0.105:3000/esqueci-senha', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if(response.ok){
        Alert.alert('Sucesso', 'Verifique seu email para redefinir a senha.', [
          {
            text: 'OK',
            onPress: () => router.replace({ pathname: '/verificationScreen', params: { email: email }}), //redireciona pra tela de inserir o codigo
          },
        ]);
      } else {
        
        let errorData = await response.json();
        
        throw new Error(errorData.errors[0].msg || 'Erro desconhecido');
        
      }

    } catch (error) {
      Alert.alert('Erro', error.message);
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
