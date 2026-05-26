import { groqService } from "./services/groq";
import { cerebrasService } from "./services/cerebras";
import { geminiService } from "./services/gemini";
import { AIService, OpenAIModel } from "./types";

class Handler {
    private services: AIService[];
    private serviceIndex: number;

    constructor() {
        this.services = [
            groqService,
            cerebrasService,
            geminiService,
        ];
        this.serviceIndex = 0;
    }

    getService(): AIService {
        const service: AIService = this.services[this.serviceIndex];
        this.serviceIndex = (this.serviceIndex + 1) % this.services.length;
        return service;
    }

    getServiceByModel(model: string): AIService | undefined {
        return this.services.find((s) => s.model === model);
    }

    getServices(): AIService[] {
        return this.services;
    }

    getModels(): OpenAIModel[] {
        return this.services.map((s) => ({
            id: s.model,
            object: "model" as const,
            created: s.created,
            owned_by: s.owned_by,
        }));
    }
}

export default new Handler();
