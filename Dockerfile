# Base Image for Node.js
FROM node:20-alpine AS builder

WORKDIR /app

# Root package.json aur lock file copy karein
COPY package*.json ./

# Saari dependencies install karein
RUN npm install

# Poora source code copy karein (src, server, etc.)
COPY . .

# Package.json ki build script chalayein (Vite + Esbuild dono run honge)
RUN npm run build

# Production Environment Stage
FROM node:20-alpine

WORKDIR /app

# Sirf production dependencies install karne ke liye package.json copy karein
COPY package*.json ./
RUN npm install --omit=dev

# Builder stage se dist folder (frontend build + bundled server) copy karein
COPY --from=builder /app/dist ./dist

# Port expose karein (Kyunki backend isi build se chalega)
EXPOSE 5000

# Server start karne ki command
CMD ["npm", "start"]