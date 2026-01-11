# =================== Imagen base ===================
FROM node:lts-buster

# =================== Instalar dependencias del sistema ===================
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        ffmpeg \
        imagemagick \
        webp \
        curl \
        git \
    && apt-get upgrade -y \
    && rm -rf /var/lib/apt/lists/*

# =================== Directorio de trabajo ===================
WORKDIR /usr/src/app

# =================== Copiar package.json y instalar dependencias ===================
COPY package.json package-lock.json* ./

# Instalar dependencias de Node
RUN npm install && npm install qrcode-terminal

# =================== Copiar todo el proyecto ===================
COPY . .

# =================== Exponer puerto ===================
EXPOSE 5000

# =================== Comando de inicio ===================
CMD ["node", "server.js"]
