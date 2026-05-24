import express from "express";
import cors from "cors";
import docsRouter from "./src/routes/docs";
import chatRouter from "./src/routes/chat";

const app = express();

app.use(cors());
app.use(express.json());

app.use(docsRouter);
app.use(chatRouter);

app.listen(3000, () => {
    console.log("Server is running on port 3000");
});
