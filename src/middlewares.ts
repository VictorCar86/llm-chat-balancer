import { NextFunction, Request, Response } from "express";
import { chatSchema } from "./schemas";

export function validateChatSchema(req: Request, res: Response, next: NextFunction) {
    const validation = chatSchema.safeParse(req.body);
    if (!validation.success) {
        return res.status(400).send(validation.error.message);
    }
    const result = validation.data;
    req.body = result;
    next();
}