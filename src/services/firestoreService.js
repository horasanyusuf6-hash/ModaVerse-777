// 📁 src/services/firestoreService.js - REVİZE

import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth, firestore } from '../config/firebase';
import { 
  collection, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc,
  query,
  where,
  getDocs,
  addDoc,
  serverTimestamp,
  arrayUnion,
  arrayRemove,
  increment,
} from 'firebase/firestore';

// ============================================================
// 📌 KOLEKSİYON İSİMLERİ
// ============================================================

const COLLECTIONS = {
  PROFILES: 'user_profiles',
  WARDROBE: 'user_wardrobe',
  FAVORITES: 'favorites',
  CART: 'cart',
  SAVED_POSTS: 'saved_posts',
  FOLLOWING: 'following_brands',
  STORIES: 'user_stories',
  PRODUCTS: 'products',
  OUTFITS: 'outfits',
  FEEDBACK: 'feedback',
  DNA: 'dna_profiles',
};

// ============================================================
// 📌 PROFİL İŞLEMLERİ
// ============================================================

export const profileService = {
  /**
   * Kullanıcı profili oluştur
   */
  createProfile: async (userId, data) => {
    try {
      const docRef = doc(firestore, COLLECTIONS.PROFILES, userId);
      await setDoc(docRef, {
        ...data,
        userId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      return { success: true, userId };
    } catch (error) {
      console.error('Profil oluşturma hatası:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Kullanıcı profili getir
   */
  getProfile: async (userId) => {
    try {
      const docRef = doc(firestore, COLLECTIONS.PROFILES, userId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return { success: true, data: docSnap.data() };
      }
      return { success: false, notFound: true };
    } catch (error) {
      console.error('Profil getirme hatası:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Kullanıcı profili güncelle
   */
  updateProfile: async (userId, data) => {
    try {
      const docRef = doc(firestore, COLLECTIONS.PROFILES, userId);
      await updateDoc(docRef, {
        ...data,
        updatedAt: serverTimestamp(),
      });
      return { success: true };
    } catch (error) {
      console.error('Profil güncelleme hatası:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Beden ölçülerini güncelle
   */
  updateBodyMeasurements: async (userId, measurements) => {
    try {
      const docRef = doc(firestore, COLLECTIONS.PROFILES, userId);
      await updateDoc(docRef, {
        bodyMeasurements: measurements,
        updatedAt: serverTimestamp(),
      });
      return { success: true };
    } catch (error) {
      console.error('Beden ölçüleri güncelleme hatası:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Stil tercihlerini güncelle
   */
  updateStylePreferences: async (userId, preferences) => {
    try {
      const docRef = doc(firestore, COLLECTIONS.PROFILES, userId);
      await updateDoc(docRef, {
        stylePreferences: preferences,
        updatedAt: serverTimestamp(),
      });
      return { success: true };
    } catch (error) {
      console.error('Stil tercihleri güncelleme hatası:', error);
      return { success: false, error: error.message };
    }
  },
};

// ============================================================
// 📌 GARDİROP İŞLEMLERİ
// ============================================================

export const wardrobeService = {
  /**
   * Gardıropa ürün ekle
   */
  addItem: async (userId, product) => {
    try {
      const docRef = collection(firestore, COLLECTIONS.WARDROBE);
      const newItem = {
        ...product,
        userId,
        addedAt: serverTimestamp(),
        isStar: false,
      };
      const doc = await addDoc(docRef, newItem);
      return { success: true, id: doc.id };
    } catch (error) {
      console.error('Gardırop ekleme hatası:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Gardırop ürünlerini getir
   */
  getItems: async (userId) => {
    try {
      const q = query(
        collection(firestore, COLLECTIONS.WARDROBE),
        where('userId', '==', userId)
      );
      const querySnapshot = await getDocs(q);
      const items = [];
      querySnapshot.forEach((doc) => {
        items.push({ id: doc.id, ...doc.data() });
      });
      return { success: true, items };
    } catch (error) {
      console.error('Gardırop getirme hatası:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Gardırop ürününü güncelle
   */
  updateItem: async (itemId, data) => {
    try {
      const docRef = doc(firestore, COLLECTIONS.WARDROBE, itemId);
      await updateDoc(docRef, data);
      return { success: true };
    } catch (error) {
      console.error('Gardırop güncelleme hatası:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Gardırop ürününü sil
   */
  deleteItem: async (itemId) => {
    try {
      const docRef = doc(firestore, COLLECTIONS.WARDROBE, itemId);
      await deleteDoc(docRef);
      return { success: true };
    } catch (error) {
      console.error('Gardırop silme hatası:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Star işaretle
   */
  toggleStar: async (itemId, isStar) => {
    try {
      const docRef = doc(firestore, COLLECTIONS.WARDROBE, itemId);
      await updateDoc(docRef, { isStar });
      return { success: true };
    } catch (error) {
      console.error('Star güncelleme hatası:', error);
      return { success: false, error: error.message };
    }
  },
};

// ============================================================
// 📌 FAVORİ İŞLEMLERİ
// ============================================================

export const favoritesService = {
  /**
   * Favoriye ekle
   */
  add: async (userId, productId) => {
    try {
      const docRef = doc(firestore, COLLECTIONS.FAVORITES, `${userId}_${productId}`);
      await setDoc(docRef, {
        userId,
        productId,
        addedAt: serverTimestamp(),
      });
      return { success: true };
    } catch (error) {
      console.error('Favori ekleme hatası:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Favoriden çıkar
   */
  remove: async (userId, productId) => {
    try {
      const docRef = doc(firestore, COLLECTIONS.FAVORITES, `${userId}_${productId}`);
      await deleteDoc(docRef);
      return { success: true };
    } catch (error) {
      console.error('Favori çıkarma hatası:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Favorileri getir
   */
  get: async (userId) => {
    try {
      const q = query(
        collection(firestore, COLLECTIONS.FAVORITES),
        where('userId', '==', userId)
      );
      const querySnapshot = await getDocs(q);
      const items = [];
      querySnapshot.forEach((doc) => {
        items.push(doc.data().productId);
      });
      return { success: true, items };
    } catch (error) {
      console.error('Favori getirme hatası:', error);
      return { success: false, error: error.message };
    }
  },
};

// ============================================================
// 📌 VERİ TAŞIMA
// ============================================================

export const loadLocalData = async () => {
  try {
    const [profile, products, favorites, cart] = await Promise.all([
      AsyncStorage.getItem('@user_profile'),
      AsyncStorage.getItem('@user_products'),
      AsyncStorage.getItem('@favorites'),
      AsyncStorage.getItem('@cart'),
    ]);

    return {
      profile: profile ? JSON.parse(profile) : null,
      products: products ? JSON.parse(products) : [],
      favorites: favorites ? JSON.parse(favorites) : [],
      cart: cart ? JSON.parse(cart) : [],
    };
  } catch (error) {
    console.error('Local veri yükleme hatası:', error);
    return null;
  }
};

export const migrateDataToFirestore = async (userId, localData) => {
  try {
    // Profil
    if (localData.profile) {
      await profileService.createProfile(userId, localData.profile);
    }

    // Ürünler
    if (localData.products && localData.products.length > 0) {
      for (const product of localData.products) {
        await wardrobeService.addItem(userId, product);
      }
    }

    // Favoriler
    if (localData.favorites && localData.favorites.length > 0) {
      for (const productId of localData.favorites) {
        await favoritesService.add(userId, productId);
      }
    }

    return { success: true };
  } catch (error) {
    console.error('Veri taşıma hatası:', error);
    return { success: false, error: error.message };
  }
};