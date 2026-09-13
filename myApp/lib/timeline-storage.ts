import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system/legacy';
import { Platform } from 'react-native';

export type TimelineEvent = {
  id: string;
  time: string;
  title: string;
  detail: string;
  entity: string;
  tone: string;
  imageUri?: string;
};

const timelineKey = (userId: string | null, profileId: string) =>
  `@roundhouse/${userId ?? 'local'}/profiles/${profileId}/timeline`;

export async function loadTimeline(
  userId: string | null,
  profileId: string,
): Promise<TimelineEvent[] | null> {
  const stored = await AsyncStorage.getItem(timelineKey(userId, profileId));
  if (!stored) return null;

  try {
    const parsed: unknown = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed as TimelineEvent[] : null;
  } catch {
    return null;
  }
}

export async function saveTimeline(
  userId: string | null,
  profileId: string,
  events: TimelineEvent[],
) {
  await AsyncStorage.setItem(timelineKey(userId, profileId), JSON.stringify(events));
}

export async function preserveCaptureImage(uri: string | undefined, recordId: string) {
  if (!uri || Platform.OS === 'web' || !FileSystem.documentDirectory) return uri;

  const directory = `${FileSystem.documentDirectory}roundhouse-captures/`;
  await FileSystem.makeDirectoryAsync(directory, { intermediates: true });

  const extension = uri.match(/\.([a-zA-Z0-9]+)(?:\?|$)/)?.[1] ?? 'jpg';
  const destination = `${directory}${recordId}.${extension}`;
  await FileSystem.copyAsync({ from: uri, to: destination });
  return destination;
}
