export type ChartType = 'line' | 'step' | 'badge' | 'text';

export interface DashboardCard {
  id: string;
  title: string;
  sourceType: string;
  metricCategory: string;
  host: string;
  metricName: string;
  chartType: ChartType;
  timeRange: string; // e.g., '-1h', '-24h', '-7d'
  refreshInterval: number; // in seconds
}

export interface DataSignature {
  metricName: string;
  min: number;
  max: number;
  avg: number;
  startVal: number;
  endVal: number;
  pctChange: number;
  count: number;
}

export interface InsightResponse {
  insightText: string;
  suggestedChartType: ChartType;
  data: any[]; 
}

export interface AppState {
  cards: DashboardCard[];
  isSettingsOpen: boolean;
  isQuerying: boolean;
  activeDrilldownData: any | null;
  theme: 'dark' | 'light' | 'system';
  addCard: (card: DashboardCard) => void;
  updateCard: (id: string, card: Partial<DashboardCard>) => void;
  removeCard: (id: string) => void;
  toggleSettings: () => void;
  setQuerying: (status: boolean) => void;
  setDrilldown: (data: any | null) => void;
}
