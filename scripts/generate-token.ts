import jwt from "jsonwebtoken";
import { config } from "dotenv";

config();

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
    console.error("Error: JWT_SECRET no está definido en el archivo .env");
    process.exit(1);
}

const user = process.argv[2];
const expiresIn = process.argv[3] || "30m";

if (!user) {
    console.error("Uso: bun run generate-token <nombre_usuario> [expiración]");
    console.error();
    console.error("Argumentos:");
    console.error("  nombre_usuario   (requerido) Nombre del usuario");
    console.error("  expiración       (opcional) Duración del token, por defecto 30m");
    console.error();
    console.error("Formatos de expiración:");
    console.error("  30m              30 minutos");
    console.error("  1h               1 hora");
    console.error("  10d              10 días");
    console.error("  permanent        Sin expiración");
    console.error();
    console.error("Ejemplos:");
    console.error("  bun run generate-token user");
    console.error("  bun run generate-token user 1h");
    console.error("  bun run generate-token admin permanent");
    process.exit(1);
}

const permanent = expiresIn.toLowerCase() === "permanent";

const options: jwt.SignOptions = permanent ? {} : { expiresIn };
const token = jwt.sign({ user }, JWT_SECRET, options);

console.log(`Token generado para "${user}":\n`);
console.log(token);
console.log(`\nExpiración: ${permanent ? "Sin expiración (permanente)" : expiresIn}`);
console.log(`\nUso: Authorization: Bearer ${token}`);