import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
export const teams = sqliteTable("teams", {
  id: text("id").primaryKey(),
  code: text("code").notNull().unique(),
  state: text("state").notNull(),
  version: integer("version").notNull().default(0),
});
export const members = sqliteTable("members", {
  id: text("id").primaryKey(),
  teamId: text("team_id").notNull(),
  tokenHash: text("token_hash").notNull().unique(),
});
