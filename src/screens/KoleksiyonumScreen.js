// 📁 src/screens/KoleksiyonumScreen.js - REVİZE (NaN Hatası Düzeltildi)
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  Image,
  FlatList,
  Alert,
  Modal,
  TextInput,
  Dimensions,
  ActivityIndicator,
  RefreshControl,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { COLORS, TYPOGRAPHY, SIZES, SHADOWS } from '../constants/Theme';

const { width, height } = Dimensions.get('window');

// 📦 KATEGORİLER
const CATEGORIES = [
  { id: 'all', name: 'TÜMÜ', icon: 'grid-outline' },
  { id: 'üst', name: 'ÜST', icon: 'shirt-outline' },
  { id: 'alt', name: 'ALT', icon: 'walk-outline' },
  { id: 'ayakkabı', name: 'AYAKKABI', icon: 'footsteps-outline' },
  { id: 'aksesuar', name: 'AKSESUAR', icon: 'watch-outline' },
  { id: 'dış', name: 'DIŞ', icon: 'umbrella-outline' },
];

// 📏 BEDEN SEÇENEKLERİ
const SIZE_OPTIONS = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

// 📊 SIRALAMA SEÇENEKLERİ
const SORT_OPTIONS = [
  { id: 'date_desc', name: 'EN YENİ', icon: 'time-outline' },
  { id: 'date_asc', name: 'EN ESKİ', icon: 'time-outline' },
  { id: 'price_asc', name: 'FİYAT (ARTAN)', icon: 'arrow-up-outline' },
  { id: 'price_desc', name: 'FİYAT (AZALAN)', icon: 'arrow-down-outline' },
  { id: 'name_asc', name: 'İSİM (A-Z)', icon: 'text-outline' },
];

