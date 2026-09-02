// 📁 src/screens/ProfileScreen.js - TAM REVİZE (Backend Entegre)
import React, { useState, useEffect } from 'react';
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
  RefreshControl
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, TYPOGRAPHY, SIZES } from '../constants/Theme';
import { auth } from '../config/firebase';
import { wardrobeAPI, systemAPI } from '../services/api';

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

  const sizeOptions = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

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
  // 📌 VERİ YÜKLEME
  // ============================================================
  const loadProfile = async (currentUser) => {
    try {
      // AsyncStorage'dan profil verilerini yükle (geçici)
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
    }
  };

  const loadStats = async (currentUser) => {
    try {
      if (!currentUser) return;
      
      // Gardırop sayısını getir
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
      
      setStats({
        wardrobeCount,
        favoriteCount,
        outfitCount: 0 // TODO: Backend'den çekilecek
      });
    } catch (error) {
      console.error('İstatistikler yüklenemedi:', error);
    }
  };

  // ============================================================
  // 📌 KAYDETME İŞLEMLERİ
  // ============================================================
  const handleSaveBodyMeasurements = async () => {
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
      
      Alert.alert('Başarılı', 'Beden ölçüleriniz kaydedildi.');
      setModalVisible(null);
    } catch (error) {
      Alert.alert('Hata', 'Kaydedilemedi: ' + error.message);
    }
  };

  const handleSaveStylePreferences = async () => {
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
      
      Alert.alert('Başarılı', 'Stil tercihleriniz kaydedildi.');
      setModalVisible(null);
    } catch (error) {
      Alert.alert('Hata', 'Kaydedilemedi: ' + error.message);
    }
  };

  // ============================================================
  // 📌 YARDIMCI FONKSİYONLAR
  // ============================================================
  const addToArray = (array, setArray, value, setTemp) => {
    if (value && !array.includes(value)) {
      setArray([...array, value]);
      setTemp('');
    }
  };

  const removeFromArray = (array, setArray, value) => {
    setArray(array.filter(item => item !== value));
  };

  const handleLogout = async () => {
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
              await AsyncStorage.removeItem('modaverse_token');
              await AsyncStorage.removeItem('modaverse_user');
              navigation?.navigate('Auth');
            } catch (error) {
              Alert.alert('Hata', 'Çıkış yapılamadı.');
            }
          }
        }
      ]
    );
  };

  const onRefresh = async () => {
    setRefreshing(true);
    if (user) {
      await loadProfile(user);
      await loadStats(user);
    }
    setRefreshing(false);
  };

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
        <TouchableOpacity style={styles.settingsButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color={COLORS.black} />
        </TouchableOpacity>
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent} 
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
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
          <TouchableOpacity style={styles.statCard} onPress={() => navigation?.navigate('Koleksiyonum')}>
            <Ionicons name="grid-outline" size={24} color={COLORS.black} />
            <Text style={styles.statValue}>{stats.wardrobeCount}</Text>
            <Text style={styles.statLabel}>Gardırop</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.statCard} onPress={() => navigation?.navigate('Favorites')}>
            <Ionicons name="heart-outline" size={24} color={COLORS.black} />
            <Text style={styles.statValue}>{stats.favoriteCount}</Text>
            <Text style={styles.statLabel}>Favori</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.statCard} onPress={() => navigation?.navigate('Orders')}>
            <Ionicons name="bag-outline" size={24} color={COLORS.black} />
            <Text style={styles.statValue}>{stats.outfitCount}</Text>
            <Text style={styles.statLabel}>Kombin</Text>
          </TouchableOpacity>
        </View>

        {/* Beden Ölçüleri */}
        <TouchableOpacity style={styles.sectionCard} onPress={() => setModalVisible('body')}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>BEDEN ÖLÇÜLERİ</Text>
            <Ionicons name="chevron-forward" size={18} color={COLORS.grayMedium} />
          </View>
          <View style={styles.measurementsPreview}>
            <Text style={styles.previewText}>
              {bodyMeasurements.height ? `${bodyMeasurements.height} cm` : 'Boy: —'}
            </Text>
            <Text style={styles.previewText}>
              {bodyMeasurements.topSize || 'Beden: —'}
            </Text>
          </View>
        </TouchableOpacity>

        {/* Stil Tercihleri */}
        <TouchableOpacity style={styles.sectionCard} onPress={() => setModalVisible('style')}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>STİL TERCIHLERI</Text>
            <Ionicons name="chevron-forward" size={18} color={COLORS.grayMedium} />
          </View>
          <View style={styles.preferencesPreview}>
            {stylePreferences?.favoriteColors?.slice(0, 3).map((color, i) => (
              <View key={i} style={styles.previewTag}>
                <Text style={styles.previewTagText}>{color}</Text>
              </View>
            ))}
            {(!stylePreferences?.favoriteColors || stylePreferences.favoriteColors.length === 0) && (
              <Text style={styles.previewText}>Tercih eklenmedi</Text>
            )}
          </View>
        </TouchableOpacity>
      </ScrollView>

      {/* BEDEN ÖLÇÜLERİ MODAL */}
      <Modal visible={modalVisible === 'body'} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Beden Ölçüleri</Text>
            
            <TextInput 
              style={styles.input}
              placeholder="Boy (cm)"
              placeholderTextColor={COLORS.grayMedium}
              keyboardType="numeric"
              value={bodyMeasurements.height?.toString()}
              onChangeText={(text) => setBodyMeasurements({...bodyMeasurements, height: text})}
            />
            
            <TextInput 
              style={styles.input}
              placeholder="Kilo (kg)"
              placeholderTextColor={COLORS.grayMedium}
              keyboardType="numeric"
              value={bodyMeasurements.weight?.toString()}
              onChangeText={(text) => setBodyMeasurements({...bodyMeasurements, weight: text})}
            />
            
            <View style={styles.rowInputs}>
              <View style={styles.pickerContainer}>
                <Text style={styles.inputLabel}>Üst Beden</Text>
                <View style={styles.sizeOptions}>
                  {sizeOptions.map(size => (
                    <TouchableOpacity 
                      key={size}
                      style={[styles.sizeOption, bodyMeasurements.topSize === size && styles.sizeOptionActive]}
                      onPress={() => setBodyMeasurements({...bodyMeasurements, topSize: size})}
                    >
                      <Text style={[styles.sizeOptionText, bodyMeasurements.topSize === size && styles.sizeOptionTextActive]}>{size}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
              
              <View style={styles.pickerContainer}>
                <Text style={styles.inputLabel}>Alt Beden</Text>
                <View style={styles.sizeOptions}>
                  {sizeOptions.map(size => (
                    <TouchableOpacity 
                      key={size}
                      style={[styles.sizeOption, bodyMeasurements.bottomSize === size && styles.sizeOptionActive]}
                      onPress={() => setBodyMeasurements({...bodyMeasurements, bottomSize: size})}
                    >
                      <Text style={[styles.sizeOptionText, bodyMeasurements.bottomSize === size && styles.sizeOptionTextActive]}>{size}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>
            
            <TextInput 
              style={styles.input}
              placeholder="Ayakkabı Numarası"
              placeholderTextColor={COLORS.grayMedium}
              keyboardType="numeric"
              value={bodyMeasurements.shoeSize?.toString()}
              onChangeText={(text) => setBodyMeasurements({...bodyMeasurements, shoeSize: text})}
            />
            
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setModalVisible(null)}>
                <Text style={styles.cancelButtonText}>İPTAL</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={handleSaveBodyMeasurements}>
                <Text style={styles.saveButtonText}>KAYDET</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* STİL TERCIHLERI MODAL */}
      <Modal visible={modalVisible === 'style'} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Stil Tercihleri</Text>
            
            <Text style={styles.inputLabel}>Favori Renkler</Text>
            <View style={styles.tagContainer}>
              {(stylePreferences.favoriteColors || []).map((color, i) => (
                <View key={i} style={styles.tag}>
                  <Text style={styles.tagText}>{color}</Text>
                  <TouchableOpacity onPress={() => removeFromArray(stylePreferences.favoriteColors, setStylePreferences, color)}>
                    <Ionicons name="close-circle" size={16} color={COLORS.grayMedium} />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
            <View style={styles.addRow}>
              <TextInput 
                style={styles.addInput}
                placeholder="Renk ekle..."
                placeholderTextColor={COLORS.grayMedium}
                value={tempColor}
                onChangeText={setTempColor}
              />
              <TouchableOpacity style={styles.addButton} onPress={() => addToArray(stylePreferences.favoriteColors, setStylePreferences, tempColor, setTempColor)}>
                <Text style={styles.addButtonText}>+</Text>
              </TouchableOpacity>
            </View>
            
            <Text style={styles.inputLabel}>Favori Markalar</Text>
            <View style={styles.tagContainer}>
              {(stylePreferences.preferredBrands || []).map((brand, i) => (
                <View key={i} style={styles.tag}>
                  <Text style={styles.tagText}>{brand}</Text>
                  <TouchableOpacity onPress={() => removeFromArray(stylePreferences.preferredBrands, setStylePreferences, brand)}>
                    <Ionicons name="close-circle" size={16} color={COLORS.grayMedium} />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
            <View style={styles.addRow}>
              <TextInput 
                style={styles.addInput}
                placeholder="Marka ekle..."
                placeholderTextColor={COLORS.grayMedium}
                value={tempBrand}
                onChangeText={setTempBrand}
              />
              <TouchableOpacity style={styles.addButton} onPress={() => addToArray(stylePreferences.preferredBrands, setStylePreferences, tempBrand, setTempBrand)}>
                <Text style={styles.addButtonText}>+</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setModalVisible(null)}>
                <Text style={styles.cancelButtonText}>İPTAL</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={handleSaveStylePreferences}>
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
  container: { flex: 1, backgroundColor: COLORS.white },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  // HEADER
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SIZES.lg,
    paddingTop: Platform.OS === 'ios' ? 12 : SIZES.md,
    paddingBottom: SIZES.md,
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.grayLight,
  },
  title: { ...TYPOGRAPHY.caption, fontSize: 16, letterSpacing: 2 },
  settingsButton: { padding: SIZES.xs },

  // SCROLL CONTENT
  scrollContent: { paddingBottom: SIZES.xl },

  // USER SECTION
  userSection: { alignItems: 'center', paddingVertical: SIZES.xl },
  avatarContainer: { marginBottom: SIZES.sm },
  userName: { ...TYPOGRAPHY.bodyMedium, fontWeight: '500' },
  userEmail: { ...TYPOGRAPHY.bodySmall, color: COLORS.grayMedium, marginTop: 2 },

  // STATS
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: SIZES.lg,
    marginBottom: SIZES.xl,
  },
  statCard: { alignItems: 'center' },
  statValue: { ...TYPOGRAPHY.bodyLarge, fontWeight: '600', marginTop: SIZES.xs },
  statLabel: { ...TYPOGRAPHY.caption, fontSize: 10, color: COLORS.grayMedium, marginTop: 2 },

  // SECTION CARDS
  sectionCard: {
    marginHorizontal: SIZES.lg,
    marginBottom: SIZES.md,
    padding: SIZES.md,
    borderWidth: 0.5,
    borderColor: COLORS.grayLight,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.sm,
  },
  sectionTitle: { ...TYPOGRAPHY.caption, fontSize: 11, letterSpacing: 1 },

  // PREVIEW
  measurementsPreview: { flexDirection: 'row', gap: SIZES.md },
  previewText: { ...TYPOGRAPHY.bodySmall, color: COLORS.grayMedium },
  preferencesPreview: { flexDirection: 'row', flexWrap: 'wrap', gap: SIZES.xs },
  previewTag: { paddingHorizontal: SIZES.sm, paddingVertical: 2, borderWidth: 0.5, borderColor: COLORS.grayLight },
  previewTagText: { ...TYPOGRAPHY.caption, fontSize: 9 },

  // MODAL
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: SIZES.lg,
    maxHeight: '80%',
  },
  modalTitle: { ...TYPOGRAPHY.bodyMedium, textAlign: 'center', marginBottom: SIZES.lg },

  // INPUTS
  input: {
    borderWidth: 0.5,
    borderColor: COLORS.grayLight,
    paddingHorizontal: SIZES.md,
    paddingVertical: SIZES.sm,
    marginBottom: SIZES.md,
    ...TYPOGRAPHY.bodySmall,
  },
  inputLabel: { ...TYPOGRAPHY.caption, marginBottom: SIZES.xs, color: COLORS.grayMedium },
  rowInputs: { flexDirection: 'row', gap: SIZES.md, marginBottom: SIZES.md },
  pickerContainer: { flex: 1 },

  // SIZE OPTIONS
  sizeOptions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  sizeOption: { width: 40, paddingVertical: 6, alignItems: 'center', borderWidth: 0.5, borderColor: COLORS.grayLight },
  sizeOptionActive: { borderColor: COLORS.black, backgroundColor: COLORS.black },
  sizeOptionText: { ...TYPOGRAPHY.caption, fontSize: 11, color: COLORS.black },
  sizeOptionTextActive: { color: COLORS.white },

  // MODAL BUTTONS
  modalButtons: { flexDirection: 'row', gap: SIZES.md, marginTop: SIZES.lg },
  cancelButton: {
    flex: 1,
    paddingVertical: SIZES.md,
    alignItems: 'center',
    borderWidth: 0.5,
    borderColor: COLORS.grayLight,
  },
  cancelButtonText: { ...TYPOGRAPHY.caption, fontSize: 11 },
  saveButton: { flex: 1, paddingVertical: SIZES.md, alignItems: 'center', backgroundColor: COLORS.black },
  saveButtonText: { ...TYPOGRAPHY.caption, fontSize: 11, color: COLORS.white },

  // TAGS
  tagContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: SIZES.xs, marginBottom: SIZES.sm },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: SIZES.sm,
    paddingVertical: 4,
    borderWidth: 0.5,
    borderColor: COLORS.grayLight,
  },
  tagText: { ...TYPOGRAPHY.caption, fontSize: 11 },

  // ADD ROW
  addRow: { flexDirection: 'row', gap: SIZES.sm, marginBottom: SIZES.md },
  addInput: {
    flex: 1,
    borderWidth: 0.5,
    borderColor: COLORS.grayLight,
    paddingHorizontal: SIZES.md,
    paddingVertical: SIZES.sm,
    ...TYPOGRAPHY.bodySmall,
  },
  addButton: { paddingHorizontal: SIZES.md, justifyContent: 'center', borderWidth: 0.5, borderColor: COLORS.black },
  addButtonText: { fontSize: 18, color: COLORS.black },
});

export default ProfileScreen;