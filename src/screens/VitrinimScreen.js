// 📁 src/screens/VitrinimScreen.js - TAM REVİZE (Premium Kart Eklendi)

import React, { useState, useRef, useEffect, useCallback, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  TextInput,
  ScrollView,
  Dimensions,
  Animated,
  RefreshControl,
  Alert,
  Modal,
  Share,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY, SIZES, getThemeColors } from '../constants/Theme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { auth } from '../config/firebase';
import { ThemeContext } from '../../App';

// ============================================================
// 📌 TOAST İMPORTU
// ============================================================
import { showToast } from '../components/CustomAlert';

// ============================================================
// 📌 SERVİS İMPORTLARI
// ============================================================
import api from '../services/api';
import imagePoolService from '../services/imagePoolService';
import aiAdvisorService from '../services/aiAdvisorService';
import brandService from '../services/brandService';

// ============================================================
// 📌 LOCAL OUTFIT API (FALLBACK)
// ============================================================
const outfitAPI = {
  getFeed: async () => {
    try {
      const response = await api.get('/api/outfits/feed');
      return response.data;
    } catch (error) {
      console.error('Feed yükleme hatası:', error);
      return {
        success: true,
        posts: [
          {
            id: '1',
            user_name: 'Moda Sever',
            user_avatar: 'https://i.pravatar.cc/100?img=1',
            title: 'Bugünün kombinim 🌸',
            description: 'Bahar havası için hafif ve renkli parçalar',
            image_url: 'https://picsum.photos/id/1/400/300',
            like_count: 42,
            comment_count: 12,
            created_at: new Date().toISOString(),
            concept_category: '#BaharModası',
            brand: 'Mavi',
            location: 'İstanbul',
            tags: '#bahar #kombin #moda'
          },
        ]
      };
    }
  },
  createOutfit: async (data) => {
    try {
      const response = await api.post('/api/outfits', data);
      return response.data;
    } catch (error) {
      console.error('Outfit oluşturma hatası:', error);
      const existing = await AsyncStorage.getItem('@outfits');
      const outfits = existing ? JSON.parse(existing) : [];
      const newOutfit = {
        id: `local_${Date.now()}`,
        ...data,
        createdAt: new Date().toISOString(),
        success: true,
      };
      outfits.push(newOutfit);
      await AsyncStorage.setItem('@outfits', JSON.stringify(outfits));
      return { success: true, data: newOutfit };
    }
  }
};

const wardrobeAPI = {
  getStats: async (userId) => {
    try {
      const response = await api.get(`/api/wardrobe/stats/${userId}`);
      return response.data;
    } catch (error) {
      return { success: true, stats: {} };
    }
  },
  getAllItems: async (userId) => {
    try {
      const response = await api.get(`/api/wardrobe/${userId}`);
      return response.data;
    } catch (error) {
      return { success: true, categories: {} };
    }
  },
  toggleStar: async (userId, productId, isStar) => {
    try {
      const response = await api.post(`/api/wardrobe/star`, { userId, productId, isStar });
      return response.data;
    } catch (error) {
      return { success: true };
    }
  }
};

// ============================================================
// 📌 KATEGORİLER & CONSTANTS
// ============================================================
const CATEGORIES = [
  { id: 'all', name: 'TÜMÜ', icon: 'grid-outline' },
  { id: 'üst', name: 'ÜST', icon: 'shirt-outline' },
  { id: 'alt', name: 'ALT', icon: 'walk-outline' },
  { id: 'ayakkabı', name: 'AYAKKABI', icon: 'footsteps-outline' },
  { id: 'ceket', name: 'CEKET', icon: 'umbrella-outline' },
  { id: 'elbise', name: 'ELBİSE', icon: 'flower-outline' },
];

const POPULAR_SEARCHES = [
  'Elbise',
  'T-Shirt',
  'Pantolon',
  'Ceket',
  'Ayakkabı',
  'Etek',
];

const STORY_STORAGE_KEY = '@user_stories';

const { width, height } = Dimensions.get('window');

// ============================================================
// 📌 HELPERS
// ============================================================
const formatNumber = (num) => {
  if (!num) return '0';
  if (typeof num === 'string' && num.includes('K')) return num;
  const n = parseInt(num);
  return n >= 1000 ? (n / 1000).toFixed(1) + 'K' : num.toString();
};

const formatPrice = (price) => {
  if (!price) return '0';
  return Math.round(price).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};

