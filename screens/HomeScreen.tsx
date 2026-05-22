import * as ImagePicker from 'expo-image-picker';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { colors } from '../lib/theme';

interface HomeScreenProps {
  loading: boolean;
  onAnalyze: (uri: string, base64: string) => void;
  onOpenHistory: () => void;
}

async function requestCameraPermission(): Promise<boolean> {
  const { status } = await ImagePicker.requestCameraPermissionsAsync();
  if (status !== 'granted') {
    Alert.alert('Uprawnienia', 'Potrzebny dostęp do aparatu.');
    return false;
  }
  return true;
}

async function requestGalleryPermission(): Promise<boolean> {
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (status !== 'granted') {
    Alert.alert('Uprawnienia', 'Potrzebny dostęp do galerii.');
    return false;
  }
  return true;
}

export default function HomeScreen({
  loading,
  onAnalyze,
  onOpenHistory,
}: HomeScreenProps) {
  const pickImage = async (source: 'camera' | 'gallery') => {
    if (loading) return;

    const permitted =
      source === 'camera'
        ? await requestCameraPermission()
        : await requestGalleryPermission();
    if (!permitted) return;

    const result =
      source === 'camera'
        ? await ImagePicker.launchCameraAsync({
            mediaTypes: ['images'],
            quality: 0.7,
            base64: true,
          })
        : await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            quality: 0.7,
            base64: true,
          });

    if (result.canceled || !result.assets[0]) return;

    const asset = result.assets[0];
    if (!asset.base64) {
      Alert.alert('Błąd', 'Nie udało się odczytać zdjęcia.');
      return;
    }

    onAnalyze(asset.uri, asset.base64);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.logo}>🌿</Text>
      <Text style={styles.title}>Plantalia</Text>
      <Text style={styles.subtitle}>
        Zrób zdjęcie rośliny lub wybierz z galerii — AI oceni jej stan i podpowie
        pielęgnację.
      </Text>

      <View style={styles.actions}>
        <Pressable
          style={({ pressed }) => [
            styles.button,
            styles.buttonPrimary,
            pressed && styles.buttonPressed,
            loading && styles.buttonDisabled,
          ]}
          onPress={() => pickImage('camera')}
          disabled={loading}
        >
          <Text style={styles.buttonIcon}>📷</Text>
          <Text style={styles.buttonLabel}>Aparat</Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [
            styles.button,
            styles.buttonSecondary,
            pressed && styles.buttonPressed,
            loading && styles.buttonDisabled,
          ]}
          onPress={() => pickImage('gallery')}
          disabled={loading}
        >
          <Text style={styles.buttonIcon}>🖼️</Text>
          <Text style={styles.buttonLabel}>Galeria</Text>
        </Pressable>
      </View>

      {loading && (
        <View style={styles.loadingRow}>
          <ActivityIndicator color={colors.accent} />
          <Text style={styles.loadingText}>Analizuję roślinę…</Text>
        </View>
      )}

      <Pressable
        style={({ pressed }) => [styles.historyLink, pressed && { opacity: 0.7 }]}
        onPress={onOpenHistory}
        disabled={loading}
      >
        <Text style={styles.historyLinkText}>Historia analiz →</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    fontSize: 56,
    marginBottom: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.accent,
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 15,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 12,
    lineHeight: 22,
    maxWidth: 320,
  },
  actions: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 40,
  },
  button: {
    width: 140,
    paddingVertical: 24,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
  },
  buttonPrimary: {
    backgroundColor: colors.surface,
    borderColor: colors.accent,
  },
  buttonSecondary: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
  },
  buttonPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 28,
  },
  loadingText: {
    color: colors.textMuted,
    fontSize: 14,
  },
  historyLink: {
    marginTop: 48,
    padding: 12,
  },
  historyLinkText: {
    color: colors.accent,
    fontSize: 15,
    fontWeight: '500',
  },
});
