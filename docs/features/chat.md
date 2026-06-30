# Feature: Chat

## Overview

The Chat feature provides a streaming conversation interface with Claude. Users can manage multiple conversations, configure system prompts, adjust model parameters, and view real-time token usage. The UI looks like a developer tool, not a chat app.

## Data Flow

See `docs/architecture/data-flow.md` → "Feature 1: Chat — Streaming Message".

## Data Model

```typescript
type Conversation = {
  id: string;
  title: string;         // Auto-generated from first message
  model: ModelId;
  systemPrompt: string;
  temperature: number | null;
  maxTokens: number;
  messageCount: number;
  totalInputTokens: number;
  totalOutputTokens: number;
  createdAt: Date;
  updatedAt: Date;
};

type Message = {
  id: string;
  conversationId: string;
  role: "user" | "assistant";
  content: string;
  thinking: string | null;    // Extended thinking output
  inputTokens: number;
  outputTokens: number;
  model: string;
  stopReason: string;
  createdAt: Date;
};
```

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/chat/stream` | POST | Start streaming Claude response |
| `/api/chat/stop` | POST | Set abort flag in KV |
| `/_layout.chat` | GET | Load conversation list (loader) |
| `/_layout.chat.$id` | GET | Load conversation + messages (loader) |
| `/_layout.chat.$id` | POST | Create message, update settings (action) |

## UI Components

| Component | Responsibility |
|-----------|---------------|
| `ChatPanel` | Root: state orchestration, keyboard shortcuts |
| `ConversationSidebar` | Conversation list with search |
| `MessageList` | Virtualised scroll list of messages |
| `MessageItem` | Single message with copy + regenerate actions |
| `MessageContent` | Markdown rendering + Shiki code highlighting |
| `ChatInput` | Auto-resize textarea, send/stop button |
| `ModelSelector` | Model dropdown + parameter sliders |
| `SystemPromptEditor` | Collapsible system prompt panel |
| `TokenCounter` | Live token estimate + final count |
| `StreamingIndicator` | Animated dots while streaming |

## Key Design Decisions

- **Streaming via fetch + ReadableStream** — not EventSource. Fetch allows POST bodies (EventSource only supports GET). Client reads the stream byte-by-byte, splits on `\n\n`.
- **Abort via KV flag** — not `AbortController` alone. AbortController stops the client connection but the server-side Claude stream continues billing tokens. KV flag ensures the server closes the SDK stream.
- **Optimistic updates** — user message appears immediately before the server responds. If the server fails, the optimistic message is rolled back.
- **Partial save** — if the stream is interrupted (network, abort), the partial content is saved to D1 with `stopReason: "interrupted"` so history is preserved.
- **Model parameters per conversation** — model, temperature (where supported), and maxTokens are stored on the conversation, not per-message. Changing them affects future messages only.

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Enter` | Send message |
| `Shift+Enter` | Newline in textarea |
| `Escape` | Stop streaming |
| `Cmd/Ctrl+K` | New conversation |
| `Cmd/Ctrl+/` | Toggle system prompt editor |
