import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { AppState, DashboardCard } from '@/types';

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      cards: [],
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
