import Cerebras from '@cerebras/cerebras_cloud_sdk';
import { AIService, GeneralMessage } from "../types";

const cerebras = new Cerebras({
    apiKey: process.env['CEREBRAS_API_KEY']
});

async function getCerebrasChatCompletion(messages: GeneralMessage[]) {
    const response = await cerebras.chat.completions.create({
        messages: messages,
        model: 'gpt-oss-120b',
        stream: true,
        max_completion_tokens: 32768,
        temperature: 1,
        top_p: 1
    });

    return (async function* () {
        for await (const chunk of response) {
            yield (chunk as any).choices[0]?.delta?.content || '';
        }
    })()
}

export const cerebrasService: AIService = {
    name: "cerebras",
    chat: getCerebrasChatCompletion,
}