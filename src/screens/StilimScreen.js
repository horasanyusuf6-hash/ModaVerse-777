// 📁 src/screens/StilimScreen.js - REVİZE (Premium Kart Eklendi)

import React, { useState, useEffect, useCallback, useContext, useRef } from 'react';
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
  FlatList,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { COLORS, TYPOGRAPHY, SIZES } from '../constants/Theme';
import { AuthContext } from '../../App';
import { getUserProfile, createUserProfile, updateBodyMeasurements, updateStylePreferences } from '../services/profileService';

// ============================================================
// 📌 TOAST İMPORTU
// ============================================================
import { showToast } from '../components/CustomAlert';

const { width, height } = Dimensions.get('window');

// ============================================================
// 📌 STORY VERİLERİ İÇİN KEY
// ============================================================
const STORY_STORAGE_KEY = '@user_stories';

// ============================================================
// 📌 STORY VIEWER MODAL
// ============================================================
const StoryViewerModal = ({ visible, stories, initialIndex, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex || 0);
  const flatListRef = useRef(null);

  useEffect(() => {
    if (visible) {
      setCurrentIndex(initialIndex || 0);
      setTimeout(() => {
        flatListRef.current?.scrollToIndex({
          index: initialIndex || 0,
          animated: false,
        });
      }, 100);
    }
  }, [visible, initialIndex]);

  const renderStory = ({ item }) => (
    <View style={styles.storyViewerSlide}>
      <Image source={{ uri: item.image }} style={styles.storyViewerImage} />
      <View style={styles.storyViewerOverlay}>
        <View style={styles.storyViewerUser}>
          <Image 
            source={{ uri: item.userAvatar || 'https://i.pravatar.cc/100' }} 
            style={styles.storyViewerAvatar} 
          />
          <Text style={styles.storyViewerUserName}>{item.userName || 'Kullanıcı'}</Text>
          <Text style={styles.storyViewerTime}>
            {new Date(item.createdAt).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>
      </View>
    </View>
  );

  return (
    <Modal visible={visible} transparent onRequestClose={onClose} animationType="fade">
      <View style={styles.storyViewerContainer}>
        <TouchableOpacity style={styles.storyViewerClose} onPress={onClose}>
          <Ionicons name="close" size={28} color={COLORS.white} />
        </TouchableOpacity>

        <FlatList
          ref={flatListRef}
          data={stories}
          renderItem={renderStory}
          keyExtractor={(item) => item.id}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          initialScrollIndex={initialIndex || 0}
          onMomentumScrollEnd={(e) => {
            const index = Math.round(e.nativeEvent.contentOffset.x / width);
            setCurrentIndex(index);
          }}
          getItemLayout={(data, index) => ({
            length: width,
            offset: width * index,
            index,
          })}
        />

        <View style={styles.viewerProgress}>
          {stories.map((_, index) => (
            <View
              key={index}
              style={[
                styles.viewerProgressBar,
                index <= currentIndex && styles.viewerProgressBarActive,
              ]}
            />
          ))}
        </View>
      </View>
    </Modal>
  );
};

// ============================================================
// 📌 KAPAK FOTOĞRAFI GRID
// ============================================================
const CoverImageGrid = ({ images, onPressImage, onAddCover }) => {
  const validImages = images.filter(img => img !== null && img !== '');
  const hasImages = validImages.length > 0;

  if (validImages.length === 1) {
    return (
      <TouchableOpacity style={styles.coverGridSingle} onPress={() => onPressImage(0)}>
        <Image source={{ uri: validImages[0] }} style={styles.coverGridImage} />
        <View style={styles.coverGridOverlay}>
          <Text style={styles.coverGridCount}>1/3</Text>
        </View>
      </TouchableOpacity>
    );
  }

  if (validImages.length === 2) {
    return (
      <View style={styles.coverGridContainer}>
        <TouchableOpacity style={styles.coverGridLarge} onPress={() => onPressImage(0)}>
          <Image source={{ uri: validImages[0] }} style={styles.coverGridImage} />
          <View style={styles.coverGridOverlay}>
            <Text style={styles.coverGridCount}>1/3</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity style={styles.coverGridSmall} onPress={() => onPressImage(1)}>
          <Image source={{ uri: validImages[1] }} style={styles.coverGridImage} />
          <View style={styles.coverGridOverlay}>
            <Text style={styles.coverGridCount}>2/3</Text>
          </View>
        </TouchableOpacity>
      </View>
    );
  }

  if (validImages.length >= 3) {
    return (
      <View style={styles.coverGridContainer}>
        <TouchableOpacity style={styles.coverGridLarge} onPress={() => onPressImage(0)}>
          <Image source={{ uri: validImages[0] }} style={styles.coverGridImage} />
          <View style={styles.coverGridOverlay}>
            <Text style={styles.coverGridCount}>1/3</Text>
          </View>
        </TouchableOpacity>
        <View style={styles.coverGridRight}>
          <TouchableOpacity style={styles.coverGridSmall} onPress={() => onPressImage(1)}>
            <Image source={{ uri: validImages[1] }} style={styles.coverGridImage} />
            <View style={styles.coverGridOverlay}>
              <Text style={styles.coverGridCount}>2/3</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={styles.coverGridSmall} onPress={() => onPressImage(2)}>
            <Image source={{ uri: validImages[2] }} style={styles.coverGridImage} />
            <View style={styles.coverGridOverlay}>
              <Text style={styles.coverGridCount}>3/3</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <TouchableOpacity style={styles.coverGridSingle} onPress={onAddCover}>
      <View style={[styles.coverGridImage, styles.coverGridPlaceholder]}>
        <Ionicons name="camera-outline" size={40} color={COLORS.grayMedium} />
        <Text style={[styles.coverGridPlaceholderText, { fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' }]}>Kapak ekle</Text>
      </View>
    </TouchableOpacity>
  );
};

// ============================================================
// 📌 KAPAK FOTOĞRAFI AYARLAR MODALI
// ============================================================
const CoverSettingsModal = ({ visible, imageIndex, onClose, onChange, onDelete }) => {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={onClose}>
        <View style={styles.coverSettingsContainer}>
          <View style={styles.coverSettingsHeader}>
            <Text style={[styles.coverSettingsTitle, { fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' }]}>Kapak Fotoğrafı #{imageIndex + 1}</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={COLORS.black} />
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={styles.coverSettingsItem} onPress={onChange}>
            <Ionicons name="image-outline" size={20} color={COLORS.black} />
            <Text style={[styles.coverSettingsText, { fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' }]}>Fotoğrafı Değiştir</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.coverSettingsItem, styles.coverSettingsDanger]} onPress={onDelete}>
            <Ionicons name="trash-outline" size={20} color={COLORS.error} />
            <Text style={[styles.coverSettingsText, styles.coverSettingsDangerText, { fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' }]}>Fotoğrafı Sil</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

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
// 📌 STİL KİMLİĞİ KARTLARI (YENİ - DİKDÖRTGEN, YATAY KAYDIRMA)
// ============================================================
const StyleIdentityCards = ({ onCardPress }) => {
  const { theme } = useContext(AuthContext);
  const isDark = theme === 'dark';

  const styleCards = [
    { id: '1', title: 'Sokak Stili', image: 'https://picsum.photos/id/1/400/500', likes: 12400, comments: 3400 },
    { id: '2', title: 'Lüks Kombin', image: 'https://picsum.photos/id/2/400/500', likes: 8900, comments: 2100 },
    { id: '3', title: 'Minimal Look', image: 'https://picsum.photos/id/3/400/500', likes: 6700, comments: 1800 },
    { id: '4', title: 'Vintage Tarz', image: 'https://picsum.photos/id/4/400/500', likes: 5200, comments: 1400 },
    { id: '5', title: 'Spor Şıklık', image: 'https://picsum.photos/id/5/400/500', likes: 4800, comments: 1200 },
  ];

  const formatNumber = (num) => {
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  return (
    <View style={styles.styleIdentityContainer}>
      <View style={styles.styleIdentityHeader}>
        <Text style={[styles.styleIdentityTitle, { fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' }]}>🌟 STİL KİMLİĞİM</Text>
        <TouchableOpacity onPress={() => onCardPress?.('seeAll')}>
          <Text style={[styles.styleIdentitySeeAll, { fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' }]}>TÜMÜNÜ GÖR</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={styleCards}
        horizontal
        showsHorizontalScrollIndicator={false}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={[styles.styleIdentityCard, { backgroundColor: isDark ? '#2D2D2D' : '#F5F5F5', borderColor: isDark ? '#3D3D3D' : '#EEEEEE' }]}
            onPress={() => onCardPress?.(item)}
            activeOpacity={0.9}
          >
            <Image source={{ uri: item.image }} style={styles.styleIdentityImage} />
            <View style={styles.styleIdentityOverlay}>
              <View style={styles.styleIdentityContent}>
                <Text style={[styles.styleIdentityCardTitle, { fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' }]}>{item.title}</Text>
                <View style={styles.styleIdentityStats}>
                  <View style={styles.styleIdentityStat}>
                    <Ionicons name="heart" size={12} color="#FF3B30" />
                    <Text style={[styles.styleIdentityStatText, { fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' }]}>{formatNumber(item.likes)}</Text>
                  </View>
                  <View style={styles.styleIdentityStat}>
                    <Ionicons name="chatbubble" size={12} color="#FFFFFF" />
                    <Text style={[styles.styleIdentityStatText, { fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' }]}>{formatNumber(item.comments)}</Text>
                  </View>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        )}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.styleIdentityList}
      />
    </View>
  );
};

// ============================================================
// 📌 KOLEKSİYONUM (YENİ TASARIM - DÜZELTİLDİ)
// ============================================================
const MyCollection = ({ items, onItemPress }) => {
  const { theme } = useContext(AuthContext);
  const isDark = theme === 'dark';

  if (!items || items.length === 0) {
    return (
      <View style={[styles.collectionEmptyContainer, { backgroundColor: isDark ? '#2D2D2D' : '#F5F5F5', borderColor: isDark ? '#3D3D3D' : '#EEEEEE' }]}>
        <Ionicons name="albums-outline" size={40} color={isDark ? '#888888' : '#999999'} />
        <Text style={[styles.collectionEmptyTitle, { color: isDark ? '#FFFFFF' : '#1A1A1A', fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' }]}>KOLEKSİYONUN BOŞ</Text>
        <Text style={[styles.collectionEmptyText, { color: isDark ? '#888888' : '#999999', fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' }]}>
          Markalardan ilham alarak koleksiyon oluştur!
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.collectionContainer}>
      <View style={styles.collectionHeader}>
        <Text style={[styles.collectionTitle, { color: isDark ? '#FFFFFF' : '#1A1A1A', fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' }]}>👗 KOLEKSİYONUM</Text>
        <TouchableOpacity onPress={() => onItemPress?.('seeAll')}>
          <Text style={[styles.collectionSeeAll, { color: isDark ? '#888888' : '#999999', fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' }]}>TÜMÜNÜ GÖR</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={items}
        horizontal
        showsHorizontalScrollIndicator={false}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={[styles.collectionItem, { backgroundColor: isDark ? '#2D2D2D' : '#F5F5F5', borderColor: isDark ? '#3D3D3D' : '#EEEEEE' }]}
            onPress={() => onItemPress?.(item)}
            activeOpacity={0.8}
          >
            <Image source={{ uri: item.image || 'https://picsum.photos/120/160' }} style={styles.collectionItemImage} />
            <View style={styles.collectionItemInfo}>
              <Text style={[styles.collectionItemName, { color: isDark ? '#FFFFFF' : '#1A1A1A', fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' }]} numberOfLines={1}>{item.name || 'Parça'}</Text>
              <Text style={[styles.collectionItemBrand, { color: isDark ? '#888888' : '#999999', fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' }]} numberOfLines={1}>{item.brand || 'Marka'}</Text>
              <Text style={[styles.collectionItemPrice, { color: isDark ? '#FFFFFF' : '#1A1A1A', fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' }]}>₺{item.price || '0'}</Text>
            </View>
          </TouchableOpacity>
        )}
        keyExtractor={(item, index) => item.id || index.toString()}
        contentContainerStyle={styles.collectionList}
      />
    </View>
  );
};

// ============================================================
// 📌 PREMİUM BİLGİLENDİRME KARTI (YENİ TASARIM)
// ============================================================
const PremiumInfoCard = ({ onPress }) => {
  const { theme } = useContext(AuthContext);
  const isDark = theme === 'dark';

  const features = [
    { icon: 'shield-checkmark', label: 'Özel Güvenlik' },
    { icon: 'gift', label: 'VIP Üyelik' },
    { icon: 'cash', label: 'Kapıda Ödeme' },
    { icon: 'pricetag', label: '%15 İndirim' },
  ];

  return (
    <View style={[styles.premiumCard, { 
      backgroundColor: isDark ? '#2D2D2D' : '#1A1A1A',
      borderColor: isDark ? '#3D3D3D' : 'rgba(255,255,255,0.1)' 
    }]}>
      <View style={styles.premiumCardContent}>
        <View style={styles.premiumCardHeader}>
          <View style={styles.premiumCardIconWrap}>
            <Ionicons name="diamond" size={20} color="#FFD700" />
          </View>
          <View style={styles.premiumCardBadge}>
            <Text style={[styles.premiumCardBadgeText, { fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' }]}>PREMIUM</Text>
          </View>
        </View>

        <Text style={[styles.premiumCardTitle, { fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' }]}>STİL İLHAMI AL</Text>
        <Text style={[styles.premiumCardSubtitle, { fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' }]}>
          Markalardan ilham al, kendi stilini yarat. Premium deneyim seni bekliyor.
        </Text>

        <View style={styles.premiumCardFeatures}>
          {features.map((item, idx) => (
            <View key={idx} style={styles.premiumCardFeature}>
              <Ionicons name={item.icon} size={14} color="rgba(255,255,255,0.7)" />
              <Text style={[styles.premiumCardFeatureText, { fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' }]}>{item.label}</Text>
            </View>
          ))}
        </View>

        <TouchableOpacity 
          style={styles.premiumCardButton} 
          onPress={onPress}
          activeOpacity={0.8}
        >
          <Text style={[styles.premiumCardButtonText, { fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' }]}>KEŞFET</Text>
          <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

// ============================================================
// 📌 TARZ DETAYLARI
// ============================================================
const STYLE_DETAILS = {
  'Minimalist': {
    pieces: ['Basic Tişört', 'Oversize Blazer', 'Chino Pantolon', 'Beyaz Sneaker', 'Deri Çanta'],
    accessories: ['Kol saati', 'Güneş gözlüğü', 'Deri kemer'],
    colors: ['Siyah', 'Beyaz', 'Gri', 'Bej'],
    brands: ['COS', 'Arket', 'Uniqlo'],
  },
  'Sokak Modası': {
    pieces: ['Oversize Hoodie', 'Kargo Pantolon', 'Sneaker', 'Şapka', 'Sırt Çantası'],
    accessories: ['Zincir kolye', 'Bere', 'Spor çanta'],
    colors: ['Siyah', 'Haki', 'Beyaz', 'Turuncu'],
    brands: ['Supreme', 'Palace', 'Nike'],
  },
  'Bohem': {
    pieces: ['Maksi Elbise', 'Etnik Desenli Gömlek', 'Deri Bot', 'Fular', 'Çanta'],
    accessories: ['Taşlı kolye', 'Bileklik', 'Saç bandı'],
    colors: ['Toprak tonları', 'Krem', 'Hardal', 'Zeytin'],
    brands: ['Free People', 'H&M', 'Mango'],
  },
  'Sportif': {
    pieces: ['Spor Tişört', 'Eşofman Altı', 'Sneaker', 'Şapka', 'Spor Çanta'],
    accessories: ['Spor saat', 'Kafa bandı', 'Su şişesi'],
    colors: ['Siyah', 'Gri', 'Mavi', 'Kırmızı'],
    brands: ['Nike', 'Adidas', 'Puma'],
  },
  'Lüks': {
    pieces: ['İpek Elbise', 'Takım Elbise', 'Deri Ayakkabı', 'Kol saati', 'Çanta'],
    accessories: ['Altın takı', 'İpek fular', 'Deri kemer'],
    colors: ['Siyah', 'Bordo', 'Altın', 'Krem'],
    brands: ['Gucci', 'Prada', 'Hermès'],
  },
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
            <Text style={[styles.modalTitle, { fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' }]}>Stil Tercihleri</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={COLORS.black} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={[styles.inputLabel, { fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' }]}>Favori Renkler</Text>
            <View style={styles.tagContainer}>
              {favoriteColors.map((color, i) => (
                <View key={i} style={styles.tag}>
                  <Text style={[styles.tagText, { fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' }]}>{color}</Text>
                  <TouchableOpacity onPress={() => removeFromArray(favoriteColors, setFavoriteColors, color)}>
                    <Ionicons name="close-circle" size={16} color={COLORS.grayMedium} />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
            <View style={styles.addRow}>
              <TextInput 
                style={[styles.addInput, { fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' }]}
                placeholder="Renk ekle (örn: Mavi)"
                placeholderTextColor={COLORS.grayMedium}
                value={tempColor}
                onChangeText={setTempColor}
              />
              <TouchableOpacity style={styles.addButton} onPress={() => addToArray(favoriteColors, setFavoriteColors, tempColor, setTempColor)}>
                <Text style={[styles.addButtonText, { fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' }]}>+</Text>
              </TouchableOpacity>
            </View>

            <Text style={[styles.inputLabel, { fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' }]}>Favori Markalar</Text>
            <View style={styles.tagContainer}>
              {preferredBrands.map((brand, i) => (
                <View key={i} style={styles.tag}>
                  <Text style={[styles.tagText, { fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' }]}>{brand}</Text>
                  <TouchableOpacity onPress={() => removeFromArray(preferredBrands, setPreferredBrands, brand)}>
                    <Ionicons name="close-circle" size={16} color={COLORS.grayMedium} />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
            <View style={styles.addRow}>
              <TextInput 
                style={[styles.addInput, { fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' }]}
                placeholder="Marka ekle"
                placeholderTextColor={COLORS.grayMedium}
                value={tempBrand}
                onChangeText={setTempBrand}
              />
              <TouchableOpacity style={styles.addButton} onPress={() => addToArray(preferredBrands, setPreferredBrands, tempBrand, setTempBrand)}>
                <Text style={[styles.addButtonText, { fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' }]}>+</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.modalButtonsEqual}>
              <TouchableOpacity style={[styles.cancelButtonEqual]} onPress={onClose}>
                <Text style={[styles.cancelButtonTextEqual, { fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' }]}>İPTAL</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.saveButtonEqual]} onPress={handleSave}>
                <Text style={[styles.saveButtonTextEqual, { fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' }]}>KAYDET</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

// ============================================================
// 📌 STİL KİMLİĞİM KARTI
// ============================================================
const StyleIdentityCard = ({ style, onPress }) => {
  const { theme } = useContext(AuthContext);
  const isDark = theme === 'dark';

  return (
    <TouchableOpacity style={[styles.styleIdentityCard, { backgroundColor: isDark ? '#2D2D2D' : '#F5F5F5', borderColor: isDark ? '#3D3D3D' : '#EEEEEE' }]} onPress={onPress}>
      <View style={styles.styleIdentityHeader}>
        <Text style={styles.styleIdentityIcon}>{style.icon}</Text>
        <Text style={[styles.styleIdentityName, { color: isDark ? '#FFFFFF' : '#1A1A1A', fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' }]}>{style.name}</Text>
      </View>
      <View style={styles.styleIdentityProgress}>
        <View style={[styles.styleIdentityBar, { width: `${style.percentage}%`, backgroundColor: isDark ? '#FFFFFF' : '#1A1A1A' }]} />
      </View>
      <Text style={[styles.styleIdentityPercent, { color: isDark ? '#FFFFFF' : '#1A1A1A', fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' }]}>%{style.percentage}</Text>
      <Text style={[styles.styleIdentityRank, { color: isDark ? '#888888' : '#999999', fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' }]}>{style.rankLabel}</Text>
    </TouchableOpacity>
  );
};

// ============================================================
// 📌 TARZ DETAY MODALI
// ============================================================
const StyleDetailModal = ({ visible, styleName, onClose }) => {
  const details = STYLE_DETAILS[styleName];
  if (!details) return null;

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.styleDetailContainer}>
          <View style={styles.styleDetailHeader}>
            <Text style={[styles.styleDetailTitle, { fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' }]}>{styleName}</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={COLORS.black} />
            </TouchableOpacity>
          </View>
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.styleDetailSection}>
              <Text style={[styles.styleDetailSectionTitle, { fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' }]}>👕 Parçalar</Text>
              {details.pieces.map((piece, i) => (
                <Text key={i} style={[styles.styleDetailItem, { fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' }]}>• {piece}</Text>
              ))}
            </View>
            <View style={styles.styleDetailSection}>
              <Text style={[styles.styleDetailSectionTitle, { fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' }]}>💎 Aksesuarlar</Text>
              {details.accessories.map((acc, i) => (
                <Text key={i} style={[styles.styleDetailItem, { fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' }]}>• {acc}</Text>
              ))}
            </View>
            <View style={styles.styleDetailSection}>
              <Text style={[styles.styleDetailSectionTitle, { fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' }]}>🎨 Renkler</Text>
              <View style={styles.styleDetailColors}>
                {details.colors.map((color, i) => (
                  <View key={i} style={[styles.styleDetailColorChip, { backgroundColor: color.toLowerCase() }]}>
                    <Text style={[styles.styleDetailColorText, { fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' }]}>{color}</Text>
                  </View>
                ))}
              </View>
            </View>
            <View style={styles.styleDetailSection}>
              <Text style={[styles.styleDetailSectionTitle, { fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' }]}>🏷️ Markalar</Text>
              {details.brands.map((brand, i) => (
                <Text key={i} style={[styles.styleDetailItem, { fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' }]}>• {brand}</Text>
              ))}
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
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
            <Text style={[styles.modalTitle, { fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' }]}>Beden Ölçüleri</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={COLORS.black} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.rowInput}>
              <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                <Text style={[styles.inputLabel, { fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' }]}>Boy (cm)</Text>
                <TextInput
                  style={[styles.input, { fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' }]}
                  placeholder="175"
                  placeholderTextColor={COLORS.grayMedium}
                  keyboardType="numeric"
                  value={height}
                  onChangeText={setHeight}
                />
              </View>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={[styles.inputLabel, { fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' }]}>Kilo (kg)</Text>
                <TextInput
                  style={[styles.input, { fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' }]}
                  placeholder="70"
                  placeholderTextColor={COLORS.grayMedium}
                  keyboardType="numeric"
                  value={weight}
                  onChangeText={setWeight}
                />
              </View>
            </View>

            <Text style={[styles.inputLabel, { fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' }]}>Üst Beden</Text>
            <View style={styles.sizeOptionsGrid}>
              {sizeOptions.map(size => (
                <TouchableOpacity 
                  key={size}
                  style={[styles.sizeOption, topSize === size && styles.sizeOptionActive]}
                  onPress={() => setTopSize(size)}
                >
                  <Text style={[styles.sizeOptionText, topSize === size && styles.sizeOptionTextActive, { fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' }]}>{size}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={[styles.inputLabel, { fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' }]}>Alt Beden</Text>
            <View style={styles.sizeOptionsGrid}>
              {sizeOptions.map(size => (
                <TouchableOpacity 
                  key={size}
                  style={[styles.sizeOption, bottomSize === size && styles.sizeOptionActive]}
                  onPress={() => setBottomSize(size)}
                >
                  <Text style={[styles.sizeOptionText, bottomSize === size && styles.sizeOptionTextActive, { fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' }]}>{size}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TextInput 
              style={[styles.input, { fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' }]}
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
                <Text style={[styles.cancelButtonText, { fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' }]}>İPTAL</Text>
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
                    <Text style={[styles.saveButtonTextPremium, { fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' }]}>KAYDET</Text>
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
// 📌 TARZ SEÇİM MODALI
// ============================================================
const StyleSelectionModal = ({ visible, stylesList, currentStyle, onSelect, onClose }) => {
  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.styleModalContainer}>
          <View style={styles.styleModalHeader}>
            <Text style={[styles.styleModalTitle, { fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' }]}>Tarz Seçimi</Text>
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
                    currentStyle === style.name && styles.styleModalNameActive,
                    { fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' }
                  ]}>
                    {style.name}
                  </Text>
                  <View style={styles.styleModalRankBadge}>
                    <Text style={[styles.styleModalRankText, { fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' }]}>{style.rankLabel} Tarz</Text>
                  </View>
                </View>
                <View style={styles.styleModalPercentage}>
                  <Text style={[styles.styleModalPercentageText, { fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' }]}>%{style.percentage}</Text>
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
const SettingsMenuModal = ({ visible, theme, onClose, onToggleTheme, onLogout, onNavigate, isPrivate, onTogglePrivacy }) => {
  const menuItems = [
    { icon: 'person-outline', label: 'Profil Düzenle', action: 'edit_profile' },
    { icon: 'lock-closed-outline', label: `Hesap ${isPrivate ? '🔒 Gizli' : '🌐 Herkese Açık'}`, action: 'privacy' },
    { icon: 'notifications-outline', label: 'Bildirimler', action: 'notifications' },
    { icon: 'color-palette-outline', label: `Tema ${theme === 'dark' ? '🌙 Karanlık' : '☀️ Aydınlık'}`, action: 'theme' },
    { icon: 'information-circle-outline', label: 'Uygulama Hakkında', action: 'about' },
    { icon: 'log-out-outline', label: 'Çıkış Yap', action: 'logout', danger: true },
  ];

  const handleAction = (action) => {
    switch (action) {
      case 'edit_profile':
        onNavigate('EditProfile');
        break;
      case 'privacy':
        onTogglePrivacy();
        break;
      case 'notifications':
        showToast({
          title: 'Bilgi',
          message: 'Bildirim ayarları henüz eklenmedi.',
          type: 'info',
          autoClose: true,
          autoCloseDelay: 2000,
        });
        break;
      case 'theme':
        onToggleTheme();
        break;
      case 'about':
        showToast({
          title: 'ModaVerse',
          message: `ModaVerse v2.0.0\n\nAI destekli moda asistanı.\n\n${theme === 'dark' ? '🌙 Karanlık Tema Aktif' : '☀️ Aydınlık Tema Aktif'}`,
          type: 'info',
          autoClose: true,
          autoCloseDelay: 3000,
        });
        break;
      case 'logout':
        onLogout();
        break;
      default:
        break;
    }
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.settingsMenuContainer}>
          <View style={styles.settingsMenuHeader}>
            <Text style={[styles.settingsMenuTitle, { fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' }]}>Ayarlar</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={COLORS.black} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {menuItems.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.settingsMenuItem, item.danger && styles.settingsMenuItemDanger]}
                onPress={() => handleAction(item.action)}
              >
                <View style={styles.settingsMenuItemLeft}>
                  <Ionicons name={item.icon} size={20} color={item.danger ? COLORS.error : COLORS.black} />
                  <Text style={[styles.settingsMenuItemText, item.danger && styles.settingsMenuItemTextDanger, { fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' }]}>
                    {item.label}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color={COLORS.grayMedium} />
              </TouchableOpacity>
            ))}
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
    coverImage2: null,
    coverImage3: null,
  });
  
  const [currentStyle, setCurrentStyle] = useState('Minimalist');
  const [styleData, setStyleData] = useState({});
  const [styleModalVisible, setStyleModalVisible] = useState(false);
  const [styleDetailVisible, setStyleDetailVisible] = useState(false);
  
  const [stats, setStats] = useState({
    posts: 24,
    followers: 1240,
    following: 356,
  });
  
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [settingsMenuVisible, setSettingsMenuVisible] = useState(false);
  const [theme, setTheme] = useState('light');
  const [isPrivate, setIsPrivate] = useState(false);
  
  const [bodyModalVisible, setBodyModalVisible] = useState(false);
  const [stylePrefModalVisible, setStylePrefModalVisible] = useState(false);
  const [bodyMeasurements, setBodyMeasurements] = useState({
    height: null, weight: null, topSize: null, bottomSize: null, shoeSize: null
  });
  const [stylePreferences, setStylePreferences] = useState({
    favoriteColors: [], preferredBrands: [], avoidedStyles: [], favoriteCategories: []
  });

  const [collectionItems, setCollectionItems] = useState([
    { id: 'c1', name: 'Deri Ceket', brand: 'Zara', price: '1299', image: 'https://picsum.photos/id/10/120/160' },
    { id: 'c2', name: 'Sneaker', brand: 'Nike', price: '899', image: 'https://picsum.photos/id/20/120/160' },
    { id: 'c3', name: 'Elbise', brand: 'Mavi', price: '599', image: 'https://picsum.photos/id/30/120/160' },
    { id: 'c4', name: 'Saat', brand: 'Daniel Wellington', price: '2499', image: 'https://picsum.photos/id/40/120/160' },
  ]);

  const [stories, setStories] = useState([]);
  const [storyViewerVisible, setStoryViewerVisible] = useState(false);
  const [selectedStoryIndex, setSelectedStoryIndex] = useState(0);

  const [coverSettingsVisible, setCoverSettingsVisible] = useState(false);
  const [selectedCoverIndex, setSelectedCoverIndex] = useState(0);

  const getUserTitle = () => {
    if (stats.followers >= 10000) return '👑 MODA İKONU';
    if (stats.followers >= 5000) return '⭐ TREND BELİRLEYİCİ';
    if (stats.followers >= 1000) return '✨ STİL GURUSU';
    return '🌟 MODA SEVER';
  };

  useEffect(() => {
    const saveTheme = async () => {
      await AsyncStorage.setItem('@app_theme', theme);
    };
    saveTheme();
  }, [theme]);

  useEffect(() => {
    const savePrivacy = async () => {
      await AsyncStorage.setItem('@user_privacy', JSON.stringify(isPrivate));
    };
    if (user) savePrivacy();
  }, [isPrivate, user]);

  useEffect(() => {
    if (user) {
      loadFirestoreProfile();
      loadPrivacy();
    }
    loadTheme();
  }, [user]);

  const loadTheme = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('@app_theme');
      if (savedTheme) setTheme(savedTheme);
    } catch (error) {
      console.error('Tema yükleme hatası:', error);
    }
  };

  const loadPrivacy = async () => {
    try {
      const savedPrivacy = await AsyncStorage.getItem('@user_privacy');
      if (savedPrivacy) setIsPrivate(JSON.parse(savedPrivacy));
    } catch (error) {
      console.error('Gizlilik yükleme hatası:', error);
    }
  };

  const loadStories = async () => {
    try {
      const saved = await AsyncStorage.getItem(STORY_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        const now = new Date();
        const filtered = parsed.filter(s => {
          const storyDate = new Date(s.createdAt);
          const diffHours = (now - storyDate) / (1000 * 60 * 60);
          return diffHours < 24;
        });
        setStories(filtered);
        if (filtered.length !== parsed.length) {
          await AsyncStorage.setItem(STORY_STORAGE_KEY, JSON.stringify(filtered));
        }
      }
    } catch (error) {
      console.error('Story yükleme hatası:', error);
    }
  };

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
    loadStories();
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
          coverImage2: parsedProfile.coverImage2 || null,
          coverImage3: parsedProfile.coverImage3 || null,
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
      showToast({
        title: '✅ Profil Güncellendi',
        message: 'Profil bilgilerin başarıyla güncellendi.',
        type: 'success',
        autoClose: false,
        showPremium: true,
      });
    } catch (error) {
      console.error('Profil kaydedilirken hata:', error);
      showToast({
        title: 'Hata',
        message: 'Profil güncellenirken bir sorun oluştu.',
        type: 'error',
        autoClose: true,
        autoCloseDelay: 2000,
      });
    }
  };

  const handleSaveBodyMeasurements = async (measurements) => {
    const result = await updateBodyMeasurements(user.uid, measurements);
    if (result.success) {
      setBodyMeasurements(measurements);
      showToast({
        title: '📏 Beden Ölçüleri Kaydedildi',
        message: 'Beden ölçüleriniz başarıyla kaydedildi. Artık size özel öneriler alabilirsin!',
        type: 'success',
        autoClose: false,
        showPremium: true,
      });
      setBodyModalVisible(false);
    } else {
      showToast({
        title: 'Hata',
        message: 'Kaydedilemedi: ' + result.error,
        type: 'error',
        autoClose: true,
        autoCloseDelay: 2000,
      });
    }
  };

  const handleSaveStylePreferences = async (preferences) => {
    const result = await updateStylePreferences(user.uid, preferences);
    if (result.success) {
      setStylePreferences(preferences);
      showToast({
        title: '🎨 Stil Tercihleri Kaydedildi',
        message: 'Stil tercihleriniz başarıyla kaydedildi. Kişiselleştirilmiş öneriler hazır!',
        type: 'success',
        autoClose: false,
        showPremium: true,
      });
      setStylePrefModalVisible(false);
    } else {
      showToast({
        title: 'Hata',
        message: 'Kaydedilemedi: ' + result.error,
        type: 'error',
        autoClose: true,
        autoCloseDelay: 2000,
      });
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    if (user) await loadFirestoreProfile();
    await loadStories();
    await loadTheme();
    await loadPrivacy();
    setTimeout(() => setRefreshing(false), 1000);
  }, [user]);

  const handleStyleSelect = (styleName) => {
    setCurrentStyle(styleName);
    setStyleData(STYLE_DETAILS[styleName] || {});
    setStyleModalVisible(false);
  };

  const handleCoverPress = (index) => {
    setSelectedCoverIndex(index);
    setCoverSettingsVisible(true);
  };

  const handleAddCover = () => {
    navigation.navigate('EditProfile', {
      profile,
      onSave: saveProfile,
    });
  };

  const handleChangeCover = async () => {
    try {
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

      const result = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
      });

      if (!result.canceled) {
        const uri = result.assets[0].uri;
        const coverKey = selectedCoverIndex === 0 ? 'coverImage' : 
                        selectedCoverIndex === 1 ? 'coverImage2' : 'coverImage3';
        const updatedProfile = { ...profile, [coverKey]: uri };
        await saveProfile(updatedProfile);
        setCoverSettingsVisible(false);
      }
    } catch (error) {
      console.error('Kapak değiştirme hatası:', error);
      showToast({
        title: 'Hata',
        message: 'Kapak fotoğrafı değiştirilemedi.',
        type: 'error',
        autoClose: true,
        autoCloseDelay: 2000,
      });
    }
  };

  const handleDeleteCover = () => {
    Alert.alert(
      'Fotoğrafı Sil',
      'Bu kapak fotoğrafını silmek istediğinize emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: () => {
            const coverKey = selectedCoverIndex === 0 ? 'coverImage' : 
                            selectedCoverIndex === 1 ? 'coverImage2' : 'coverImage3';
            const updatedProfile = { ...profile, [coverKey]: null };
            saveProfile(updatedProfile);
            setCoverSettingsVisible(false);
          }
        }
      ]
    );
  };

  const handleStatsPress = (type) => {
    if (type === 'posts') {
      navigation.navigate('PostsGallery');
    } else if (type === 'followers') {
      navigation.navigate('Followers', { type: 'followers' });
    } else if (type === 'following') {
      navigation.navigate('Followers', { type: 'following' });
    }
  };

  const handleEditProfile = () => {
    navigation.navigate('EditProfile', {
      profile,
      onSave: saveProfile,
    });
  };

  const handleToggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    showToast({
      title: 'Tema Değiştirildi',
      message: `${newTheme === 'dark' ? '🌙 Karanlık' : '☀️ Aydınlık'} tema aktif.`,
      type: 'info',
      autoClose: true,
      autoCloseDelay: 2000,
    });
  };

  const handleTogglePrivacy = () => {
    const newPrivacy = !isPrivate;
    setIsPrivate(newPrivacy);
    showToast({
      title: 'Hesap Gizliliği',
      message: `Hesabınız artık ${newPrivacy ? '🔒 Gizli' : '🌐 Herkese Açık'} olarak ayarlandı.\n\n${newPrivacy ? 'Sadece takip ettikleriniz görebilir.' : 'Herkes görebilir.'}`,
      type: 'info',
      autoClose: true,
      autoCloseDelay: 2500,
    });
  };

  const handleStoryPress = () => {
    if (stories.length === 0) {
      showToast({
        title: 'Bilgi',
        message: 'Henüz hikaye yok. İlk hikayeni paylaşmak ister misin?',
        type: 'info',
        autoClose: true,
        autoCloseDelay: 2000,
      });
      return;
    }
    setSelectedStoryIndex(0);
    setStoryViewerVisible(true);
  };

  const handleLogout = () => {
    Alert.alert(
      'Çıkış Yap',
      'Oturumunuzu kapatmak istediğinize emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        { 
          text: 'Çıkış Yap', 
          style: 'destructive', 
          onPress: async () => {
            try {
              await AsyncStorage.removeItem('modaverse_token');
              await AsyncStorage.removeItem('modaverse_user');
              navigation.navigate('Vitrinim');
            } catch (error) {
              console.error('Çıkış hatası:', error);
            }
          }
        }
      ]
    );
  };

  const coverImages = [
    profile.coverImage,
    profile.coverImage2,
    profile.coverImage3,
  ];

  const getThemeColors = () => {
    if (theme === 'dark') {
      return {
        background: '#121212',
        surface: '#1E1E1E',
        card: '#2D2D2D',
        border: '#3D3D3D',
        text: '#FFFFFF',
        textSecondary: '#AAAAAA',
        overlay: 'rgba(0,0,0,0.8)',
      };
    }
    return {
      background: COLORS.white,
      surface: COLORS.surface,
      card: COLORS.white,
      border: COLORS.grayLight,
      text: COLORS.black,
      textSecondary: COLORS.grayMedium,
      overlay: 'rgba(0,0,0,0.15)',
    };
  };

  const themeColors = getThemeColors();

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]}>
        <StatusBar barStyle={theme === 'dark' ? 'light-content' : 'dark-content'} backgroundColor={themeColors.background} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme === 'dark' ? COLORS.white : COLORS.black} />
          <Text style={[styles.loadingText, { color: themeColors.textSecondary, fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' }]}>Yükleniyor...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]}>
      <StatusBar barStyle={theme === 'dark' ? 'light-content' : 'dark-content'} backgroundColor={themeColors.background} />
      
      <ScrollView 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme === 'dark' ? COLORS.white : COLORS.black} />}
      >
        {/* Kapak Fotoğrafı Grid */}
        <View style={styles.profileContainer}>
          <CoverImageGrid 
            images={coverImages}
            onPressImage={handleCoverPress}
            onAddCover={handleAddCover}
          />
          <View style={[styles.profileOverlay, { backgroundColor: themeColors.overlay }]} />
          
          <View style={styles.profileHeader}>
            <TouchableOpacity style={styles.editCoverButton} onPress={handleAddCover}>
              <Ionicons name="camera-outline" size={14} color={COLORS.white} />
              <Text style={[styles.editCoverText, { fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' }]}>Kapak Değiştir</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.settingsButton} onPress={() => setSettingsMenuVisible(true)}>
              <Ionicons name="menu-outline" size={22} color={COLORS.white} />
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity style={styles.avatarContainer} onPress={handleStoryPress}>
            <Image source={{ uri: profile.avatar }} style={styles.avatar} />
            {stories.length > 0 && (
              <View style={[styles.avatarStoryRing, { borderColor: COLORS.cognac }]} />
            )}
            <TouchableOpacity style={styles.editAvatarButton} onPress={handleEditProfile}>
              <Ionicons name="camera" size={12} color={COLORS.white} />
            </TouchableOpacity>
            {stories.length > 0 && (
              <View style={styles.storyBadge}>
                <Text style={[styles.storyBadgeText, { fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' }]}>{stories.length}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Profil Bilgileri + Broş */}
        <View style={styles.profileInfo}>
          <View style={styles.profileNameRow}>
            <Text style={[styles.profileName, { color: themeColors.text, fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' }]}>{profile.name} {profile.surname}</Text>
            <View style={styles.badgeContainer}>
              <Text style={[styles.badgeText, { fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' }]}>{getUserTitle()}</Text>
            </View>
            <View style={[styles.privacyBadge, { backgroundColor: isPrivate ? COLORS.error : '#4CAF50' }]}>
              <Text style={[styles.privacyBadgeText, { fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' }]}>{isPrivate ? '🔒' : '🌐'}</Text>
            </View>
          </View>
          <Text style={[styles.profileBio, { color: themeColors.textSecondary, fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' }]}>{profile.bio}</Text>
        </View>

        {/* İstatistik */}
        <View style={[styles.statsContainer, { borderColor: themeColors.border }]}>
          <TouchableOpacity style={styles.statItem} onPress={() => handleStatsPress('posts')}>
            <Text style={[styles.statNumber, { color: themeColors.text, fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' }]}>{stats.posts}</Text>
            <Text style={[styles.statLabel, { color: themeColors.textSecondary, fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' }]}>PAYLAŞIM</Text>
          </TouchableOpacity>
          <View style={[styles.statDivider, { backgroundColor: themeColors.border }]} />
          <TouchableOpacity style={styles.statItem} onPress={() => handleStatsPress('followers')}>
            <Text style={[styles.statNumber, { color: themeColors.text, fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' }]}>{stats.followers}</Text>
            <Text style={[styles.statLabel, { color: themeColors.textSecondary, fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' }]}>TAKİPÇİ</Text>
          </TouchableOpacity>
          <View style={[styles.statDivider, { backgroundColor: themeColors.border }]} />
          <TouchableOpacity style={styles.statItem} onPress={() => handleStatsPress('following')}>
            <Text style={[styles.statNumber, { color: themeColors.text, fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' }]}>{stats.following}</Text>
            <Text style={[styles.statLabel, { color: themeColors.textSecondary, fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' }]}>TAKİP</Text>
          </TouchableOpacity>
        </View>

        {/* STİL KİMLİĞİ KARTLARI */}
        <StyleIdentityCards onCardPress={(item) => {
          if (item === 'seeAll') {
            showToast({
              title: 'Tüm Stiller',
              message: 'Tüm stil kimliği kartları gösteriliyor.',
              type: 'info',
              autoClose: true,
              autoCloseDelay: 1500,
            });
          } else {
            showToast({
              title: 'Stil Detayı',
              message: `${item.title} stili detayları gösteriliyor.`,
              type: 'info',
              autoClose: true,
              autoCloseDelay: 1500,
            });
          }
        }} />

        {/* KOLEKSİYONUM */}
        <MyCollection 
          items={collectionItems} 
          onItemPress={(item) => {
            if (item === 'seeAll') {
              showToast({
                title: 'Tüm Koleksiyon',
                message: 'Tüm koleksiyon öğeleri gösteriliyor.',
                type: 'info',
                autoClose: true,
                autoCloseDelay: 1500,
              });
            } else {
              showToast({
                title: 'Ürün Detayı',
                message: `${item.name} ürün detayları gösteriliyor.`,
                type: 'info',
                autoClose: true,
                autoCloseDelay: 1500,
              });
            }
          }}
        />

        {/* PREMİUM BİLGİLENDİRME KARTI */}
        <PremiumInfoCard onPress={() => {
          showToast({
            title: '✨ Premium',
            message: 'Premium özellikler gösteriliyor. Stil ilhamı almak ister misin?',
            type: 'success',
            autoClose: false,
            showPremium: true,
          });
        }} />

        {/* BEDEN ÖLÇÜLERİ KARTI */}
        <TouchableOpacity style={[styles.infoCard, { backgroundColor: themeColors.card, borderColor: themeColors.border }]} onPress={() => setBodyModalVisible(true)}>
          <View style={styles.infoCardHeader}>
            <Ionicons name="body-outline" size={20} color={themeColors.text} />
            <Text style={[styles.infoCardTitle, { color: themeColors.text, fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' }]}>Beden Ölçüleri</Text>
            <Ionicons name="chevron-forward" size={16} color={themeColors.textSecondary} style={{ marginLeft: 'auto' }} />
          </View>
          <View style={styles.infoCardPreview}>
            <Text style={[styles.previewText, { color: themeColors.textSecondary, fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' }]}>{bodyMeasurements.height ? `${bodyMeasurements.height} cm` : 'Boy: —'}</Text>
            <Text style={[styles.previewText, { color: themeColors.textSecondary, fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' }]}>{bodyMeasurements.topSize ? `${bodyMeasurements.topSize}` : 'Beden: —'}</Text>
            <Text style={[styles.previewText, { color: themeColors.textSecondary, fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' }]}>{bodyMeasurements.shoeSize ? `${bodyMeasurements.shoeSize} numara` : 'Ayakkabı: —'}</Text>
          </View>
        </TouchableOpacity>

        {/* STİL TERCİHLERİ KARTI */}
        <TouchableOpacity style={[styles.infoCard, { backgroundColor: themeColors.card, borderColor: themeColors.border }]} onPress={() => setStylePrefModalVisible(true)}>
          <View style={styles.infoCardHeader}>
            <Ionicons name="color-palette-outline" size={20} color={themeColors.text} />
            <Text style={[styles.infoCardTitle, { color: themeColors.text, fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' }]}>Stil Tercihleri</Text>
            <Ionicons name="chevron-forward" size={16} color={themeColors.textSecondary} style={{ marginLeft: 'auto' }} />
          </View>
          <View style={styles.infoCardPreview}>
            {stylePreferences.favoriteColors?.slice(0, 3).map((color, i) => (
              <View key={i} style={[styles.previewTag, { borderColor: themeColors.border }]}>
                <Text style={[styles.previewTagText, { color: themeColors.textSecondary, fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' }]}>{color}</Text>
              </View>
            ))}
            {(stylePreferences.favoriteColors?.length === 0) && (
              <Text style={[styles.previewText, { color: themeColors.textSecondary, fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' }]}>Renk tercihi eklenmedi</Text>
            )}
          </View>
        </TouchableOpacity>

        {/* Stil Kimliğim */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: themeColors.textSecondary, fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' }]}>STİL KİMLİĞİM</Text>
          <TouchableOpacity onPress={() => setStyleModalVisible(true)}>
            <Text style={[styles.sectionLink, { color: themeColors.text, fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' }]}>Tüm Tarzlar</Text>
          </TouchableOpacity>
        </View>

        {/* Aktif Tarz Özet Kartı */}
        <TouchableOpacity 
          style={[styles.activeStyleCard, { borderBottomColor: themeColors.border }]}
          onPress={() => setStyleModalVisible(true)}
          activeOpacity={0.7}
        >
          <View style={styles.activeStyleLeft}>
            <Text style={styles.activeStyleIcon}>{STYLES.find(s => s.name === currentStyle)?.icon}</Text>
            <View>
              <Text style={[styles.activeStyleName, { color: themeColors.text, fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' }]}>{currentStyle}</Text>
              <Text style={[styles.activeStyleRank, { color: themeColors.textSecondary, fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' }]}>Birincil Tarzın</Text>
            </View>
          </View>
          <View style={styles.activeStyleRight}>
            <Text style={[styles.activeStylePercentage, { color: themeColors.text, fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' }]}>%{STYLES.find(s => s.name === currentStyle)?.percentage}</Text>
            <Ionicons name="chevron-forward" size={16} color={themeColors.textSecondary} />
          </View>
        </TouchableOpacity>

        {/* Stil Kimliği - 7 Dikey Kart */}
        <View style={styles.styleIdentityGrid}>
          {STYLES.map((style) => (
            <StyleIdentityCard
              key={style.id}
              style={style}
              onPress={() => {
                setCurrentStyle(style.name);
                setStyleDetailVisible(true);
              }}
            />
          ))}
        </View>

        {/* AI Kombin Öneri Butonu */}
        <TouchableOpacity 
          style={styles.aiSuggestionButton}
          onPress={() => navigation.navigate('OutfitSuggestion')}
        >
          <Ionicons name="sparkles-outline" size={24} color={COLORS.white} />
          <View style={styles.aiSuggestionText}>
            <Text style={[styles.aiSuggestionTitle, { fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' }]}>YAPAY ZEKA KOMBİN ÖNER</Text>
            <Text style={[styles.aiSuggestionSubtitle, { fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' }]}>Gardırobuna göre stil önerileri al</Text>
          </View>
          <Ionicons name="arrow-forward" size={20} color={COLORS.white} />
        </TouchableOpacity>

        {/* Tüm Tarzlar Listesi */}
        <View style={styles.allStylesSection}>
          <Text style={[styles.allStylesTitle, { color: themeColors.textSecondary, fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' }]}>TÜM TARZLARIM</Text>
          {STYLES.map((style) => (
            <TouchableOpacity 
              key={style.id}
              style={[styles.miniStyleItem, { borderBottomColor: themeColors.border }]}
              onPress={() => {
                setCurrentStyle(style.name);
                setStyleDetailVisible(true);
              }}
            >
              <View style={styles.miniStyleLeft}>
                <Text style={styles.miniStyleIcon}>{style.icon}</Text>
                <View>
                  <Text style={[styles.miniStyleName, { color: themeColors.text, fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' }]}>{style.name}</Text>
                  <Text style={[styles.miniStyleRank, { color: themeColors.textSecondary, fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' }]}>{style.rankLabel}</Text>
                </View>
              </View>
              <Text style={[styles.miniStylePercentage, { color: themeColors.text, fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' }]}>%{style.percentage}</Text>
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

      <StyleDetailModal
        visible={styleDetailVisible}
        styleName={currentStyle}
        onClose={() => setStyleDetailVisible(false)}
      />

      <SettingsMenuModal
        visible={settingsMenuVisible}
        theme={theme}
        onClose={() => setSettingsMenuVisible(false)}
        onToggleTheme={handleToggleTheme}
        onLogout={handleLogout}
        onNavigate={navigation.navigate}
        isPrivate={isPrivate}
        onTogglePrivacy={handleTogglePrivacy}
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

      <StoryViewerModal
        visible={storyViewerVisible}
        stories={stories}
        initialIndex={selectedStoryIndex}
        onClose={() => setStoryViewerVisible(false)}
      />

      <CoverSettingsModal
        visible={coverSettingsVisible}
        imageIndex={selectedCoverIndex}
        onClose={() => setCoverSettingsVisible(false)}
        onChange={handleChangeCover}
        onDelete={handleDeleteCover}
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
  },
  loadingContainer: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    gap: SIZES.md 
  },
  loadingText: { 
    ...TYPOGRAPHY.bodySmall,
  },
  scrollContent: { 
    paddingBottom: SIZES.xxl 
  },
  
  // PROFİL BÖLÜMÜ (Kapak Grid)
  profileContainer: { 
    position: 'relative', 
    marginBottom: SIZES.xl,
    height: 280,
  },
  profileOverlay: { 
    position: 'absolute', 
    top: 0, 
    left: 0, 
    right: 0, 
    bottom: 0, 
  },
  profileHeader: { 
    position: 'absolute', 
    top: Platform.OS === 'ios' ? 50 : 20, 
    left: 0, 
    right: 0, 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingHorizontal: SIZES.md,
    zIndex: 10,
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
    left: SIZES.lg,
    zIndex: 10,
  },
  avatar: { 
    width: 100, 
    height: 100, 
    borderRadius: 0, 
    borderWidth: 2, 
    borderColor: COLORS.white, 
    backgroundColor: COLORS.surface 
  },
  avatarStoryRing: {
    position: 'absolute',
    top: -4,
    left: -4,
    right: -4,
    bottom: -4,
    borderRadius: 54,
    borderWidth: 3,
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
  storyBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: COLORS.cognac,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  storyBadgeText: {
    ...TYPOGRAPHY.caption,
    fontSize: 8,
    color: COLORS.white,
    fontWeight: '600',
  },

  // KAPAK GRID STILLERİ
  coverGridContainer: {
    flexDirection: 'row',
    width: width,
    height: 280,
  },
  coverGridLarge: {
    width: width * 0.6,
    height: 280,
    position: 'relative',
  },
  coverGridRight: {
    width: width * 0.4,
    height: 280,
  },
  coverGridSmall: {
    width: width * 0.4,
    height: 140,
    position: 'relative',
  },
  coverGridSingle: {
    width: width,
    height: 280,
    position: 'relative',
  },
  coverGridImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  coverGridPlaceholder: {
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
  },
  coverGridPlaceholderText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.grayMedium,
  },
  coverGridOverlay: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  coverGridCount: {
    ...TYPOGRAPHY.caption,
    fontSize: 9,
    color: COLORS.white,
  },

  // KAPAK AYARLAR MODALI
  coverSettingsContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: SIZES.lg,
    width: width * 0.85,
    alignSelf: 'center',
  },
  coverSettingsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.md,
    paddingBottom: SIZES.sm,
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.grayLight,
  },
  coverSettingsTitle: {
    ...TYPOGRAPHY.body,
    fontWeight: '500',
  },
  coverSettingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.md,
    paddingVertical: SIZES.md,
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.grayLight,
  },
  coverSettingsDanger: {
    borderBottomWidth: 0,
  },
  coverSettingsText: {
    ...TYPOGRAPHY.body,
    fontSize: 14,
  },
  coverSettingsDangerText: {
    color: COLORS.error,
  },

  // PROFİL BİLGİLERİ + BROŞ
  profileInfo: { 
    marginTop: 80, 
    paddingHorizontal: SIZES.lg, 
    marginBottom: SIZES.md 
  },
  profileNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: SIZES.sm,
    marginBottom: SIZES.xs,
  },
  profileName: { 
    ...TYPOGRAPHY.title2,
  },
  badgeContainer: {
    backgroundColor: COLORS.cognac,
    paddingHorizontal: SIZES.sm,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgeText: {
    ...TYPOGRAPHY.caption,
    fontSize: 8,
    color: COLORS.white,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  privacyBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  privacyBadgeText: {
    fontSize: 10,
    color: COLORS.white,
  },
  profileBio: { 
    ...TYPOGRAPHY.body,
    lineHeight: 20 
  },

  // İSTATİSTİK
  statsContainer: { 
    flexDirection: 'row', 
    justifyContent: 'space-around', 
    paddingVertical: SIZES.md,
    marginHorizontal: SIZES.lg,
    marginBottom: SIZES.xl,
    borderTopWidth: 0.5,
    borderBottomWidth: 0.5,
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
  },
  statDivider: { 
    width: 0.5, 
  },

  // BİLGİ KARTI
  infoCard: {
    marginHorizontal: SIZES.lg,
    marginBottom: SIZES.md,
    padding: SIZES.md,
    borderWidth: 0.5,
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
  },
  previewTag: {
    paddingHorizontal: SIZES.sm,
    paddingVertical: 2,
    borderWidth: 0.5,
  },
  previewTagText: {
    ...TYPOGRAPHY.caption,
    fontSize: 9,
  },

  // ============================================================
  // 🆕 STİL KİMLİĞİ KARTLARI (YENİ)
  // ============================================================
  styleIdentityContainer: {
    marginHorizontal: SIZES.lg,
    marginBottom: SIZES.md,
  },
  styleIdentityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.sm,
  },
  styleIdentityTitle: {
    ...TYPOGRAPHY.caption,
    fontSize: 12,
    letterSpacing: 1,
  },
  styleIdentitySeeAll: {
    ...TYPOGRAPHY.caption,
    fontSize: 9,
  },
  styleIdentityList: {
    gap: SIZES.sm,
  },
  styleIdentityCard: {
    width: 150,
    height: 200,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 0.5,
    marginRight: 10,
  },
  styleIdentityImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  styleIdentityOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 10,
  },
  styleIdentityContent: {
    gap: 4,
  },
  styleIdentityCardTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  styleIdentityStats: {
    flexDirection: 'row',
    gap: 12,
  },
  styleIdentityStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  styleIdentityStatText: {
    fontSize: 10,
    color: '#FFFFFF',
  },

  // ============================================================
  // 🆕 KOLEKSİYONUM (YENİ TASARIM)
  // ============================================================
  collectionContainer: {
    marginHorizontal: SIZES.lg,
    marginBottom: SIZES.md,
  },
  collectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.sm,
  },
  collectionTitle: {
    ...TYPOGRAPHY.caption,
    fontSize: 12,
    letterSpacing: 1,
  },
  collectionSeeAll: {
    ...TYPOGRAPHY.caption,
    fontSize: 9,
  },
  collectionList: {
    gap: SIZES.sm,
  },
  collectionItem: {
    width: 100,
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 0.5,
    marginRight: 10,
  },
  collectionItemImage: {
    width: '100%',
    height: 130,
    resizeMode: 'cover',
  },
  collectionItemInfo: {
    padding: 8,
    gap: 2,
  },
  collectionItemName: {
    fontSize: 10,
    fontWeight: '500',
  },
  collectionItemBrand: {
    fontSize: 8,
    fontWeight: '400',
  },
  collectionItemPrice: {
    fontSize: 10,
    fontWeight: '600',
  },
  collectionEmptyContainer: {
    marginHorizontal: SIZES.lg,
    padding: 30,
    borderRadius: 12,
    borderWidth: 0.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SIZES.md,
  },
  collectionEmptyTitle: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 8,
  },
  collectionEmptyText: {
    fontSize: 10,
    fontWeight: '400',
    textAlign: 'center',
    marginTop: 4,
  },

  // ============================================================
  // 🆕 PREMİUM BİLGİLENDİRME KARTI (YENİ TASARIM)
  // ============================================================
  premiumCard: {
    marginHorizontal: SIZES.lg,
    borderRadius: 14,
    overflow: 'hidden',
    marginBottom: SIZES.md,
    borderWidth: 0.5,
  },
  premiumCardContent: {
    padding: 16,
    gap: 12,
  },
  premiumCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  premiumCardIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,215,0,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  premiumCardBadge: {
    backgroundColor: 'rgba(255,215,0,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
  },
  premiumCardBadgeText: {
    fontSize: 8,
    fontWeight: '700',
    color: '#FFD700',
    letterSpacing: 1,
  },
  premiumCardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  premiumCardSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    lineHeight: 18,
  },
  premiumCardFeatures: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  premiumCardFeature: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.05)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  premiumCardFeatureText: {
    fontSize: 9,
    color: 'rgba(255,255,255,0.7)',
  },
  premiumCardButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingVertical: 10,
    borderRadius: 10,
    marginTop: 4,
  },
  premiumCardButtonText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: 1,
  },

  // SECTION HEADER
  sectionHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingHorizontal: SIZES.lg, 
    marginBottom: SIZES.md 
  },
  sectionTitle: { 
    ...TYPOGRAPHY.caption,
  },
  sectionLink: { 
    ...TYPOGRAPHY.caption,
  },

  // AKTİF TARZ KARTI
  activeStyleCard: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginHorizontal: SIZES.lg, 
    marginBottom: SIZES.lg, 
    paddingVertical: SIZES.md,
    borderBottomWidth: 0.5,
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

  // STİL KİMLİĞİM - 7 DİKEY KART
  styleIdentityGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: SIZES.lg,
    gap: SIZES.sm,
    marginBottom: SIZES.xl,
  },
  styleIdentityCard: {
    width: (width - (SIZES.lg * 2 + SIZES.sm * 2)) / 3,
    padding: SIZES.sm,
    borderWidth: 0.5,
    alignItems: 'center',
  },
  styleIdentityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  styleIdentityIcon: {
    fontSize: 16,
  },
  styleIdentityName: {
    ...TYPOGRAPHY.caption,
    fontSize: 9,
    fontWeight: '500',
  },
  styleIdentityProgress: {
    width: '100%',
    height: 3,
    backgroundColor: COLORS.grayLight,
    borderRadius: 2,
    marginVertical: 4,
  },
  styleIdentityBar: {
    height: 3,
    borderRadius: 2,
  },
  styleIdentityPercent: {
    ...TYPOGRAPHY.caption,
    fontSize: 10,
    fontWeight: '600',
  },
  styleIdentityRank: {
    ...TYPOGRAPHY.caption,
    fontSize: 7,
    color: COLORS.grayMedium,
  },

  // STİL DETAY MODALI
  styleDetailContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: SIZES.lg,
    width: width * 0.92,
    maxHeight: height * 0.8,
    alignSelf: 'center',
  },
  styleDetailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.md,
    paddingBottom: SIZES.sm,
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.grayLight,
  },
  styleDetailTitle: {
    ...TYPOGRAPHY.title3,
    fontSize: 18,
  },
  styleDetailSection: {
    marginBottom: SIZES.md,
  },
  styleDetailSectionTitle: {
    ...TYPOGRAPHY.caption,
    fontSize: 11,
    color: COLORS.grayMedium,
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  styleDetailItem: {
    ...TYPOGRAPHY.bodySmall,
    fontSize: 13,
    paddingVertical: 2,
    color: COLORS.black,
  },
  styleDetailColors: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  styleDetailColorChip: {
    paddingHorizontal: SIZES.sm,
    paddingVertical: 2,
    borderRadius: 12,
    borderWidth: 0.5,
    borderColor: COLORS.grayLight,
  },
  styleDetailColorText: {
    ...TYPOGRAPHY.caption,
    fontSize: 9,
    color: COLORS.white,
  },

  // AI KOMBİN ÖNERİ BUTONU
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

  // TÜM TARZLAR
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
  },
  miniStylePercentage: { 
    ...TYPOGRAPHY.body,
    fontWeight: '500' 
  },

  // MODAL STILLERİ
  modalOverlay: { 
    flex: 1, 
    backgroundColor: 'rgba(0,0,0,0.8)', 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  modalContent: { 
    backgroundColor: COLORS.white, 
    padding: SIZES.lg, 
    width: width * 0.92, 
    maxHeight: height * 0.9,
    borderRadius: 20,
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

  // FORM STILLERİ
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

  // PREMIUM SAVE BUTTON
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

  // STİL TERCİHLERİ MODAL BUTONLARI
  modalButtonsEqual: {
    flexDirection: 'row',
    gap: SIZES.md,
    marginTop: SIZES.lg,
    marginBottom: SIZES.lg,
  },
  cancelButtonEqual: {
    flex: 1,
    paddingVertical: SIZES.md,
    alignItems: 'center',
    borderWidth: 0.5,
    borderColor: COLORS.grayLight,
    borderRadius: 8,
  },
  cancelButtonTextEqual: {
    ...TYPOGRAPHY.caption,
    fontSize: 12,
    color: COLORS.grayMedium,
  },
  saveButtonEqual: {
    flex: 1,
    paddingVertical: SIZES.md,
    alignItems: 'center',
    backgroundColor: COLORS.black,
    borderRadius: 8,
  },
  saveButtonTextEqual: {
    ...TYPOGRAPHY.button,
    fontSize: 12,
    color: COLORS.white,
    letterSpacing: 1,
  },

  // TAG CONTAINER
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

  // BEDEN ÖLÇÜLERİ
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

  // TARZ SEÇİM MODAL
  styleModalContainer: { backgroundColor: COLORS.white, width: width * 0.92, maxHeight: height * 0.8, padding: SIZES.lg, borderRadius: 20 },
  styleModalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SIZES.lg, paddingBottom: SIZES.md, borderBottomWidth: 0.5, borderBottomColor: COLORS.grayLight },
  styleModalTitle: { ...TYPOGRAPHY.title3 },
  styleModalList: { gap: SIZES.md },
  styleModalItem: { flexDirection: 'row', alignItems: 'center', padding: SIZES.md, backgroundColor: COLORS.surface, gap: SIZES.md, borderRadius: 8 },
  styleModalItemActive: { borderWidth: 0.5, borderColor: COLORS.black },
  styleModalIcon: { fontSize: 24 },
  styleModalInfo: { flex: 1 },
  styleModalName: { ...TYPOGRAPHY.body, fontWeight: '500' },
  styleModalNameActive: { fontWeight: '600' },
  styleModalRankBadge: { marginTop: 2 },
  styleModalRankText: { ...TYPOGRAPHY.caption },
  styleModalPercentage: { marginRight: SIZES.sm },
  styleModalPercentageText: { ...TYPOGRAPHY.body, fontWeight: '500' },

  // AYARLAR MENÜSÜ
  settingsMenuContainer: { 
    backgroundColor: COLORS.white, 
    width: width * 0.92, 
    maxHeight: height * 0.8,
    borderRadius: 20,
    paddingBottom: SIZES.md,
  },
  settingsMenuHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    padding: SIZES.lg, 
    borderBottomWidth: 0.5, 
    borderBottomColor: COLORS.grayLight 
  },
  settingsMenuTitle: { 
    ...TYPOGRAPHY.title3 
  },
  settingsMenuItem: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingVertical: SIZES.md,
    paddingHorizontal: SIZES.lg,
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.grayLight,
  },
  settingsMenuItemDanger: {
    borderBottomWidth: 0,
  },
  settingsMenuItemLeft: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: SIZES.md 
  },
  settingsMenuItemText: { 
    ...TYPOGRAPHY.body,
    fontSize: 14,
  },
  settingsMenuItemTextDanger: { 
    color: COLORS.error,
  },

  // STORY VIEWER
  storyViewerContainer: {
    flex: 1,
    backgroundColor: COLORS.black,
  },
  storyViewerClose: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 30,
    right: SIZES.lg,
    zIndex: 20,
    padding: 8,
  },
  storyViewerSlide: {
    width: width,
    height: height,
    justifyContent: 'center',
    alignItems: 'center',
  },
  storyViewerImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  storyViewerOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: SIZES.lg,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  storyViewerUser: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.sm,
  },
  storyViewerAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.white,
  },
  storyViewerUserName: {
    ...TYPOGRAPHY.body,
    color: COLORS.white,
    fontWeight: '500',
  },
  storyViewerTime: {
    ...TYPOGRAPHY.caption,
    fontSize: 10,
    color: 'rgba(255,255,255,0.7)',
    marginLeft: 'auto',
  },
  storyViewerProgress: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 30,
    left: SIZES.lg,
    right: SIZES.lg,
    flexDirection: 'row',
    gap: 4,
    zIndex: 10,
  },
  storyViewerProgressBar: {
    flex: 1,
    height: 3,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  storyViewerProgressBarActive: {
    backgroundColor: COLORS.white,
  },
});

export default StilimScreen;