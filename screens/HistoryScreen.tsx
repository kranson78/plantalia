import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type { HealthStatus, PlantAnalysis } from '../lib/types';
import { colors } from '../lib/theme';

interface HistoryScreenProps {
  items: PlantAnalysis[];
  loading: boolean;
  onSelect: (item: PlantAnalysis) => void;
  onBack: () => void;
  onRefresh: () => void;
}

const HEALTH_LABELS: Record<HealthStatus, string> = {
  good: 'Dobry',
  medium: 'Średni',
  bad: 'Zły',
};

function formatDate(ts: number): string {
  return new Date(ts).toLocaleString('pl-PL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function HistoryScreen({
  items,
  loading,
  onSelect,
  onBack,
  onRefresh,
}: HistoryScreenProps) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={onBack} hitSlop={12}>
          <Text style={styles.backText}>← Wróć</Text>
        </Pressable>
        <Text style={styles.title}>Historia</Text>
        <View style={styles.headerSpacer} />
      </View>

      {loading ? (
        <ActivityIndicator color={colors.accent} style={styles.loader} />
      ) : items.length === 0 ? (
        <Text style={styles.empty}>Brak zapisanych analiz.</Text>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          onRefresh={onRefresh}
          refreshing={loading}
          renderItem={({ item }) => (
            <Pressable
              style={({ pressed }) => [
                styles.card,
                pressed && { opacity: 0.85 },
              ]}
              onPress={() => onSelect(item)}
            >
              <Image source={{ uri: item.imageUri }} style={styles.thumb} />
              <View style={styles.cardBody}>
                <Text style={styles.cardName} numberOfLines={1}>
                  {item.plantName}
                </Text>
                <Text style={styles.cardMeta}>
                  {HEALTH_LABELS[item.healthStatus]} · {item.score}/100
                </Text>
                <Text style={styles.cardDate}>{formatDate(item.timestamp)}</Text>
              </View>
              <Text style={styles.chevron}>›</Text>
            </Pressable>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backText: {
    color: colors.accent,
    fontSize: 16,
    fontWeight: '500',
    minWidth: 70,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  headerSpacer: {
    minWidth: 70,
  },
  loader: {
    marginTop: 40,
  },
  empty: {
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 48,
    fontSize: 15,
  },
  list: {
    padding: 16,
    gap: 12,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  thumb: {
    width: 56,
    height: 56,
    borderRadius: 8,
    backgroundColor: colors.border,
  },
  cardBody: {
    flex: 1,
    marginLeft: 12,
  },
  cardName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  cardMeta: {
    fontSize: 13,
    color: colors.accent,
    marginTop: 2,
  },
  cardDate: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 4,
  },
  chevron: {
    fontSize: 22,
    color: colors.textMuted,
    marginLeft: 8,
  },
});
