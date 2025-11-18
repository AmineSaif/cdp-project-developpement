FROM node:18-slim
WORKDIR /usr/src/app
COPY package.json package-lock.json* ./
RUN npm install --production
COPY . ./
ENV NODE_ENV=production
EXPOSE 4000
CMD [ "node", "src/index.js" ]
