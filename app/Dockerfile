FROM node:18
RUN mkdir /usr/src/app
WORKDIR /usr/src/app
COPY app.js package.json package-lock.json ./
RUN npm install
ENTRYPOINT ["node", "app.js"]