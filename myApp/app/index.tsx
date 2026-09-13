import { Feather } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  loadTimeline,
  preserveRecordImage,
  saveRecordWithLinks,
  type RoundhouseRecord,
  type TimelineEvent,
} from '@/lib/record-store';
import { useAuth } from '@/providers/auth-provider';
import { useProfiles } from '@/providers/profile-provider';

const C = {
  ink: '#202629', muted: '#667076', line: '#C8B9A7', paper: '#F6F1E9',
  card: '#FFFDFC', rust: '#B85F39', blue: '#315E78', green: '#50705A', gold: '#B78A3B',
};

type SurfaceKey =
  | 'entity' | 'rewards' | 'inbox' | 'daily' | 'tasks' | 'concierge'
  | 'receipts' | 'properties' | 'resolutions' | 'people' | 'money' | 'calendar';

const INITIAL_EVENTS: TimelineEvent[] = [
  { id: '1', recordType: 'work-log', createdAt: '2026-09-13T08:10:00.000Z', createdBy: null, attributionVisibility: 'private', time: '8:10 AM', title: 'Morning walkthrough', detail: 'Reviewed cabinet layout before installation.', entity: 'Spring Lake', tone: C.blue },
  { id: '2', recordType: 'receipt', createdAt: '2026-09-13T10:45:00.000Z', createdBy: null, attributionVisibility: 'private', time: '10:45 AM', title: 'Material receipt', detail: 'Walnut veneer and finish supplies recorded.', entity: 'JD', tone: C.gold },
  { id: '3', recordType: 'message', createdAt: '2026-09-13T13:30:00.000Z', createdBy: null, attributionVisibility: 'private', time: '1:30 PM', title: 'Client update', detail: 'Shared progress and next-step notes.', entity: 'Viva Day Spa', tone: C.green },
];

const SURFACES: Record<SurfaceKey, { title: string; subtitle: string; items: string[] }> = {
  entity: { title: 'JD', subtitle: 'Business Entity — what is happening here.', items: ['Business Timeline', 'Team', 'Company records'] },
  rewards: { title: 'Rewards', subtitle: 'Your Roundhouse progress.', items: ['Builder badge', '1,240 points', 'Points history'] },
  inbox: { title: 'Inbox', subtitle: 'Messages and notifications in one place.', items: ['Viva Day Spa — photo received', 'Spring Lake — task updated', 'JD — estimate ready'] },
  daily: { title: 'Daily Grind', subtitle: "Today's working plan.", items: ['8:00 — Spring Lake walkthrough', '11:00 — Pick up walnut veneer', '3:30 — Send Viva update'] },
  tasks: { title: 'Tasks / Lists', subtitle: 'Your active working lists.', items: ['Confirm field measurements', 'Upload finish sample', 'Close out material receipts'] },
  receipts: { title: 'Receipts', subtitle: 'Material documentation available to you.', items: ['Walnut veneer — $438.20', 'Finish supplies — $86.41', 'Fasteners — $27.18'] },
  properties: { title: 'Properties', subtitle: 'Places you can legitimately access.', items: ['Spring Lake', 'Viva Day Spa', 'Dripping Springs'] },
  resolutions: { title: 'Resolutions', subtitle: 'Everything you still have on the hook.', items: ['Confirm desk cladding detail', 'Return unused finish', 'Resolve cabinet hardware'] },
  people: { title: 'People', subtitle: 'People known through shared Roundhouse participation.', items: ['JD team', 'Spring Lake participants', 'Viva Day Spa participants'] },
  money: { title: 'Estimates / Invoices', subtitle: 'A simple working money desk for V1.', items: ['Draft estimate — Spring Lake', 'Invoice due — Viva Day Spa', 'Create new estimate'] },
  calendar: { title: 'Calendar', subtitle: 'Work availability without exposing private event details.', items: ['Today — 3 work blocks', 'Tomorrow — available after 1 PM', 'Friday — blocked'] },
  concierge: { title: 'Concierge', subtitle: 'Tell Roundhouse what you need to do.', items: ['Create a note', 'Start a work record', 'Find the right place'] },
};

const RIGHT_TABS: { key: SurfaceKey; label: string; icon: React.ComponentProps<typeof Feather>['name'] }[] = [
  { key: 'daily', label: 'Daily', icon: 'sun' },
  { key: 'tasks', label: 'Lists', icon: 'check-square' },
  { key: 'receipts', label: 'Receipts', icon: 'file-text' },
  { key: 'properties', label: 'Properties', icon: 'home' },
];

