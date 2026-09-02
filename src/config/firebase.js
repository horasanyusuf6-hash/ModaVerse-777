// 📁 src/config/firebase.js
import { initializeApp } from 'firebase/app';
import { 
  initializeAuth, 
  getReactNativePersistence,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
} from 'firebase/auth';
import { 
  getFirestore,
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  addDoc,
  serverTimestamp,
  FieldValue,
  arrayUnion,
  arrayRemove,
  increment,
} from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

// ============================================================
// 🔥 FIREBASE KONFIGÜRASYONU
// ============================================================
const firebaseConfig = {
  apiKey: "AIzaSyBWqQyRHUaSm-g4Qx8xtv7RZ_07XVb3uGI",
  authDomain: "modaverse-4bd79.firebaseapp.com",
  projectId: "modaverse-4bd79",
  storageBucket: "modaverse-4bd79.firebasestorage.app",
  messagingSenderId: "379185483801",
  appId: "1:379185483801:android:e8302c0ec1b5c0a2b51a88",
};

// ============================================================
// 📦 FIREBASE BAŞLAT
// ============================================================
let app;
let auth;
let db;

try {
  app = initializeApp(firebaseConfig);

  // 🔥 Auth - React Native AsyncStorage ile kalıcı oturum
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(ReactNativeAsyncStorage),
  });

  // 🔥 Firestore
  db = getFirestore(app);

  console.log('🔥 Firebase başlatıldı!');
} catch (error) {
  console.error('❌ Firebase başlatma hatası:', error);
}

// ============================================================
// 📤 AUTH FONKSİYONLARI
// ============================================================
export const authService = {
  // Kullanıcı durumunu dinle
  onAuthStateChanged: (callback) => {
    if (auth) {
      return onAuthStateChanged(auth, callback);
    }
    return () => {};
  },

  // Giriş yap
  signIn: async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return { success: true, user: userCredential.user };
    } catch (error) {
      console.error('Giriş hatası:', error);
      return { success: false, error: error.message, code: error.code };
    }
  },

  // Kayıt ol
  signUp: async (email, password, displayName) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      // Display name güncelle
      if (displayName && userCredential.user) {
        await updateProfile(userCredential.user, { displayName });
      }
      return { success: true, user: userCredential.user };
    } catch (error) {
      console.error('Kayıt hatası:', error);
      return { success: false, error: error.message, code: error.code };
    }
  },

  // Çıkış yap
  signOut: async () => {
    try {
      await signOut(auth);
      return { success: true };
    } catch (error) {
      console.error('Çıkış hatası:', error);
      return { success: false, error: error.message };
    }
  },

  // Şifre sıfırlama
  resetPassword: async (email) => {
    try {
      await sendPasswordResetEmail(auth, email);
      return { success: true };
    } catch (error) {
      console.error('Şifre sıfırlama hatası:', error);
      return { success: false, error: error.message };
    }
  },

  // Profil güncelle
  updateUserProfile: async (displayName, photoURL) => {
    try {
      if (auth.currentUser) {
        await updateProfile(auth.currentUser, { displayName, photoURL });
        return { success: true };
      }
      return { success: false, error: 'Kullanıcı oturumu yok' };
    } catch (error) {
      console.error('Profil güncelleme hatası:', error);
      return { success: false, error: error.message };
    }
  },

  // Mevcut kullanıcıyı getir
  getCurrentUser: () => {
    return auth?.currentUser || null;
  },
};

// ============================================================
// 📤 FIRESTORE FONKSİYONLARI
// ============================================================
export const firestoreService = {
  // Koleksiyon referansı
  collection: (path) => collection(db, path),
  doc: (path, id) => doc(db, path, id),

  // Belge oluştur
  create: async (collectionPath, data) => {
    try {
      const docRef = await addDoc(collection(db, collectionPath), {
        ...data,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      return { success: true, id: docRef.id };
    } catch (error) {
      console.error('Belge oluşturma hatası:', error);
      return { success: false, error: error.message };
    }
  },

  // Belge oku
  get: async (collectionPath, docId) => {
    try {
      const docRef = doc(db, collectionPath, docId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return { success: true, data: { id: docSnap.id, ...docSnap.data() } };
      }
      return { success: false, error: 'Belge bulunamadı' };
    } catch (error) {
      console.error('Belge okuma hatası:', error);
      return { success: false, error: error.message };
    }
  },

  // Belge güncelle
  update: async (collectionPath, docId, data) => {
    try {
      const docRef = doc(db, collectionPath, docId);
      await updateDoc(docRef, {
        ...data,
        updatedAt: serverTimestamp(),
      });
      return { success: true };
    } catch (error) {
      console.error('Belge güncelleme hatası:', error);
      return { success: false, error: error.message };
    }
  },

  // Belge sil
  delete: async (collectionPath, docId) => {
    try {
      const docRef = doc(db, collectionPath, docId);
      await deleteDoc(docRef);
      return { success: true };
    } catch (error) {
      console.error('Belge silme hatası:', error);
      return { success: false, error: error.message };
    }
  },

  // Sorgu
  query: async (collectionPath, conditions = [], orderByField = null, limitCount = null) => {
    try {
      let q = collection(db, collectionPath);
      
      // Filtreler
      conditions.forEach(([field, operator, value]) => {
        q = query(q, where(field, operator, value));
      });
      
      // Sıralama
      if (orderByField) {
        q = query(q, orderBy(orderByField, 'desc'));
      }
      
      // Limit
      if (limitCount) {
        q = query(q, limit(limitCount));
      }
      
      const querySnapshot = await getDocs(q);
      const results = [];
      querySnapshot.forEach((doc) => {
        results.push({ id: doc.id, ...doc.data() });
      });
      return { success: true, data: results };
    } catch (error) {
      console.error('Sorgu hatası:', error);
      return { success: false, error: error.message };
    }
  },

  // FieldValue helper'lar
  FieldValue: {
    serverTimestamp: serverTimestamp(),
    arrayUnion: arrayUnion,
    arrayRemove: arrayRemove,
    increment: increment,
  },
};

// ============================================================
// 📤 EXPORT
// ============================================================
export { app, auth, db };

// Servisleri tek bir export'ta topla
export default {
  app,
  auth,
  db,
  authService,
  firestoreService,
};