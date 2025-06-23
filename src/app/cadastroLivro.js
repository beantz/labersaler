// CadastroLivro.jsx
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, Image } from 'react-native';
import { useRouter } from 'expo-router';
import DropDownPicker from 'react-native-dropdown-picker';
import { Ionicons, MaterialIcons, Entypo } from '@expo/vector-icons';
import api from '../services/api.js';
import * as ImagePicker from 'expo-image-picker';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

export default function CadastroLivro() {
  const [titulo, setTitulo] = useState('');
  const [autor, setAutor] = useState('');
  const [preco, setPreco] = useState('');
  const [estado, setEstado] = useState('');
  const [descricao, setDescricao] = useState('');
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openEstado, setOpenEstado] = useState(false);
  const [openCategoria, setOpenCategoria] = useState(false);
  const [imagem, setImagem] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedCategoryName, setSelectedCategoryName] = useState('');

  const router = useRouter();
  const estadosLivro = ['Novo', 'Usado - Bom', 'Usado - Regular', 'Usado - Ruim'];

  const selecionarImagem = async () => {
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
        const safeCategories = receivedData.map(item => ({
          id: String(item.id),
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
    if (!imagem || !imagem.uri) {
      Alert.alert('Atenção', 'Selecione uma imagem para o livro');
      return;
    }

    if (!titulo || !autor || !preco || !estado || !selectedCategoryName || !imagem) {
      Alert.alert('Atenção', 'Preencha todos os campos obrigatórios');
      return;
    }

    const formData = new FormData();
    
    formData.append('titulo', titulo);
    formData.append('autor', autor);
    formData.append('preco', preco);
    formData.append('estado', estado);
    formData.append('descricao', descricao);
    formData.append('categoria_id', selectedCategoryName);

    let localUri = imagem.uri;
    let filename = localUri.split('/').pop();
    
    let match = /\.(\w+)$/.exec(filename);
    let type = match ? `image/${match[1]}` : 'image';

    formData.append('imagem', {
      uri: Platform.OS === 'android' ? localUri : localUri.replace('file://', ''),
      name: filename || `photo_${Date.now()}.jpg`,
      type: type || 'image/jpeg'
    });

    const token = await SecureStore.getItemAsync('userToken');

    const response = await api.post('/livros/cadastrar', formData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'multipart/form-data', 
      },
      transformRequest: (data) => data, 
      timeout: 30000,
      onUploadProgress: (e) => {
        const progress = Math.round((e.loaded / e.total) * 100);
        setUploadProgress(progress);
      },
    });

    if (response.data?.message) {
      Alert.alert('Sucesso', response.data.message);
      router.push('/home');
    }

  } catch (error) {
    console.error('Erro completo:', error);
    console.error('Resposta do erro:', error.response?.data);
      if (error.response?.status === 400 && error.response?.data?.errors) {
        const errorMessages = error.response.data.errors.map(err => `• ${err.msg}`);
        Alert.alert('Erros no formulário', errorMessages.join('\n\n'));
      } else if (error.response?.status === 400 ) {
      
        //extraindo os nomes das categorias
        const categoriasNomes = categorias.map(cat => cat.nome);
        Alert.alert(
          'Selecione uma categoria:',
          `\n\nCategorias disponíveis:\n${categoriasNomes.join('\n')}`
        );

      } else if (error.response?.status === 401) {
        Alert.alert('Erro de autenticação', 'Sessão expirada. Faça login novamente.');
        await AsyncStorage.removeItem('@auth_token');
        router.push('/login');
      } else {
        Alert.alert('Erro', error.response?.data?.message || 'Erro desconhecido. Tente novamente.');
      }
    }
  };

  const handleVoltarHome = () => router.push('/home');
  const handleIrParaPerfil = () => router.push('/perfil');

  return (
    <ScrollView>
      <View style={styles.container}>
        <View style={styles.topBar}>
          <Text style={styles.logo}>LiberSale</Text>
        </View>

        <View style={styles.innerContainer}>
          <Text style={styles.header}>Cadastro de Livro</Text>

          <TouchableOpacity style={styles.imageButton} onPress={selecionarImagem}>
            <Text style={styles.buttonText}>
              {imagem ? 'Imagem Selecionada' : 'Selecionar Imagem'}
            </Text>
          </TouchableOpacity>

          {imagem && (
            <Image source={{ uri: imagem.uri }} style={styles.imagePreview} />
          )}

          {uploadProgress > 0 && uploadProgress < 100 && (
            <View style={styles.progressContainer}>
              <Text style={styles.progressText}>Enviando: {uploadProgress}%</Text>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${uploadProgress}%` }]} />
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

          <View style={{ zIndex: openEstado ? 2000 : 1, width: '100%' }}>
            <DropDownPicker
              open={openEstado}
              value={estado}
              items={estadosLivro.map(e => ({ label: e, value: e }))}
              setOpen={setOpenEstado}
              setValue={setEstado}
              placeholder="Selecione o estado do livro"
              style={styles.dropdown}
              dropDownContainerStyle={styles.dropdownList}
              textStyle={styles.dropdownText}
              listMode="SCROLLVIEW"
            />
          </View>

          <View style={{ zIndex: openCategoria ? 1000 : 0, width: '100%' }}>
            <DropDownPicker
              open={openCategoria}
              value={selectedCategoryName}
              items={categorias.map(cat => ({ label: cat.nome, value: cat.nome }))}
              setOpen={setOpenCategoria}
              setValue={setSelectedCategoryName}
              placeholder="Selecione a categoria"
              style={styles.dropdown}
              dropDownContainerStyle={styles.dropdownList}
              textStyle={styles.dropdownText}
              listMode="SCROLLVIEW"
              disabled={loading}
            />
          </View>

          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.button} onPress={handleCadastrarLivro}>
              <Text style={styles.buttonText}>Cadastrar</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={handleVoltarHome} style={styles.buttonSecundario}>
              <Text style={styles.buttonText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>

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
  container: { 
    flex: 1, 
    backgroundColor: '#8B008B',
    paddingBottom: 60,
  },
  topBar: {
    height: 60,
    backgroundColor: '#6A006A',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 20 : 0,
  },
  logo: { 
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: Platform.OS === 'ios' ? 10 : 0,
  },
  innerContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
    alignItems: 'center',
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 15,
    textAlign: 'center',
  },
  input: {
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
    color: '#000',
    fontSize: 14,
    marginBottom: 12,
  },
  dropdown: {
    width: '100%',
    minHeight: 40,
    backgroundColor: '#fff',
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    justifyContent: 'center',
    marginBottom: 12,
  },
  dropdownText: {
    fontSize: 14,
    color: '#000',
  },
  dropdownList: {
    backgroundColor: '#fff',
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    maxHeight: 200,
  },
  imageButton: {
    backgroundColor: 'blue',
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 8,
    width: '100%',
    marginBottom: 12,
  },
  imagePreview: {
    width: 120,
    height: 160,
    borderRadius: 8,
    resizeMode: 'contain',
    marginBottom: 12,
    alignSelf: 'center',
  },
  progressContainer: {
    width: '100%',
    marginBottom: 12,
  },
  progressText: {
    fontSize: 12,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 4,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 15,
    marginBottom: 15,
  },
  button: {
    backgroundColor: 'blue',
    paddingVertical: 12,
    borderRadius: 8,
    width: '48%',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 50,
  },
  buttonSecundario: {
    backgroundColor: '#FF6347',
    paddingVertical: 12,
    borderRadius: 8,
    width: '48%',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 50,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
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
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  iconContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 5,
  },
  iconText: {
    fontSize: 10,
    color: '#fff',
    marginTop: 4,
  },
});
