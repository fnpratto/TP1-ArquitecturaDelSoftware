FROM node
RUN mkdir /usr/src/app
WORKDIR /usr/src/app
COPY app.js package.json package-lock.json ./
COPY config_rate_limit.json ./
RUN npm install
ENTRYPOINT ["node", "app.js"]