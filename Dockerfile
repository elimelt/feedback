FROM node:20-slim

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN npm run build || echo "No build script found"

EXPOSE 3001

CMD ["node", "dist/server.js"]
