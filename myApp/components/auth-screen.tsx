import { Feather } from '@expo/vector-icons';
import { Link } from 'expo-router';
import React from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInputProps,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const C = {
  ink: '#202629',
  muted: '#667076',
  paper: '#F6F1E9',
  card: '#FFFDFC',
  rust: '#B85F39',
  border: '#D8CEC1',
};

export function AuthScreen({
  title,
  description,
  children,
  submitLabel,
  loading,
  error,
  notice,
  onSubmit,
  footer,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
  submitLabel: string;
  loading: boolean;
  error?: string;
  notice?: string;
  onSubmit: () => void;
  footer?: React.ReactNode;
}) {
  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.safe}>
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.content}>
          <View style={styles.brandMark}><Text style={styles.brandText}>R</Text></View>
          <Text style={styles.brandName}>ROUNDHOUSE</Text>

          <View style={styles.card}>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.description}>{description}</Text>
            <View style={styles.fields}>{children}</View>

            {error ? (
              <View style={styles.messageRow}>
                <Feather name="alert-circle" size={17} color="#9B3B31" />
                <Text style={styles.error}>{error}</Text>
              </View>
            ) : null}

            {notice ? (
              <View style={styles.messageRow}>
                <Feather name="check-circle" size={17} color="#50705A" />
                <Text style={styles.notice}>{notice}</Text>
              </View>
            ) : null}

            <Pressable
              accessibilityRole="button"
              disabled={loading}
              onPress={onSubmit}
              style={({ pressed }) => [
                styles.primaryButton,
                pressed && styles.primaryPressed,
                loading && styles.primaryDisabled,
              ]}>
              {loading
                ? <ActivityIndicator color="#FFFFFF" />
                : <Text style={styles.primaryText}>{submitLabel}</Text>}
            </Pressable>

            {footer ? <View style={styles.footer}>{footer}</View> : null}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

export function AuthField(props: TextInputProps & { label: string }) {
  const { label, ...inputProps } = props;
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        {...inputProps}
        placeholderTextColor="#92999C"
        style={styles.input}
      />
    </View>
  );
}

export function AuthLink({ href, children }: { href: '/sign-in' | '/sign-up' | '/forgot-password'; children: React.ReactNode }) {
  return <Link href={href} style={styles.link}>{children}</Link>;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.paper },
  content: { flexGrow: 1, justifyContent: 'center', padding: 22, paddingVertical: 42 },
  brandMark: { width: 62, height: 62, borderRadius: 18, alignSelf: 'center', alignItems: 'center', justifyContent: 'center', backgroundColor: C.ink },
  brandText: { color: '#FFFFFF', fontSize: 27, fontWeight: '900' },
  brandName: { alignSelf: 'center', color: C.ink, marginTop: 10, marginBottom: 28, fontSize: 13, fontWeight: '900', letterSpacing: 2.2 },
  card: { width: '100%', maxWidth: 460, alignSelf: 'center', padding: 22, borderWidth: 1, borderColor: C.border, borderRadius: 22, backgroundColor: C.card },
  title: { color: C.ink, fontSize: 28, fontWeight: '900', letterSpacing: -0.6 },
  description: { color: C.muted, fontSize: 14, lineHeight: 20, marginTop: 7 },
  fields: { gap: 15, marginTop: 25 },
  field: { gap: 6 },
  label: { color: C.ink, fontSize: 12, fontWeight: '800' },
  input: { minHeight: 50, borderWidth: 1, borderColor: C.border, borderRadius: 13, paddingHorizontal: 14, backgroundColor: '#FFFFFF', color: C.ink, fontSize: 16 },
  messageRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginTop: 16 },
  error: { flex: 1, color: '#9B3B31', fontSize: 13, lineHeight: 18 },
  notice: { flex: 1, color: '#3E654B', fontSize: 13, lineHeight: 18 },
  primaryButton: { minHeight: 52, marginTop: 21, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: C.rust },
  primaryPressed: { opacity: 0.88 },
  primaryDisabled: { opacity: 0.65 },
  primaryText: { color: '#FFFFFF', fontSize: 15, fontWeight: '900' },
  footer: { alignItems: 'center', gap: 12, marginTop: 20 },
  link: { color: C.rust, fontSize: 13, fontWeight: '800' },
});