// ============================================================
// 📌 1. STORY ACTION PANEL (KART İÇİNDE KART - EKRAN ORTASINDA)
// ============================================================
const StoryActionPanel = ({ visible, onClose, onSelect }) => {
  const { theme } = useContext(ThemeContext);
  const isDark = theme === 'dark';

  const actions = [
    { id: 'story', label: 'Hikaye Paylaş', icon: 'camera-outline', description: '24 saatlik hikaye paylaş' },
    { id: 'post', label: 'Gönderi Paylaş', icon: 'image-outline', description: 'Kalıcı gönderi paylaş' },
    { id: 'hashtag', label: 'Hashtag Paylaş', icon: 'pricetag-outline', description: 'Trend hashtag oluştur' },
  ];

  const colors = {
    bg: isDark ? '#1A1A1A' : '#FFFFFF',
    card: isDark ? '#2D2D2D' : '#F8F8F8',
    text: isDark ? '#FFFFFF' : '#1A1A1A',
    sub: isDark ? '#888888' : '#999999',
    border: isDark ? '#3D3D3D' : '#EEEEEE',
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity style={styles.backdropCenter} activeOpacity={1} onPress={onClose}>
        <View style={[styles.mainCard, { backgroundColor: colors.bg }]}>
          <View style={styles.cardHeader}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>Paylaşım Yap</Text>
            <TouchableOpacity onPress={onClose} style={styles.cardClose}>
              <Ionicons name="close" size={22} color={colors.text} />
            </TouchableOpacity>
          </View>

          <View style={[styles.cardDivider, { backgroundColor: colors.border }]} />

          {actions.map((action, index) => (
            <TouchableOpacity
              key={action.id}
              style={[
                styles.actionCard,
                { backgroundColor: colors.card, borderColor: colors.border },
                index < actions.length - 1 && styles.actionCardBorder
              ]}
              onPress={() => { onSelect(action.id); onClose(); }}
            >
              <View style={[styles.actionIconWrap, { backgroundColor: isDark ? '#3D3D3D' : '#EEEEEE' }]}>
                <Ionicons name={action.icon} size={24} color={colors.text} />
              </View>
              <View style={styles.actionTextWrap}>
                <Text style={[styles.actionLabel, { color: colors.text }]}>{action.label}</Text>
                <Text style={[styles.actionDesc, { color: colors.sub }]}>{action.description}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.sub} />
            </TouchableOpacity>
          ))}

          <TouchableOpacity style={styles.cardCancel} onPress={onClose}>
            <Text style={[styles.cardCancelText, { color: colors.sub }]}>İptal</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

// ============================================================
// 📌 2. STORY MODAL (EKRAN ORTASINDA YÜZER PENCERE)
// ============================================================
const StoryModal = ({ visible, onClose, onShare, user }) => {
  const { theme } = useContext(ThemeContext);
  const isDark = theme === 'dark';

  const [mediaItems, setMediaItems] = useState([]);
  const [caption, setCaption] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [audience, setAudience] = useState('everyone');
  const [location, setLocation] = useState('');
  const [productTags, setProductTags] = useState([]);
  const [userTags, setUserTags] = useState([]);

  const colors = {
    bg: isDark ? '#1A1A1A' : '#FFFFFF',
    card: isDark ? '#2D2D2D' : '#F8F8F8',
    text: isDark ? '#FFFFFF' : '#1A1A1A',
    sub: isDark ? '#888888' : '#999999',
    border: isDark ? '#3D3D3D' : '#EEEEEE',
    input: isDark ? '#2D2D2D' : '#F5F5F5',
  };

  const audienceOptions = [
    { id: 'everyone', label: 'Herkes' },
    { id: 'close_friends', label: 'Yakın Arkadaşlar' },
    { id: 'followers', label: 'Takipçiler' },
  ];

  useEffect(() => {
    if (!visible) {
      setMediaItems([]);
      setCaption('');
      setLocation('');
      setProductTags([]);
      setUserTags([]);
    }
  }, [visible]);

  const pickMedia = async () => {
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
      aspect: [9, 16],
      quality: 0.9,
    });
    if (!result.canceled) {
      setMediaItems([...mediaItems, { uri: result.assets[0].uri, id: Date.now().toString() }]);
    }
  };

  const removeMedia = (index) => {
    const newMedia = [...mediaItems];
    newMedia.splice(index, 1);
    setMediaItems(newMedia);
  };

  const handleShare = async () => {
    if (mediaItems.length === 0) {
      showToast({
        title: 'Uyarı',
        message: 'Lütfen en az bir fotoğraf seçin!',
        type: 'warning',
        autoClose: true,
        autoCloseDelay: 2000,
      });
      return;
    }
    setIsLoading(true);
    try {
      const newStory = {
        id: Date.now().toString(),
        userId: user?.uid || 'guest',
        userName: user?.displayName || 'Kullanıcı',
        userAvatar: user?.photoURL || 'https://i.pravatar.cc/100',
        media: mediaItems,
        caption: caption.trim() || '',
        audience: audience,
        location: location.trim(),
        productTags: productTags,
        userTags: userTags,
        createdAt: new Date().toISOString(),
      };

      const existing = await AsyncStorage.getItem(STORY_STORAGE_KEY);
      const stories = existing ? JSON.parse(existing) : [];
      stories.push(newStory);
      await AsyncStorage.setItem(STORY_STORAGE_KEY, JSON.stringify(stories));

      showToast({
        title: '📸 Hikaye Paylaşıldı',
        message: 'Hikayeniz 24 saat boyunca görünür olacak. Stil ilhamı almak ister misin?',
        type: 'success',
        autoClose: false,
        showPremium: true,
      });
      onShare(newStory);
      onClose();
    } catch (error) {
      showToast({
        title: 'Hata',
        message: 'Hikaye paylaşılamadı.',
        type: 'error',
        autoClose: true,
        autoCloseDelay: 2000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity style={styles.backdropCenter} activeOpacity={1} onPress={onClose}>
        <View style={[styles.mainCard, { backgroundColor: colors.bg }]}>
          <View style={styles.cardHeader}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>Hikaye Paylaş</Text>
            <TouchableOpacity onPress={onClose} style={styles.cardClose}>
              <Ionicons name="close" size={22} color={colors.text} />
            </TouchableOpacity>
          </View>

          <View style={[styles.cardDivider, { backgroundColor: colors.border }]} />

          <ScrollView showsVerticalScrollIndicator={false} style={styles.modalScrollCenter}>
            <TouchableOpacity 
              style={[styles.contentCard, { backgroundColor: colors.card, borderColor: colors.border, padding: 0, overflow: 'hidden' }]} 
              onPress={pickMedia}
            >
              {mediaItems.length > 0 ? (
                <View style={styles.mediaHeroContainer}>
                  <Image source={{ uri: mediaItems[0].uri }} style={styles.mediaHero} />
                  <TouchableOpacity style={styles.mediaEditBtn}>
                    <Ionicons name="create-outline" size={18} color="#FFFFFF" />
                  </TouchableOpacity>
                  {mediaItems.length > 1 && (
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.mediaThumbs}>
                      {mediaItems.map((item, idx) => (
                        <TouchableOpacity key={item.id} style={styles.mediaThumbWrap} onPress={() => removeMedia(idx)}>
                          <Image source={{ uri: item.uri }} style={styles.mediaThumb} />
                          {idx > 0 && (
                            <View style={styles.mediaThumbRemove}>
                              <Ionicons name="close" size={10} color="#FFFFFF" />
                            </View>
                          )}
                        </TouchableOpacity>
                      ))}
                      <TouchableOpacity style={[styles.mediaThumbAdd, { borderColor: colors.border }]} onPress={pickMedia}>
                        <Ionicons name="add" size={20} color={colors.sub} />
                      </TouchableOpacity>
                    </ScrollView>
                  )}
                  <View style={styles.mediaCounter}>
                    <Text style={styles.mediaCounterText}>1/{mediaItems.length}</Text>
                  </View>
                </View>
              ) : (
                <View style={styles.contentPlaceholder}>
                  <View style={[styles.iconCircle, { backgroundColor: isDark ? '#3D3D3D' : '#E8E8E8' }]}>
                    <Ionicons name="camera-outline" size={28} color={colors.text} />
                  </View>
                  <Text style={[styles.placeholderText, { color: colors.sub }]}>
                    Hikaye için fotoğraf seç
                  </Text>
                  <Text style={[styles.subText, { color: colors.sub }]}>9:16 oranında</Text>
                </View>
              )}
            </TouchableOpacity>

            <View style={[styles.contentCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <TextInput
                style={[styles.contentInput, { color: colors.text }]}
                placeholder="Kombininden veya stilinden bahset..."
                placeholderTextColor={colors.sub}
                value={caption}
                onChangeText={setCaption}
                maxLength={500}
                multiline
              />
              <Text style={[styles.charCount, { color: colors.sub }]}>{caption.length}/500</Text>
            </View>

            <View style={[styles.contentCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.sectionLabel, { color: colors.sub }]}>Kimler Görebilir?</Text>
              <View style={styles.audienceOptions}>
                {audienceOptions.map((option) => (
                  <TouchableOpacity
                    key={option.id}
                    style={[
                      styles.audienceOption,
                      audience === option.id && styles.audienceOptionActive,
                      { 
                        borderColor: audience === option.id ? colors.text : colors.border,
                        backgroundColor: audience === option.id ? colors.text : 'transparent',
                      }
                    ]}
                    onPress={() => setAudience(option.id)}
                  >
                    <Text style={[
                      styles.audienceLabel,
                      { color: audience === option.id ? colors.bg : colors.sub }
                    ]}>
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <TouchableOpacity style={[styles.listItem, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Ionicons name="location-outline" size={20} color={colors.text} />
              <Text style={[styles.listItemText, { color: colors.sub }]}>
                {location || '📍 Konum Ekle'}
              </Text>
              <Ionicons name="chevron-forward" size={18} color={colors.sub} style={{ marginLeft: 'auto' }} />
            </TouchableOpacity>

            <TouchableOpacity style={[styles.listItem, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Ionicons name="pricetag-outline" size={20} color={colors.text} />
              <Text style={[styles.listItemText, { color: colors.sub }]}>
                🏷️ Ürün / Marka Etiketle
              </Text>
              <Ionicons name="chevron-forward" size={18} color={colors.sub} style={{ marginLeft: 'auto' }} />
            </TouchableOpacity>

            <TouchableOpacity style={[styles.listItem, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Ionicons name="person-add-outline" size={20} color={colors.text} />
              <Text style={[styles.listItemText, { color: colors.sub }]}>
                👤 Kullanıcı Etiketle
              </Text>
              <Ionicons name="chevron-forward" size={18} color={colors.sub} style={{ marginLeft: 'auto' }} />
            </TouchableOpacity>
          </ScrollView>

          <TouchableOpacity
            style={[styles.shareButton, (mediaItems.length === 0 || isLoading) && styles.shareButtonDisabled]}
            onPress={handleShare}
            disabled={mediaItems.length === 0 || isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.shareButtonText}>Hikayeyi Paylaş</Text>
            )}
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

// ============================================================
// 📌 3. NEW POST MODAL (EKRAN ORTASINDA YÜZER PENCERE)
// ============================================================
const NewPostModal = ({ visible, onClose, onPost, user }) => {
  const { theme } = useContext(ThemeContext);
  const isDark = theme === 'dark';

  const [caption, setCaption] = useState('');
  const [mediaItems, setMediaItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [category, setCategory] = useState('moda');
  const [location, setLocation] = useState('');
  const [productTags, setProductTags] = useState([]);
  const [userTags, setUserTags] = useState([]);

  const colors = {
    bg: isDark ? '#1A1A1A' : '#FFFFFF',
    card: isDark ? '#2D2D2D' : '#F8F8F8',
    text: isDark ? '#FFFFFF' : '#1A1A1A',
    sub: isDark ? '#888888' : '#999999',
    border: isDark ? '#3D3D3D' : '#EEEEEE',
    input: isDark ? '#2D2D2D' : '#F5F5F5',
  };

  const categories = [
    'Moda', 'Street', 'Lüks', 'Vintage', 'Spor',
    'Klasik', 'Boho', 'Minimal', 'Glamour', 'Yaz'
  ];

  useEffect(() => {
    if (!visible) {
      setMediaItems([]);
      setCaption('');
      setLocation('');
      setCategory('moda');
      setProductTags([]);
      setUserTags([]);
    }
  }, [visible]);

  const pickMedia = async () => {
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
      aspect: [1, 1],
      quality: 0.9,
    });
    if (!result.canceled) {
      setMediaItems([...mediaItems, { uri: result.assets[0].uri, id: Date.now().toString() }]);
    }
  };

  const removeMedia = (index) => {
    const newMedia = [...mediaItems];
    newMedia.splice(index, 1);
    setMediaItems(newMedia);
  };

  const handlePost = async () => {
    if (mediaItems.length === 0) {
      showToast({
        title: 'Uyarı',
        message: 'Lütfen en az bir fotoğraf seçin!',
        type: 'warning',
        autoClose: true,
        autoCloseDelay: 2000,
      });
      return;
    }
    setIsLoading(true);
    try {
      const postData = {
        id: Date.now().toString(),
        userId: user?.uid || 'guest',
        userName: user?.displayName || 'Kullanıcı',
        userAvatar: user?.photoURL || 'https://i.pravatar.cc/100',
        media: mediaItems,
        caption: caption.trim() || 'Yeni paylaşım',
        category: category,
        location: location.trim(),
        productTags: productTags,
        userTags: userTags,
        createdAt: new Date().toISOString(),
      };

      const response = await outfitAPI.createOutfit(postData);
      if (response?.success) {
        showToast({
          title: '✨ Gönderi Paylaşıldı',
          message: 'Kombinin herkes tarafından beğenilecek! Stil ilhamı almak ister misin?',
          type: 'success',
          autoClose: false,
          showPremium: true,
        });
        onPost();
        onClose();
      }
    } catch (error) {
      showToast({
        title: 'Hata',
        message: 'Paylaşım başarısız oldu.',
        type: 'error',
        autoClose: true,
        autoCloseDelay: 2000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity style={styles.backdropCenter} activeOpacity={1} onPress={onClose}>
        <View style={[styles.mainCard, { backgroundColor: colors.bg }]}>
          <View style={styles.postHeader}>
            <TouchableOpacity onPress={onClose}>
              <Text style={[styles.postCancel, { color: colors.sub }]}>İptal</Text>
            </TouchableOpacity>
            <Text style={[styles.cardTitle, { color: colors.text }]}>Yeni Gönderi</Text>
            <TouchableOpacity
              style={[styles.postShareBtn, (mediaItems.length === 0 || isLoading) && styles.shareButtonDisabled]}
              onPress={handlePost}
              disabled={mediaItems.length === 0 || isLoading}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.postShareText}>Paylaş</Text>
              )}
            </TouchableOpacity>
          </View>

          <View style={[styles.cardDivider, { backgroundColor: colors.border }]} />

          <ScrollView showsVerticalScrollIndicator={false} style={styles.modalScrollCenter}>
            <View style={styles.postUser}>
              <Image 
                source={{ uri: user?.photoURL || 'https://i.pravatar.cc/100' }} 
                style={styles.postAvatar} 
              />
              <Text style={[styles.postUserName, { color: colors.text }]}>
                {user?.displayName || 'Kullanıcı'}
              </Text>
            </View>

            <TouchableOpacity 
              style={[styles.contentCard, { backgroundColor: colors.card, borderColor: colors.border, padding: 0, overflow: 'hidden' }]} 
              onPress={pickMedia}
            >
              {mediaItems.length > 0 ? (
                <View style={styles.mediaHeroContainer}>
                  <Image source={{ uri: mediaItems[0].uri }} style={styles.mediaHero} />
                  <TouchableOpacity style={styles.mediaEditBtn}>
                    <Ionicons name="create-outline" size={18} color="#FFFFFF" />
                  </TouchableOpacity>
                  {mediaItems.length > 1 && (
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.mediaThumbs}>
                      {mediaItems.map((item, idx) => (
                        <TouchableOpacity key={item.id} style={styles.mediaThumbWrap} onPress={() => removeMedia(idx)}>
                          <Image source={{ uri: item.uri }} style={styles.mediaThumb} />
                          {idx > 0 && (
                            <View style={styles.mediaThumbRemove}>
                              <Ionicons name="close" size={10} color="#FFFFFF" />
                            </View>
                          )}
                        </TouchableOpacity>
                      ))}
                      <TouchableOpacity style={[styles.mediaThumbAdd, { borderColor: colors.border }]} onPress={pickMedia}>
                        <Ionicons name="add" size={20} color={colors.sub} />
                      </TouchableOpacity>
                    </ScrollView>
                  )}
                  <View style={styles.mediaCounter}>
                    <Text style={styles.mediaCounterText}>1/{mediaItems.length}</Text>
                  </View>
                </View>
              ) : (
                <View style={styles.contentPlaceholder}>
                  <View style={[styles.iconCircle, { backgroundColor: isDark ? '#3D3D3D' : '#E8E8E8' }]}>
                    <Ionicons name="image-outline" size={28} color={colors.text} />
                  </View>
                  <Text style={[styles.placeholderText, { color: colors.sub }]}>Fotoğraf seç</Text>
                  <Text style={[styles.subText, { color: colors.sub }]}>Galeriden bir fotoğraf seç</Text>
                </View>
              )}
            </TouchableOpacity>

            <View style={[styles.contentCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.sectionLabel, { color: colors.sub }]}>Kategori</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {categories.map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    style={[
                      styles.categoryChip,
                      category === cat.toLowerCase() && styles.categoryChipActive,
                      { 
                        backgroundColor: category === cat.toLowerCase() ? colors.text : colors.bg,
                        borderColor: category === cat.toLowerCase() ? colors.text : colors.border,
                      }
                    ]}
                    onPress={() => setCategory(cat.toLowerCase())}
                  >
                    <Text style={[
                      styles.categoryChipText,
                      { color: category === cat.toLowerCase() ? colors.bg : colors.sub }
                    ]}>
                      {cat}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <View style={[styles.contentCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.sectionLabel, { color: colors.sub }]}>Açıklama</Text>
              <TextInput
                style={[styles.contentInput, { color: colors.text }]}
                placeholder="Kombininden veya stilinden bahset..."
                placeholderTextColor={colors.sub}
                value={caption}
                onChangeText={setCaption}
                multiline
                maxLength={500}
              />
              <Text style={[styles.charCount, { color: colors.sub }]}>{caption.length}/500</Text>
            </View>

            <TouchableOpacity style={[styles.listItem, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Ionicons name="location-outline" size={20} color={colors.text} />
              <Text style={[styles.listItemText, { color: colors.sub }]}>
                {location || '📍 Konum Ekle'}
              </Text>
              <Ionicons name="chevron-forward" size={18} color={colors.sub} style={{ marginLeft: 'auto' }} />
            </TouchableOpacity>

            <TouchableOpacity style={[styles.listItem, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Ionicons name="pricetag-outline" size={20} color={colors.text} />
              <Text style={[styles.listItemText, { color: colors.sub }]}>
                🏷️ Ürün / Marka Etiketle
              </Text>
              <Ionicons name="chevron-forward" size={18} color={colors.sub} style={{ marginLeft: 'auto' }} />
            </TouchableOpacity>

            <TouchableOpacity style={[styles.listItem, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Ionicons name="person-add-outline" size={20} color={colors.text} />
              <Text style={[styles.listItemText, { color: colors.sub }]}>
                👤 Kullanıcı Etiketle
              </Text>
              <Ionicons name="chevron-forward" size={18} color={colors.sub} style={{ marginLeft: 'auto' }} />
            </TouchableOpacity>
          </ScrollView>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

// ============================================================
// 📌 4. HASHTAG MODAL (EKRAN ORTASINDA YÜZER PENCERE)
// ============================================================
const HashtagModal = ({ visible, onClose, onShare, mediaPreview }) => {
  const { theme } = useContext(ThemeContext);
  const isDark = theme === 'dark';
  const inputRef = useRef(null);

  const [input, setInput] = useState('');
  const [tags, setTags] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const colors = {
    bg: isDark ? '#1A1A1A' : '#FFFFFF',
    card: isDark ? '#2D2D2D' : '#F8F8F8',
    text: isDark ? '#FFFFFF' : '#1A1A1A',
    sub: isDark ? '#888888' : '#999999',
    border: isDark ? '#3D3D3D' : '#EEEEEE',
  };

  const trendingHashtags = [
    { tag: 'OOTD', count: '124.5K' },
    { tag: 'StreetStyle', count: '89.2K' },
    { tag: 'MinimalFashion', count: '45.8K' },
    { tag: 'LuxuryLook', count: '32.1K' },
    { tag: 'Moda', count: '24.5K' },
    { tag: 'Minimalist', count: '12.1K' },
  ];

  const popularSuggestions = [
    { tag: 'moda', count: '24.5K' },
    { tag: 'minimalist', count: '12.1K' },
    { tag: 'streetwear', count: '18.7K' },
    { tag: 'vintage', count: '15.3K' },
    { tag: 'luxury', count: '9.8K' },
  ];

  useEffect(() => {
    if (visible) {
      setTimeout(() => inputRef.current?.focus(), 300);
    } else {
      setTags([]);
      setInput('');
      setShowSuggestions(false);
    }
  }, [visible]);

  useEffect(() => {
    if (input.length > 0) {
      const filtered = popularSuggestions.filter(s => s.tag.toLowerCase().includes(input.toLowerCase()));
      setSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
    } else {
      setShowSuggestions(false);
    }
  }, [input]);

  const addTag = (tag) => {
    const cleanTag = tag.replace('#', '').trim();
    if (!cleanTag) return;
    if (tags.length >= 5) {
      showToast({
        title: 'Uyarı',
        message: 'En fazla 5 etiket ekleyebilirsiniz.',
        type: 'warning',
        autoClose: true,
        autoCloseDelay: 2000,
      });
      return;
    }
    if (tags.includes(cleanTag)) {
      showToast({
        title: 'Uyarı',
        message: 'Bu etiket zaten eklenmiş.',
        type: 'warning',
        autoClose: true,
        autoCloseDelay: 2000,
      });
      return;
    }
    setTags([...tags, cleanTag]);
    setInput('');
    setShowSuggestions(false);
  };

  const removeTag = (tag) => {
    setTags(tags.filter(t => t !== tag));
  };

  const handleKeyPress = ({ nativeEvent }) => {
    if (nativeEvent.key === ' ' || nativeEvent.key === ',') {
      addTag(input);
    }
  };

  const handleShare = () => {
    if (tags.length === 0) {
      showToast({
        title: 'Uyarı',
        message: 'En az bir hashtag ekleyin!',
        type: 'warning',
        autoClose: true,
        autoCloseDelay: 2000,
      });
      return;
    }
    const hashtagString = tags.map(t => `#${t}`).join(' ');
    
    showToast({
      title: '🔥 Hashtag Paylaşıldı',
      message: `${hashtagString} trend olmaya aday! Stil ilhamı almak ister misin?`,
      type: 'success',
      autoClose: false,
      showPremium: true,
    });
    onShare(tags);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity style={styles.backdropCenter} activeOpacity={1} onPress={onClose}>
        <View style={[styles.mainCard, { backgroundColor: colors.bg }]}>
          <View style={styles.cardHeader}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>Hashtag Paylaş</Text>
            <TouchableOpacity onPress={onClose} style={styles.cardClose}>
              <Ionicons name="close" size={22} color={colors.text} />
            </TouchableOpacity>
          </View>

          <View style={[styles.cardDivider, { backgroundColor: colors.border }]} />

          <ScrollView showsVerticalScrollIndicator={false} style={styles.modalScrollCenter}>
            {mediaPreview && (
              <View style={[styles.hashtagPreview, { backgroundColor: colors.card }]}>
                <Image source={{ uri: mediaPreview }} style={styles.hashtagPreviewImage} />
                <Text style={[styles.hashtagPreviewText, { color: colors.sub }]}>
                  Bu gönderiye etiket ekleniyor
                </Text>
              </View>
            )}

            {tags.length > 0 && (
              <View style={[styles.tagChipsWrap, { backgroundColor: colors.card }]}>
                {tags.map((tag) => (
                  <View key={tag} style={[styles.tagChip, { backgroundColor: colors.text }]}>
                    <Text style={[styles.tagChipText, { color: colors.bg }]}>#{tag}</Text>
                    <TouchableOpacity onPress={() => removeTag(tag)}>
                      <Ionicons name="close" size={14} color={colors.bg} />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}

            <View style={[styles.contentCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <TextInput
                ref={inputRef}
                style={[styles.contentInput, { color: colors.text }]}
                placeholder="# ile etiket ekle veya popülerlerden seç..."
                placeholderTextColor={colors.sub}
                value={input}
                onChangeText={setInput}
                onKeyPress={handleKeyPress}
                maxLength={30}
              />
              <Text style={[styles.charCount, { color: colors.sub }]}>{tags.length}/5 etiket</Text>
            </View>

            {showSuggestions && suggestions.length > 0 && (
              <View style={[styles.suggestionsWrap, { backgroundColor: colors.card, borderColor: colors.border }]}>
                {suggestions.map((item) => (
                  <TouchableOpacity key={item.tag} style={[styles.suggestionItem, { borderColor: colors.border }]} onPress={() => addTag(item.tag)}>
                    <Text style={[styles.suggestionTag, { color: colors.text }]}>#{item.tag}</Text>
                    <Text style={[styles.suggestionCount, { color: colors.sub }]}>{item.count} gönderi</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            <View style={[styles.contentCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.sectionLabel, { color: colors.sub }]}>🔥 Popüler Etiketler</Text>
              <View style={styles.trendingChips}>
                {trendingHashtags.map((item) => (
                  <TouchableOpacity key={item.tag} style={[styles.trendingChip, { borderColor: colors.border }]} onPress={() => addTag(item.tag)}>
                    <Text style={[styles.trendingChipText, { color: colors.text }]}>#{item.tag}</Text>
                    <Text style={[styles.trendingChipCount, { color: colors.sub }]}>{item.count}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </ScrollView>

          <TouchableOpacity
            style={[styles.shareButton, tags.length === 0 && styles.shareButtonDisabled]}
            onPress={handleShare}
            disabled={tags.length === 0}
          >
            <Text style={styles.shareButtonText}>Hashtag'leri Paylaş</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

// ============================================================
// 📌 5. STORY VIEWER MODAL
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
    <View style={styles.viewerSlide}>
      <Image source={{ uri: item.image || item.media?.[0]?.uri }} style={styles.viewerImage} />
      <View style={styles.viewerOverlay}>
        <View style={styles.viewerUser}>
          <Image source={{ uri: item.userAvatar || 'https://i.pravatar.cc/100' }} style={styles.viewerAvatar} />
          <Text style={styles.viewerUserName}>{item.userName || 'Kullanıcı'}</Text>
          <Text style={styles.viewerTime}>
            {new Date(item.createdAt).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>
      </View>
    </View>
  );

  return (
    <Modal visible={visible} transparent onRequestClose={onClose} animationType="fade">
      <View style={styles.viewerContainer}>
        <TouchableOpacity style={styles.viewerClose} onPress={onClose}>
          <Ionicons name="close" size={28} color="#FFFFFF" />
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
// 📌 6. STORY BAR BİLEŞENİ
// ============================================================
const StoryBar = ({ stories, onStoryPress, user, themeColors, onActionPanelPress }) => {
  const colors = themeColors || getThemeColors(false);
  
  const userHasStory = stories.some(s => s.userId === user?.uid);
  const otherStories = stories.filter(s => s.userId !== user?.uid);

  return (
    <View style={[styles.storyBarContainer, { borderBottomColor: colors.border }]}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <TouchableOpacity style={styles.storyItem} onPress={onActionPanelPress}>
          <View style={[styles.storyRing, userHasStory && styles.storyRingActive]}>
            <Image 
              source={{ uri: user?.photoURL || 'https://i.pravatar.cc/100' }} 
              style={styles.storyAvatar} 
            />
            {!userHasStory && (
              <View style={[styles.storyAddButton, { backgroundColor: colors.primary || COLORS.cognac }]}>
                <Ionicons name="add" size={12} color={COLORS.white} />
              </View>
            )}
          </View>
          <Text style={[styles.storyName, { color: colors.text }]}>
            {userHasStory ? 'Story' : 'Ekle'}
          </Text>
        </TouchableOpacity>

        {otherStories.map((story, index) => (
          <TouchableOpacity 
            key={story.id} 
            style={styles.storyItem}
            onPress={() => onStoryPress(story, index)}
          >
            <View style={[styles.storyRing, styles.storyRingActive, { borderColor: colors.primary || COLORS.cognac }]}>
              <Image 
                source={{ uri: story.userAvatar || 'https://i.pravatar.cc/100' }} 
                style={styles.storyAvatar} 
              />
            </View>
            <Text style={[styles.storyName, { color: colors.text }]} numberOfLines={1}>
              {story.userName || 'Kullanıcı'}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

// ============================================================
// 📌 ANA BİLEŞEN - VİTRİNİM SCREEN
// ============================================================
const VitrinimScreen = ({ navigation }) => {
  const { theme } = useContext(ThemeContext);
  const isDark = theme === 'dark';
  const colors = getThemeColors(isDark);

  const [activeTab, setActiveTab] = useState('explore');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [posts, setPosts] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [favoritesCount, setFavoritesCount] = useState(0);
  const [cartCount, setCartCount] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedSort, setSelectedSort] = useState('recommended');
  const [menuVisible, setMenuVisible] = useState(false);
  const [postMenuVisible, setPostMenuVisible] = useState(false);
  const [commentModalVisible, setCommentModalVisible] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [likedPosts, setLikedPosts] = useState({});
  const [savedPosts, setSavedPosts] = useState([]);
  const [user, setUser] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  
  const [stories, setStories] = useState([]);
  
  // Story Box State'ler
  const [actionPanelVisible, setActionPanelVisible] = useState(false);
  const [newPostModalVisible, setNewPostModalVisible] = useState(false);
  const [storyModalVisible, setStoryModalVisible] = useState(false);
  const [storyViewerVisible, setStoryViewerVisible] = useState(false);
  const [selectedStoryIndex, setSelectedStoryIndex] = useState(0);
  const [hashtagModalVisible, setHashtagModalVisible] = useState(false);

  const searchAnimation = useRef(new Animated.Value(0)).current;

  // ============================================================
  // 📌 EFFECTS
  // ============================================================
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    loadData();
  }, [user]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadData();
    });
    return unsubscribe;
  }, [navigation]);

  // ============================================================
  // 📌 VERİ YÜKLEME
  // ============================================================
  const loadData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadProducts(),
        loadFeed(),
        loadFavorites(),
        loadCartCount(),
        loadSavedPosts(),
        loadStories(),
        initializeServices(),
      ]);
    } catch (error) {
      console.error('Veri yükleme hatası:', error);
    } finally {
      setLoading(false);
    }
  };

  const initializeServices = async () => {
    try {
      await imagePoolService.initialize();
      await brandService.initialize();
      await aiAdvisorService.loadCache();
    } catch (error) {
      console.error('Servis başlatma hatası:', error);
    }
  };

  const loadProducts = async () => {
    try {
      const response = await api.get('/api/depo/urunler');
      if (response.data && response.data.success) {
        setProducts(response.data.urunler || []);
      } else {
        setProducts([]);
      }
    } catch (error) {
      console.error('Ürünler yüklenemedi:', error);
      setProducts([]);
    }
  };

  const loadFeed = async () => {
    try {
      const response = await outfitAPI.getFeed();
      if (response && response.success) {
        const postsData = response.posts || [];
        const formattedPosts = Array.isArray(postsData)
          ? postsData.map((post, index) => ({
              id: post.id || index.toString(),
              userName: post.user_name || 'Kullanıcı',
              userAvatar: post.user_avatar || `https://i.pravatar.cc/100?img=${index + 1}`,
              time: post.created_at || 'Şimdi',
              content: post.title || post.description || 'Paylaşım',
              image: post.image_url || `https://picsum.photos/id/${index + 20}/400/300`,
              likes: post.like_count || 0,
              comments: post.comment_count || 0,
              trendTag: post.concept_category || '#Moda',
              brand: post.brand || 'Marka',
              commentsList: post.comments || [],
              isLiked: false,
              location: post.location || '',
              tags: post.tags || '',
            }))
          : [];
        setPosts(formattedPosts);
      } else {
        setPosts([]);
      }
    } catch (error) {
      console.error('Feed yüklenemedi:', error);
      setPosts([]);
    }
  };

  const loadFavorites = async () => {
    try {
      const userId = user?.uid;
      if (!userId) {
        setFavorites([]);
        setFavoritesCount(0);
        return;
      }
      const response = await wardrobeAPI.getStats(userId);
      if (response && response.success) {
        const wardrobeResponse = await wardrobeAPI.getAllItems(userId);
        if (wardrobeResponse && wardrobeResponse.success) {
          const starItems = wardrobeResponse.categories ? 
            Object.values(wardrobeResponse.categories)
              .flat()
              .filter(item => item.is_star)
              .map(item => item.product_id) : [];
          setFavorites(starItems);
          setFavoritesCount(starItems.length);
        }
      }
    } catch (error) {
      console.error('Favoriler yüklenemedi:', error);
      setFavorites([]);
      setFavoritesCount(0);
    }
  };

  const loadCartCount = async () => {
    try {
      const cart = await AsyncStorage.getItem('@cart');
      const cartData = cart ? JSON.parse(cart) : [];
      setCartCount(cartData.length);
    } catch (error) {
      console.error('Sepet yüklenemedi:', error);
      setCartCount(0);
    }
  };

  const loadSavedPosts = async () => {
    try {
      const saved = await AsyncStorage.getItem('@saved_posts');
      setSavedPosts(saved ? JSON.parse(saved) : []);
    } catch (error) {
      console.error(error);
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

  // ============================================================
  // 📌 HANDLER'LAR
  // ============================================================
  const handleActionSelect = (actionId) => {
    switch (actionId) {
      case 'story': setStoryModalVisible(true); break;
      case 'post': setNewPostModalVisible(true); break;
      case 'hashtag': setHashtagModalVisible(true); break;
      default: break;
    }
  };

  const handleToggleFavorite = async (product) => {
    if (!user) {
      showToast({
        title: 'Giriş Yapın',
        message: 'Favorilere eklemek için lütfen giriş yapın.',
        type: 'warning',
        autoClose: true,
        autoCloseDelay: 2500,
      });
      return;
    }
    try {
      const isFavorite = favorites.includes(product.id);
      const response = await wardrobeAPI.toggleStar(user.uid, product.id, !isFavorite);
      if (response && response.success) {
        if (!isFavorite) {
          setFavorites([...favorites, product.id]);
          setFavoritesCount((prev) => prev + 1);
        } else {
          setFavorites(favorites.filter((id) => id !== product.id));
          setFavoritesCount((prev) => prev - 1);
        }
      }
    } catch (error) {
      console.error('Favori hatası:', error);
      showToast({
        title: 'Hata',
        message: 'Favori işlemi başarısız oldu.',
        type: 'error',
        autoClose: true,
        autoCloseDelay: 2000,
      });
    }
  };

  const handleAddToCart = async (product) => {
    if (!user) {
      showToast({
        title: 'Giriş Yapın',
        message: 'Sepete eklemek için lütfen giriş yapın.',
        type: 'warning',
        autoClose: true,
        autoCloseDelay: 2500,
      });
      return;
    }
    try {
      const cart = await AsyncStorage.getItem('@cart');
      const cartData = cart ? JSON.parse(cart) : [];
      const existingItem = cartData.find(item => item.id === product.id);
      if (existingItem) {
        existingItem.quantity = (existingItem.quantity || 1) + 1;
      } else {
        cartData.push({ ...product, quantity: 1 });
      }
      await AsyncStorage.setItem('@cart', JSON.stringify(cartData));
      setCartCount(cartData.length);
      
      showToast({
        title: '🛒 Sepete Eklendi',
        message: `${product.ad || product.name || 'Ürün'} sepete eklendi. Alışverişe devam et!`,
        type: 'success',
        autoClose: false,
        showPremium: true,
      });
    } catch (error) {
      console.error('Sepet hatası:', error);
      showToast({
        title: 'Hata',
        message: 'Sepete ekleme başarısız oldu.',
        type: 'error',
        autoClose: true,
        autoCloseDelay: 2000,
      });
    }
  };

  const handleLikePost = (postId) => {
    setLikedPosts((prev) => ({ ...prev, [postId]: !prev[postId] }));
  };

  const handleSavePost = async (post) => {
    try {
      const isAlreadySaved = savedPosts.some((p) => p.id === post.id);
      let newSaved;
      if (!isAlreadySaved) {
        newSaved = [...savedPosts, post];
        showToast({
          title: '📌 Gönderi Kaydedildi',
          message: 'Kombin kaydedildi! Stil ilhamı almak ister misin?',
          type: 'success',
          autoClose: false,
          showPremium: true,
        });
      } else {
        newSaved = savedPosts.filter((p) => p.id !== post.id);
        showToast({
          title: 'Kayıt Kaldırıldı',
          message: 'Kombin kayıttan çıkarıldı.',
          type: 'info',
          autoClose: true,
          autoCloseDelay: 2000,
        });
      }
      setSavedPosts(newSaved);
      await AsyncStorage.setItem('@saved_posts', JSON.stringify(newSaved));
    } catch (error) {
      console.error(error);
    }
  };

  const handleShare = async (post) => {
    try {
      await Share.share({ 
        message: `${post.content || 'ModaVerse paylaşımı'}\n\nModaVerse ile keşfedin!`, 
        title: 'ModaVerse Paylaşımı' 
      });
    } catch (error) {
      console.error(error);
    }
  };

  const handleComment = (post) => {
    setSelectedPost(post);
    setCommentModalVisible(true);
  };

  const handlePostMenuSelect = (action, post) => {
    switch (action) {
      case 'save': handleSavePost(post); break;
      case 'not_interested': 
        showToast({
          title: 'Gizlendi',
          message: 'Bu gönderi gizlendi.',
          type: 'info',
          autoClose: true,
          autoCloseDelay: 2000,
        });
        break;
      case 'report': 
        showToast({
          title: 'Şikayet Edildi',
          message: 'Şikayetiniz iletildi.',
          type: 'info',
          autoClose: true,
          autoCloseDelay: 2000,
        });
        break;
      default: break;
    }
  };

  const handleStoryShare = (newStory) => {
    setStories(prev => [newStory, ...prev]);
  };

  const handleHashtagShare = (tags) => {
    const hashtagString = tags.map(t => `#${t}`).join(' ');
    showToast({
      title: '🔥 Hashtag Paylaşıldı',
      message: `${hashtagString} trend olmaya aday! Stil ilhamı almak ister misin?`,
      type: 'success',
      autoClose: false,
      showPremium: true,
    });
    setHashtagModalVisible(false);
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, []);

  const getFilteredAndSortedProducts = () => {
    let filtered = [...products];
    if (selectedCategory !== 'all') {
      filtered = filtered.filter((p) => p.kategori && p.kategori.toLowerCase() === selectedCategory.toLowerCase());
    }
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((p) => (p.ad && p.ad.toLowerCase().includes(query)) || (p.marka && p.marka.toLowerCase().includes(query)));
    }
    switch (selectedSort) {
      case 'price_asc': filtered.sort((a, b) => (a.fiyat || 0) - (b.fiyat || 0)); break;
      case 'price_desc': filtered.sort((a, b) => (b.fiyat || 0) - (a.fiyat || 0)); break;
      default: break;
    }
    return filtered;
  };

  // ============================================================
  // 📌 COMPONENTS
  // ============================================================
  const TabToggle = () => (
    <View style={[styles.toggleContainer]}>
      <TouchableOpacity
        style={[styles.toggleButton, activeTab === 'explore' && styles.toggleButtonActive]}
        onPress={() => setActiveTab('explore')}
      >
        <Text style={[styles.toggleText, activeTab === 'explore' && styles.toggleTextActive, { color: activeTab === 'explore' ? colors.text : colors.textSecondary }]}>
          KEŞFET
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.toggleButton, activeTab === 'shop' && styles.toggleButtonActive]}
        onPress={() => setActiveTab('shop')}
      >
        <Text style={[styles.toggleText, activeTab === 'shop' && styles.toggleTextActive, { color: activeTab === 'shop' ? colors.text : colors.textSecondary }]}>
          MAĞAZA
        </Text>
      </TouchableOpacity>
    </View>
  );

  const ExplorePostCard = ({ item }) => {
    const isLiked = likedPosts[item.id] || false;
    const isSaved = savedPosts.some((p) => p.id === item.id);
    const likeAnim = useRef(new Animated.Value(1)).current;

    const handleLike = () => {
      handleLikePost(item.id);
      Animated.sequence([
        Animated.timing(likeAnim, { toValue: 1.4, duration: 150, useNativeDriver: true }),
        Animated.timing(likeAnim, { toValue: 1, duration: 150, useNativeDriver: true }),
      ]).start();
    };

    return (
      <View style={[styles.postCard, { backgroundColor: colors.surface }]}>
        <View style={styles.postHeader}>
          <Image source={{ uri: item.userAvatar || 'https://i.pravatar.cc/100' }} style={styles.userAvatar} />
          <View style={styles.userInfo}>
            <Text style={[styles.userName, { color: colors.text }]}>{item.userName || 'Kullanıcı'}</Text>
            <Text style={[styles.postTime, { color: colors.textSecondary }]}>{item.time || 'Şimdi'}</Text>
          </View>
          <TouchableOpacity onPress={() => { setSelectedPost(item); setPostMenuVisible(true); }}>
            <Feather name="more-horizontal" size={18} color={colors.text} />
          </TouchableOpacity>
        </View>
        <Text style={[styles.postContent, { color: colors.text }]}>{item.content || 'Paylaşım'}</Text>
        {item.image && <Image source={{ uri: item.image }} style={styles.postImage} />}
        <View style={[styles.postActions, { borderTopColor: colors.border }]}>
          <TouchableOpacity style={styles.postAction} onPress={handleLike}>
            <Animated.View style={{ transform: [{ scale: likeAnim }] }}>
              <Ionicons name={isLiked ? 'heart' : 'heart-outline'} size={20} color={isLiked ? '#FF3B30' : colors.textSecondary} />
            </Animated.View>
            <Text style={[styles.actionText, isLiked && styles.actionTextActive, { color: colors.textSecondary }]}>
              {formatNumber((item.likes || 0) + (isLiked ? 1 : 0))}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.postAction} onPress={() => handleComment(item)}>
            <Ionicons name="chatbubble-outline" size={20} color={colors.textSecondary} />
            <Text style={[styles.actionText, { color: colors.textSecondary }]}>
              {formatNumber(item.comments || 0)}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.postAction} onPress={() => handleShare(item)}>
            <Ionicons name="paper-plane-outline" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.postAction, styles.saveAction]} onPress={() => handleSavePost(item)}>
            <Ionicons name={isSaved ? 'bookmark' : 'bookmark-outline'} size={20} color={isSaved ? colors.primary || COLORS.cognac : colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // ============================================================
  // 📌 SHOP GRID - Arama Sonucu Boş Durumu
  // ============================================================
  const ShopGrid = () => {
    const filteredProducts = getFilteredAndSortedProducts();
    const hasSearchQuery = searchQuery.trim().length > 0;

    const ProductCard = ({ item }) => {
      const isFavorite = favorites.includes(item.id);
      return (
        <TouchableOpacity
          style={[styles.shopProductCard, { borderColor: colors.border, backgroundColor: colors.surface }]}
          onPress={() => navigation.navigate('ProductDetail', { product: item, headerShown: false })}
        >
          <View style={styles.shopImageContainer}>
            <Image source={{ uri: item.img_url || 'https://picsum.photos/400/500' }} style={styles.shopProductImage} />
            <TouchableOpacity style={[styles.shopFavoriteButton, { backgroundColor: colors.surface }]} onPress={() => handleToggleFavorite(item)}>
              <Ionicons name={isFavorite ? 'heart' : 'heart-outline'} size={12} color={isFavorite ? colors.text : colors.textSecondary} />
            </TouchableOpacity>
          </View>
          <View style={styles.shopProductInfo}>
            <Text style={[styles.shopBrandName, { color: colors.textSecondary }]}>{item.marka || 'Marka'}</Text>
            <Text style={[styles.shopProductName, { color: colors.text }]} numberOfLines={2}>{item.ad || 'Ürün'}</Text>
            <Text style={[styles.shopProductPrice, { color: colors.text }]}>₺{formatPrice(item.fiyat)}</Text>
          </View>
        </TouchableOpacity>
      );
    };

    const EmptySearchState = () => (
      <View style={styles.emptySearchContainer}>
        <View style={[styles.emptySearchIcon, { borderColor: colors.border }]}>
          <Ionicons name="search-outline" size={48} color={colors.textSecondary} />
        </View>
        <Text style={[styles.emptySearchTitle, { color: colors.text }]}>
          SONUÇ BULUNAMADI
        </Text>
        <Text style={[styles.emptySearchDescription, { color: colors.textSecondary }]}>
          "{searchQuery}" ile eşleşen ürün bulunamadı.
        </Text>
        <Text style={[styles.emptySearchHint, { color: colors.textSecondary }]}>
          Farklı anahtar kelimeler deneyin veya mağazayı keşfedin.
        </Text>
        <TouchableOpacity 
          style={[styles.emptySearchButton, { borderColor: colors.text }]} 
          onPress={() => { setSearchQuery(''); setIsSearching(false); }}
        >
          <Text style={[styles.emptySearchButtonText, { color: colors.text }]}>MAĞAZAYI KEŞFET</Text>
        </TouchableOpacity>
      </View>
    );

    const EmptyStoreState = () => (
      <View style={styles.emptyContainer}>
        <View style={[styles.emptyIconContainer, { borderColor: colors.border }]}>
          <Ionicons name="grid-outline" size={48} color={colors.textSecondary} />
        </View>
        <Text style={[styles.emptyTitle, { color: colors.text }]}>MAĞAZA BOŞ</Text>
        <Text style={[styles.emptyDescription, { color: colors.textSecondary }]}>
          Henüz hiç ürün eklenmemiş.
        </Text>
      </View>
    );

    if (loading && !refreshing) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.text} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Ürünler yükleniyor...</Text>
        </View>
      );
    }

    if (hasSearchQuery && filteredProducts.length === 0) {
      return (
        <FlatList
          data={[]}
          renderItem={null}
          ListEmptyComponent={EmptySearchState}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.text} colors={[colors.text]} />}
          contentContainerStyle={styles.shopGrid}
        />
      );
    }

    if (products.length === 0) {
      return (
        <FlatList
          data={[]}
          renderItem={null}
          ListEmptyComponent={EmptyStoreState}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.text} colors={[colors.text]} />}
          contentContainerStyle={styles.shopGrid}
        />
      );
    }

    return (
      <FlatList
        data={filteredProducts}
        renderItem={({ item }) => <ProductCard item={item} />}
        keyExtractor={(item) => item?.id?.toString()}
        numColumns={2}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.text} colors={[colors.text]} />}
        contentContainerStyle={styles.shopGrid}
        columnWrapperStyle={styles.columnWrapper}
        showsVerticalScrollIndicator={false}
        ListFooterComponent={
          hasSearchQuery && (
            <TouchableOpacity 
              style={[styles.clearSearchButton, { borderColor: colors.border }]} 
              onPress={() => { setSearchQuery(''); setIsSearching(false); }}
            >
              <Text style={[styles.clearSearchButtonText, { color: colors.textSecondary }]}>Aramayı Temizle</Text>
            </TouchableOpacity>
          )
        }
      />
    );
  };

  const ExploreFeed = () => (
    <FlatList
      data={posts}
      renderItem={({ item }) => <ExplorePostCard item={item} />}
      keyExtractor={(item) => item.id?.toString()}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.text} colors={[colors.text]} />}
      ListHeaderComponent={
        <StoryBar 
          stories={stories}
          user={user}
          themeColors={colors}
          onStoryPress={(story, index) => { setSelectedStoryIndex(index); setStoryViewerVisible(true); }}
          onActionPanelPress={() => setActionPanelVisible(true)}
        />
      }
      contentContainerStyle={styles.feedContent}
    />
  );

  // ============================================================
  // 📌 RENDER
  // ============================================================
  if (loading && !refreshing) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.text} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>ModaVerse yükleniyor...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />

      <View style={styles.header}>
        <Text style={[styles.logoText, { color: colors.text }]}>MODAVERSE</Text>
        <View style={styles.headerIcons}>
          <TouchableOpacity style={styles.headerIcon} onPress={() => {
            setShowSearch(!showSearch);
            if (!showSearch) {
              Animated.timing(searchAnimation, { toValue: 1, duration: 250, useNativeDriver: false }).start();
            } else {
              Animated.timing(searchAnimation, { toValue: 0, duration: 200, useNativeDriver: false }).start(() => { setSearchQuery(''); });
            }
          }}>
            <Ionicons name="search-outline" size={20} color={colors.text} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.headerIcon} 
            onPress={() => navigation.navigate('Favorites')}
          >
            <Ionicons name="heart-outline" size={20} color={colors.text} />
            {favoritesCount > 0 && (
              <View style={[styles.badge, { backgroundColor: colors.primary || colors.text }]}>
                <Text style={[styles.badgeText, { color: colors.background }]}>{favoritesCount}</Text>
              </View>
            )}
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.headerIcon} 
            onPress={() => navigation.navigate('Cart')}
          >
            <Ionicons name="cart-outline" size={20} color={colors.text} />
            {cartCount > 0 && (
              <View style={[styles.badge, { backgroundColor: colors.primary || colors.text }]}>
                <Text style={[styles.badgeText, { color: colors.background }]}>{cartCount}</Text>
              </View>
            )}
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.headerIcon} onPress={() => setMenuVisible(true)}>
            <Ionicons name="menu-outline" size={20} color={colors.text} />
          </TouchableOpacity>
        </View>
      </View>

      {showSearch && (
        <Animated.View style={[styles.searchContainer, { opacity: searchAnimation, maxHeight: searchAnimation.interpolate({ inputRange: [0, 1], outputRange: [0, 60] }) }]}>
          <View style={[styles.searchBar, { borderColor: colors.border }]}>
            <Ionicons name="search" size={16} color={colors.textSecondary} />
            <TextInput 
              style={[styles.searchInput, { color: colors.text }]} 
              placeholder="Tasarımcı, ürün ara..." 
              placeholderTextColor={colors.textSecondary} 
              value={searchQuery} 
              onChangeText={setSearchQuery} 
              autoFocus={showSearch} 
              onSubmitEditing={() => {
                if (searchQuery.trim().length > 0) {
                  setActiveTab('shop');
                }
              }}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={14} color={colors.textSecondary} />
              </TouchableOpacity>
            )}
          </View>
        </Animated.View>
      )}

      <TabToggle />

      {activeTab === 'explore' ? <ExploreFeed /> : <ShopGrid />}

      {/* ============================================================
          MODALLER
          ============================================================ */}
      
      <StoryActionPanel 
        visible={actionPanelVisible} 
        onClose={() => setActionPanelVisible(false)} 
        onSelect={handleActionSelect} 
      />
      
      <NewPostModal 
        visible={newPostModalVisible} 
        onClose={() => setNewPostModalVisible(false)} 
        onPost={() => { 
          loadData();
        }} 
        user={user} 
      />

      <StoryModal 
        visible={storyModalVisible} 
        onClose={() => setStoryModalVisible(false)} 
        onShare={handleStoryShare} 
        user={user} 
      />

      <StoryViewerModal 
        visible={storyViewerVisible} 
        stories={stories} 
        initialIndex={selectedStoryIndex} 
        onClose={() => setStoryViewerVisible(false)} 
      />

      <HashtagModal 
        visible={hashtagModalVisible} 
        onClose={() => setHashtagModalVisible(false)} 
        onShare={handleHashtagShare}
      />

      {/* Menu Modal */}
      <Modal visible={menuVisible} transparent animationType="slide" onRequestClose={() => setMenuVisible(false)}>
        <View style={styles.menuOverlay}>
          <TouchableOpacity style={styles.menuBackdrop} activeOpacity={1} onPress={() => setMenuVisible(false)} />
          <View style={[styles.menuContainer, { backgroundColor: colors.card }]}>
            <View style={styles.menuHeader}>
              <View style={styles.menuUserInfo}>
                <Image source={{ uri: user?.photoURL || 'https://i.pravatar.cc/100' }} style={styles.menuAvatar} />
                <View style={styles.menuUserText}>
                  <Text style={[styles.menuUserName, { color: colors.text }]}>{user?.displayName || 'Moda Sever'}</Text>
                  <Text style={[styles.menuUserEmail, { color: colors.textSecondary }]}>{user?.email || ''}</Text>
                </View>
              </View>
              <TouchableOpacity onPress={() => setMenuVisible(false)} style={[styles.menuCloseButton, { backgroundColor: colors.surface }]}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
            <View style={[styles.menuDivider, { backgroundColor: colors.border }]} />
            <ScrollView showsVerticalScrollIndicator={false}>
              <TouchableOpacity 
                style={[styles.menuItem, { borderBottomColor: colors.border }]} 
                onPress={() => { 
                  setMenuVisible(false); 
                  navigation.navigate('Favorites');
                }}
              >
                <View style={[styles.menuItemIcon, { backgroundColor: colors.surface }]}>
                  <Ionicons name="heart-outline" size={22} color={colors.text} />
                </View>
                <Text style={[styles.menuItemLabel, { color: colors.text }]}>Favorilerim</Text>
                <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} style={styles.menuItemArrow} />
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.menuItem, { borderBottomColor: colors.border }]} 
                onPress={() => { 
                  setMenuVisible(false); 
                  navigation.navigate('Saved'); 
                }}
              >
                <View style={[styles.menuItemIcon, { backgroundColor: colors.surface }]}>
                  <Ionicons name="bookmark-outline" size={22} color={colors.text} />
                </View>
                <Text style={[styles.menuItemLabel, { color: colors.text }]}>Kaydedilenler</Text>
                <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} style={styles.menuItemArrow} />
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.menuItem, { borderBottomColor: colors.border }]} 
                onPress={() => { 
                  setMenuVisible(false); 
                  navigation.navigate('Cart');
                }}
              >
                <View style={[styles.menuItemIcon, { backgroundColor: colors.surface }]}>
                  <Ionicons name="cart-outline" size={22} color={colors.text} />
                </View>
                <Text style={[styles.menuItemLabel, { color: colors.text }]}>Sepetim</Text>
                <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} style={styles.menuItemArrow} />
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.menuItem, { borderBottomColor: colors.border }]} 
                onPress={() => { 
                  setMenuVisible(false); 
                  navigation.navigate('Profile'); 
                }}
              >
                <View style={[styles.menuItemIcon, { backgroundColor: colors.surface }]}>
                  <Ionicons name="person-outline" size={22} color={colors.text} />
                </View>
                <Text style={[styles.menuItemLabel, { color: colors.text }]}>Profilim</Text>
                <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} style={styles.menuItemArrow} />
              </TouchableOpacity>
            </ScrollView>
            <View style={[styles.menuFooter, { borderTopColor: colors.border }]}>
              <TouchableOpacity style={styles.menuLogout} onPress={async () => { await auth.signOut(); setMenuVisible(false); }}>
                <Ionicons name="log-out-outline" size={20} color={COLORS.error} />
                <Text style={[styles.menuLogoutText, { color: COLORS.error }]}>Çıkış Yap</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Post Menu */}
      <Modal visible={postMenuVisible} transparent animationType="fade" onRequestClose={() => setPostMenuVisible(false)}>
        <TouchableOpacity style={styles.actionOverlay} activeOpacity={1} onPress={() => setPostMenuVisible(false)}>
          <View style={[styles.actionContainer, { backgroundColor: colors.card }]}>
            <View style={styles.actionHeader}>
              <View style={[styles.actionHandle, { backgroundColor: colors.border }]} />
              <Text style={[styles.actionTitle, { color: colors.textSecondary }]}>BU GÖNDERİ İÇİN</Text>
            </View>
            <TouchableOpacity style={[styles.actionItem, { borderBottomColor: colors.border }]} onPress={() => { handleSavePost(selectedPost); setPostMenuVisible(false); }}>
              <View style={styles.actionItemIcon}><Ionicons name="bookmark-outline" size={22} color={colors.text} /></View>
              <Text style={[styles.actionLabel, { color: colors.text }]}>Kaydet</Text>
              <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} style={styles.actionArrow} />
            </TouchableOpacity>
            <View style={[styles.actionDivider, { backgroundColor: colors.border }]} />
            <TouchableOpacity style={[styles.actionItem, { borderBottomColor: colors.border }]} onPress={() => { handlePostMenuSelect('not_interested', selectedPost); setPostMenuVisible(false); }}>
              <View style={styles.actionItemIcon}><Ionicons name="eye-off-outline" size={22} color={colors.textSecondary} /></View>
              <Text style={[styles.actionLabel, { color: colors.textSecondary }]}>İlgilenmiyorum</Text>
              <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} style={styles.actionArrow} />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionItem, { borderBottomColor: colors.border }]} onPress={() => { handlePostMenuSelect('report', selectedPost); setPostMenuVisible(false); }}>
              <View style={styles.actionItemIcon}><Ionicons name="flag-outline" size={22} color={COLORS.error} /></View>
              <Text style={[styles.actionLabel, { color: COLORS.error }]}>Şikayet Et</Text>
              <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} style={styles.actionArrow} />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionCancel, { borderColor: colors.border }]} onPress={() => setPostMenuVisible(false)}>
              <Text style={[styles.actionCancelText, { color: colors.text }]}>İPTAL</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Comment Modal */}
      <Modal visible={commentModalVisible} animationType="slide" transparent onRequestClose={() => setCommentModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.commentModalContent, { backgroundColor: colors.card }]}>
            <View style={[styles.commentModalHeader, { borderBottomColor: colors.border }]}>
              <Text style={[styles.commentModalTitle, { color: colors.text }]}>YORUMLAR</Text>
              <TouchableOpacity onPress={() => setCommentModalVisible(false)}><Ionicons name="close" size={20} color={colors.text} /></TouchableOpacity>
            </View>
            <View style={styles.commentList}>
              <Text style={[styles.emptyCommentsText, { color: colors.textSecondary }]}>Henüz yorum yok.</Text>
            </View>
            <View style={[styles.commentInputContainer, { borderTopColor: colors.border }]}>
              <TextInput style={[styles.commentInput, { borderColor: colors.border, backgroundColor: colors.surface, color: colors.text }]} placeholder="Yorumunu yaz..." placeholderTextColor={colors.textSecondary} value="" onChangeText={() => {}} />
              <TouchableOpacity style={styles.commentSendButton}><Ionicons name="send" size={16} color={colors.text} /></TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

