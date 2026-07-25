# Grok Backup Memory

**Keep your Grok conversations—beautifully, legally, on your terms.**

A legitimate companion for official Grok (web + iOS + Android apps):

1. **Skill** — install once in Grok; use **`Remember this skill`** and **`Save this`**
2. **Marketing site + web library** — import official export ZIP/JSON, read dialogue + thoughts, export MD/HTML/PDF/EPUB
3. **iOS + Android shells** — polished native chrome with Share / Open-with into the same web core

Not a fake Grok client. Not scraping. Not the Desktop LaunchAgent archive stack.

---

## Quick start (web)

```bash
cd /Users/hattr/grok-backup-memory
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Demo path (Definition of Done)

1. Open `/` — marketing homepage  
2. Open `/import`  
3. Import `fixtures/sample-export.json`  
4. See dialogue + **Thoughts** in `/library`  
5. Re-import the same file → toast **Added 0 · Updated 0 · Skipped 3**  
6. Export **MD / HTML / PDF / EPUB** from a chat  

Week-2 dedupe demo: import `fixtures/sample-export.json`, then `fixtures/sample-export-week2.json` → **Added 1 · Updated 1 · Skipped 2**.

### Tests

```bash
npm test
```

### Production web build

```bash
npm run build
npm start
```

---

## Monorepo layout

```text
apps/web          Next.js — marketing + library (no login, IndexedDB)
apps/ios          SwiftUI WKWebView + Share Extension
apps/android      Kotlin WebView + share intents
packages/core     parse · normalize · dedupe · export
content/skill     paste-ready Grok skill
fixtures          synthetic exports for demos/tests
docs/             PRODUCT · ARCHITECTURE · COPY · PRIVACY
```

---

## Skill (Grok account)

Canonical phrases — **no slash commands**:

| Moment | Phrase |
|--------|--------|
| Start | `Remember this skill` |
| End | `Save this` |

Paste-ready text:

- `content/skill/GROK_MEMORY_SKILL.md`
- Install steps: `content/skill/INSTALL.md`
- Or use the copy buttons on `/skill`

**Save this** contract: Markdown for *this* chat only (no Settings tutorial inside the file). Export tutorial appears **in the Grok chat message**, with a link to `/import`.

---

## Privacy (v1)

- No login  
- Parse export **in the browser**  
- Library stored in **IndexedDB on this device**  
- Details: `docs/PRIVACY.md` and `/privacy`

---

## iOS

```bash
# terminal 1
npm run dev

# Xcode (requires full Xcode app)
open apps/ios/GrokBackupMemory.xcodeproj
```

See `apps/ios/README.md` for Simulator, Share Extension, bundle IDs, App Group.

---

## Android

```bash
# terminal 1
npm run dev

# Android Studio → open apps/android
# Emulator uses http://10.0.2.2:3000 by default
```

See `apps/android/README.md` for share intent testing and signing notes.

---

## Docs

| Doc | Purpose |
|-----|---------|
| `docs/PRODUCT.md` | Product decisions |
| `docs/ARCHITECTURE.md` | System design |
| `docs/COPY.md` | Tone & string map |
| `docs/PRIVACY.md` | Privacy posture |

---

## Human-only unlock checklist

Ship everything else is done in-repo. You still need:

- [ ] Paste skill into Grok Settings → Skills  
- [ ] Production domain + HTTPS deploy of `apps/web`  
- [ ] Point iOS `Config.swift` / Android base URL at production  
- [ ] Apple Developer ID + unique bundle IDs + TestFlight/App Store  
- [ ] Play Console signing + unique `applicationId`  
- [ ] Full Xcode / Android Studio on build machines  

---

## License

MIT — see repository root. Not affiliated with xAI.
