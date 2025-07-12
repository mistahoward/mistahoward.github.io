import { defineConfig } from "drizzle-kit";

export default defineConfig({
	schema: "./src/schema.ts",
	out: "./migrations",
	dialect: "sqlite",
	dbCredentials: {
		url: "local.db", // This will be overridden by wrangler
	},
	verbose: true,
	strict: true,
	// Generate migrations that work with D1
	driver: "better-sqlite",
	// Custom migration naming
	migrations: {
		prefix: "migration_",
		table: "drizzle_migrations",
	},
}); 