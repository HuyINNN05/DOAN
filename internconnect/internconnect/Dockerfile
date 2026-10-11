FROM node:22-bookworm-slim

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --cache /tmp/npm-cache && rm -rf /tmp/npm-cache
COPY . .

EXPOSE 3001 5173
CMD ["npm", "run", "server"]
