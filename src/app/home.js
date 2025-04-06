import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Image,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';

const livrosMock = [
  { id: '1', nome: 'Dom Casmurro', autor: 'Machado de Assis', preco: 'R$ 20,00', categoria: 'Romance', imagem: 'https://via.placeholder.com/80' },
  { id: '2', nome: 'Harry Potter', autor: 'J.K. Rowling', preco: 'R$ 35,00', categoria: 'Fantasia', imagem: 'https://via.placeholder.com/80' },
  { id: '3', nome: 'O Hobbit', autor: 'Tolkien', preco: 'R$ 30,00', categoria: 'Fantasia', imagem: 'https://via.placeholder.com/80' },
];

const categorias = [
  'Fantasia',
  'Romance',
  'Terror /Suspense/Mistério',
  'Ficção Científica',
  'Histórico',
  'Autobiografias e Biografias',
  'Autoajuda',
  'Literatura Infantil',
];

export default function HomePage() {
  const router = useRouter();
  const [busca, setBusca] = useState('');
  const [categoriaSelecionada, setCategoriaSelecionada] = useState('');
  const [mostrarModal, setMostrarModal] = useState(false);

  const handleCadastro = () => router.push('/createLivro');
  const handlePerfil = () => router.push('/perfil');
  const handleHome = () => router.push('/home');

  const livrosFiltrados = livrosMock.filter((livro) => {
    const buscaLower = busca.toLowerCase();
    const correspondeBusca =
      livro.nome.toLowerCase().includes(buscaLower) ||
      livro.autor.toLowerCase().includes(buscaLower);

    const correspondeCategoria =
      categoriaSelecionada === '' || livro.categoria === categoriaSelecionada;

    return correspondeBusca && correspondeCategoria;
  });

  const renderLivro = ({ item }) => (
    <View style={styles.livroItem}>
      <Image source={{ uri: item.imagem }} style={styles.livroImagem} />
      <View>
        <Text style={styles.livroNome}>{item.nome}</Text>
        <Text style={styles.livroPreco}>{item.preco}</Text>
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Barra Superior */}
      <View style={styles.topBar}>
        <Text style={styles.header}>LiberSale</Text>
      </View>

      <View style={styles.innerContainer}>
        {/* Campo de busca e botões */}
        <View style={styles.searchRow}>
          <TextInput
            style={styles.input}
            placeholder="Buscar por nome ou autor"
            placeholderTextColor="#888"
            value={busca}
            onChangeText={setBusca}
          />
          <TouchableOpacity
            onPress={() => setMostrarModal(true)}
            style={styles.categoriaButton}
          >
            <Text style={styles.categoriaButtonText}>Categorias</Text>
          </TouchableOpacity>
          {categoriaSelecionada !== '' && (
            <TouchableOpacity
              onPress={() => setCategoriaSelecionada('')}
              style={styles.limparFiltroButton}
            >
              <Text style={styles.limparFiltroText}>Limpar</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Lista de livros */}
        <FlatList
          data={livrosFiltrados}
          renderItem={renderLivro}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.livroList}
          showsVerticalScrollIndicator={false}
        />
      </View>

      {/* Modal de categorias */}
      <Modal
        visible={mostrarModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setMostrarModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Selecione uma categoria</Text>
            {categorias.map((cat) => (
              <TouchableOpacity
                key={cat}
                onPress={() => {
                  setCategoriaSelecionada(cat);
                  setMostrarModal(false);
                }}
                style={styles.modalItem}
              >
                <Text>{cat}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>

      {/* Barra Inferior */}
      <View style={styles.bottomBar}>
        <TouchableOpacity onPress={handleHome} style={styles.iconContainer}>
          <Ionicons name="home-outline" size={24} color="#fff" />
          <Text style={styles.iconText}>Início</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={handlePerfil} style={styles.iconContainer}>
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
  topBar: {
    height: 60,
    backgroundColor: '#6A006A',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
  },
  header: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#fff',
  },
  innerContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  input: {
    flex: 1,
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: '#FFF',
    color: '#000',
  },
  categoriaButton: {
    backgroundColor: 'blue',
    paddingHorizontal: 10,
    paddingVertical: 12,
    borderRadius: 8,
    marginLeft: 6,
  },
  categoriaButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  limparFiltroButton: {
    backgroundColor: 'blue',
    paddingHorizontal: 10,
    paddingVertical: 12,
    borderRadius: 8,
    marginLeft: 6,
  },
  limparFiltroText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  livroList: {
    paddingBottom: 100,
  },
  livroItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  livroImagem: {
    width: 60,
    height: 60,
    borderRadius: 6,
    marginRight: 12,
  },
  livroNome: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  livroPreco: {
    fontSize: 14,
    color: '#666',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFF',
    padding: 20,
    borderRadius: 10,
    width: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalItem: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: '#ccc',
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