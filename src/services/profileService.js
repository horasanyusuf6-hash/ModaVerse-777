// 📁 src/services/profileService.js - REVİZE

import { profileService as firestoreProfile } from './firestoreService';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ============================================================
// 📌 PROFİL SERVİSİ
// ============================================================

class ProfileService {
  constructor() {
    this.cache = {};
  }

  /**
   * Kullanıcı profili oluştur
   */
  async createProfile(userId, data) {
    const result = await firestoreProfile.createProfile(userId, data);
    if (result.success) {
      this.cache[userId] = data;
      await this.saveToCache(userId, data);
    }
    return result;
  }

  /**
   * Kullanıcı profili getir
   */
  async getProfile(userId) {
    // Cache kontrolü
    if (this.cache[userId]) {
      return { success: true, data: this.cache[userId] };
    }

    // Local kontrol
    const localProfile = await this.loadFromCache(userId);
    if (localProfile) {
      this.cache[userId] = localProfile;
      return { success: true, data: localProfile };
    }

    // Firestore'dan getir
    const result = await firestoreProfile.getProfile(userId);
    if (result.success) {
      this.cache[userId] = result.data;
      await this.saveToCache(userId, result.data);
    }
    return result;
  }

  /**
   * Kullanıcı profili güncelle
   */
  async updateProfile(userId, data) {
    const result = await firestoreProfile.updateProfile(userId, data);
    if (result.success) {
      if (this.cache[userId]) {
        this.cache[userId] = { ...this.cache[userId], ...data };
      }
      await this.saveToCache(userId, this.cache[userId]);
    }
    return result;
  }

  /**
   * Beden ölçülerini güncelle
   */
  async updateBodyMeasurements(userId, measurements) {
    const result = await firestoreProfile.updateBodyMeasurements(userId, measurements);
    if (result.success) {
      if (this.cache[userId]) {
        this.cache[userId].bodyMeasurements = measurements;
        await this.saveToCache(userId, this.cache[userId]);
      }
    }
    return result;
  }

  /**
   * Stil tercihlerini güncelle
   */
  async updateStylePreferences(userId, preferences) {
    const result = await firestoreProfile.updateStylePreferences(userId, preferences);
    if (result.success) {
      if (this.cache[userId]) {
        this.cache[userId].stylePreferences = preferences;
        await this.saveToCache(userId, this.cache[userId]);
      }
    }
    return result;
  }

  // ============================================================
  // 📌 CACHE İŞLEMLERİ
  // ============================================================

  async saveToCache(userId, data) {
    try {
      const key = `@profile_${userId}`;
      await AsyncStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error('Cache kaydetme hatası:', error);
    }
  }

  async loadFromCache(userId) {
    try {
      const key = `@profile_${userId}`;
      const data = await AsyncStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Cache yükleme hatası:', error);
      return null;
    }
  }

  /**
   * Cache'i temizle
   */
  clearCache(userId) {
    delete this.cache[userId];
  }

  /**
   * Tüm cache'i temizle
   */
  clearAllCache() {
    this.cache = {};
  }
}

// Singleton instance
export const profileService = new ProfileService();

export default profileService;