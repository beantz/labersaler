// app/perfil.js
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, Alert, ActivityIndicator } from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api.js';
import jwtDecode from 'jwt-decode';

export default function Perfil() {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [contato, setContato] = useState('');
  const [loading, setLoading] = useState(true);

  const [editando, setEditando] = useState(false);
  const [novoNome, setNovoNome] = useState(nome);
  const [novoEmail, setNovoEmail] = useState(email);
  const [novoContato, setNovoContato] = useState(contato);

  const router = useRouter();

  //buscar dados de usuario
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Obter o ID do usuário do token ou AsyncStorage
        const token = await AsyncStorage.getItem('@auth_token');
        console.log('Token:', token);
        if (!token) {
          router.push('/login');
          return;
        }
        const decoded = jwtDecode(token);  // Você precisará instalar e importar jwt-decode
        const userId = decoded.id;

        const response = await api.get(`/users/${userId}`);
        const userData = response.data;

        setNome(userData.nome || '');
        setEmail(userData.email || '');
        setContato(userData.contato?.toString() || '');
        // Inicializa também os estados de edição
        setNovoNome(userData.nome || '');
        setNovoEmail(userData.email || '');
        setNovoContato(userData.contato?.toString() || '');
        
      } catch (error) {
        console.error('Erro ao buscar dados do usuário:', error);
        if (error.response?.status === 401) {
          Alert.alert('Sessão expirada', 'Por favor, faça login novamente');
          router.push('/login');
        }
      } finally {
       setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  //salvar dados
  const handleSalvar = async () => {
    try {
      if (!novoNome.trim() || !novoEmail.trim() || !novoContato.trim()) {
        Alert.alert('Atenção', 'Por favor, preencha todos os campos');
        return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(novoEmail)) {
        Alert.alert('Atenção', 'Por favor, insira um e-mail válido');
        return;
      }

      const token = await AsyncStorage.getItem('@auth_token');
      const decoded = jwtDecode(token);
      const userId = decoded.id;

      await api.put(`/users/${userId}`, {
        nome: novoNome,
        email: novoEmail,
        contato: novoContato
      });

      setNome(novoNome);
      setEmail(novoEmail);
      setContato(novoContato);
      setEditando(false);
      
      Alert.alert('Sucesso', 'Dados atualizados com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      Alert.alert('Erro', 'Falha ao atualizar os dados');
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#FFF" />
      </View>
    );
  }

  const handleLogout = async () => {
    Alert.alert(
      'Sair',
      'Deseja realmente sair da sua conta?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Sair', onPress: async () => {
          try {

            // chama API para invalidar token no back
            let response = await api.post('/logout').catch(() => {});

            // limpa front-end
            await AsyncStorage.removeItem('@auth_token');
            delete api.defaults.headers.common['Authorization'];

            let message = response.data.message;
          
            Alert.alert(message);
            router.push('/login');
            
            
          } catch (error) {
            // Se foi um 401 por logout já realizado, trata como sucesso
            if (error.response?.status === 401 && 
              error.response?.data?.message?.includes('logout realizado')) {
              await AsyncStorage.removeItem('@auth_token');
              delete api.defaults.headers.common['Authorization'];
              router.push('/login');

            } else {
              console.error('Erro no logout:', error);
            }
          }

        }}
      ]
    );

  };

  const handleAlterar = () => {
    setEditando(true);
  };

  const handleCancelar = () => {
    setEditando(false);
    setNovoNome(nome);
    setNovoEmail(email);
    setNovoContato(contato);
  };

  // const handleSalvar = () => {
  //   setNome(novoNome);
  //   setEmail(novoEmail);
  //   setContato(novoContato);
  //   setEditando(false);
  // };

  const handleHome = () => router.push('/home');
  const handleCadastro = () => router.push('/cadastroLivro');

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.innerContainer}>
        <Text style={styles.header}>Perfil do Usuário</Text>

        <TextInput
          style={styles.input}
          value={editando ? novoNome : nome}
          onChangeText={setNovoNome}
          editable={editando}
          placeholder="Nome"
        />
        <TextInput
          style={styles.input}
          value={editando ? novoEmail : email}
          onChangeText={setNovoEmail}
          editable={editando}
          placeholder="E-mail"
          keyboardType="email-address"
        />
        <TextInput
          style={styles.input}
          value={editando ? novoContato : contato}
          onChangeText={setNovoContato}
          editable={editando}
          placeholder="Contato"
          keyboardType="phone-pad"
        />

        {!editando ? (
          <TouchableOpacity style={styles.button} onPress={handleAlterar}>
            <Text style={styles.buttonText}>Alterar Dados</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.editButtons}>
            <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={handleCancelar}>
              <Text style={styles.buttonText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={handleSalvar}>
              <Text style={styles.buttonText}>Salvar</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Barra Inferior */}
      <View style={styles.bottomBar}>
        <TouchableOpacity onPress={handleHome} style={styles.iconContainer}>
          <Ionicons name="home-outline" size={24} color="#fff" />
          <Text style={styles.iconText}>Início</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.iconContainer}>
          <Ionicons name="person-circle-outline" size={24} color="#fff" />
          <Text style={styles.iconText}>Perfil</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleCadastro} style={styles.iconContainer}>
          <MaterialIcons name="add-box" size={24} color="#fff" />
          <Text style={styles.iconText}>Vender Livro</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={handleLogout} 
          style={styles.iconContainer}
        >
          <MaterialIcons name="exit-to-app" size={24} color="#fff" />
          <Text style={styles.iconText}>Sair</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#8B008B',
  },
  innerContainer: {
    flex: 1,
    alignItems: 'center',
    padding: 20,
    justifyContent: 'center',
  },
  header: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 30,
    textAlign: 'center',
  },
  input: {
    width: '100%',
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
    backgroundColor: '#FFF',
    color: '#000',
  },
  button: {
    backgroundColor: 'blue',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  cancelButton: {
    backgroundColor: '#999',
    marginRight: 10,
  },
  buttonText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  editButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  bottomBar: {
    height: 60,
    backgroundColor: '#6A006A',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    borderTopWidth: 1,
    borderColor: '#440044',
  },
  iconContainer: {
    alignItems: 'center',
  },
  iconText: {
    fontSize: 12,
    color: '#fff',
    marginTop: 2,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#8B008B',
  },
});