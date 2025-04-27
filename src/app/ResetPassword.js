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
      const response = await api.post('/redefinir-senha', {
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
        const errorMessages = response.data.errors.map(err => 
          `• ${err.message}`
        ).join('\n');
        
        Alert.alert(
          'Erro no formulário', 
          errorMessages
        );
        return;
      }
  
      throw new Error(response.data?.error || 'Falha ao alterar senha');
  
    } catch (error) {
      // Suprime logs de erros 400 tratados
      if (!(error.response?.status === 400)) {
        console.error('Erro na redefinição:', error);
      }
  
      if (error.response) {
        const errorData = error.response.data || {};
        
        // Tratamento especial para erros de validação
        if (error.response.status === 400 && errorData.errors) {
          const errorMessages = errorData.errors.map(err => 
            ` ${err.message}`
          ).join('\n');
          
          Alert.alert(
            'Erro no formulário', 
            errorMessages
          );
        
        // Tratamento para usuário não encontrado (404)
        } else if (error.response.status === 404) {
          Alert.alert(
            'Erro', 
            'Email não cadastrado no sistema'
          );
        
        // Outros erros
        } else {
          Alert.alert(
            'Erro', 
            errorData.error || 'Erro ao processar sua solicitação'
          );
        }
      } else {
        Alert.alert(
          'Erro de conexão', 
          'Não foi possível conectar ao servidor. Verifique sua internet.'
        );
      }
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