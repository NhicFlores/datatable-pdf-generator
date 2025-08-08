import "dotenv/config";
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  out: process.env.MIGRATIONS_OUT!,
  schema: process.env.SCHEMA_PATH!,
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  migrations: {
    table: process.env.MIGRATIONS_TABLE!,
    schema: process.env.DEV_SCHEMA!,
  },
  verbose: true,
  strict: true,
});
