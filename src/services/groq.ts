import Groq from "groq-sdk";
import { AIService } from "../types";

export type Message = {
    role: "user" | "assistant" | "system";
    content: string;
}

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function getGroqChatCompletion(messages: Message[]) {
    const response = await groq.chat.completions.create({
        messages: messages,
        model: "openai/gpt-oss-120b",
        temperature: 0.7,
        max_completion_tokens: 4096,
        top_p: 0.9,
        stream: true,
        stop: null,
    });
    return (async function* () {
        for await (const chunk of response) {
            yield chunk.choices[0]?.delta?.content || "";
        }
    })()
}

export const groqService: AIService = {
    name: "groq",
    chat: getGroqChatCompletion
}