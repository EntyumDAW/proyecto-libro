FROM node:18

# Force rebuild - 2025-12-13-14:30
ARG CACHEBUST=1

WORKDIR /app

COPY package*.json ./

RUN npm install

RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

COPY . .

RUN npx prisma generate

EXPOSE 4000

CMD ["sh", "-c", "npx prisma migrate deploy && npm start"]