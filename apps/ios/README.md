# Grok Backup Memory — iOS

Lightweight **SwiftUI** shell: branded chrome + `WKWebView` hosting the same web app, plus a **Share Extension** for `.zip` / `.json`.

## Requirements

- macOS with **Xcode 15+** (full Xcode app, not only Command Line Tools)
- Apple Developer account for device / TestFlight / App Store (optional for Simulator)

> This machine may only have Command Line Tools. Open the project on a Mac with full Xcode to build.

## Open & run (Simulator)

1. Start the web app on your Mac:
   ```bash
   cd /Users/hattr/grok-backup-memory
   npm install
   npm run dev
   ```
2. Open `GrokBackupMemory.xcodeproj` in Xcode  
   (`apps/ios/GrokBackupMemory.xcodeproj`)
3. Select scheme **GrokBackupMemory** → iPhone Simulator
4. Set signing Team (any personal team works for Simulator)
5. Run (⌘R)

Simulator reaches the host via `http://127.0.0.1:3000` (default in `Config.swift`).

## Bundle ID placeholders

| Target | Bundle ID |
|--------|-----------|
| App | `com.example.GrokBackupMemory` |
| Share Extension | `com.example.GrokBackupMemory.Share` |
| App Group | `group.com.example.GrokBackupMemory` |

Change these in Xcode → Signing & Capabilities before device installs or App Store.

## Share / Open-with

1. **Share Extension** accepts `public.zip-archive`, `public.json`, and generic data.
2. Shared files are copied into the **App Group** container.
3. Extension opens the main app via URL:
   `grokmemory://import`
4. Main app reads the staged file and loads `/import` in the WebView; user confirms import (or file is injected when bridge is active).

### Test Share on Simulator

1. Save `fixtures/sample-export.json` to Files (drag into Simulator).
2. In Files, Share → **Grok Backup Memory**.
3. App should open the import flow.

### Document types

The app registers as a viewer for JSON and ZIP (`CFBundleDocumentTypes` / `UTExportedTypeDeclarations` in Info.plist) so **Open in…** works from Mail/Files.

## Configuration

Edit `GrokBackupMemory/Config.swift`:

```swift
static var webBaseURL: URL {
    // Dev default
    URL(string: "http://127.0.0.1:3000")!
    // Production:
    // URL(string: "https://your-domain.example")!
}
```

## First-run UX

- Launch screen with brand mark
- Chooser: **Import** or **Open Library**
- Offline banner if the web origin is unreachable

## Human unlock checklist

- [ ] Full Xcode installed
- [ ] Unique bundle IDs + App Group
- [ ] Apple Developer Program membership
- [ ] Production `webBaseURL` (HTTPS)
- [ ] App icons / screenshots for App Store or TestFlight
- [ ] Privacy nutrition labels aligned with `docs/PRIVACY.md`
