// 📁 src/screens/CartScreen.js - TAM REVİZE (Backend Entegre)
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  FlatList,
  TouchableOpacity,
  Image,
  Dimensions,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, TYPOGRAPHY, SIZES } from '../constants/Theme';
import { auth } from '../config/firebase';

const { width } = Dimensions.get('window');

// ============================================================
// 📌 CART MANAGER (Backend Entegre)
// ============================================================

// Sepeti yükle
const getUserCart = async () => {
  try {
    const cart = await AsyncStorage.getItem('@cart');
    return cart ? JSON.parse(cart) : [];
  } catch (error) {
    console.error('Sepet yüklenirken hata:', error);
    return [];
  }
};

// Sepetten ürün çıkar
const removeFromCart = async (itemId) => {
  try {
    const cart = await getUserCart();
    const newCart = cart.filter(item => item.id !== itemId);
    await AsyncStorage.setItem('@cart', JSON.stringify(newCart));
    return true;
  } catch (error) {
    console.error('Sepetten çıkarma hatası:', error);
    return false;
  }
};

// Sepet öğesini güncelle
const updateCartItem = async (itemId, newQuantity) => {
  try {
    const cart = await getUserCart();
    const newCart = cart.map(item => {
      if (item.id === itemId) {
        return { ...item, quantity: newQuantity };
      }
      return item;
    });
    await AsyncStorage.setItem('@cart', JSON.stringify(newCart));
    return true;
  } catch (error) {
    console.error('Sepet güncelleme hatası:', error);
    return false;
  }
};

// Sepeti temizle
const clearCart = async () => {
  try {
    await AsyncStorage.setItem('@cart', JSON.stringify([]));
    return true;
  } catch (error) {
    console.error('Sepet temizleme hatası:', error);
    return false;
  }
};

// ============================================================
// 📌 ANA BİLEŞEN
// ============================================================
const CartScreen = ({ navigation }) => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPrice, setTotalPrice] = useState(0);
  const [user, setUser] = useState(null);

  // Firebase Auth
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
    });
    return unsubscribe;
  }, []);

  // ============================================================
  // 📌 SEPETİ YÜKLE
  // ============================================================
  const loadCart = async () => {
    try {
      const cart = await getUserCart();
      setCartItems(cart);
      
      // Toplam fiyatı hesapla
      const total = cart.reduce((sum, item) => {
        const price = item.price || item.fiyat || 0;
        const quantity = item.quantity || 1;
        return sum + (price * quantity);
      }, 0);
      setTotalPrice(total);
    } catch (error) {
      console.error('Sepet yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCart();
  }, []);

  // ============================================================
  // 📌 HANDLERS
  // ============================================================
  const handleRemoveItem = async (itemId) => {
    Alert.alert(
      'Ürünü Kaldır',
      'Bu ürünü sepetten kaldırmak istediğinize emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Kaldır',
          style: 'destructive',
          onPress: async () => {
            const success = await removeFromCart(itemId);
            if (success) {
              await loadCart();
            }
          }
        }
      ]
    );
  };

  const handleUpdateQuantity = async (itemId, newQuantity) => {
    if (newQuantity < 1) return;
    const success = await updateCartItem(itemId, newQuantity);
    if (success) {
      await loadCart();
    }
  };

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      Alert.alert('Uyarı', 'Sepetiniz boş!');
      return;
    }
    
    if (!user) {
      Alert.alert(
        'Giriş Yapın',
        'Ödeme işlemi için lütfen giriş yapın.',
        [
          { text: 'İptal', style: 'cancel' },
          { text: 'Giriş Yap', onPress: () => navigation.navigate('Auth') }
        ]
      );
      return;
    }
    
    navigation.navigate('Checkout');
  };

  // ============================================================
  // 📌 RENDER FUNCTIONS
  // ============================================================
  const renderItem = ({ item }) => {
    const productName = item.ad || item.name || 'Ürün';
    const productBrand = item.marka || item.brand || 'Marka';
    const productImage = item.img_url || item.image || 'https://picsum.photos/200/200?random=' + (item.id || 1);
    const productPrice = item.fiyat || item.price || 0;
    const productSize = item.beden || item.size || 'M';
    const productColor = item.renk || item.color || 'Standart';
    const quantity = item.quantity || 1;
    
    return (
      <View style={styles.cartItem}>
        <Image source={{ uri: productImage }} style={styles.itemImage} />
        
        <View style={styles.itemInfo}>
          <Text style={styles.itemBrand}>{productBrand}</Text>
          <Text style={styles.itemName} numberOfLines={2}>{productName}</Text>
          
          <View style={styles.itemDetails}>
            <Text style={styles.itemDetail}>{productSize}</Text>
            <Text style={styles.itemDetail}>•</Text>
            <Text style={styles.itemDetail}>{productColor}</Text>
          </View>
          
          <View style={styles.itemBottom}>
            <Text style={styles.itemPrice}>₺{productPrice}</Text>
            
            <View style={styles.quantityContainer}>
              <TouchableOpacity 
                style={styles.quantityButton}
                onPress={() => handleUpdateQuantity(item.id, quantity - 1)}
              >
                <Ionicons name="remove" size={14} color={COLORS.black} />
              </TouchableOpacity>
              
              <Text style={styles.quantityText}>{quantity}</Text>
              
              <TouchableOpacity 
                style={styles.quantityButton}
                onPress={() => handleUpdateQuantity(item.id, quantity + 1)}
              >
                <Ionicons name="add" size={14} color={COLORS.black} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
        
        <TouchableOpacity 
          style={styles.removeButton}
          onPress={() => handleRemoveItem(item.id)}
        >
          <Ionicons name="close" size={18} color={COLORS.grayMedium} />
        </TouchableOpacity>
      </View>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconContainer}>
        <Ionicons name="cart-outline" size={48} color={COLORS.grayLight} />
      </View>
      <Text style={styles.emptyTitle}>SEPETİN BOŞ</Text>
      <Text style={styles.emptyText}>Alışverişe başlamak için mağazayı keşfet!</Text>
      <TouchableOpacity 
        style={styles.emptyButton}
        onPress={() => navigation?.goBack()}
      >
        <Text style={styles.emptyButtonText}>ALIŞVERİŞE BAŞLA</Text>
      </TouchableOpacity>
    </View>
  );

  const renderFooter = () => (
    <View style={styles.footer}>
      <View style={styles.totalRow}>
        <Text style={styles.totalLabel}>TOPLAM</Text>
        <Text style={styles.totalPrice}>₺{totalPrice}</Text>
      </View>
      
      <TouchableOpacity 
        style={[styles.checkoutButton, cartItems.length === 0 && styles.checkoutDisabled]}
        disabled={cartItems.length === 0}
        onPress={handleCheckout}
      >
        <Text style={styles.checkoutButtonText}>ÖDEMEYE GEÇ</Text>
        <Ionicons name="arrow-forward" size={18} color={COLORS.white} />
      </TouchableOpacity>
    </View>
  );

  // ============================================================
  // 📌 RENDER
  // ============================================================
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.black} />
          <Text style={styles.loadingText}>YÜKLENİYOR...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation?.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.black} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>SEPETİM</Text>
        <TouchableOpacity onPress={loadCart} style={styles.refreshButton}>
          <Ionicons name="refresh-outline" size={20} color={COLORS.black} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={cartItems}
        renderItem={renderItem}
        keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={renderEmpty}
        ListFooterComponent={cartItems.length > 0 ? renderFooter : null}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

