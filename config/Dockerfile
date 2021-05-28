FROM node:10

# Create app directory
WORKDIR /usr/src/app

COPY ./package.json .
RUN npm install
COPY . .

EXPOSE 3000

CMD node configure.js ; node mysql-migrations.js up ; node app
