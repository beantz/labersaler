// screens/RedefinirSenha.js
import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, Alert, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { FontAwesome, Feather } from '@expo/vector-icons';
import api from '../services/api.js';

export default function RedefinirSenha() {
  const [novaSenha, setNovaSenha] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
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
      if (!(error.response?.status === 400)) {
        console.error('Erro na redefinição:', error);
      }
  
      if (error.response) {
        const errorData = error.response.data || {};
        
        if (error.response.status === 400 && errorData.errors) {
          const errorMessages = errorData.errors.map(err => 
            ` ${err.message}`
          ).join('\n');
          
          Alert.alert(
            'Erro no formulário', 
            errorMessages
          );
        
        
        } else if (error.response.status === 404) {
          Alert.alert(
            'Erro', 
            'Email não cadastrado no sistema'
          );
        
      
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
    <View style={styles.container}>
      
      <FontAwesome name="lock" size={50} color="white" style={styles.lockIcon} />

      <TextInput
        style={styles.input}
        placeholder="Nova senha"
        placeholderTextColor="#666"
        value={novaSenha}
        onChangeText={setNovaSenha}
        secureTextEntry={!isPasswordVisible}
      />

      <TouchableOpacity
        style={styles.togglePassword}
        onPress={() => setIsPasswordVisible(!isPasswordVisible)}
      >
        <Feather
          name={isPasswordVisible ? 'eye-off' : 'eye'}
          size={18}
          color="#fff"
          style={{ marginRight: 5 }}
        />
        <Text style={styles.togglePasswordText}>
          {isPasswordVisible ? 'Ocultar senha' : 'Mostrar senha'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={handleRedefinirSenha}>
        <Text style={styles.buttonText}>Redefinir Senha</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#8B008B',
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  lockIcon: {
    position: 'absolute',
    top: 20,
    right: 20,
  },
  input: {
    height: 45,
    width: '100%',
    borderWidth: 1,
    borderColor: '#ccc',
    backgroundColor: '#fff',
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 5,
    color: '#000',
  },
  togglePassword: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
    marginBottom: 25,
    marginTop: 5,
  },
  togglePasswordText: {
    color: '#fff',
    textDecorationLine: 'underline',
  },
  button: {
    backgroundColor: 'blue',
    padding: 15,
    borderRadius: 5,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
