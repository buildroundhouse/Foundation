import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import {
  profileById,
  ROUNDHOUSE_PROFILES,
  type RoundhouseProfile,
} from '@/lib/profiles';
import { useAuth } from '@/providers/auth-provider';

const activeProfileKey = (userId: string | null) =>
  `@roundhouse/${userId ?? 'local'}/active-profile-id`;

type ProfileContextValue = {
  activeProfile: RoundhouseProfile;
  isLoaded: boolean;
  profiles: RoundhouseProfile[];
  selectProfile: (profileId: string) => Promise<void>;
};

const ProfileContext = createContext<ProfileContextValue | null>(null);

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const { isLoaded: authLoaded, user } = useAuth();
  const [activeProfileId, setActiveProfileId] = useState(ROUNDHOUSE_PROFILES[0].id);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (!authLoaded) return;
    let active = true;
    setIsLoaded(false);

    AsyncStorage.getItem(activeProfileKey(user?.uid ?? null))
      .then((storedId) => {
        if (active) setActiveProfileId(profileById(storedId ?? undefined).id);
      })
      .finally(() => {
        if (active) setIsLoaded(true);
      });

    return () => {
      active = false;
    };
  }, [authLoaded, user?.uid]);

  const selectProfile = useCallback(async (profileId: string) => {
    const validId = profileById(profileId).id;
    setActiveProfileId(validId);
    await AsyncStorage.setItem(activeProfileKey(user?.uid ?? null), validId);
  }, [user?.uid]);

  const value = useMemo<ProfileContextValue>(() => ({
    activeProfile: profileById(activeProfileId),
    isLoaded,
    profiles: ROUNDHOUSE_PROFILES,
    selectProfile,
  }), [activeProfileId, isLoaded, selectProfile]);

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
}

export function useProfiles() {
  const value = useContext(ProfileContext);
  if (!value) throw new Error('useProfiles must be used inside ProfileProvider');
  return value;
}
