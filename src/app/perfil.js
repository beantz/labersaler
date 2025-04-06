// app/perfil.js
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function Perfil() {
  const [nome, setNome] = useState('João da Silva');
  const [email, setEmail] = useState('joao@email.com');
  const [contato, setContato] = useState('(11) 98765-4321');
  const [editando, setEditando] = useState(false);

  const [novoNome, setNovoNome] = useState(nome);
  const [novoEmail, setNovoEmail] = useState(email);
  const [novoContato, setNovoContato] = useState(contato);

  const router = useRouter();

  const handleAlterar = () => {
    setEditando(true);
  };

  const handleCancelar = () => {
    setEditando(false);
    setNovoNome(nome);
    setNovoEmail(email);
    setNovoContato(contato);
  };

  const handleSalvar = () => {
    setNome(novoNome);
    setEmail(novoEmail);
    setContato(novoContato);
    setEditando(false);
  };

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
});