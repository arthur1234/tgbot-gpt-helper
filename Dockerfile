# Specify the base image
FROM node:14

# Create app directory
WORKDIR /app1

COPY package*.json ./

RUN npm ci


COPY . /app1

ENV PORT=3000


# Standard port for Telegram Bot API
EXPOSE $PORT

# Run the app
CMD [ "npm", "start" ]
