import { create } from "zustand";

interface ParamTooltipState {
  openId: string | null;
  toggle: (id: string) => void;
  close: () => void;
}

/* Какой именно тултип параметра сейчас раскрыт (одновременно только один) */
export const useParamTooltip = create<ParamTooltipState>((set) => ({
  openId: null,
  toggle: (id) => set((s) => ({ openId: s.openId === id ? null : id })),
  close: () => set({ openId: null }),
}));
