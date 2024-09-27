# Dockerfile для frontend

FROM node:18 AS build

WORKDIR /app

# Устанавливаем зависимости
COPY package.json package-lock.json ./
RUN npm install --verbose

# Копируем исходники и создаем билд
COPY . .
RUN npm run build

# Второй этап: Nginx
FROM nginx:alpine

# Копируем билд из предыдущего этапа
COPY --from=build /app/dist /usr/share/nginx/html

# Копируем конфигурацию Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
