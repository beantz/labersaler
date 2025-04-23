import { useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { View, Text, Alert } from 'react-native';
import { CodeField } from 'react-native-confirmation-code-field';
import api from '../services/api.js';

export default function VerificationScreen({ route }) {
  const [code, setCode] = useState('');
  const { email } =  useLocalSearchParams(); 
  const router = useRouter(); 

  // Função obrigatória para renderizar cada célula do código
  const renderCell = ({ index, symbol, isFocused }) => (
    <Text
      key={index}
      style={{
        width: 40,
        height: 40,
        lineHeight: 38,
        fontSize: 24,
        borderWidth: 1,
        borderColor: isFocused ? '#000' : '#ccc',
        textAlign: 'center',
        margin: 5,
      }}>
      {symbol || (isFocused ? '|' : '')}
    </Text>
  );

  const handleVerify = async () => {
    try {
      if (!code || code.length < 6) {
        Alert.alert('Erro', 'Por favor, preencha todos os dígitos do código');
        return;
      }
  
      const response = await api.post('/validar-codigo', {
        token: code, 
        email: email
      });
  
      if (response.status === 200) {
        router.replace({ 
          pathname: '/ResetPassword', 
          params: { token: code, email: email }
        });
        return;
      }
  
      // Tratamento de erros específicos
      const errorData = response.data || {};
      Alert.alert('Erro', errorData.error || 'Erro ao validar código');
  
    } catch (error) {
      console.error('Erro na verificação:', error);
      
      if (error.response) {
        const errorData = error.response.data || {};
        
        if (error.response.status === 400) {
          if (errorData.error === 'Código inválido') {
            Alert.alert(
              'Código Inválido', 
              'O código digitado está incorreto. Verifique e tente novamente.'
            );
          } else if (errorData.error === 'Código expirado') {
            Alert.alert(
              'Código Expirado', 
              'Este código já expirou. Solicite um novo código.'
            );
          } else {
            Alert.alert('Erro', errorData.error || 'Erro na validação');
          }
        } else {
          Alert.alert('Erro', errorData.error || 'Erro ao validar código');
        }
      } else {
        Alert.alert('Erro', 'Falha na conexão com o servidor');
      }
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <Text>Insira o código de 6 dígitos enviado para {email}</Text>
      
      <CodeField
        cellCount={6}
        value={code}
        onChangeText={setCode}
        renderCell={renderCell} 
        onSubmitEditing={handleVerify}
      />
    </View>
  );
}