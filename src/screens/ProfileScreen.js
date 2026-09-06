// 📁 src/screens/ProfileScreen.js - REVİZE EDİLMİŞ VERSİYON
import React, { useState, useEffect, useCallback, useMemo, memo } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  SafeAreaView, 
  StatusBar,
  ScrollView,
  TextInput,
  Modal,
  Alert,
  ActivityIndicator,
  Platform,
  RefreshControl,
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, TYPOGRAPHY, SIZES, SPACING } from '../constants/Theme';
import { auth } from '../config/firebase';
import { wardrobeAPI } from '../services/api';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ============================================================
// 📌 YARDIMCI BİLEŞENLER (Memoized)
// ============================================================

// Modal Input Component
const ModalInput = memo(({ 
  label, 
  placeholder, 
  value, 
  onChangeText, 
  keyboardType = 'default',
  secureTextEntry = false 
}) => (
  <View style={styles.inputGroup}>
    {label && <Text style={styles.inputLabel}>{label}</Text>}
    <TextInput
      style={styles.input}
      placeholder={placeholder}
      placeholderTextColor={COLORS.grayMedium}
      value={value}
      onChangeText={onChangeText}
      keyboardType={keyboardType}
      secureTextEntry={secureTextEntry}
      accessibilityLabel={label || placeholder}
      accessibilityHint={`${placeholder} giriş alanı`}
    />
  </View>
));

ModalInput.displayName = 'ModalInput';

// Size Option Component
const SizeOption = memo(({ size, selected, onPress }) => (
  <TouchableOpacity
    style={[styles.sizeOption, selected && styles.sizeOptionActive]}
    onPress={onPress}
    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
    accessibilityLabel={`Beden ${size}`}
    accessibilityRole="button"
    accessibilityState={{ selected }}
  >
    <Text style={[styles.sizeOptionText, selected && styles.sizeOptionTextActive]}>
      {size}
    </Text>
  </TouchableOpacity>
));

SizeOption.displayName = 'SizeOption';

// Tag Component
const Tag = memo(({ label, onRemove }) => (
  <View style={styles.tag}>
    <Text style={styles.tagText}>{label}</Text>
    {onRemove && (
      <TouchableOpacity
        onPress={onRemove}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        accessibilityLabel={`${label} kaldır`}
        accessibilityRole="button"
      >
        <Ionicons name="close-circle" size={16} color={COLORS.grayMedium} />
      </TouchableOpacity>
    )}
  </View>
));

Tag.displayName = 'Tag';

// Stat Card Component
const StatCard = memo(({ icon, value, label, onPress }) => (
  <TouchableOpacity
    style={styles.statCard}
    onPress={onPress}
    accessibilityLabel={`${label}: ${value}`}
    accessibilityRole="button"
  >
    <Ionicons name={icon} size={24} color={COLORS.black} />
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </TouchableOpacity>
));

StatCard.displayName = 'StatCard';

