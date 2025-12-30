import Groq from "groq-sdk";
import { AIService, GeneralMessage } from "../types";

export type GroqMessage = GeneralMessage;

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function getGroqChatCompletion(messages: GroqMessage[]) {
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
    })();
}

export const groqService: AIService = {
    name: "groq",
    chat: getGroqChatCompletion,
};
