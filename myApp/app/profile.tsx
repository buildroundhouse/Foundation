import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import type { RoundhouseProfile } from '@/lib/profiles';
import { useAuth } from '@/providers/auth-provider';
import { useProfiles } from '@/providers/profile-provider';

const C = {
  ink: '#202629',
  muted: '#667076',
  paper: '#F6F1E9',
  card: '#FFFDFC',
  rust: '#B85F39',
  border: '#D8CEC1',
};

type DetailItem = {
  label: string;
  icon: React.ComponentProps<typeof Feather>['name'];
};

export default function ProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { signOut } = useAuth();
  const { activeProfile: selected, profiles, selectProfile } = useProfiles();
  const [switcherOpen, setSwitcherOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState<string | null>(null);

  const otherProfiles = useMemo(
    () => profiles.filter((profile) => profile.id !== selected.id),
    [profiles, selected.id],
  );

  const profileDetails: DetailItem[] = selected.kind === 'home'
    ? [
        { label: 'Home details', icon: 'home' },
        { label: 'Contact information', icon: 'phone' },
        { label: 'Household information', icon: 'users' },
      ]
    : [
        { label: 'About the business', icon: 'briefcase' },
        { label: 'Contact information', icon: 'phone' },
        { label: 'Services and specialties', icon: 'tool' },
      ];

  const management: DetailItem[] = selected.kind === 'home'
    ? [
        { label: 'People with access', icon: 'users' },
        { label: 'Property documents', icon: 'folder' },
        { label: 'Add or claim a property', icon: 'plus-circle' },
      ]
    : [
        { label: 'Team and permissions', icon: 'users' },
        { label: 'Properties and projects', icon: 'map-pin' },
        { label: 'Create or claim a business', icon: 'plus-circle' },
      ];

  const returnToCommandCenter = () => {
    router.replace('/');
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <View style={styles.screen}>
        <View style={styles.topBar}>
          <Pressable style={styles.backButton} onPress={returnToCommandCenter} accessibilityLabel={`Back to ${selected.name} Command Center`}>
            <Feather name="arrow-left" size={23} color={C.ink} />
          </Pressable>

          {profiles.length > 1 ? (
            <Pressable style={styles.switchControl} onPress={() => setSwitcherOpen(true)} accessibilityLabel="Switch profile">
              <Text style={styles.switchName} numberOfLines={1}>{selected.name}</Text>
              <View style={styles.switchAction}>
                <Text style={styles.switchActionText}>Switch profile</Text>
                <Feather name="chevron-down" size={13} color={C.rust} />
              </View>
            </Pressable>
          ) : (
            <Text style={styles.singleProfileName} numberOfLines={1}>{selected.name}</Text>
          )}

          <View style={styles.topSpacer} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 + insets.bottom }}>
          <View style={[styles.hero, { backgroundColor: selected.heroColor }]}>
            <View style={styles.heroPatternOne} />
            <View style={styles.heroPatternTwo} />
            <Feather name={selected.kind === 'home' ? 'home' : 'pen-tool'} size={66} color="rgba(255,255,255,0.18)" />
            <Text style={styles.heroTagline}>{selected.tagline}</Text>
          </View>

          <View style={styles.identityArea}>
            <View style={[styles.logo, { backgroundColor: selected.accentColor }]}>
              <Text style={styles.logoText}>{selected.initials}</Text>
            </View>
            <Text style={styles.profileName}>{selected.name}</Text>
            <Text style={styles.location}>{selected.location}</Text>

            <View style={styles.primaryActions}>
              <Pressable style={styles.viewProfileButton} onPress={() => setDetailOpen('Public profile preview')}>
                <Feather name="eye" size={17} color="#FFFFFF" />
                <Text style={styles.viewProfileText}>View profile</Text>
              </Pressable>
              <Pressable style={styles.shareButton} onPress={() => setDetailOpen('Share Roundhouse')}>
                <Feather name="send" size={17} color={C.rust} />
                <View>
                  <Text style={styles.shareButtonText}>Share Roundhouse</Text>
                  <Text style={styles.sharePoints}>Earn points</Text>
                </View>
              </Pressable>
            </View>
          </View>

          <View style={styles.section}>
            <ActionRow
              label="Invite / Share Roundhouse"
              detail="Invitations, requests and approvals"
              icon="user-plus"
              onPress={() => setDetailOpen('Invitation Center')}
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Find</Text>
            <View style={styles.sectionCard}>
              <ActionRow
                label="Find a Trade Professional"
                icon="search"
                onPress={() => setDetailOpen('Find a Trade Professional')}
                nested
              />
              <ActionRow
                label="Residential Home Search"
                icon="home"
                onPress={() => setDetailOpen('Residential Home Search')}
                nested
                bordered
              />
              <ActionRow
                label="Commercial Facility Search"
                icon="map"
                onPress={() => setDetailOpen('Commercial Facility Search')}
                nested
                bordered
              />
            </View>
          </View>

          <Pressable style={[styles.discoverCard, { borderColor: selected.accentColor }]} onPress={() => setDetailOpen('Discover')}>
            <View style={[styles.discoverIcon, { backgroundColor: selected.heroColor }]}>
              <Feather name="compass" size={24} color="#FFFFFF" />
            </View>
            <View style={styles.discoverCopy}>
              <Text style={styles.discoverTitle}>Discover</Text>
              <Text style={styles.discoverText}>Find pros and success stories in your area.</Text>
              <Text style={styles.discoverMeta}>Q&A · Message Board · Coming Soon</Text>
            </View>
            <Feather name="chevron-right" size={20} color={C.muted} />
          </Pressable>

          <ProfileSection title="Profile information" items={profileDetails} onOpen={setDetailOpen} />
          <ProfileSection title="Manage" items={management} onOpen={setDetailOpen} />

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Control</Text>
            <View style={styles.sectionCard}>
              <ActionRow label="Authority & Permissions" icon="shield" onPress={() => setDetailOpen('Authority & Permissions')} nested />
              <ActionRow label="Subscription & Account" icon="credit-card" onPress={() => setDetailOpen('Subscription & Account')} nested bordered />
              <ActionRow label="Other Settings" icon="sliders" onPress={() => setDetailOpen('Other Settings')} nested bordered />
              <ActionRow label="Sign out" icon="log-out" onPress={signOut} nested bordered />
            </View>
          </View>

          <View style={styles.bottomMarker}>
            <View style={styles.bottomLine} />
            <Text style={styles.bottomText}>End of profile</Text>
            <View style={styles.bottomLine} />
          </View>
        </ScrollView>

        <ProfileSwitcher
          visible={switcherOpen}
          selected={selected}
          others={otherProfiles}
          onSelect={async (profile) => {
            await selectProfile(profile.id);
            setSwitcherOpen(false);
          }}
          onClose={() => setSwitcherOpen(false)}
        />

        <DetailSheet
          title={detailOpen}
          profileName={selected.name}
          onClose={() => setDetailOpen(null)}
        />
      </View>
    </SafeAreaView>
  );
}

