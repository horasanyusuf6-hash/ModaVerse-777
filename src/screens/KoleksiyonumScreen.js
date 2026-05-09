// 📁 src/screens/KoleksiyonumScreen.js - API ENTEGRASYONLU PREMİUM VERSİYON
import React, { useState, useEffect } from 'react';
import {
  View,
  FlatList,
  Alert,
  Image,
  SafeAreaView,
  StatusBar,
  Dimensions,
  TouchableOpacity,
  RefreshControl,
  Modal,
  ScrollView,
  StyleSheet
} from 'react-native';
import {
  Appbar,
  Button,
  Text,
  ActivityIndicator,
  FAB,
  Chip
} from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';

// 📏 Ekran boyutları
const { width, height } = Dimensions.get('window');

// 🎨 PREMİUM SİYAH BEYAZ RENK PALETİ
const COLORS = {
  pureBlack: '#000000',
  charcoal: '#1A1A1A',
  graphite: '#2D2D2D',
  darkGray: '#3A3A3A',
  midGray: '#666666',
  silver: '#999999',
  lightGray: '#E5E5E5',
  offWhite: '#F5F5F5',
  pureWhite: '#FFFFFF',
  gold: '#D4AF37',
  cognac: '#8C7853',
  error: '#E74C3C',
  success: '#27AE60',
};

// 📡 API URL (Telefon için - laptop'un IP'si)
const API_URL = 'http://10.174.132.67:5000';

