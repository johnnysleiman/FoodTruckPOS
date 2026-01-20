// ============================================
// POS STORE
// Zustand store for POS cart management
// ============================================

import { create } from 'zustand';
import type { CartItem } from '../models/pos.types';

interface POSState {
  currentOrder: CartItem[];

  // Actions
  addItem: (item: CartItem) => void;
  removeItem: (index: number) => void;
  clearOrder: () => void;
  getTotal: () => number;
}

export const usePOSStore = create<POSState>((set, get) => ({
  currentOrder: [],

  addItem: (item) =>
    set((state) => ({ currentOrder: [...state.currentOrder, item] })),

  removeItem: (index) =>
    set((state) => ({
      currentOrder: state.currentOrder.filter((_, i) => i !== index),
    })),

  clearOrder: () => set({ currentOrder: [] }),

  getTotal: () => {
    const state = get();
    return state.currentOrder.reduce((sum, item) => sum + item.price, 0);
  },
}));
