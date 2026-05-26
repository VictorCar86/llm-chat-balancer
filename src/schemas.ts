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

export const openAIChatCompletionRequestSchema = z.object({
    model: z.string().optional().openapi({ description: "ID del modelo a usar. Si no se especifica, se usa round-robin." }),
    messages: z.array(messageSchema).openapi({ description: "Lista de mensajes en formato OpenAI" }),
    temperature: z.number().min(0).max(2).optional().openapi({ description: "Temperatura de muestreo (0-2)" }),
    max_tokens: z.number().int().positive().optional().openapi({ description: "Máximo de tokens en la respuesta" }),
    top_p: z.number().min(0).max(1).optional().openapi({ description: "Nucleus sampling (0-1)" }),
    stream: z.boolean().optional().default(true).openapi({ description: "Si es true, la respuesta se transmite como SSE" }),
}).openapi({ ref: "OpenAIChatCompletionRequest", description: "Petición de chat completions compatible con OpenAI" });

export type OpenAIChatCompletionRequest = z.infer<typeof openAIChatCompletionRequestSchema>;