const BOTTOM_ITEMS: { key: SurfaceKey; label: string; icon: React.ComponentProps<typeof Feather>['name'] }[] = [
  { key: 'resolutions', label: 'Resolutions', icon: 'toggle-left' },
  { key: 'people', label: 'People', icon: 'users' },
  { key: 'money', label: 'Estimates', icon: 'dollar-sign' },
  { key: 'calendar', label: 'Calendar', icon: 'calendar' },
];

export default function CommandCenterScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useAuth();
  const { activeProfile: currentProfile } = useProfiles();
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [eventsLoaded, setEventsLoaded] = useState(false);
  const [surface, setSurface] = useState<SurfaceKey | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [todayExpanded, setTodayExpanded] = useState(true);
  const [expandedEvent, setExpandedEvent] = useState<string | null>(null);
  const [captureOpen, setCaptureOpen] = useState(false);
  const [captureNote, setCaptureNote] = useState('');
  const [captureImage, setCaptureImage] = useState<string>();
  const [captureSaving, setCaptureSaving] = useState(false);
  const captureHeld = useRef(false);

  useEffect(() => {
    let active = true;
    setEventsLoaded(false);

    loadTimeline(user?.uid ?? null, currentProfile.id)
      .then((storedEvents) => {
        if (!active) return;
        const startingEvents = storedEvents.length
          ? storedEvents
          : (currentProfile.id === 'jd-design-studio' ? INITIAL_EVENTS : []);
        setEvents(startingEvents);
      })
      .finally(() => {
        if (active) setEventsLoaded(true);
      });

    return () => {
      active = false;
    };
  }, [currentProfile.id, user?.uid]);

  const visibleEvents = useMemo(() => {
    const value = query.trim().toLowerCase();
    if (!value) return events;
    return events.filter((event) =>
      `${event.title} ${event.detail} ${event.entity}`.toLowerCase().includes(value),
    );
  }, [events, query]);

  const beginCapture = async () => {
    try {
      if (Platform.OS !== 'web') {
        const permission = await ImagePicker.requestCameraPermissionsAsync();
        if (!permission.granted) {
          setCaptureOpen(true);
          return;
        }
      }
      const result = Platform.OS === 'web'
        ? await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.7 })
        : await ImagePicker.launchCameraAsync({ mediaTypes: ['images'], quality: 0.7 });
      if (!result.canceled) setCaptureImage(result.assets[0]?.uri);
    } finally {
      setCaptureOpen(true);
    }
  };

  const saveCapture = async () => {
    const now = new Date();
    const id = `${now.getTime()}`;
    setCaptureSaving(true);

    try {
      const imageUri = await preserveRecordImage(captureImage, id);
      const record: RoundhouseRecord = {
        id,
        recordType: imageUri ? 'capture' : 'notation',
        createdAt: now.toISOString(),
        createdBy: user?.uid ?? null,
        attributionVisibility: 'private',
        time: now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }),
        title: imageUri ? 'Photo captured' : 'Notation',
        detail: captureNote.trim() || 'Fill in details later.',
        tone: C.rust,
        imageUri,
      };
      const timelineEvent: TimelineEvent = { ...record, entity: currentProfile.name };
      const nextEvents = [timelineEvent, ...events];

      setEvents(nextEvents);
      await saveRecordWithLinks(user?.uid ?? null, record, [{
        id: `${record.id}:profile:${currentProfile.id}`,
        recordId: record.id,
        destinationType: 'profile',
        destinationId: currentProfile.id,
        destinationName: currentProfile.name,
        visibility: 'private',
        survivesDestinationArchive: false,
      }]);
      setCaptureNote('');
      setCaptureImage(undefined);
      setCaptureOpen(false);
      setTodayExpanded(true);
    } finally {
      setCaptureSaving(false);
    }
  };

  const handleCapturePress = () => {
    if (captureHeld.current) {
      captureHeld.current = false;
      return;
    }
    void beginCapture();
  };

  const handleCaptureHold = () => {
    captureHeld.current = true;
    setSurface('concierge');
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <View style={styles.screen}>
        <View style={styles.topBar}>
          <Pressable
            style={styles.profilePhoto}
            onPress={() => router.push('/profile')}
            accessibilityLabel={`Open ${currentProfile.name} profile`}>
            <Text style={styles.profilePhotoText}>D</Text>
          </Pressable>
          <Pressable style={styles.entityControl} onPress={() => setSurface('entity')} accessibilityLabel={`Open ${currentProfile.name} Command Center`}>
            <View style={styles.entityLogo}><Text style={styles.entityLogoText}>{currentProfile.initials}</Text></View>
            <View style={styles.entityCopy}>
              <Text style={styles.entityName}>{currentProfile.name}</Text>
            </View>
            <Feather name="chevron-right" size={15} color={C.muted} />
          </Pressable>
          <Pressable style={styles.points} onPress={() => setSurface('rewards')} accessibilityLabel="Open rewards and points">
            <Feather name="award" size={18} color={C.gold} />
            <Text style={styles.pointsText}>1,240</Text>
          </Pressable>
          <Pressable style={styles.topIcon} onPress={() => setSurface('inbox')} accessibilityLabel="Open combined inbox">
            <Feather name="inbox" size={22} color={C.ink} />
            <View style={styles.unreadDot} />
          </Pressable>
        </View>

        <View style={styles.timelineArea}>
          <View style={styles.searchHost}>
            {searchOpen ? (
              <View style={styles.searchBox}>
                <Feather name="search" size={17} color={C.muted} />
                <TextInput value={query} onChangeText={setQuery} placeholder="Search your Timeline…" placeholderTextColor="#8B9397" autoFocus style={styles.searchInput} />
                <Pressable onPress={() => { setQuery(''); setSearchOpen(false); }} hitSlop={10}>
                  <Feather name="x" size={18} color={C.ink} />
                </Pressable>
              </View>
            ) : (
              <Pressable style={styles.searchButton} onPress={() => setSearchOpen(true)} accessibilityLabel="Search your Timeline">
                <Feather name="search" size={20} color={C.ink} />
              </Pressable>
            )}
          </View>

          <ScrollView contentContainerStyle={[styles.timelineContent, { paddingBottom: 126 + insets.bottom }]} showsVerticalScrollIndicator={false}>
            <View style={styles.timelineHeading}>
              <Text style={styles.eyebrow}>YOUR TIMELINE</Text>
              <Pressable onPress={() => setTodayExpanded((value) => !value)} style={styles.todayButton}>
                <Text style={styles.today}>Today</Text>
                <Feather name={todayExpanded ? 'chevron-up' : 'chevron-down'} size={18} color={C.ink} />
              </Pressable>
              <Text style={styles.timelineHint}>Your activity today</Text>
            </View>
            <View style={styles.timelineList}>
              <View style={styles.spine} />
              {!eventsLoaded ? (
                <View style={styles.timelineLoading}><ActivityIndicator color={C.rust} /></View>
              ) : !todayExpanded ? (
                <Pressable style={styles.daySummary} onPress={() => setTodayExpanded(true)}>
                  <Text style={styles.daySummaryCount}>{visibleEvents.length}</Text>
                  <View><Text style={styles.daySummaryTitle}>Today</Text><Text style={styles.daySummaryText}>Tap to expand your activity</Text></View>
                </Pressable>
              ) : visibleEvents.length ? (
                visibleEvents.map((event, index) => {
                  const left = index % 2 === 0;
                  const expanded = expandedEvent === event.id;
                  return (
                    <View key={event.id} style={styles.eventRow}>
                      <View style={[styles.connector, left ? styles.connectorLeft : styles.connectorRight]} />
                      <View style={[styles.timelineDot, { borderColor: event.tone }]} />
                      <Pressable onPress={() => setExpandedEvent(expanded ? null : event.id)} style={[styles.eventCard, left ? styles.eventLeft : styles.eventRight, { borderTopColor: event.tone }]}>
                        {event.imageUri ? <Image source={{ uri: event.imageUri }} style={styles.eventImage} /> : null}
                        <Text style={styles.eventTime}>{event.time}</Text>
                        <Text style={styles.eventTitle}>{event.title}</Text>
                        <Text style={styles.eventEntity}>{event.entity}</Text>
                        {expanded ? <Text style={styles.eventDetail}>{event.detail}</Text> : null}
                      </Pressable>
                    </View>
                  );
                })
              ) : (
                <View style={styles.noMatches}><Text style={styles.noMatchesTitle}>No matching Timeline records</Text><Text style={styles.noMatchesText}>Clear Search to restore your full history.</Text></View>
              )}
            </View>
          </ScrollView>

          <View style={styles.rightTabs} pointerEvents="box-none">
            {RIGHT_TABS.map((item) => (
              <Pressable key={item.key} style={styles.rightTab} onPress={() => setSurface(item.key)} accessibilityLabel={`Open ${item.label}`}>
                <Feather name={item.icon} size={16} color="#FFFFFF" />
                <Text style={styles.rightTabText}>{item.label}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 8) }]}>
          {BOTTOM_ITEMS.slice(0, 2).map((item) => <BottomButton key={item.key} item={item} onPress={() => setSurface(item.key)} />)}
          <View style={styles.captureSpace} />
          {BOTTOM_ITEMS.slice(2).map((item) => <BottomButton key={item.key} item={item} onPress={() => setSurface(item.key)} />)}
          <Pressable style={styles.captureButton} onPress={handleCapturePress} onLongPress={handleCaptureHold} accessibilityLabel="Capture a photo">
            <Feather name="camera" size={27} color="#FFFFFF" />
            <Text style={styles.captureLabel}>CAPTURE</Text>
          </Pressable>
        </View>

        <SurfaceModal surface={surface} currentProfileName={currentProfile.name} onClose={() => setSurface(null)} />
        <Modal visible={captureOpen} transparent animationType="slide" onRequestClose={() => setCaptureOpen(false)}>
          <View style={styles.modalBackdrop}>
            <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 18) }]}>
              <View style={styles.sheetHandle} />
              <Text style={styles.sheetTitle}>{captureImage ? 'Finish the record' : 'Notation only'}</Text>
              <Text style={styles.sheetSubtitle}>This record will be saved to {currentProfile.name}.</Text>
              {captureImage ? <Image source={{ uri: captureImage }} style={styles.capturePreview} /> : null}
              <TextInput value={captureNote} onChangeText={setCaptureNote} placeholder="What happened? You can fill this in later." placeholderTextColor="#8B9397" multiline style={styles.noteInput} />
              <View style={styles.sheetActions}>
                <Pressable disabled={captureSaving} style={styles.secondaryButton} onPress={() => { setCaptureOpen(false); setCaptureImage(undefined); setCaptureNote(''); }}><Text style={styles.secondaryButtonText}>Cancel</Text></Pressable>
                <Pressable disabled={captureSaving} style={[styles.primaryButton, captureSaving && styles.buttonDisabled]} onPress={saveCapture}>
                  {captureSaving ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.primaryButtonText}>Save to Timeline</Text>}
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
}

