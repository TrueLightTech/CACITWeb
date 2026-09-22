FROM node:20-bullseye

WORKDIR /app
ARG IMAGE_BASE_URL=""
ENV IMAGE_BASE_URL=${IMAGE_BASE_URL}

COPY package*.json .npmrc ./
RUN npm ci

COPY . .
# `build`, not `generate`. Generate emits frozen HTML per route at build time,
# which cannot carry a link preview for anything published afterwards, and
# does not run serverMiddleware at all. `nuxt start` then serves the SPA
# through the Nuxt server, where share-meta can rewrite the head per request.
RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "start"]
