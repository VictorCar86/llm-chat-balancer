import { Message } from "./services/groq";

export type GeneralMessage = Message;

export type AIService = {
  name: string;
  chat: (messages: GeneralMessage[]) => Promise<AsyncIterable<string>>;
}