import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;

export const chatWithGemini = async (message: string, history: { role: "user" | "model"; parts: { text: string }[] }[]) => {
  if (!apiKey) {
    throw new Error("API Key não configurada. Por favor, adicione GEMINI_API_KEY aos Segredos.");
  }

  const ai = new GoogleGenAI({ apiKey });
  
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: [
      ...history.map(h => ({ role: h.role, parts: h.parts })),
      { role: "user", parts: [{ text: message }] }
    ],
    config: {
      systemInstruction: "Você é um assistente prestativo, amigável e conciso. Responda sempre em português do Brasil, a menos que solicitado o contrário.",
    }
  });

  return response.text || "Desculpe, não consegui gerar uma resposta.";
};
