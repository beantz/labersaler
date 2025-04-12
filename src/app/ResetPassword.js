// screens/RedefinirSenha.js
import React, { useState } from 'react';
import { View, TextInput, Button, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

export default function RedefinirSenha() {
  const [novaSenha, setNovaSenha] = useState('');
  const { token } = useLocalSearchParams();
  const { email } = useLocalSearchParams();

  let router = useRouter();

  const handleRedefinirSenha = async () => {
    try {
      let response = await fetch('http://192.168.0.105:3000/redefinir-senha', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ token, novaSenha, email})
      });

      const data = await response.json();

      if (!response.ok) {
        // Trata erros de validação
        if (data.errors) {
          const errorMessages = data.errors.map(e => e.message).join('\n');
          Alert.alert('Erro', errorMessages);
        } else {
          throw new Error(data.error || 'Falha ao alterar senha');
        }
        return;
      }
  
      Alert.alert('Sucesso', data.message);
      router.replace('/login');

    } catch (error) {
      
      Alert.alert('Erro', error.message || 'Falha ao alterar senha');
    }
  }; 

  
  return (
    <View style={{ padding: 20 }}>
      <TextInput
        placeholder="Nova senha"
        value={novaSenha}
        onChangeText={setNovaSenha}
        secureTextEntry
      />
      <Button title="Redefinir Senha" onPress={handleRedefinirSenha} />
    </View>
  );
}