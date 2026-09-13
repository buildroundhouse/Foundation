import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system/legacy';
import { Platform } from 'react-native';

export type RoundhouseRecord = {
  id: string;
  recordType: 'capture' | 'notation' | 'receipt' | 'estimate' | 'invoice' | 'message' | 'document' | 'work-log';
  createdAt: string;
  createdBy: string | null;
  time: string;
  title: string;
  detail: string;
  tone: string;
  imageUri?: string;
};

export type RecordLink = {
  id: string;
  recordId: string;
  destinationType: 'profile' | 'property' | 'business';
  destinationId: string;
  destinationName: string;
};

export type TimelineEvent = RoundhouseRecord & {
  entity: string;
};

type LocalRecordStore = {
  records: RoundhouseRecord[];
  links: RecordLink[];
};

const emptyStore = (): LocalRecordStore => ({ records: [], links: [] });

// The store belongs to the signed-in person on this device. Records remain
// independent; profiles, properties, and businesses only point to them through
// links. Removing a destination must never cascade into this record collection.
const recordStoreKey = (userId: string | null) =>
  `@roundhouse/${userId ?? 'local'}/record-store`;

async function readStore(userId: string | null): Promise<LocalRecordStore> {
  const stored = await AsyncStorage.getItem(recordStoreKey(userId));
  if (!stored) return emptyStore();

  try {
    const parsed = JSON.parse(stored) as Partial<LocalRecordStore>;
    return {
      records: Array.isArray(parsed.records) ? parsed.records : [],
      links: Array.isArray(parsed.links) ? parsed.links : [],
    };
  } catch {
    return emptyStore();
  }
}

export async function loadTimeline(
  userId: string | null,
  profileId: string,
): Promise<TimelineEvent[]> {
  const store = await readStore(userId);
  const links = store.links.filter(
    (link) => link.destinationType === 'profile' && link.destinationId === profileId,
  );
  const recordsById = new Map(store.records.map((record) => [record.id, record]));

  return links.flatMap((link) => {
    const record = recordsById.get(link.recordId);
    return record ? [{ ...record, entity: link.destinationName }] : [];
  });
}

export async function saveRecordWithLinks(
  userId: string | null,
  record: RoundhouseRecord,
  newLinks: RecordLink[],
) {
  const store = await readStore(userId);
  const records = [record, ...store.records.filter((item) => item.id !== record.id)];
  const newLinkIds = new Set(newLinks.map((link) => link.id));
  const links = [...newLinks, ...store.links.filter((item) => !newLinkIds.has(item.id))];

  await AsyncStorage.setItem(recordStoreKey(userId), JSON.stringify({ records, links }));
}

export async function preserveRecordImage(uri: string | undefined, recordId: string) {
  if (!uri || Platform.OS === 'web' || !FileSystem.documentDirectory) return uri;

  const directory = `${FileSystem.documentDirectory}roundhouse-records/`;
  await FileSystem.makeDirectoryAsync(directory, { intermediates: true });

  const extension = uri.match(/\.([a-zA-Z0-9]+)(?:\?|$)/)?.[1] ?? 'jpg';
  const destination = `${directory}${recordId}.${extension}`;
  await FileSystem.copyAsync({ from: uri, to: destination });
  return destination;
}