const KoleksiyonumScreen = ({ navigation }) => {
  // 📊 STATE'LER
  const [activeTab, setActiveTab] = useState('gardrob');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  // 📥 VERİLERİ API'DEN ÇEK
  const fetchItems = async () => {
    try {
      console.log('📡 API çağrısı yapılıyor...', API_URL);
      const response = await fetch(`${API_URL}/api/items`);
      const data = await response.json();
      
      console.log('📦 Gelen veri:', data);
      
      if (data.success && data.items && data.items.length > 0) {
        const formattedItems = data.items.map((item) => ({
          id: item.id,
          name: item.category || 'Ürün',
          brand: item.brand || 'MARKA YOK',
          price: 0,
          category: item.category,
          color: item.color,
          pattern: item.pattern,
          season: item.season,
          image: item.image_path ? `${API_URL}/${item.image_path}` : null,
          isFavorite: false,
          inStock: true,
          created_at: item.created_at
        }));
        
        console.log('✅ Formatlanan ürünler:', formattedItems.length);
        setProducts(formattedItems);
      } else {
        console.log('⚠️ API\'den veri gelmedi, boş liste');
        setProducts([]);
      }
    } catch (error) {
      console.error('❌ Fetch hatası:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  // 🔄 Yenileme
  const onRefresh = async () => {
    setRefreshing(true);
    await fetchItems();
    setRefreshing(false);
  };

  // 📥 İlk yükleme
  useEffect(() => {
    fetchItems();
    
    const unsubscribe = navigation.addListener('focus', () => {
      fetchItems();
    });
    
    return unsubscribe;
  }, [navigation]);

  // ❤️ FAVORİ TOGGLE
  const toggleFavorite = (productId) => {
    setProducts(prev => prev.map(p => 
      p.id === productId ? { ...p, isFavorite: !p.isFavorite } : p
    ));
  };

  // 🛒 SEPETE EKLE
  const addToCart = (product) => {
    Alert.alert('🛒 Sepete Eklendi', `${product.name} sepete eklendi.`);
  };

  // 📊 Filtrelenmiş ürünler
  const filteredProducts = activeTab === 'favoriler' 
    ? products.filter(p => p.isFavorite)
    : products;

  // 📊 İSTATİSTİKLER
  const stats = {
    totalItems: products.length,
    totalValue: products.reduce((sum, p) => sum + (p.price || 0), 0),
    favoriteCount: products.filter(p => p.isFavorite).length,
    categories: [...new Set(products.map(p => p.category))].length
  };

  // 📦 ÜRÜN KARTI
  const ProductCard = ({ item }) => (
    <TouchableOpacity 
      style={styles.productCard}
      onPress={() => {
        setSelectedProduct(item);
        setModalVisible(true);
      }}
      activeOpacity={0.85}
    >
      <View style={styles.productImageContainer}>
        {item.image ? (
          <Image source={{ uri: item.image }} style={styles.productImage} />
        ) : (
          <View style={styles.placeholderImage}>
            <Ionicons name="shirt-outline" size={40} color={COLORS.silver} />
          </View>
        )}
        <TouchableOpacity 
          style={styles.favoriteButton}
          onPress={() => toggleFavorite(item.id)}
        >
          <Ionicons 
            name={item.isFavorite ? "heart" : "heart-outline"} 
            size={18} 
            color={item.isFavorite ? COLORS.error : COLORS.pureWhite} 
          />
        </TouchableOpacity>
      </View>
      
      <View style={styles.productInfo}>
        <Text style={styles.productBrand}>{item.brand || 'MARKA YOK'}</Text>
        <Text style={styles.productName} numberOfLines={2}>
          {item.name?.charAt(0).toUpperCase() + item.name?.slice(1) || 'Ürün'}
        </Text>
        <Text style={styles.productColor}>{item.color || 'Renk belirsiz'}</Text>
        <View style={styles.productFooter}>
          <Chip style={styles.categoryChip}>
            <Text style={styles.categoryChipText}>{item.category || 'diğer'}</Text>
          </Chip>
        </View>
      </View>
    </TouchableOpacity>
  );

  // 📊 İSTATİSTİK KARTLARI
  const StatsCards = () => (
    <View style={styles.statsContainer}>
      <View style={styles.statCard}>
        <Text style={styles.statNumber}>{stats.totalItems}</Text>
        <Text style={styles.statLabel}>PARÇA</Text>
      </View>
      <View style={styles.statDivider} />
      <View style={styles.statCard}>
        <Text style={styles.statNumber}>{stats.categories}</Text>
        <Text style={styles.statLabel}>KATEGORİ</Text>
      </View>
      <View style={styles.statDivider} />
      <View style={styles.statCard}>
        <Text style={styles.statNumber}>{stats.favoriteCount}</Text>
        <Text style={styles.statLabel}>FAVORİ</Text>
      </View>
    </View>
  );

  // 🎀 KOMBİNLER BÖLÜMÜ
  const CombinationsTab = () => (
    <View style={styles.combinationsContainer}>
      <View style={styles.emptyState}>
        <View style={styles.emptyIconCircle}>
          <Ionicons name="shirt-outline" size={40} color={COLORS.midGray} />
        </View>
        <Text style={styles.emptyTitle}>Henüz Kombin Yok</Text>
        <Text style={styles.emptyText}>
          Gardırobundaki parçalarla{'\n'}kombin oluşturmaya ne dersin?
        </Text>
        <Button 
          mode="outline" 
          onPress={() => Alert.alert('Kombin Oluştur', 'Yakında!')} 
          style={styles.createButton}
          labelStyle={styles.createButtonLabel}
        >
          Kombin Oluştur
        </Button>
      </View>
    </View>
  );

  // 🖼️ ÜRÜN DETAY MODALI
  const ProductDetailModal = () => (
    <Modal
      visible={modalVisible}
      transparent={true}
      animationType="fade"
      onRequestClose={() => setModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          {selectedProduct && (
            <>
              <View style={styles.modalImageContainer}>
                {selectedProduct.image ? (
                  <Image source={{ uri: selectedProduct.image }} style={styles.modalImage} />
                ) : (
                  <View style={styles.modalPlaceholder}>
                    <Ionicons name="shirt-outline" size={60} color={COLORS.silver} />
                  </View>
                )}
                <TouchableOpacity style={styles.modalClose} onPress={() => setModalVisible(false)}>
                  <Ionicons name="close" size={20} color={COLORS.pureWhite} />
                </TouchableOpacity>
              </View>
              
              <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
                <Text style={styles.modalBrand}>{selectedProduct.brand || 'MARKA YOK'}</Text>
                <Text style={styles.modalName}>
                  {selectedProduct.name?.charAt(0).toUpperCase() + selectedProduct.name?.slice(1) || 'Ürün'}
                </Text>
                
                <View style={styles.divider} />
                
                <View style={styles.modalDetails}>
                  <View style={styles.modalDetailRow}>
                    <Text style={styles.modalDetailLabel}>Kategori</Text>
                    <Text style={styles.modalDetailValue}>{selectedProduct.category || 'diğer'}</Text>
                  </View>
                  <View style={styles.modalDetailRow}>
                    <Text style={styles.modalDetailLabel}>Renk</Text>
                    <Text style={styles.modalDetailValue}>{selectedProduct.color || 'belirsiz'}</Text>
                  </View>
                  {selectedProduct.pattern && (
                    <View style={styles.modalDetailRow}>
                      <Text style={styles.modalDetailLabel}>Desen</Text>
                      <Text style={styles.modalDetailValue}>{selectedProduct.pattern}</Text>
                    </View>
                  )}
                  {selectedProduct.season && (
                    <View style={styles.modalDetailRow}>
                      <Text style={styles.modalDetailLabel}>Mevsim</Text>
                      <Text style={styles.modalDetailValue}>{selectedProduct.season}</Text>
                    </View>
                  )}
                </View>
                
                <View style={styles.modalActions}>
                  <TouchableOpacity 
                    style={[styles.modalActionButton, styles.favoriteAction]}
                    onPress={() => {
                      toggleFavorite(selectedProduct.id);
                      setModalVisible(false);
                    }}
                  >
                    <Ionicons 
                      name={selectedProduct.isFavorite ? "heart" : "heart-outline"} 
                      size={18} 
                      color={selectedProduct.isFavorite ? COLORS.error : COLORS.charcoal} 
                    />
                    <Text style={styles.modalActionText}>
                      {selectedProduct.isFavorite ? 'Favorilerden Çıkar' : 'Favorilere Ekle'}
                    </Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[styles.modalActionButton, styles.cartAction]}
                    onPress={() => {
                      addToCart(selectedProduct);
                      setModalVisible(false);
                    }}
                  >
                    <Ionicons name="bag-outline" size={18} color={COLORS.pureWhite} />
                    <Text style={styles.cartActionText}>Sepete Ekle</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </>
          )}
        </View>
      </View>
    </Modal>
  );

  // Yükleniyor ekranı
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Appbar.Header style={styles.appbar}>
          <Appbar.Content title="KOLEKSİYONUM" titleStyle={styles.appbarTitle} />
        </Appbar.Header>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={COLORS.charcoal} />
          <Text style={styles.loadingText}>Yükleniyor...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.pureWhite} />
      
      <Appbar.Header style={styles.appbar}>
        <Appbar.Content title="KOLEKSİYONUM" titleStyle={styles.appbarTitle} />
        <Appbar.Action icon="refresh" color={COLORS.charcoal} onPress={onRefresh} />
      </Appbar.Header>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            colors={[COLORS.charcoal]}
            tintColor={COLORS.charcoal}
          />
        }
      >
        <StatsCards />

        <View style={styles.tabContainer}>
          {[
            { id: 'gardrob', label: 'GARDROB', icon: 'grid-outline' },
            { id: 'favoriler', label: 'FAVORİLER', icon: 'heart-outline' },
            { id: 'kombinler', label: 'KOMBİNLER', icon: 'shirt-outline' }
          ].map((tab) => (
            <TouchableOpacity
              key={tab.id}
              style={[styles.tab, activeTab === tab.id && styles.activeTab]}
              onPress={() => setActiveTab(tab.id)}
            >
              <Ionicons 
                name={tab.icon} 
                size={16} 
                color={activeTab === tab.id ? COLORS.charcoal : COLORS.silver} 
              />
              <Text style={[styles.tabText, activeTab === tab.id && styles.activeTabText]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {activeTab === 'kombinler' ? (
          <CombinationsTab />
        ) : (
          <FlatList
            data={filteredProducts}
            renderItem={({ item }) => <ProductCard item={item} />}
            keyExtractor={(item) => item.id.toString()}
            numColumns={2}
            columnWrapperStyle={styles.columnWrapper}
            contentContainerStyle={styles.productsGrid}
            scrollEnabled={false}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <View style={styles.emptyIconCircle}>
                  <Ionicons name={activeTab === 'favoriler' ? "heart-outline" : "grid-outline"} size={40} color={COLORS.silver} />
                </View>
                <Text style={styles.emptyTitle}>
                  {activeTab === 'favoriler' ? 'Favori Ürün Yok' : 'Henüz Ürün Yok'}
                </Text>
                <Text style={styles.emptyText}>
                  {activeTab === 'favoriler' 
                    ? 'Beğendiğin ürünleri favorilerine ekle' 
                    : 'Yeni kıyafetler ekleyerek koleksiyonunu oluştur'}
                </Text>
                {activeTab === 'gardrob' && (
                  <Button 
                    mode="outline" 
                    onPress={() => navigation.navigate('AddItem')}
                    style={styles.addButton}
                    labelStyle={styles.addButtonLabel}
                  >
                    İlk Kıyafeti Ekle
                  </Button>
                )}
              </View>
            }
          />
        )}
      </ScrollView>

      {activeTab !== 'kombinler' && (
        <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate('AddItem')}>
          <Ionicons name="add" size={28} color={COLORS.pureWhite} />
        </TouchableOpacity>
      )}

      <ProductDetailModal />
    </SafeAreaView>
  );
};

// 🎨 STYLESHEET (aynı kalacak)
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.offWhite,
  },
  appbar: {
    backgroundColor: COLORS.pureWhite,
    elevation: 0,
    shadowOpacity: 0,
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.lightGray,
  },
  appbarTitle: {
    color: COLORS.charcoal,
    fontWeight: '400',
    fontSize: 16,
    letterSpacing: 2,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: COLORS.midGray,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.pureWhite,
    margin: 16,
    padding: 20,
    borderRadius: 16,
    borderWidth: 0.5,
    borderColor: COLORS.lightGray,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 22,
    fontWeight: '500',
    color: COLORS.charcoal,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '500',
    color: COLORS.silver,
    marginTop: 6,
    letterSpacing: 1,
  },
  statDivider: {
    width: 1,
    height: 35,
    backgroundColor: COLORS.lightGray,
  },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: COLORS.pureWhite,
    borderRadius: 12,
    padding: 4,
    borderWidth: 0.5,
    borderColor: COLORS.lightGray,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  activeTab: {
    backgroundColor: COLORS.offWhite,
  },
  tabText: {
    fontSize: 11,
    fontWeight: '500',
    color: COLORS.silver,
    letterSpacing: 0.5,
  },
  activeTabText: {
    color: COLORS.charcoal,
  },
  productsGrid: {
    paddingHorizontal: 12,
    paddingBottom: 80,
  },
  columnWrapper: {
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  productCard: {
    width: (width - 40) / 2,
    backgroundColor: COLORS.pureWhite,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 0.5,
    borderColor: COLORS.lightGray,
  },
  productImageContainer: {
    position: 'relative',
    height: 200,
    backgroundColor: COLORS.offWhite,
  },
  productImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.offWhite,
  },
  favoriteButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: 20,
    padding: 6,
  },
  productInfo: {
    padding: 12,
  },
  productBrand: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.silver,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  productName: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.charcoal,
    marginVertical: 4,
    lineHeight: 18,
  },
  productColor: {
    fontSize: 11,
    color: COLORS.midGray,
    marginBottom: 8,
  },
  productFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  categoryChip: {
    height: 24,
    backgroundColor: COLORS.offWhite,
    borderWidth: 0.5,
    borderColor: COLORS.lightGray,
  },
  categoryChipText: {
    fontSize: 10,
    fontWeight: '500',
    color: COLORS.midGray,
  },
  combinationsContainer: {
    padding: 20,
    minHeight: 400,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 50,
  },
  emptyIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.pureWhite,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 0.5,
    borderColor: COLORS.lightGray,
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '500',
    color: COLORS.charcoal,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 13,
    color: COLORS.midGray,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  createButton: {
    borderColor: COLORS.charcoal,
    borderRadius: 8,
    paddingHorizontal: 20,
  },
  createButtonLabel: {
    color: COLORS.charcoal,
    fontSize: 13,
  },
  addButton: {
    borderColor: COLORS.charcoal,
    borderRadius: 8,
    paddingHorizontal: 20,
  },
  addButtonLabel: {
    color: COLORS.charcoal,
    fontSize: 13,
  },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: COLORS.charcoal,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: COLORS.pureBlack,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: COLORS.pureWhite,
    borderRadius: 20,
    width: width - 40,
    maxHeight: height * 0.85,
    overflow: 'hidden',
  },
  modalImageContainer: {
    position: 'relative',
    height: 280,
    backgroundColor: COLORS.offWhite,
  },
  modalImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  modalPlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalClose: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalContent: {
    padding: 20,
  },
  modalBrand: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.silver,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  modalName: {
    fontSize: 22,
    fontWeight: '400',
    color: COLORS.charcoal,
    marginVertical: 8,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.lightGray,
    marginVertical: 16,
  },
  modalDetails: {
    marginBottom: 20,
  },
  modalDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  modalDetailLabel: {
    fontSize: 13,
    color: COLORS.silver,
  },
  modalDetailValue: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.charcoal,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  modalActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderRadius: 10,
    gap: 8,
  },
  favoriteAction: {
    backgroundColor: COLORS.offWhite,
    borderWidth: 0.5,
    borderColor: COLORS.lightGray,
  },
  modalActionText: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.charcoal,
  },
  cartAction: {
    backgroundColor: COLORS.charcoal,
  },
  cartActionText: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.pureWhite,
  },
});

export default KoleksiyonumScreen;