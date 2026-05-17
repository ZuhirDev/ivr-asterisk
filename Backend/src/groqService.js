import { Groq } from "groq-sdk";
import CONFIG from "./config/config.js";

if (!CONFIG.GROQ.API_KEY) {
  throw new Error("❌ GROQ_API_KEY no está definida en el .env");
}

const groq = new Groq({
  apiKey: CONFIG.GROQ.API_KEY,
});

export const groqService = async ({ systemPrompt, context, message }) => {
  console.log("🧠 [GROQ] Consultando al modelo...");
  try {
    const completion = await groq.chat.completions.create({
      model: CONFIG.GROQ.MODEL || "llama3-8b-8192", 
      messages: [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: `Contexto:\n${context}\n\nPregunta:\n${message}`,
        },
      ],
      temperature: 0.5, // Un poco más de creatividad para que suene humano
      max_completion_tokens: 150, // Respuestas cortas son mejores para voz
    });

    const respuesta = completion.choices[0]?.message?.content;
    return respuesta || "Lo siento, no pude entender eso.";
  } catch (error) {
    console.error("❌ [GROQ ERROR]:", error);
    return "Tuve un error al procesar tu solicitud.";
  }
};