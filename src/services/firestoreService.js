// 📁 src/services/firestoreService.js
import { db } from '../config/firebase';
import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  arrayUnion,
  arrayRemove,
  serverTimestamp,
  addDoc,
  writeBatch,
} from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ============================================================
// 📌 KULLANICI İŞLEMLERİ
// ============================================================

export const saveUserProfile = async (userData) => {
  try {
    const userRef = doc(db, 'users', userData.uid);
    await setDoc(userRef, {
      ...userData,
      updatedAt: serverTimestamp(),
    }, { merge: true });
    return { success: true };
  } catch (error) {
    console.error('Profil kaydedilirken hata:', error);
    return { success: false, error: error.message };
  }
};

export const getUserProfile = async (uid) => {
  try {
    const userRef = doc(db, 'users', uid);
    const docSnap = await getDoc(userRef);
    if (docSnap.exists()) {
      return { success: true, data: docSnap.data() };
    }
    return { success: false, error: 'Kullanıcı bulunamadı', notFound: true };
  } catch (error) {
    console.error('Profil getirilirken hata:', error);
    return { success: false, error: error.message };
  }
};

// ============================================================
// 📌 ÜRÜN İŞLEMLERİ
// ============================================================

export const addProduct = async (productData) => {
  try {
    const docRef = await addDoc(collection(db, 'products'), {
      ...productData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error('Ürün eklenirken hata:', error);
    return { success: false, error: error.message };
  }
};

export const getUserProducts = async (userId) => {
  try {
    const q = query(collection(db, 'products'), where('userId', '==', userId));
    const querySnapshot = await getDocs(q);
    const products = [];
    querySnapshot.forEach((doc) => {
      products.push({ id: doc.id, ...doc.data() });
    });
    return { success: true, data: products };
  } catch (error) {
    console.error('Ürünler getirilirken hata:', error);
    return { success: false, error: error.message };
  }
};

export const getProductById = async (productId) => {
  try {
    const docRef = doc(db, 'products', productId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { success: true, data: { id: docSnap.id, ...docSnap.data() } };
    }
    return { success: false, error: 'Ürün bulunamadı' };
  } catch (error) {
    console.error('Ürün getirilirken hata:', error);
    return { success: false, error: error.message };
  }
};

export const updateProduct = async (productId, productData) => {
  try {
    const docRef = doc(db, 'products', productId);
    await updateDoc(docRef, {
      ...productData,
      updatedAt: serverTimestamp(),
    });
    return { success: true };
  } catch (error) {
    console.error('Ürün güncellenirken hata:', error);
    return { success: false, error: error.message };
  }
};

export const deleteProduct = async (productId) => {
  try {
    await deleteDoc(doc(db, 'products', productId));
    return { success: true };
  } catch (error) {
    console.error('Ürün silinirken hata:', error);
    return { success: false, error: error.message };
  }
};

// ============================================================
// 📌 FAVORİ İŞLEMLERİ
// ============================================================

export const addFavorite = async (userId, productId) => {
  try {
    const favRef = doc(db, 'favorites', `${userId}_${productId}`);
    await setDoc(favRef, {
      userId,
      productId,
      createdAt: serverTimestamp(),
    });
    return { success: true };
  } catch (error) {
    console.error('Favori eklenirken hata:', error);
    return { success: false, error: error.message };
  }
};

export const removeFavorite = async (userId, productId) => {
  try {
    const favRef = doc(db, 'favorites', `${userId}_${productId}`);
    await deleteDoc(favRef);
    return { success: true };
  } catch (error) {
    console.error('Favori kaldırılırken hata:', error);
    return { success: false, error: error.message };
  }
};

export const getFavorites = async (userId) => {
  try {
    const q = query(collection(db, 'favorites'), where('userId', '==', userId));
    const querySnapshot = await getDocs(q);
    const favorites = [];
    querySnapshot.forEach((doc) => {
      favorites.push(doc.data());
    });
    return { success: true, data: favorites };
  } catch (error) {
    console.error('Favoriler getirilirken hata:', error);
    return { success: false, error: error.message };
  }
};

export const isFavorite = async (userId, productId) => {
  try {
    const favRef = doc(db, 'favorites', `${userId}_${productId}`);
    const docSnap = await getDoc(favRef);
    return { success: true, isFavorite: docSnap.exists() };
  } catch (error) {
    console.error('Favori kontrol edilirken hata:', error);
    return { success: false, isFavorite: false, error: error.message };
  }
};

// ============================================================
// 📌 SEPET İŞLEMLERİ
// ============================================================

export const addToCart = async (userId, productId, size = 'M', quantity = 1) => {
  try {
    const cartRef = doc(db, 'cart', `${userId}_${productId}_${size}`);
    const docSnap = await getDoc(cartRef);
    
    if (docSnap.exists()) {
      const currentData = docSnap.data();
      await updateDoc(cartRef, {
        quantity: (currentData.quantity || 1) + quantity,
        updatedAt: serverTimestamp(),
      });
    } else {
      await setDoc(cartRef, {
        userId,
        productId,
        size,
        quantity,
        addedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }
    return { success: true };
  } catch (error) {
    console.error('Sepete eklenirken hata:', error);
    return { success: false, error: error.message };
  }
};

export const updateCartItem = async (userId, productId, size, quantity) => {
  try {
    const cartRef = doc(db, 'cart', `${userId}_${productId}_${size}`);
    await updateDoc(cartRef, {
      quantity,
      updatedAt: serverTimestamp(),
    });
    return { success: true };
  } catch (error) {
    console.error('Sepet güncellenirken hata:', error);
    return { success: false, error: error.message };
  }
};

export const removeFromCart = async (userId, productId, size) => {
  try {
    const cartRef = doc(db, 'cart', `${userId}_${productId}_${size}`);
    await deleteDoc(cartRef);
    return { success: true };
  } catch (error) {
    console.error('Sepetten kaldırılırken hata:', error);
    return { success: false, error: error.message };
  }
};

export const getCart = async (userId) => {
  try {
    const q = query(collection(db, 'cart'), where('userId', '==', userId));
    const querySnapshot = await getDocs(q);
    const cart = [];
    querySnapshot.forEach((doc) => {
      cart.push({ id: doc.id, ...doc.data() });
    });
    return { success: true, data: cart };
  } catch (error) {
    console.error('Sepet getirilirken hata:', error);
    return { success: false, error: error.message };
  }
};

export const clearCart = async (userId) => {
  try {
    const q = query(collection(db, 'cart'), where('userId', '==', userId));
    const querySnapshot = await getDocs(q);
    const deletePromises = [];
    querySnapshot.forEach((doc) => {
      deletePromises.push(deleteDoc(doc.ref));
    });
    await Promise.all(deletePromises);
    return { success: true };
  } catch (error) {
    console.error('Sepet temizlenirken hata:', error);
    return { success: false, error: error.message };
  }
};

// ============================================================
// 📌 STİL İŞLEMLERİ
// ============================================================

export const getUserStyles = async (userId) => {
  try {
    const q = query(collection(db, 'styles'), where('userId', '==', userId));
    const querySnapshot = await getDocs(q);
    const styles = [];
    querySnapshot.forEach((doc) => {
      styles.push({ id: doc.id, ...doc.data() });
    });
    return { success: true, data: styles };
  } catch (error) {
    console.error('Stiller getirilirken hata:', error);
    return { success: false, error: error.message };
  }
};

export const saveUserStyles = async (userId, styles) => {
  try {
    // Eski stilleri sil
    const q = query(collection(db, 'styles'), where('userId', '==', userId));
    const querySnapshot = await getDocs(q);
    const deletePromises = [];
    querySnapshot.forEach((doc) => {
      deletePromises.push(deleteDoc(doc.ref));
    });
    await Promise.all(deletePromises);
    
    // Yeni stilleri ekle
    for (const style of styles) {
      const styleRef = doc(collection(db, 'styles'));
      await setDoc(styleRef, {
        ...style,
        userId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }
    return { success: true };
  } catch (error) {
    console.error('Stiller kaydedilirken hata:', error);
    return { success: false, error: error.message };
  }
};

// ============================================================
// 📌 KOMBİN İŞLEMLERİ (OUTFITS)
// ============================================================

export const saveOutfit = async (userId, outfitData) => {
  try {
    const docRef = await addDoc(collection(db, 'outfits'), {
      ...outfitData,
      userId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error('Kombin kaydedilirken hata:', error);
    return { success: false, error: error.message };
  }
};

export const getUserOutfits = async (userId) => {
  try {
    const q = query(collection(db, 'outfits'), where('userId', '==', userId));
    const querySnapshot = await getDocs(q);
    const outfits = [];
    querySnapshot.forEach((doc) => {
      outfits.push({ id: doc.id, ...doc.data() });
    });
    return { success: true, data: outfits };
  } catch (error) {
    console.error('Kombinler getirilirken hata:', error);
    return { success: false, error: error.message };
  }
};

// ============================================================
// 📌 VERİ TAŞIMA
// ============================================================

export const loadLocalData = async () => {
  try {
    const profile = await AsyncStorage.getItem('@user_profile');
    const products = await AsyncStorage.getItem('@user_products');
    const favorites = await AsyncStorage.getItem('@user_favorites');
    const cart = await AsyncStorage.getItem('@user_cart');
    const styles = await AsyncStorage.getItem('@user_styles');
    const savedPosts = await AsyncStorage.getItem('@saved_posts');
    
    return {
      profile: profile ? JSON.parse(profile) : null,
      products: products ? JSON.parse(products) : [],
      favorites: favorites ? JSON.parse(favorites) : [],
      cart: cart ? JSON.parse(cart) : [],
      styles: styles ? JSON.parse(styles) : [],
      savedPosts: savedPosts ? JSON.parse(savedPosts) : [],
    };
  } catch (error) {
    console.error('Local veri okunurken hata:', error);
    return null;
  }
};

export const migrateDataToFirestore = async (userId, localData) => {
  try {
    const batch = writeBatch(db);
    
    if (localData.profile) {
      const userRef = doc(db, 'users', userId);
      batch.set(userRef, {
        ...localData.profile,
        uid: userId,
        updatedAt: serverTimestamp(),
      }, { merge: true });
    }
    
    if (localData.products && localData.products.length > 0) {
      for (const product of localData.products) {
        const productRef = doc(collection(db, 'products'));
        batch.set(productRef, {
          ...product,
          userId,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }
    }
    
    if (localData.favorites && localData.favorites.length > 0) {
      for (const productId of localData.favorites) {
        const favRef = doc(db, 'favorites', `${userId}_${productId}`);
        batch.set(favRef, {
          userId,
          productId,
          createdAt: serverTimestamp(),
        });
      }
    }
    
    if (localData.cart && localData.cart.length > 0) {
      for (const item of localData.cart) {
        const cartRef = doc(db, 'cart', `${userId}_${item.productId}_${item.size || 'M'}`);
        batch.set(cartRef, {
          userId,
          productId: item.productId,
          size: item.size || 'M',
          quantity: item.quantity || 1,
          addedAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }
    }
    
    if (localData.styles && localData.styles.length > 0) {
      for (const style of localData.styles) {
        const styleRef = doc(collection(db, 'styles'));
        batch.set(styleRef, {
          ...style,
          userId,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }
    }
    
    await batch.commit();
    return { success: true };
  } catch (error) {
    console.error('Veri taşınırken hata:', error);
    return { success: false, error: error.message };
  }
};

export const clearLocalData = async () => {
  try {
    await AsyncStorage.multiRemove([
      '@user_profile',
      '@user_products',
      '@user_favorites',
      '@user_cart',
      '@user_styles',
      '@saved_posts',
    ]);
    console.log('✅ Local veriler temizlendi');
    return { success: true };
  } catch (error) {
    console.error('Local veri temizlenirken hata:', error);
    return { success: false, error: error.message };
  }
};

// ============================================================
// 📌 YEDEKLEME
// ============================================================

export const backupUserData = async (userId) => {
  try {
    const profile = await getUserProfile(userId);
    const products = await getUserProducts(userId);
    const favorites = await getFavorites(userId);
    const cart = await getCart(userId);
    const outfits = await getUserOutfits(userId);
    
    const backupData = {
      profile: profile.success ? profile.data : null,
      products: products.success ? products.data : [],
      favorites: favorites.success ? favorites.data : [],
      cart: cart.success ? cart.data : [],
      outfits: outfits.success ? outfits.data : [],
      backedUpAt: new Date().toISOString(),
    };
    
    await AsyncStorage.setItem(`@backup_${userId}`, JSON.stringify(backupData));
    return { success: true, data: backupData };
  } catch (error) {
    console.error('Yedekleme hatası:', error);
    return { success: false, error: error.message };
  }
};

export const restoreUserData = async (userId) => {
  try {
    const backup = await AsyncStorage.getItem(`@backup_${userId}`);
    if (!backup) {
      return { success: false, error: 'Yedek bulunamadı' };
    }
    const data = JSON.parse(backup);
    return { success: true, data };
  } catch (error) {
    console.error('Yedek geri yükleme hatası:', error);
    return { success: false, error: error.message };
  }
};