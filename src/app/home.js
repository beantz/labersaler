// app/home.js
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router'; // Usando o useRouter

export default function HomePage() {
  const router = useRouter(); // Usando o hook useRouter

  // Função para navegar para a tela de cadastro de livro
  const handleCadastrarLivroPress = () => {
    router.push('/cadastroLivro'); // Navega para a página de cadastro de livro
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Bem-vindo ao Laber-Sale!</Text>

      <TouchableOpacity
        onPress={handleCadastrarLivroPress}
        style={styles.button}
      >
        <Text style={styles.buttonText}>Cadastrar Livros para Venda</Text>
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
});