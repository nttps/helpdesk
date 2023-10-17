FROM node:lts-alpine AS builder

WORKDIR /app

COPY . /app

RUN npm install
RUN npm run build

# start final image
FROM node:lts-alpine

WORKDIR /app

COPY --from=builder /app /app


ENTRYPOINT ["node", ".output/server/index.mjs"]