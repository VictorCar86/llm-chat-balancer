import { groqService } from "./services/groq";
import { AIService } from "./types";

export class Handler {
    private services: AIService[];
    private serviceIndex: number;

    constructor() {
        this.services = [groqService];
        this.serviceIndex = 0;
    }

    getService() {
        const service = this.services[this.serviceIndex];
        this.serviceIndex = (this.serviceIndex + 1) % this.services.length;
        return service;
    }
}
