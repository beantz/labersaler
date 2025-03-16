// app/createAccount.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const CreateAccountScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Criar Conta</Text>
      {/* Aqui você pode adicionar o formulário de criação de conta */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
  },
});

export default CreateAccountScreen;