function ProfileSection({ title, items, onOpen }: { title: string; items: DetailItem[]; onOpen: (title: string) => void }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionCard}>
        {items.map((item, index) => (
          <Pressable
            key={item.label}
            style={[styles.sectionRow, index > 0 && styles.sectionRowBorder]}
            onPress={() => onOpen(item.label)}>
            <View style={styles.rowIcon}><Feather name={item.icon} size={17} color={C.rust} /></View>
            <Text style={styles.rowLabel}>{item.label}</Text>
            <Feather name="chevron-right" size={18} color={C.muted} />
          </Pressable>
        ))}
      </View>
    </View>
  );
}

function ActionRow({
  label,
  detail,
  icon,
  onPress,
  nested = false,
  bordered = false,
}: {
  label: string;
  detail?: string;
  icon: React.ComponentProps<typeof Feather>['name'];
  onPress: () => void;
  nested?: boolean;
  bordered?: boolean;
}) {
  return (
    <Pressable
      style={[nested ? styles.sectionRow : styles.standaloneRow, bordered && styles.sectionRowBorder]}
      onPress={onPress}>
      <View style={styles.rowIcon}><Feather name={icon} size={17} color={C.rust} /></View>
      <View style={styles.actionCopy}>
        <Text style={styles.rowLabel}>{label}</Text>
        {detail ? <Text style={styles.rowDetail}>{detail}</Text> : null}
      </View>
      <Feather name="chevron-right" size={18} color={C.muted} />
    </Pressable>
  );
}

