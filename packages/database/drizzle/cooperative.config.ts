import { defineConfig } from 'drizzle-kit';

export default defineConfig({
    schema: "./src/schemas/cooperative.ts",
    out: "./migrations/cooperative",
    dialect: "turso",
});
