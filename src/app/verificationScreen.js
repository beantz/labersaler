import { useState, useEffect } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { View, Text, Alert, StyleSheet } from 'react-native';
import { CodeField } from 'react-native-confirmation-code-field';
import { FontAwesome } from '@expo/vector-icons'; 
import api from '../services/api.js';

export default function VerificationScreen({ route }) {
  const [code, setCode] = useState('');
  const { email } =  useLocalSearchParams(); 
  const router = useRouter();
  const [timer, setTimer] = useState(10 * 60);

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
        color: '#fff',
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
  
      const errorData = response.data || {};
      Alert.alert('Erro', errorData.error || 'Erro ao validar código');
  
    } catch (error) {
      // Não fazemos console.log para erros silenciosos
      if (!error.silent) {
        console.error('Erro crítico na verificação:', error);
      }
      
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

  // Função para atualizar o contador
  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev === 0) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const minutes = Math.floor(timer / 60);
  const seconds = timer % 60;

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Insira o código de 6 dígitos enviado para {email}</Text>

      <CodeField
        cellCount={6}
        value={code}
        onChangeText={setCode}
        renderCell={renderCell} 
        onSubmitEditing={handleVerify}
      />

      {/* Texto de contagem com a mensagem */}
      <View style={styles.timerContainer}>
        <FontAwesome name="clock-o" size={24} color="white" style={styles.icon} />
        <Text style={styles.timerText}>
          O código enviado expira em: {minutes < 10 ? `0${minutes}` : minutes}:{seconds < 10 ? `0${seconds}` : seconds}
        </Text>
      </View>

      {/* Ícone de email no canto superior direito */}
      <FontAwesome
        name="envelope"
        size={30}
        color="white"
        style={styles.emailIcon}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#8B008B', // Cor roxa igual a tela inicial
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 18,
    color: '#fff',
    marginBottom: 20,
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
  },
  icon: {
    marginRight: 10,
  },
  timerText: {
    fontSize: 18,
    color: '#fff',
  },
  emailIcon: {
    position: 'absolute',
    top: 20,
    right: 20,
  },
});