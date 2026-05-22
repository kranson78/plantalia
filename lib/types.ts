export type HealthStatus = 'good' | 'medium' | 'bad';

export type Screen = 'home' | 'result' | 'history';

export interface PlantNeeds {
  water: string;
  light: string;
  soil: string;
  humidity: string;
}

export interface PlantAnalysis {
  id: string;
  timestamp: number;
  imageUri: string;
  plantName: string;
  healthStatus: HealthStatus;
  score: number;
  needs: PlantNeeds;
  problems: string[];
  tips: string[];
}
