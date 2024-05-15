FROM --platform=amd64 node:alpine

ENV NODE_ENV=development
ENV DB=mimistakedb
ENV DB_USERNAME=root
ENV DB_PASSWORD=alandinh0203
ENV DB_HOST=nosh
ENV DB_DIALECT=mysql
ENV DB_PORT=3306

WORKDIR /project

COPY package.json .

RUN npm install --development --silent

COPY . .

EXPOSE 5568

CMD ["sh", "-c", "cd src npx sequelize-cli db:migrate && cd /project && npm start"]
