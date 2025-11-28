import AriClient from 'ari-client';
import CONFIG from '#config/config.js';
import { handleIVR } from '#ivr/ivr.js';

let client = null;

export async function connectAri(dispatch) {
  if (client) return client;

  try {
    client = await AriClient.connect(CONFIG.ARI_URL, CONFIG.ARI_USER, CONFIG.ARI_PASS);
    console.log('✅ Conectado a Asterisk ARI');

    client.on('StasisStart', async (event, channel) => {
      console.log(`📞 Nueva llamada de ${channel.caller.number}`);
      handleIVR(channel)
    });

    client.start(CONFIG.APP_NAME);
    return client;
  } catch (err) {
    console.error('❌ Error conectando a ARI:', err.message);
    throw err;
  }
}

export async function answerChannel(channel) {
  return channel.answer();
}

export async function hangupChannel(channel) {
  return channel.hangup();
}

export async function playAudio(channel, sound) {
  return channel.play({ media: `sound:${sound}` });
}

export async function sendDTMF(channel, digits) {
  return channel.sendDTMF({ digits });
}

export async function originateCall(client, endpoint) {
  return client.channels.originate({
    endpoint,
    app: CONFIG.APP_NAME,
    callerId: 'Recordatorio <1000>',
    timeout: 30000  // Opcional: tiempo para que conteste
  });
}
