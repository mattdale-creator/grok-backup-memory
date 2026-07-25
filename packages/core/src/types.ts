/** Normalized roles used across the library */
export type MessageRole = "user" | "assistant" | "system" | "tool" | "unknown";

/** A single thought / thinking-trace segment */
export interface ThoughtSegment {
  id: string;
  text: string;
  order: number;
  source?: string;
}

/** A tool step if present in the export */
export interface ToolStep {
  id: string;
  name?: string;
  status?: string;
  input?: string;
  output?: string;
  order: number;
}

/** Attachment / asset reference (metadata only in v1) */
export interface AttachmentRef {
  id: string;
  name?: string;
  mimeType?: string;
  url?: string;
  path?: string;
}

/** One message in a conversation */
export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  createdAt?: string;
  thoughts: ThoughtSegment[];
  toolSteps: ToolStep[];
  attachments: AttachmentRef[];
  /** Raw source fingerprint for change detection */
  contentHash: string;
}

/** One conversation / chat thread */
export interface Conversation {
  id: string;
  title: string;
  createdAt?: string;
  updatedAt?: string;
  messages: Message[];
  messageCount: number;
  thoughtCount: number;
  /** Source file or package label */
  sourceLabel?: string;
  /** Content hash of whole conversation for skip/update */
  contentHash: string;
}

/** Result of parsing a Grok export */
export interface ParseResult {
  conversations: Conversation[];
  sourceFormat: string;
  warnings: string[];
  stats: {
    conversationCount: number;
    messageCount: number;
    thoughtCount: number;
  };
}

/** Dedupe merge stats */
export interface DedupeStats {
  added: number;
  updated: number;
  skipped: number;
  conversations: Conversation[];
}

/** Options for parsing */
export interface ParseOptions {
  /** Skip heavy media / assets when present */
  skipHeavyMedia?: boolean;
  /** Progress callback 0–1 */
  onProgress?: (progress: number, label?: string) => void;
}

/** Library document stored in IndexedDB */
export interface LibraryMeta {
  version: number;
  importedAt: string;
  lastImportAt?: string;
  conversationCount: number;
}
