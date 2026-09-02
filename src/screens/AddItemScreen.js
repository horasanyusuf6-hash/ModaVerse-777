// 📁 src/screens/AddItemScreen.js - TAM REVİZE (Oracle Backend Entegre)
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Platform,
  TextInput
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, TYPOGRAPHY, SIZES } from '../constants/Theme';
import { auth } from '../config/firebase';

// ============================================================
// 📌 API URL (ORACLE SUNUCUSU)
// ============================================================
const API_BASE_URL = 'http://130.61.118.228:8080';

// ============================================================
// 📌 ANA BİLEŞEN
// ============================================================
export default function AddItemScreen({ navigation, route }) {
  const editItem = route?.params?.item || null;
  const isEditMode = !!editItem;

  const [image, setImage] = useState(editItem?.img_url || null);
  const [analysis, setAnalysis] = useState(editItem ? {
    category: editItem.kategori || 'Belirlenemedi',
    color: editItem.renk || 'Belirlenemedi',
    brand: editItem.marka || 'Belirlenemedi',
    gender: 'Unisex',
    season: 'Dört mevsim',
    caption: editItem.ad || 'Ürün'
  } : null);
  const [loading, setLoading] = useState(false);
  const [apiConnected, setApiConnected] = useState(false);

  // 📝 Manuel giriş için alanlar
  const [manualCategory, setManualCategory] = useState(editItem?.kategori || '');
  const [manualColor, setManualColor] = useState(editItem?.renk || '');
  const [manualBrand, setManualBrand] = useState(editItem?.marka || '');
  const [manualName, setManualName] = useState(editItem?.ad || '');
  const [manualSize, setManualSize] = useState(editItem?.size || '');

  // ============================================================
  // 📌 BAĞLANTI KONTROLÜ
  // ============================================================
  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/health`);
      if (response.ok) {
        setApiConnected(true);
        console.log('✅ Backend bağlantısı başarılı');
      } else {
        setApiConnected(false);
        console.warn('⚠️ Backend bağlantısı başarısız');
      }
    } catch (error) {
      setApiConnected(false);
      console.error('🔌 Backend bağlanamadı:', error.message);
    }
  };

  // ============================================================
  // 📌 KAMERA / GALERİ
  // ============================================================
  const pickImage = async (useCamera = true) => {
    try {
      let result;
      
      if (useCamera) {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('İzin Gerekli', 'Kamera kullanımı için izin gerekiyor');
          return;
        }
        result = await ImagePicker.launchCameraAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.8,
        });
      } else {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('İzin Gerekli', 'Galeri erişimi için izin gerekiyor');
          return;
        }
        result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.8,
        });
      }

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const selectedImage = result.assets[0];
        setImage(selectedImage.uri);
        setAnalysis(null);
        await analyzeImage(selectedImage.uri);
      }
    } catch (error) {
      console.error('Görsel seçme hatası:', error);
      Alert.alert('Hata', 'Fotoğraf seçilemedi');
    }
  };

  // ============================================================
  // 📌 AI ANALİZ
  // ============================================================
  const analyzeImage = async (uri) => {
    if (!apiConnected) {
      Alert.alert('Hata', 'Backend sunucusuna bağlı değil');
      return;
    }

    setLoading(true);
    try {
      // FormData oluştur
      const formData = new FormData();
      formData.append('file', {
        uri: uri,
        name: 'photo.jpg',
        type: 'image/jpeg'
      });

      const response = await fetch(`${API_BASE_URL}/api/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        body: formData,
      });

      const result = await response.json();
      
      if (result && result.success) {
        const analysisData = result.analysis || result;
        setAnalysis({
          category: analysisData.category || 'Belirlenemedi',
          color: analysisData.color || 'Belirlenemedi',
          brand: analysisData.brand || 'Belirlenemedi',
          gender: analysisData.gender || 'Unisex',
          season: analysisData.season || 'Dört mevsim',
          caption: analysisData.caption || 'Ürün analiz edildi'
        });
        // Manuel alanları doldur
        if (analysisData.category) setManualCategory(analysisData.category);
        if (analysisData.color) setManualColor(analysisData.color);
        if (analysisData.brand) setManualBrand(analysisData.brand);
      } else {
        Alert.alert('Uyarı', 'AI analiz sonucu alınamadı, manuel giriş yapabilirsiniz.');
      }
    } catch (error) {
      console.error('Analiz hatası:', error);
      Alert.alert('Uyarı', 'AI analiz yapılamadı, manuel giriş yapabilirsiniz.');
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // 📌 TOKEN AL
  // ============================================================
  const getToken = async () => {
    try {
      const token = await AsyncStorage.getItem('modaverse_token');
      return token || '';
    } catch {
      return '';
    }
  };

  // ============================================================
  // 📌 KAYDET
  // ============================================================
  const saveItem = async () => {
    const user = auth.currentUser;
    if (!user) {
      Alert.alert('Hata', 'Lütfen önce giriş yapın.');
      return;
    }

    // Manuel alanları kontrol et
    if (!manualName.trim() && !image) {
      Alert.alert('Uyarı', 'Lütfen ürün adı girin veya fotoğraf çekin.');
      return;
    }

    const itemData = {
      user_id: user.uid,
      brand: manualBrand || 'Bilinmeyen',
      family_code: `FC_${Date.now()}`,
      design_code: `DC_${Date.now()}`,
      color: manualColor || 'belirsiz',
      category: manualCategory || 'diger',
      size: manualSize || null,
      image_url: image || '',
      ad: manualName || 'Yeni Ürün'
    };

    setLoading(true);
    try {
      const token = await getToken();
      
      const response = await fetch(`${API_BASE_URL}/api/wardrobe/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(itemData),
      });

      const result = await response.json();

      if (result && result.success) {
        Alert.alert('Başarılı', 'Ürün dolabınıza eklendi!');
        navigation.goBack();
      } else {
        Alert.alert('Hata', result.message || 'Eklenemedi.');
      }
    } catch (error) {
      console.error('Kayıt hatası:', error);
      Alert.alert('Hata', 'Kaydedilemedi: ' + (error.message || 'Bilinmeyen hata'));
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // 📌 RENDER
  // ============================================================
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation?.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.black} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {isEditMode ? 'ÜRÜN DÜZENLE' : 'YENİ ÜRÜN EKLE'}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Status Bar */}
      <View style={[styles.statusBar, apiConnected ? styles.connected : styles.disconnected]}>
        <Ionicons name={apiConnected ? "checkmark-circle" : "alert-circle"} size={16} color={COLORS.white} />
        <Text style={styles.statusText}>
          {apiConnected ? 'Backend Bağlı' : 'Backend Bağlı Değil'}
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Butonlar */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={[styles.button, styles.cameraButton]} onPress={() => pickImage(true)}>
            <Ionicons name="camera" size={22} color={COLORS.white} />
            <Text style={styles.buttonText}>Fotoğraf Çek</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.button, styles.galleryButton]} onPress={() => pickImage(false)}>
            <Ionicons name="images" size={22} color={COLORS.white} />
            <Text style={styles.buttonText}>Galeriden Seç</Text>
          </TouchableOpacity>
        </View>

        {/* Görsel Önizleme */}
        {image && (
          <View style={styles.imageContainer}>
            <Image source={{ uri: image }} style={styles.image} />
            <TouchableOpacity style={styles.removeButton} onPress={() => setImage(null)}>
              <Ionicons name="close" size={20} color={COLORS.white} />
            </TouchableOpacity>
          </View>
        )}

        {/* Manuel Giriş */}
        <View style={styles.formContainer}>
          <Text style={styles.formTitle}>ÜRÜN BİLGİLERİ</Text>
          
          <TextInput
            style={styles.input}
            placeholder="Ürün Adı *"
            placeholderTextColor={COLORS.grayMedium}
            value={manualName}
            onChangeText={setManualName}
          />

          <View style={styles.row}>
            <TextInput
              style={[styles.input, styles.halfInput]}
              placeholder="Kategori"
              placeholderTextColor={COLORS.grayMedium}
              value={manualCategory}
              onChangeText={setManualCategory}
            />
            <TextInput
              style={[styles.input, styles.halfInput]}
              placeholder="Renk"
              placeholderTextColor={COLORS.grayMedium}
              value={manualColor}
              onChangeText={setManualColor}
            />
          </View>

          <View style={styles.row}>
            <TextInput
              style={[styles.input, styles.halfInput]}
              placeholder="Marka"
              placeholderTextColor={COLORS.grayMedium}
              value={manualBrand}
              onChangeText={setManualBrand}
            />
            <TextInput
              style={[styles.input, styles.halfInput]}
              placeholder="Beden (S/M/L/XL)"
              placeholderTextColor={COLORS.grayMedium}
              value={manualSize}
              onChangeText={setManualSize}
            />
          </View>
        </View>

        {/* AI Sonuçları */}
        {analysis && !loading && (
          <View style={styles.resultContainer}>
            <Text style={styles.resultTitle}>🤖 AI Analiz Sonuçları</Text>
            
            <View style={styles.resultGrid}>
              <View style={styles.resultCard}>
                <Text style={styles.resultLabel}>Kategori</Text>
                <Text style={styles.resultValue}>{analysis.category || 'Belirlenemedi'}</Text>
              </View>
              <View style={styles.resultCard}>
                <Text style={styles.resultLabel}>Renk</Text>
                <Text style={styles.resultValue}>{analysis.color || 'Belirlenemedi'}</Text>
              </View>
              {analysis.brand && (
                <View style={styles.resultCard}>
                  <Text style={styles.resultLabel}>Marka</Text>
                  <Text style={styles.resultValue}>{analysis.brand}</Text>
                </View>
              )}
              <View style={styles.resultCard}>
                <Text style={styles.resultLabel}>Mevsim</Text>
                <Text style={styles.resultValue}>{analysis.season || 'Dört mevsim'}</Text>
              </View>
            </View>

            {analysis.caption && (
              <View style={styles.captionBox}>
                <Text style={styles.captionLabel}>AI Açıklaması</Text>
                <Text style={styles.captionText}>{analysis.caption}</Text>
              </View>
            )}
          </View>
        )}

        {/* Loading */}
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.black} />
            <Text style={styles.loadingText}>İşleniyor...</Text>
          </View>
        )}

        {/* Kaydet Butonu */}
        <TouchableOpacity style={styles.saveButton} onPress={saveItem} disabled={loading}>
          <Ionicons name={isEditMode ? "create-outline" : "save-outline"} size={20} color={COLORS.white} />
          <Text style={styles.saveButtonText}>
            {isEditMode ? 'GÜNCELLE' : 'DOLABA EKLE'}
          </Text>
        </TouchableOpacity>

        {/* Bağlantı Uyarısı */}
        {!apiConnected && (
          <View style={styles.warningContainer}>
            <Ionicons name="cloud-offline-outline" size={28} color={COLORS.warning} />
            <Text style={styles.warningText}>Backend bağlantısı yok. Veriler kaydedilemez.</Text>
            <TouchableOpacity style={styles.retryButton} onPress={checkConnection}>
              <Text style={styles.retryButtonText}>Tekrar Dene</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// ============================================================
// 📌 STYLES
// ============================================================
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white },
  scrollContent: { paddingBottom: 40 },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SIZES.lg,
    paddingTop: Platform.OS === 'ios' ? 12 : SIZES.md,
    paddingBottom: SIZES.sm,
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.grayLight,
  },
  backButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'flex-start' },
  headerTitle: { ...TYPOGRAPHY.caption, fontSize: 14, letterSpacing: 1 },

  // Status
  statusBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 6,
    marginHorizontal: SIZES.lg,
    marginTop: SIZES.md,
    borderRadius: 20,
  },
  connected: { backgroundColor: COLORS.success },
  disconnected: { backgroundColor: COLORS.danger || '#EF5350' },
  statusText: { ...TYPOGRAPHY.caption, fontSize: 11, color: COLORS.white },

  // Butonlar
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: SIZES.md,
    marginHorizontal: SIZES.lg,
    marginVertical: SIZES.lg,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 30,
  },
  cameraButton: { backgroundColor: COLORS.black },
  galleryButton: { backgroundColor: COLORS.primary || '#BFA085' },
  buttonText: { ...TYPOGRAPHY.button, fontSize: 13, color: COLORS.white },

  // Görsel
  imageContainer: {
    alignItems: 'center',
    marginHorizontal: SIZES.lg,
    marginBottom: SIZES.lg,
    position: 'relative',
  },
  image: { width: '100%', height: 280, borderRadius: 16, backgroundColor: COLORS.surface },
  removeButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(0,0,0,0.6)',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Form
  formContainer: { marginHorizontal: SIZES.lg, marginBottom: SIZES.md },
  formTitle: { ...TYPOGRAPHY.caption, fontSize: 12, marginBottom: SIZES.md, letterSpacing: 1 },
  input: {
    borderWidth: 0.5,
    borderColor: COLORS.grayLight,
    paddingHorizontal: SIZES.md,
    paddingVertical: SIZES.sm,
    ...TYPOGRAPHY.body,
    marginBottom: SIZES.sm,
  },
  row: { flexDirection: 'row', gap: SIZES.sm },
  halfInput: { flex: 1 },

  // AI Sonuçları
  resultContainer: {
    backgroundColor: COLORS.white,
    marginHorizontal: SIZES.lg,
    marginBottom: SIZES.lg,
    padding: SIZES.md,
    borderRadius: 20,
    borderWidth: 0.5,
    borderColor: COLORS.grayLight,
  },
  resultTitle: { ...TYPOGRAPHY.body, fontWeight: '600', marginBottom: SIZES.md },
  resultGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 10 },
  resultCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: COLORS.surface,
    padding: 12,
    borderRadius: 12,
  },
  resultLabel: { ...TYPOGRAPHY.caption, fontSize: 10, color: COLORS.grayMedium, textTransform: 'uppercase' },
  resultValue: { ...TYPOGRAPHY.body, fontWeight: '500' },
  captionBox: { backgroundColor: COLORS.surface, padding: SIZES.md, borderRadius: 12, marginTop: SIZES.md },
  captionLabel: { ...TYPOGRAPHY.caption, fontSize: 10, color: COLORS.grayMedium, textTransform: 'uppercase' },
  captionText: { ...TYPOGRAPHY.body, fontSize: 13, color: COLORS.gray, fontStyle: 'italic' },

  // Loading
  loadingContainer: { alignItems: 'center', paddingVertical: 40, marginHorizontal: SIZES.lg },
  loadingText: { ...TYPOGRAPHY.caption, marginTop: SIZES.md },

  // Kaydet
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COLORS.black,
    paddingVertical: 16,
    marginHorizontal: SIZES.lg,
    borderRadius: 30,
  },
  saveButtonText: { ...TYPOGRAPHY.button, color: COLORS.white },

  // Uyarı
  warningContainer: {
    alignItems: 'center',
    marginHorizontal: SIZES.lg,
    padding: SIZES.xl,
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    marginTop: SIZES.md,
  },
  warningText: { ...TYPOGRAPHY.body, textAlign: 'center', marginVertical: SIZES.sm },
  retryButton: { borderWidth: 0.5, borderColor: COLORS.grayLight, paddingHorizontal: SIZES.xl, paddingVertical: SIZES.sm },
  retryButtonText: { ...TYPOGRAPHY.caption, fontSize: 12 },
});