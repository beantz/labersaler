// screens/RedefinirSenha.js
import React, { useState } from 'react';
import { View, TextInput, Button, Alert } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useRoute } from '@react-navigation/native';

export default function RedefinirSenha() {
  const [novaSenha, setNovaSenha] = useState('');
  const { token } = useLocalSearchParams();

  const handleRedefinirSenha = async () => {
    try {
      await fetch('http://192.168.0.104:3000/redefinir-senha', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ token, novaSenha })
      });
      
      if (!response.ok) {
        throw new Error('Falha ao alterar senha');
      }

      const data = await response.json();
      
      Alert.alert('Sucesso', data.message || 'Senha alterada com sucesso!');
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