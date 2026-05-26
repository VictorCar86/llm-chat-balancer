import { Router } from "express";
import Handler from "../handler";
import { authenticateToken } from "../middlewares";
import { openAIChatCompletionRequestSchema } from "../schemas";
import {
    formatSSEChunk,
    formatDoneSignal,
    generateCompletionId,
    generateTimestamp,
    formatModelsResponse,
    tokenCountEstimator,
} from "../utils/openai-formatter";
import { ChatOptions } from "../types";

const router = Router();

router.post("/v1/chat/completions", authenticateToken, async (req, res) => {
    try {
        const validation = openAIChatCompletionRequestSchema.safeParse(req.body);
        if (!validation.success) {
            return res.status(400).json({
                error: {
                    message: "Invalid request body",
                    type: "invalid_request_error",
                    details: validation.error.issues,
                },
            });
        }

        const { model, messages, stream, temperature, max_tokens, top_p } = validation.data;

        const options: ChatOptions = {};
        if (temperature !== undefined) options.temperature = temperature;
        if (max_tokens !== undefined) options.max_tokens = max_tokens;
        if (top_p !== undefined) options.top_p = top_p;

        const service = model
            ? Handler.getServiceByModel(model)
            : Handler.getService();

        if (!service) {
            return res.status(400).json({
                error: {
                    message: `Model '${model}' not found. Use /v1/models to list available models.`,
                    type: "invalid_request_error",
                },
            });
        }

        if (stream === false) {
            const completionId = generateCompletionId();
            const created = generateTimestamp();
            let fullContent = "";

            const chunksAsync = await service.chat(messages, options);
            for await (const chunk of chunksAsync) {
                fullContent += chunk;
            }

            const promptTokens = tokenCountEstimator(messages);
            const completionTokens = tokenCountEstimator([{ content: fullContent }]);

            return res.status(200).json({
                id: completionId,
                object: "chat.completion",
                created,
                model: service.model,
                choices: [{
                    index: 0,
                    message: {
                        role: "assistant",
                        content: fullContent,
                    },
                    finish_reason: "stop",
                }],
                usage: {
                    prompt_tokens: promptTokens,
                    completion_tokens: completionTokens,
                    total_tokens: promptTokens + completionTokens,
                },
            });
        }

        res.status(200)
            .set("Content-Type", "text/event-stream")
            .set("Cache-Control", "no-cache")
            .set("Connection", "keep-alive");

        const completionId = generateCompletionId();
        const created = generateTimestamp();
        let firstChunk = true;

        const chunksAsync = await service.chat(messages, options);
        for await (const chunk of chunksAsync) {
            const content = chunk || "";
            const sseChunk = firstChunk
                ? formatSSEChunk(completionId, service.model, created, content, "assistant", null)
                : formatSSEChunk(completionId, service.model, created, content, undefined, null);
            res.write(sseChunk);
            firstChunk = false;
        }

        const finalChunk = formatSSEChunk(completionId, service.model, created, undefined, undefined, "stop");
        res.write(finalChunk);
        res.write(formatDoneSignal());
        res.end();
        return;
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            error: {
                message: "Internal Server Error",
                type: "server_error",
            },
        });
    }
});

router.get("/v1/models", authenticateToken, (_req, res) => {
    const models = Handler.getModels();
    const response = formatModelsResponse(models);
    return res.status(200).json(response);
});

export default router;
