## Enqueue – Local Development Setup

This guide explains how to run the app locally and what environment configuration (including Firebase) is required.

---

## Prerequisites

- **Node.js**: v18+ (LTS recommended)
- **Package manager**: npm (comes with Node)
- **Firebase project**: You need access to a Firebase project with:
  - Firebase Authentication enabled (Google provider)
  - Realtime Database enabled
- **Backend/functions base URL**: A deployed or locally running backend that exposes the admin/auth endpoints used by the dashboard.

---

## 1. Install dependencies

From the project root:

```bash
npm install
```

---

## 2. Environment variables

Create a `.env.local` file in the project root. Next.js will automatically load values from this file in development.

The app expects the following variables (as used in `app/lib/config/firebase.ts` and `app/lib/config/api.ts`):

```bash
NEXT_PUBLIC_API_KEY=your-firebase-web-api-key
NEXT_PUBLIC_AUTH_DOMAIN=your-firebase-auth-domain
NEXT_PUBLIC_DATABASE_URL=your-firebase-realtime-db-url
NEXT_PUBLIC_PROJECT_ID=your-firebase-project-id
NEXT_PUBLIC_STORAGE_BUCKET=your-firebase-storage-bucket
NEXT_PUBLIC_MESSAGING_SENDER_ID=your-firebase-messaging-sender-id
NEXT_PUBLIC_APP_ID=your-firebase-app-id

# Base URL for your backend / Cloud Functions
NEXT_PUBLIC_FUNCTIONS_BASE_URL=https://your-functions-or-backend-base-url
```

### How these are used

- **Firebase config** (`app/lib/config/firebase.ts`):
  - Builds `firebaseConfig` using:
    - `NEXT_PUBLIC_API_KEY`
    - `NEXT_PUBLIC_AUTH_DOMAIN`
    - `NEXT_PUBLIC_DATABASE_URL`
    - `NEXT_PUBLIC_PROJECT_ID`
    - `NEXT_PUBLIC_STORAGE_BUCKET`
    - `NEXT_PUBLIC_MESSAGING_SENDER_ID`
    - `NEXT_PUBLIC_APP_ID`
- **API client** (`app/lib/config/api.ts` and `app/lib/auth/signInWithGoogle.ts`):
  - Uses `NEXT_PUBLIC_FUNCTIONS_BASE_URL` as the base URL for authenticated admin endpoints.

Make sure these values match the **Web app** configuration from your Firebase console (Project settings → General → Your apps → Web app) and your backend deployment URL.

---

## 3. Firebase configuration (from `app/lib/config/firebase.ts`)

The Firebase client SDK is initialized like this:

```ts
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_AUTH_DOMAIN,
  databaseURL: process.env.NEXT_PUBLIC_DATABASE_URL,
  projectId: process.env.NEXT_PUBLIC_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_APP_ID,
};
```

To obtain these values:

1. Go to **Firebase Console → Your Project → Project settings → General**.
2. Under **Your apps**, create or select a **Web app**.
3. Copy the values from the generated config and paste them into `.env.local` under the corresponding `NEXT_PUBLIC_*` keys.
4. For `NEXT_PUBLIC_DATABASE_URL`, ensure Realtime Database is enabled and copy its URL.

---

## 4. Running the app locally

From the project root:

```bash
npm run dev
```

By default, the app runs on `http://localhost:3004` (see the `dev` script in `package.json`).

---

## 5. Verifying your setup

1. Start the dev server: `npm run dev`.
2. Open `http://localhost:3004` in your browser.
3. Use **Sign in with Google**:
   - The app will:
     - Sign in using Firebase Auth.
     - Fetch an ID token.
     - Call `${NEXT_PUBLIC_FUNCTIONS_BASE_URL}/auth/admin/me` with a `Bearer` token header.
4. Ensure your backend is configured to:
   - Verify the Firebase ID token.
   - Restrict access to admin users as expected.

If you see authentication or network errors, double‑check:

- `.env.local` values
- Firebase project configuration
- That your `NEXT_PUBLIC_FUNCTIONS_BASE_URL` endpoint is reachable from the browser

---

## 6. Production notes (high level)

- Use environment variables appropriate to your production Firebase project and backend deployment.
- Never commit `.env.local` or any secret configuration to git.
- Prefer deployment platforms that support seamless environment variable management (e.g. Vercel, Netlify, Render, etc.).

