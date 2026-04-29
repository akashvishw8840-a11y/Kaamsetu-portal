# KaamSetu Real Production Setup (Netlify + Firebase)

## 1) Firebase project setup
- Create Firebase project.
- Enable Authentication -> Phone.
- Enable Firestore (production mode).
- Enable Cloud Functions.
- Add web app and copy Firebase config values.
- In Authentication -> Settings -> Authorized domains, add your Netlify domain.

## 2) Update frontend config
In `kaamsetu_whatsapp_portal.html`, replace placeholder values in `APP_CONFIG`:
- `firebaseApiKey`
- `firebaseAuthDomain`
- `firebaseProjectId`
- `firebaseStorageBucket`
- `firebaseMessagingSenderId`
- `firebaseAppId`

Also set your exact Google Form URL in `APPLY_FORM_URL`.

## 3) Netlify setup
- Create a Netlify site from this folder.
- Ensure functions directory is `netlify/functions` (already in `netlify.toml`).
- Add env var in Netlify:
  - `OPENAI_API_KEY`

## 4) Firebase functions setup
From `functions/`:
- `npm install`
- `firebase login`
- `firebase init functions` (if not already initialized in project)
- Set secret:
  - `firebase functions:secrets:set RESEND_API_KEY`
- Deploy:
  - `firebase deploy --only functions`

## 5) Email service
- Create Resend account and API key.
- Default sender in `functions/index.js` uses `onboarding@resend.dev`.
- For production custom domain, verify domain in Resend and update `from` address.

## 6) Firestore security rules
- Deploy `firestore.rules` from Firebase console or CLI.

## 7) End-to-end checks
- OTP login should succeed on hosted Netlify URL.
- New login should create `login_events` doc and trigger email to `gauravvishwakarma8840@gmail.com`.
- Posting job should write `jobs` collection.
- AI message should hit `/.netlify/functions/chat`.
- Apply should open Google Form and create `apply_events`.
