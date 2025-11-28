import { callAndPlayMessage } from '#ivr/controllers/caller.js';
import { connectAri } from '../ariClient.js';
import express from 'express';

const router = express.Router();

router.post('/call-reminder', async (req, res) => {
  try { console.log("DENTRO DE LA FUNCION")
    const { endpoint, message } = req.body;

    if (!endpoint || !message) {
      return res.status(400).json({ error: 'Faltan parámetros endpoint o message' });
    }
    const ariClient = await connectAri();  

    await callAndPlayMessage(ariClient, endpoint, message);

    res.json({ status: 'Llamada iniciada' });
  } catch (error) {
    console.error('Error al iniciar llamada:', error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/', (req, res) => {
  res.json({ message: 'Hello from backend' });
});

router.use('/', (req, res) => {
  res.status(404).json({ message: 'Not found in Backend' });
});

export default router;