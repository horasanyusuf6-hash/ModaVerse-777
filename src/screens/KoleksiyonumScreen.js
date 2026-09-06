// 📁 src/screens/KoleksiyonumScreen.js - REVİZE (Premium Kart Eklendi)

import React, { useState, useEffect, useCallback, useContext } from 'react';
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
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { COLORS, TYPOGRAPHY, SIZES, getThemeColors } from '../constants/Theme';
import { LinearGradient } from 'expo-linear-gradient';
import { ThemeContext } from '../../App';

// ============================================================
// 📌 TOAST İMPORTU
// ============================================================
import { showToast } from '../components/CustomAlert';

// ============================================================
// 📌 SERVİS İMPORTLARI
// ============================================================
import imagePoolService from '../services/imagePoolService';
import aiAdvisorService from '../services/aiAdvisorService';

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

// 🆕 RENK SEÇENEKLERİ
const COLOR_OPTIONS = [
  'Siyah', 'Beyaz', 'Kırmızı', 'Mavi', 'Yeşil', 'Sarı', 'Turuncu', 'Mor', 'Pembe',
  'Kahverengi', 'Gri', 'Bej', 'Bordo', 'Hardal', 'Lacivert', 'Krem', 'Haki', 'Gümüş', 'Altın'
];

// 📊 SIRALAMA SEÇENEKLERİ
const SORT_OPTIONS = [
  { id: 'date_desc', name: 'EN YENİ', icon: 'time-outline' },
  { id: 'date_asc', name: 'EN ESKİ', icon: 'time-outline' },
  { id: 'price_asc', name: 'FİYAT (ARTAN)', icon: 'arrow-up-outline' },
  { id: 'price_desc', name: 'FİYAT (AZALAN)', icon: 'arrow-down-outline' },
  { id: 'name_asc', name: 'İSİM (A-Z)', icon: 'text-outline' },
];

// 🆕 FİLTRE SEÇENEKLERİ
const FILTER_OPTIONS = [
  { id: 'all', label: 'TÜMÜ', icon: 'grid-outline' },
  { id: 'starred', label: '⭐ FAVORİ', icon: 'star' },
  { id: 'unstarred', label: '☆ DİĞER', icon: 'star-outline' },
];

// 📌 HAZIR ÜRÜN ŞABLONLARI
const PRODUCT_TEMPLATES = [
  {
    id: 'template_1',
    name: 'Beyaz Basic Tişört',
    brand: 'ModaVerse',
    category: 'üst',
    size: 'M',
    color: 'Beyaz',
    model: 'Basic',
    price: 199,
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=200',
    isTemplate: true,
  },
  {
    id: 'template_2',
    name: 'Siyah Oversize Hoodie',
    brand: 'ModaVerse',
    category: 'üst',
    size: 'L',
    color: 'Siyah',
    model: 'Oversize',
    price: 399,
    image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=200',
    isTemplate: true,
  },
  {
    id: 'template_3',
    name: 'Bej Keten Pantolon',
    brand: 'ModaVerse',
    category: 'alt',
    size: 'M',
    color: 'Bej',
    model: 'Keten',
    price: 499,
    image: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=200',
    isTemplate: true,
  },
  {
    id: 'template_4',
    name: 'Krem Elbise',
    brand: 'ModaVerse',
    category: 'üst',
    size: 'S',
    color: 'Krem',
    model: 'Elbise',
    price: 699,
    image: 'https://images.unsplash.com/photo-1539008835657-9e8e9680c956?w=200',
    isTemplate: true,
  },
  {
    id: 'template_5',
    name: 'Beyaz Sneaker',
    brand: 'ModaVerse',
    category: 'ayakkabı',
    size: '42',
    color: 'Beyaz',
    model: 'Sneaker',
    price: 899,
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200',
    isTemplate: true,
  },
  {
    id: 'template_6',
    name: 'Deri Ceket',
    brand: 'ModaVerse',
    category: 'dış',
    size: 'L',
    color: 'Siyah',
    model: 'Deri',
    price: 1299,
    image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=200',
    isTemplate: true,
  },
];

