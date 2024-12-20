FROM node:22.12.0
EXPOSE 80
COPY . .
RUN npm install
CMD ["npm", "run", "start"]
