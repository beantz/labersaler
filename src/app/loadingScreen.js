import React, { useState, useEffect } from "react";
import { View, ActivityIndicator, Text, StyleSheet } from "react-native";

const LoadingScreen = () => {
  // Estado para controlar se ainda está carregando
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // carregamento de 3 segundos
    setTimeout(() => {
      setLoading(false);
    }, 3000);
  }, []);

  return (
    <View style={styles.container}>
      {/* Se ainda estiver carregando, exibe o indicador */}
      {loading ? (
        <>
          <ActivityIndicator size="large" color="#3498db" />
        </>
      ) : (
        <Text style={styles.text}>Carregamento concluído!</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  text: {
    marginTop: 10,
    fontSize: 16,
    color: "#555",
  },
});

export default LoadingScreen;