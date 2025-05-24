import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, ScrollView, TextInput, Linking, Alert } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import api from '../services/api.js';
import * as SecureStore from 'expo-secure-store';

export default function Book() {
  const [comentario, setComentario] = useState('');
  const [nota, setNota] = useState(0);
  const [loading, setLoading] = useState(false);
  const [reviews, setReviews] = useState([]);
  const params = useLocalSearchParams();
  const livro = JSON.parse(params.livroData);
  const [livroById, setLivroById] = useState(''); 


  // Busca os reviews do livro ao carregar a tela
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoading(true);
        
        const response = await api.get(`/Review/${livro.id}`);
        
        // Verificação mais robusta da resposta
        if (!response || !response.data) {
          throw new Error('Resposta da API inválida');
        }
    
        // Adaptação para a estrutura do seu backend
        const reviewsData = Array.isArray(response.data) 
          ? response.data.map(review => ({
              _id: review._id,
              comentario: review.comentario || review.comentarios || "",
              nota: review.nota || review.avaliacao || 0,
              usuario: review.usuario || review.user_id?.nome || "Anônimo"
            }))
          : [];
    
        console.log('Reviews processados:', reviewsData);
        setReviews(reviewsData);
    
      } catch (error) {
        console.error("Erro detalhado:", {
          message: error.message,
          response: error.response?.data,
          stack: error.stack
        });
        
        // Tratamento específico para erros de API
        if (error.response) {
          if (error.response.status === 404) {
            Alert.alert("Erro", "Livro não encontrado");
          } else {
            Alert.alert("Erro", "Falha ao carregar avaliações");
          }
        } else {
          Alert.alert("Erro", "Problema de conexão");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [livro._id]);

  useEffect(() => {
    const fetchBook = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/livros/${livro.id}`);
        
        // Ajuste conforme a estrutura real da sua API
        // Se a resposta for { success: true, livro: {...} }
        if (response.data && response.data.livro) {
          setLivroById(response.data.livro);
        } 
        // Se a resposta for diretamente o objeto livro
        else if (response.data) {
          setLivroById(response.data);
        }
      } catch (error) {
        Alert.alert("Erro", "Não foi possível carregar os dados do livro");
        console.error("Erro detalhado:", error.response?.data || error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBook();
  }, [livro.id]);
  
  const enviarComentario = async () => {
    try {
      if (!comentario.trim() || nota === 0) {
        Alert.alert("Atenção", "Por favor, digite um comentário e selecione uma nota");
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
  
      // Verificação da resposta
      if (!response || !response.data) {
        throw new Error('Resposta da API inválida');
      }
  
      // Cria o novo review com estrutura compatível
      const newReview = {
        _id: response.data._id || Date.now().toString(),
        comentario: response.data.comentario || response.data.comentarios || comentario,
        nota: response.data.nota || response.data.avaliacao || nota,
        usuario: response.data.usuario || "Você"
      };
  
      setReviews(prev => [newReview, ...prev]);
      setComentario('');
      setNota(0);
      Alert.alert("Sucesso", "Avaliação enviada com sucesso!");
  
    } catch (error) {
      console.error("Erro ao enviar comentário:", {
        message: error.message,
        response: error.response?.data
      });
      
      let errorMessage = "Falha ao enviar avaliação";
      if (error.response) {
        if (error.response.status === 401) {
          errorMessage = "Você precisa estar logado para avaliar";
        } else if (error.response.data?.message) {
          errorMessage = error.response.data.message;
        }
      }
      
      Alert.alert("Erro", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const deletarComentario = async (reviewId) => {
    try {
      const token = await SecureStore.getItemAsync('userToken');
      
      Alert.alert(
        "Confirmar",
        "Tem certeza que deseja excluir este comentário?",
        [
          {
            text: "Cancelar",
            style: "cancel"
          },
          { 
            text: "Excluir", 
            onPress: async () => {
              setLoading(true);
              try {
                const response = await api.delete(`/Review/DeletarComentario/${reviewId}`, {
                  headers: {
                    'Authorization': `Bearer ${token}`
                  }
                });
                
                if(response.data.success) {
                  setReviews(prev => prev.filter(review => review._id !== reviewId));
                  Alert.alert("Sucesso", response.data.message || "Comentário excluído com sucesso");
                } else {
                  Alert.alert("Erro", response.data.message || "Falha ao excluir comentário");
                }
              } catch (error) {
                if (error.response) {
                  if (error.response.status === 400) {
                    Alert.alert("Erro", "ID da avaliação inválido");
                  } else if (error.response.status === 403) {
                    Alert.alert("Erro", "Você não tem permissão para excluir esta avaliação");
                  } else if (error.response.status === 404) {
                    Alert.alert("Erro", "Avaliação não encontrada");
                  } else {
                    Alert.alert("Erro", error.response.data?.message || "Falha ao excluir comentário");
                  }
                } else {
                  Alert.alert("Erro", "Problema de conexão");
                }
              } finally {
                setLoading(false);
              }
            }
          }
        ]
      );
      
    } catch (error) {
      console.error("Erro ao deletar comentário:", error);
      Alert.alert("Erro", error.message || "Falha ao excluir comentário");
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.livroContainer}>
        <Image source={{ uri: livro.imagem.url }} style={styles.livroImagem} />
        <View style={styles.livroInfo}>
          <Text style={styles.livroTitulo}>{livro.titulo}</Text>
          <Text style={styles.livroAutor}>{livro.autor}</Text>
          <Text style={styles.livroPreco}>R$ {livro.preco.toFixed(2)}</Text>
          <Text style={styles.livroDescricao}>{livro.descricao}</Text>

           {/* Adicione esta seção para visualizar os dados do vendedor */}
          <View style={{ marginTop: 10, borderTopWidth: 1, borderTopColor: '#fff', paddingTop: 10 }}>
            <Text style={{ color: '#fff', fontWeight: 'bold' }}>Vendedor:</Text>
            <Text style={{ color: '#fff' }}>{livroById.vendedor?.nome || 'Nome não disponível'}</Text>
            <Text style={{ color: '#fff' }}>Contato: {livroById.vendedor?.contato || 'Não informado'}</Text>
          </View>
        </View>
      </View>

      <TouchableOpacity
        onPress={async () => {
          try {
            
            if (!livroById?.vendedor?.contato) {
              Alert.alert("Erro", "Contato do vendedor não disponível");
              return;
            }

            const numeroLimpo = livroById.vendedor.contato.toString().replace(/\D/g, '');
            
            if (numeroLimpo.length < 10) {
              Alert.alert("Erro", "Número de contato inválido");
              return;
            }

            //adiciona 55 se necessario
            const numeroFormatado = numeroLimpo.length === 11 ? `55${numeroLimpo}` : `55${numeroLimpo}`;

            const url = `https://wa.me/${numeroFormatado}`;
            
            // Verifica se pode abrir o link
            const canOpen = await Linking.canOpenURL(url);
            
            if (canOpen) {
              await Linking.openURL(url);
            } else {
              Alert.alert("Erro", "WhatsApp não está instalado");
            }
          } catch (error) {
            
            Alert.alert("Erro", "Não foi possível abrir o WhatsApp");
          }
        }}
        style={[
          styles.whatsappButton,
          !livroById?.vendedor?.contato && { opacity: 0.6 }
        ]}
        disabled={!livroById?.vendedor?.contato || loading}
      >
        <Text style={styles.whatsappButtonText}>
          {loading ? "Carregando..." : 
          !livroById?.vendedor?.contato 
            ? "Contato indisponível" 
            : "Entrar em contato via WhatsApp"}
        </Text>
      </TouchableOpacity>

      {/* Seção de Reviews */}
      <Text style={styles.avaliacoesTitulo}>Avaliações ({reviews.length})</Text>
      
      {loading && <Text style={styles.carregando}>Carregando avaliações...</Text>}
      
      {reviews.length > 0 ? (
        <View style={styles.reviewsContainer}>
          {reviews.map((review) => (
            <View key={review._id} style={styles.reviewItem}>
              <View style={styles.reviewHeader}>
                <Text style={styles.reviewUsuario}>{review.usuario || "Anônimo"}</Text>
                <TouchableOpacity 
                  onPress={() => deletarComentario(review._id)}
                  style={styles.deleteButton}
                >
                  <Text style={styles.deleteButtonText}>×</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.reviewNota}>
                Nota: {"⭐".repeat(review.nota)} ({review.nota}/10)
              </Text>
              <Text style={styles.reviewComentario}>{review.comentario}</Text>
            </View>
          ))}
        </View>
      ) : (
        <Text style={styles.semAvaliacoes}>
          Nenhuma avaliação ainda. Seja o primeiro a avaliar!
        </Text>
      )}

      {/* Formulário para novo review */}
      <Text style={styles.avaliacoesTitulo}>Deixe sua avaliação:</Text>
      
      <View style={styles.comentarioInputContainer}>
        <TextInput
          placeholder="Escreva seu comentário..."
          placeholderTextColor="#888"
          style={styles.input}
          value={comentario}
          onChangeText={setComentario}
          multiline
        />
        
        <View style={styles.notaContainer}>
          <Text style={styles.notaLabel}>Nota:</Text>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((item) => (
            <TouchableOpacity 
              key={item}
              onPress={() => setNota(item)}
              style={[
                styles.notaButton,
                { backgroundColor: nota === item ? '#6200ee' : '#ddd' }
              ]}
            >
              <Text style={{color: nota === item ? 'white' : 'black'}}>{item}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity 
          style={styles.enviarBotao} 
          onPress={enviarComentario}
          disabled={loading}
        >
          <Text style={styles.enviarTexto}>
            {loading ? "Enviando..." : "Enviar Avaliação"}
          </Text>
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
    marginTop: 20,
  },
  reviewsContainer: {
    marginBottom: 20,
  },
  reviewItem: {
    backgroundColor: '#FFF',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  reviewUsuario: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  reviewNota: {
    fontSize: 14,
    color: '#FFD700',
    marginVertical: 4,
  },
  reviewComentario: {
    fontSize: 14,
    color: '#666',
  },
  semAvaliacoes: {
    color: '#fff',
    textAlign: 'center',
    marginVertical: 20,
  },
  carregando: {
    color: '#fff',
    textAlign: 'center',
    marginBottom: 10,
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
  notaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
    flexWrap: 'wrap',
  },
  notaLabel: {
    marginRight: 10,
    color: '#000',
  },
  notaButton: {
    padding: 8,
    borderRadius: 5,
    marginRight: 5,
    marginBottom: 5,
  },
  enviarBotao: {
    backgroundColor: '#6A006A',
    padding: 10,
    borderRadius: 6,
    alignItems: 'center',
    opacity: 1,
  },
  enviarTexto: {
    color: '#fff',
    fontWeight: 'bold',
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  deleteButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#ff4444',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    lineHeight: 20,
    textAlign: 'center',
  },
});