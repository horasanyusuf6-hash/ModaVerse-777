// src/services/WardrobeManager.js
import { db, auth } from '../config/firebase';
import { doc, getDoc, setDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';

const WARDROBE_COLLECTION = 'gardirop';

// Kullanıcının gardırobunu getir
export const getUserWardrobe = async () => {
  const user = auth.currentUser;
  if (!user) {
    console.log('❌ Kullanıcı giriş yapmamış');
    return [];
  }

  try {
    const docRef = doc(db, WARDROBE_COLLECTION, user.uid);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      return data.urunler || [];
    } else {
      await setDoc(docRef, { 
        kullaniciId: user.uid, 
        urunler: [] 
      });
      return [];
    }
  } catch (error) {
    console.error('Gardırop getirilirken hata:', error);
    return [];
  }
};

// Gardıroba ürün ekle
export const addToWardrobe = async (product) => {
  const user = auth.currentUser;
  if (!user) {
    console.log('❌ Kullanıcı giriş yapmamış');
    return false;
  }

  try {
    const docRef = doc(db, WARDROBE_COLLECTION, user.uid);
    
    await setDoc(docRef, {
      kullaniciId: user.uid,
      urunler: arrayUnion({
        id: product.id,
        name: product.name,
        brand: product.brand,
        price: product.price,
        image: product.image,
        category: product.category,
        addedAt: new Date().toISOString()
      })
    }, { merge: true });
    
    console.log('✅ Gardıroba eklendi:', product.name);
    return true;
  } catch (error) {
    console.error('Gardıroba eklenirken hata:', error);
    return false;
  }
};

// Gardıroptan ürün çıkar
export const removeFromWardrobe = async (productId) => {
  const user = auth.currentUser;
  if (!user) {
    console.log('❌ Kullanıcı giriş yapmamış');
    return false;
  }

  try {
    const docRef = doc(db, WARDROBE_COLLECTION, user.uid);
    const wardrobeItem = { id: productId };
    
    await updateDoc(docRef, {
      urunler: arrayRemove(wardrobeItem)
    });
    
    console.log('✅ Gardıroptan çıkarıldı:', productId);
    return true;
  } catch (error) {
    console.error('Gardıroptan çıkarılırken hata:', error);
    return false;
  }
};