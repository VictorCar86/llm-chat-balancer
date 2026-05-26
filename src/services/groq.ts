import Groq from "groq-sdk";
import { AIService, GeneralMessage, ChatOptions } from "../types";

export type GroqMessage = GeneralMessage;

const GROQ_MODEL = "openai/gpt-oss-120b";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function getGroqChatCompletion(messages: GroqMessage[], options?: ChatOptions) {
    const response = await groq.chat.completions.create({
        messages: messages,
        model: GROQ_MODEL,
        temperature: options?.temperature ?? 0.7,
        max_completion_tokens: options?.max_tokens ?? 4096,
        top_p: options?.top_p ?? 0.9,
        stream: true,
        stop: null,
    });
    return (async function* () {
        for await (const chunk of response) {
            yield chunk.choices[0]?.delta?.content || "";
        }
    })();
}

export const groqService: AIService = {
    name: "groq",
    model: GROQ_MODEL,
    owned_by: "groq",
    created: 1735689600,
    chat: getGroqChatCompletion,
};