function ProfileSwitcher({
  visible,
  selected,
  others,
  onSelect,
  onClose,
}: {
  visible: boolean;
  selected: RoundhouseProfile;
  others: RoundhouseProfile[];
  onSelect: (profile: RoundhouseProfile) => void | Promise<void>;
  onClose: () => void;
}) {
  const insets = useSafeAreaInsets();
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 22) }]}>
          <View style={styles.sheetHandle} />
          <View style={styles.sheetHeader}>
            <Text style={styles.sheetTitle}>Switch profile</Text>
            <Pressable style={styles.closeButton} onPress={onClose} accessibilityLabel="Close">
              <Feather name="x" size={21} color={C.ink} />
            </Pressable>
          </View>

          <Text style={styles.currentLabel}>CURRENT PROFILE</Text>
          <View style={styles.currentRow}>
            <ProfileMark profile={selected} />
            <Text style={styles.rowLabel}>{selected.name}</Text>
            <Feather name="check-circle" size={20} color={C.rust} />
          </View>

          <Text style={styles.otherLabel}>OTHER PROFILES</Text>
          {others.map((profile) => (
            <Pressable key={profile.id} style={styles.profileRow} onPress={() => onSelect(profile)}>
              <ProfileMark profile={profile} />
              <Text style={styles.rowLabel}>{profile.name}</Text>
              <Feather name="chevron-right" size={19} color={C.muted} />
            </Pressable>
          ))}
        </View>
      </View>
    </Modal>
  );
}

function ProfileMark({ profile }: { profile: RoundhouseProfile }) {
  return (
    <View style={[styles.profileMark, { backgroundColor: profile.heroColor }]}>
      <Text style={styles.profileMarkText}>{profile.initials}</Text>
    </View>
  );
}

