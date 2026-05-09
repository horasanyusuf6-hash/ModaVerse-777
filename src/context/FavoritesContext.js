// 📁 src/context/FavoritesContext.js - SADECE REVİZE (hatasız)
import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@ModaVerse:favorites';

export const FavoritesContext = createContext();

export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
};

export const FavoritesProvider = ({ children }) => {
  const [favorites, setFavorites] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // AsyncStorage'den favorileri yükle
  useEffect(() => {
    const loadFavorites = async () => {
      try {
        const storedFavorites = await AsyncStorage.getItem(STORAGE_KEY);
        if (storedFavorites) {
          setFavorites(JSON.parse(storedFavorites));
        }
      } catch (error) {
        console.error('Favoriler yüklenirken hata:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadFavorites();
  }, []);

  // Favoriler değiştiğinde AsyncStorage'i güncelle
  useEffect(() => {
    const saveFavorites = async () => {
      try {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
      } catch (error) {
        console.error('Favoriler kaydedilirken hata:', error);
      }
    };
    
    // İlk yükleme tamamlanmadan kaydetme
    if (!isLoading) {
      saveFavorites();
    }
  }, [favorites, isLoading]);

  const addToFavorites = (item) => {
    if (!favorites.some(fav => fav.id === item.id)) {
      setFavorites(prev => [...prev, item]);
    }
  };

  const removeFromFavorites = (itemId) => {
    setFavorites(prev => prev.filter(item => item.id !== itemId));
  };

  const isFavorite = (itemId) => {
    return favorites.some(item => item.id === itemId);
  };

  const toggleFavorite = (item) => {
    if (isFavorite(item.id)) {
      removeFromFavorites(item.id);
    } else {
      addToFavorites(item);
    }
  };

  const clearFavorites = () => {
    setFavorites([]);
  };

  const value = {
    favorites,
    addToFavorites,
    removeFromFavorites,
    isFavorite,
    toggleFavorite,
    clearFavorites,
    favoritesCount: favorites.length,
    isLoading,
  };

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
};