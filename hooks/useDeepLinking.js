import { useEffect } from 'react';
import { Linking } from 'react-native';
import * as WebBrowser from 'expo-web-browser';

//hook personalizado criado para gerenciar o Deep Linking 
//ele permite que meu app capture links externos (quando alguém clica em um link como meuapp://redefinir-senha?token=abc123) e
//redirecione para telas específicas do app com parâmetros (como o token de redefinição de senha)

export function useDeepLinking(navigation) {
  useEffect(() => {
    const handleDeepLink = ({ url }) => {
      if (url.includes('redefinir-senha')) {
        const token = url.split('token=')[1];
        navigation.navigate('RedefinirSenha', { token });
      }
    };

    Linking.addEventListener('url', handleDeepLink);
    
    // Verifica se o app foi aberto por um link
    Linking.getInitialURL().then(url => {
      if (url) handleDeepLink({ url });
    });

    return () => Linking.removeAllListeners('url');
  }, [navigation]);
}