function BottomButton({ item, onPress }: { item: (typeof BOTTOM_ITEMS)[number]; onPress: () => void }) {
  return (
    <Pressable style={styles.bottomItem} onPress={onPress} accessibilityLabel={`Open ${item.label}`}>
      <Feather name={item.icon} size={21} color={C.ink} />
      <Text style={styles.bottomLabel} numberOfLines={1}>{item.label}</Text>
    </Pressable>
  );
}

function SurfaceModal({ surface, currentProfileName, onClose }: { surface: SurfaceKey | null; currentProfileName: string; onClose: () => void }) {
  const insets = useSafeAreaInsets();
  if (!surface) return null;
  const content = surface === 'entity'
    ? { ...SURFACES.entity, title: currentProfileName }
    : SURFACES[surface];
  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalBackdrop}>
        <View style={[styles.surfacePanel, { paddingBottom: Math.max(insets.bottom, 22) }]}>
          <View style={styles.sheetHandle} />
          <View style={styles.surfaceHeader}>
            <View style={{ flex: 1 }}><Text style={styles.sheetTitle}>{content.title}</Text><Text style={styles.sheetSubtitle}>{content.subtitle}</Text></View>
            <Pressable style={styles.closeButton} onPress={onClose} accessibilityLabel={`Close ${content.title}`}><Feather name="x" size={21} color={C.ink} /></Pressable>
          </View>
          <ScrollView style={styles.surfaceList}>
            {content.items.map((item, index) => (
              <Pressable key={item} style={styles.surfaceRow} onPress={onClose}>
                <View style={styles.rowNumber}><Text style={styles.rowNumberText}>{index + 1}</Text></View>
                <Text style={styles.surfaceRowText}>{item}</Text>
                <Feather name="chevron-right" size={18} color={C.muted} />
              </Pressable>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.paper }, screen: { flex: 1, backgroundColor: C.paper },
  topBar: { minHeight: 58, paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', gap: 9, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#D9D0C4', backgroundColor: 'rgba(255,253,250,0.96)' },
  profilePhoto: { width: 38, height: 38, borderRadius: 19, backgroundColor: C.rust, alignItems: 'center', justifyContent: 'center' }, profilePhotoText: { color: '#FFF', fontSize: 17, fontWeight: '800' },
  entityControl: { flex: 1, minWidth: 0, flexDirection: 'row', alignItems: 'center', gap: 8 }, entityLogo: { width: 33, height: 33, borderRadius: 8, backgroundColor: C.ink, alignItems: 'center', justifyContent: 'center' }, entityLogoText: { color: '#FFF', fontSize: 11, fontWeight: '900', letterSpacing: 0.6 }, entityCopy: { flex: 1, minWidth: 0 }, entityName: { color: C.ink, fontSize: 15, fontWeight: '800' }, entityType: { color: C.muted, fontSize: 10, marginTop: 1 },
  points: { alignItems: 'center', minWidth: 43 }, pointsText: { color: C.ink, fontSize: 10, fontWeight: '800', marginTop: 1 }, topIcon: { width: 34, height: 38, alignItems: 'center', justifyContent: 'center' }, unreadDot: { position: 'absolute', top: 5, right: 3, width: 7, height: 7, borderRadius: 4, backgroundColor: C.rust },
  timelineArea: { flex: 1 }, timelineContent: { paddingTop: 62, paddingHorizontal: 12 }, timelineHeading: { alignItems: 'center', marginBottom: 12 }, eyebrow: { color: C.rust, fontSize: 10, fontWeight: '900', letterSpacing: 1.8 }, todayButton: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 }, today: { color: C.ink, fontSize: 28, fontWeight: '900', letterSpacing: -0.8 }, timelineHint: { color: C.muted, fontSize: 11, marginTop: 2 },
  searchHost: { position: 'absolute', zIndex: 5, top: 10, left: 12, right: 48 }, searchButton: { width: 38, height: 38, borderRadius: 19, backgroundColor: C.card, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#DED5CA' }, searchBox: { height: 42, borderRadius: 21, backgroundColor: C.card, borderWidth: 1, borderColor: '#D5C9BB', flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 13, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 8, shadowOffset: { width: 0, height: 3 } }, searchInput: { flex: 1, color: C.ink, fontSize: 14, paddingVertical: 8 },
  timelineList: { minHeight: 500, position: 'relative', paddingBottom: 40 }, spine: { position: 'absolute', top: 0, bottom: 0, left: '50%', width: 2, marginLeft: -1, backgroundColor: C.line }, eventRow: { minHeight: 122, position: 'relative', justifyContent: 'center' }, timelineDot: { position: 'absolute', left: '50%', marginLeft: -7, width: 14, height: 14, borderRadius: 7, borderWidth: 3, backgroundColor: C.paper, zIndex: 2 }, connector: { position: 'absolute', top: '50%', height: 1, backgroundColor: C.line, width: 22 }, connectorLeft: { left: '50%', marginLeft: -22 }, connectorRight: { left: '50%' },
  eventCard: { width: '43%', borderRadius: 14, backgroundColor: C.card, borderTopWidth: 3, padding: 11, shadowColor: '#332A23', shadowOpacity: 0.08, shadowRadius: 7, shadowOffset: { width: 0, height: 3 }, elevation: 2 }, eventLeft: { alignSelf: 'flex-start' }, eventRight: { alignSelf: 'flex-end', marginRight: 27 }, eventTime: { color: C.muted, fontSize: 9, fontWeight: '700', letterSpacing: 0.4 }, eventTitle: { color: C.ink, fontSize: 14, lineHeight: 17, fontWeight: '800', marginTop: 4 }, eventEntity: { color: C.rust, fontSize: 10, fontWeight: '700', marginTop: 5 }, eventDetail: { color: C.muted, fontSize: 11, lineHeight: 15, marginTop: 8 }, eventImage: { width: '100%', height: 72, borderRadius: 8, marginBottom: 8, backgroundColor: '#E6DED4' },
  daySummary: { alignSelf: 'center', marginTop: 44, flexDirection: 'row', alignItems: 'center', gap: 12, padding: 15, borderRadius: 16, backgroundColor: C.card, borderWidth: 1, borderColor: '#D8CEC1', zIndex: 2 }, daySummaryCount: { width: 38, height: 38, borderRadius: 19, textAlign: 'center', lineHeight: 38, color: '#FFF', backgroundColor: C.rust, fontWeight: '900' }, daySummaryTitle: { color: C.ink, fontSize: 15, fontWeight: '800' }, daySummaryText: { color: C.muted, fontSize: 11, marginTop: 2 }, noMatches: { alignSelf: 'center', marginTop: 70, backgroundColor: C.card, padding: 18, borderRadius: 14, zIndex: 2 }, noMatchesTitle: { color: C.ink, fontSize: 14, fontWeight: '800' }, noMatchesText: { color: C.muted, fontSize: 11, marginTop: 4 },
  timelineLoading: { alignItems: 'center', justifyContent: 'center', paddingTop: 70, zIndex: 2 },
  rightTabs: { position: 'absolute', right: 0, top: 74, gap: 9 }, rightTab: { width: 40, height: 67, backgroundColor: 'rgba(49,94,120,0.86)', borderTopLeftRadius: 13, borderBottomLeftRadius: 13, alignItems: 'center', justifyContent: 'center', gap: 5, shadowColor: '#000', shadowOpacity: 0.11, shadowRadius: 5, shadowOffset: { width: -2, height: 2 } }, rightTabText: { color: '#FFF', fontSize: 8, fontWeight: '800', transform: [{ rotate: '90deg' }], width: 51, textAlign: 'center' },
  bottomBar: { position: 'absolute', left: 0, right: 0, bottom: 0, minHeight: 78, paddingTop: 9, paddingHorizontal: 6, backgroundColor: 'rgba(255,253,250,0.98)', borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: '#D2C8BC', flexDirection: 'row', alignItems: 'flex-start' }, bottomItem: { flex: 1, minWidth: 0, alignItems: 'center', gap: 4, paddingTop: 5 }, bottomLabel: { color: C.ink, fontSize: 8, fontWeight: '700', maxWidth: 62 }, captureSpace: { width: 76 }, captureButton: { position: 'absolute', left: '50%', marginLeft: -36, top: -23, width: 72, height: 72, borderRadius: 36, backgroundColor: C.rust, borderWidth: 5, borderColor: C.paper, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOpacity: 0.22, shadowRadius: 10, shadowOffset: { width: 0, height: 5 }, elevation: 8 }, captureLabel: { color: '#FFF', fontSize: 8, fontWeight: '900', letterSpacing: 0.7, marginTop: 2 },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(24,29,31,0.52)', justifyContent: 'flex-end' }, surfacePanel: { maxHeight: '88%', minHeight: '62%', backgroundColor: C.paper, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 18 }, sheet: { backgroundColor: C.paper, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 18 }, sheetHandle: { width: 42, height: 4, borderRadius: 2, backgroundColor: '#C6BBB0', alignSelf: 'center', marginBottom: 18 }, surfaceHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 }, sheetTitle: { color: C.ink, fontSize: 25, fontWeight: '900', letterSpacing: -0.4 }, sheetSubtitle: { color: C.muted, fontSize: 12, lineHeight: 17, marginTop: 5 }, closeButton: { width: 38, height: 38, borderRadius: 19, backgroundColor: C.card, alignItems: 'center', justifyContent: 'center' }, surfaceList: { marginTop: 22 }, surfaceRow: { minHeight: 58, backgroundColor: C.card, borderRadius: 13, marginBottom: 9, paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', gap: 11 }, rowNumber: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#E8DED1', alignItems: 'center', justifyContent: 'center' }, rowNumberText: { color: C.rust, fontSize: 11, fontWeight: '900' }, surfaceRowText: { flex: 1, color: C.ink, fontSize: 14, fontWeight: '700' },
  capturePreview: { width: '100%', height: 190, borderRadius: 15, marginTop: 16, backgroundColor: '#E7DFD4' }, noteInput: { minHeight: 104, marginTop: 16, borderRadius: 14, borderWidth: 1, borderColor: '#D5C9BB', backgroundColor: C.card, color: C.ink, padding: 13, textAlignVertical: 'top' }, sheetActions: { flexDirection: 'row', gap: 10, marginTop: 14 }, secondaryButton: { flex: 1, minHeight: 48, borderRadius: 13, borderWidth: 1, borderColor: '#CBBFB2', alignItems: 'center', justifyContent: 'center' }, secondaryButtonText: { color: C.ink, fontWeight: '800' }, primaryButton: { flex: 2, minHeight: 48, borderRadius: 13, backgroundColor: C.rust, alignItems: 'center', justifyContent: 'center' }, primaryButtonText: { color: '#FFF', fontWeight: '900' },
  buttonDisabled: { opacity: 0.68 },
});
