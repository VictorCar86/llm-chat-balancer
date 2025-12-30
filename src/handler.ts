import { groqService } from "./services/groq";
import { cerebrasService } from "./services/cerebras";
import { geminiService } from "./services/gemini";
import { AIService } from "./types";

class Handler {
    private services: AIService[];
    private serviceIndex: number;

    constructor() {
        this.services = [groqService, cerebrasService, geminiService];
        this.serviceIndex = 0;
    }

    getService(): AIService {
        const service: AIService = this.services[this.serviceIndex];
        this.serviceIndex = (this.serviceIndex + 1) % this.services.length;
        return service;
    }
}

export default new Handler();
