# WhatsApp Web Bot Microservice

This microservice uses `whatsapp-web.js` to create a WhatsApp bot that can respond to messages and schedule cron jobs. The bot runs inside a Docker container.

## Features

- Responds to "ping" messages with "Pong!" after a 2-second delay and typing effect
- Schedules a cron job to send a message back to the user after 2 minutes when they type `/cron`, with a 2-second delay and typing effect

## Prerequisites

- Docker installed on your machine

## Getting Started

### Build the Docker Image

To build the Docker image, navigate to the project directory and run:

```sh
docker build -t wa-bot .
```

### Run the Docker Container

To run the Docker container, use the following command:

```sh
docker run -it --name my-wa-bot wa-bot
```

### Usage

1. Scan the QR code displayed in the terminal to authenticate the bot with your WhatsApp account.d
2. Send a message "ping" to the bot, and it will reply with "Pong!" after a 2-second delay and typing effect.
3. Send a message "/cron" to the bot, and it will schedule a cron job to send a message back to you after 2 minutes, with a 2-second delay and typing effect.

## Files

- `index.js`: Main file containing the bot logic.
- `Dockerfile`: Dockerfile to build the Docker image.
- `.dockerignore`: File to specify which files and directories to ignore when building the Docker image.

## License

This project is licensed under the MIT License.
