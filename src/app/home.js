import React, { useState, useEffect } from 'react';
import {
  View, Text, Alert, TextInput, TouchableOpacity, FlatList,
  StyleSheet, Image, Modal, KeyboardAvoidingView, Platform
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialIcons, FontAwesome } from '@expo/vector-icons';
import api from '../services/api.js';

export default function HomePage() {
  const router = useRouter();
  const [busca, setBusca] = useState('');
  const [mostrarModal, setMostrarModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [categorias, setCategorias] = useState([]);
  const [livros, setLivros] = useState([]);
  const [categoriaSelecionada, setCategoriaSelecionada] = useState('');

  const handleCadastro = () => router.push('/cadastroLivro');
  const handlePerfil = () => router.push('/perfil');
  const handleHome = () => router.push('/home');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [categoriasResponse, livrosResponse] = await Promise.all([
          api.get('/categorias'),
          api.get('/livros')
        ]);
        setCategorias(categoriasResponse.data.data);
        setLivros(livrosResponse.data.books);
      } catch (error) {
        if (error.response?.status === 401) {
          Alert.alert('Sessão expirada', 'Por favor, faça login novamente');
          await AsyncStorage.removeItem('@auth_token');
          router.replace('/login');
        } else {
          Alert.alert('Erro', 'Falha ao carregar dados');
        }
        console.error('Erro ao buscar dados:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const livrosFiltrados = livros.filter((livro) => {
    const buscaLower = busca.toLowerCase();
    const correspondeBusca =
      livro.titulo.toLowerCase().includes(buscaLower) ||
      livro.autor.toLowerCase().includes(buscaLower);

    const correspondeCategoria =
      categoriaSelecionada === '' ||
      (livro.categorias &&
        livro.categorias.some(cat => cat.nome === categoriaSelecionada));

    return correspondeBusca && correspondeCategoria;
  });

  const renderLivro = ({ item }) => (
    <TouchableOpacity
      style={styles.livroItem}
      onPress={() =>
        router.push({
          pathname: '/Book',
          params: {
            livroId: item.id,
            livroData: JSON.stringify(item),
          },
        })
      }
    >
      {item.imagem?.url? (
        <Image
          source={{ uri: item.imagem?.url }}
          style={styles.livroImagem}
          onError={(e) => console.log('Erro ao carregar:', e.nativeEvent.error)}
          resizeMode="contain"
        />
      ) : (
        <View style={styles.livroIconContainer}>
          <FontAwesome name="book" size={40} color="#6A006A" />
        </View>
      )}

      <View style={styles.livroInfo}>
        <Text style={styles.livroNome}>{item.titulo}</Text>
        <Text style={styles.livroAutor}>{item.autor}</Text>
        <Text style={styles.livroPreco}>R$ {item.preco.toFixed(2)}</Text>
        {item.categorias && (
          <Text style={styles.livroCategoria}>
            {item.categorias.map(c => c.nome).join(', ')}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.topBar}>
        <Text style={styles.header}>LiberSale</Text>
      </View>

      <View style={styles.innerContainer}>
    
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

        <FlatList
          data={livrosFiltrados}
          renderItem={renderLivro}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.livroList}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            !loading && (
              <Text style={{ textAlign: 'center', color: '#fff', marginTop: 20 }}>
                Nenhum livro encontrado.
              </Text>
            )
          }
        />
      </View>

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
                key={cat.id}
                onPress={() => {
                  setCategoriaSelecionada(cat.nome);
                  setMostrarModal(false);
                }}
                style={[
                  styles.modalItem,
                  categoriaSelecionada === cat.nome && { backgroundColor: '#EEE' },
                ]}
              >
                <Text
                  style={{
                    fontWeight: categoriaSelecionada === cat.nome ? 'bold' : 'normal',
                    color: categoriaSelecionada === cat.nome ? '#6A006A' : '#000',
                  }}
                >
                  {cat.nome}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>

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
    resizeMode: 'cover',
    backgroundColor: '#F0E6FF'
  },
  livroIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 6,
    marginRight: 12,
    backgroundColor: '#F0E6FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  livroInfo: {
    flex: 1,
  },
  livroNome: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  livroAutor: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  livroPreco: {
    fontSize: 14,
    color: '#6A006A',
    fontWeight: 'bold',
    marginTop: 4,
  },
  livroCategoria: {
    fontSize: 12,
    color: '#888',
    marginTop: 4,
    fontStyle: 'italic',
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