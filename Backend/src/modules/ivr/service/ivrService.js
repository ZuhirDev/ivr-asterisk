import { hangupChannel, playAudio } from "../../../ariClient.js";
import { generateAudio } from "#utils/espeak.js";
import { assign, setup } from "xstate";

export const hangupPlayback = async (channel, playback) => {
    playback.on('PlaybackFinished', async () => {
        console.log('⏹ Audio terminado, colgando llamada');
        await hangupChannel(channel);
    });    
}

export const playTextAudio = async (channel, text, hangup = false) => {
    const audioFile = await generateAudio(text);
    const playback = await playAudio(channel, `tmp/${audioFile}`);

    if(hangup) await hangupPlayback(channel, playback);

    return playback;
}


const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

export const musicOnHold = async (channel, funcToRun, delayBeforeMs = 0, delayAfterMs = 0) => {
  try {
    await channel.startMoh();

    if (delayBeforeMs > 0) await delay(delayBeforeMs);

    await funcToRun(channel);

    if (delayAfterMs > 0) await delay(delayAfterMs);

  } catch (error) {
    console.error('Error ejecutando la función:', error);
  } finally {
    await channel.stopMoh();
    console.log('Música detenida');
  }
};

export const withAttempts = (machineConfig, machineActions = {}) => {
  return setup({
    guards: {
      hasRemainingAttempts: ({ context }) => {
        console.log(`🛡️ Guard hasRemainingAttempts? intentos: ${context.attempts}`);
        return context.attempts < 3;
      },
      maxAttemptsReached: ({ context }) => {
        console.log(`🛑 Guard maxAttemptsReached? intentos: ${context.attempts}`);
        return context.attempts >= 3;
      },
    },
    actions: {
      listenAndRoute: async ({ context, self }) => {
        console.log("Context", context.message);
        await playTextAudio(context.channel, context.message);

        const digits = await listenDtmf(context.channel, { maxDigits: 1 });
        const eventName = `DTMF_${digits}`;

        context.digits = digits;
        self.send({ type: eventName });
      },
      ...machineActions,
    },
  }).createMachine({
    ...machineConfig,
    context: ({ input }) => ({
      attempts: 0,
      channel: input?.channel ?? null,
      message: null,
      digits: null,
      ...machineConfig.context,
    }),
    states: {
      active: {
        ...(machineConfig.states?.active ?? {}),
        on: {
          '*': {
            actions: assign({
              attempts: ({ context }) => {
                console.log("Digitos", context.digits);
                const newAttempts = context.attempts + 1;
                console.log(`❌ ${machineConfig.id} - Intento ${newAttempts}/3`);
                return newAttempts;
              },
            }),
            target: 'checkAttempts',
          },
          SET_CHANNEL: {
            actions: assign({
              channel: ({ context, event }) => event.channel,
            }),
          },
          ...machineConfig.states?.active?.on,
        },
      },
      checkAttempts: {
        always: [
          {
            target: 'maxAttemptsReached',
            guard: ({ context }) => context.attempts >= 3,
          },
          { target: 'active' },
        ],
      },
      maxAttemptsReached: {
        entry: async ({ context }) => {
          await playTextAudio(
            context.channel,
            "Ha superado el número máximo de intentos. La llamada será finalizada.",
            true
          );
        },
        type: 'final',
      },
      ...Object.fromEntries(Object.entries(machineConfig.states ?? {}).filter(([k]) => k !== "active")),
    },
  });
};

export const getUser = async () => {
  try {
    const response = await fetch('https://jsonplaceholder.typicode.com/users/1');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const user = await response.json();
    return user;
  } catch (error) {
    console.error('Error fetching user:', error);
  }
};

export const listenDtmf = (channel, { maxDigits = 1, terminator = '#', timeout = 10000 }) => {
  return new Promise((resolve) => {
    let digits = '';

    const handler = (event) => {
      const digit = event.digit;
      digits += digit;

      if (digits.length >= maxDigits || digit === terminator) {
        clearTimeout(cleanup);
        channel.removeListener('ChannelDtmfReceived', handler);
        resolve(digits);
      }
    };

    const cleanup = setTimeout(async () => {
      console.log("Colgando llamada");
      channel.removeListener('ChannelDtmfReceived', handler);
      await hangupChannel(channel);
      resolve(null);
    }, timeout);

    channel.on('ChannelDtmfReceived', handler);
  });
};