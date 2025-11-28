import { originateCall, playAudio, hangupChannel } from '../../../ariClient.js';
import { playTextAudio } from '../service/ivrService.js';

export async function callAndPlayMessage(client, endpoint, text) {
  try {
    const channel = await originateCall(client, endpoint);

    await channel.answer();
    console.log(`✅ Llamada contestada: ${endpoint}`);

    const playback = await playTextAudio(channel, text);

    playback.on('PlaybackFinished', async () => {
      console.log('⏹ Audio terminado, colgando llamada');
      await hangupChannel(channel);
    });

  } catch (error) {
    console.error('❌ Error en llamada saliente:', error.message);
  }
}
