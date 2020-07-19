FROM nikolaik/python-nodejs:latest
WORKDIR "/app"
COPY ./package.json ./
RUN pip3 install redis
RUN npm install
COPY . .
EXPOSE 5000
CMD ["npm", "run", "start"]