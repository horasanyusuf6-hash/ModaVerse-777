// src/services/FavoritesManager.js
import { db, auth } from '../config/firebase';
import { doc, getDoc, setDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';

const FAVORITES_COLLECTION = 'favoriler';

// Kullanıcının favorilerini getir
export const getUserFavorites = async () => {
  const user = auth.currentUser;
  if (!user) {
    console.log('❌ Kullanıcı giriş yapmamış');
    return [];
  }

  try {
    const docRef = doc(db, FAVORITES_COLLECTION, user.uid);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      return data.urunler || [];
    } else {
      // Kullanıcı için boş favori dokümanı oluştur
      await setDoc(docRef, { 
        kullaniciId: user.uid, 
        urunler: [] 
      });
      return [];
    }
  } catch (error) {
    console.error('Favoriler getirilirken hata:', error);
    return [];
  }
};

// Favori ekle
export const addFavorite = async (product) => {
  const user = auth.currentUser;
  if (!user) {
    console.log('❌ Kullanıcı giriş yapmamış');
    return false;
  }

  try {
    const docRef = doc(db, FAVORITES_COLLECTION, user.uid);
    
    await setDoc(docRef, {
      kullaniciId: user.uid,
      urunler: arrayUnion({
        id: product.id,
        name: product.name,
        brand: product.brand,
        price: product.price,
        image: product.image,
        addedAt: new Date().toISOString()
      })
    }, { merge: true });
    
    console.log('✅ Favori eklendi:', product.name);
    return true;
  } catch (error) {
    console.error('Favori eklenirken hata:', error);
    return false;
  }
};

// Favori çıkar
export const removeFavorite = async (productId) => {
  const user = auth.currentUser;
  if (!user) {
    console.log('❌ Kullanıcı giriş yapmamış');
    return false;
  }

  try {
    const docRef = doc(db, FAVORITES_COLLECTION, user.uid);
    const favoriteItem = { id: productId };
    
    await updateDoc(docRef, {
      urunler: arrayRemove(favoriteItem)
    });
    
    console.log('✅ Favori çıkarıldı:', productId);
    return true;
  } catch (error) {
    console.error('Favori çıkarılırken hata:', error);
    return false;
  }
};