# Product — Grok Backup Memory

## Name

- **Product:** Grok Backup Memory  
- **Short UI brand:** Grok Memory  
- **Tagline:** Keep your Grok conversations—beautifully, legally, on your terms.

## What it is

A legitimate companion for **official Grok** (grok.com + iOS + Android):

1. **Skill** (install once in Grok) — daily ritual to save *this* chat as Markdown + in-chat instructions for full account export.
2. **Marketing website** — clear homepage for find / understand / onboard.
3. **Web app** — import official export ZIP/JSON → beautiful library (dialogue + thoughts), dedupe, export MD/HTML/PDF/EPUB.
4. **iOS + Android** — lightweight native shells: Share / Open-with + polished WebView of the same app.

## What it is not

- Not a fake Grok client  
- Not screen recording / accessibility scrape / Thoughts UI click-bots  
- Not the Desktop LaunchAgent archive stack (separate project)  
- Not CLI-as-product  
- Not slash-commands (`/…`)  
- Not requiring users to upload the full export into Grok chat as the main path  

## Trust & legality

- Official Grok Skills only for in-Grok behavior  
- Official Settings → Data Controls export for full JSON/ZIP  
- User saves files via normal OS download/share  
- v1 prefers client-side parse (privacy); site is still a real hosted-capable website  

## Skill phrases (canonical)

| Moment | Phrase |
|--------|--------|
| Start / arm session | **Remember this skill** |
| End / package this chat | **Save this** |

### Behavior

- Account-persistent once created (web + iOS + Android Grok for that account).
- Soft auto-apply is a bonus; never tell users whether a turn was auto or phrase.
- Always train start + end habits.
- Users always use **Save this** for the downloadable package.
- Fallback docs may mention **Run remember this skill** — never slash commands.

### Save this contract

1. Downloadable Markdown for **this conversation only** (dialogue + thoughts if available).  
2. Markdown must **not** contain Settings/export tutorial.  
3. In the chat message: short numbered steps for official export + link to `/import`.  
4. Offer the file for download in-chat.

## Information architecture (web)

| Route | Purpose |
|-------|---------|
| `/` | Marketing homepage |
| `/skill` | Install skill |
| `/library` (alias `/app`) | Library shell |
| `/import` | Deep-link import |
| `/privacy` | Plain-language privacy |
| `/how-it-works` | Journey detail |

## Web app v1

- **No login**  
- Import ZIP/JSON (drag-drop + file picker)  
- Parse resilient Grok-like shapes (messages, thoughts, steps)  
- Progress UI; optional skip heavy media  
- **Dedupe** on re-import: Added X · Updated Y · Skipped Z  
- Library: list, detail (dialogue + thoughts), search  
- Export: MD, HTML, PDF, EPUB  
- Storage: IndexedDB on device  

## Native apps

- Load web app (configurable base URL)  
- Share / Open-with for `.zip` / `.json` → import  
- Polished brand chrome; offline messaging if web unreachable  

## Out of scope for this repo

- Desktop LaunchAgent archive stack  
- Store signing secrets / production domain DNS (human unlock)  