function DetailSheet({ title, profileName, onClose }: { title: string | null; profileName: string; onClose: () => void }) {
  if (!title) return null;
  return (
    <Modal visible transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <View style={styles.sheetHandle} />
          <View style={styles.sheetHeader}>
            <View style={styles.detailHeading}>
              <Text style={styles.sheetTitle}>{title}</Text>
              <Text style={styles.detailSubtitle}>{profileName}</Text>
            </View>
            <Pressable style={styles.closeButton} onPress={onClose} accessibilityLabel="Close">
              <Feather name="x" size={21} color={C.ink} />
            </Pressable>
          </View>
          <View style={styles.detailBody}>
            <Text style={styles.detailBodyText}>This V1 doorway is working. The complete granular screen will be connected during the next functional pass.</Text>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.paper },
  screen: { flex: 1, backgroundColor: C.paper },
  topBar: { height: 66, paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.border, backgroundColor: C.card },
  backButton: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  topSpacer: { width: 44 },
  switchControl: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 8 },
  switchName: { color: C.ink, fontSize: 15, fontWeight: '900', maxWidth: '100%' },
  switchAction: { flexDirection: 'row', alignItems: 'center', gap: 2, marginTop: 2 },
  switchActionText: { color: C.rust, fontSize: 10, fontWeight: '800', letterSpacing: 0.3 },
  singleProfileName: { flex: 1, textAlign: 'center', color: C.ink, fontSize: 15, fontWeight: '900' },
  hero: { height: 205, overflow: 'hidden', padding: 22, justifyContent: 'space-between' },
  heroPatternOne: { position: 'absolute', width: 210, height: 210, borderRadius: 105, backgroundColor: 'rgba(255,255,255,0.08)', right: -50, top: -80 },
  heroPatternTwo: { position: 'absolute', width: 150, height: 150, borderRadius: 75, borderWidth: 24, borderColor: 'rgba(255,255,255,0.08)', left: -40, bottom: -90 },
  heroTagline: { color: '#FFFFFF', fontSize: 22, lineHeight: 27, fontWeight: '800', maxWidth: 300 },
  identityArea: { alignItems: 'center', paddingHorizontal: 20, paddingBottom: 8 },
  logo: { width: 82, height: 82, borderRadius: 22, borderWidth: 5, borderColor: C.paper, marginTop: -41, alignItems: 'center', justifyContent: 'center' },
  logoText: { color: '#FFFFFF', fontSize: 20, fontWeight: '900', letterSpacing: 0.5 },
  profileName: { color: C.ink, fontSize: 27, fontWeight: '900', letterSpacing: -0.7, marginTop: 10, textAlign: 'center' },
  location: { color: C.muted, fontSize: 12, marginTop: 4 },
  primaryActions: { width: '100%', flexDirection: 'row', gap: 9, marginTop: 16 },
  viewProfileButton: { flex: 1, minHeight: 52, borderRadius: 14, backgroundColor: C.rust, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  viewProfileText: { color: '#FFFFFF', fontSize: 14, fontWeight: '900' },
  shareButton: { flex: 1.35, minHeight: 52, borderRadius: 14, borderWidth: 1, borderColor: C.border, backgroundColor: C.card, paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  shareButtonText: { color: C.ink, fontSize: 12, fontWeight: '900' },
  sharePoints: { color: C.rust, fontSize: 9, fontWeight: '800', marginTop: 1 },
  section: { paddingHorizontal: 16, marginTop: 24 },
  sectionTitle: { color: C.muted, fontSize: 11, fontWeight: '900', letterSpacing: 1.2, marginBottom: 9 },
  sectionCard: { borderRadius: 16, backgroundColor: C.card, borderWidth: 1, borderColor: C.border, overflow: 'hidden' },
  sectionRow: { minHeight: 62, paddingHorizontal: 13, flexDirection: 'row', alignItems: 'center', gap: 11 },
  standaloneRow: { minHeight: 68, borderRadius: 16, borderWidth: 1, borderColor: C.border, backgroundColor: C.card, paddingHorizontal: 13, flexDirection: 'row', alignItems: 'center', gap: 11 },
  sectionRowBorder: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: C.border },
  rowIcon: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#F0E4D8', alignItems: 'center', justifyContent: 'center' },
  rowLabel: { flex: 1, color: C.ink, fontSize: 15, fontWeight: '800' },
  actionCopy: { flex: 1 },
  rowDetail: { color: C.muted, fontSize: 11, marginTop: 3 },
  discoverCard: { marginHorizontal: 16, marginTop: 24, minHeight: 118, borderRadius: 18, borderWidth: 1.5, backgroundColor: C.card, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 13 },
  discoverIcon: { width: 50, height: 50, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  discoverCopy: { flex: 1 },
  discoverTitle: { color: C.ink, fontSize: 20, fontWeight: '900' },
  discoverText: { color: C.muted, fontSize: 12, lineHeight: 17, marginTop: 3 },
  discoverMeta: { color: C.rust, fontSize: 10, fontWeight: '800', marginTop: 7 },
  bottomMarker: { flexDirection: 'row', alignItems: 'center', gap: 10, margin: 28 },
  bottomLine: { flex: 1, height: StyleSheet.hairlineWidth, backgroundColor: C.border },
  bottomText: { color: C.muted, fontSize: 10, fontWeight: '700' },
  backdrop: { flex: 1, backgroundColor: 'rgba(24,29,31,0.55)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: C.paper, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 18 },
  sheetHandle: { width: 42, height: 4, borderRadius: 2, backgroundColor: '#C6BBB0', alignSelf: 'center', marginBottom: 18 },
  sheetHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  sheetTitle: { color: C.ink, fontSize: 24, fontWeight: '900' },
  closeButton: { width: 38, height: 38, borderRadius: 19, backgroundColor: C.card, alignItems: 'center', justifyContent: 'center' },
  currentLabel: { color: C.muted, fontSize: 10, fontWeight: '900', letterSpacing: 1.1, marginTop: 22, marginBottom: 7 },
  currentRow: { minHeight: 64, borderRadius: 14, backgroundColor: '#EFE4D8', paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', gap: 11 },
  otherLabel: { color: C.muted, fontSize: 10, fontWeight: '900', letterSpacing: 1.1, marginTop: 20, marginBottom: 7 },
  profileRow: { minHeight: 64, borderRadius: 14, backgroundColor: C.card, paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', gap: 11, marginBottom: 8 },
  profileMark: { width: 40, height: 40, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  profileMarkText: { color: '#FFFFFF', fontSize: 11, fontWeight: '900' },
  detailHeading: { flex: 1 },
  detailSubtitle: { color: C.muted, fontSize: 12, marginTop: 3 },
  detailBody: { backgroundColor: C.card, borderRadius: 14, padding: 18, marginTop: 18, marginBottom: 10 },
  detailBodyText: { color: C.muted, fontSize: 13, lineHeight: 19 },
});
