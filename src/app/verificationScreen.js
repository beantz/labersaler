import { useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { View, Text, Alert } from 'react-native';
import { CodeField } from 'react-native-confirmation-code-field';

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
      const response = await fetch('http://192.168.0.104:3000/redefinir-senha', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, token: code })
      });

      const data = await response.json();
      if (response.ok) {
        // Navegar para tela de nova senha
        navigation.navigate('ResetPassword', { email });
      } else {
        Alert.alert('Erro', data.error || 'Código inválido');
      }
    } catch (error) {

      Alert.alert('Erro', 'Falha na conexão');
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