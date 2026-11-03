FROM node:22-bookworm

WORKDIR /app

COPY package*.json ./

RUN npm ci --omit=dev --build-from-source

COPY . .

EXPOSE 3001

CMD ["npm", "start"]