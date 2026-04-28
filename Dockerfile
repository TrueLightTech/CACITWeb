FROM node:20-bullseye

WORKDIR /app
ARG IMAGE_BASE_URL=""
ENV IMAGE_BASE_URL=${IMAGE_BASE_URL}

COPY package*.json .npmrc ./
RUN npm ci

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "start"]
