import { groqService } from "./services/groq";
import { cerebrasService } from "./services/cerebras";
import { AIService } from "./types";

class Handler {
    private services: AIService[];
    private serviceIndex: number;

    constructor() {
        this.services = [groqService, cerebrasService];
        this.serviceIndex = 0;
    }

    getService() {
        const service = this.services[this.serviceIndex];
        this.serviceIndex = (this.serviceIndex + 1) % this.services.length;
        return service;
    }
}

export default new Handler();