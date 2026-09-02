// 📁 src/services/profileService.js
import { db } from './firebase';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';

const COLLECTION = 'users';

// Kullanıcı profili oluştur (ilk kayıtta)
export const createUserProfile = async (userId, email, displayName = '') => {
  try {
    const userRef = doc(db, COLLECTION, userId);
    const profile = {
      email,
      displayName: displayName || email.split('@')[0],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      bodyMeasurements: {
        height: null,
        weight: null,
        topSize: null,
        bottomSize: null,
        shoeSize: null,
        dressSize: null,
      },
      stylePreferences: {
        favoriteColors: [],
        preferredBrands: [],
        avoidedStyles: [],
        favoriteCategories: [],
      },
      addresses: [],
      notifications: true,
      defaultCurrency: 'TRY',
    };
    
    await setDoc(userRef, profile);
    return { success: true, data: profile };
  } catch (error) {
    console.error('Profil oluşturma hatası:', error);
    return { success: false, error: error.message };
  }
};

// Profil getir
export const getUserProfile = async (userId) => {
  try {
    const userRef = doc(db, COLLECTION, userId);
    const docSnap = await getDoc(userRef);
    
    if (docSnap.exists()) {
      return { success: true, data: { id: docSnap.id, ...docSnap.data() } };
    } else {
      // Profil yoksa oluştur (fallback)
      return { success: false, error: 'Profil bulunamadı' };
    }
  } catch (error) {
    console.error('Profil getirme hatası:', error);
    return { success: false, error: error.message };
  }
};

// Profil güncelle
export const updateUserProfile = async (userId, updateData) => {
  try {
    const userRef = doc(db, COLLECTION, userId);
    await updateDoc(userRef, {
      ...updateData,
      updatedAt: new Date().toISOString(),
    });
    return { success: true };
  } catch (error) {
    console.error('Profil güncelleme hatası:', error);
    return { success: false, error: error.message };
  }
};

// Sadece beden ölçülerini güncelle
export const updateBodyMeasurements = async (userId, measurements) => {
  return updateUserProfile(userId, { bodyMeasurements: measurements });
};

// Sadece stil tercihlerini güncelle
export const updateStylePreferences = async (userId, preferences) => {
  return updateUserProfile(userId, { stylePreferences: preferences });
};