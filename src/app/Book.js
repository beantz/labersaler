import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  ScrollView,
  FlatList,
  TextInput,
  Linking,
  Alert
} from 'react-native';

export default function LiberSale() {
  const [comentario, setComentario] = useState('');
  const [comentarios, setComentarios] = useState([]);

  const livro = {
    titulo: "O Poder do Hábito",
    autor: "Charles Duhigg",
    preco: 39.90,
    descricao: "O livro explora como os hábitos se formam e como podemos mudá-los para melhorar nossas vidas.",
    imagem: { url: 'https://example.com/imagem-do-livro.jpg' },
    vendedorTelefone: "+5591987654321"
  };

  const avaliacoes = [
    { id: 1, usuario: 'João', nota: 5, comentario: 'Ótimo livro, recomendo!' },
    { id: 2, usuario: 'Maria', nota: 4, comentario: 'Muito bom, mas um pouco longo.' },
    { id: 3, usuario: 'Carlos', nota: 5, comentario: 'Excelente, mudou minha visão sobre hábitos.' }
  ];

  const renderAvaliacao = ({ item }) => (
    <View style={styles.avaliacaoContainer}>
      <Text style={styles.avaliacaoNome}>{item.usuario}</Text>
      <Text style={styles.avaliacaoNota}>Nota: {item.nota}</Text>
      <Text style={styles.avaliacaoComentario}>{item.comentario}</Text>
    </View>
  );

  const renderComentario = ({ item }) => (
    <View style={styles.comentarioContainer}>
      <Text style={styles.comentarioTexto}>{item}</Text>
    </View>
  );

  const enviarComentario = () => {
    if (comentario.trim() === '') return;

    setComentarios([...comentarios, comentario]);

    // Simulação de envio para o backend
    /*
    api.post('/comentarios', {
      livroId: livro.id,
      texto: comentario
    })
    .then(res => { ... })
    .catch(err => { ... });
    */

    setComentario('');
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

      <Text style={styles.avaliacoesTitulo}>Avaliações do Vendedor</Text>
      <FlatList
        data={avaliacoes}
        renderItem={renderAvaliacao}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.avaliacoesList}
      />

      <Text style={styles.avaliacoesTitulo}>Comentários</Text>
      <FlatList
        data={comentarios}
        renderItem={renderComentario}
        keyExtractor={(item, index) => index.toString()}
        contentContainerStyle={styles.avaliacoesList}
      />

      <View style={styles.comentarioInputContainer}>
        <TextInput
          placeholder="Deixe um comentário sobre o livro ou o vendedor..."
          placeholderTextColor="#888"
          style={styles.input}
          value={comentario}
          onChangeText={setComentario}
          multiline
        />
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
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
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