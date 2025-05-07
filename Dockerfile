FROM node:18-alpine 
WORKDIR /app

#copia arquivos necessários para instalação
COPY package*.json ./

#instala dependências
RUN npm install --frozen-lockfile
RUN npm install -g expo-cli@latest

#copia restante do projeto
COPY . .

# Configurações para hot-reload
ENV EXPO_DEVTOOLS_LISTEN_ADDRESS=0.0.0.0
ENV REACT_NATIVE_PACKAGER_HOSTNAME=0.0.0.0

#expoe portas
EXPOSE 19000 19001 19002

#inicia expo
CMD ["npx", "expo", "start"]