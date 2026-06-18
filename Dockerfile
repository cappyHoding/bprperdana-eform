# ─── Stage 1: Build ───────────────────────────────────────────────────────────
# Build React app menggunakan Node.js
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files dulu — Docker cache layer ini kalau source berubah
COPY package.json package-lock.json ./
RUN npm ci

# Copy seluruh source code lalu build
COPY . .
RUN npm run build

# ─── Stage 2: Serve ───────────────────────────────────────────────────────────
# Serve static files dengan NGINX (image ~25MB)
FROM nginx:alpine

# Copy hasil build ke NGINX html directory
COPY --from=builder /app/dist /usr/share/nginx/html

# SPA fallback — semua route diarahkan ke index.html
# Ini penting karena React Router menangani routing di client-side
COPY <<'NGINXCONF' /etc/nginx/conf.d/default.conf
server {
    listen 80;
    root /usr/share/nginx/html;
    index index.html;

    # SPA fallback
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets agresif (JS, CSS, images sudah punya hash di filename)
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
NGINXCONF

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
