import dgram from 'dgram';
import WebSocket from 'ws';
import { playTextAudio } from './modules/ivr/service/ivrService.js';
import { sendAgentMessage, extractAssistantText } from './agent-client.js';

let canalActivo = null; // Variable para guardar el canal actual

export function registrarCanalActual(channel) {
    canalActivo = channel;
}

export function iniciarServidorAudio() {
    const PUERTO = 5555;
    const server = dgram.createSocket('udp4');

    // 1. --- CONEXIÓN A VOSK ---
    const ws = new WebSocket('ws://vosk:2700');

    ws.on('open', () => {
        console.log('🧠 [IA] Motor de voz conectado y listo.');
        ws.send(JSON.stringify({ config: { sample_rate: 16000 } }));
    });

    ws.on('message', async (data) => {
        const respuesta = JSON.parse(data);
        
        // Solo imprimimos cuando el usuario termina de hablar 
        if (respuesta.text && respuesta.text.trim() !== "") {
            const usuarioDice = respuesta.text.trim();
            console.log(`\n🎙️  Usuario: ${usuarioDice}`);

            if (!canalActivo) {
                console.error("❌ No hay un canal registrado para responder.");
                return;
            }            
            // --- Llamada al agente LLM ---
            try {
                const agentResp = await sendAgentMessage(usuarioDice, {
                    // baseUrl: 'http://localhost:4111',
                    baseUrl: 'http://172.18.0.1:4111', 
                    agentId: 'ciges-agent',
                    useResponsesApi: true,
                });
                const respuestaIA = extractAssistantText(agentResp);
                console.log(`🤖 Agente: ${respuestaIA}`);

                try {
                    await playTextAudio(canalActivo, respuestaIA, false);
                    console.log(`🔊 Respuesta enviada al canal: ${canalActivo.id}`);
                } catch (error) {
                    console.error("❌ Error al reproducir respuesta:", error);
                }
            } catch (err) {
                console.error('❌ Error llamando al agente:', err);
            }
        }
    });

    ws.on('error', (err) => console.error('❌ [VOSK ERROR]:', err.message));

    // 2. --- PROCESAMIENTO DE AUDIO UDP ---
    server.on('message', (msg) => {
        if (ws.readyState !== WebSocket.OPEN) return;

        const rtpPayload = msg.slice(12);
        const leAudio = Buffer.alloc(rtpPayload.length);

        // Conversión Big-Endian a Little-Endian
        for (let i = 0; i < rtpPayload.length; i += 2) {
            if (i + 1 < rtpPayload.length) {
                leAudio[i] = rtpPayload[i + 1];
                leAudio[i + 1] = rtpPayload[i];
            }
        }

        ws.send(leAudio);
    });

    server.on('listening', () => {
        console.log(`🎧 [UDP] Escuchando Asterisk en el puerto ${PUERTO}`);
    });

    server.bind(PUERTO, '0.0.0.0');
}