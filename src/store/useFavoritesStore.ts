"use client";

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Advocate } from '../types/advocate';

interface FavoritesState {
  favorites: Advocate[];
  addFavorite: (advocate: Advocate) => void;
  removeFavorite: (advocateId: number) => void;
  isFavorite: (advocateId: number) => boolean;
  clearFavorites: () => void;
  getFavoriteIds: () => number[];
}

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      favorites: [],
      
      addFavorite: (advocate: Advocate) => {
        const { favorites } = get();
        if (!advocate.id || favorites.some(fav => fav.id === advocate.id)) {
          return; // Don't add if no ID or already exists
        }
        set({ favorites: [...favorites, advocate] });
      },
      
      removeFavorite: (advocateId: number) => {
        set(state => ({
          favorites: state.favorites.filter(fav => fav.id !== advocateId)
        }));
      },
      
      isFavorite: (advocateId: number) => {
        const { favorites } = get();
        return favorites.some(fav => fav.id === advocateId);
      },
      
      clearFavorites: () => {
        set({ favorites: [] });
      },
      
      getFavoriteIds: () => {
        const { favorites } = get();
        return favorites.map(fav => fav.id).filter(id => id !== undefined) as number[];
      }
    }),
    {
      name: 'advocate-favorites-storage',
      version: 1,
    }
  )
);