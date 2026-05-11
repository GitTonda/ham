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
  fluxQuery?: string; // Optional custom query from AI
  width?: number; // width in grid units or pixels
  height?: number; // height
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
  fluxQuery: string;
  data: any[]; 
  usage?: {
    input_tokens: number;
    output_tokens: number;
  };
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  insight?: InsightResponse;
}

export interface TokenUsage {
  input: number;
  output: number;
  total: number;
  estimatedCost: number; // In USD
}

export interface AppState {
  cards: DashboardCard[];
  chatHistory: ChatMessage[];
  tokenUsage: TokenUsage;
  isSettingsOpen: boolean;
  isQuerying: boolean;
  activeDrilldownData: any | null;
  theme: 'dark' | 'light' | 'system';
  addCard: (card: DashboardCard) => void;
  updateCard: (id: string, card: Partial<DashboardCard>) => void;
  removeCard: (id: string) => void;
  addChatMessage: (message: ChatMessage) => void;
  clearChatHistory: () => void;
  updateTokenUsage: (input: number, output: number) => void;
  toggleSettings: () => void;
  setQuerying: (status: boolean) => void;
  setDrilldown: (data: any | null) => void;
}
