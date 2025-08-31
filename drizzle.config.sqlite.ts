import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "sqlite",
  driver: "expo",
  schema: "./lib/local-db/schema.ts",
  out: "./drizzle/sqlite",
});
