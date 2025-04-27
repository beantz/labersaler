FROM reactnativecommunity/react-native:latest
WORKDIR /app

# Instalação global do Expo CLI
RUN npm install -g expo-cli

# Configurações para hot-reload
ENV EXPO_DEVTOOLS_LISTEN_ADDRESS=0.0.0.0
ENV REACT_NATIVE_PACKAGER_HOSTNAME=0.0.0.0

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 19000 19001 19002
CMD ["expo", "start"]