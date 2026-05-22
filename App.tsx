import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useState } from 'react';
import { Alert, SafeAreaView, StyleSheet, View } from 'react-native';
import { analyzePlantImage, mediaTypeFromUri } from './lib/anthropic';
import { loadHistory, saveToHistory } from './lib/storage';
import { colors } from './lib/theme';
import type { PlantAnalysis, Screen } from './lib/types';
import HistoryScreen from './screens/HistoryScreen';
import HomeScreen from './screens/HomeScreen';
import ResultScreen from './screens/ResultScreen';

export default function App() {
  const [screen, setScreen] = useState<Screen>('home');
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<PlantAnalysis | null>(null);
  const [history, setHistory] = useState<PlantAnalysis[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const refreshHistory = useCallback(async () => {
    setHistoryLoading(true);
    try {
      const items = await loadHistory();
      setHistory(items);
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  useEffect(() => {
    if (screen === 'history') {
      refreshHistory();
    }
  }, [screen, refreshHistory]);

  const handleAnalyze = async (uri: string, base64: string) => {
    setLoading(true);
    try {
      const result = await analyzePlantImage(
        base64,
        mediaTypeFromUri(uri),
        uri
      );
      await saveToHistory(result);
      setAnalysis(result);
      setScreen('result');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Nieznany błąd';
      Alert.alert('Analiza nie powiodła się', message);
    } finally {
      setLoading(false);
    }
  };

  const goHome = () => {
    setScreen('home');
    setAnalysis(null);
  };

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar style="light" />
      <View style={styles.inner}>
        {screen === 'home' && (
          <HomeScreen
            loading={loading}
            onAnalyze={handleAnalyze}
            onOpenHistory={() => setScreen('history')}
          />
        )}
        {screen === 'result' && analysis && (
          <ResultScreen analysis={analysis} onBack={goHome} />
        )}
        {screen === 'history' && (
          <HistoryScreen
            items={history}
            loading={historyLoading}
            onSelect={(item) => {
              setAnalysis(item);
              setScreen('result');
            }}
            onBack={goHome}
            onRefresh={refreshHistory}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  inner: {
    flex: 1,
  },
});
