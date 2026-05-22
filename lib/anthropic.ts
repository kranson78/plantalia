import type { HealthStatus, PlantAnalysis, PlantNeeds } from './types';

const API_URL = '/.netlify/functions/analyze';

interface NetlifyNeed {
  type: string;
  urgent?: boolean;
  note: string;
}

interface NetlifyRawAnalysis {
  plantName: string;
  plantNameLatin?: string;
  overallHealth: string;
  healthScore: number;
  issues: string[];
  needs: NetlifyNeed[];
  immediateAction?: string;
  careAdvice?: string;
  funFact?: string;
}

function mapHealthStatus(overallHealth: string): HealthStatus {
  const h = overallHealth.toLowerCase();
  if (h === 'dobry' || h === 'good') return 'good';
  if (h === 'średni' || h === 'sredni' || h === 'medium') return 'medium';
  if (h === 'zły' || h === 'zly' || h === 'bad') return 'bad';
  return 'medium';
}

function mapNeeds(needs: NetlifyNeed[]): PlantNeeds {
  const byType = Object.fromEntries(needs.map((n) => [n.type, n.note || '—']));
  const urgent = (type: string) =>
    needs.find((n) => n.type === type && n.urgent) ? ' (pilne)' : '';
  return {
    water: (byType.water ?? '—') + urgent('water'),
    light: (byType.light ?? '—') + urgent('light'),
    soil: (byType.nutrients ?? '—') + urgent('nutrients'),
    humidity: (byType.repot ?? '—') + urgent('repot'),
  };
}

function parseAnalysisJson(text: string): NetlifyRawAnalysis {
  const trimmed = text.trim();
  const jsonMatch = trimmed.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('Nie udało się odczytać odpowiedzi AI');
  }
  const parsed = JSON.parse(jsonMatch[0]) as NetlifyRawAnalysis;
  if (!parsed.plantName || typeof parsed.healthScore !== 'number') {
    throw new Error('Niepełna odpowiedź AI');
  }
  return parsed;
}

function toPlantAnalysis(raw: NetlifyRawAnalysis, imageUri: string): PlantAnalysis {
  const tips = [raw.immediateAction, raw.careAdvice, raw.funFact].filter(
    (t): t is string => Boolean(t?.trim())
  );
  const name = raw.plantNameLatin
    ? `${raw.plantName} (${raw.plantNameLatin})`
    : raw.plantName;

  return {
    id: `${Date.now()}`,
    timestamp: Date.now(),
    imageUri,
    plantName: name,
    healthStatus: mapHealthStatus(raw.overallHealth),
    score: Math.min(100, Math.max(1, Math.round(raw.healthScore))),
    needs: mapNeeds(raw.needs ?? []),
    problems: raw.issues ?? [],
    tips,
  };
}

export async function analyzePlantImage(
  base64: string,
  mediaType: 'image/jpeg' | 'image/png' | 'image/webp',
  imageUri: string
): Promise<PlantAnalysis> {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ imageBase64: base64, mimeType: mediaType }),
  });

  const rawBody = await response.text();
  console.log('[analyze] surowa odpowiedź:', rawBody);

  if (!response.ok) {
    throw new Error(`Analiza (${response.status}): ${rawBody}`);
  }

  const data = JSON.parse(rawBody) as {
    content?: Array<{ type: string; text?: string }>;
    error?: { message?: string };
  };

  if (data.error?.message) {
    throw new Error(data.error.message);
  }

  const textBlock = data.content?.find((b) => b.type === 'text');
  if (!textBlock?.text) {
    throw new Error('Pusta odpowiedź z API');
  }

  return toPlantAnalysis(parseAnalysisJson(textBlock.text), imageUri);
}

export function mediaTypeFromUri(uri: string): 'image/jpeg' | 'image/png' | 'image/webp' {
  const lower = uri.toLowerCase();
  if (lower.includes('.png')) return 'image/png';
  if (lower.includes('.webp')) return 'image/webp';
  return 'image/jpeg';
}
