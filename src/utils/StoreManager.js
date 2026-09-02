// 📁 src/utils/StorageManager.js
import AsyncStorage from '@react-native-async-storage/async-storage';

export const STORAGE_KEYS = {
  USER_PROFILE: '@user_profile',
  USER_PRODUCTS: '@user_products',
  USER_FAVORITES: '@user_favorites',
  USER_FOLLOWING: '@user_following',
  USER_TWEETS: '@user_tweets',
  USER_LIKES: '@user_likes',
  USER_ACTIVITIES: '@user_activities',
  APP_SETTINGS: '@app_settings',
};

// ============ PROFİL VERİLERİ ============
export const saveUserProfile = async (profile) => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(profile));
    return true;
  } catch (error) {
    console.error('Profil kaydedilirken hata:', error);
    return false;
  }
};

export const getUserProfile = async () => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.USER_PROFILE);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Profil yüklenirken hata:', error);
    return null;
  }
};

// ============ FAVORİLER ============
export const saveFavorites = async (favorites) => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.USER_FAVORITES, JSON.stringify(favorites));
    return true;
  } catch (error) {
    console.error('Favoriler kaydedilirken hata:', error);
    return false;
  }
};

export const getFavorites = async () => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.USER_FAVORITES);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Favoriler yüklenirken hata:', error);
    return [];
  }
};

export const toggleFavorite = async (itemId, currentFavorites) => {
  const newFavorites = currentFavorites.includes(itemId)
    ? currentFavorites.filter(id => id !== itemId)
    : [...currentFavorites, itemId];
  await saveFavorites(newFavorites);
  return newFavorites;
};

// ============ TAKİP EDİLENLER ============
export const saveFollowing = async (following) => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.USER_FOLLOWING, JSON.stringify(following));
    return true;
  } catch (error) {
    console.error('Takip listesi kaydedilirken hata:', error);
    return false;
  }
};

export const getFollowing = async () => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.USER_FOLLOWING);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Takip listesi yüklenirken hata:', error);
    return [];
  }
};

export const toggleFollowing = async (itemId, currentFollowing) => {
  const newFollowing = currentFollowing.includes(itemId)
    ? currentFollowing.filter(id => id !== itemId)
    : [...currentFollowing, itemId];
  await saveFollowing(newFollowing);
  return newFollowing;
};

// ============ TWEET'LER ============
export const saveTweets = async (tweets) => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.USER_TWEETS, JSON.stringify(tweets));
    return true;
  } catch (error) {
    console.error('Tweetler kaydedilirken hata:', error);
    return false;
  }
};

export const getTweets = async () => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.USER_TWEETS);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Tweetler yüklenirken hata:', error);
    return [];
  }
};

export const addTweet = async (tweet, existingTweets) => {
  const newTweets = [tweet, ...existingTweets];
  await saveTweets(newTweets);
  return newTweets;
};

// ============ BEĞENİLER ============
export const saveLikes = async (likes) => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.USER_LIKES, JSON.stringify(likes));
    return true;
  } catch (error) {
    console.error('Beğeniler kaydedilirken hata:', error);
    return false;
  }
};

export const getLikes = async () => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.USER_LIKES);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Beğeniler yüklenirken hata:', error);
    return [];
  }
};

// ============ AKTİVİTELER ============
export const saveActivities = async (activities) => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.USER_ACTIVITIES, JSON.stringify(activities));
    return true;
  } catch (error) {
    console.error('Aktiviteler kaydedilirken hata:', error);
    return false;
  }
};

export const getActivities = async () => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.USER_ACTIVITIES);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Aktiviteler yüklenirken hata:', error);
    return [];
  }
};

// ============ TÜM VERİLERİ TEMİZLE ============
export const clearAllData = async () => {
  try {
    await AsyncStorage.multiRemove(Object.values(STORAGE_KEYS));
    return true;
  } catch (error) {
    console.error('Veriler temizlenirken hata:', error);
    return false;
  }
};