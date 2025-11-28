import { answerChannel } from "../../ariClient.js";
import { ivrMachine } from "#ivr/ivrMachine.js";
import { createActor } from "xstate";
import { musicOnHold } from "#ivr/service/ivrService.js";

// ================= IVR Handler =================
export const handleIVR = async (channel) => {

  await musicOnHold(channel, async () => await answerChannel(channel), 1000);

  const actor = createActor(ivrMachine, { input: { channel } }).start();
  console.log("▶️ Actor iniciado");

};
