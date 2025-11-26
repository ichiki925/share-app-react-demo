FROM node:18-alpine

WORKDIR /app

# package.jsonをコピーして依存関係をインストール
COPY nextjs-frontend/package*.json ./
RUN npm ci

COPY nextjs-frontend/ .

EXPOSE 3000

CMD ["npm", "run", "dev"]