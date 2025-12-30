import express from "express";
import cors from "cors";
import { Handler } from "./src/handler";

const app = express();

app.use(cors());
app.use(express.json());

app.post("/chat", async (req, res) => {
    try {
        const { messages } = req.body;
        const service = new Handler().getService();
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

app.listen(3000, () => {
    console.log("Server is running on port 3000");
});