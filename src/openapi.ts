import { OpenApiGeneratorV3, OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import { z, chatSchema, messageSchema } from "./schemas";

const registry = new OpenAPIRegistry();

registry.register("Message", messageSchema);
registry.register("ChatRequest", chatSchema);

const errorSchema = z.object({
    error: z.string().openapi({ description: "Mensaje de error" }),
}).openapi({ ref: "Error", description: "Error de la API" });

registry.registerPath({
    method: "post",
    path: "/chat",
    description: "Envía mensajes al servicio de IA balanceado y recibe una respuesta en streaming (SSE).",
    request: {
        body: {
            content: {
                "application/json": {
                    schema: chatSchema,
                },
            },
        },
    },
    responses: {
        200: {
            description: "Stream de texto en formato Server-Sent Events (SSE)",
            content: {
                "text/event-stream": {
                    schema: z.string().openapi({ description: "Chunk de texto del stream" }),
                },
            },
        },
        400: {
            description: "Error de validación de entrada",
            content: {
                "application/json": {
                    schema: errorSchema,
                },
            },
        },
        500: {
            description: "Error interno del servidor",
            content: {
                "application/json": {
                    schema: errorSchema,
                },
            },
        },
    },
});

export const openApiSpec = new OpenApiGeneratorV3(registry.definitions).generateDocument({
    openapi: "3.0.0",
    info: {
        version: "1.0.0",
        title: "LLM Chat Balancer API",
        description: "API para balancear requests de chat entre múltiples proveedores de IA (Groq, Cerebras, Gemini).",
    },
    servers: [{ url: "http://localhost:3000" }],
});
