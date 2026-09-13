# Roundhouse V1

Roundhouse is a mobile-first React Native application for iPhone and Android. The Expo web target is retained as a secondary capability, not as the primary product or testing environment.

## Local setup

1. Install the single supported dependency set:

   ```bash
   npm install
   ```

2. Copy `.env.example` to `.env.local` and enter the existing Roundhouse Firebase public configuration and API address.

3. Start a native development build:

   ```bash
   npm run start:device
   ```

## Verification

Run these before opening a review:

```bash
npm run typecheck
npm run lint
npm run doctor
npx expo export --platform ios
npx expo export --platform android
```

## Architecture boundary

- `app/index.tsx` is the mobile Command Center root.
- `app/profile.tsx` owns profile switching.
- `providers/auth-provider.tsx` owns the signed-in Firebase session.
- `providers/profile-provider.tsx` owns persisted active-profile selection.
- New shared records must be scoped to a property or business.
- Do not restore the discarded starter tabs, demo screens, or generic modal route.
