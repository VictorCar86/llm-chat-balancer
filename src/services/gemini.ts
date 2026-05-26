// src/services/gemini.ts
import { GoogleGenAI, Content } from "@google/genai";
import { GeneralMessage, AIService, ChatOptions } from "../types";

export type GeminiMessage = Content;

const GEMINI_MODEL = "gemini-3-flash-preview";

const ai = new GoogleGenAI({ apiKey: process.env["GEMINI_API_KEY"] });

export function formatGeminiMessage(message: GeneralMessage, cleanRole = true) {
    let role: GeminiMessage["role"] = message.role;

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

export async function getGeminiChatCompletion(messages: GeneralMessage[], _options?: ChatOptions) {
    let formattedContents: GeminiMessage[] = [];

    if (messages.length === 1) {
        formattedContents.push(formatGeminiMessage(messages[0], false));
    } else {
        formattedContents = messages.map((message) => formatGeminiMessage(message));
    }

    const response = await ai.models.generateContentStream({
        model: GEMINI_MODEL,
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
    model: GEMINI_MODEL,
    owned_by: "google",
    created: 1735689600,
    chat: getGeminiChatCompletion,
};
