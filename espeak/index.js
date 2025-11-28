import express from 'express';
import { exec } from 'child_process';
import fs from 'fs';        
import crypto from 'crypto';

const app = express();

const AUDIO_DIR = './tts';
const PORT = 5000;

app.use(express.json()); 

const getAudioFilename = (text) => {
  const cleanText = text.trim().replace(/\s+/g, ' ');
  const hash = crypto.createHash('md5').update(cleanText).digest('hex');
  return `${hash}.wav`;
}

app.post('/tts', (req, res) => {
    const text = req.body.text || 'texto de prueba bby'
    const filename = getAudioFilename(text)
    const filepath = `${AUDIO_DIR}/${filename}`;

    if (fs.existsSync(filepath)) {
      console.log(`Usando audio existente: ${filename}`);
      return res.json({ audio: filename });
    }

    const command = `espeak -v es "${text}" --stdout | ffmpeg -i - -ar 8000 -ac 1 -c:a pcm_s16le ${filepath}`;

    exec(command, (err) => { 
      if(err){
        console.log("Error generando audio", err);
        return res.status(500).json({ error: "TTS FAILED" });
      }

      console.log(`Audio generado: ${filename}`);
      res.json({ audio: filename });
    });
});

app.listen(PORT, () => {
  console.log(`Servidor TTS en http://localhost:${PORT}`);
});