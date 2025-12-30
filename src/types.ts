export type GeneralMessage = {
    role: "user" | "assistant" | "system";
    content: string;
};

export type AIService = {
    name: string;
    chat: (messages: GeneralMessage[]) => Promise<AsyncIterable<string>>;
};
