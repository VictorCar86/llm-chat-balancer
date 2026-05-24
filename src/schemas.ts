import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";

extendZodWithOpenApi(z);

export { z };

export const messageSchema = z.object({
    role: z.enum(["user", "assistant", "system"]).openapi({ description: "Rol del mensaje" }),
    content: z.string().openapi({ description: "Contenido del mensaje" }),
}).openapi({ ref: "Message", description: "Mensaje de chat" });

export type MessageSchema = z.infer<typeof messageSchema>;

export const chatSchema = z.object({
    messages: z.array(messageSchema).openapi({ description: "Lista de mensajes" }),
}).openapi({ ref: "ChatRequest", description: "Petición de chat" });