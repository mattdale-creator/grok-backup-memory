import type { Conversation, DedupeStats, Message } from "./types.js";
import { conversationHash } from "./hash.js";

function mergeMessages(existing: Message[], incoming: Message[]): Message[] {
  const map = new Map<string, Message>();
  for (const m of existing) map.set(m.id, m);
  for (const m of incoming) {
    const prev = map.get(m.id);
    if (!prev) {
      map.set(m.id, m);
      continue;
    }
    // Update if content changed
    if (prev.contentHash !== m.contentHash) {
      map.set(m.id, m);
    }
  }
  // Preserve chronological-ish order: by createdAt then original order
  return [...map.values()].sort((a, b) => {
    const ta = Date.parse(a.createdAt ?? "") || 0;
    const tb = Date.parse(b.createdAt ?? "") || 0;
    if (ta !== tb) return ta - tb;
    return a.id.localeCompare(b.id);
  });
}

function recompute(conv: Conversation): Conversation {
  const thoughtCount = conv.messages.reduce((n, m) => n + m.thoughts.length, 0);
  return {
    ...conv,
    messageCount: conv.messages.length,
    thoughtCount,
    contentHash: conversationHash({
      id: conv.id,
      title: conv.title,
      messages: conv.messages,
    }),
  };
}

/**
 * Merge a new export snapshot into the existing library.
 * Official exports are typically full snapshots — re-import should:
 * - skip unchanged conversations
 * - update modified ones
 * - add only new ones
 */
export function dedupeMerge(
  existing: Conversation[],
  incoming: Conversation[],
): DedupeStats {
  const byId = new Map<string, Conversation>();
  for (const c of existing) byId.set(c.id, c);

  let added = 0;
  let updated = 0;
  let skipped = 0;

  for (const inc of incoming) {
    const prev = byId.get(inc.id);
    if (!prev) {
      byId.set(inc.id, recompute(inc));
      added += 1;
      continue;
    }

    if (prev.contentHash === inc.contentHash) {
      skipped += 1;
      continue;
    }

    // Merge messages for partial updates; prefer newer title/dates
    const mergedMessages = mergeMessages(prev.messages, inc.messages);
    const merged: Conversation = recompute({
      ...prev,
      title:
        inc.title && inc.title !== "Untitled conversation"
          ? inc.title
          : prev.title,
      createdAt: prev.createdAt ?? inc.createdAt,
      updatedAt: inc.updatedAt ?? prev.updatedAt,
      messages: mergedMessages,
      sourceLabel: inc.sourceLabel ?? prev.sourceLabel,
    });

    // If merge resulted in identical hash, count as skipped
    if (merged.contentHash === prev.contentHash) {
      skipped += 1;
    } else {
      byId.set(inc.id, merged);
      updated += 1;
    }
  }

  const conversations = [...byId.values()].sort((a, b) => {
    const ta = Date.parse(a.updatedAt ?? a.createdAt ?? "") || 0;
    const tb = Date.parse(b.updatedAt ?? b.createdAt ?? "") || 0;
    return tb - ta;
  });

  return { added, updated, skipped, conversations };
}

/** Human-friendly toast string */
export function formatDedupeToast(stats: Pick<DedupeStats, "added" | "updated" | "skipped">): string {
  return `Added ${stats.added} · Updated ${stats.updated} · Skipped ${stats.skipped}`;
}
