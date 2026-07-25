# When you wake up — demo in under 3 minutes

You do **not** need Apple accounts, Play Store, or Grok skill paste to **see** the product.

---

## Option A (easiest)

1. On your **Desktop**, double-click:  
   **`Open Grok Memory Demo.command`**
2. If macOS asks “are you sure?”, right-click → **Open** → **Open**.
3. Your browser should open the **Demo hub**.

---

## Option B (if Option A fails)

1. Open **Terminal** (Spotlight → type `Terminal` → Enter).
2. Paste this line and press Enter:

```bash
cd /Users/hattr/grok-backup-memory && ./scripts/open-demo.command
```

3. Browser opens automatically.

---

## What to click (in order)

| # | Open this | What to do |
|---|-----------|------------|
| 1 | [http://localhost:3000/demo](http://localhost:3000/demo) | Demo hub — read the short path |
| 2 | [http://localhost:3000/import](http://localhost:3000/import) | Click **Try demo sample** |
| 3 | [http://localhost:3000/library](http://localhost:3000/library) | Open a chat · expand **Thoughts** · try **MD / HTML / PDF / EPUB** |
| 4 | Import again | Click **Try demo sample** again → toast like **Skipped 3** (dedupe) |
| 5 | [http://localhost:3000/demo/ios](http://localhost:3000/demo/ios) | Phone-frame iOS shell (real app inside) |
| 6 | [http://localhost:3000/demo/android](http://localhost:3000/demo/android) | Phone-frame Android shell |
| 7 | [http://localhost:3000/](http://localhost:3000/) | Marketing homepage |
| 8 | [http://localhost:3000/skill](http://localhost:3000/skill) | Skill copy buttons (for later, in real Grok) |

---

## Direct demo links (bookmark these)

- **Demo hub:** http://localhost:3000/demo  
- **Live web app import:** http://localhost:3000/import  
- **Library:** http://localhost:3000/library  
- **iOS shell clone (browser):** http://localhost:3000/demo/ios  
- **Android shell clone (browser):** http://localhost:3000/demo/android  
- **Homepage:** http://localhost:3000/  
- **Skill page:** http://localhost:3000/skill  
- **Privacy:** http://localhost:3000/privacy  
- **How it works:** http://localhost:3000/how-it-works  

---

## Later (human-only — after you like the demos)

1. Paste skill from `/skill` into Grok → Settings → Skills  
2. Install full Xcode to run real iOS Simulator (`apps/ios`)  
3. Install Android Studio to run real emulator (`apps/android`)  
4. Deploy website + store signing when you want public users  

Full product docs: `README.md`, `docs/PRODUCT.md`
