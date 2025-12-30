// src/services/gemini.ts
import { GoogleGenAI, Content } from "@google/genai";
import { GeneralMessage, AIService } from "../types";

export type GeminiMessage = Content;

const ai = new GoogleGenAI({ apiKey: process.env["GEMINI_API_KEY"] });

export function formatGeminiMessage(message: GeneralMessage, cleanRole = true) {
    let role: GeminiMessage["role"] = message.role;

    // Gemini requires 'user' or 'model' roles
    if (cleanRole && ["assistant", "system", "model"].includes(role)) {
        role = "model";
    } else {
        role = "user";
    }

    return {
        parts: [{ text: message.content ?? "" }],
        role: role,
    };
}

export async function getGeminiChatCompletion(messages: GeneralMessage[]) {
    let formattedContents: GeminiMessage[] = [];

    if (messages.length === 1) {
        formattedContents.push(formatGeminiMessage(messages[0], false));
    } else {
        formattedContents = messages.map((message) => formatGeminiMessage(message));
    }

    const response = await ai.models.generateContentStream({
        model: "gemini-3-flash-preview",
        contents: formattedContents,
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
