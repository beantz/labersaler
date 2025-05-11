import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, ScrollView, FlatList,TextInput, Linking, Alert } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import api from '../services/api.js';
import * as SecureStore from 'expo-secure-store';

export default function Book() {
  const [comentario, setComentario] = useState('');
  const [comentarios, setComentarios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const params = useLocalSearchParams();
  const livro = JSON.parse(params.livroData);
  const [nota, setNota] = useState(0);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoading(true);
        
        const response = await api.get(`/Review/${livro._id}`);

        console.log("Dados recebidos:", response.data); 
        
        const reviewsData = response.data.map(review => ({
          _id: review._id,
          comentario: review.comentario,
          nota: review.nota,
          usuario: review.usuario
        }));
        // const reviewsData = response.data.map(review => ({
        //   _id: review._id || Math.random().toString(),
        //   comentario: review.comentario || review.comentarios || "",
        //   nota: review.nota || review.avaliacao || 0,
        //   usuario: review.usuario || review.user_id?.nome || "Anônimo"
        // }));
        
        setComentarios(reviewsData);
        
      } catch (err) {
        console.error("Erro detalhado:", err);
        setError(err.message || "Erro ao carregar avaliações");
      } finally {
        setLoading(false);
      }
    };
  
    if (livro && livro._id) {
      fetchReviews();
    }
  }, [livro?._id]);

  const renderAvaliacao = ({ item }) => (
    <View style={styles.avaliacaoContainer}>
      <Text style={styles.avaliacaoNome}>{item.usuario || "Anônimo"}</Text>
      <Text style={styles.avaliacaoNota}>
        Nota: {"⭐".repeat(item.nota)} ({item.nota}/10)
      </Text>
      <Text style={styles.avaliacaoComentario}>{item.comentario}</Text>
    </View>
  );
 
  const enviarComentario = async () => {
    try {
      if (!comentario.trim() || nota === 0) {
        alert("Por favor, digite um comentário e selecione uma nota");
        return;
      }
  
      setLoading(true);
      const token = await SecureStore.getItemAsync('userToken');
      
      const response = await api.post('/Review', {  
        comentarios: comentario,
        avaliacao: nota,
        livro_id: livro.id 
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
  
      const data = response.data;
  
      const newReview = {
        _id: data._id,
        comentario: data.comentario || data.comentarios,
        nota: data.nota || data.avaliacao,
        usuario: data.usuario || data.user_id?.nome || "Você"
      }; 

      setComentarios([...comentarios, newReview]);
      setComentario('');
      setNota(0);
      alert("Avaliação enviada com sucesso!");
  
    } catch (error) {
      console.error("Erro:", error);
      Alert.alert("Erro", error.message || "Falha ao enviar avaliação");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
    {/* //<View style={styles.container}> */}
      <View style={styles.livroContainer}>
        <Image source={{ uri: livro.imagem.url }} style={styles.livroImagem} />
        <View style={styles.livroInfo}>
          <Text style={styles.livroTitulo}>{livro.titulo}</Text>
          <Text style={styles.livroAutor}>{livro.autor}</Text>
          <Text style={styles.livroPreco}>R$ {livro.preco.toFixed(2)}</Text>
          <Text style={styles.livroDescricao}>{livro.descricao}</Text>
        </View>
      </View>

      <TouchableOpacity
        onPress={() => {
          const mensagem = `Oi, estou interessado no livro "${livro.titulo}". Gostaria de mais informações.`;
          const url = `https://wa.me/${livro.vendedorTelefone}?text=${encodeURIComponent(mensagem)}`;
          Linking.openURL(url).catch(() => Alert.alert("Erro", "Não foi possível abrir o WhatsApp"));
        }}
        style={styles.whatsappButton}
      >
        <Text style={styles.whatsappButtonText}>Entrar em contato via WhatsApp</Text>
      </TouchableOpacity>

      <Text style={styles.avaliacoesTitulo}>Avaliações do Livro e Vendedor</Text>
      
      {loading && <Text style={{color: '#fff'}}>Carregando avaliações...</Text>}

      {/* <FlatList
        scrollEnabled={false}
        data={comentarios}
        renderItem={renderAvaliacao}
        keyExtractor={(item) => item._id?.toString() || Math.random().toString()}
        //keyExtractor={(item, index) => item._id ? item._id.toString() : index.toString()}
        ListEmptyComponent={
          <View style={{marginVertical: 20, paddingHorizontal: 15}}>
            <Text style={{color: '#fff', textAlign: 'center'}}>
              Nenhuma avaliação ainda. Seja o primeiro a avaliar!
            </Text>
          </View>
        }
      /> */}
      
      {comentarios.length > 0 ? (
        <View style={styles.avaliacoesList}>
          {comentarios.map((item) => (
            <View key={item._id?.toString() || Math.random().toString()} style={styles.avaliacaoContainer}>
              <Text style={styles.avaliacaoNome}>{item.usuario || "Anônimo"}</Text>
              <Text style={styles.avaliacaoNota}>
                Nota: {"⭐".repeat(item.nota)} ({item.nota}/10)
              </Text>
              <Text style={styles.avaliacaoComentario}>{item.comentario}</Text>
            </View>
          ))}
        </View>
      ) : (
        <View style={{marginVertical: 20, paddingHorizontal: 15}}>
          <Text style={{color: '#fff', textAlign: 'center'}}>
            Nenhuma avaliação ainda. Seja o primeiro a avaliar!
          </Text>
        </View>
      )}

      <Text style={styles.avaliacoesTitulo}>Deixe seu comentário e avaliação sobre o livro ou vendedor: </Text>

      {/*toda a parte de inserir comentario com avaliação*/}
      <View style={styles.comentarioInputContainer}>
        <TextInput
          placeholder="Deixe um comentário sobre o livro ou o vendedor..."
          placeholderTextColor="#888"
          style={styles.input}
          value={comentario}
          onChangeText={setComentario}
          multiline
        />
        
        <View style={{flexDirection: 'row', alignItems: 'center', marginVertical: 10}}>
          <Text style={{marginRight: 10}}>Nota:</Text>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((item) => (
            <TouchableOpacity 
              key={item}
              onPress={() => setNota(item)}
              style={{
                padding: 8,
                backgroundColor: nota === item ? '#6200ee' : '#ddd',
                borderRadius: 5,
                marginRight: 5
              }}
            >
              <Text style={{color: nota === item ? 'white' : 'black'}}>{item}</Text>
            </TouchableOpacity>
          ))}
        </View>

    <TouchableOpacity style={styles.enviarBotao} onPress={enviarComentario}>
      <Text style={styles.enviarTexto}>Enviar</Text>
    </TouchableOpacity>
  </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#8B008B',
    padding: 20,
  },
  livroContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  livroImagem: {
    width: 120,
    height: 180,
    borderRadius: 6,
    marginRight: 20,
  },
  livroInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  livroTitulo: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
  },
  livroAutor: {
    fontSize: 16,
    color: '#fff',
    marginVertical: 4,
  },
  livroPreco: {
    fontSize: 18,
    color: '#FFD700',
    marginVertical: 4,
  },
  livroDescricao: {
    fontSize: 14,
    color: '#fff',
    marginTop: 10,
  },
  whatsappButton: {
    backgroundColor: '#32CD32',
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 20,
    alignItems: 'center',
  },
  whatsappButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
  },
  avaliacoesTitulo: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  avaliacoesList: {
    marginBottom: 20,
  },
  avaliacaoContainer: {
    backgroundColor: '#FFF',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  avaliacaoNome: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  avaliacaoNota: {
    fontSize: 14,
    color: '#FFD700', 
    marginVertical: 4,
  },
  avaliacaoComentario: {
    fontSize: 14,
    color: '#666',
  },
  comentarioInputContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 10,
    marginBottom: 30,
  },
  input: {
    height: 80,
    textAlignVertical: 'top',
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 6,
    padding: 10,
    color: '#000',
    marginBottom: 10,
  },
  enviarBotao: {
    backgroundColor: '#6A006A',
    padding: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
  enviarTexto: {
    color: '#fff',
    fontWeight: 'bold',
  },
  comentarioContainer: {
    backgroundColor: '#EEE',
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  comentarioTexto: {
    fontSize: 14,
    color: '#333',
  },
});