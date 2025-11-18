# Stage 1: Build the React app
FROM node:20 AS build

WORKDIR /app

# Copy package files first (for better caching)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy all project files
COPY . .

# Build production-ready static files
RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:alpine

# Copy build output from stage 1
COPY --from=build /app/dist /usr/share/nginx/html

# Expose container port
EXPOSE 80

# Start Nginx server
CMD ["nginx", "-g", "daemon off;"]
