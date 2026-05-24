import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { chatSchema } from "./schemas";

const JWT_SECRET = process.env.JWT_SECRET!;

export function authenticateToken(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ error: "Missing or invalid Authorization header. Format: Bearer <token>" });
    }

    const token = authHeader.split(" ")[1];

    try {
        jwt.verify(token, JWT_SECRET);
        next();
    } catch {
        return res.status(403).json({ error: "Invalid or expired token" });
    }
}

function isValidDocsToken(token: string): boolean {
    try {
        jwt.verify(token, JWT_SECRET);
        return true;
    } catch {
        return false;
    }
}

const LOGIN_PAGE = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Documentation Login</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            background: #1a1a2e;
            color: #e0e0e0;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
        }
        .card {
            background: #16213e;
            border-radius: 12px;
            padding: 40px;
            width: 100%;
            max-width: 420px;
            box-shadow: 0 8px 32px rgba(0,0,0,0.3);
        }
        h1 { font-size: 1.5rem; margin-bottom: 8px; color: #fff; }
        p.subtitle { font-size: 0.9rem; color: #8892b0; margin-bottom: 24px; }
        label { display: block; font-size: 0.85rem; color: #8892b0; margin-bottom: 6px; }
        input[type="text"] {
            width: 100%;
            padding: 12px 14px;
            border: 1px solid #233554;
            border-radius: 8px;
            background: #0a0f1e;
            color: #e0e0e0;
            font-size: 0.95rem;
            outline: none;
            transition: border-color 0.2s;
        }
        input[type="text"]:focus { border-color: #64ffda; }
        button {
            margin-top: 18px;
            width: 100%;
            padding: 12px;
            border: none;
            border-radius: 8px;
            background: #64ffda;
            color: #0a0f1e;
            font-size: 1rem;
            font-weight: 600;
            cursor: pointer;
            transition: background 0.2s;
        }
        button:hover { background: #45e6c2; }
        .error {
            background: #ff6b6b22;
            border: 1px solid #ff6b6b;
            color: #ff6b6b;
            padding: 10px 14px;
            border-radius: 8px;
            margin-bottom: 16px;
            font-size: 0.85rem;
            display: none;
        }
        .error.visible { display: block; }
    </style>
</head>
<body>
    <div class="card">
        <h1>Documentation Access</h1>
        <p class="subtitle">Enter your API token to continue</p>
        <div class="error" id="error"></div>
        <form id="loginForm" method="POST" action="/docs/login">
            <label for="token">Token</label>
            <input type="text" id="token" name="token" placeholder="eyJhbGci..." autocomplete="off" required />
            <button type="submit">Continue</button>
        </form>
    </div>
    <script>
        const params = new URLSearchParams(window.location.search);
        if (params.get("error")) {
            const el = document.getElementById("error");
            el.textContent = params.get("error") === "invalid" ? "Invalid or expired token" : "Access denied";
            el.classList.add("visible");
        }
    </script>
</body>
</html>`;

export function docsAuthGuard(req: Request, res: Response, next: NextFunction) {
    const token = req.cookies?.auth_token;
    if (token && isValidDocsToken(token)) {
        return next();
    }
    res.setHeader("Content-Type", "text/html");
    res.status(401).send(LOGIN_PAGE);
}

export function docsLoginHandler(req: Request, res: Response) {
    const { token } = req.body;
    if (!token || !isValidDocsToken(token)) {
        return res.redirect("/docs?error=invalid");
    }
    res.cookie("auth_token", token, {
        httpOnly: true,
        sameSite: "strict",
        maxAge: 30 * 24 * 60 * 60 * 1000,
    });
    res.redirect("/docs");
}

export function validateChatSchema(req: Request, res: Response, next: NextFunction) {
    const validation = chatSchema.safeParse(req.body);
    if (!validation.success) {
        return res.status(400).send(validation.error.message);
    }
    const result = validation.data;
    req.body = result;
    next();
}