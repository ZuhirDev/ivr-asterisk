import { assign, forwardTo } from "xstate";
import { getUser, listenDtmf, playTextAudio, withAttempts } from "#ivr/service/ivrService.js";

// ================= RRHH Machine =================
export const rrhhMachine = withAttempts(
  {
    id: 'rrhh',
    initial: 'active',
    states: {
      active: {
        entry: [
          assign({ message: "Departamento de RRHH. Pulse 1 para Nómina. Pulse 2 para Contratación." }),
          'listenAndRoute',
        ],
        on: {
          DTMF_1: {
            target: "nomina",
            actions: () => console.log("➡️ Navegando a Nómina"),
          },
          DTMF_2: {
            target: "contratacion",
            actions: () => console.log("➡️ Navegando a Contratación"),
          },
        },
      },
      nomina: {
        entry: 'askDNI',
      },
      contratacion: {
        entry: [
          assign({ message: "Contratación. Espere ser atendido" }),
          'listenAndRoute',
        ],
        type: 'final',
      },
    },
  },
  {
    askDNI: async ({ context, self, assign }) => {
      await playTextAudio(context.channel, "Por favor, introduzca su numero de DNI seguido de la tecla almohadilla");

      const dni = await listenDtmf(context.channel, { maxDigits: 8 });
      const user = await getUser();

      await playTextAudio(context.channel, `Hola ${user.name}, su nomina es de 1500 euros`, true);
    },
  }
);

// ================= Facturación Machine =================
export const facturacionMachine = withAttempts(
  {
    id: 'facturacion',
    initial: 'active',
    states: {
      active: {
        entry: [
          assign({ message: "Departamento de facturacion. Pulse 1 para consultar facturas. Pulse 2 para pagar facturas." }),
          'listenAndRoute',
        ],
        on: {
          DTMF_1F: {
            target: "consultar",
            actions: () => console.log("➡️ Consultar facturas"),
          },
          DTMF_2F: {
            target: "pagar",
            actions: () => console.log("➡️ Pagar facturas"),
          },
        },
      },
      consultar: {
        entry: () => console.log("📊 Consultando facturas..."),
        type: 'final',
      },
      pagar: {
        entry: () => console.log("💳 Procesando pago..."),
        type: 'final',
      },
    },
  }
);

export const ivrMachine = withAttempts({
  id: 'main',
  initial: 'active',
  states: {
    active: {
      entry: [
        assign({ message: "Bienvenido. Para Facturación marque 1. Para RRHH marque 2." }),
        'listenAndRoute',
      ],
      on: {
        DTMF_1: {
          target: "facturacion",
          actions: () => console.log("➡️ Navegando a Facturación"),
        },
        DTMF_2: {
          target: "rrhh",
          actions: () => console.log("➡️ Navegando a RRHH"),
        },
      },
    },
    facturacion: {
      invoke: {
        id: 'facturacionActor',
        src: facturacionMachine,
        input: ({ context }) => ({ channel: context.channel }),
        onDone: {
          target: 'active',
          actions: () => console.log("↩️ Volviendo al menú principal desde Facturación"),
        },
      },
      on: {
        '*': {
          actions: forwardTo('facturacionActor'),
        },
      },
    },
    rrhh: {
      invoke: {
        id: 'rrhhActor',
        src: rrhhMachine,
        input: ({ context }) => ({ channel: context.channel }),
        onDone: {
          target: 'active',
          actions: () => console.log("↩️ Volviendo al menú principal desde RRHH"),
        },
      },
      on: {
        '*': {
          actions: forwardTo('rrhhActor'),
        },
      },
    },
  },
});