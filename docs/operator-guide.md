# Operator Guide

## 1. Configure Firebase

Create `.env` from `.env.example` in the `web` directory and fill in the Firebase web app values from Project Settings.

Optional emulator mode:

```env
VITE_USE_FIREBASE_EMULATORS=true
```

## 2. Create the Device Account

1. In Firebase Auth, create one email/password account for the ESP32 prototype.
2. Copy that UID into the `deviceAuthUid` field of any powerbank records the prototype should control.
3. In Realtime Database, create the database instance first if it does not exist yet.
4. In Realtime Database, add:

```json
{
  "deviceRegistry": {
    "<DEVICE_AUTH_UID>": true
  }
}
```

That allowlist enables the device account to write under `/telemetry/*`.

## 2A. Configure the Firmware

Use the Firebase values already used by the web app:

```cpp
static const char* FIREBASE_API_KEY = "AIzaSyAtUdn--e52ChbI-Cft_X_5l0ToZJ0Fffw";
static const char* FIREBASE_PROJECT_ID = "website-9e530";
static const char* FIREBASE_RTDB_URL = "https://website-9e530.firebaseio.com";
```

Point `POWERBANK_ID` at the matching Firestore document ID. The current seeded prototype record is:

```cpp
static const char* POWERBANK_ID = "KFi6dGOMgxODJhIXJphA";
```

Keep Wi-Fi SSID/password and the device email/password local to the firmware source.

## 3. Promote an Admin

1. Let the user register through the app first.
2. In Firestore, open `users/{uid}`.
3. Change:

```json
{
  "role": "admin"
}
```

The admin app becomes available on the next auth refresh or login.

## 4. Seed Powerbanks

Create docs in `powerbanks` with:

```json
{
  "label": "Library Pack 01",
  "location": "Library Desk",
  "status": "available",
  "currentRentalId": null,
  "deviceAuthUid": "<DEVICE_AUTH_UID_OR_NULL>",
  "deviceControl": {
    "desiredAction": "idle",
    "commandVersion": 0
  }
}
```

## 4A. Register RFID Tags for the ESP32 Reader

The ESP32 firmware compares scanned cards against the `tags` collection using the **MFRC522 UID hex string**, not a phone-written NDEF payload.

Create docs in `tags` with:

```json
{
  "code": "04A1B2C3D4",
  "name": "Library Desk Tag",
  "notes": "Paste the UID shown in the ESP32 serial monitor",
  "powerbankId": "<POWERBANK_DOC_ID>",
  "status": "active"
}
```

Accepted UID input formats in the admin UI include values like:

- `04A1B2C3D4`
- `04 A1 B2 C3 D4`
- `04:A1:B2:C3:D4`

The app normalizes those into the same uppercase hex format used by the firmware.

## 5. Local Workflow

```bash
npm run dev
npm run test
firebase emulators:start
```

## 6. Deploy

```bash
npm run build
firebase deploy --only hosting
```
