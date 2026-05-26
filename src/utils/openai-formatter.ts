import crypto from "node:crypto";
import { OpenAIStreamChunk, OpenAIModelsListResponse, OpenAIModel } from "../types";

const TOKEN_COUNT_LIMIT = 256;

function generateId(prefix: string) {
    return `${prefix}-${crypto.randomBytes(12).toString("hex")}`;
}

export function formatSSEChunk(
    id: string,
    model: string,
    created: number,
    content: string | undefined,
    role: string | undefined,
    finishReason: "stop" | "length" | "content_filter" | null
): string {
    const chunk: OpenAIStreamChunk = {
        id,
        object: "chat.completion.chunk",
        created,
        model,
        choices: [{
            index: 0,
            delta: {
                ...(role ? { role } : {}),
                ...(content ? { content } : {}),
            },
            finish_reason: finishReason,
        }],
    };
    return `data: ${JSON.stringify(chunk)}\n\n`;
}

export function formatDoneSignal(): string {
    return "data: [DONE]\n\n";
}

export function generateCompletionId(): string {
    return generateId("chatcmpl");
}

export function generateTimestamp(): number {
    return Math.floor(Date.now() / 1000);
}

export function formatModelsResponse(models: OpenAIModel[]): OpenAIModelsListResponse {
    return {
        object: "list",
        data: models,
    };
}

export function tokenCountEstimator(messages: { content: string }[]): number {
    let total = 0;
    for (const msg of messages) {
        total += Math.ceil(msg.content.length / 4);
    }
    return Math.min(total, TOKEN_COUNT_LIMIT);
}
