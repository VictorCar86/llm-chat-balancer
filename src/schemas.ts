import { z } from "zod";

export const messageSchema = z.object({
    role: z.enum(["user", "assistant", "system"]),
    content: z.string(),
});

export type MessageSchema = z.infer<typeof messageSchema>;

export const chatSchema = z.object({
    messages: z.array(messageSchema),
});