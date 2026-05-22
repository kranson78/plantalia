import AsyncStorage from '@react-native-async-storage/async-storage';
import type { PlantAnalysis } from './types';

const HISTORY_KEY = '@plantalia/history';

export async function loadHistory(): Promise<PlantAnalysis[]> {
  const raw = await AsyncStorage.getItem(HISTORY_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as PlantAnalysis[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function saveToHistory(analysis: PlantAnalysis): Promise<void> {
  const history = await loadHistory();
  const updated = [analysis, ...history.filter((h) => h.id !== analysis.id)].slice(
    0,
    50
  );
  await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
}

export async function clearHistory(): Promise<void> {
  await AsyncStorage.removeItem(HISTORY_KEY);
}
