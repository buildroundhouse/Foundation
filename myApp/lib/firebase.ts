import AsyncStorage from '@react-native-async-storage/async-storage';
import { getApps, initializeApp, type FirebaseApp } from 'firebase/app';
import * as FirebaseAuth from 'firebase/auth';
import { Platform } from 'react-native';

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey
    && firebaseConfig.authDomain
    && firebaseConfig.projectId
    && firebaseConfig.appId,
);

let app: FirebaseApp | null = null;
let auth: FirebaseAuth.Auth | null = null;

if (isFirebaseConfigured) {
  app = getApps().length
    ? getApps()[0]!
    : initializeApp(firebaseConfig as Required<typeof firebaseConfig>);

  if (Platform.OS === 'web') {
    auth = FirebaseAuth.getAuth(app);
  } else {
    // Firebase exposes this from its React Native bundle. The public type is
    // selected by Metro at native build time, while TypeScript sees the shared
    // web declaration, so the small bridge below keeps the boundary explicit.
    const nativeAuth = FirebaseAuth as typeof FirebaseAuth & {
      getReactNativePersistence: (
        storage: typeof AsyncStorage,
      ) => FirebaseAuth.Persistence;
    };

    try {
      auth = FirebaseAuth.initializeAuth(app, {
        persistence: nativeAuth.getReactNativePersistence(AsyncStorage),
      });
    } catch (error) {
      if ((error as { code?: string }).code !== 'auth/already-initialized') throw error;
      auth = FirebaseAuth.getAuth(app);
    }
  }
}

export { app, auth };
