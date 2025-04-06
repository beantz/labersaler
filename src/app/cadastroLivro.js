import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import ModalDropdown from 'react-native-modal-dropdown';
import { Ionicons, MaterialIcons, Entypo } from '@expo/vector-icons';

export default function CadastroLivro() {
  const [titulo, setTitulo] = useState('');
  const [autor, setAutor] = useState('');
  const [preco, setPreco] = useState('');
  const [estado, setEstado] = useState('');
  const [descricao, setDescricao] = useState('');
  const [categoria, setCategoria] = useState('');

  const router = useRouter();
  const ip = "192.168.0.104";

  const estadosLivro = ['Novo', 'Usado - Bom', 'Usado - Regular', 'Usado - Ruim'];
  const categorias = [
    'Fantasia',
    'Romance',
    'Terror / Suspense / Mistério',
    'Ficção Científica',
    'Histórico',
    'Autobiografias e Biografias',
    'Autoajuda',
    'Literatura Infantil'
  ];

  const handleCadastrarLivro = async () => {
    try {
      let response = await fetch(`http://${ip}:3000/livros/cadastrar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          titulo,
          autor,
          preco,
          estado,
          descricao,
          categoria,
        }),
      });

      if (response.ok) {
        router.push('/home');
      } else {
        let data = await response.json();
        if (data.errors) {
          const errorMessages = data.errors.map(err => err.msg).join('\n');
          alert(errorMessages);
        }
      }
    } catch (error) {
      alert('Erro ao cadastrar o livro.');
    }
  };

  const handleVoltarHome = () => router.push('/home');
  const handleIrParaPerfil = () => router.push('/perfil');

  return (
    <View style={styles.container}>
      {/* Barra superior */}
      <View style={styles.topBar}>
        <Text style={styles.logo}>LiberSale</Text>
      </View>

      <View style={styles.innerContainer}>
        <Text style={styles.header}>Cadastro de Livro</Text>

        <TextInput
          placeholder="Título do Livro"
          style={styles.input}
          onChangeText={setTitulo}
          value={titulo}
          placeholderTextColor="#999"
        />
        <TextInput
          placeholder="Autor do Livro"
          style={styles.input}
          onChangeText={setAutor}
          value={autor}
          placeholderTextColor="#999"
        />
        <TextInput
          placeholder="Preço"
          keyboardType="numeric"
          style={styles.input}
          onChangeText={setPreco}
          value={preco}
          placeholderTextColor="#999"
        />
        <TextInput
          placeholder="Descrição"
          style={[styles.input, { height: 80 }]}
          onChangeText={setDescricao}
          value={descricao}
          multiline
          placeholderTextColor="#999"
        />

        <ModalDropdown
          options={estadosLivro}
          defaultValue="Selecione o estado do livro"
          style={styles.dropdown}
          textStyle={styles.dropdownText}
          dropdownStyle={styles.dropdownList}
          onSelect={(index, value) => setEstado(value)}
        />

        <ModalDropdown
          options={categorias}
          defaultValue="Selecione a categoria"
          style={styles.dropdown}
          textStyle={styles.dropdownText}
          dropdownStyle={styles.dropdownList}
          onSelect={(index, value) => setCategoria(value)}
        />

        <TouchableOpacity style={styles.button} onPress={handleCadastrarLivro}>
          <Text style={styles.buttonText}>Cadastrar Livro</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleVoltarHome} style={styles.buttonSecundario}>
          <Text style={styles.buttonText}>Voltar para Home</Text>
        </TouchableOpacity>
      </View>

      {/* Barra inferior */}
      <View style={styles.bottomBar}>
        <TouchableOpacity onPress={handleVoltarHome} style={styles.iconContainer}>
          <Entypo name="home" size={24} color="#fff" />
          <Text style={styles.iconText}>Início</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleIrParaPerfil} style={styles.iconContainer}>
          <Ionicons name="person-circle-outline" size={24} color="#fff" />
          <Text style={styles.iconText}>Perfil</Text>
        </TouchableOpacity>

        <TouchableOpacity disabled style={styles.iconContainer}>
          <MaterialIcons name="add-box" size={24} color="#ccc" />
          <Text style={[styles.iconText, { color: '#ccc' }]}>Vender Livro</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#8B008B' },
  topBar: {
    height: 60,
    backgroundColor: '#6A006A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: { fontSize: 26, fontWeight: 'bold', color: '#f5f5f5' },
  innerContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
    alignItems: 'center',
  },
  header: {
    fontSize: 22,
    color: '#fff',
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    width: '100%',
    borderWidth: 1,
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    backgroundColor: '#fff',
    borderColor: '#ccc',
    color: '#000',
  },
  dropdown: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    backgroundColor: '#fff',
  },
  dropdownText: {
    color: '#000',
    fontSize: 16,
  },
  dropdownList: {
    width: '80%',
  },
  button: {
    backgroundColor: 'blue',
    padding: 14,
    borderRadius: 8,
    marginTop: 10,
    width: '100%',
  },
  buttonSecundario: {
    backgroundColor: '#FF6347',
    padding: 14,
    borderRadius: 8,
    marginTop: 10,
    width: '100%',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
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