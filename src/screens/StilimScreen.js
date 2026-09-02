// 📁 src/screens/StilimScreen.js - TAM REVİZE (FULL SCREEN NAVIGATION)
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
  Alert,
  Modal,
  TextInput,
  Dimensions,
  ActivityIndicator,
  RefreshControl,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { COLORS, TYPOGRAPHY, SIZES } from '../constants/Theme';
import { AuthContext } from '../../App';
import { getUserProfile, createUserProfile, updateBodyMeasurements, updateStylePreferences } from '../services/profileService';

const { width, height } = Dimensions.get('window');

// ============================================================
// 📌 TARZLAR
// ============================================================
const STYLES = [
  { id: 1, name: 'Minimalist', icon: '◻️', percentage: 65, rank: 1, rankLabel: 'Birincil' },
  { id: 2, name: 'Sokak Modası', icon: '◼️', percentage: 45, rank: 2, rankLabel: 'İkincil' },
  { id: 3, name: 'Bohem', icon: '◽', percentage: 30, rank: 3, rankLabel: 'Üçüncül' },
  { id: 4, name: 'Sportif', icon: '▪️', percentage: 20, rank: 4, rankLabel: 'Dördüncül' },
  { id: 5, name: 'Lüks', icon: '◆', percentage: 15, rank: 5, rankLabel: 'Beşincil' },
];

// ============================================================
// 📌 TARZ VERİLERİ
// ============================================================
const STYLE_DATA = {
  'Minimalist': {
    pieces: [
      { id: 1, name: 'Oversize Blazer', brand: 'ZARA', price: 799 },
      { id: 2, name: 'Basic Tişört', brand: 'KOTN', price: 149 },
      { id: 3, name: 'Sneaker', brand: 'Nike', price: 1899 },
    ],
    missing: [
      { id: 1, name: 'Deri Ceket', reason: 'Stiline çok yakışır', price: 1299 },
      { id: 2, name: 'Beyaz Gömlek', reason: 'Her kombinle uyumlu', price: 399 },
    ],
    brands: [
      { id: 1, name: 'COS', followers: '234K' },
      { id: 2, name: 'Arket', followers: '128K' },
    ],
    saved: [
      { id: 1, title: 'Minimalist Kombin', user: 'StyleHunter' },
    ],
  },
  'Sokak Modası': {
    pieces: [{ id: 1, name: 'Oversize Hoodie', brand: 'Supreme', price: 1299 }],
    missing: [{ id: 1, name: 'Sneaker', reason: 'Koleksiyonunu tamamlar', price: 1899 }],
    brands: [{ id: 1, name: 'Supreme', followers: '1.2M' }],
    saved: [{ id: 1, title: 'Street Style', user: 'UrbanKing' }],
  },
  'Bohem': {
    pieces: [{ id: 1, name: 'Maksi Elbise', brand: 'Free People', price: 2499 }],
    missing: [{ id: 1, name: 'Saç Bandı', reason: 'Boho look tamamlar', price: 199 }],
    brands: [{ id: 1, name: 'Free People', followers: '890K' }],
    saved: [{ id: 1, title: 'Boho Chic', user: 'GypsySoul' }],
  },
  'Sportif': {
    pieces: [{ id: 1, name: 'Eşofman Takımı', brand: 'Nike', price: 1599 }],
    missing: [{ id: 1, name: 'Spor Ayakkabı', reason: 'Koşu için ideal', price: 1899 }],
    brands: [{ id: 1, name: 'Nike', followers: '5.6M' }],
    saved: [{ id: 1, title: 'Gym Look', user: 'FitFashion' }],
  },
  'Lüks': {
    pieces: [{ id: 1, name: 'İpek Elbise', brand: 'Gucci', price: 4999 }],
    missing: [{ id: 1, name: 'Deri Çanta', reason: 'Lüks dokunuş', price: 2999 }],
    brands: [{ id: 1, name: 'Gucci', followers: '8.2M' }],
    saved: [{ id: 1, title: 'Luxury Life', user: 'RichStyle' }],
  },
};