// ============================================================
// 📌 MARKA FİLTRE MODALI
// ============================================================
const BrandFilterModal = ({ visible, brands, selectedBrand, onSelect, onClose }) => {
  const { theme } = useContext(ThemeContext);
  const isDark = theme === 'dark';
  const colors = getThemeColors(isDark);

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={[styles.filterModalContainer, { backgroundColor: colors.card }]}>
          <View style={[styles.filterModalHeader, { borderBottomColor: colors.border }]}>
            <Text style={[styles.filterModalTitle, { color: colors.text, fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' }]}>MARKA FİLTRELE</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <TouchableOpacity
              style={[styles.filterBrandItem, selectedBrand === null && styles.filterBrandItemActive, { borderBottomColor: colors.border }]}
              onPress={() => onSelect(null)}
            >
              <Text style={[styles.filterBrandText, selectedBrand === null && styles.filterBrandTextActive, { color: colors.text, fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' }]}>
                Tüm Markalar
              </Text>
              {selectedBrand === null && (
                <Ionicons name="checkmark" size={18} color={colors.text} />
              )}
            </TouchableOpacity>

            {brands.map((brand) => (
              <TouchableOpacity
                key={brand}
                style={[styles.filterBrandItem, selectedBrand === brand && styles.filterBrandItemActive, { borderBottomColor: colors.border }]}
                onPress={() => onSelect(brand)}
              >
                <Text style={[styles.filterBrandText, selectedBrand === brand && styles.filterBrandTextActive, { color: colors.text, fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' }]}>
                  {brand}
                </Text>
                {selectedBrand === brand && (
                  <Ionicons name="checkmark" size={18} color={colors.text} />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

// ============================================================
// 📌 ÜRÜN EKLEME MODALI
// ============================================================
const AddProductModal = ({ visible, onClose, onAdd }) => {
  const { theme } = useContext(ThemeContext);
  const isDark = theme === 'dark';
  const colors = getThemeColors(isDark);

  const [name, setName] = useState('');
  const [brand, setBrand] = useState('');
  const [category, setCategory] = useState('üst');
  const [size, setSize] = useState('M');
  const [color, setColor] = useState('Beyaz');
  const [model, setModel] = useState('');
  const [price, setPrice] = useState('');
  const [image, setImage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [showTemplates, setShowTemplates] = useState(true);

  const pickImage = async (source) => {
    try {
      let result;
      if (source === 'camera') {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
          showToast({
            title: 'Hata',
            message: 'Kamera izni gerekli!',
            type: 'error',
            autoClose: true,
            autoCloseDelay: 2000,
          });
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
          showToast({
            title: 'Hata',
            message: 'Galeri izni gerekli!',
            type: 'error',
            autoClose: true,
            autoCloseDelay: 2000,
          });
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
        setShowTemplates(false);
      }
    } catch (error) {
      console.error('Fotoğraf seçme hatası:', error);
      setUploading(false);
      showToast({
        title: 'Hata',
        message: 'Fotoğraf seçilemedi.',
        type: 'error',
        autoClose: true,
        autoCloseDelay: 2000,
      });
    }
  };

  const removeImage = () => {
    setImage(null);
    setShowTemplates(true);
  };

  const handleAdd = async () => {
    if (!name.trim()) {
      showToast({
        title: 'Hata',
        message: 'Ürün adı giriniz!',
        type: 'error',
        autoClose: true,
        autoCloseDelay: 2000,
      });
      return;
    }
    if (!brand.trim()) {
      showToast({
        title: 'Hata',
        message: 'Marka giriniz!',
        type: 'error',
        autoClose: true,
        autoCloseDelay: 2000,
      });
      return;
    }
    if (!price.trim()) {
      showToast({
        title: 'Hata',
        message: 'Fiyat giriniz!',
        type: 'error',
        autoClose: true,
        autoCloseDelay: 2000,
      });
      return;
    }

    const newProduct = {
      id: Date.now().toString(),
      name: name.trim(),
      brand: brand.trim(),
      category,
      size,
      color,
      model: model.trim(),
      price: parseFloat(price.replace(/\./g, '')) || 0,
      image: image || 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=200',
      createdAt: new Date().toISOString(),
      isStar: false,
    };

    try {
      await imagePoolService.addProductToPool({
        name: newProduct.name,
        imageUrl: newProduct.image,
        category: newProduct.category,
        brand: newProduct.brand,
        tags: [newProduct.color, newProduct.model, newProduct.size],
      });
    } catch (error) {
      console.error('Görsel havuzuna ekleme hatası:', error);
    }

    onAdd(newProduct);
    resetForm();
    onClose();
    showToast({
      title: '🎉 Ürün Eklendi',
      message: `${newProduct.name} koleksiyonuna eklendi! Gardırobun büyüyor.`,
      type: 'success',
      autoClose: false,
      showPremium: true,
    });
  };

  const resetForm = () => {
    setName('');
    setBrand('');
    setPrice('');
    setCategory('üst');
    setSize('M');
    setColor('Beyaz');
    setModel('');
    setImage(null);
    setShowTemplates(true);
  };

  const handleTemplateSelect = (template) => {
    setName(template.name);
    setBrand(template.brand);
    setCategory(template.category);
    setSize(template.size);
    setColor(template.color || 'Beyaz');
    setModel(template.model || '');
    setPrice(template.price.toString());
    setImage(template.image);
    setShowTemplates(false);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
          <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
            <Text style={[styles.modalTitle, { color: colors.text, fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' }]}>YENİ ÜRÜN EKLE</Text>
            <TouchableOpacity onPress={() => { resetForm(); onClose(); }}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} style={styles.modalScroll}>
            {showTemplates && (
              <View style={styles.templatesSection}>
                <Text style={[styles.templatesTitle, { color: colors.text, fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' }]}>⭐ HAZIR ÜRÜNLER</Text>
                <Text style={[styles.templatesSubtitle, { color: colors.textSecondary, fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' }]}>Denemek için bir ürün seç, sonra düzenleyebilirsin.</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.templatesScroll}>
                  {PRODUCT_TEMPLATES.map((template) => (
                    <TouchableOpacity
                      key={template.id}
                      style={[styles.templateCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
                      onPress={() => handleTemplateSelect(template)}
                    >
                      <Image source={{ uri: template.image }} style={styles.templateImage} />
                      <Text style={[styles.templateName, { color: colors.text, fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' }]} numberOfLines={1}>{template.name}</Text>
                      <Text style={[styles.templatePrice, { color: colors.text, fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' }]}>₺{template.price}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
                <View style={[styles.templatesDivider, { backgroundColor: colors.border }]} />
              </View>
            )}

            <View style={styles.imagePickerContainer}>
              <TouchableOpacity 
                style={[styles.imagePickerButton, { backgroundColor: colors.surface, borderColor: colors.border }]} 
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
                  <>
                    <Image source={{ uri: image }} style={styles.imagePreview} />
                    <TouchableOpacity style={styles.imageRemoveButton} onPress={removeImage}>
                      <Ionicons name="close" size={16} color={COLORS.white} />
                    </TouchableOpacity>
                  </>
                ) : (
                  <View style={styles.imagePlaceholder}>
                    <Ionicons name="camera-outline" size={40} color={colors.textSecondary} />
                    <Text style={[styles.imagePlaceholderText, { color: colors.textSecondary, fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' }]}>FOTOĞRAF EKLE</Text>
                    <Text style={[styles.imagePlaceholderSubtext, { color: colors.textSecondary, fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' }]}>Kamera veya Galeri</Text>
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
              <Text style={[styles.inputLabel, { color: colors.textSecondary, fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' }]}>ÜRÜN ADI</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text, fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' }]}
                placeholder="Ör: Oversize Blazer"
                placeholderTextColor={colors.textSecondary}
                value={name}
                onChangeText={setName}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.textSecondary, fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' }]}>MARKA</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text, fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' }]}
                placeholder="Ör: ZARA, Nike, Mango"
                placeholderTextColor={colors.textSecondary}
                value={brand}
                onChangeText={setBrand}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.textSecondary, fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' }]}>MODEL</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text, fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' }]}
                placeholder="Ör: Basic, Oversize, Vintage"
                placeholderTextColor={colors.textSecondary}
                value={model}
                onChangeText={setModel}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.textSecondary, fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' }]}>KATEGORİ</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {CATEGORIES.filter(c => c.id !== 'all').map((cat) => (
                  <TouchableOpacity
                    key={cat.id}
                    style={[styles.categorySelect, category === cat.id && styles.categorySelectActive, { backgroundColor: colors.surface, borderColor: colors.border }]}
                    onPress={() => setCategory(cat.id)}
                  >
                    <Ionicons name={cat.icon} size={14} color={category === cat.id ? COLORS.white : colors.text} />
                    <Text style={[styles.categorySelectText, category === cat.id && styles.categorySelectTextActive, { color: category === cat.id ? COLORS.white : colors.text, fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' }]}>
                      {cat.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.textSecondary, fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' }]}>RENK</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {COLOR_OPTIONS.map((c) => (
                  <TouchableOpacity
                    key={c}
                    style={[styles.colorSelect, color === c && styles.colorSelectActive, { backgroundColor: colors.surface, borderColor: colors.border }]}
                    onPress={() => setColor(c)}
                  >
                    <View style={[styles.colorDot, { backgroundColor: c.toLowerCase() === 'beyaz' ? '#f5f5f5' : c.toLowerCase() }]} />
                    <Text style={[styles.colorSelectText, color === c && styles.colorSelectTextActive, { color: color === c ? COLORS.white : colors.text, fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' }]}>
                      {c}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.textSecondary, fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' }]}>BEDEN</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {SIZE_OPTIONS.map((s) => (
                  <TouchableOpacity
                    key={s}
                    style={[styles.sizeSelect, size === s && styles.sizeSelectActive, { backgroundColor: colors.surface, borderColor: colors.border }]}
                    onPress={() => setSize(s)}
                  >
                    <Text style={[styles.sizeSelectText, size === s && styles.sizeSelectTextActive, { color: size === s ? COLORS.white : colors.text, fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' }]}>
                      {s}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.textSecondary, fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' }]}>FİYAT (₺)</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text, fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' }]}
                placeholder="Ör: 799"
                placeholderTextColor={colors.textSecondary}
                value={price}
                onChangeText={setPrice}
                keyboardType="numeric"
              />
            </View>

            <TouchableOpacity style={styles.addButton} onPress={handleAdd}>
              <LinearGradient
                colors={[COLORS.charcoal, COLORS.black]}
                style={styles.addButtonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={[styles.addButtonText, { color: COLORS.white, fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' }]}>ÜRÜNÜ EKLE</Text>
              </LinearGradient>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

// ============================================================
// 📌 ÜRÜN DÜZENLEME MODALI
// ============================================================
const EditProductModal = ({ visible, product, onClose, onSave }) => {
  const { theme } = useContext(ThemeContext);
  const isDark = theme === 'dark';
  const colors = getThemeColors(isDark);

  const [name, setName] = useState(product?.name || '');
  const [brand, setBrand] = useState(product?.brand || '');
  const [category, setCategory] = useState(product?.category || 'üst');
  const [size, setSize] = useState(product?.size || 'M');
  const [color, setColor] = useState(product?.color || 'Beyaz');
  const [model, setModel] = useState(product?.model || '');
  const [price, setPrice] = useState(product?.price?.toString() || '');
  const [image, setImage] = useState(product?.image || '');

  useEffect(() => {
    if (product) {
      setName(product.name || '');
      setBrand(product.brand || '');
      setCategory(product.category || 'üst');
      setSize(product.size || 'M');
      setColor(product.color || 'Beyaz');
      setModel(product.model || '');
      setPrice(product.price?.toString() || '');
      setImage(product.image || '');
    }
  }, [product]);

  const handleSave = () => {
    if (!name.trim()) {
      showToast({
        title: 'Hata',
        message: 'Ürün adı giriniz!',
        type: 'error',
        autoClose: true,
        autoCloseDelay: 2000,
      });
      return;
    }
    if (!price.trim()) {
      showToast({
        title: 'Hata',
        message: 'Fiyat giriniz!',
        type: 'error',
        autoClose: true,
        autoCloseDelay: 2000,
      });
      return;
    }

    onSave({
      ...product,
      name: name.trim(),
      brand: brand.trim(),
      category,
      size,
      color,
      model: model.trim(),
      price: parseFloat(price) || 0,
      image: image || product?.image,
    });
    onClose();
    showToast({
      title: '✏️ Ürün Güncellendi',
      message: `${name} başarıyla güncellendi.`,
      type: 'success',
      autoClose: false,
      showPremium: true,
    });
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
          <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
            <Text style={[styles.modalTitle, { color: colors.text, fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' }]}>ÜRÜN DÜZENLE</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} style={styles.modalScroll}>
            <View style={styles.editImageContainer}>
              <Image source={{ uri: image || 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=200' }} style={[styles.editImage, { borderColor: colors.border }]} />
              <Text style={[styles.editImageLabel, { color: colors.textSecondary, fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' }]}>Mevcut Fotoğraf</Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.textSecondary, fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' }]}>ÜRÜN ADI</Text>
              <TextInput style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text, fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' }]} value={name} onChangeText={setName} />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.textSecondary, fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' }]}>MARKA</Text>
              <TextInput style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text, fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' }]} value={brand} onChangeText={setBrand} placeholder="Marka adı" placeholderTextColor={colors.textSecondary} />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.textSecondary, fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' }]}>MODEL</Text>
              <TextInput style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text, fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' }]} value={model} onChangeText={setModel} placeholder="Model" placeholderTextColor={colors.textSecondary} />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.textSecondary, fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' }]}>KATEGORİ</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {CATEGORIES.filter(c => c.id !== 'all').map((cat) => (
                  <TouchableOpacity
                    key={cat.id}
                    style={[styles.categorySelect, category === cat.id && styles.categorySelectActive, { backgroundColor: colors.surface, borderColor: colors.border }]}
                    onPress={() => setCategory(cat.id)}
                  >
                    <Ionicons name={cat.icon} size={14} color={category === cat.id ? COLORS.white : colors.text} />
                    <Text style={[styles.categorySelectText, category === cat.id && styles.categorySelectTextActive, { color: category === cat.id ? COLORS.white : colors.text, fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' }]}>
                      {cat.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.textSecondary, fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' }]}>RENK</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {COLOR_OPTIONS.map((c) => (
                  <TouchableOpacity
                    key={c}
                    style={[styles.colorSelect, color === c && styles.colorSelectActive, { backgroundColor: colors.surface, borderColor: colors.border }]}
                    onPress={() => setColor(c)}
                  >
                    <View style={[styles.colorDot, { backgroundColor: c.toLowerCase() === 'beyaz' ? '#f5f5f5' : c.toLowerCase() }]} />
                    <Text style={[styles.colorSelectText, color === c && styles.colorSelectTextActive, { color: color === c ? COLORS.white : colors.text, fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' }]}>
                      {c}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.textSecondary, fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' }]}>BEDEN</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {SIZE_OPTIONS.map((s) => (
                  <TouchableOpacity
                    key={s}
                    style={[styles.sizeSelect, size === s && styles.sizeSelectActive, { backgroundColor: colors.surface, borderColor: colors.border }]}
                    onPress={() => setSize(s)}
                  >
                    <Text style={[styles.sizeSelectText, size === s && styles.sizeSelectTextActive, { color: size === s ? COLORS.white : colors.text, fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' }]}>
                      {s}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.textSecondary, fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' }]}>FİYAT (₺)</Text>
              <TextInput style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text, fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' }]} value={price} onChangeText={setPrice} keyboardType="numeric" />
            </View>

            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <LinearGradient
                colors={[COLORS.charcoal, COLORS.black]}
                style={styles.addButtonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={[styles.saveButtonText, { color: COLORS.white, fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' }]}>KAYDET</Text>
              </LinearGradient>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

// ============================================================
// 📌 ÜRÜN KARTI
// ============================================================
const ProductCard = ({ item, onPress, onToggleStar }) => {
  const { theme } = useContext(ThemeContext);
  const isDark = theme === 'dark';
  const colors = getThemeColors(isDark);

  const formatPrice = (price) => {
    if (!price && price !== 0) return '0';
    return Math.round(price).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

  return (
    <TouchableOpacity style={[styles.productCard, { backgroundColor: colors.card, borderColor: colors.border }]} onPress={() => onPress(item)} activeOpacity={0.9}>
      <Image source={{ uri: item.image }} style={[styles.productImage, { backgroundColor: colors.surface }]} />
      <TouchableOpacity 
        style={[styles.starButton, { backgroundColor: isDark ? 'rgba(0,0,0,0.7)' : 'rgba(255,255,255,0.85)' }]} 
        onPress={() => onToggleStar(item.id)}
      >
        <Ionicons 
          name={item.isStar ? 'star' : 'star-outline'} 
          size={16} 
          color={item.isStar ? COLORS.cognac : colors.textSecondary} 
        />
      </TouchableOpacity>
      <View style={styles.productInfo}>
        <Text style={[styles.productName, { color: colors.text, fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' }]} numberOfLines={1}>{item.name || 'İsimsiz'}</Text>
        {item.brand && <Text style={[styles.productBrand, { color: colors.textSecondary, fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' }]} numberOfLines={1}>{item.brand}</Text>}
        {item.color && <Text style={[styles.productColor, { color: colors.textSecondary, fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' }]}>{item.color}</Text>}
        <View style={styles.productBottom}>
          <Text style={[styles.productPrice, { color: colors.text, fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' }]}>₺{formatPrice(item.price)}</Text>
          {item.size && (
            <View style={[styles.productSizeBadge, { backgroundColor: colors.surface }]}>
              <Text style={[styles.productSizeText, { color: colors.textSecondary, fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' }]}>{item.size}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

// ============================================================
// 📌 ÜRÜN DETAY MODALI
// ============================================================
const ProductDetailModal = ({ visible, product, onClose, onDelete, onEdit, onToggleStar }) => {
  const { theme } = useContext(ThemeContext);
  const isDark = theme === 'dark';
  const colors = getThemeColors(isDark);

  if (!product) return null;

  const formatPrice = (price) => {
    if (!price && price !== 0) return '0';
    return Math.round(price).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={[styles.detailModalContent, { backgroundColor: colors.card }]}>
          <Image source={{ uri: product.image }} style={[styles.detailImage, { backgroundColor: colors.surface }]} />
          <TouchableOpacity style={[styles.detailCloseButton, { backgroundColor: colors.text }]} onPress={onClose}>
            <Ionicons name="close" size={24} color={colors.background} />
          </TouchableOpacity>

          <View style={styles.detailInfo}>
            <View style={styles.detailHeaderRow}>
              <Text style={[styles.detailName, { color: colors.text, fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' }]}>{product.name || 'İsimsiz'}</Text>
              <TouchableOpacity onPress={() => onToggleStar(product.id)}>
                <Ionicons 
                  name={product.isStar ? 'star' : 'star-outline'} 
                  size={24} 
                  color={product.isStar ? COLORS.cognac : colors.textSecondary} 
                />
              </TouchableOpacity>
            </View>
            {product.brand && (
              <Text style={[styles.detailBrand, { color: colors.textSecondary, fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' }]}>{product.brand}</Text>
            )}
            <View style={styles.detailMeta}>
              <View style={styles.detailCategory}>
                <Ionicons name="pricetag-outline" size={14} color={COLORS.cognac} />
                <Text style={[styles.detailCategoryText, { color: colors.textSecondary, fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' }]}>
                  {CATEGORIES.find(c => c.id === product.category)?.name || product.category || 'Kategori yok'}
                </Text>
              </View>
              {product.color && (
                <View style={styles.detailColor}>
                  <Ionicons name="color-palette-outline" size={14} color={COLORS.cognac} />
                  <Text style={[styles.detailColorText, { color: colors.textSecondary, fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' }]}>{product.color}</Text>
                </View>
              )}
              {product.size && (
                <View style={styles.detailSize}>
                  <Ionicons name="resize-outline" size={14} color={COLORS.cognac} />
                  <Text style={[styles.detailSizeText, { color: colors.textSecondary, fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' }]}>BEDEN: {product.size}</Text>
                </View>
              )}
              {product.model && (
                <View style={styles.detailModel}>
                  <Ionicons name="cube-outline" size={14} color={COLORS.cognac} />
                  <Text style={[styles.detailModelText, { color: colors.textSecondary, fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' }]}>{product.model}</Text>
                </View>
              )}
            </View>
            <Text style={[styles.detailPrice, { color: colors.text, fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' }]}>₺{formatPrice(product.price)}</Text>
            <Text style={[styles.detailDate, { color: colors.textSecondary, fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' }]}>Eklendi: {product.createdAt ? new Date(product.createdAt).toLocaleDateString('tr-TR') : 'Bugün'}</Text>

            <View style={styles.detailActions}>
              <TouchableOpacity style={[styles.editButton, { backgroundColor: COLORS.cognac }]} onPress={() => { onClose(); onEdit(product); }}>
                <Ionicons name="create-outline" size={16} color={COLORS.white} />
                <Text style={[styles.editButtonText, { color: COLORS.white, fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' }]}>DÜZENLE</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.deleteButton, { backgroundColor: COLORS.error }]} onPress={() => {
                Alert.alert(
                  'Ürünü Sil',
                  `${product.name || 'Bu ürün'} silmek istediğinize emin misiniz?`,
                  [
                    { text: 'İptal', style: 'cancel' },
                    { text: 'Sil', onPress: () => {
                        onDelete(product.id);
                        showToast({
                          title: '🗑️ Ürün Silindi',
                          message: `${product.name} başarıyla silindi.`,
                          type: 'info',
                          autoClose: true,
                          autoCloseDelay: 2000,
                        });
                      }, style: 'destructive' }
                  ]
                );
              }}>
                <Ionicons name="trash-outline" size={16} color={COLORS.white} />
                <Text style={[styles.deleteButtonText, { color: COLORS.white, fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' }]}>SİL</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

// ============================================================
// 📌 SIRALAMA MODALI
// ============================================================
const SortModal = ({ visible, onClose, selectedSort, onSelect }) => {
  const { theme } = useContext(ThemeContext);
  const isDark = theme === 'dark';
  const colors = getThemeColors(isDark);

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={onClose}>
        <View style={[styles.sortModalContainer, { backgroundColor: colors.card }]}>
          <View style={[styles.sortModalHeader, { borderBottomColor: colors.border }]}>
            <Text style={[styles.sortModalTitle, { color: colors.text, fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' }]}>SIRALAMA</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>
          {SORT_OPTIONS.map((option) => (
            <TouchableOpacity
              key={option.id}
              style={[styles.sortOption, selectedSort === option.id && styles.sortOptionActive, { borderBottomColor: colors.border }]}
              onPress={() => onSelect(option.id)}
            >
              <Ionicons 
                name={option.icon} 
                size={18} 
                color={selectedSort === option.id ? COLORS.cognac : colors.textSecondary} 
              />
              <Text style={[styles.sortOptionText, selectedSort === option.id && styles.sortOptionTextActive, { color: selectedSort === option.id ? COLORS.cognac : colors.text, fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' }]}>
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
};

// ============================================================
// 📌 ANA BİLEŞEN
// ============================================================
const KoleksiyonumScreen = () => {
  const { theme } = useContext(ThemeContext);
  const isDark = theme === 'dark';
  const colors = getThemeColors(isDark);

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
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [brandFilterVisible, setBrandFilterVisible] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('all');

  useEffect(() => {
    initializeServices();
    loadProducts();
  }, []);

  const initializeServices = async () => {
    try {
      await imagePoolService.initialize();
    } catch (error) {
      console.error('Görsel havuzu başlatma hatası:', error);
    }
  };

  const loadProducts = async () => {
    try {
      const saved = await AsyncStorage.getItem('@user_products');
      if (saved) {
        const parsed = JSON.parse(saved);
        const fixed = parsed.map(p => ({
          ...p,
          price: typeof p.price === 'string' ? parseFloat(p.price) || 0 : p.price || 0,
          isStar: p.isStar || false,
        }));
        setProducts(fixed);
      } else {
        const sampleProducts = PRODUCT_TEMPLATES.slice(0, 4).map((t, i) => ({
          ...t,
          id: `sample_${i + 1}`,
          createdAt: new Date().toISOString(),
          isTemplate: false,
          isStar: i === 0,
        }));
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
    await initializeServices();
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  const getAllBrands = () => {
    const brands = new Set();
    products.forEach(p => {
      if (p.brand) brands.add(p.brand);
    });
    return Array.from(brands).sort();
  };

  const getFilteredAndSortedProducts = () => {
    let filtered = [...products];
    
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(p => p.category === selectedCategory);
    }
    
    if (selectedBrand) {
      filtered = filtered.filter(p => p.brand === selectedBrand);
    }

    if (selectedFilter === 'starred') {
      filtered = filtered.filter(p => p.isStar === true);
    } else if (selectedFilter === 'unstarred') {
      filtered = filtered.filter(p => p.isStar === false);
    }
    
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(p => 
        p.name?.toLowerCase().includes(query) ||
        p.brand?.toLowerCase().includes(query) ||
        p.color?.toLowerCase().includes(query) ||
        p.model?.toLowerCase().includes(query)
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
  };

  const toggleStar = (productId) => {
    const newProducts = products.map(p => {
      if (p.id === productId) {
        return { ...p, isStar: !p.isStar };
      }
      return p;
    });
    saveProducts(newProducts);
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
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.text} />
          <Text style={[styles.loadingText, { color: colors.textSecondary, fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' }]}>YÜKLENİYOR...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />

      {/* HEADER */}
      <View style={styles.header}>
        <Text style={[styles.logo, { color: colors.text, fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' }]}>KOLEKSİYONUM</Text>
        <TouchableOpacity style={[styles.addButtonHeader, { backgroundColor: colors.text }]} onPress={() => setAddModalVisible(true)}>
          <Ionicons name="add" size={24} color={colors.background} />
        </TouchableOpacity>
      </View>

      {/* STATS CARD */}
      <View style={[styles.statsCard, { backgroundColor: colors.text }]}>
        <TouchableOpacity style={styles.statItem} onPress={() => setSelectedCategory('all')}>
          <Text style={[styles.statNumber, { color: colors.background, fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' }]}>{products.length}</Text>
          <Text style={[styles.statLabel, { color: colors.background, opacity: 0.7, fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' }]}>ÜRÜN</Text>
        </TouchableOpacity>
        <View style={[styles.statDivider, { backgroundColor: colors.background, opacity: 0.2 }]} />
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: colors.background, fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' }]}>₺{formatTotalValue(totalValue)}</Text>
          <Text style={[styles.statLabel, { color: colors.background, opacity: 0.7, fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' }]}>TOPLAM DEĞER</Text>
        </View>
        <View style={[styles.statDivider, { backgroundColor: colors.background, opacity: 0.2 }]} />
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: colors.background, fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' }]}>{products.filter(p => p.isStar).length}</Text>
          <Text style={[styles.statLabel, { color: colors.background, opacity: 0.7, fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' }]}>⭐ FAVORİ</Text>
        </View>
      </View>

      {/* CATEGORY STATS */}
      <View style={styles.categoryStatsWrapper}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryStatsContainer}>
          {activeCategories.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={[styles.categoryStatItem, selectedCategory === category.id && styles.categoryStatItemActive, { backgroundColor: selectedCategory === category.id ? colors.text : colors.surface }]}
              onPress={() => setSelectedCategory(category.id)}
            >
              <Ionicons 
                name={category.icon} 
                size={14} 
                color={selectedCategory === category.id ? colors.background : colors.text} 
              />
              <Text style={[styles.categoryStatText, selectedCategory === category.id && styles.categoryStatTextActive, { color: selectedCategory === category.id ? colors.background : colors.text, fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' }]}>
                {category.name} ({category.count})
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* ACTION BAR */}
      <View style={styles.actionBar}>
        <View style={[styles.searchContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Ionicons name="search-outline" size={18} color={colors.textSecondary} />
          <TextInput
            style={[styles.searchInput, { color: colors.text, fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' }]}
            placeholder="Ürün, marka veya renk ara..."
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={16} color={colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
        
        <TouchableOpacity style={[styles.filterButton, { backgroundColor: colors.card, borderColor: colors.border }]} onPress={() => setBrandFilterVisible(true)}>
          <Ionicons name="pricetags-outline" size={16} color={colors.text} />
          <Text style={[styles.filterButtonText, { color: colors.text, fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' }]}>
            {selectedBrand || 'MARKA'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.filterButton, selectedFilter !== 'all' && styles.filterButtonActive, { backgroundColor: selectedFilter !== 'all' ? colors.text : colors.card, borderColor: colors.border }]} 
          onPress={() => {
            if (selectedFilter === 'all') setSelectedFilter('starred');
            else if (selectedFilter === 'starred') setSelectedFilter('unstarred');
            else setSelectedFilter('all');
          }}
        >
          <Ionicons 
            name={selectedFilter === 'starred' ? 'star' : selectedFilter === 'unstarred' ? 'star-outline' : 'star-outline'} 
            size={16} 
            color={selectedFilter !== 'all' ? colors.background : colors.text} 
          />
          <Text style={[styles.filterButtonText, selectedFilter !== 'all' && styles.filterButtonTextActive, { color: selectedFilter !== 'all' ? colors.background : colors.text, fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' }]}>
            {selectedFilter === 'all' ? '⭐' : selectedFilter === 'starred' ? 'FAVORİ' : 'DİĞER'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.sortButton, { backgroundColor: colors.card, borderColor: colors.border }]} onPress={() => setSortModalVisible(true)}>
          <Ionicons name="funnel-outline" size={16} color={colors.text} />
          <Text style={[styles.sortButtonText, { color: colors.text, fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' }]}>SIRALA</Text>
        </TouchableOpacity>
      </View>

      {/* PRODUCTS LIST */}
      {filteredProducts.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={[styles.emptyIconContainer, { borderColor: colors.border }]}>
            <Ionicons name="albums-outline" size={48} color={colors.textSecondary} />
          </View>
          <Text style={[styles.emptyTitle, { color: colors.text, fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' }]}>
            {searchQuery ? 'ÜRÜN BULUNAMADI' : 'HENÜZ ÜRÜN EKLENMEMİŞ'}
          </Text>
          <Text style={[styles.emptyText, { color: colors.textSecondary, fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' }]}>
            {searchQuery 
              ? `"${searchQuery}" ile eşleşen ürün yok`
              : 'Gardırobuna ilk ürünü eklemek için + butonuna tıkla'}
          </Text>
          {searchQuery ? (
            <TouchableOpacity style={[styles.clearButton, { backgroundColor: colors.text }]} onPress={() => setSearchQuery('')}>
              <Text style={[styles.clearButtonText, { color: colors.background, fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' }]}>ARAMAYI TEMİZLE</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={[styles.emptyButton, { backgroundColor: colors.text }]} onPress={() => setAddModalVisible(true)}>
              <Text style={[styles.emptyButtonText, { color: colors.background, fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' }]}>ÜRÜN EKLE</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <FlatList
          data={filteredProducts}
          renderItem={({ item }) => (
            <ProductCard 
              item={item} 
              onPress={handleProductPress} 
              onToggleStar={toggleStar}
            />
          )}
          keyExtractor={item => item.id}
          numColumns={2}
          columnWrapperStyle={styles.columnWrapper}
          contentContainerStyle={styles.productsList}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.text]} tintColor={colors.text} />
          }
        />
      )}

      {/* MODALS */}
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
        onToggleStar={toggleStar}
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

      <BrandFilterModal
        visible={brandFilterVisible}
        brands={getAllBrands()}
        selectedBrand={selectedBrand}
        onSelect={(brand) => {
          setSelectedBrand(brand);
          setBrandFilterVisible(false);
        }}
        onClose={() => setBrandFilterVisible(false)}
      />
    </SafeAreaView>
  );
};

// ============================================================
// 📌 STILLER (TAM REVİZE)
// ============================================================
const styles = StyleSheet.create({
  container: { flex: 1 },

  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: SIZES.md },
  loadingText: { ...TYPOGRAPHY.caption },

  // HEADER
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
    fontSize: 16,
    letterSpacing: 2,
    fontWeight: '400',
  },
  addButtonHeader: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // STATS CARD
  statsCard: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginHorizontal: SIZES.lg,
    paddingVertical: SIZES.md,
    borderRadius: 8,
    marginBottom: SIZES.md,
  },
  statItem: { alignItems: 'center', flex: 1 },
  statNumber: { ...TYPOGRAPHY.title3, fontSize: 18, fontWeight: '500' },
  statLabel: { ...TYPOGRAPHY.caption, fontSize: 9, marginTop: 2 },
  statDivider: { width: 0.5, height: 30 },

  // CATEGORY STATS
  categoryStatsWrapper: { marginBottom: SIZES.sm },
  categoryStatsContainer: { paddingHorizontal: SIZES.lg, gap: SIZES.sm },
  categoryStatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SIZES.md,
    paddingVertical: 4,
    borderRadius: 16,
    gap: 4,
    marginRight: 6,
  },
  categoryStatItemActive: {},
  categoryStatText: { ...TYPOGRAPHY.caption, fontSize: 9 },
  categoryStatTextActive: { fontWeight: '600' },

  // ACTION BAR
  actionBar: {
    flexDirection: 'row',
    paddingHorizontal: SIZES.lg,
    paddingBottom: SIZES.md,
    gap: 6,
    alignItems: 'center',
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 0.5,
    paddingHorizontal: SIZES.sm,
    paddingVertical: 6,
    borderRadius: 6,
  },
  searchInput: {
    flex: 1,
    marginLeft: 6,
    fontSize: 12,
    padding: 0,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 0.5,
    paddingHorizontal: SIZES.sm,
    paddingVertical: 6,
    borderRadius: 6,
    gap: 4,
  },
  filterButtonActive: { borderWidth: 1 },
  filterButtonText: { fontSize: 9, fontWeight: '500' },
  filterButtonTextActive: { fontWeight: '700' },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 0.5,
    paddingHorizontal: SIZES.sm,
    paddingVertical: 6,
    borderRadius: 6,
    gap: 4,
  },
  sortButtonText: { fontSize: 9, fontWeight: '500' },

  // PRODUCTS LIST
  productsList: { paddingHorizontal: SIZES.lg, paddingBottom: SIZES.xl },
  columnWrapper: { justifyContent: 'space-between', marginBottom: SIZES.md },

  // PRODUCT CARD
  productCard: {
    flex: 1,
    maxWidth: '48%',
    borderWidth: 0.5,
    padding: SIZES.sm,
    borderRadius: 8,
  },
  productImage: { width: '100%', height: 140, borderRadius: 6 },
  starButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    padding: 4,
    borderRadius: 12,
  },
  productInfo: { paddingVertical: 4, gap: 2 },
  productName: { ...TYPOGRAPHY.body, fontSize: 12, fontWeight: '500' },
  productBrand: { ...TYPOGRAPHY.caption, fontSize: 9 },
  productColor: { ...TYPOGRAPHY.caption, fontSize: 8 },
  productBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  productPrice: { ...TYPOGRAPHY.body, fontSize: 13, fontWeight: '600' },
  productSizeBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  productSizeText: { ...TYPOGRAPHY.caption, fontSize: 7 },

  // EMPTY STATE
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SIZES.xl,
    paddingTop: 40,
  },
  emptyIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SIZES.lg,
  },
  emptyTitle: { ...TYPOGRAPHY.title3, fontSize: 18, fontWeight: '400', letterSpacing: 2, marginBottom: SIZES.xs },
  emptyText: { ...TYPOGRAPHY.body, fontSize: 13, textAlign: 'center', marginBottom: SIZES.xl, lineHeight: 20 },
  clearButton: { paddingHorizontal: SIZES.xl, paddingVertical: SIZES.sm, borderRadius: 8 },
  clearButtonText: { ...TYPOGRAPHY.button, fontSize: 10, fontWeight: '400', letterSpacing: 1 },
  emptyButton: { paddingHorizontal: SIZES.xl, paddingVertical: SIZES.sm, borderRadius: 8 },
  emptyButtonText: { ...TYPOGRAPHY.button, fontSize: 10, fontWeight: '400', letterSpacing: 1 },

  // MODAL OVERLAY
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', alignItems: 'center' },

  // MODAL CONTENT
  modalContent: {
    width: width * 0.92,
    maxHeight: height * 0.9,
    borderRadius: 20,
    padding: SIZES.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.md,
    paddingBottom: SIZES.sm,
    borderBottomWidth: 0.5,
  },
  modalTitle: { ...TYPOGRAPHY.title3, fontSize: 16, fontWeight: '500' },
  modalScroll: { maxHeight: height * 0.75 },

  // INPUTS
  inputGroup: { marginBottom: SIZES.md },
  inputLabel: { ...TYPOGRAPHY.caption, fontSize: 10, marginBottom: 4 },
  input: {
    ...TYPOGRAPHY.body,
    fontSize: 14,
    borderWidth: 0.5,
    paddingHorizontal: SIZES.md,
    paddingVertical: SIZES.sm,
    borderRadius: 8,
  },

  // TEMPLATES
  templatesSection: { marginBottom: SIZES.md },
  templatesTitle: { ...TYPOGRAPHY.caption, fontSize: 11, marginBottom: 2 },
  templatesSubtitle: { ...TYPOGRAPHY.caption, fontSize: 9, marginBottom: 6 },
  templatesScroll: { flexDirection: 'row' },
  templateCard: {
    width: 100,
    borderWidth: 0.5,
    borderRadius: 8,
    padding: SIZES.xs,
    marginRight: 6,
  },
  templateImage: { width: '100%', height: 80, borderRadius: 4 },
  templateName: { ...TYPOGRAPHY.caption, fontSize: 9, marginTop: 2 },
  templatePrice: { ...TYPOGRAPHY.caption, fontSize: 8 },

  // IMAGE PICKER
  imagePickerContainer: { marginBottom: SIZES.md },
  imagePickerButton: {
    width: '100%',
    height: 180,
    borderRadius: 12,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 0.5,
  },
  imagePreview: { width: '100%', height: '100%' },
  imageRemoveButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 4,
    borderRadius: 12,
  },
  imagePlaceholder: { alignItems: 'center', gap: 4 },
  imagePlaceholderText: { ...TYPOGRAPHY.caption, fontSize: 12 },
  imagePlaceholderSubtext: { ...TYPOGRAPHY.caption, fontSize: 10 },
  uploadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // CATEGORY SELECT
  categorySelect: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SIZES.sm,
    paddingVertical: 4,
    borderWidth: 0.5,
    borderRadius: 16,
    marginRight: 4,
    gap: 4,
  },
  categorySelectActive: { backgroundColor: COLORS.black, borderColor: COLORS.black },
  categorySelectText: { ...TYPOGRAPHY.caption, fontSize: 9 },
  categorySelectTextActive: { color: COLORS.white },

  // COLOR SELECT
  colorSelect: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SIZES.sm,
    paddingVertical: 4,
    borderWidth: 0.5,
    borderRadius: 16,
    marginRight: 4,
    gap: 4,
  },
  colorSelectActive: { backgroundColor: COLORS.black, borderColor: COLORS.black },
  colorSelectText: { ...TYPOGRAPHY.caption, fontSize: 9 },
  colorSelectTextActive: { color: COLORS.white },
  colorDot: { width: 12, height: 12, borderRadius: 6 },

  // SIZE SELECT
  sizeSelect: {
    paddingHorizontal: SIZES.sm,
    paddingVertical: 4,
    borderWidth: 0.5,
    borderRadius: 16,
    marginRight: 4,
  },
  sizeSelectActive: { backgroundColor: COLORS.black, borderColor: COLORS.black },
  sizeSelectText: { ...TYPOGRAPHY.caption, fontSize: 9 },
  sizeSelectTextActive: { color: COLORS.white },

  // ADD BUTTON
  addButton: { marginTop: SIZES.sm, borderRadius: 8, overflow: 'hidden' },
  addButtonGradient: { paddingVertical: SIZES.md, alignItems: 'center' },
  addButtonText: { ...TYPOGRAPHY.button, fontSize: 13, fontWeight: '600', letterSpacing: 1 },

  // EDIT IMAGE
  editImageContainer: { alignItems: 'center', marginBottom: SIZES.md },
  editImage: { width: 120, height: 120, borderRadius: 8, borderWidth: 0.5 },
  editImageLabel: { ...TYPOGRAPHY.caption, fontSize: 9, marginTop: 4 },

  // SAVE BUTTON
  saveButton: { marginTop: SIZES.sm, borderRadius: 8, overflow: 'hidden' },
  saveButtonText: { ...TYPOGRAPHY.button, fontSize: 13, fontWeight: '600', letterSpacing: 1 },

  // FILTER MODAL
  filterModalContainer: { width: width * 0.85, maxHeight: height * 0.7, borderRadius: 20, padding: SIZES.lg },
  filterModalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SIZES.md, paddingBottom: SIZES.sm, borderBottomWidth: 0.5 },
  filterModalTitle: { ...TYPOGRAPHY.caption, fontSize: 12 },
  filterBrandItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: SIZES.md, borderBottomWidth: 0.5 },
  filterBrandItemActive: {},
  filterBrandText: { ...TYPOGRAPHY.body, fontSize: 13 },
  filterBrandTextActive: { fontWeight: '600' },

  // SORT MODAL
  sortModalContainer: { width: width * 0.8, borderRadius: 20, padding: SIZES.lg },
  sortModalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SIZES.md, paddingBottom: SIZES.sm, borderBottomWidth: 0.5 },
  sortModalTitle: { ...TYPOGRAPHY.caption, fontSize: 12 },
  sortOption: { flexDirection: 'row', alignItems: 'center', paddingVertical: SIZES.md, borderBottomWidth: 0.5, gap: SIZES.md },
  sortOptionActive: {},
  sortOptionText: { ...TYPOGRAPHY.body, fontSize: 13 },
  sortOptionTextActive: { fontWeight: '600' },

  // DETAIL MODAL
  detailModalContent: {
    width: width * 0.92,
    maxHeight: height * 0.9,
    borderRadius: 20,
    overflow: 'hidden',
  },
  detailImage: { width: '100%', height: 300 },
  detailCloseButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    padding: 8,
    borderRadius: 20,
  },
  detailInfo: { padding: SIZES.lg },
  detailHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 },
  detailName: { ...TYPOGRAPHY.title3, fontSize: 20, fontWeight: '500' },
  detailBrand: { ...TYPOGRAPHY.body, fontSize: 14, marginBottom: SIZES.md },
  detailMeta: { gap: 4, marginBottom: SIZES.md },
  detailCategory: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  detailCategoryText: { ...TYPOGRAPHY.caption, fontSize: 11 },
  detailColor: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  detailColorText: { ...TYPOGRAPHY.caption, fontSize: 11 },
  detailSize: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  detailSizeText: { ...TYPOGRAPHY.caption, fontSize: 11 },
  detailModel: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  detailModelText: { ...TYPOGRAPHY.caption, fontSize: 11 },
  detailPrice: { ...TYPOGRAPHY.title2, fontSize: 24, fontWeight: '700', marginBottom: 2 },
  detailDate: { ...TYPOGRAPHY.caption, fontSize: 9, marginBottom: SIZES.md },
  detailActions: { flexDirection: 'row', gap: SIZES.md },
  editButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, paddingVertical: SIZES.md, borderRadius: 8 },
  editButtonText: { ...TYPOGRAPHY.button, fontSize: 11, fontWeight: '600' },
  deleteButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, paddingVertical: SIZES.md, borderRadius: 8 },
  deleteButtonText: { ...TYPOGRAPHY.button, fontSize: 11, fontWeight: '600' },
});

export default KoleksiyonumScreen;