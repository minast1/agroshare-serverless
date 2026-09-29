import { defineConfig } from 'drizzle-kit';

export default defineConfig({
    schema: "./src/schemas/fleet.ts",
    out: "./migrations/fleet",
    dialect: "turso"
});
