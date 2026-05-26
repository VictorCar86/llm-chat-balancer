import { MessageSchema } from "./schemas";

export type GeneralMessage = MessageSchema;

export type ChatOptions = {
    temperature?: number;
    max_tokens?: number;
    top_p?: number;
};

export type AIService = {
    name: string;
    model: string;
    owned_by: string;
    created: number;
    chat: (messages: GeneralMessage[], options?: ChatOptions) => Promise<AsyncIterable<string>>;
};

export type OpenAIModel = {
    id: string;
    object: "model";
    created: number;
    owned_by: string;
};

export type OpenAIModelsListResponse = {
    object: "list";
    data: OpenAIModel[];
};

export type OpenAIStreamChunk = {
    id: string;
    object: "chat.completion.chunk";
    created: number;
    model: string;
    choices: {
        index: number;
        delta: {
            role?: string;
            content?: string;
        };
        finish_reason: "stop" | "length" | "content_filter" | null;
    }[];
};