// ============================================================
// 📌 ANA BİLEŞEN
// ============================================================
const ProfileScreen = ({ navigation }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(null);
  const [stats, setStats] = useState({ wardrobeCount: 0, favoriteCount: 0, outfitCount: 0 });
  const [isOffline, setIsOffline] = useState(false);
  
  // Beden ölçüleri
  const [bodyMeasurements, setBodyMeasurements] = useState({
    height: '',
    weight: '',
    topSize: '',
    bottomSize: '',
    shoeSize: '',
    dressSize: '',
  });
  
  // Stil tercihleri
  const [stylePreferences, setStylePreferences] = useState({
    favoriteColors: [],
    preferredBrands: [],
    avoidedStyles: [],
    favoriteCategories: [],
  });
  
  const [tempColor, setTempColor] = useState('');
  const [tempBrand, setTempBrand] = useState('');

  const sizeOptions = useMemo(() => ['XS', 'S', 'M', 'L', 'XL', 'XXL'], []);

  // ============================================================
  // 📌 FIREBASE AUTH
  // ============================================================
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        loadProfile(currentUser);
        loadStats(currentUser);
      } else {
        setLoading(false);
      }
    });
    return unsubscribe;
  }, []);

  // ============================================================
  // 📌 VERİ YÜKLEME (Memoized)
  // ============================================================
  const loadProfile = useCallback(async (currentUser) => {
    try {
      // Offline kontrolü
      const isConnected = await checkNetworkStatus();
      setIsOffline(!isConnected);

      const savedProfile = await AsyncStorage.getItem('@user_profile');
      if (savedProfile) {
        const parsed = JSON.parse(savedProfile);
        setProfile(parsed);
        if (parsed.bodyMeasurements) setBodyMeasurements(parsed.bodyMeasurements);
        if (parsed.stylePreferences) setStylePreferences(parsed.stylePreferences);
      } else {
        // Varsayılan profil
        const defaultProfile = {
          displayName: currentUser?.displayName || currentUser?.email?.split('@')[0] || 'Kullanıcı',
          email: currentUser?.email || '',
          bodyMeasurements: { height: '', weight: '', topSize: '', bottomSize: '', shoeSize: '', dressSize: '' },
          stylePreferences: { favoriteColors: [], preferredBrands: [], avoidedStyles: [], favoriteCategories: [] }
        };
        setProfile(defaultProfile);
        setBodyMeasurements(defaultProfile.bodyMeasurements);
        setStylePreferences(defaultProfile.stylePreferences);
      }
    } catch (error) {
      console.error('Profil yüklenemedi:', error);
      // Hata durumunda varsayılan profil
      const fallbackProfile = {
        displayName: currentUser?.email?.split('@')[0] || 'Kullanıcı',
        email: currentUser?.email || '',
        bodyMeasurements: { height: '', weight: '', topSize: '', bottomSize: '', shoeSize: '', dressSize: '' },
        stylePreferences: { favoriteColors: [], preferredBrands: [], avoidedStyles: [], favoriteCategories: [] }
      };
      setProfile(fallbackProfile);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadStats = useCallback(async (currentUser) => {
    try {
      if (!currentUser) return;
      
      // Offline kontrol
      const isConnected = await checkNetworkStatus();
      if (!isConnected) {
        // Offline iken cached verileri göster
        const cachedStats = await AsyncStorage.getItem('@user_stats');
        if (cachedStats) {
          setStats(JSON.parse(cachedStats));
        }
        return;
      }

      const wardrobeResponse = await wardrobeAPI.getAllItems(currentUser.uid);
      let wardrobeCount = 0;
      let favoriteCount = 0;
      
      if (wardrobeResponse && wardrobeResponse.success) {
        const allItems = [];
        if (wardrobeResponse.categories) {
          Object.values(wardrobeResponse.categories).forEach(items => {
            if (Array.isArray(items)) {
              allItems.push(...items);
              favoriteCount += items.filter(item => item.is_star).length;
            }
          });
        }
        wardrobeCount = allItems.length;
      }
      
      const newStats = {
        wardrobeCount,
        favoriteCount,
        outfitCount: 0
      };
      
      setStats(newStats);
      // Cache stats
      await AsyncStorage.setItem('@user_stats', JSON.stringify(newStats));
    } catch (error) {
      console.error('İstatistikler yüklenemedi:', error);
      // Cache'den getir
      try {
        const cachedStats = await AsyncStorage.getItem('@user_stats');
        if (cachedStats) {
          setStats(JSON.parse(cachedStats));
        }
      } catch (cacheError) {
        console.error('Cache okunamadı:', cacheError);
      }
    }
  }, []);

  // Network kontrolü
  const checkNetworkStatus = async () => {
    try {
      // Basit network kontrolü
      const response = await fetch('https://www.google.com', { 
        method: 'HEAD',
        timeout: 5000 
      });
      return response.ok;
    } catch {
      return false;
    }
  };

  // ============================================================
  // 📌 KAYDETME İŞLEMLERİ (Memoized)
  // ============================================================
  const handleSaveBodyMeasurements = useCallback(async () => {
    try {
      const updatedProfile = {
        ...profile,
        bodyMeasurements: {
          height: bodyMeasurements.height || '',
          weight: bodyMeasurements.weight || '',
          topSize: bodyMeasurements.topSize || '',
          bottomSize: bodyMeasurements.bottomSize || '',
          shoeSize: bodyMeasurements.shoeSize || '',
          dressSize: bodyMeasurements.dressSize || '',
        }
      };
      
      setProfile(updatedProfile);
      await AsyncStorage.setItem('@user_profile', JSON.stringify(updatedProfile));
      
      Alert.alert(
        'Başarılı', 
        'Beden ölçüleriniz kaydedildi.',
        [{ text: 'Tamam' }]
      );
      setModalVisible(null);
    } catch (error) {
      Alert.alert('Hata', 'Kaydedilemedi: ' + error.message);
    }
  }, [profile, bodyMeasurements]);

  const handleSaveStylePreferences = useCallback(async () => {
    try {
      const updatedProfile = {
        ...profile,
        stylePreferences: {
          favoriteColors: stylePreferences.favoriteColors || [],
          preferredBrands: stylePreferences.preferredBrands || [],
          avoidedStyles: stylePreferences.avoidedStyles || [],
          favoriteCategories: stylePreferences.favoriteCategories || [],
        }
      };
      
      setProfile(updatedProfile);
      await AsyncStorage.setItem('@user_profile', JSON.stringify(updatedProfile));
      
      Alert.alert(
        'Başarılı', 
        'Stil tercihleriniz kaydedildi.',
        [{ text: 'Tamam' }]
      );
      setModalVisible(null);
    } catch (error) {
      Alert.alert('Hata', 'Kaydedilemedi: ' + error.message);
    }
  }, [profile, stylePreferences]);

  // ============================================================
  // 📌 YARDIMCI FONKSİYONLAR (Memoized)
  // ============================================================
  const addToArray = useCallback((array, setArray, value, setTemp) => {
    if (value?.trim() && !array.includes(value.trim())) {
      setArray([...array, value.trim()]);
      setTemp('');
    }
  }, []);

  const removeFromArray = useCallback((array, setArray, value) => {
    setArray(array.filter(item => item !== value));
  }, []);

  const handleLogout = useCallback(async () => {
    Alert.alert(
      'Çıkış Yap',
      'Çıkış yapmak istediğinize emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Çıkış Yap',
          style: 'destructive',
          onPress: async () => {
            try {
              await auth.signOut();
              await AsyncStorage.multiRemove(['modaverse_token', 'modaverse_user', '@user_profile']);
              navigation?.navigate('Auth');
            } catch (error) {
              Alert.alert('Hata', 'Çıkış yapılamadı.');
            }
          }
        }
      ]
    );
  }, [navigation]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    if (user) {
      await loadProfile(user);
      await loadStats(user);
    }
    setRefreshing(false);
  }, [user, loadProfile, loadStats]);

  // ============================================================
  // 📌 RENDER
  // ============================================================
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.black} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>PROFİL</Text>
        <TouchableOpacity 
          style={styles.settingsButton} 
          onPress={handleLogout}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          accessibilityLabel="Çıkış yap"
          accessibilityRole="button"
        >
          <Ionicons name="log-out-outline" size={20} color={COLORS.black} />
        </TouchableOpacity>
      </View>

      {/* Offline Banner */}
      {isOffline && (
        <View style={styles.offlineBanner}>
          <Ionicons name="wifi-outline" size={16} color={COLORS.white} />
          <Text style={styles.offlineText}>Çevrimdışı - Veriler yerel olarak gösteriliyor</Text>
        </View>
      )}

      <ScrollView 
        contentContainerStyle={styles.scrollContent} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            colors={[COLORS.black]}
            tintColor={COLORS.black}
          />
        }
      >
        {/* Kullanıcı Bilgileri */}
        <View style={styles.userSection}>
          <View style={styles.avatarContainer}>
            <Ionicons name="person-circle" size={64} color={COLORS.black} />
          </View>
          <Text style={styles.userName}>{profile?.displayName || user?.email?.split('@')[0] || 'Kullanıcı'}</Text>
          <Text style={styles.userEmail}>{user?.email}</Text>
        </View>

        {/* İstatistik Kartları */}
        <View style={styles.statsContainer}>
          <StatCard
            icon="grid-outline"
            value={stats.wardrobeCount}
            label="Gardırop"
            onPress={() => navigation?.navigate('Koleksiyonum')}
          />
          <StatCard
            icon="heart-outline"
            value={stats.favoriteCount}
            label="Favori"
            onPress={() => navigation?.navigate('Favorites')}
          />
          <StatCard
            icon="bag-outline"
            value={stats.outfitCount}
            label="Kombin"
            onPress={() => navigation?.navigate('Orders')}
          />
        </View>

        {/* Beden Ölçüleri */}
        <TouchableOpacity 
          style={styles.sectionCard} 
          onPress={() => setModalVisible('body')}
          accessibilityLabel="Beden ölçülerini düzenle"
          accessibilityRole="button"
        >
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>BEDEN ÖLÇÜLERİ</Text>
            <Ionicons name="chevron-forward" size={18} color={COLORS.grayMedium} />
          </View>
          <View style={styles.measurementsPreview}>
            {bodyMeasurements.height || bodyMeasurements.topSize ? (
              <>
                <Text style={styles.previewText}>
                  {bodyMeasurements.height ? `${bodyMeasurements.height} cm` : 'Boy: —'}
                </Text>
                <Text style={styles.previewText}>
                  {bodyMeasurements.topSize || 'Beden: —'}
                </Text>
              </>
            ) : (
              <Text style={styles.previewTextEmpty}>Ölçü eklenmemiş</Text>
            )}
          </View>
        </TouchableOpacity>

        {/* Stil Tercihleri */}
        <TouchableOpacity 
          style={styles.sectionCard} 
          onPress={() => setModalVisible('style')}
          accessibilityLabel="Stil tercihlerini düzenle"
          accessibilityRole="button"
        >
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>STİL TERCIHLERI</Text>
            <Ionicons name="chevron-forward" size={18} color={COLORS.grayMedium} />
          </View>
          <View style={styles.preferencesPreview}>
            {stylePreferences?.favoriteColors?.length > 0 ? (
              stylePreferences.favoriteColors.slice(0, 3).map((color, i) => (
                <Tag key={i} label={color} />
              ))
            ) : (
              <Text style={styles.previewTextEmpty}>Tercih eklenmedi</Text>
            )}
          </View>
        </TouchableOpacity>
      </ScrollView>

      {/* BEDEN ÖLÇÜLERİ MODAL */}
      <Modal 
        visible={modalVisible === 'body'} 
        animationType="slide" 
        transparent
        onRequestClose={() => setModalVisible(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Beden Ölçüleri</Text>
            
            <ModalInput
              placeholder="Boy (cm)"
              value={bodyMeasurements.height?.toString()}
              onChangeText={(text) => setBodyMeasurements({...bodyMeasurements, height: text})}
              keyboardType="numeric"
            />
            
            <ModalInput
              placeholder="Kilo (kg)"
              value={bodyMeasurements.weight?.toString()}
              onChangeText={(text) => setBodyMeasurements({...bodyMeasurements, weight: text})}
              keyboardType="numeric"
            />
            
            <View style={styles.rowInputs}>
              <View style={styles.pickerContainer}>
                <Text style={styles.inputLabel}>Üst Beden</Text>
                <View style={styles.sizeOptions}>
                  {sizeOptions.map(size => (
                    <SizeOption
                      key={size}
                      size={size}
                      selected={bodyMeasurements.topSize === size}
                      onPress={() => setBodyMeasurements({...bodyMeasurements, topSize: size})}
                    />
                  ))}
                </View>
              </View>
              
              <View style={styles.pickerContainer}>
                <Text style={styles.inputLabel}>Alt Beden</Text>
                <View style={styles.sizeOptions}>
                  {sizeOptions.map(size => (
                    <SizeOption
                      key={size}
                      size={size}
                      selected={bodyMeasurements.bottomSize === size}
                      onPress={() => setBodyMeasurements({...bodyMeasurements, bottomSize: size})}
                    />
                  ))}
                </View>
              </View>
            </View>
            
            <ModalInput
              placeholder="Ayakkabı Numarası"
              value={bodyMeasurements.shoeSize?.toString()}
              onChangeText={(text) => setBodyMeasurements({...bodyMeasurements, shoeSize: text})}
              keyboardType="numeric"
            />
            
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={styles.cancelButton} 
                onPress={() => setModalVisible(null)}
                accessibilityLabel="İptal"
                accessibilityRole="button"
              >
                <Text style={styles.cancelButtonText}>İPTAL</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.saveButton} 
                onPress={handleSaveBodyMeasurements}
                accessibilityLabel="Kaydet"
                accessibilityRole="button"
              >
                <Text style={styles.saveButtonText}>KAYDET</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* STİL TERCIHLERI MODAL */}
      <Modal 
        visible={modalVisible === 'style'} 
        animationType="slide" 
        transparent
        onRequestClose={() => setModalVisible(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Stil Tercihleri</Text>
            
            <Text style={styles.inputLabel}>Favori Renkler</Text>
            <View style={styles.tagContainer}>
              {(stylePreferences.favoriteColors || []).map((color, i) => (
                <Tag
                  key={i}
                  label={color}
                  onRemove={() => removeFromArray(
                    stylePreferences.favoriteColors, 
                    setStylePreferences, 
                    color
                  )}
                />
              ))}
            </View>
            <View style={styles.addRow}>
              <TextInput 
                style={styles.addInput}
                placeholder="Renk ekle..."
                placeholderTextColor={COLORS.grayMedium}
                value={tempColor}
                onChangeText={setTempColor}
                accessibilityLabel="Renk ekle"
                accessibilityHint="Favori renk eklemek için yazın"
              />
              <TouchableOpacity 
                style={styles.addButton} 
                onPress={() => addToArray(
                  stylePreferences.favoriteColors, 
                  setStylePreferences, 
                  tempColor, 
                  setTempColor
                )}
                accessibilityLabel="Renk ekle"
                accessibilityRole="button"
              >
                <Text style={styles.addButtonText}>+</Text>
              </TouchableOpacity>
            </View>
            
            <Text style={styles.inputLabel}>Favori Markalar</Text>
            <View style={styles.tagContainer}>
              {(stylePreferences.preferredBrands || []).map((brand, i) => (
                <Tag
                  key={i}
                  label={brand}
                  onRemove={() => removeFromArray(
                    stylePreferences.preferredBrands, 
                    setStylePreferences, 
                    brand
                  )}
                />
              ))}
            </View>
            <View style={styles.addRow}>
              <TextInput 
                style={styles.addInput}
                placeholder="Marka ekle..."
                placeholderTextColor={COLORS.grayMedium}
                value={tempBrand}
                onChangeText={setTempBrand}
                accessibilityLabel="Marka ekle"
                accessibilityHint="Favori marka eklemek için yazın"
              />
              <TouchableOpacity 
                style={styles.addButton} 
                onPress={() => addToArray(
                  stylePreferences.preferredBrands, 
                  setStylePreferences, 
                  tempBrand, 
                  setTempBrand
                )}
                accessibilityLabel="Marka ekle"
                accessibilityRole="button"
              >
                <Text style={styles.addButtonText}>+</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={styles.cancelButton} 
                onPress={() => setModalVisible(null)}
                accessibilityLabel="İptal"
                accessibilityRole="button"
              >
                <Text style={styles.cancelButtonText}>İPTAL</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.saveButton} 
                onPress={handleSaveStylePreferences}
                accessibilityLabel="Kaydet"
                accessibilityRole="button"
              >
                <Text style={styles.saveButtonText}>KAYDET</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

// ============================================================
// 📌 STYLES
// ============================================================
const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: COLORS.white 
  },
  loadingContainer: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },

  // HEADER
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SIZES.lg || 20,
    paddingTop: Platform.OS === 'ios' ? 12 : SIZES.md || 16,
    paddingBottom: SIZES.md || 16,
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.grayLight || '#E5E5E5',
  },
  title: { 
    ...TYPOGRAPHY.caption, 
    fontSize: 16, 
    letterSpacing: 2 
  },
  settingsButton: { 
    padding: SIZES.xs || 8 
  },

  // OFFLINE BANNER
  offlineBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.black || '#2D2D2D',
    paddingVertical: SIZES.xs || 8,
    paddingHorizontal: SIZES.md || 16,
    gap: SIZES.xs || 8,
  },
  offlineText: {
    ...TYPOGRAPHY.caption,
    fontSize: 10,
    color: COLORS.white,
  },

  // SCROLL CONTENT
  scrollContent: { 
    paddingBottom: SIZES.xl || 40 
  },

  // USER SECTION
  userSection: { 
    alignItems: 'center', 
    paddingVertical: SIZES.xl || 40 
  },
  avatarContainer: { 
    marginBottom: SIZES.sm || 12 
  },
  userName: { 
    ...TYPOGRAPHY.bodyMedium, 
    fontWeight: '500' 
  },
  userEmail: { 
    ...TYPOGRAPHY.bodySmall, 
    color: COLORS.grayMedium || '#999999', 
    marginTop: 2 
  },

  // STATS
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: SIZES.lg || 20,
    marginBottom: SIZES.xl || 40,
  },
  statCard: { 
    alignItems: 'center',
    minWidth: SCREEN_WIDTH * 0.2,
  },
  statValue: { 
    ...TYPOGRAPHY.bodyLarge, 
    fontWeight: '600', 
    marginTop: SIZES.xs || 8 
  },
  statLabel: { 
    ...TYPOGRAPHY.caption, 
    fontSize: 10, 
    color: COLORS.grayMedium || '#999999', 
    marginTop: 2 
  },

  // SECTION CARDS
  sectionCard: {
    marginHorizontal: SIZES.lg || 20,
    marginBottom: SIZES.md || 16,
    padding: SIZES.md || 16,
    borderWidth: 0.5,
    borderColor: COLORS.grayLight || '#E5E5E5',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.sm || 12,
  },
  sectionTitle: { 
    ...TYPOGRAPHY.caption, 
    fontSize: 11, 
    letterSpacing: 1 
  },

  // PREVIEW
  measurementsPreview: { 
    flexDirection: 'row', 
    gap: SIZES.md || 16 
  },
  previewText: { 
    ...TYPOGRAPHY.bodySmall, 
    color: COLORS.grayMedium || '#999999' 
  },
  previewTextEmpty: { 
    ...TYPOGRAPHY.bodySmall, 
    color: COLORS.grayMedium || '#999999',
    fontStyle: 'italic' 
  },
  preferencesPreview: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    gap: SIZES.xs || 8 
  },

  // MODAL
  modalOverlay: { 
    flex: 1, 
    backgroundColor: 'rgba(0,0,0,0.5)', 
    justifyContent: 'flex-end' 
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: SIZES.lg || 20,
    maxHeight: '80%',
  },
  modalTitle: { 
    ...TYPOGRAPHY.bodyMedium, 
    textAlign: 'center', 
    marginBottom: SIZES.lg || 20 
  },

  // INPUTS
  inputGroup: {
    marginBottom: SIZES.md || 16,
  },
  input: {
    borderWidth: 0.5,
    borderColor: COLORS.grayLight || '#E5E5E5',
    paddingHorizontal: SIZES.md || 16,
    paddingVertical: SIZES.sm || 12,
    ...TYPOGRAPHY.bodySmall,
  },
  inputLabel: { 
    ...TYPOGRAPHY.caption, 
    marginBottom: SIZES.xs || 8, 
    color: COLORS.grayMedium || '#999999' 
  },
  rowInputs: { 
    flexDirection: 'row', 
    gap: SIZES.md || 16, 
    marginBottom: SIZES.md || 16 
  },
  pickerContainer: { 
    flex: 1 
  },

  // SIZE OPTIONS
  sizeOptions: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    gap: 8 
  },
  sizeOption: { 
    width: 40, 
    paddingVertical: 6, 
    alignItems: 'center', 
    borderWidth: 0.5, 
    borderColor: COLORS.grayLight || '#E5E5E5' 
  },
  sizeOptionActive: { 
    borderColor: COLORS.black, 
    backgroundColor: COLORS.black 
  },
  sizeOptionText: { 
    ...TYPOGRAPHY.caption, 
    fontSize: 11, 
    color: COLORS.black 
  },
  sizeOptionTextActive: { 
    color: COLORS.white 
  },

  // MODAL BUTTONS
  modalButtons: { 
    flexDirection: 'row', 
    gap: SIZES.md || 16, 
    marginTop: SIZES.lg || 20 
  },
  cancelButton: {
    flex: 1,
    paddingVertical: SIZES.md || 16,
    alignItems: 'center',
    borderWidth: 0.5,
    borderColor: COLORS.grayLight || '#E5E5E5',
  },
  cancelButtonText: { 
    ...TYPOGRAPHY.caption, 
    fontSize: 11 
  },
  saveButton: { 
    flex: 1, 
    paddingVertical: SIZES.md || 16, 
    alignItems: 'center', 
    backgroundColor: COLORS.black 
  },
  saveButtonText: { 
    ...TYPOGRAPHY.caption, 
    fontSize: 11, 
    color: COLORS.white 
  },

  // TAGS
  tagContainer: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    gap: SIZES.xs || 8, 
    marginBottom: SIZES.sm || 12 
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: SIZES.sm || 12,
    paddingVertical: 4,
    borderWidth: 0.5,
    borderColor: COLORS.grayLight || '#E5E5E5',
  },
  tagText: { 
    ...TYPOGRAPHY.caption, 
    fontSize: 11 
  },

  // ADD ROW
  addRow: { 
    flexDirection: 'row', 
    gap: SIZES.sm || 12, 
    marginBottom: SIZES.md || 16 
  },
  addInput: {
    flex: 1,
    borderWidth: 0.5,
    borderColor: COLORS.grayLight || '#E5E5E5',
    paddingHorizontal: SIZES.md || 16,
    paddingVertical: SIZES.sm || 12,
    ...TYPOGRAPHY.bodySmall,
  },
  addButton: { 
    paddingHorizontal: SIZES.md || 16, 
    justifyContent: 'center', 
    borderWidth: 0.5, 
    borderColor: COLORS.black 
  },
  addButtonText: { 
    fontSize: 18, 
    color: COLORS.black 
  },
});

export default ProfileScreen;