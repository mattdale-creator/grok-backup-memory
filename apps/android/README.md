# Grok Backup Memory — Android

Lightweight **Kotlin** shell: brand-aligned Material UI + `WebView` hosting the same web app, with **share / open-with** intents for ZIP and JSON.

## Requirements

- Android Studio Hedgehog+ (or recent stable)
- JDK 17
- Android SDK 34
- Emulator or device

> This machine may not have Android Studio installed. The Gradle project is complete—open it where the SDK is available.

## Open & run

1. Start the web app on your machine:
   ```bash
   cd /Users/hattr/grok-backup-memory
   npm install
   npm run dev
   ```
2. Open the `apps/android` folder in Android Studio.
3. Let Gradle sync.
4. Create/start an emulator (API 30+ recommended).
5. Run configuration **app**.

### Emulator → host localhost

The app default base URL for emulators is:

```text
http://10.0.2.2:3000
```

(`10.0.2.2` is the special alias to the host loopback from the Android emulator.)

For a physical device on the same Wi-Fi, open **Settings** in the app and set your computer’s LAN IP, e.g. `http://192.168.1.20:3000`.

## Share / Open-with test

1. Push a fixture onto the emulator:
   ```bash
   adb push ../../fixtures/sample-export.json /sdcard/Download/sample-export.json
   ```
2. Open **Files** / **Downloads** → share `sample-export.json` → **Grok Backup Memory**.
3. App opens **Import** route.

Intent filters cover:

- `application/zip`
- `application/json`
- `*/*` (share, best-effort)
- `VIEW` for `file` / `content` schemes

## Package name

```text
com.example.grokbackupmemory
```

Change before Play release.

## Build CLI (optional)

```bash
cd apps/android
./gradlew :app:assembleDebug
```

(Wrapper will download Gradle on first run when network is available.)

## Human unlock checklist

- [ ] Android Studio + SDK installed
- [ ] Unique applicationId
- [ ] Production HTTPS base URL
- [ ] Adaptive icon assets finalized
- [ ] Play Console signing key
- [ ] Privacy policy URL for store listing
