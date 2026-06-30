import { sqliteTable, text, integer, real, index } from "drizzle-orm/sqlite-core";

export const conversations = sqliteTable(
  "conversations",
  {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull().default("default"),
    title: text("title").notNull().default(""),
    model: text("model").notNull(),
    systemPrompt: text("system_prompt").notNull().default(""),
    temperature: real("temperature"),
    maxTokens: integer("max_tokens").notNull(),
    messageCount: integer("message_count").notNull().default(0),
    totalInputTokens: integer("total_input_tokens").notNull().default(0),
    totalOutputTokens: integer("total_output_tokens").notNull().default(0),
    createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull(),
    deletedAt: integer("deleted_at", { mode: "timestamp_ms" }),
  },
  (t) => ({
    conversationsUserActiveIdx: index("conversations_user_active_idx").on(t.userId, t.deletedAt, t.updatedAt),
  }),
);

export const messages = sqliteTable(
  "messages",
  {
    id: text("id").primaryKey(),
    conversationId: text("conversation_id")
      .notNull()
      .references(() => conversations.id),
    role: text("role", { enum: ["user", "assistant"] }).notNull(),
    content: text("content").notNull(),
    thinking: text("thinking"),
    inputTokens: integer("input_tokens").notNull().default(0),
    outputTokens: integer("output_tokens").notNull().default(0),
    model: text("model").notNull().default(""),
    stopReason: text("stop_reason").notNull().default(""),
    createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
  },
  (t) => ({
    messagesConversationIdx: index("messages_conversation_idx").on(t.conversationId, t.createdAt),
  }),
);

export const promptEntries = sqliteTable("prompt_entries", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().default("default"),
  rawInput: text("raw_input").notNull(),
  analysis: text("analysis").notNull().default("{}"),
  simpleOutput: text("simple_output").notNull().default(""),
  standardOutput: text("standard_output").notNull().default(""),
  professionalOutput: text("professional_output").notNull().default(""),
  researchOutput: text("research_output").notNull().default(""),
  improvements: text("improvements").notNull().default("[]"),
  model: text("model").notNull(),
  inputTokens: integer("input_tokens").notNull().default(0),
  outputTokens: integer("output_tokens").notNull().default(0),
  isFavorite: integer("is_favorite", { mode: "boolean" }).notNull().default(false),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
});

export const tasks = sqliteTable("tasks", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().default("default"),
  goal: text("goal").notNull(),
  status: text("status", {
    enum: ["decomposing", "ready", "running", "paused", "completed", "failed"],
  }).notNull().default("decomposing"),
  model: text("model").notNull(),
  totalSubTasks: integer("total_sub_tasks").notNull().default(0),
  completedSubTasks: integer("completed_sub_tasks").notNull().default(0),
  failedSubTasks: integer("failed_sub_tasks").notNull().default(0),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull(),
  completedAt: integer("completed_at", { mode: "timestamp_ms" }),
});

export const subTasks = sqliteTable("sub_tasks", {
  id: text("id").primaryKey(),
  taskId: text("task_id")
    .notNull()
    .references(() => tasks.id),
  sequenceIndex: integer("sequence_index").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  status: text("status", {
    enum: ["todo", "doing", "done", "failed", "retry"],
  }).notNull().default("todo"),
  retryCount: integer("retry_count").notNull().default(0),
  maxRetries: integer("max_retries").notNull().default(2),
  planOutput: text("plan_output"),
  executeOutput: text("execute_output"),
  reviewOutput: text("review_output"),
  improveOutput: text("improve_output"),
  inputTokens: integer("input_tokens").notNull().default(0),
  outputTokens: integer("output_tokens").notNull().default(0),
  errorMessage: text("error_message"),
  startedAt: integer("started_at", { mode: "timestamp_ms" }),
  completedAt: integer("completed_at", { mode: "timestamp_ms" }),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
});

export const taskLogs = sqliteTable("task_logs", {
  id: text("id").primaryKey(),
  subTaskId: text("sub_task_id")
    .notNull()
    .references(() => subTasks.id),
  phase: text("phase", {
    enum: ["plan", "execute", "review", "improve", "system"],
  }).notNull(),
  level: text("level", {
    enum: ["debug", "info", "warn", "error"],
  }).notNull(),
  message: text("message").notNull(),
  data: text("data"),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
});

export type Conversation = typeof conversations.$inferSelect;
export type NewConversation = typeof conversations.$inferInsert;
export type Message = typeof messages.$inferSelect;
export type NewMessage = typeof messages.$inferInsert;
export type PromptEntry = typeof promptEntries.$inferSelect;
export type NewPromptEntry = typeof promptEntries.$inferInsert;
export type Task = typeof tasks.$inferSelect;
export type NewTask = typeof tasks.$inferInsert;
export type SubTask = typeof subTasks.$inferSelect;
export type NewSubTask = typeof subTasks.$inferInsert;
export type TaskLog = typeof taskLogs.$inferSelect;
export type NewTaskLog = typeof taskLogs.$inferInsert;
