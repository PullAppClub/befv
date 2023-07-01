FROM node:20-alpine AS development

WORKDIR /app

COPY package*.json ./

RUN npm install glob rimraf

COPY . .

RUN npm run build
EXPOSE 3000
CMD ["node", "dist/main"]