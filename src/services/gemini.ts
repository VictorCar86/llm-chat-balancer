import { GoogleGenAI } from "@google/genai";
import { GeneralMessage, AIService } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env["GEMINI_API_KEY"] });

export async function getGeminiChatCompletion(messages: GeneralMessage[]) {
    const response = await ai.models.generateContentStream({
        model: "gemini-3-flash-lite-latest",
        contents: messages,
    });

    return (async function* () {
        for await (const chunk of response) {
            yield chunk.text || "";
        }
    })();
}

export const geminiService: AIService = {
    name: "gemini",
    chat: getGeminiChatCompletion,
};
