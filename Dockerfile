FROM node:20-alpine as builder
# Create app directory
WORKDIR /app
RUN chown -R node:node /app
USER node
# copy the package json and install first to optimize docker cache for node modules
COPY package.json /app/
COPY package-lock.json /app/
COPY src/resources/swagger.yaml /app/resources/
RUN npm ci
COPY . ./
RUN npm run build

# Runtime image
FROM node:20-alpine
ENV APP_UID=9999
ENV APP_GID=9999
RUN apk --no-cache add shadow
RUN groupmod -g $APP_GID node 
RUN usermod -u $APP_UID -g $APP_GID node
WORKDIR /app
RUN chown -R node:node /app
USER node
RUN mkdir dist && mkdir node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json .
COPY --from=builder /app/package-lock.json .
COPY --from=builder /app/resources/swagger.yaml ./dist/src/resources/swagger.yaml
EXPOSE 3221
CMD node dist/server.js