// ============================================================
// 📌 STYLES
// ============================================================
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: SIZES.md },
  loadingText: { ...TYPOGRAPHY.caption, color: COLORS.grayMedium },

  // HEADER
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 0.5,
    borderBottomColor: '#F0F0F0',
  },
  backButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  refreshButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { ...TYPOGRAPHY.title3, fontSize: 17, fontWeight: '600', letterSpacing: 1 },
  
  // LIST
  listContent: { paddingHorizontal: 16, paddingBottom: 20 },
  
  // CART ITEM
  cartItem: {
    flexDirection: 'row',
    paddingVertical: 14,
    borderBottomWidth: 0.5,
    borderBottomColor: '#F5F5F5',
    gap: 14,
  },
  itemImage: { width: 80, height: 100, resizeMode: 'cover', backgroundColor: '#F8F8F8' },
  itemInfo: { flex: 1, justifyContent: 'space-between' },
  itemBrand: { ...TYPOGRAPHY.caption, fontSize: 10, color: COLORS.grayMedium, letterSpacing: 0.5 },
  itemName: { ...TYPOGRAPHY.body, fontSize: 14, fontWeight: '500', marginVertical: 2 },
  itemDetails: { flexDirection: 'row', gap: 6, marginBottom: 4 },
  itemDetail: { ...TYPOGRAPHY.caption, fontSize: 11, color: COLORS.grayMedium },
  itemBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  itemPrice: { ...TYPOGRAPHY.body, fontSize: 15, fontWeight: '600' },
  
  // QUANTITY
  quantityContainer: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  quantityButton: { width: 28, height: 28, borderWidth: 0.5, borderColor: '#E0E0E0', justifyContent: 'center', alignItems: 'center' },
  quantityText: { ...TYPOGRAPHY.body, fontSize: 14, fontWeight: '500', minWidth: 20, textAlign: 'center' },
  removeButton: { padding: 4, alignSelf: 'flex-start' },
  
  // FOOTER
  footer: { marginTop: 20, paddingTop: 16, borderTopWidth: 0.5, borderTopColor: '#F0F0F0' },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  totalLabel: { ...TYPOGRAPHY.caption, fontSize: 12, color: COLORS.grayMedium, letterSpacing: 1 },
  totalPrice: { ...TYPOGRAPHY.title3, fontSize: 20, fontWeight: '700' },
  checkoutButton: {
    flexDirection: 'row',
    backgroundColor: COLORS.black,
    paddingVertical: 16,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  checkoutDisabled: { opacity: 0.4 },
  checkoutButtonText: { ...TYPOGRAPHY.button, fontSize: 13, color: COLORS.white, letterSpacing: 1.5, fontWeight: '600' },
  
  // EMPTY
  emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: 80, gap: 12 },
  emptyIconContainer: { width: 80, height: 80, borderWidth: 0.5, borderColor: '#E0E0E0', justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  emptyTitle: { ...TYPOGRAPHY.body, fontSize: 17, fontWeight: '600', letterSpacing: 1 },
  emptyText: { ...TYPOGRAPHY.bodySmall, fontSize: 13, color: COLORS.grayMedium, marginBottom: 20 },
  emptyButton: { borderWidth: 0.5, borderColor: COLORS.black, paddingHorizontal: 32, paddingVertical: 12 },
  emptyButtonText: { ...TYPOGRAPHY.caption, fontSize: 11, letterSpacing: 1.5, fontWeight: '600' },
});

export default CartScreen;