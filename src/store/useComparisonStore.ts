"use client";

import { create } from 'zustand';
import { Advocate } from '../types/advocate';

interface ComparisonState {
  selectedForComparison: Advocate[];
  addToComparison: (advocate: Advocate) => void;
  removeFromComparison: (advocateId: number) => void;
  clearComparison: () => void;
  isInComparison: (advocateId: number) => boolean;
  canAddMore: () => boolean;
}

const MAX_COMPARISON_ITEMS = 4;

export const useComparisonStore = create<ComparisonState>((set, get) => ({
  selectedForComparison: [],
  
  addToComparison: (advocate: Advocate) => {
    const { selectedForComparison } = get();
    if (!advocate.id || selectedForComparison.some(item => item.id === advocate.id)) {
      return; // Don't add if no ID or already exists
    }
    if (selectedForComparison.length >= MAX_COMPARISON_ITEMS) {
      return; // Don't add if max reached
    }
    set({ selectedForComparison: [...selectedForComparison, advocate] });
  },
  
  removeFromComparison: (advocateId: number) => {
    set(state => ({
      selectedForComparison: state.selectedForComparison.filter(item => item.id !== advocateId)
    }));
  },
  
  clearComparison: () => {
    set({ selectedForComparison: [] });
  },
  
  isInComparison: (advocateId: number) => {
    const { selectedForComparison } = get();
    return selectedForComparison.some(item => item.id === advocateId);
  },
  
  canAddMore: () => {
    const { selectedForComparison } = get();
    return selectedForComparison.length < MAX_COMPARISON_ITEMS;
  }
}));