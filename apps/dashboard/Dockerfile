FROM node:20-alpine AS build

WORKDIR /app

# Copy root package files
COPY package.json package-lock.json ./
# Copy workspace packages
COPY packages/shared-types ./packages/shared-types
COPY apps/dashboard ./apps/dashboard

# Install dependencies
RUN npm ci

# Build shared-types first
RUN cd packages/shared-types && npm run build

# Build dashboard
RUN cd apps/dashboard && npm run build

# Production server
FROM nginx:alpine
COPY --from=build /app/apps/dashboard/dist /usr/share/nginx/html
# SPA routing config
RUN echo 'server { listen 5173; location / { root /usr/share/nginx/html; index index.html; try_files $uri $uri/ /index.html; } }' > /etc/nginx/conf.d/default.conf

EXPOSE 5173
CMD ["nginx", "-g", "daemon off;"]
