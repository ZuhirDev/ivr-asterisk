FROM node:18

RUN apt-get update && apt-get install -y espeak ffmpeg

WORKDIR /app
COPY . .
RUN mkdir -p /app/tts

RUN npm install

CMD ["node", "index.js"]
