// src/services/CartManager.js
import { db, auth } from '../config/firebase';
import { doc, getDoc, setDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';

const CART_COLLECTION = 'arabalar';

// Kullanıcının sepetini getir
export const getUserCart = async () => {
  const user = auth.currentUser;
  if (!user) {
    console.log('❌ Kullanıcı giriş yapmamış');
    return [];
  }

  try {
    const docRef = doc(db, CART_COLLECTION, user.uid);
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
    console.error('Sepet getirilirken hata:', error);
    return [];
  }
};

// Sepete ürün ekle
export const addToCart = async (product, quantity = 1) => {
  const user = auth.currentUser;
  if (!user) {
    console.log('❌ Kullanıcı giriş yapmamış');
    return false;
  }

  try {
    const docRef = doc(db, CART_COLLECTION, user.uid);
    
    await setDoc(docRef, {
      kullaniciId: user.uid,
      urunler: arrayUnion({
        id: product.id,
        name: product.name,
        brand: product.brand,
        price: product.price,
        image: product.image,
        quantity: quantity,
        addedAt: new Date().toISOString()
      })
    }, { merge: true });
    
    console.log('✅ Sepete eklendi:', product.name);
    return true;
  } catch (error) {
    console.error('Sepete eklenirken hata:', error);
    return false;
  }
};

// Sepetten ürün çıkar
export const removeFromCart = async (productId) => {
  const user = auth.currentUser;
  if (!user) {
    console.log('❌ Kullanıcı giriş yapmamış');
    return false;
  }

  try {
    const docRef = doc(db, CART_COLLECTION, user.uid);
    const cartItem = { id: productId };
    
    await updateDoc(docRef, {
      urunler: arrayRemove(cartItem)
    });
    
    console.log('✅ Sepetten çıkarıldı:', productId);
    return true;
  } catch (error) {
    console.error('Sepetten çıkarılırken hata:', error);
    return false;
  }
};