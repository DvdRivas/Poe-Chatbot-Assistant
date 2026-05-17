

export const POE_CONFIG = {
  // Nombre exacto del bot en Poe (case-sensitive)
  botName: "Qwen3.5-Flash",

  accessKey: "API KEY AQUI",

  widget: {
    title: "Asistente Virtual",
    welcomeMessage: "¡Hola! ¿En qué puedo ayudarte?",
    placeholder: "Escribe un mensaje…",
    accentColor: "#6366f1",
  },
} as const;

export const POE_API_URL = "/poe-api";
// NOTA: En produccion es necesario reeemplazar la URL de poe: https://api.poe.com/v1 
// Ademas de cambiar la configuracion de vite.config.ts para quitar el proxy