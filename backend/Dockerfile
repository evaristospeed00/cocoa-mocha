FROM node:20.20.2-alpine

WORKDIR /app

ENV NODE_ENV=production

COPY package*.json ./

RUN npm ci --legacy-peer-deps

COPY . .

RUN npm run build && cp medusa-config.ts medusa-config.js && cp medusa-config.ts medusa-config.ts

EXPOSE 9000

CMD ["npx", "medusa", "start"]

