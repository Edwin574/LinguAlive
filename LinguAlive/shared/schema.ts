import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const recordings = pgTable("recordings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  audioUrl: text("audio_url").notNull(),
  transcription: text("transcription"),
  theme: varchar("theme", { length: 50 }).notNull(),
  ageRange: varchar("age_range", { length: 20 }),
  gender: varchar("gender", { length: 30 }),
  location: text("location"),
  additionalContext: text("additional_context"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertRecordingSchema = createInsertSchema(recordings).omit({
  id: true,
  createdAt: true,
});

export type InsertRecording = z.infer<typeof insertRecordingSchema>;
export type Recording = typeof recordings.$inferSelect;

export const contactMessages = pgTable("contact_messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  email: text("email").notNull(),
  message: text("message").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertContactMessageSchema = createInsertSchema(contactMessages).omit({
  id: true,
  createdAt: true,
});

export type InsertContactMessage = z.infer<typeof insertContactMessageSchema>;
export type ContactMessage = typeof contactMessages.$inferSelect;

export const themes = [
  "Song",
  "Word",
  "Proverb",
  "Conversation",
  "Greeting",
  "Story",
  "Other"
] as const;

export const ageRanges = [
  "Under 18",
  "18-25",
  "26-40",
  "41+"
] as const;

export const genders = [
  "Male",
  "Female",
  "Other",
  "Prefer not to say"
] as const;
