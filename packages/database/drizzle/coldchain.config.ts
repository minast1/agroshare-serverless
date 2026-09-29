import { defineConfig } from 'drizzle-kit';

export default defineConfig({
    schema: "./src/schemas/coldchain.ts",
    out: "./migrations/coldchain",
    dialect: "turso"
});
