import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

export function AppLoading() {
  return (
    <View style={styles.screen}>
      <View style={styles.mark}><Text style={styles.markText}>R</Text></View>
      <ActivityIndicator color="#B85F39" size="small" />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 18,
    backgroundColor: '#F6F1E9',
  },
  mark: {
    width: 64,
    height: 64,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#202629',
  },
  markText: { color: '#FFFFFF', fontSize: 27, fontWeight: '900' },
});
