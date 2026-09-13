import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';

import { AppLoading } from '@/components/app-loading';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { ApiProvider } from '@/providers/api-provider';
import { AuthProvider, useAuth } from '@/providers/auth-provider';
import { ProfileProvider, useProfiles } from '@/providers/profile-provider';

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AuthProvider>
        <ApiProvider>
          <ProfileProvider>
            <RootNavigator />
          </ProfileProvider>
        </ApiProvider>
      </AuthProvider>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}

function RootNavigator() {
  const router = useRouter();
  const segments = useSegments();
  const { configured, isLoaded: authLoaded, isSignedIn } = useAuth();
  const { isLoaded: profilesLoaded } = useProfiles();
  const inAuthGroup = segments[0] === '(auth)';

  useEffect(() => {
    if (!authLoaded || !profilesLoaded) return;

    if ((!configured || !isSignedIn) && !inAuthGroup) {
      router.replace('/sign-in');
      return;
    }

    if (configured && isSignedIn && inAuthGroup) {
      router.replace('/');
    }
  }, [authLoaded, configured, inAuthGroup, isSignedIn, profilesLoaded, router]);

  if (!authLoaded || !profilesLoaded) return <AppLoading />;

  return (
      <Stack>
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="profile" options={{ headerShown: false }} />
      </Stack>
  );
}