// ============================================================
// 📌 STILLER
// ============================================================
const styles = StyleSheet.create({
  container: { flex: 1 },

  // HEADER
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SIZES.lg,
    paddingTop: Platform.OS === 'ios' ? 12 : SIZES.md,
    paddingBottom: SIZES.xs,
  },
  logoText: { 
    ...TYPOGRAPHY.caption, 
    fontSize: 14, 
    letterSpacing: 3, 
    fontWeight: '400',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  headerIcons: { flexDirection: 'row', gap: SIZES.md },
  headerIcon: { position: 'relative', padding: 2 },
  badge: {
    position: 'absolute',
    top: -4,
    right: -6,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    borderRadius: 8,
  },
  badgeText: { ...TYPOGRAPHY.caption, fontSize: 8, fontWeight: '600' },

  // SEARCH
  searchContainer: { paddingHorizontal: SIZES.lg, overflow: 'hidden', marginBottom: SIZES.md },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 0.5,
    paddingHorizontal: SIZES.md,
    paddingVertical: SIZES.sm,
    borderRadius: 8,
  },
  searchInput: { flex: 1, marginLeft: SIZES.md, fontSize: 14, padding: 0 },

  // TOGGLE
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginHorizontal: SIZES.lg,
    marginBottom: SIZES.md,
    marginTop: 2,
    gap: SIZES.lg,
  },
  toggleButton: { paddingVertical: SIZES.xs, paddingHorizontal: SIZES.xs },
  toggleButtonActive: { borderBottomWidth: 1, borderBottomColor: COLORS.black },
  toggleText: { ...TYPOGRAPHY.caption, fontSize: 11, fontWeight: '400', letterSpacing: 1 },
  toggleTextActive: { color: COLORS.black },

  // SHOP GRID
  shopGrid: { paddingHorizontal: SIZES.lg, paddingBottom: SIZES.xl, flexGrow: 1 },
  columnWrapper: { justifyContent: 'space-between', marginBottom: SIZES.md },
  shopProductCard: { flex: 1, maxWidth: '48%', borderWidth: 0.5, padding: SIZES.sm, borderRadius: 8 },
  shopImageContainer: { position: 'relative', marginBottom: SIZES.md },
  shopProductImage: { width: '100%', height: 180, backgroundColor: '#f0f0f0', borderRadius: 8 },
  shopFavoriteButton: { position: 'absolute', top: 4, right: 4, padding: 4, borderRadius: 12 },
  shopProductInfo: { paddingHorizontal: 2 },
  shopBrandName: { ...TYPOGRAPHY.caption, fontSize: 9, marginBottom: 2 },
  shopProductName: { ...TYPOGRAPHY.body, fontSize: 12, fontWeight: '400', marginBottom: 4 },
  shopProductPrice: { ...TYPOGRAPHY.body, fontSize: 13, fontWeight: '500' },

  // ARAMA SONUCU BOŞ
  emptySearchContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SIZES.xl,
    paddingTop: 60,
  },
  emptySearchIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SIZES.lg,
  },
  emptySearchTitle: {
    ...TYPOGRAPHY.title3,
    fontSize: 18,
    fontWeight: '400',
    letterSpacing: 2,
    marginBottom: SIZES.xs,
  },
  emptySearchDescription: {
    ...TYPOGRAPHY.body,
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 4,
    lineHeight: 20,
  },
  emptySearchHint: {
    ...TYPOGRAPHY.body,
    fontSize: 12,
    textAlign: 'center',
    marginBottom: SIZES.xl,
    lineHeight: 18,
  },
  emptySearchButton: {
    borderWidth: 1,
    paddingHorizontal: SIZES.xl,
    paddingVertical: SIZES.sm,
    borderRadius: 8,
  },
  emptySearchButtonText: {
    ...TYPOGRAPHY.button,
    fontSize: 10,
    fontWeight: '400',
    letterSpacing: 1,
  },

  // EMPTY STATE (Mağaza boş)
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
  emptyDescription: {
    ...TYPOGRAPHY.body,
    fontSize: 13,
    textAlign: 'center',
    marginBottom: SIZES.xl,
    lineHeight: 20,
  },
  emptySuggestions: { width: '100%', marginBottom: SIZES.xl },
  emptySuggestionTitle: { ...TYPOGRAPHY.caption, fontSize: 10, fontWeight: '400', letterSpacing: 1, marginBottom: SIZES.md, textAlign: 'center' },
  emptySuggestionChips: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 8 },
  emptySuggestionChip: { borderWidth: 1, paddingHorizontal: SIZES.md, paddingVertical: SIZES.xs, borderRadius: 20 },
  emptySuggestionChipText: { ...TYPOGRAPHY.body, fontSize: 12 },
  clearButton: { borderWidth: 1, paddingHorizontal: SIZES.xl, paddingVertical: SIZES.sm, borderRadius: 8 },
  clearButtonText: { ...TYPOGRAPHY.button, fontSize: 10, fontWeight: '400', letterSpacing: 1 },

  // ARAMAYI TEMİZLE BUTONU
  clearSearchButton: {
    borderWidth: 0.5,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 20,
  },
  clearSearchButtonText: {
    fontSize: 11,
    fontWeight: '400',
    letterSpacing: 0.5,
  },

  // LOADING
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: SIZES.md,
  },
  loadingText: { ...TYPOGRAPHY.body, fontSize: 13 },

  // POST
  feedContent: { paddingBottom: SIZES.xl },
  postCard: { marginBottom: SIZES.lg, paddingHorizontal: SIZES.lg, paddingBottom: SIZES.sm },
  postHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: SIZES.md },
  userAvatar: { width: 40, height: 40, borderRadius: 20, borderWidth: 0.5, marginRight: SIZES.md },
  userInfo: { flex: 1 },
  userName: { ...TYPOGRAPHY.body, fontSize: 14, fontWeight: '400' },
  postTime: { ...TYPOGRAPHY.caption, fontSize: 10, marginTop: 1 },
  postContent: { ...TYPOGRAPHY.body, fontSize: 13, lineHeight: 18, marginBottom: SIZES.md },
  postImage: { width: '100%', height: 200, marginBottom: SIZES.md, borderRadius: 8 },
  postActions: { flexDirection: 'row', alignItems: 'center', paddingVertical: SIZES.md, borderTopWidth: 0.5 },
  postAction: { flexDirection: 'row', alignItems: 'center', marginRight: SIZES.md },
  actionText: { ...TYPOGRAPHY.caption, fontSize: 11, marginLeft: 4, fontWeight: '400' },
  actionTextActive: { color: '#FF3B30' },
  saveAction: { marginLeft: 'auto' },

  // STORY BAR
  storyBarContainer: {
    paddingHorizontal: SIZES.lg,
    paddingVertical: SIZES.sm,
    borderBottomWidth: 0.5,
  },
  storyItem: {
    alignItems: 'center',
    marginRight: SIZES.md,
    width: 72,
  },
  storyRing: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    padding: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 2,
  },
  storyRingActive: { borderColor: COLORS.cognac },
  storyAvatar: { width: 56, height: 56, borderRadius: 28 },
  storyAddButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  storyName: { ...TYPOGRAPHY.caption, fontSize: 9, textAlign: 'center', maxWidth: 64 },

  // STORY VIEWER
  viewerContainer: { flex: 1, backgroundColor: '#000000' },
  viewerClose: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 30,
    right: 20,
    zIndex: 20,
    padding: 8,
  },
  viewerSlide: { width: width, height: height, justifyContent: 'center', alignItems: 'center' },
  viewerImage: { width: '100%', height: '100%', resizeMode: 'contain' },
  viewerOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  viewerUser: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  viewerAvatar: { width: 32, height: 32, borderRadius: 16, borderWidth: 1, borderColor: '#FFFFFF' },
  viewerUserName: { fontSize: 14, color: '#FFFFFF', fontWeight: '400' },
  viewerTime: { fontSize: 10, color: 'rgba(255,255,255,0.7)', marginLeft: 'auto' },
  viewerProgress: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 30,
    left: 20,
    right: 20,
    flexDirection: 'row',
    gap: 4,
    zIndex: 10,
  },
  viewerProgressBar: { flex: 1, height: 3, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.3)' },
  viewerProgressBarActive: { backgroundColor: '#FFFFFF' },

  // MENU
  menuOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  menuBackdrop: { flex: 1 },
  menuContainer: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: '85%',
    paddingBottom: 20,
    paddingHorizontal: 20,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 20,
  },
  menuHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 20 },
  menuUserInfo: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  menuAvatar: { width: 52, height: 52, borderRadius: 26 },
  menuUserText: { gap: 2 },
  menuUserName: { ...TYPOGRAPHY.body, fontSize: 16, fontWeight: '400' },
  menuUserEmail: { ...TYPOGRAPHY.caption, fontSize: 12 },
  menuCloseButton: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  menuDivider: { height: 0.5, marginBottom: 8 },
  menuItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 0.5 },
  menuItemIcon: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center', marginRight: 14 },
  menuItemLabel: { ...TYPOGRAPHY.body, fontSize: 15, fontWeight: '400', flex: 1 },
  menuItemArrow: { marginLeft: 'auto' },
  menuFooter: { marginTop: 12, paddingTop: 12, borderTopWidth: 0.5 },
  menuLogout: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14 },
  menuLogoutText: { ...TYPOGRAPHY.body, fontSize: 15, fontWeight: '400' },

  // ACTION SHEET (POST MENU)
  actionOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  actionContainer: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingBottom: 20,
    paddingTop: 12,
  },
  actionHeader: { alignItems: 'center', paddingVertical: 8, marginBottom: 8 },
  actionHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: '#E0E0E0', marginBottom: 8 },
  actionTitle: { ...TYPOGRAPHY.caption, fontSize: 11, letterSpacing: 1, fontWeight: '400' },
  actionItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 0.5 },
  actionItemIcon: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center', marginRight: 14 },
  actionLabel: { ...TYPOGRAPHY.body, fontSize: 15, fontWeight: '400', flex: 1 },
  actionArrow: { marginLeft: 'auto' },
  actionDivider: { height: 0.5, marginVertical: 4 },
  actionCancel: { marginTop: 8, paddingVertical: 16, alignItems: 'center', borderWidth: 0.5, borderRadius: 12 },
  actionCancelText: { ...TYPOGRAPHY.body, fontSize: 14, fontWeight: '400' },

  // COMMENT MODAL
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  commentModalContent: { width: width, maxHeight: '80%', padding: SIZES.lg, borderTopLeftRadius: 24, borderTopRightRadius: 24 },
  commentModalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SIZES.md, paddingBottom: SIZES.md, borderBottomWidth: 0.5 },
  commentModalTitle: { ...TYPOGRAPHY.caption, fontSize: 12, fontWeight: '400', letterSpacing: 1 },
  commentList: { maxHeight: 400 },
  emptyCommentsText: { ...TYPOGRAPHY.body, fontSize: 13, textAlign: 'center', padding: SIZES.xl },
  commentInputContainer: { flexDirection: 'row', alignItems: 'center', marginTop: SIZES.md, paddingTop: SIZES.md, borderTopWidth: 0.5, gap: SIZES.md },
  commentInput: { flex: 1, ...TYPOGRAPHY.body, fontSize: 14, borderWidth: 0.5, paddingHorizontal: SIZES.md, paddingVertical: SIZES.sm, borderRadius: 8 },
  commentSendButton: { padding: SIZES.xs },

  // ============================================================
  // 🆕 PREMIUM KART TASARIMI - EKRAN ORTASINDA YÜZER
  // ============================================================

  backdropCenter: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },

  mainCard: {
    width: width * 0.88,
    maxHeight: height * 0.85,
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 35,
    elevation: 30,
  },

  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 18,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '400',
    letterSpacing: 0.5,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  cardClose: { padding: 4 },
  cardDivider: { height: 0.5, marginBottom: 14 },
  cardCancel: { alignItems: 'center', paddingVertical: 12, marginTop: 4 },
  cardCancelText: { fontSize: 14, fontWeight: '400', letterSpacing: 0.3 },

  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
    borderWidth: 0.5,
    marginBottom: 10,
  },
  actionCardBorder: { marginBottom: 10 },
  actionIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  actionTextWrap: { flex: 1 },
  actionLabel: { fontSize: 15, fontWeight: '400', letterSpacing: 0.3 },
  actionDesc: { fontSize: 11, marginTop: 2, letterSpacing: 0.2 },

  contentCard: {
    padding: 14,
    borderRadius: 14,
    borderWidth: 0.5,
    marginBottom: 12,
  },
  contentImage: {
    width: '100%',
    height: 160,
    borderRadius: 10,
    resizeMode: 'cover',
  },
  contentPlaceholder: {
    width: '100%',
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  placeholderText: { fontSize: 13, fontWeight: '400', letterSpacing: 0.3 },
  subText: { fontSize: 11, letterSpacing: 0.2 },
  contentInput: {
    fontSize: 14,
    paddingHorizontal: 0,
    paddingVertical: 6,
    minHeight: 40,
    textAlignVertical: 'top',
  },

  mediaHeroContainer: {
    position: 'relative',
    width: '100%',
    height: 280,
  },
  mediaHero: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  mediaEditBtn: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 8,
    borderRadius: 20,
  },
  mediaThumbs: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    right: 12,
    flexDirection: 'row',
  },
  mediaThumbWrap: { marginRight: 8, position: 'relative' },
  mediaThumb: {
    width: 48,
    height: 48,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },
  mediaThumbRemove: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 10,
    padding: 2,
  },
  mediaThumbAdd: {
    width: 48,
    height: 48,
    borderRadius: 8,
    borderWidth: 1,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mediaCounter: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  mediaCounterText: { fontSize: 11, color: '#FFFFFF', fontWeight: '400' },

  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },

  sectionLabel: {
    fontSize: 10,
    fontWeight: '400',
    letterSpacing: 0.5,
    marginBottom: 10,
  },

  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 0.5,
    marginRight: 8,
  },
  categoryChipActive: {},
  categoryChipText: { fontSize: 12, fontWeight: '400', letterSpacing: 0.3 },

  charCount: {
    fontSize: 8,
    textAlign: 'right',
    marginTop: 2,
    fontWeight: '300',
  },

  audienceOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  audienceOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 0.5,
  },
  audienceOptionActive: {},
  audienceLabel: { fontSize: 12, fontWeight: '400', letterSpacing: 0.3 },

  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
    borderWidth: 0.5,
    marginBottom: 10,
  },
  listItemText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 14,
    fontWeight: '400',
    letterSpacing: 0.3,
  },

  shareButton: {
    backgroundColor: '#1A1A1A',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 4,
  },
  shareButtonDisabled: { opacity: 0.5 },
  shareButtonText: {
    fontSize: 13,
    color: '#FFFFFF',
    fontWeight: '400',
    letterSpacing: 0.5,
  },

  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 18,
  },
  postCancel: { fontSize: 14, fontWeight: '400', letterSpacing: 0.3 },
  postShareBtn: {
    backgroundColor: '#1A1A1A',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  postShareText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '400',
    letterSpacing: 0.5,
  },
  postUser: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 14,
  },
  postAvatar: { width: 36, height: 36, borderRadius: 18 },
  postUserName: { fontSize: 14, fontWeight: '400', letterSpacing: 0.3 },
  modalScrollCenter: { maxHeight: height * 0.55 },

  // HASHTAG MODAL ÖZEL
  hashtagPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 14,
    marginBottom: 12,
  },
  hashtagPreviewImage: { width: 48, height: 48, borderRadius: 8, marginRight: 12 },
  hashtagPreviewText: { fontSize: 12, fontWeight: '400', letterSpacing: 0.3 },

  tagChipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 12,
    borderRadius: 14,
    gap: 8,
    marginBottom: 12,
  },
  tagChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
  },
  tagChipText: { fontSize: 13, fontWeight: '400', letterSpacing: 0.2 },

  suggestionsWrap: {
    borderRadius: 14,
    padding: 8,
    marginBottom: 12,
    borderWidth: 0.5,
  },
  suggestionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderBottomWidth: 0.5,
  },
  suggestionTag: { fontSize: 14, fontWeight: '400', letterSpacing: 0.3 },
  suggestionCount: { fontSize: 11, fontWeight: '300', letterSpacing: 0.2 },

  trendingChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  trendingChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 0.5,
    gap: 6,
  },
  trendingChipText: { fontSize: 12, fontWeight: '400', letterSpacing: 0.2 },
  trendingChipCount: { fontSize: 9, fontWeight: '300', letterSpacing: 0.2 },
});

export default VitrinimScreen;