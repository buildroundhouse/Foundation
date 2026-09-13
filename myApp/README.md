# Roundhouse V1

Roundhouse is a mobile-first React Native application for iPhone and Android. The Expo web target is retained as a secondary capability, not as the primary product or testing environment.

## Local setup

1. Install the single supported dependency set:

   ```bash
   npm install
   ```

2. Copy `.env.example` to `.env.local` and enter the existing Roundhouse Firebase public configuration and API address.

3. To open V1 on a phone immediately, install Expo Go on the phone and run:

   ```bash
   npm run start:phone
   ```

   Scan the QR code with the phone. This tunnels the React Native bundle; it does not deploy a web app.

4. When a feature needs native code that Expo Go does not contain, use the development build instead:

   ```bash
   npm run start:device
   ```

## Sign-in and API tunnel

- Firebase sign-in needs the four `EXPO_PUBLIC_FIREBASE_*` values in `.env.local`.
- `EXPO_PUBLIC_API_URL` must be the full HTTPS origin of a reachable API, without `/api` at the end.
- When the API runs on your computer, expose its port with an HTTPS tunnel and put that tunnel origin in `EXPO_PUBLIC_API_URL`.
- The app checks `/api/healthz` without blocking the sign-in or Command Center screens.
- Authenticated API requests automatically attach the signed-in Firebase ID token.
- Do not connect V1 to the former outward-account/mode switcher endpoints. The new profile bootstrap contract will follow the profile logic and universal-record rules.

## Verification

Run these before opening a review:

```bash
npm run typecheck
npm run lint
npm run doctor
npm run verify
npx expo export --platform ios
npx expo export --platform android
```

## Architecture boundary

- `app/index.tsx` is the mobile Command Center root.
- `app/profile.tsx` owns profile switching.
- `providers/auth-provider.tsx` owns the signed-in Firebase session.
- `providers/api-provider.tsx` owns API reachability and authenticated requests.
- `providers/profile-provider.tsx` owns persisted active-profile selection.
- `RECORD_SYSTEM.md` governs storage, linking, property continuity, and attribution.
- Created data is stored independently and linked wherever it is allowed to appear.
- Do not restore the discarded starter tabs, demo screens, or generic modal route.
