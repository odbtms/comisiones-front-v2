# ---- Etapa 1: build del front con Node ----
FROM node:22-alpine AS build
WORKDIR /app

# Cacheamos deps: primero el manifiesto, luego el código.
COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# ---- Etapa 2: nginx sirve el estático y hace proxy a la API ----
FROM nginx:1.27-alpine AS runtime
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
