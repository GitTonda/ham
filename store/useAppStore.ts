import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { AppState, DashboardCard, ChatMessage, TokenUsage } from '@/types';

// Claude 3.5 Sonnet / Opus estimated costs per 1M tokens
const INPUT_COST_PER_MILLION = 15; // USD (Opus)
const OUTPUT_COST_PER_MILLION = 75; // USD (Opus)

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      cards: [],
      chatHistory: [],
      tokenUsage: {
        input: 0,
        output: 0,
        total: 0,
        estimatedCost: 0,
      },
      isSettingsOpen: false,
      isQuerying: false,
      activeDrilldownData: null,
      theme: 'dark',

      addCard: (card: DashboardCard) =>
        set((state) => ({ cards: [...state.cards, card] })),

      updateCard: (id: string, updatedCard: Partial<DashboardCard>) =>
        set((state) => ({
          cards: state.cards.map((card) =>
            card.id === id ? { ...card, ...updatedCard } : card
          ),
        })),

      removeCard: (id: string) =>
        set((state) => ({
          cards: state.cards.filter((card) => card.id !== id),
        })),

      addChatMessage: (message: ChatMessage) =>
        set((state) => ({ chatHistory: [...state.chatHistory, message].slice(-50) })),

      clearChatHistory: () =>
        set(() => ({ chatHistory: [] })),

      updateTokenUsage: (input: number, output: number) =>
        set((state) => {
          const newInput = state.tokenUsage.input + input;
          const newOutput = state.tokenUsage.output + output;
          const cost = (newInput / 1_000_000 * INPUT_COST_PER_MILLION) + 
                       (newOutput / 1_000_000 * OUTPUT_COST_PER_MILLION);
          
          return {
            tokenUsage: {
              input: newInput,
              output: newOutput,
              total: newInput + newOutput,
              estimatedCost: Number(cost.toFixed(4)),
            }
          };
        }),

      toggleSettings: () =>
        set((state) => ({ isSettingsOpen: !state.isSettingsOpen })),

      setQuerying: (status: boolean) =>
        set(() => ({ isQuerying: status })),

      setDrilldown: (data: any | null) =>
        set(() => ({ activeDrilldownData: data })),
    }),
    {
      name: 'ham-app-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
