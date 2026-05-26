import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import docsRouter from "./src/routes/docs";
import chatRouter from "./src/routes/chat";
import openaiRouter from "./src/routes/openai";

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(docsRouter);
app.use(chatRouter);
app.use(openaiRouter);

app.listen(3000, () => {
    console.log("Server is running on port 3000");
});
