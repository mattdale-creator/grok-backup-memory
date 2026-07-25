# First build vs redo (v1.1) — what to use

**Production codebase (use this):** `/Users/hattr/grok-backup-memory`  
**Scratch redo (comparison only):** `/Users/hattr/grok-backup-memory-redo`

The redo was rebuilt from scratch with lessons learned. **Best improvements are already merged into the production repo.** You do not need to run the redo daily.

| Area | First build | Redo improvement | Merged into main? |
|------|-------------|------------------|-------------------|
| Parse resilience | Preferred keys only | Deep discovery + bare message arrays + nested `user_conversations` | Yes |
| Thought fields | Common names | + `reasoning_content`, thought de-dupe in message | Yes |
| IndexedDB save | Multiple sequential transactions | **One atomic** put/delete/meta transaction | Yes |
| App state | Each page loads DB alone | **LibraryProvider** shared import/library state | Yes |
| Demo friction | Click “Try demo sample” | **`/import?demo=1`** auto-import; **`?demo=week2`** | Yes |
| Dedupe demo UX | Manual re-import | **Demo week-2 button** + deep link | Yes |
| Library search | Title + message body | Also searches **thoughts** | Yes |
| Bulk export | Per-chat only | **Select + Export selected MD** | Yes |
| PWA | None | **manifest.webmanifest** (Add to Dock / home screen) | Yes |
| Verify script | Manual | **`npm run verify`** headless fixture checks | Yes |
| Nested fixture | No | `fixtures/nested-export.json` | Yes |
| Native shells | Complete Swift/Kotlin projects | Same (copied; no material change) | N/A (already in main) |
| Marketing/skill | Complete | Same quality, not rewritten | N/A |

## What the redo did *not* beat

- Distinctive visual brand / homepage copy (first build was already strong)
- iOS Share Extension + Android intents structure (already complete)
- Skill phrase contracts and product docs

## Recommendation

Keep using **`grok-backup-memory`**. Treat **`grok-backup-memory-redo`** as an archive/reference; delete later if you want less clutter.
