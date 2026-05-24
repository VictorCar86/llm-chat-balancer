import { Router } from "express";
import { openApiSpec } from "../openapi";
import { docsAuthGuard, docsLoginHandler } from "../middlewares";

const router = Router();

router.post("/docs/login", docsLoginHandler);

router.get("/openapi.json", docsAuthGuard, (req, res) => res.json(openApiSpec));

router.get("/docs", docsAuthGuard, (req, res) => {
    res.setHeader("Content-Type", "text/html");
    res.send(`<!DOCTYPE html>
<html>
<head>
    <title>Swagger UI</title>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui.css" />
</head>
<body>
    <div id="swagger-ui"></div>
    <script src="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
<script>
        window.onload = () => {
            SwaggerUIBundle({
                url: "/openapi.json",
                dom_id: "#swagger-ui",
            });
        };
    </script>
</body>
</html>`);
});

router.get("/redoc", docsAuthGuard, (req, res) => {
    res.setHeader("Content-Type", "text/html");
    res.send(`<!DOCTYPE html>
<html>
<head>
    <title>ReDoc</title>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <link href="https://fonts.googleapis.com/css?family=Montserrat:300,400,700|Roboto:300,400,700" rel="stylesheet" />
</head>
<body>
    <redoc spec-url="/openapi.json"></redoc>
    <script src="https://cdn.jsdelivr.net/npm/redoc@2/bundles/redoc.standalone.js"></script>
</body>
</html>`);
});

export default router;