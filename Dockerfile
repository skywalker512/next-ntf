FROM mhart/alpine-node:14
WORKDIR /app
COPY . .

RUN npm ci \
  && npm run build \
  && node script/docker.mjs \
  && rm -rf /app/.next/cache

FROM mhart/alpine-node:slim-14

WORKDIR /app
COPY --from=0 /app/.next /app/.next
COPY --from=0 /app/script/server.mjs /app/script/server.mjs
COPY --from=0 /app/tmp /app/node_modules
COPY --from=0 /app/public /app/public
ENV NODE_ENV=production
EXPOSE 3010
CMD ["node", "script/server.mjs"]
