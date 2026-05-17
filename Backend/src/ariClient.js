import AriClient from 'ari-client';
import CONFIG from '#config/config.js';
import { handleIVR } from '#ivr/ivr.js';
import { registrarCanalActual } from './udpServer.js';

let client = null;

export async function connectAri(dispatch) {
  if (client) return client;

  try {
    client = await AriClient.connect(CONFIG.ARI_URL, CONFIG.ARI_USER, CONFIG.ARI_PASS);
    console.log('✅ Conectado a Asterisk ARI');

    client.on('StasisStart', async (event, channel) => {
        
        // 🛑 ¡LA CURA PARA EL BUCLE INFINITO!
        // Si el canal es un puente de audio (UnicastRTP) o no es un teléfono (PJSIP/SIP), lo ignoramos.
        if (channel.name.startsWith('UnicastRTP') || channel.name.startsWith('ExternalMedia')) {
            return; 
        }

        console.log(`📞 Llamada entrante de ${channel.caller.number}. Canal: ${channel.name}`);
        
        try {
            await channel.answer(); 

            registrarCanalActual(channel); // Guardamos el canal activo para el servidor de audio

            // Asegúrate de que este nombre sea EXACTAMENTE el de tu aplicación registrada
            const nombreApp = CONFIG.APP_NAME;  

            const externalChannel = await client.channels.externalMedia({
                app: nombreApp, 
                external_host: 'backend:5555',  
                format: 'slin16'   
            });

            const bridge = await client.bridges.create({ type: 'mixing' });

            await bridge.addChannel({ channel: [channel.id, externalChannel.id] });
            
            console.log('🔗 ¡Canal de audio abierto! Habla por Zoiper y mira la consola...');

        } catch (error) {
            console.error("❌ Error en ARI:", error.message || error);
        }
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
