# Fixtures

Synthetic Grok-like export JSON so demos and tests work **without** a private account export.

| File | Purpose |
|------|---------|
| `sample-export.json` | Week-1 snapshot: 3 conversations, thoughts, tool steps, alternate field names |
| `sample-export-week2.json` | Full snapshot including week 1 + one update + one new chat (dedupe demo) |

## Drop in a real export

1. In Grok: **Settings → Data Controls → Export / Download account data**
2. Wait for the email/link if needed
3. Place the `.zip` or `.json` here, e.g. `fixtures/my-export.zip`
4. Open the web app → **Import** → pick that file

Your real export never needs to be committed. Keep private data out of git.
