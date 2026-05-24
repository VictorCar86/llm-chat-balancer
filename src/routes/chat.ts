import { Router } from "express";
import Handler from "../handler";
import { validateChatSchema, authenticateToken } from "../middlewares";

const router = Router();

router.post("/chat", authenticateToken, validateChatSchema, async (req, res) => {
    try {
        const { messages } = req.body;
        const service = Handler.getService();
        const response = await service.chat(messages);

        res.status(200)
            .set("Content-Type", "text/event-stream")
            .set("Cache-Control", "no-cache")
            .set("Connection", "keep-alive");

        for await (const chunk of response) {
            res.write(chunk);
        }

        res.end();
        return;
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
});

export default router;
