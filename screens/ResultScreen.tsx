import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type { HealthStatus, PlantAnalysis } from '../lib/types';
import { colors } from '../lib/theme';

interface ResultScreenProps {
  analysis: PlantAnalysis;
  onBack: () => void;
}

const HEALTH_LABELS: Record<HealthStatus, string> = {
  good: 'Dobry',
  medium: 'Średni',
  bad: 'Zły',
};

const HEALTH_COLORS: Record<HealthStatus, string> = {
  good: colors.good,
  medium: colors.medium,
  bad: colors.bad,
};

const NEEDS_ROWS: Array<{ key: keyof PlantAnalysis['needs']; label: string; icon: string }> = [
  { key: 'water', label: 'Woda', icon: '💧' },
  { key: 'light', label: 'Światło', icon: '☀️' },
  { key: 'soil', label: 'Gleba', icon: '🪴' },
  { key: 'humidity', label: 'Wilgotność', icon: '💨' },
];

export default function ResultScreen({ analysis, onBack }: ResultScreenProps) {
  const healthColor = HEALTH_COLORS[analysis.healthStatus];

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Image source={{ uri: analysis.imageUri }} style={styles.image} />

      <Text style={styles.plantName}>{analysis.plantName}</Text>

      <View style={styles.healthRow}>
        <View style={[styles.healthBadge, { borderColor: healthColor }]}>
          <Text style={[styles.healthLabel, { color: healthColor }]}>
            Stan: {HEALTH_LABELS[analysis.healthStatus]}
          </Text>
        </View>
        <View style={styles.scoreBox}>
          <Text style={styles.scoreValue}>{analysis.score}</Text>
          <Text style={styles.scoreMax}>/100</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Potrzeby</Text>
      <View style={styles.needsGrid}>
        {NEEDS_ROWS.map((item) => (
          <View key={item.key} style={styles.needCard}>
            <Text style={styles.needIcon}>{item.icon}</Text>
            <Text style={styles.needLabel}>{item.label}</Text>
            <Text style={styles.needText}>{analysis.needs[item.key]}</Text>
          </View>
        ))}
      </View>

      <Text style={styles.sectionTitle}>Problemy</Text>
      {analysis.problems.length === 0 ? (
        <Text style={styles.emptyNote}>Brak wykrytych problemów.</Text>
      ) : (
        analysis.problems.map((p, i) => (
          <View key={i} style={styles.listItem}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.listText}>{p}</Text>
          </View>
        ))
      )}

      <Text style={styles.sectionTitle}>Porady</Text>
      {analysis.tips.map((tip, i) => (
        <View key={i} style={styles.tipCard}>
          <Text style={styles.tipNumber}>{i + 1}</Text>
          <Text style={styles.tipText}>{tip}</Text>
        </View>
      ))}

      <Pressable
        style={({ pressed }) => [styles.backButton, pressed && { opacity: 0.8 }]}
        onPress={onBack}
      >
        <Text style={styles.backButtonText}>← Wróć</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  image: {
    width: '100%',
    height: 220,
    borderRadius: 16,
    backgroundColor: colors.surface,
  },
  plantName: {
    fontSize: 26,
    fontWeight: '700',
    color: colors.accent,
    marginTop: 16,
  },
  healthRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  healthBadge: {
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  healthLabel: {
    fontSize: 15,
    fontWeight: '600',
  },
  scoreBox: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  scoreValue: {
    fontSize: 36,
    fontWeight: '800',
    color: colors.text,
  },
  scoreMax: {
    fontSize: 16,
    color: colors.textMuted,
    marginLeft: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.accent,
    marginTop: 24,
    marginBottom: 12,
  },
  needsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  needCard: {
    width: '47%',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  needIcon: {
    fontSize: 20,
  },
  needLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.accent,
    marginTop: 4,
  },
  needText: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 6,
    lineHeight: 17,
  },
  emptyNote: {
    color: colors.textMuted,
    fontSize: 14,
    fontStyle: 'italic',
  },
  listItem: {
    flexDirection: 'row',
    marginBottom: 8,
    paddingRight: 8,
  },
  bullet: {
    color: colors.bad,
    fontSize: 16,
    marginRight: 8,
  },
  listText: {
    flex: 1,
    color: colors.text,
    fontSize: 14,
    lineHeight: 20,
  },
  tipCard: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: colors.accent,
  },
  tipNumber: {
    color: colors.accent,
    fontWeight: '700',
    marginRight: 10,
    fontSize: 14,
  },
  tipText: {
    flex: 1,
    color: colors.text,
    fontSize: 14,
    lineHeight: 20,
  },
  backButton: {
    marginTop: 28,
    alignSelf: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.accent,
  },
  backButtonText: {
    color: colors.accent,
    fontSize: 16,
    fontWeight: '600',
  },
});
