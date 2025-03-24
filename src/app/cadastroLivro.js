// app/cadastroLivro.js
import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router'; // Usando o useRouter do expo-router

export default function CadastroLivro() {
  const router = useRouter(); // Usando o hook useRouter

  // Função para voltar para a Home
  const handleVoltarHome = () => {
    router.push('/home'); // Navega para a página Home
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Cadastro de Livro</Text>

      <TextInput
        placeholder="Título do Livro"
        style={styles.input}
      />
      <TextInput
        placeholder="Autor do Livro"
        style={styles.input}
      />
      <TextInput
        placeholder="Preço"
        keyboardType="numeric"
        style={styles.input}
      />

      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>Cadastrar Livro</Text>
      </TouchableOpacity>

      {/* Botão para voltar para a Home */}
      <TouchableOpacity onPress={handleVoltarHome} style={styles.button}>
        <Text style={styles.buttonText}>Voltar para Home</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f8f9fa',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 40,
    color: '#333',
  },
  button: {
    backgroundColor: 'blue',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    width: '80%',
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  input: {
    borderWidth: 1,
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    width: '80%',
    backgroundColor: 'white',
    borderColor: '#ccc',
  },
});