// ============================================================
// 📌 BEDEN ÖLÇÜLERİ MODALI
// ============================================================
const BodyMeasurementsModal = ({ visible, measurements, onSave, onClose }) => {
  const [height, setHeight] = useState(measurements?.height?.toString() || '');
  const [weight, setWeight] = useState(measurements?.weight?.toString() || '');
  const [topSize, setTopSize] = useState(measurements?.topSize || '');
  const [bottomSize, setBottomSize] = useState(measurements?.bottomSize || '');
  const [shoeSize, setShoeSize] = useState(measurements?.shoeSize?.toString() || '');
  const [isLoading, setIsLoading] = useState(false);
  
  const sizeOptions = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

  const handleSave = async () => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 600));
    onSave({
      height: height ? Number(height) : null,
      weight: weight ? Number(weight) : null,
      topSize: topSize || null,
      bottomSize: bottomSize || null,
      shoeSize: shoeSize ? Number(shoeSize) : null,
    });
    setIsLoading(false);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Beden Ölçüleri</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={COLORS.black} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.rowInput}>
              <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                <Text style={styles.inputLabel}>Boy (cm)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="175"
                  placeholderTextColor={COLORS.grayMedium}
                  keyboardType="numeric"
                  value={height}
                  onChangeText={setHeight}
                />
              </View>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.inputLabel}>Kilo (kg)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="70"
                  placeholderTextColor={COLORS.grayMedium}
                  keyboardType="numeric"
                  value={weight}
                  onChangeText={setWeight}
                />
              </View>
            </View>

            <Text style={styles.inputLabel}>Üst Beden</Text>
            <View style={styles.sizeOptionsGrid}>
              {sizeOptions.map(size => (
                <TouchableOpacity 
                  key={size}
                  style={[styles.sizeOption, topSize === size && styles.sizeOptionActive]}
                  onPress={() => setTopSize(size)}
                >
                  <Text style={[styles.sizeOptionText, topSize === size && styles.sizeOptionTextActive]}>{size}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.inputLabel}>Alt Beden</Text>
            <View style={styles.sizeOptionsGrid}>
              {sizeOptions.map(size => (
                <TouchableOpacity 
                  key={size}
                  style={[styles.sizeOption, bottomSize === size && styles.sizeOptionActive]}
                  onPress={() => setBottomSize(size)}
                >
                  <Text style={[styles.sizeOptionText, bottomSize === size && styles.sizeOptionTextActive]}>{size}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TextInput 
              style={styles.input}
              placeholder="Ayakkabı Numarası"
              placeholderTextColor={COLORS.grayMedium}
              keyboardType="numeric"
              value={shoeSize}
              onChangeText={setShoeSize}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={styles.cancelButton} 
                onPress={onClose}
                disabled={isLoading}
              >
                <Text style={styles.cancelButtonText}>İPTAL</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.saveButtonPremium, isLoading && styles.saveButtonDisabled]} 
                onPress={handleSave}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color={COLORS.white} />
                ) : (
                  <>
                    <Ionicons name="checkmark-circle-outline" size={18} color={COLORS.white} />
                    <Text style={styles.saveButtonTextPremium}>KAYDET</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

// ============================================================
// 📌 STİL TERCİHLERİ MODALI
// ============================================================
const StylePreferencesModal = ({ visible, preferences, onSave, onClose }) => {
  const [favoriteColors, setFavoriteColors] = useState(preferences?.favoriteColors || []);
  const [preferredBrands, setPreferredBrands] = useState(preferences?.preferredBrands || []);
  const [tempColor, setTempColor] = useState('');
  const [tempBrand, setTempBrand] = useState('');

  const addToArray = (array, setArray, value, setTemp) => {
    if (value && value.trim() && !array.includes(value.trim())) {
      setArray([...array, value.trim()]);
      setTemp('');
    }
  };

  const removeFromArray = (array, setArray, value) => {
    setArray(array.filter(item => item !== value));
  };

  const handleSave = () => {
    onSave({
      favoriteColors,
      preferredBrands,
      avoidedStyles: preferences?.avoidedStyles || [],
      favoriteCategories: preferences?.favoriteCategories || [],
    });
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Stil Tercihleri</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={COLORS.black} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={styles.inputLabel}>Favori Renkler</Text>
            <View style={styles.tagContainer}>
              {favoriteColors.map((color, i) => (
                <View key={i} style={styles.tag}>
                  <Text style={styles.tagText}>{color}</Text>
                  <TouchableOpacity onPress={() => removeFromArray(favoriteColors, setFavoriteColors, color)}>
                    <Ionicons name="close-circle" size={16} color={COLORS.grayMedium} />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
            <View style={styles.addRow}>
              <TextInput 
                style={styles.addInput}
                placeholder="Renk ekle (örn: Mavi)"
                placeholderTextColor={COLORS.grayMedium}
                value={tempColor}
                onChangeText={setTempColor}
              />
              <TouchableOpacity style={styles.addButton} onPress={() => addToArray(favoriteColors, setFavoriteColors, tempColor, setTempColor)}>
                <Text style={styles.addButtonText}>+</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.inputLabel}>Favori Markalar</Text>
            <View style={styles.tagContainer}>
              {preferredBrands.map((brand, i) => (
                <View key={i} style={styles.tag}>
                  <Text style={styles.tagText}>{brand}</Text>
                  <TouchableOpacity onPress={() => removeFromArray(preferredBrands, setPreferredBrands, brand)}>
                    <Ionicons name="close-circle" size={16} color={COLORS.grayMedium} />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
            <View style={styles.addRow}>
              <TextInput 
                style={styles.addInput}
                placeholder="Marka ekle"
                placeholderTextColor={COLORS.grayMedium}
                value={tempBrand}
                onChangeText={setTempBrand}
              />
              <TouchableOpacity style={styles.addButton} onPress={() => addToArray(preferredBrands, setPreferredBrands, tempBrand, setTempBrand)}>
                <Text style={styles.addButtonText}>+</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
                <Text style={styles.cancelButtonText}>İPTAL</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                <Text style={styles.saveButtonText}>KAYDET</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

// ============================================================
// 📌 TARZ SEÇİM MODALI
// ============================================================
const StyleSelectionModal = ({ visible, stylesList, currentStyle, onSelect, onClose }) => {
  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.styleModalContainer}>
          <View style={styles.styleModalHeader}>
            <Text style={styles.styleModalTitle}>Tarz Seçimi</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={COLORS.black} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.styleModalList}>
            {stylesList.map((style) => (
              <TouchableOpacity
                key={style.id}
                style={[
                  styles.styleModalItem,
                  currentStyle === style.name && styles.styleModalItemActive
                ]}
                onPress={() => onSelect(style.name)}
              >
                <Text style={styles.styleModalIcon}>{style.icon}</Text>
                <View style={styles.styleModalInfo}>
                  <Text style={[
                    styles.styleModalName,
                    currentStyle === style.name && styles.styleModalNameActive
                  ]}>
                    {style.name}
                  </Text>
                  <View style={styles.styleModalRankBadge}>
                    <Text style={styles.styleModalRankText}>{style.rankLabel} Tarz</Text>
                  </View>
                </View>
                <View style={styles.styleModalPercentage}>
                  <Text style={styles.styleModalPercentageText}>%{style.percentage}</Text>
                </View>
                {currentStyle === style.name && (
                  <Ionicons name="checkmark-circle" size={20} color={COLORS.black} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    </Modal>
  );
};

// ============================================================
// 📌 AYARLAR MENÜSÜ
// ============================================================
const SettingsMenuModal = ({ visible, theme, onClose, onToggleTheme, onLogout }) => {
  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.settingsMenuContainer}>
          <View style={styles.settingsMenuHeader}>
            <Text style={styles.settingsMenuTitle}>Ayarlar</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={COLORS.black} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.settingsMenuSection}>
              <Text style={styles.settingsMenuSectionTitle}>Görünüm</Text>
              <TouchableOpacity style={styles.settingsMenuItem} onPress={onToggleTheme}>
                <View style={styles.settingsMenuItemLeft}>
                  <Ionicons name="moon-outline" size={20} color={COLORS.black} />
                  <Text style={styles.settingsMenuItemText}>Karanlık Tema</Text>
                </View>
                <View style={[styles.themeToggle, theme === 'dark' && styles.themeToggleActive]}>
                  <Text style={[styles.themeToggleText, theme === 'dark' && styles.themeToggleTextActive]}>
                    {theme === 'dark' ? 'Açık' : 'Kapalı'}
                  </Text>
                </View>
              </TouchableOpacity>
            </View>

            <View style={styles.settingsMenuSection}>
              <Text style={styles.settingsMenuSectionTitle}>Hesap</Text>
              <TouchableOpacity style={styles.settingsMenuItem} onPress={() => Alert.alert('Bilgi', 'ModaVerse v2.0.0')}>
                <View style={styles.settingsMenuItemLeft}>
                  <Ionicons name="information-circle-outline" size={20} color={COLORS.black} />
                  <Text style={styles.settingsMenuItemText}>Uygulama Versiyonu</Text>
                </View>
                <Text style={styles.settingsMenuItemValue}>2.0.0</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={[styles.settingsMenuItem, styles.logoutMenuItem]} onPress={onLogout}>
                <View style={styles.settingsMenuItemLeft}>
                  <Ionicons name="log-out-outline" size={20} color={COLORS.error} />
                  <Text style={[styles.settingsMenuItemText, styles.logoutMenuText]}>Çıkış Yap</Text>
                </View>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

// ============================================================
// 📌 ANA BİLEŞEN - StilimScreen
// ============================================================
const StilimScreen = ({ navigation }) => {
  const { user } = useContext(AuthContext);
  const [firestoreProfile, setFirestoreProfile] = useState(null);
  
  const [profile, setProfile] = useState({
    name: 'Moda',
    surname: 'Sever',
    bio: 'Moda tutkunu | Stil danışmanı | Trend takipçisi',
    avatar: 'https://i.pravatar.cc/100?img=1',
    coverImage: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800',
  });
  
  const [currentStyle, setCurrentStyle] = useState('Minimalist');
  const [styleData, setStyleData] = useState(STYLE_DATA['Minimalist']);
  const [styleModalVisible, setStyleModalVisible] = useState(false);
  
  const [stats, setStats] = useState({
    posts: 24,
    followers: 1240,
    following: 356,
  });
  
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [settingsMenuVisible, setSettingsMenuVisible] = useState(false);
  const [theme, setTheme] = useState('light');
  
  const [bodyModalVisible, setBodyModalVisible] = useState(false);
  const [stylePrefModalVisible, setStylePrefModalVisible] = useState(false);
  const [bodyMeasurements, setBodyMeasurements] = useState({
    height: null, weight: null, topSize: null, bottomSize: null, shoeSize: null
  });
  const [stylePreferences, setStylePreferences] = useState({
    favoriteColors: [], preferredBrands: [], avoidedStyles: [], favoriteCategories: []
  });

  const getUserTitle = () => {
    if (stats.followers >= 10000) return 'MODA İKONU';
    if (stats.followers >= 5000) return 'TREND BELİRLEYİCİ';
    if (stats.followers >= 1000) return 'STİL GURUSU';
    return 'MODA SEVER';
  };

  useEffect(() => {
    if (user) {
      loadFirestoreProfile();
    }
  }, [user]);

  const loadFirestoreProfile = async () => {
    const result = await getUserProfile(user.uid);
    if (result.success) {
      setFirestoreProfile(result.data);
      if (result.data.bodyMeasurements) {
        setBodyMeasurements(result.data.bodyMeasurements);
      }
      if (result.data.stylePreferences) {
        setStylePreferences(result.data.stylePreferences);
      }
    } else if (result.notFound) {
      const createResult = await createUserProfile(user.uid, user.email);
      if (createResult.success) {
        setFirestoreProfile(createResult.data);
      }
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const savedProfile = await AsyncStorage.getItem('@user_profile');
      if (savedProfile) {
        const parsedProfile = JSON.parse(savedProfile);
        setProfile({
          name: parsedProfile.name || 'Moda',
          surname: parsedProfile.surname || 'Sever',
          bio: parsedProfile.bio || 'Moda tutkunu | Stil danışmanı | Trend takipçisi',
          avatar: parsedProfile.avatar || 'https://i.pravatar.cc/100?img=1',
          coverImage: parsedProfile.coverImage || 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800',
        });
      }
    } catch (error) {
      console.error('Veri yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveProfile = async (newProfile) => {
    try {
      await AsyncStorage.setItem('@user_profile', JSON.stringify(newProfile));
      setProfile(newProfile);
      Alert.alert('Başarılı', 'Profil güncellendi!');
    } catch (error) {
      console.error('Profil kaydedilirken hata:', error);
    }
  };

  const handleSaveBodyMeasurements = async (measurements) => {
    const result = await updateBodyMeasurements(user.uid, measurements);
    if (result.success) {
      setBodyMeasurements(measurements);
      Alert.alert('Başarılı', 'Beden ölçüleriniz kaydedildi.');
      setBodyModalVisible(false);
    } else {
      Alert.alert('Hata', 'Kaydedilemedi: ' + result.error);
    }
  };

  const handleSaveStylePreferences = async (preferences) => {
    const result = await updateStylePreferences(user.uid, preferences);
    if (result.success) {
      setStylePreferences(preferences);
      Alert.alert('Başarılı', 'Stil tercihleriniz kaydedildi.');
      setStylePrefModalVisible(false);
    } else {
      Alert.alert('Hata', 'Kaydedilemedi: ' + result.error);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    if (user) await loadFirestoreProfile();
    setTimeout(() => setRefreshing(false), 1000);
  }, [user]);

  const handleStyleSelect = (styleName) => {
    setCurrentStyle(styleName);
    setStyleData(STYLE_DATA[styleName] || STYLE_DATA['Minimalist']);
    setStyleModalVisible(false);
  };

  // ============================================================
  // 📌 NAVIGASYON - FULL SCREEN SAYFALARA YÖNLENDİRME
  // ============================================================
  
  // 🆕 Stil Kimliği detaylarına git
  const handleIdentityPress = (type) => {
    let title = '';
    let items = [];
    
    switch (type) {
      case 'pieces':
        title = 'Tarzın Parçaları';
        items = styleData.pieces || [];
        break;
      case 'missing':
        title = 'Tarzın Eksikleri';
        items = styleData.missing || [];
        break;
      case 'brands':
        title = 'Tarzın Markaları';
        items = styleData.brands || [];
        break;
      case 'saved':
        title = 'Kaydedilen Gönderiler';
        items = styleData.saved || [];
        break;
    }
    
    // 🆕 IdentityGalleryScreen'e yönlendir
    navigation.navigate('IdentityGallery', { 
      title, 
      items,
      type 
    });
  };

  // 🆕 İstatistiklere tıklama - FULL SCREEN SAYFALAR
  const handleStatsPress = (type) => {
    if (type === 'posts') {
      // PostsGalleryScreen'e git
      navigation.navigate('PostsGallery');
    } else if (type === 'followers') {
      // FollowersScreen'e git
      navigation.navigate('Followers', { type: 'followers' });
    } else if (type === 'following') {
      // FollowersScreen'e git (takip edilenler)
      navigation.navigate('Followers', { type: 'following' });
    }
  };

  // 🆕 Profil düzenleme - EditProfileScreen'e git
  const handleEditProfile = () => {
    navigation.navigate('EditProfile', {
      profile,
      onSave: saveProfile,
    });
  };

  const handleToggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    Alert.alert('Tema Değiştirildi', `${newTheme === 'dark' ? 'Karanlık' : 'Aydınlık'} tema aktif.`);
  };

  const handleLogout = () => {
    Alert.alert(
      'Çıkış Yap',
      'Oturumunuzu kapatmak istediğinize emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        { text: 'Çıkış Yap', style: 'destructive', onPress: () => navigation?.replace('Onboarding') }
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.black} />
          <Text style={styles.loadingText}>Yükleniyor...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
      
      <ScrollView 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.black} />}
      >
        {/* Kapak Fotoğraflı Profil */}
        <View style={styles.profileContainer}>
          <Image source={{ uri: profile.coverImage }} style={styles.coverImage} />
          <View style={styles.profileOverlay} />
          
          <View style={styles.profileHeader}>
            <TouchableOpacity style={styles.editCoverButton} onPress={handleEditProfile}>
              <Ionicons name="camera-outline" size={14} color={COLORS.white} />
              <Text style={styles.editCoverText}>Kapak Değiştir</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.settingsButton} onPress={() => setSettingsMenuVisible(true)}>
              <Ionicons name="menu-outline" size={22} color={COLORS.white} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.avatarContainer}>
            <Image source={{ uri: profile.avatar }} style={styles.avatar} />
            <TouchableOpacity style={styles.editAvatarButton} onPress={handleEditProfile}>
              <Ionicons name="camera" size={12} color={COLORS.white} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Profil Bilgileri */}
        <View style={styles.profileInfo}>
          <Text style={styles.profileName}>{profile.name} {profile.surname}</Text>
          <Text style={styles.titleText}>{getUserTitle()}</Text>
          <Text style={styles.profileBio}>{profile.bio}</Text>
        </View>

        {/* İstatistik */}
        <View style={styles.statsContainer}>
          <TouchableOpacity style={styles.statItem} onPress={() => handleStatsPress('posts')}>
            <Text style={styles.statNumber}>{stats.posts}</Text>
            <Text style={styles.statLabel}>PAYLAŞIM</Text>
          </TouchableOpacity>
          <View style={styles.statDivider} />
          <TouchableOpacity style={styles.statItem} onPress={() => handleStatsPress('followers')}>
            <Text style={styles.statNumber}>{stats.followers}</Text>
            <Text style={styles.statLabel}>TAKİPÇİ</Text>
          </TouchableOpacity>
          <View style={styles.statDivider} />
          <TouchableOpacity style={styles.statItem} onPress={() => handleStatsPress('following')}>
            <Text style={styles.statNumber}>{stats.following}</Text>
            <Text style={styles.statLabel}>TAKİP</Text>
          </TouchableOpacity>
        </View>

        {/* BEDEN ÖLÇÜLERİ KARTI */}
        <TouchableOpacity style={styles.infoCard} onPress={() => setBodyModalVisible(true)}>
          <View style={styles.infoCardHeader}>
            <Ionicons name="body-outline" size={20} color={COLORS.black} />
            <Text style={styles.infoCardTitle}>Beden Ölçüleri</Text>
            <Ionicons name="chevron-forward" size={16} color={COLORS.grayMedium} style={{ marginLeft: 'auto' }} />
          </View>
          <View style={styles.infoCardPreview}>
            <Text style={styles.previewText}>{bodyMeasurements.height ? `${bodyMeasurements.height} cm` : 'Boy: —'}</Text>
            <Text style={styles.previewText}>{bodyMeasurements.topSize ? `${bodyMeasurements.topSize}` : 'Beden: —'}</Text>
            <Text style={styles.previewText}>{bodyMeasurements.shoeSize ? `${bodyMeasurements.shoeSize} numara` : 'Ayakkabı: —'}</Text>
          </View>
        </TouchableOpacity>

        {/* STİL TERCİHLERİ KARTI */}
        <TouchableOpacity style={styles.infoCard} onPress={() => setStylePrefModalVisible(true)}>
          <View style={styles.infoCardHeader}>
            <Ionicons name="color-palette-outline" size={20} color={COLORS.black} />
            <Text style={styles.infoCardTitle}>Stil Tercihleri</Text>
            <Ionicons name="chevron-forward" size={16} color={COLORS.grayMedium} style={{ marginLeft: 'auto' }} />
          </View>
          <View style={styles.infoCardPreview}>
            {stylePreferences.favoriteColors?.slice(0, 3).map((color, i) => (
              <View key={i} style={styles.previewTag}>
                <Text style={styles.previewTagText}>{color}</Text>
              </View>
            ))}
            {(stylePreferences.favoriteColors?.length === 0) && (
              <Text style={styles.previewText}>Renk tercihi eklenmedi</Text>
            )}
          </View>
        </TouchableOpacity>

        {/* Stil Kimliğim */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>STİL KİMLİĞİM</Text>
          <TouchableOpacity onPress={() => setStyleModalVisible(true)}>
            <Text style={styles.sectionLink}>Tüm Tarzlar</Text>
          </TouchableOpacity>
        </View>

        {/* Aktif Tarz Özet Kartı */}
        <TouchableOpacity 
          style={styles.activeStyleCard}
          onPress={() => setStyleModalVisible(true)}
          activeOpacity={0.7}
        >
          <View style={styles.activeStyleLeft}>
            <Text style={styles.activeStyleIcon}>{STYLES.find(s => s.name === currentStyle)?.icon}</Text>
            <View>
              <Text style={styles.activeStyleName}>{currentStyle}</Text>
              <Text style={styles.activeStyleRank}>Birincil Tarzın</Text>
            </View>
          </View>
          <View style={styles.activeStyleRight}>
            <Text style={styles.activeStylePercentage}>%{STYLES.find(s => s.name === currentStyle)?.percentage}</Text>
            <Ionicons name="chevron-forward" size={16} color={COLORS.grayMedium} />
          </View>
        </TouchableOpacity>

        {/* Stil Kimliği Grid */}
        <View style={styles.identityGrid}>
          <TouchableOpacity style={styles.identityCard} onPress={() => handleIdentityPress('pieces')}>
            <Ionicons name="shirt-outline" size={24} color={COLORS.black} />
            <Text style={styles.identityTitle}>Parçalar</Text>
            <Text style={styles.identityCount}>{styleData.pieces?.length || 0}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.identityCard} onPress={() => handleIdentityPress('missing')}>
            <Ionicons name="alert-circle-outline" size={24} color={COLORS.black} />
            <Text style={styles.identityTitle}>Eksikler</Text>
            <Text style={styles.identityCount}>{styleData.missing?.length || 0}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.identityCard} onPress={() => handleIdentityPress('brands')}>
            <Ionicons name="business-outline" size={24} color={COLORS.black} />
            <Text style={styles.identityTitle}>Markalar</Text>
            <Text style={styles.identityCount}>{styleData.brands?.length || 0}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.identityCard} onPress={() => handleIdentityPress('saved')}>
            <Ionicons name="bookmark-outline" size={24} color={COLORS.black} />
            <Text style={styles.identityTitle}>Kaydedilen</Text>
            <Text style={styles.identityCount}>{styleData.saved?.length || 0}</Text>
          </TouchableOpacity>
        </View>

        {/* AI Kombin Öneri Butonu */}
        <TouchableOpacity 
          style={styles.aiSuggestionButton}
          onPress={() => navigation.navigate('OutfitSuggestion')}
        >
          <Ionicons name="sparkles-outline" size={24} color={COLORS.white} />
          <View style={styles.aiSuggestionText}>
            <Text style={styles.aiSuggestionTitle}>YAPAY ZEKA KOMBİN ÖNER</Text>
            <Text style={styles.aiSuggestionSubtitle}>Gardırobuna göre stil önerileri al</Text>
          </View>
          <Ionicons name="arrow-forward" size={20} color={COLORS.white} />
        </TouchableOpacity>

        {/* Tüm Tarzlar Listesi */}
        <View style={styles.allStylesSection}>
          <Text style={styles.allStylesTitle}>TÜM TARZLARIM</Text>
          {STYLES.map((style) => (
            <TouchableOpacity 
              key={style.id}
              style={styles.miniStyleItem}
              onPress={() => handleStyleSelect(style.name)}
            >
              <View style={styles.miniStyleLeft}>
                <Text style={styles.miniStyleIcon}>{style.icon}</Text>
                <View>
                  <Text style={styles.miniStyleName}>{style.name}</Text>
                  <Text style={styles.miniStyleRank}>{style.rankLabel}</Text>
                </View>
              </View>
              <Text style={styles.miniStylePercentage}>%{style.percentage}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Modallar */}
      <StyleSelectionModal
        visible={styleModalVisible}
        stylesList={STYLES}
        currentStyle={currentStyle}
        onSelect={handleStyleSelect}
        onClose={() => setStyleModalVisible(false)}
      />

      <SettingsMenuModal
        visible={settingsMenuVisible}
        theme={theme}
        onClose={() => setSettingsMenuVisible(false)}
        onToggleTheme={handleToggleTheme}
        onLogout={handleLogout}
      />

      <BodyMeasurementsModal
        visible={bodyModalVisible}
        measurements={bodyMeasurements}
        onSave={handleSaveBodyMeasurements}
        onClose={() => setBodyModalVisible(false)}
      />

      <StylePreferencesModal
        visible={stylePrefModalVisible}
        preferences={stylePreferences}
        onSave={handleSaveStylePreferences}
        onClose={() => setStylePrefModalVisible(false)}
      />
    </SafeAreaView>
  );
};

// ============================================================
// 📌 STILLER
// ============================================================
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
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.grayMedium 
  },
  scrollContent: { 
    paddingBottom: SIZES.xxl 
  },
  
  // Profil Bölümü
  profileContainer: { 
    position: 'relative', 
    marginBottom: SIZES.xl 
  },
  coverImage: { 
    width: width, 
    height: 280, 
    resizeMode: 'cover' 
  },
  profileOverlay: { 
    position: 'absolute', 
    top: 0, 
    left: 0, 
    right: 0, 
    bottom: 0, 
    backgroundColor: 'rgba(0,0,0,0.15)' 
  },
  profileHeader: { 
    position: 'absolute', 
    top: Platform.OS === 'ios' ? 50 : 20, 
    left: 0, 
    right: 0, 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingHorizontal: SIZES.md 
  },
  editCoverButton: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: 'rgba(0,0,0,0.4)', 
    paddingHorizontal: SIZES.md, 
    paddingVertical: SIZES.sm, 
    gap: SIZES.xs 
  },
  editCoverText: { 
    ...TYPOGRAPHY.caption,
    color: COLORS.white 
  },
  settingsButton: { 
    backgroundColor: 'rgba(0,0,0,0.4)', 
    width: 40, 
    height: 40, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  avatarContainer: { 
    position: 'absolute', 
    bottom: -60, 
    left: SIZES.lg 
  },
  avatar: { 
    width: 100, 
    height: 100, 
    borderRadius: 0, 
    borderWidth: 2, 
    borderColor: COLORS.white, 
    backgroundColor: COLORS.surface 
  },
  editAvatarButton: { 
    position: 'absolute', 
    bottom: 0, 
    right: 0, 
    backgroundColor: COLORS.black, 
    width: 28, 
    height: 28, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  
  // Profil Bilgileri
  profileInfo: { 
    marginTop: 80, 
    paddingHorizontal: SIZES.lg, 
    marginBottom: SIZES.lg 
  },
  profileName: { 
    ...TYPOGRAPHY.title2,
    marginBottom: SIZES.xs 
  },
  titleText: { 
    ...TYPOGRAPHY.caption,
    color: COLORS.grayMedium,
    marginBottom: SIZES.xs 
  },
  profileBio: { 
    ...TYPOGRAPHY.body,
    color: COLORS.grayDark,
    lineHeight: 20 
  },
  
  // İstatistik
  statsContainer: { 
    flexDirection: 'row', 
    justifyContent: 'space-around', 
    paddingVertical: SIZES.md,
    marginHorizontal: SIZES.lg,
    marginBottom: SIZES.xl,
    borderTopWidth: 0.5,
    borderTopColor: COLORS.grayLight,
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.grayLight,
  },
  statItem: { 
    alignItems: 'center', 
    paddingVertical: SIZES.sm 
  },
  statNumber: { 
    ...TYPOGRAPHY.title3,
    marginBottom: SIZES.xs 
  },
  statLabel: { 
    ...TYPOGRAPHY.caption,
    color: COLORS.grayMedium 
  },
  statDivider: { 
    width: 0.5, 
    backgroundColor: COLORS.grayLight 
  },
  
  // Bilgi Kartı Stilleri
  infoCard: {
    marginHorizontal: SIZES.lg,
    marginBottom: SIZES.md,
    padding: SIZES.md,
    borderWidth: 0.5,
    borderColor: COLORS.grayLight,
    backgroundColor: COLORS.white,
  },
  infoCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.sm,
    marginBottom: SIZES.sm,
  },
  infoCardTitle: {
    ...TYPOGRAPHY.caption,
    fontSize: 11,
    letterSpacing: 1,
  },
  infoCardPreview: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SIZES.md,
    marginTop: SIZES.xs,
  },
  previewText: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.grayMedium,
  },
  previewTag: {
    paddingHorizontal: SIZES.sm,
    paddingVertical: 2,
    borderWidth: 0.5,
    borderColor: COLORS.grayLight,
  },
  previewTagText: {
    ...TYPOGRAPHY.caption,
    fontSize: 9,
  },
  
  // Section Header
  sectionHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingHorizontal: SIZES.lg, 
    marginBottom: SIZES.md 
  },
  sectionTitle: { 
    ...TYPOGRAPHY.caption,
    color: COLORS.grayMedium 
  },
  sectionLink: { 
    ...TYPOGRAPHY.caption,
    color: COLORS.black 
  },
  
  // Aktif Tarz Kartı
  activeStyleCard: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginHorizontal: SIZES.lg, 
    marginBottom: SIZES.lg, 
    paddingVertical: SIZES.md,
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.grayLight,
  },
  activeStyleLeft: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: SIZES.md 
  },
  activeStyleIcon: { 
    fontSize: 32 
  },
  activeStyleName: { 
    ...TYPOGRAPHY.body,
    fontWeight: '500' 
  },
  activeStyleRank: { 
    ...TYPOGRAPHY.caption,
    color: COLORS.grayMedium 
  },
  activeStyleRight: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: SIZES.sm 
  },
  activeStylePercentage: { 
    ...TYPOGRAPHY.body,
    fontWeight: '500' 
  },
  
  // Identity Grid (Ana Ekran)
  identityGrid: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    paddingHorizontal: SIZES.lg, 
    gap: SIZES.md, 
    marginBottom: SIZES.xl 
  },
  identityCard: { 
    width: (width - (SIZES.lg * 2 + SIZES.md)) / 2, 
    backgroundColor: COLORS.surface, 
    padding: SIZES.lg, 
    alignItems: 'center',
    borderWidth: 0.5,
    borderColor: COLORS.grayLight,
  },
  identityTitle: { 
    ...TYPOGRAPHY.caption,
    marginTop: SIZES.sm,
    marginBottom: SIZES.xs 
  },
  identityCount: { 
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.grayMedium 
  },
  
  // AI Kombin Öneri Butonu
  aiSuggestionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: SIZES.lg,
    marginTop: SIZES.md,
    marginBottom: SIZES.lg,
    padding: SIZES.md,
    backgroundColor: COLORS.black,
    gap: SIZES.md,
  },
  aiSuggestionText: {
    flex: 1,
  },
  aiSuggestionTitle: {
    ...TYPOGRAPHY.caption,
    fontSize: 10,
    letterSpacing: 1,
    color: COLORS.white,
  },
  aiSuggestionSubtitle: {
    ...TYPOGRAPHY.bodySmall,
    fontSize: 9,
    color: COLORS.grayMedium,
    marginTop: 2,
  },
  
  // Tüm Tarzlar
  allStylesSection: { 
    paddingHorizontal: SIZES.lg, 
    marginTop: SIZES.md,
    marginBottom: SIZES.xl,
  },
  allStylesTitle: { 
    ...TYPOGRAPHY.caption,
    marginBottom: SIZES.md 
  },
  miniStyleItem: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingVertical: SIZES.md,
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.grayLight,
  },
  miniStyleLeft: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: SIZES.md 
  },
  miniStyleIcon: { 
    fontSize: 24 
  },
  miniStyleName: { 
    ...TYPOGRAPHY.body,
    fontWeight: '500' 
  },
  miniStyleRank: { 
    ...TYPOGRAPHY.caption,
    color: COLORS.grayMedium 
  },
  miniStylePercentage: { 
    ...TYPOGRAPHY.body,
    fontWeight: '500' 
  },

  // ============================================================
  // 📌 MODAL STILLERI
  // ============================================================
  modalOverlay: { 
    flex: 1, 
    backgroundColor: 'rgba(0,0,0,0.8)', 
    justifyContent: 'flex-end' 
  },
  modalContent: { 
    backgroundColor: COLORS.white, 
    padding: SIZES.lg, 
    width: width, 
    maxHeight: height * 0.9 
  },
  modalHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: SIZES.lg 
  },
  modalTitle: { 
    ...TYPOGRAPHY.title3 
  },
  
  // Form Stilleri
  rowInput: { flexDirection: 'row', marginBottom: SIZES.md },
  inputGroup: { marginBottom: SIZES.md },
  inputLabel: { ...TYPOGRAPHY.bodySmall, marginBottom: SIZES.xs },
  input: { 
    ...TYPOGRAPHY.body, 
    backgroundColor: COLORS.surface, 
    paddingHorizontal: SIZES.md, 
    paddingVertical: SIZES.sm,
    borderWidth: 0.5,
    borderColor: COLORS.grayLight,
  },
  bioInput: { minHeight: 80, textAlignVertical: 'top' },
  saveButton: { 
    backgroundColor: COLORS.black, 
    paddingVertical: SIZES.md, 
    alignItems: 'center', 
    marginTop: SIZES.md 
  },
  saveButtonText: { ...TYPOGRAPHY.button, color: COLORS.white },
  
  // Premium Save Button
  saveButtonPremium: {
    flex: 1.5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COLORS.black,
    paddingVertical: 14,
    borderWidth: 0.5,
    borderColor: COLORS.black,
    elevation: 2,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  saveButtonDisabled: {
    opacity: 0.6,
    elevation: 0,
    shadowOpacity: 0,
  },
  saveButtonTextPremium: {
    ...TYPOGRAPHY.button,
    fontSize: 12,
    color: COLORS.white,
    letterSpacing: 1.5,
    fontWeight: '600',
  },
  
  // Tarz Seçim Modal
  styleModalContainer: { backgroundColor: COLORS.white, width: width, maxHeight: height * 0.8, padding: SIZES.lg },
  styleModalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SIZES.lg, paddingBottom: SIZES.md, borderBottomWidth: 0.5, borderBottomColor: COLORS.grayLight },
  styleModalTitle: { ...TYPOGRAPHY.title3 },
  styleModalList: { gap: SIZES.md },
  styleModalItem: { flexDirection: 'row', alignItems: 'center', padding: SIZES.md, backgroundColor: COLORS.surface, gap: SIZES.md },
  styleModalItemActive: { borderWidth: 0.5, borderColor: COLORS.black },
  styleModalIcon: { fontSize: 24 },
  styleModalInfo: { flex: 1 },
  styleModalName: { ...TYPOGRAPHY.body, fontWeight: '500' },
  styleModalNameActive: { fontWeight: '600' },
  styleModalRankBadge: { marginTop: 2 },
  styleModalRankText: { ...TYPOGRAPHY.caption },
  styleModalPercentage: { marginRight: SIZES.sm },
  styleModalPercentageText: { ...TYPOGRAPHY.body, fontWeight: '500' },
  
  // Ayarlar Menüsü
  settingsMenuContainer: { backgroundColor: COLORS.white, width: width, maxHeight: height * 0.8 },
  settingsMenuHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: SIZES.lg, borderBottomWidth: 0.5, borderBottomColor: COLORS.grayLight },
  settingsMenuTitle: { ...TYPOGRAPHY.title3 },
  settingsMenuSection: { marginBottom: SIZES.md, paddingHorizontal: SIZES.lg },
  settingsMenuSectionTitle: { ...TYPOGRAPHY.caption, marginBottom: SIZES.sm },
  settingsMenuItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: SIZES.md },
  settingsMenuItemLeft: { flexDirection: 'row', alignItems: 'center', gap: SIZES.md },
  settingsMenuItemText: { ...TYPOGRAPHY.body },
  settingsMenuItemValue: { ...TYPOGRAPHY.bodySmall, color: COLORS.grayMedium },
  logoutMenuItem: { marginTop: SIZES.sm, borderTopWidth: 0.5, borderTopColor: COLORS.grayLight, paddingTop: SIZES.md },
  logoutMenuText: { color: COLORS.error },
  themeToggle: { paddingHorizontal: SIZES.md, paddingVertical: 2, borderWidth: 0.5, borderColor: COLORS.grayLight },
  themeToggleActive: { backgroundColor: COLORS.black },
  themeToggleText: { ...TYPOGRAPHY.caption },
  themeToggleTextActive: { color: COLORS.white },
  
  // Beden ölçüleri grid stilleri
  sizeOptionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: SIZES.md,
  },
  sizeOption: {
    width: 50,
    paddingVertical: 10,
    alignItems: 'center',
    borderWidth: 0.5,
    borderColor: COLORS.grayLight,
  },
  sizeOptionActive: {
    borderColor: COLORS.black,
    backgroundColor: COLORS.black,
  },
  sizeOptionText: {
    ...TYPOGRAPHY.body,
    fontSize: 14,
    color: COLORS.black,
  },
  sizeOptionTextActive: {
    color: COLORS.white,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: SIZES.md,
    marginTop: SIZES.lg,
    marginBottom: SIZES.lg,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: SIZES.md,
    alignItems: 'center',
    borderWidth: 0.5,
    borderColor: COLORS.grayLight,
  },
  cancelButtonText: {
    ...TYPOGRAPHY.caption,
    fontSize: 12,
  },
  
  // Tag container
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SIZES.xs,
    marginBottom: SIZES.sm,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: SIZES.sm,
    paddingVertical: 4,
    borderWidth: 0.5,
    borderColor: COLORS.grayLight,
  },
  tagText: {
    ...TYPOGRAPHY.caption,
    fontSize: 12,
  },
  addRow: {
    flexDirection: 'row',
    gap: SIZES.sm,
    marginBottom: SIZES.md,
  },
  addInput: {
    flex: 1,
    borderWidth: 0.5,
    borderColor: COLORS.grayLight,
    paddingHorizontal: SIZES.md,
    paddingVertical: SIZES.sm,
    ...TYPOGRAPHY.bodySmall,
  },
  addButton: {
    paddingHorizontal: SIZES.md,
    justifyContent: 'center',
    borderWidth: 0.5,
    borderColor: COLORS.black,
  },
  addButtonText: {
    fontSize: 18,
    color: COLORS.black,
  },
});

export default StilimScreen;