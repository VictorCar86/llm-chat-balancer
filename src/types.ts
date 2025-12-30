import { MessageSchema } from "./schemas";

export type GeneralMessage = MessageSchema;

export type AIService = {
    name: string;
    chat: (messages: GeneralMessage[]) => Promise<AsyncIterable<string>>;
};
