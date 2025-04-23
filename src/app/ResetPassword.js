// screens/RedefinirSenha.js
import React, { useState } from 'react';
import { View, TextInput, Button, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import api from '../services/api.js';

export default function RedefinirSenha() {
  const [novaSenha, setNovaSenha] = useState('');
  const { token } = useLocalSearchParams();
  const { email } = useLocalSearchParams();

  let router = useRouter();

  const handleRedefinirSenha = async () => {
    try {
      let response = await api.post('/redefinir-senha', {
        token, 
        novaSenha, 
        email
      });

      if (response.data?.success) {
        Alert.alert('Sucesso', 'Senha redefinida com sucesso!', [
          {
            text: 'OK',
            onPress: () => router.replace('/login')
          }
        ]);
        return;
      }

      // Tratamento de erros de validação (400)
      if (response.status === 400 && response.data?.errors) {
        const firstError = response.data.errors[0];
        Alert.alert(
          `Erro no ${firstError.field === 'novaSenha' ? 'senha' : firstError.field}`,
          firstError.message
        );
        return;
      }

      // Tratamento de outros erros (404, 500, etc.)
      throw new Error(response.data?.error || 'Falha ao alterar senha');


    } catch (error) {
      
      console.error('Erro na redefinição:', error);

      if (error.response) {
        // Erro com resposta do servidor (4xx, 5xx)
        const errorData = error.response.data || {};
        
        if (error.response.status === 400 && errorData.errors) {
          // Erros de validação (array de erros)
          const errorMessages = errorData.errors.map(err => `• ${err.message}`).join('\n');
          Alert.alert('Erro no formulário', errorMessages);
    
      // Tratamento especial para erros de rede/axios
      if (error.response?.data?.errors) {
        const firstError = error.response.data.errors[0];
        Alert.alert(
          `Erro no ${firstError.field === 'novaSenha' ? 'senha' : firstError.field}`,
          firstError.message
        );

      } else {
        Alert.alert(
          'Erro', 
          error.message === 'Usuário não encontrado' 
            ? 'Email não cadastrado no sistema'
            : error.message || 'Erro ao processar sua solicitação'
        );
      }
    };
  }
} 
}

  
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