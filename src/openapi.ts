import { OpenApiGeneratorV3, OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import { z, chatSchema, messageSchema } from "./schemas";

const registry = new OpenAPIRegistry();

const bearerAuth = registry.registerComponent("securitySchemes", "bearerAuth", {
    type: "http",
    scheme: "bearer",
    bearerFormat: "JWT",
    description: "Token JWT obtenido mediante el script de generación local",
});

const cookieAuth = registry.registerComponent("securitySchemes", "cookieAuth", {
    type: "apiKey",
    in: "cookie",
    name: "auth_token",
    description: "Cookie establecida tras iniciar sesión en /docs/login",
});

registry.register("Message", messageSchema);
registry.register("ChatRequest", chatSchema);

const errorSchema = z.object({
    error: z.string().openapi({ description: "Mensaje de error" }),
}).openapi({ ref: "Error", description: "Error de la API" });

const unauthorizedSchema = z.object({
    error: z.string().openapi({ description: "Mensaje de error de autenticación" }),
}).openapi({ ref: "Unauthorized", description: "No autorizado" });

const tokenInputSchema = z.object({
    token: z.string().openapi({ description: "Token JWT generado localmente" }),
}).openapi({ ref: "TokenInput", description: "Input del formulario de login" });

registry.registerPath({
    method: "post",
    path: "/docs/login",
    description: "Valida un token JWT y establece una cookie de sesión para acceder a la documentación.",
    request: {
        body: {
            content: {
                "application/x-www-form-urlencoded": {
                    schema: tokenInputSchema,
                },
            },
        },
    },
    responses: {
        302: { description: "Redirige a /docs si el token es válido" },
        302: { description: "Redirige a /docs?error=invalid si el token no es válido" },
    },
});

registry.registerPath({
    method: "post",
    path: "/chat",
    description: "Envía mensajes al servicio de IA balanceado y recibe una respuesta en streaming (SSE).",
    security: [{ [bearerAuth.name]: [] }],
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
        401: {
            description: "Token JWT no proporcionado o inválido",
            content: {
                "application/json": {
                    schema: unauthorizedSchema,
                },
            },
        },
        403: {
            description: "Token JWT expirado",
            content: {
                "application/json": {
                    schema: unauthorizedSchema,
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

registry.registerPath({
    method: "get",
    path: "/openapi.json",
    description: "Especificación OpenAPI de la API en formato JSON. Requiere autenticación (cookie auth_token).",
    security: [{ [cookieAuth.name]: [] }],
    responses: {
        200: {
            description: "Especificación OpenAPI",
        },
        401: {
            description: "No autenticado - se muestra formulario de login",
            content: {
                "text/html": {
                    schema: z.string().openapi({ description: "Página de login HTML" }),
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
        description: "API para balancear requests de chat entre múltiples proveedores de IA (Groq, Cerebras, Gemini). Autenticación mediante Bearer Token JWT.",
    },
    servers: [{ url: "http://localhost:3000" }],
});
