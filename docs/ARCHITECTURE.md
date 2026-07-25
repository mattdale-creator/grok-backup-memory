# Architecture

## Monorepo

```text
grok-backup-memory/
  apps/web          Next.js App Router — marketing + library
  apps/ios          SwiftUI WKWebView shell + Share Extension
  apps/android      Kotlin WebView shell + share intents
  packages/core     Parse, normalize, dedupe, export (TypeScript)
  content/skill     Paste-ready Grok skill
  fixtures          Synthetic export JSON for demos/tests
  docs              Product, copy, privacy, architecture
```

## Core package (`@grok-memory/core`)

| Module | Responsibility |
|--------|----------------|
| `parseGrokExport` | JSON / ZIP / NDJSON → `ParseResult` |
| `normalizeConversation` / `normalizeMessage` | Resilient field mapping, thoughts, tools |
| `dedupeMerge` | Full-snapshot re-import: add / update / skip by id + content hash |
| `toMarkdown` / `toHtml` / `toPdfBytes` / `toEpub` | Library exports |

Thoughts: `thinking_trace`, `agent_thinking_traces`, nested metadata, alternate `thinking` fields.

## Web app

- **Marketing** routes are static React Server Components where possible.
- **Import / library** are client components: File API + IndexedDB (`idb`).
- Core is transpiled into the Next bundle (`transpilePackages` / source alias).
- No server-side chat storage in v1.

## Native shells

Both platforms host the same web origin:

1. Launch → WebView loads `{baseUrl}/library` (or first-run chooser).
2. Share / open file → copy into app sandbox → open `{baseUrl}/import` and hand off via query or bridge when possible; otherwise user picks the file (document provider / share sheet leaves file accessible).

Default `baseUrl`:

- Dev: `http://localhost:3000` (iOS Simulator / Android emulator host mapping documented in app READMEs)
- Prod placeholder: set `WEB_BASE_URL` / build config

## Privacy boundary

```text
[Grok official] --export file--> [User device]
                                      |
                                      v
                              parseGrokExport (client)
                                      |
                                      v
                                 IndexedDB library
                                      |
                                      v
                              MD / HTML / PDF / EPUB download
```

## v2 hooks (stubs only)

- Optional Google / X OAuth  
- Optional paid sync  

Interfaces may exist as comments; no requirement for v1.

## Testing

```bash
npm test   # packages/core vitest + fixtures
```

Drop a real export into `fixtures/` locally (gitignored patterns recommended) for manual QA.