// ============ ÜRÜN EKLEME MODALI ============
const AddProductModal = ({ visible, onClose, onAdd }) => {
  const [name, setName] = useState('');
  const [brand, setBrand] = useState('');
  const [category, setCategory] = useState('üst');
  const [size, setSize] = useState('M');
  const [price, setPrice] = useState('');
  const [image, setImage] = useState('');
  const [uploading, setUploading] = useState(false);

  const pickImage = async (source) => {
    try {
      let result;
      if (source === 'camera') {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Hata', 'Kamera izni gerekli!');
          return;
        }
        result = await ImagePicker.launchCameraAsync({
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.8,
        });
      } else {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Hata', 'Galeri izni gerekli!');
          return;
        }
        result = await ImagePicker.launchImageLibraryAsync({
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.8,
        });
      }
      
      if (!result.canceled) {
        setUploading(true);
        const manipulated = await ImageManipulator.manipulateAsync(
          result.assets[0].uri,
          [{ resize: { width: 500, height: 500 } }],
          { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
        );
        setImage(manipulated.uri);
        setUploading(false);
      }
    } catch (error) {
      console.error('Fotoğraf seçme hatası:', error);
      setUploading(false);
      Alert.alert('Hata', 'Fotoğraf seçilemedi');
    }
  };

  const handleAdd = () => {
    if (!name.trim()) {
      Alert.alert('Hata', 'Ürün adı giriniz!');
      return;
    }
    if (!brand.trim()) {
      Alert.alert('Hata', 'Marka giriniz!');
      return;
    }
    if (!price.trim()) {
      Alert.alert('Hata', 'Fiyat giriniz!');
      return;
    }

    const newProduct = {
      id: Date.now().toString(),
      name: name.trim(),
      brand: brand.trim(),
      category,
      size,
      price: parseFloat(price.replace(/\./g, '')) || 0,
      image: image || 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=200',
      createdAt: new Date().toISOString(),
    };

    onAdd(newProduct);
    setName('');
    setBrand('');
    setPrice('');
    setCategory('üst');
    setSize('M');
    setImage('');
    onClose();
    Alert.alert('Başarılı', 'Ürün eklendi!');
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, SHADOWS.heavy]}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>YENİ ÜRÜN EKLE</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={COLORS.charcoal} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.imagePickerContainer}>
              <TouchableOpacity 
                style={styles.imagePickerButton} 
                onPress={() => Alert.alert(
                  'Fotoğraf Ekle',
                  'Fotoğrafı nereden eklemek istersiniz?',
                  [
                    { text: '📷 Kamera', onPress: () => pickImage('camera') },
                    { text: '🖼️ Galeri', onPress: () => pickImage('gallery') },
                    { text: 'İptal', style: 'cancel' }
                  ]
                )}
              >
                {image ? (
                  <Image source={{ uri: image }} style={styles.imagePreview} />
                ) : (
                  <View style={styles.imagePlaceholder}>
                    <Ionicons name="camera-outline" size={40} color={COLORS.silver} />
                    <Text style={styles.imagePlaceholderText}>FOTOĞRAF EKLE</Text>
                    <Text style={styles.imagePlaceholderSubtext}>Kamera veya Galeri</Text>
                  </View>
                )}
                {uploading && (
                  <View style={styles.uploadingOverlay}>
                    <ActivityIndicator size="large" color={COLORS.white} />
                  </View>
                )}
              </TouchableOpacity>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>ÜRÜN ADI</Text>
              <TextInput
                style={styles.input}
                placeholder="Ör: Oversize Blazer"
                placeholderTextColor={COLORS.silver}
                value={name}
                onChangeText={setName}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>MARKA</Text>
              <TextInput
                style={styles.input}
                placeholder="Ör: ZARA, Nike, Mango"
                placeholderTextColor={COLORS.silver}
                value={brand}
                onChangeText={setBrand}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>KATEGORİ</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {CATEGORIES.filter(c => c.id !== 'all').map((cat) => (
                  <TouchableOpacity
                    key={cat.id}
                    style={[styles.categorySelect, category === cat.id && styles.categorySelectActive]}
                    onPress={() => setCategory(cat.id)}
                  >
                    <Ionicons name={cat.icon} size={14} color={category === cat.id ? COLORS.white : COLORS.charcoal} />
                    <Text style={[styles.categorySelectText, category === cat.id && styles.categorySelectTextActive]}>
                      {cat.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>BEDEN</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {SIZE_OPTIONS.map((s) => (
                  <TouchableOpacity
                    key={s}
                    style={[styles.sizeSelect, size === s && styles.sizeSelectActive]}
                    onPress={() => setSize(s)}
                  >
                    <Text style={[styles.sizeSelectText, size === s && styles.sizeSelectTextActive]}>
                      {s}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>FİYAT (₺)</Text>
              <TextInput
                style={styles.input}
                placeholder="Ör: 799"
                placeholderTextColor={COLORS.silver}
                value={price}
                onChangeText={setPrice}
                keyboardType="numeric"
              />
            </View>

            <TouchableOpacity style={styles.addButton} onPress={handleAdd}>
              <Text style={styles.addButtonText}>ÜRÜNÜ EKLE</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

// ============ ÜRÜN DÜZENLEME MODALI ============
const EditProductModal = ({ visible, product, onClose, onSave }) => {
  const [name, setName] = useState(product?.name || '');
  const [brand, setBrand] = useState(product?.brand || '');
  const [category, setCategory] = useState(product?.category || 'üst');
  const [size, setSize] = useState(product?.size || 'M');
  const [price, setPrice] = useState(product?.price?.toString() || '');
  const [image, setImage] = useState(product?.image || '');

  useEffect(() => {
    if (product) {
      setName(product.name || '');
      setBrand(product.brand || '');
      setCategory(product.category || 'üst');
      setSize(product.size || 'M');
      setPrice(product.price?.toString() || '');
      setImage(product.image || '');
    }
  }, [product]);

  const handleSave = () => {
    if (!name.trim()) {
      Alert.alert('Hata', 'Ürün adı giriniz!');
      return;
    }
    if (!price.trim()) {
      Alert.alert('Hata', 'Fiyat giriniz!');
      return;
    }

    onSave({
      ...product,
      name: name.trim(),
      brand: brand.trim(),
      category,
      size,
      price: parseFloat(price) || 0,
      image: image || product?.image,
    });
    onClose();
    Alert.alert('Başarılı', 'Ürün güncellendi!');
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, SHADOWS.heavy]}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>ÜRÜN DÜZENLE</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={COLORS.charcoal} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>ÜRÜN ADI</Text>
              <TextInput style={styles.input} value={name} onChangeText={setName} />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>MARKA</Text>
              <TextInput style={styles.input} value={brand} onChangeText={setBrand} placeholder="Marka adı" />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>KATEGORİ</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {CATEGORIES.filter(c => c.id !== 'all').map((cat) => (
                  <TouchableOpacity
                    key={cat.id}
                    style={[styles.categorySelect, category === cat.id && styles.categorySelectActive]}
                    onPress={() => setCategory(cat.id)}
                  >
                    <Ionicons name={cat.icon} size={14} color={category === cat.id ? COLORS.white : COLORS.charcoal} />
                    <Text style={[styles.categorySelectText, category === cat.id && styles.categorySelectTextActive]}>
                      {cat.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>BEDEN</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {SIZE_OPTIONS.map((s) => (
                  <TouchableOpacity
                    key={s}
                    style={[styles.sizeSelect, size === s && styles.sizeSelectActive]}
                    onPress={() => setSize(s)}
                  >
                    <Text style={[styles.sizeSelectText, size === s && styles.sizeSelectTextActive]}>
                      {s}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>FİYAT (₺)</Text>
              <TextInput style={styles.input} value={price} onChangeText={setPrice} keyboardType="numeric" />
            </View>

            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.saveButtonText}>KAYDET</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

// ============ ÜRÜN KARTI ============
const ProductCard = ({ item, onPress }) => {
  const formatPrice = (price) => {
    if (!price && price !== 0) return '0';
    return Math.round(price).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

  return (
    <TouchableOpacity style={[styles.productCard, SHADOWS.light]} onPress={() => onPress(item)} activeOpacity={0.9}>
      <Image source={{ uri: item.image }} style={styles.productImage} />
      <View style={styles.productInfo}>
        <Text style={styles.productName} numberOfLines={1}>{item.name || 'İsimsiz'}</Text>
        {item.brand && <Text style={styles.productBrand} numberOfLines={1}>{item.brand}</Text>}
        <View style={styles.productBottom}>
          <Text style={styles.productPrice}>₺{formatPrice(item.price)}</Text>
          {item.size && (
            <View style={styles.productSizeBadge}>
              <Text style={styles.productSizeText}>{item.size}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

// ============ ÜRÜN DETAY MODALI ============
const ProductDetailModal = ({ visible, product, onClose, onDelete, onEdit }) => {
  if (!product) return null;

  const formatPrice = (price) => {
    if (!price && price !== 0) return '0';
    return Math.round(price).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={[styles.detailModalContent, SHADOWS.heavy]}>
          <Image source={{ uri: product.image }} style={styles.detailImage} />
          <TouchableOpacity style={styles.detailCloseButton} onPress={onClose}>
            <Ionicons name="close" size={24} color={COLORS.white} />
          </TouchableOpacity>

          <View style={styles.detailInfo}>
            <Text style={styles.detailName}>{product.name || 'İsimsiz'}</Text>
            {product.brand && (
              <Text style={styles.detailBrand}>{product.brand}</Text>
            )}
            <View style={styles.detailMeta}>
              <View style={styles.detailCategory}>
                <Ionicons name="pricetag-outline" size={14} color={COLORS.cognac} />
                <Text style={styles.detailCategoryText}>
                  {CATEGORIES.find(c => c.id === product.category)?.name || product.category || 'Kategori yok'}
                </Text>
              </View>
              {product.size && (
                <View style={styles.detailSize}>
                  <Ionicons name="resize-outline" size={14} color={COLORS.cognac} />
                  <Text style={styles.detailSizeText}>BEDEN: {product.size}</Text>
                </View>
              )}
            </View>
            <Text style={styles.detailPrice}>₺{formatPrice(product.price)}</Text>
            <Text style={styles.detailDate}>Eklendi: {product.createdAt ? new Date(product.createdAt).toLocaleDateString('tr-TR') : 'Bugün'}</Text>

            <View style={styles.detailActions}>
              <TouchableOpacity style={styles.editButton} onPress={() => { onClose(); onEdit(product); }}>
                <Ionicons name="create-outline" size={16} color={COLORS.white} />
                <Text style={styles.editButtonText}>DÜZENLE</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.deleteButton} onPress={() => {
                Alert.alert(
                  'Ürünü Sil',
                  `${product.name || 'Bu ürün'} silmek istediğinize emin misiniz?`,
                  [
                    { text: 'İptal', style: 'cancel' },
                    { text: 'Sil', onPress: () => onDelete(product.id), style: 'destructive' }
                  ]
                );
              }}>
                <Ionicons name="trash-outline" size={16} color={COLORS.white} />
                <Text style={styles.deleteButtonText}>SİL</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

// ============ SIRALAMA MODALI ============
const SortModal = ({ visible, onClose, selectedSort, onSelect }) => (
  <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
    <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={onClose}>
      <View style={[styles.sortModalContainer, SHADOWS.medium]}>
        <View style={styles.sortModalHeader}>
          <Text style={styles.sortModalTitle}>SIRALAMA</Text>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={24} color={COLORS.charcoal} />
          </TouchableOpacity>
        </View>
        {SORT_OPTIONS.map((option) => (
          <TouchableOpacity
            key={option.id}
            style={[styles.sortOption, selectedSort === option.id && styles.sortOptionActive]}
            onPress={() => onSelect(option.id)}
          >
            <Ionicons 
              name={option.icon} 
              size={18} 
              color={selectedSort === option.id ? COLORS.cognac : COLORS.silver} 
            />
            <Text style={[styles.sortOptionText, selectedSort === option.id && styles.sortOptionTextActive]}>
              {option.name}
            </Text>
            {selectedSort === option.id && (
              <Ionicons name="checkmark" size={16} color={COLORS.cognac} />
            )}
          </TouchableOpacity>
        ))}
      </View>
    </TouchableOpacity>
  </Modal>
);

// ============ ANA BİLEŞEN ============
const KoleksiyonumScreen = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSort, setSelectedSort] = useState('date_desc');
  const [sortModalVisible, setSortModalVisible] = useState(false);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const saved = await AsyncStorage.getItem('@user_products');
      if (saved) {
        const parsed = JSON.parse(saved);
        // ✅ Her ürünün fiyatını sayıya çevir
        const fixed = parsed.map(p => ({
          ...p,
          price: typeof p.price === 'string' ? parseFloat(p.price) || 0 : p.price || 0
        }));
        setProducts(fixed);
      } else {
        const sampleProducts = [
          {
            id: '1',
            name: 'Oversize Blazer',
            brand: 'ZARA',
            category: 'üst',
            size: 'L',
            price: 799,
            image: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=200',
            createdAt: new Date().toISOString(),
          },
          {
            id: '2',
            name: 'Air Force 1',
            brand: 'Nike',
            category: 'ayakkabı',
            size: '42',
            price: 899,
            image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200',
            createdAt: new Date().toISOString(),
          },
        ];
        setProducts(sampleProducts);
        await AsyncStorage.setItem('@user_products', JSON.stringify(sampleProducts));
      }
    } catch (error) {
      console.error('Veri yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveProducts = async (newProducts) => {
    try {
      await AsyncStorage.setItem('@user_products', JSON.stringify(newProducts));
      setProducts(newProducts);
    } catch (error) {
      console.error('Veri kaydedilirken hata:', error);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadProducts();
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  const getFilteredAndSortedProducts = () => {
    let filtered = [...products];
    
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(p => p.category === selectedCategory);
    }
    
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(p => 
        p.name?.toLowerCase().includes(query) ||
        p.brand?.toLowerCase().includes(query)
      );
    }
    
    switch (selectedSort) {
      case 'price_asc':
        filtered.sort((a, b) => (a.price || 0) - (b.price || 0));
        break;
      case 'price_desc':
        filtered.sort((a, b) => (b.price || 0) - (a.price || 0));
        break;
      case 'name_asc':
        filtered.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
        break;
      case 'date_asc':
        filtered.sort((a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0));
        break;
      default:
        filtered.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
        break;
    }
    
    return filtered;
  };

  const addProduct = (product) => {
    const newProducts = [product, ...products];
    saveProducts(newProducts);
  };

  const updateProduct = (updatedProduct) => {
    const newProducts = products.map(p => 
      p.id === updatedProduct.id ? updatedProduct : p
    );
    saveProducts(newProducts);
  };

  const deleteProduct = (productId) => {
    const newProducts = products.filter(p => p.id !== productId);
    saveProducts(newProducts);
    setDetailModalVisible(false);
    setSelectedProduct(null);
    Alert.alert('Başarılı', 'Ürün silindi!');
  };

  const handleProductPress = (product) => {
    setSelectedProduct(product);
    setDetailModalVisible(true);
  };

  const handleEditProduct = (product) => {
    setSelectedProduct(product);
    setEditModalVisible(true);
  };

  const filteredProducts = getFilteredAndSortedProducts();
  
  // ✅ NaN ve undefined koruması
  const totalValue = products.reduce((sum, p) => sum + (typeof p.price === 'number' ? p.price : 0), 0);
  
  const formatTotalValue = (value) => {
    if (!value && value !== 0) return '0';
    return Math.round(value).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

  const activeCategories = [
    { id: 'all', name: 'TÜMÜ', icon: 'grid-outline', count: products.length },
    ...CATEGORIES.filter(c => c.id !== 'all').map(category => ({
      ...category,
      count: products.filter(p => p.category === category.id).length
    })).filter(c => c.count > 0)
  ];

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.cognac} />
          <Text style={styles.loadingText}>YÜKLENİYOR...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />

      <View style={styles.header}>
        <Text style={styles.logo}>KOLEKSİYONUM</Text>
        <TouchableOpacity style={styles.addButtonHeader} onPress={() => setAddModalVisible(true)}>
          <Ionicons name="add" size={24} color={COLORS.white} />
        </TouchableOpacity>
      </View>

      <View style={styles.statsCard}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{products.length}</Text>
          <Text style={styles.statLabel}>ÜRÜN</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>₺{formatTotalValue(totalValue)}</Text>
          <Text style={styles.statLabel}>TOPLAM DEĞER</Text>
        </View>
      </View>

      <View style={styles.categoryStatsWrapper}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.categoryStatsContainer}
        >
          {activeCategories.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={[styles.categoryStatItem, selectedCategory === category.id && styles.categoryStatItemActive]}
              onPress={() => setSelectedCategory(category.id)}
            >
              <Ionicons 
                name={category.icon} 
                size={14} 
                color={selectedCategory === category.id ? COLORS.white : COLORS.charcoal} 
              />
              <Text style={[styles.categoryStatText, selectedCategory === category.id && styles.categoryStatTextActive]}>
                {category.name} ({category.count})
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={styles.actionBar}>
        <View style={styles.searchContainer}>
          <Ionicons name="search-outline" size={18} color={COLORS.silver} />
          <TextInput
            style={styles.searchInput}
            placeholder="Ürün veya marka ara..."
            placeholderTextColor={COLORS.silver}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={16} color={COLORS.silver} />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity style={styles.sortButton} onPress={() => setSortModalVisible(true)}>
          <Ionicons name="funnel-outline" size={16} color={COLORS.charcoal} />
          <Text style={styles.sortButtonText}>SIRALA</Text>
        </TouchableOpacity>
      </View>

      {filteredProducts.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconContainer}>
            <Ionicons name="albums-outline" size={48} color={COLORS.silver} />
          </View>
          <Text style={styles.emptyTitle}>
            {searchQuery ? 'ÜRÜN BULUNAMADI' : 'HENÜZ ÜRÜN EKLENMEMİŞ'}
          </Text>
          <Text style={styles.emptyText}>
            {searchQuery 
              ? `"${searchQuery}" ile eşleşen ürün yok`
              : 'Gardırobuna ilk ürünü eklemek için + butonuna tıkla'}
          </Text>
          {searchQuery ? (
            <TouchableOpacity style={styles.clearButton} onPress={() => setSearchQuery('')}>
              <Text style={styles.clearButtonText}>ARAMAYI TEMİZLE</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.emptyButton} onPress={() => setAddModalVisible(true)}>
              <Text style={styles.emptyButtonText}>ÜRÜN EKLE</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <FlatList
          data={filteredProducts}
          renderItem={({ item }) => <ProductCard item={item} onPress={handleProductPress} />}
          keyExtractor={item => item.id}
          numColumns={2}
          columnWrapperStyle={styles.columnWrapper}
          contentContainerStyle={styles.productsList}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.cognac]} />
          }
        />
      )}

      <AddProductModal
        visible={addModalVisible}
        onClose={() => setAddModalVisible(false)}
        onAdd={addProduct}
      />

      <EditProductModal
        visible={editModalVisible}
        product={selectedProduct}
        onClose={() => {
          setEditModalVisible(false);
          setSelectedProduct(null);
        }}
        onSave={updateProduct}
      />

      <ProductDetailModal
        visible={detailModalVisible}
        product={selectedProduct}
        onClose={() => {
          setDetailModalVisible(false);
          setSelectedProduct(null);
        }}
        onDelete={deleteProduct}
        onEdit={(product) => {
          setDetailModalVisible(false);
          handleEditProduct(product);
        }}
      />

      <SortModal
        visible={sortModalVisible}
        onClose={() => setSortModalVisible(false)}
        selectedSort={selectedSort}
        onSelect={(sort) => {
          setSelectedSort(sort);
          setSortModalVisible(false);
        }}
      />
    </SafeAreaView>
  );
};

// ============ STILLER ============
const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: COLORS.white 
  },
  loadingContainer: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    gap: SIZES.md 
  },
  loadingText: { 
    ...TYPOGRAPHY.caption,
    color: COLORS.silver 
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SIZES.lg,
    paddingTop: Platform.OS === 'ios' ? 12 : SIZES.md,
    paddingBottom: SIZES.xs,
  },
  logo: { 
    ...TYPOGRAPHY.caption,
    fontSize: 14,
    letterSpacing: 2,
    color: COLORS.charcoal 
  },
  addButtonHeader: {
    backgroundColor: COLORS.charcoal,
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },

  statsCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.charcoal,
    marginHorizontal: SIZES.lg,
    marginVertical: SIZES.md,
    padding: SIZES.md,
    justifyContent: 'space-around',
  },
  statItem: { 
    alignItems: 'center', 
    flex: 1 
  },
  statNumber: { 
    ...TYPOGRAPHY.body,
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.white 
  },
  statLabel: { 
    ...TYPOGRAPHY.caption,
    fontSize: 8,
    color: COLORS.silver, 
    marginTop: 2 
  },
  statDivider: { 
    width: 0.5, 
    backgroundColor: COLORS.graphite 
  },

  categoryStatsWrapper: { 
    marginBottom: SIZES.md 
  },
  categoryStatsContainer: { 
    flexGrow: 0, 
    paddingHorizontal: SIZES.lg 
  },
  categoryStatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.porcelain,
    paddingHorizontal: SIZES.md,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: SIZES.sm,
    gap: 4,
  },
  categoryStatItemActive: { 
    backgroundColor: COLORS.charcoal 
  },
  categoryStatText: { 
    ...TYPOGRAPHY.caption,
    fontSize: 9,
    color: COLORS.silver 
  },
  categoryStatTextActive: { 
    color: COLORS.white 
  },

  actionBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SIZES.lg,
    marginBottom: SIZES.md,
    gap: SIZES.sm,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.porcelain,
    paddingHorizontal: SIZES.md,
    paddingVertical: SIZES.sm,
    gap: SIZES.xs,
  },
  searchInput: { 
    flex: 1, 
    ...TYPOGRAPHY.body,
    fontSize: 13,
    color: COLORS.charcoal, 
    padding: 0 
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    paddingHorizontal: SIZES.md,
    paddingVertical: SIZES.sm,
    borderWidth: 0.5,
    borderColor: COLORS.cloud,
    gap: 4,
  },
  sortButtonText: { 
    ...TYPOGRAPHY.caption,
    fontSize: 9,
    color: COLORS.charcoal 
  },

  productsList: { 
    paddingHorizontal: SIZES.lg, 
    paddingBottom: SIZES.xl 
  },
  columnWrapper: { 
    justifyContent: 'space-between', 
    marginBottom: SIZES.md 
  },
  productCard: {
    width: (width - 48) / 2,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 0.5,
    borderColor: COLORS.cloud,
  },
  productImage: { 
    width: '100%', 
    height: 160, 
    backgroundColor: COLORS.porcelain 
  },
  productInfo: { 
    padding: SIZES.sm 
  },
  productName: { 
    ...TYPOGRAPHY.body,
    fontSize: 12,
    fontWeight: '500', 
    color: COLORS.charcoal, 
    marginBottom: 1 
  },
  productBrand: { 
    ...TYPOGRAPHY.caption,
    fontSize: 8,
    color: COLORS.silver, 
    marginBottom: 4 
  },
  productBottom: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center' 
  },
  productPrice: { 
    ...TYPOGRAPHY.body,
    fontSize: 13,
    fontWeight: '600', 
    color: COLORS.cognac 
  },
  productSizeBadge: { 
    backgroundColor: COLORS.porcelain, 
    paddingHorizontal: 6, 
    paddingVertical: 1, 
    borderRadius: 10 
  },
  productSizeText: { 
    ...TYPOGRAPHY.caption,
    fontSize: 8, 
    color: COLORS.silver 
  },

  emptyContainer: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    padding: SIZES.xl 
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderWidth: 0.5,
    borderColor: COLORS.cloud,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SIZES.md,
  },
  emptyTitle: { 
    ...TYPOGRAPHY.caption,
    marginTop: SIZES.sm, 
    marginBottom: 2 
  },
  emptyText: { 
    ...TYPOGRAPHY.bodySmall,
    fontSize: 11,
    textAlign: 'center', 
    marginBottom: SIZES.lg 
  },
  emptyButton: { 
    backgroundColor: COLORS.charcoal, 
    paddingHorizontal: SIZES.xl, 
    paddingVertical: SIZES.sm 
  },
  emptyButtonText: { 
    ...TYPOGRAPHY.button,
    fontSize: 10,
    color: COLORS.white 
  },
  clearButton: { 
    backgroundColor: COLORS.charcoal, 
    paddingHorizontal: SIZES.xl, 
    paddingVertical: SIZES.sm 
  },
  clearButtonText: { 
    ...TYPOGRAPHY.button,
    fontSize: 10,
    color: COLORS.white 
  },

  modalOverlay: { 
    flex: 1, 
    backgroundColor: 'rgba(0,0,0,0.6)', 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: SIZES.lg,
    width: width - 32,
    maxHeight: height * 0.85,
  },
  modalHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: SIZES.md 
  },
  modalTitle: { 
    ...TYPOGRAPHY.caption,
    fontSize: 14,
    color: COLORS.charcoal 
  },

  imagePickerContainer: { 
    alignItems: 'center', 
    marginBottom: SIZES.md 
  },
  imagePickerButton: { 
    width: '100%', 
    height: 160, 
    borderRadius: 12, 
    overflow: 'hidden', 
    backgroundColor: COLORS.porcelain 
  },
  imagePreview: { 
    width: '100%', 
    height: '100%', 
    resizeMode: 'cover' 
  },
  imagePlaceholder: { 
    width: '100%', 
    height: '100%', 
    justifyContent: 'center', 
    alignItems: 'center', 
    gap: 4 
  },
  imagePlaceholderText: { 
    ...TYPOGRAPHY.caption,
    fontSize: 10,
    color: COLORS.silver 
  },
  imagePlaceholderSubtext: { 
    ...TYPOGRAPHY.caption,
    fontSize: 8,
    color: COLORS.silver 
  },
  uploadingOverlay: { 
    position: 'absolute', 
    top: 0, 
    left: 0, 
    right: 0, 
    bottom: 0, 
    backgroundColor: 'rgba(0,0,0,0.5)', 
    justifyContent: 'center', 
    alignItems: 'center' 
  },

  inputGroup: { 
    marginBottom: SIZES.md 
  },
  inputLabel: { 
    ...TYPOGRAPHY.caption,
    fontSize: 9,
    color: COLORS.charcoal, 
    marginBottom: 4 
  },
  input: {
    ...TYPOGRAPHY.body,
    fontSize: 13,
    backgroundColor: COLORS.porcelain,
    paddingHorizontal: SIZES.md,
    paddingVertical: SIZES.sm,
    color: COLORS.charcoal,
  },
  categorySelect: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    paddingHorizontal: SIZES.md,
    paddingVertical: 6,
    borderRadius: 25,
    marginRight: SIZES.xs,
    borderWidth: 0.5,
    borderColor: COLORS.cloud,
    gap: 4,
  },
  categorySelectActive: { 
    backgroundColor: COLORS.charcoal, 
    borderColor: COLORS.charcoal 
  },
  categorySelectText: { 
    ...TYPOGRAPHY.caption,
    fontSize: 9,
    color: COLORS.charcoal 
  },
  categorySelectTextActive: { 
    color: COLORS.white 
  },
  sizeSelect: {
    paddingHorizontal: SIZES.md,
    paddingVertical: 6,
    borderRadius: 25,
    backgroundColor: COLORS.white,
    marginRight: SIZES.xs,
    borderWidth: 0.5,
    borderColor: COLORS.cloud,
  },
  sizeSelectActive: { 
    backgroundColor: COLORS.charcoal, 
    borderColor: COLORS.charcoal 
  },
  sizeSelectText: { 
    ...TYPOGRAPHY.caption,
    fontSize: 9,
    color: COLORS.charcoal 
  },
  sizeSelectTextActive: { 
    color: COLORS.white 
  },
  addButton: { 
    backgroundColor: COLORS.charcoal, 
    paddingVertical: SIZES.md, 
    alignItems: 'center', 
    marginTop: SIZES.sm 
  },
  addButtonText: { 
    ...TYPOGRAPHY.button,
    fontSize: 10,
    color: COLORS.white 
  },
  saveButton: { 
    backgroundColor: COLORS.charcoal, 
    paddingVertical: SIZES.md, 
    alignItems: 'center', 
    marginTop: SIZES.sm 
  },
  saveButtonText: { 
    ...TYPOGRAPHY.button,
    fontSize: 10,
    color: COLORS.white 
  },

  detailModalContent: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    width: width - 32,
    overflow: 'hidden',
  },
  detailImage: { 
    width: '100%', 
    height: 240, 
    backgroundColor: COLORS.porcelain 
  },
  detailCloseButton: { 
    position: 'absolute', 
    top: SIZES.md, 
    right: SIZES.md, 
    backgroundColor: COLORS.charcoal, 
    padding: 6 
  },
  detailInfo: { 
    padding: SIZES.lg 
  },
  detailName: { 
    ...TYPOGRAPHY.title3,
    fontSize: 18,
    color: COLORS.charcoal, 
    marginBottom: 2 
  },
  detailBrand: { 
    ...TYPOGRAPHY.caption,
    fontSize: 10,
    color: COLORS.silver, 
    marginBottom: SIZES.md 
  },
  detailMeta: { 
    flexDirection: 'row', 
    gap: SIZES.md, 
    marginBottom: SIZES.md 
  },
  detailCategory: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 4 
  },
  detailCategoryText: { 
    ...TYPOGRAPHY.caption,
    fontSize: 9,
    color: COLORS.cognac 
  },
  detailSize: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 4 
  },
  detailSizeText: { 
    ...TYPOGRAPHY.caption,
    fontSize: 9,
    color: COLORS.cognac 
  },
  detailPrice: { 
    ...TYPOGRAPHY.title2,
    fontSize: 22,
    color: COLORS.cognac, 
    marginBottom: 4 
  },
  detailDate: { 
    ...TYPOGRAPHY.caption,
    fontSize: 8,
    color: COLORS.silver, 
    marginBottom: SIZES.lg 
  },
  detailActions: { 
    flexDirection: 'row', 
    justifyContent: 'center', 
    gap: SIZES.md 
  },
  editButton: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: COLORS.cognac, 
    paddingHorizontal: SIZES.xl, 
    paddingVertical: SIZES.sm, 
    gap: 4 
  },
  editButtonText: { 
    ...TYPOGRAPHY.button,
    fontSize: 9,
    color: COLORS.white 
  },
  deleteButton: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: COLORS.error, 
    paddingHorizontal: SIZES.xl, 
    paddingVertical: SIZES.sm, 
    gap: 4 
  },
  deleteButtonText: { 
    ...TYPOGRAPHY.button,
    fontSize: 9,
    color: COLORS.white 
  },

  sortModalContainer: { 
    backgroundColor: COLORS.white, 
    borderRadius: 20, 
    padding: SIZES.lg, 
    width: width - 40 
  },
  sortModalHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: SIZES.md, 
    paddingBottom: SIZES.sm, 
    borderBottomWidth: 0.5, 
    borderBottomColor: COLORS.cloud 
  },
  sortModalTitle: { 
    ...TYPOGRAPHY.caption,
    fontSize: 14,
    color: COLORS.charcoal 
  },
  sortOption: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingVertical: SIZES.md, 
    gap: SIZES.md 
  },
  sortOptionActive: { 
    backgroundColor: COLORS.porcelain, 
    paddingHorizontal: SIZES.sm 
  },
  sortOptionText: { 
    flex: 1, 
    ...TYPOGRAPHY.body,
    fontSize: 12,
    color: COLORS.silver 
  },
  sortOptionTextActive: { 
    color: COLORS.cognac, 
    fontWeight: '500'
  },
});

export default KoleksiyonumScreen;