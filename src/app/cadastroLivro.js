import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, Image } from 'react-native';
import { useRouter } from 'expo-router';
// import ModalDropdown from 'react-native-modal-dropdown';
import DropDownPicker from 'react-native-dropdown-picker';
import { Ionicons, MaterialIcons, Entypo } from '@expo/vector-icons';
import api from '../services/api.js';
import * as ImagePicker from 'expo-image-picker';

export default function CadastroLivro() {
  const [titulo, setTitulo] = useState('');
  const [autor, setAutor] = useState('');
  const [preco, setPreco] = useState('');
  const [estado, setEstado] = useState('');
  const [descricao, setDescricao] = useState('');
  const [categorias, setCategorias] = useState([]); // Array vazio
  const [loading, setLoading] = useState(false);
  const [openEstado, setOpenEstado] = useState(false);
  const [openCategoria, setOpenCategoria] = useState(false);
  const [imagem, setImagem] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const router = useRouter();

  const estadosLivro = ['Novo', 'Usado - Bom', 'Usado - Regular', 'Usado - Ruim'];

  const selecionarImagem = async () => {
    // Solicita permissões
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permissão necessária', 'Precisamos acessar sua galeria para selecionar imagens');
      return;
    }
  
    const resultado = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });
  
    if (!resultado.canceled && resultado.assets) {
      setImagem(resultado.assets[0]);
    }
  };

  useEffect(() => {
    const fetchCategorias = async () => {
      setLoading(true);
      try {
        const response = await api.get('/categorias');
        const receivedData = response.data?.data || response.data || [];
        
        // Garante que temos um array de categorias com id e nome
        const safeCategories = receivedData.map(item => ({
          id: String(item.id), // Garante que id é string
          nome: String(item.nome || item.title || 'Sem nome')
        }));
        
        setCategorias(safeCategories);
      } catch (error) {
        console.error('Erro ao buscar categorias:', error);
        if (error.response?.status === 401) {
          Alert.alert('Sessão expirada', 'Por favor, faça login novamente');
          await AsyncStorage.removeItem('@auth_token');
          router.replace('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchCategorias();
  }, []);

  const handleCadastrarLivro = async () => {
    try {
      if (!imagem) {
        Alert.alert('Atenção', 'Selecione uma imagem para o livro');
        return;
      }
  
      const formData = new FormData();
      formData.append('titulo', titulo);
      formData.append('autor', autor);
      formData.append('preco', preco);
      formData.append('estado', estado);
      formData.append('descricao', descricao);
      formData.append('categoria_id', selectedCategoryName);
  
      // Prepara o arquivo para upload
      const fileExtension = imagem.uri.split('.').pop();
      const fileName = `livro_${Date.now()}.${fileExtension}`;
  
      formData.append('imagem', {
        uri: imagem.uri,
        name: fileName,
        type: `image/${fileExtension}`,
      });
  
      const response = await api.post('/livros/cadastrar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const progress = Math.round(
            (progressEvent.loaded / progressEvent.total) * 100
          );
          setUploadProgress(progress);
        },
      });
  
      if (response.data && response.data.message) {
        Alert.alert('Sucesso', response.data.message);
        router.push('/home');
      }
  
    } catch (error) {
      console.error('Erro ao cadastrar livro:', error);
      
      // Tratamento para erros de validação (400)
      if (error.response?.status === 400 && error.response?.data?.errors) {
        const fieldNames = {
          titulo: 'Título',
          autor: 'Autor',
          preco: 'Preço',
          estado: 'Estado do Livro',
          categoria_id: 'Categoria',
          descricao: 'Descrição'
        };
  
        // Mapeia os erros para um formato mais amigável
        const errorMessages = error.response.data.errors.map(err => {
          const fieldName = fieldNames[err.path] || err.path;
          return ` ${err.msg}`;
          //` ${fieldName}:
        });
  
        Alert.alert(
          'Erros no formulário',
          errorMessages.join('\n\n')
        );
      }
      //tratamento para categoria não encontrada
      else if (error.response?.status === 400 && error.response?.data?.categorias_disponiveis) {
        Alert.alert(
          'Categoria não encontrada',
          `${error.response.data.message}\n\nCategorias disponíveis:\n${error.response.data.categorias_disponiveis.join('\n')}`
        );
      }
      //tratamento para erros de autenticação (401)
      else if (error.response?.status === 401) {
        Alert.alert('Erro de autenticação', 'Sessão expirada. Faça login novamente.');
        await AsyncStorage.removeItem('@auth_token');
        router.push('/login');
      }
      // outros erros do servidor
      else if (error.response?.data?.message) {
        Alert.alert('Erro', error.response.data.message);
      }
      // erros de conexão
      else {
        Alert.alert('Erro', 'Não foi possível conectar ao servidor. Verifique sua conexão.');
      }
    }
  };

  const handleVoltarHome = () => router.push('/home');
  const handleIrParaPerfil = () => router.push('/perfil');

  const [selectedCategoryName, setSelectedCategoryName] = useState('');

  return (
    <ScrollView>
      <View style={styles.container}>
        {/* Barra superior */}
        <View style={styles.topBar}>
          <Text style={styles.logo}>LiberSale</Text>
        </View>

        <View style={styles.innerContainer}>
          <Text style={styles.header}>Cadastro de Livro</Text>

          {/* Campo para upload de imagem */}
          <TouchableOpacity 
            style={styles.imageButton}
            onPress={selecionarImagem}
          >
            <Text style={styles.buttonText}>
              {imagem ? 'Imagem Selecionada' : 'Selecionar Imagem'}
            </Text>
          </TouchableOpacity>

          {imagem && (
            <Image 
              source={{ uri: imagem.uri }} 
              style={styles.imagePreview}
            />
          )}

          {uploadProgress > 0 && uploadProgress < 100 && (
            <View style={styles.progressContainer}>
              <Text style={styles.progressText}>
                Enviando: {uploadProgress}%
              </Text>
              <View style={styles.progressBar}>
                <View 
                  style={[
                    styles.progressFill, 
                    { width: `${uploadProgress}%` }
                  ]} 
                />
              </View>
            </View>
          )}

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

          <DropDownPicker
            open={openEstado}
            value={estado}
            items={estadosLivro.map(estado => ({label: estado, value: estado}))}
            setOpen={setOpenEstado}
            setValue={setEstado}
            placeholder="Selecione o estado do livro"
            style={styles.dropdown}
            dropDownContainerStyle={[styles.dropdownList, {
              position: 'relative',
              maxHeight: 200,
              zIndex: openEstado ? 1000 : 1,
            }]}
            textStyle={styles.dropdownText}
            listMode="SCROLLVIEW"
            scrollViewProps={{
              nestedScrollEnabled: true
            }}
          />

          <DropDownPicker
            open={openCategoria}
            value={selectedCategoryName}
            items={categorias.map(cat => ({label: cat.nome, value: cat.nome}))}
            setOpen={setOpenCategoria}
            setValue={setSelectedCategoryName}
            placeholder="Selecione a categoria"
            style={styles.dropdown}
            dropDownContainerStyle={[styles.dropdownList, {
              position: 'relative',
              maxHeight: 200,
              zIndex: openCategoria ? 1000 : 1,
            }]}
            textStyle={styles.dropdownText}
            listMode="SCROLLVIEW"
            scrollViewProps={{
              nestedScrollEnabled: true
            }}
            disabled={loading}
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
    </ScrollView>
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
  dropdown: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    backgroundColor: '#fff',
    zIndex: 1, 
  },
  dropdownList: {
    width: '100%',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    marginTop: 5,
    zIndex: 10, 
  },
  imageButton: {
    backgroundColor: '#4CAF50',
    padding: 14,
    borderRadius: 8,
    marginBottom: 16,
    width: '100%',
  },
  imagePreview: {
    width: 100,
    height: 100,
    borderRadius: 8,
    marginBottom: 16,
    alignSelf: 'center',
  },
  progressContainer: {
    width: '100%',
    marginBottom: 16,
  },
  progressText: {
    color: '#fff',
    textAlign: 'center',
    marginBottom: 4,
  },
  progressBar: {
    height: 10,
    backgroundColor: '#e0e0e0',
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
  },
});