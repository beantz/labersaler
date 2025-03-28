// app/cadastroLivro.js
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router'; // Usando o useRouter do expo-router
import ModalDropdown from 'react-native-modal-dropdown';

export default function CadastroLivro() {
  const [titulo, setTitulo] = useState('');
  const [autor, setAutor] = useState('');
  const [preco, setPreco] = useState('');
  // const [categoria, setCategoria] = useState('');
  const router = useRouter(); // Usando o hook useRouter

  // Função para voltar para a Home
  const handleVoltarHome = () => {

    router.push('/home'); // Navega para a página Home

  };

  // const [selectedCategory, setSelectedCategory] = useState('');

  let ip = "192.168.0.104";

  const handleCadastrarLvro = async () => {

    try {
      let response = await fetch(`http://${ip}:3000/livros/cadastrar`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          titulo: titulo,
          autor: autor,
          preco: preco,
          // categoria: categoria,
        }),
      });

      //resgatando os erros retornados no controller caso tiver algum
      if(response.ok) {

        //retornar para perfil de usuario
        router.push('/home');

      } else {
        let data = await response.json();

        //resgatando os erros retornados no controller caso tiver algum
        if (data.errors) {
          // Junta todas as mensagens de erro em uma string
          const errorMessages = data.errors.map(err => err.msg).join('\n');
          alert(errorMessages);
        } 
      }
    } catch (error) {
      alert('Ocorreu um erro ao tentar cadastrar o livro');
    }

  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Cadastro de Livro</Text>

      <TextInput
        placeholder="Título do Livro"
        style={styles.input}
        onChangeText={setTitulo}
      />
      <TextInput
        placeholder="Autor do Livro"
        style={styles.input}
        onChangeText={setAutor}
      />

      <TextInput
        placeholder="Preço"
        keyboardType="numeric"
        style={styles.input}
        onChangeText={setPreco}
      />

      {/*input do tipo select */}

      <TouchableOpacity style={styles.button} onPress={handleCadastrarLvro}>
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
  }
});