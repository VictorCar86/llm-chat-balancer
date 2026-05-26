import Cerebras from '@cerebras/cerebras_cloud_sdk';
import { AIService, GeneralMessage, ChatOptions } from "../types";

const CEREBRAS_MODEL = 'gpt-oss-120b';

const cerebras = new Cerebras({
    apiKey: process.env['CEREBRAS_API_KEY']
});

async function getCerebrasChatCompletion(messages: GeneralMessage[], options?: ChatOptions) {
    const response = await cerebras.chat.completions.create({
        messages: messages,
        model: CEREBRAS_MODEL,
        stream: true,
        max_completion_tokens: options?.max_tokens ?? 32768,
        temperature: options?.temperature ?? 1,
        top_p: options?.top_p ?? 1
    });

    return (async function* () {
        for await (const chunk of response) {
            yield (chunk as any).choices[0]?.delta?.content || '';
        }
    })()
}

export const cerebrasService: AIService = {
    name: "cerebras",
    model: CEREBRAS_MODEL,
    owned_by: "cerebras",
    created: 1735689600,
    chat: getCerebrasChatCompletion,
}
