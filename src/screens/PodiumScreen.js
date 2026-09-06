// 📁 src/screens/PodiumScreen.js - REVİZE (Premium Kart Eklendi)

import React, { useState, useEffect, useCallback, useContext, useRef } from 'react';
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
  Modal,
  Alert,
  RefreshControl,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Share
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, TYPOGRAPHY, SIZES, getThemeColors } from '../constants/Theme';
import { ThemeContext } from '../../App';
import { auth } from '../config/firebase';
import { outfitAPI, sefAPI } from '../services/api';
import * as ImagePicker from 'expo-image-picker';

// ============================================================
// 📌 TOAST İMPORTU
// ============================================================
import { showToast } from '../components/CustomAlert';

// ============================================================
// 📌 SERVİS İMPORTLARI
// ============================================================
import brandService from '../services/brandService';
import aiAdvisorService from '../services/aiAdvisorService';

const { width, height } = Dimensions.get('window');

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
// 📌 2. NEW POST MODAL (EKRAN ORTASINDA YÜZER PENCERE)
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
      await new Promise(resolve => setTimeout(resolve, 1000));
      showToast({
        title: '✨ Gönderi Paylaşıldı',
        message: 'Kombinin herkes tarafından beğenilecek! Stil ilhamı almak ister misin?',
        type: 'success',
        autoClose: false,
        showPremium: true,
      });
      onPost();
      onClose();
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
                  
                  <TouchableOpacity 
                    style={styles.mediaEditBtn} 
                    onPress={() => {
                      showToast({
                        title: '✏️ Düzenleme',
                        message: 'Kırpma, filtre ve döndürme seçenekleri açılıyor...',
                        type: 'info',
                        autoClose: true,
                        autoCloseDelay: 1500,
                      });
                    }}
                  >
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

            <TouchableOpacity 
              style={[styles.listItem, { backgroundColor: colors.card, borderColor: colors.border }]} 
              onPress={() => {
                showToast({
                  title: '📍 Konum',
                  message: 'Konum seçme ekranı açılıyor...',
                  type: 'info',
                  autoClose: true,
                  autoCloseDelay: 1500,
                });
              }}
            >
              <Ionicons name="location-outline" size={20} color={colors.text} />
              <Text style={[styles.listItemText, { color: colors.sub }]}>
                {location || '📍 Konum Ekle'}
              </Text>
              <Ionicons name="chevron-forward" size={18} color={colors.sub} style={{ marginLeft: 'auto' }} />
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.listItem, { backgroundColor: colors.card, borderColor: colors.border }]} 
              onPress={() => {
                showToast({
                  title: '🛍️ Ürün Etiketle',
                  message: 'Resmin üzerine tıklayarak ürün etiketi ekleyebilirsin.',
                  type: 'info',
                  autoClose: true,
                  autoCloseDelay: 2000,
                });
              }}
            >
              <Ionicons name="pricetag-outline" size={20} color={colors.text} />
              <Text style={[styles.listItemText, { color: colors.sub }]}>
                🏷️ Ürün / Marka Etiketle
              </Text>
              <Ionicons name="chevron-forward" size={18} color={colors.sub} style={{ marginLeft: 'auto' }} />
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.listItem, { backgroundColor: colors.card, borderColor: colors.border }]} 
              onPress={() => {
                showToast({
                  title: '👤 Kullanıcı Etiketle',
                  message: 'Fotoğraftaki kişileri etiketleyebilirsin.',
                  type: 'info',
                  autoClose: true,
                  autoCloseDelay: 2000,
                });
              }}
            >
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
// 📌 3. STORY MODAL (EKRAN ORTASINDA YÜZER PENCERE)
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
      await new Promise(resolve => setTimeout(resolve, 1000));
      showToast({
        title: '📸 Hikaye Paylaşıldı',
        message: 'Hikayeniz 24 saat boyunca görünür olacak. Stil ilhamı almak ister misin?',
        type: 'success',
        autoClose: false,
        showPremium: true,
      });
      onShare();
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
                  
                  <TouchableOpacity 
                    style={styles.mediaEditBtn} 
                    onPress={() => {
                      showToast({
                        title: '✏️ Düzenleme',
                        message: 'Kırpma, filtre ve döndürme seçenekleri açılıyor...',
                        type: 'info',
                        autoClose: true,
                        autoCloseDelay: 1500,
                      });
                    }}
                  >
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

            <TouchableOpacity 
              style={[styles.listItem, { backgroundColor: colors.card, borderColor: colors.border }]} 
              onPress={() => {
                showToast({
                  title: '📍 Konum',
                  message: 'Konum seçme ekranı açılıyor...',
                  type: 'info',
                  autoClose: true,
                  autoCloseDelay: 1500,
                });
              }}
            >
              <Ionicons name="location-outline" size={20} color={colors.text} />
              <Text style={[styles.listItemText, { color: colors.sub }]}>
                {location || '📍 Konum Ekle'}
              </Text>
              <Ionicons name="chevron-forward" size={18} color={colors.sub} style={{ marginLeft: 'auto' }} />
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.listItem, { backgroundColor: colors.card, borderColor: colors.border }]} 
              onPress={() => {
                showToast({
                  title: '🛍️ Ürün Etiketle',
                  message: 'Resmin üzerine tıklayarak ürün etiketi ekleyebilirsin.',
                  type: 'info',
                  autoClose: true,
                  autoCloseDelay: 2000,
                });
              }}
            >
              <Ionicons name="pricetag-outline" size={20} color={colors.text} />
              <Text style={[styles.listItemText, { color: colors.sub }]}>
                🏷️ Ürün / Marka Etiketle
              </Text>
              <Ionicons name="chevron-forward" size={18} color={colors.sub} style={{ marginLeft: 'auto' }} />
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.listItem, { backgroundColor: colors.card, borderColor: colors.border }]} 
              onPress={() => {
                showToast({
                  title: '👤 Kullanıcı Etiketle',
                  message: 'Fotoğraftaki kişileri etiketleyebilirsin.',
                  type: 'info',
                  autoClose: true,
                  autoCloseDelay: 2000,
                });
              }}
            >
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
// 📌 4. HASHTAG MODAL (EKRAN ORTASINDA YÜZER PENCERE)
// ============================================================
const HashtagModal = ({ visible, onClose, onShare }) => {
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
// 📌 6. KULLANICI ÜNVANLARI
// ============================================================
const userTitles = {
  'FashionIcon': { title: 'Moda İkonu', detail: '1M+ beğeni topladı! ✨', icon: 'crown' },
  'SneakerKing': { title: 'Sneaker King', detail: '1000+ sneaker koleksiyonu 👟', icon: 'footsteps' },
  'StyleGuru': { title: 'Stil Gurusu', detail: 'Günlük kombinlerle ilham veriyor', icon: 'color-palette' },
  'default': { title: 'Moda Sever', detail: 'Moda yolculuğuna yeni başladın!', icon: 'person' },
};

// ============================================================
// 📌 7. FULL IMAGE MODAL
// ============================================================
const FullImageModal = ({ visible, imageUrl, onClose }) => {
  return (
    <Modal visible={visible} transparent onRequestClose={onClose}>
      <View style={styles.fullImageOverlay}>
        <TouchableOpacity style={styles.fullImageClose} onPress={onClose}>
          <Ionicons name="close" size={28} color={COLORS.white} />
        </TouchableOpacity>
        <Image source={{ uri: imageUrl }} style={styles.fullImage} resizeMode="contain" />
      </View>
    </Modal>
  );
};

// ============================================================
// 📌 8. 3 NOKTA MENÜ MODALI
// ============================================================
const ThreeDotMenuModal = ({ visible, onClose, onSelect, post, themeColors }) => {
  const colors = themeColors || getThemeColors(false);
  
  const menuItems = [
    { id: 'save', label: 'Kaydet', icon: 'bookmark-outline', color: colors.text },
    { divider: true },
    { id: 'go_to_trend', label: 'Trende git', icon: 'trending-up', color: colors.primary || COLORS.primary },
    { id: 'go_to_profile', label: 'Gönderi sahibine git', icon: 'person', color: colors.text },
    { id: 'not_interested', label: 'İlgilenmiyorum', icon: 'close-circle', color: colors.textSecondary },
    { id: 'report', label: 'Şikayet et', icon: 'flag', color: COLORS.error },
  ];

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity style={styles.menuOverlay} activeOpacity={1} onPress={onClose}>
        <View style={[styles.threeDotMenuContainer, { backgroundColor: colors.card }]}>
          <View style={[styles.threeDotMenuHeader, { borderBottomColor: colors.border }]}>
            <Text style={[styles.threeDotMenuTitle, { color: colors.text }]}>Bu gönderi için</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
          {menuItems.map((item, index) =>
            item.divider ? (
              <View key={index} style={[styles.menuDivider, { backgroundColor: colors.border }]} />
            ) : (
              <TouchableOpacity
                key={item.id}
                style={styles.threeDotMenuItem}
                onPress={() => {
                  onSelect(item.id, post);
                  onClose();
                }}
              >
                <Ionicons name={item.icon} size={20} color={item.color} />
                <Text style={[styles.threeDotMenuItemText, { color: item.color }]}>{item.label}</Text>
              </TouchableOpacity>
            )
          )}
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

// ============================================================
// 📌 9. YORUM MODALI
// ============================================================
const CommentModal = ({ visible, post, onClose, onAddComment, currentUser, themeColors }) => {
  const colors = themeColors || getThemeColors(false);
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState([]);

  useEffect(() => {
    if (post) {
      setComments(post.commentsList || []);
    }
  }, [post]);

  const handleAddComment = () => {
    if (!commentText.trim()) {
      showToast({
        title: 'Hata',
        message: 'Lütfen bir yorum yazın!',
        type: 'error',
        autoClose: true,
        autoCloseDelay: 2000,
      });
      return;
    }

    const newComment = {
      id: Date.now().toString(),
      userId: currentUser?.id || 'guest',
      userName: currentUser?.name || 'Kullanıcı',
      userAvatar: currentUser?.avatar || 'https://i.pravatar.cc/100',
      text: commentText.trim(),
      time: 'Şimdi',
      likes: 0
    };

    const updatedComments = [...comments, newComment];
    setComments(updatedComments);
    onAddComment(post.id, updatedComments);
    setCommentText('');
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <SafeAreaView style={styles.modalOverlay}>
        <View style={[styles.commentModalContainer, { backgroundColor: colors.card }]}>
          <View style={[styles.commentModalHeader, { borderBottomColor: colors.border }]}>
            <Text style={[styles.commentModalTitle, { color: colors.text }]}>Yorumlar ({comments.length})</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <FlatList
            data={comments}
            renderItem={({ item }) => (
              <View style={[styles.commentItem, { borderBottomColor: colors.border }]}>
                <Image source={{ uri: item.userAvatar }} style={styles.commentAvatar} />
                <View style={styles.commentContent}>
                  <View style={styles.commentHeader}>
                    <Text style={[styles.commentUserName, { color: colors.text }]}>{item.userName}</Text>
                    <Text style={[styles.commentTime, { color: colors.textSecondary }]}>{item.time}</Text>
                  </View>
                  <Text style={[styles.commentText, { color: colors.text }]}>{item.text}</Text>
                </View>
              </View>
            )}
            keyExtractor={item => item.id}
            ListEmptyComponent={
              <View style={styles.emptyComments}>
                <View style={[styles.emptyCommentsIcon, { borderColor: colors.border }]}>
                  <Ionicons name="chatbubbles-outline" size={40} color={colors.textSecondary} />
                </View>
                <Text style={[styles.emptyCommentsTitle, { color: colors.text }]}>Henüz Yorum Yok</Text>
                <Text style={[styles.emptyCommentsText, { color: colors.textSecondary }]}>İlk yorumu sen yap! 💬</Text>
              </View>
            }
          />

          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
            <View style={[styles.commentInputContainer, { borderTopColor: colors.border }]}>
              <TextInput
                style={[styles.commentInput, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
                placeholder="Yorumunu yaz..."
                placeholderTextColor={colors.textSecondary}
                value={commentText}
                onChangeText={setCommentText}
                multiline
              />
              <TouchableOpacity style={styles.commentSendButton} onPress={handleAddComment}>
                <Ionicons name="send" size={18} color={colors.text} />
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

// ============================================================
// 📌 10. POST CARD
// ============================================================
const FeedPostCard = ({ 
  item, onLike, onComment, onShare, onImagePress, onMenuSelect, onSave, 
  isLiked: initialLiked, isSaved: initialSaved, themeColors 
}) => {
  const colors = themeColors || getThemeColors(false);
  const [liked, setLiked] = useState(initialLiked || false);
  const [likeCount, setLikeCount] = useState(item.likes || 0);
  const [saved, setSaved] = useState(initialSaved || false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  const titleInfo = userTitles[item.userName] || userTitles.default;

  const handleLike = () => {
    if (isLiking) return;
    
    setIsLiking(true);
    const newLiked = !liked;
    setLiked(newLiked);
    setLikeCount(prev => newLiked ? prev + 1 : prev - 1);
    
    onLike?.(item.id, newLiked);
    
    setTimeout(() => {
      setIsLiking(false);
    }, 300);
  };

  const handleSave = () => {
    const newSaved = !saved;
    setSaved(newSaved);
    onSave?.(item.id, newSaved);
  };

  const showTitleInfo = () => {
    Alert.alert(titleInfo.title, titleInfo.detail);
  };

  const formatNumber = (num) => {
    if (!num) return '0';
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  return (
    <View style={[styles.feedPostCard, { backgroundColor: colors.card }]}>
      <View style={styles.feedPostHeader}>
        <Image source={{ uri: item.userAvatar || 'https://i.pravatar.cc/100' }} style={styles.feedPostAvatar} />
        <View style={styles.feedPostUserInfo}>
          <View style={styles.userNameRow}>
            <Text style={[styles.feedPostUserName, { color: colors.text }]}>{item.userName || 'Kullanıcı'}</Text>
            <TouchableOpacity onPress={showTitleInfo}>
              <Text style={[styles.userTitleBadge, { color: colors.primary || COLORS.primary }]}>{titleInfo.title}</Text>
            </TouchableOpacity>
          </View>
          <Text style={[styles.feedPostTime, { color: colors.textSecondary }]}>{item.time || 'Şimdi'}</Text>
        </View>
        <TouchableOpacity onPress={() => setMenuVisible(true)} style={styles.menuButton}>
          <Ionicons name="ellipsis-horizontal" size={20} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>
      
      <Text style={[styles.feedPostContent, { color: colors.text }]}>{item.content || 'Paylaşım'}</Text>
      
      <TouchableOpacity onPress={() => onImagePress?.(item.image)} activeOpacity={0.9}>
        <Image source={{ uri: item.image || 'https://picsum.photos/400/300' }} style={[styles.feedPostImage, { backgroundColor: colors.surface }]} />
      </TouchableOpacity>
      
      <View style={styles.feedPostActions}>
        <TouchableOpacity style={styles.feedPostAction} onPress={handleLike} disabled={isLiking}>
          <Ionicons name={liked ? "heart" : "heart-outline"} size={22} color={liked ? COLORS.error : colors.textSecondary} />
          <Text style={[styles.feedPostActionText, { color: colors.textSecondary }, liked && styles.feedPostActionTextLiked]}>
            {formatNumber(likeCount)}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.feedPostAction} onPress={onComment}>
          <Ionicons name="chatbubble-outline" size={20} color={colors.textSecondary} />
          <Text style={[styles.feedPostActionText, { color: colors.textSecondary }]}>{formatNumber(item.comments || 0)}</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.feedPostAction} onPress={onShare}>
          <Ionicons name="share-social-outline" size={20} color={colors.textSecondary} />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.feedPostSave} onPress={handleSave}>
          <Ionicons name={saved ? "bookmark" : "bookmark-outline"} size={20} color={saved ? colors.primary || COLORS.cognac : colors.textSecondary} />
        </TouchableOpacity>
      </View>

      <ThreeDotMenuModal
        visible={menuVisible}
        onClose={() => setMenuVisible(false)}
        onSelect={onMenuSelect}
        post={item}
        themeColors={colors}
      />
    </View>
  );
};

// ============================================================
// 📌 11. DÖNER SEÇENEKLER
// ============================================================
const RotationSelector = ({ selected, onSelect, themeColors }) => {
  const colors = themeColors || getThemeColors(false);
  const options = [
    { id: 'trending', label: 'Trendler', icon: 'trending-up' },
    { id: 'following', label: 'Takip Ettiklerim', icon: 'people' },
    { id: 'suggested', label: 'Senin İçin', icon: 'bulb' },
  ];

  return (
    <View style={styles.rotationContainer}>
      {options.map((option) => (
        <TouchableOpacity
          key={option.id}
          style={[
            styles.rotationButton, 
            { backgroundColor: colors.surface },
            selected === option.id && { backgroundColor: colors.text }
          ]}
          onPress={() => onSelect(option.id)}
        >
          <Ionicons 
            name={option.icon} 
            size={16} 
            color={selected === option.id ? colors.background : colors.textSecondary} 
          />
          <Text style={[
            styles.rotationText, 
            { color: selected === option.id ? colors.background : colors.textSecondary },
            selected === option.id && styles.rotationTextActive
          ]}>
            {option.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

// ============================================================
// 📌 12. KARE TRENDLER
// ============================================================
const SquareTrends = ({ trends, onSelectTrend, themeColors }) => {
  const colors = themeColors || getThemeColors(false);

  if (!trends || trends.length === 0) {
    return (
      <View style={styles.squareTrendsContainer}>
        <View style={styles.squareTrendsHeader}>
          <Text style={[styles.squareTrendsTitle, { color: colors.text }]}>Öne Çıkan Trendler</Text>
        </View>
        <View style={styles.emptyTrendsContainer}>
          <Ionicons name="pricetags-outline" size={32} color={colors.textSecondary} />
          <Text style={[styles.emptyTrendsText, { color: colors.textSecondary }]}>Henüz trend yok</Text>
          <Text style={[styles.emptyTrendsSubtext, { color: colors.textSecondary }]}>İlk trendi sen oluştur! ✨</Text>
        </View>
      </View>
    );
  }

  const sortedTrends = [...trends].sort((a, b) => parseInt(b.postCount || 0) - parseInt(a.postCount || 0));

  return (
    <View style={styles.squareTrendsContainer}>
      <View style={styles.squareTrendsHeader}>
        <Text style={[styles.squareTrendsTitle, { color: colors.text }]}>Öne Çıkan Trendler</Text>
      </View>
      <FlatList
        data={sortedTrends}
        horizontal
        showsHorizontalScrollIndicator={false}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.squareTrendItem} onPress={() => onSelectTrend(item.tag)} activeOpacity={0.8}>
            <Image source={{ uri: item.image || 'https://picsum.photos/200/200' }} style={styles.squareTrendImage} />
            <View style={styles.squareTrendOverlay}>
              <Text style={styles.squareTrendTag}>{item.tag}</Text>
              <Text style={styles.squareTrendCount}>{item.postCount || '0'} gönderi</Text>
            </View>
          </TouchableOpacity>
        )}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.squareTrendsList}
      />
    </View>
  );
};

// ============================================================
// 📌 13. ANA BİLEŞEN - PodiumScreen
// ============================================================
const PodiumScreen = ({ navigation }) => {
  const { theme } = useContext(ThemeContext);
  const isDark = theme === 'dark';
  const colors = getThemeColors(isDark);

  const [rotationValue, setRotationValue] = useState('trending');
  const [selectedTrend, setSelectedTrend] = useState(null);
  const [commentModalVisible, setCommentModalVisible] = useState(false);
  const [fullImageVisible, setFullImageVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedPost, setSelectedPost] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [likedPosts, setLikedPosts] = useState({});
  const [savedPosts, setSavedPosts] = useState([]);
  const [feedPosts, setFeedPosts] = useState([]);
  const [followingPosts, setFollowingPosts] = useState([]);
  const [suggestedPosts, setSuggestedPosts] = useState([]);
  const [trendingItems, setTrendingItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  // Story Box State'ler
  const [actionPanelVisible, setActionPanelVisible] = useState(false);
  const [newPostModalVisible, setNewPostModalVisible] = useState(false);
  const [storyModalVisible, setStoryModalVisible] = useState(false);
  const [hashtagModalVisible, setHashtagModalVisible] = useState(false);

  // Firebase Auth
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
    });
    return unsubscribe;
  }, []);

  // ============================================================
  // 📌 SERVİS BAŞLATMA
  // ============================================================
  useEffect(() => {
    initializeServices();
  }, []);

  const initializeServices = async () => {
    try {
      await brandService.initialize();
      await aiAdvisorService.loadCache();
    } catch (error) {
      console.error('Servis başlatma hatası:', error);
    }
  };

  // ============================================================
  // 📌 VERİ YÜKLEME
  // ============================================================
  const loadData = async () => {
    setLoading(true);
    try {
      await loadFeed();
      await loadTrends();
      await loadSuggested();
      await loadSavedPosts();
      await loadFollowing();
    } catch (error) {
      console.error('Veri yükleme hatası:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadFeed = async () => {
    try {
      const response = await outfitAPI.getFeed();
      if (response && response.success) {
        const posts = response.posts || [];
        const sortedPosts = [...posts].sort((a, b) => {
          const engagementA = (a.like_count || 0) + (a.comment_count || 0);
          const engagementB = (b.like_count || 0) + (b.comment_count || 0);
          return engagementB - engagementA;
        });
        
        const formattedPosts = Array.isArray(sortedPosts) 
          ? sortedPosts.map((post, index) => ({
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
            }))
          : [];
        setFeedPosts(formattedPosts);
      } else {
        setFeedPosts([]);
      }
    } catch (error) {
      console.error('Feed yüklenemedi:', error);
      setFeedPosts([]);
    }
  };

  const loadTrends = async () => {
    try {
      const response = await outfitAPI.getCategories();
      if (response && response.success) {
        const categories = response.categories || [];
        const formattedTrends = Array.isArray(categories)
          ? categories.map((cat, index) => ({
              id: cat.id || index.toString(),
              tag: `#${cat.name || 'Trend'}`,
              postCount: cat.post_count || '0',
              image: cat.image_url || `https://picsum.photos/id/${index + 30}/200/200`,
              color: cat.color || '#E8D5C4'
            }))
          : [];
        setTrendingItems(formattedTrends);
      } else {
        setTrendingItems([]);
      }
    } catch (error) {
      console.error('Trendler yüklenemedi:', error);
      setTrendingItems([]);
    }
  };

  const loadSuggested = async () => {
    try {
      if (user) {
        const response = await sefAPI.getOutfitSuggestion(user.uid);
        if (response && response.success && response.kombinler) {
          const outfits = response.kombinler.slice(0, 5);
          const formatted = Array.isArray(outfits)
            ? outfits.map((outfit, index) => ({
                id: `suggested_${index}`,
                userName: 'AI Öneri',
                userAvatar: 'https://i.pravatar.cc/100?img=50',
                time: 'Şimdi',
                content: outfit.name || `Kombin ${index + 1}`,
                image: `https://picsum.photos/id/${index + 40}/400/300`,
                likes: 0,
                comments: 0,
                trendTag: '#AIKombin',
                brand: 'ModaVerse AI',
                commentsList: [],
                isLiked: false,
              }))
            : [];
          setSuggestedPosts(formatted);
        } else {
          setSuggestedPosts([]);
        }
      } else {
        setSuggestedPosts([]);
      }
    } catch (error) {
      console.error('Öneriler yüklenemedi:', error);
      setSuggestedPosts([]);
    }
  };

  const loadSavedPosts = async () => {
    try {
      const saved = await AsyncStorage.getItem('@saved_posts');
      setSavedPosts(saved ? JSON.parse(saved) : []);
    } catch (error) {
      console.error('Kaydedilenler yüklenemedi:', error);
      setSavedPosts([]);
    }
  };

  const loadFollowing = async () => {
    try {
      const following = await brandService.getFollowingBrands();
      if (following && following.length > 0) {
        const followingPostsData = following.slice(0, 3).map((brand, index) => ({
          id: `following_${index}`,
          userName: brand.name || 'Marka',
          userAvatar: brand.avatar || `https://i.pravatar.cc/100?img=${index + 10}`,
          time: 'Şimdi',
          content: `${brand.name} yeni koleksiyonunu paylaştı! ✨`,
          image: `https://picsum.photos/id/${index + 50}/400/300`,
          likes: Math.floor(Math.random() * 200) + 50,
          comments: Math.floor(Math.random() * 30) + 5,
          trendTag: brand.category ? `#${brand.category}` : '#Moda',
          brand: brand.name,
          commentsList: [],
          isLiked: false,
        }));
        setFollowingPosts(followingPostsData);
      } else {
        setFollowingPosts([]);
      }
    } catch (error) {
      console.error('Takip edilenler yüklenemedi:', error);
      setFollowingPosts([]);
    }
  };

  // ============================================================
  // 📌 EFFECTS
  // ============================================================
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
  // 📌 HELPERS
  // ============================================================
  const getCurrentFeed = () => {
    let allPosts = [];
    
    if (selectedTrend) {
      const all = [...feedPosts, ...followingPosts, ...suggestedPosts];
      return all.filter(post => post.trendTag === selectedTrend);
    }
    
    switch (rotationValue) {
      case 'trending': allPosts = feedPosts; break;
      case 'following': allPosts = followingPosts; break;
      case 'suggested': allPosts = suggestedPosts; break;
      default: allPosts = feedPosts;
    }
    
    return allPosts;
  };

  // ============================================================
  // 📌 HANDLER'LAR
  // ============================================================
  const handleActionSelect = (actionId) => {
    switch (actionId) {
      case 'story': 
        setStoryModalVisible(true);
        break;
      case 'post': 
        setNewPostModalVisible(true);
        break;
      case 'hashtag': 
        setHashtagModalVisible(true);
        break;
      default: 
        break;
    }
  };

  const handleLike = async (postId, isLiked) => {
    if (!user) {
      showToast({
        title: 'Giriş Yapın',
        message: 'Beğenmek için lütfen giriş yapın.',
        type: 'warning',
        autoClose: true,
        autoCloseDelay: 2500,
      });
      return;
    }
    setLikedPosts(prev => ({ ...prev, [postId]: isLiked }));
    try {
      await outfitAPI.likePost(postId, user.uid, 'full_match');
    } catch (error) {
      console.error('Beğeni hatası:', error);
      setLikedPosts(prev => ({ ...prev, [postId]: !isLiked }));
    }
  };

  const handleSavePost = async (postId, isSaved) => {
    try {
      if (isSaved) {
        const post = [...feedPosts, ...followingPosts, ...suggestedPosts].find(p => p.id === postId);
        if (post) {
          const newSaved = [...savedPosts, post];
          setSavedPosts(newSaved);
          await AsyncStorage.setItem('@saved_posts', JSON.stringify(newSaved));
        }
      } else {
        const newSaved = savedPosts.filter(p => p.id !== postId);
        setSavedPosts(newSaved);
        await AsyncStorage.setItem('@saved_posts', JSON.stringify(newSaved));
      }
    } catch (error) {
      console.error('Kaydetme hatası:', error);
    }
  };

  const isPostSaved = (postId) => {
    return savedPosts.some(p => p.id === postId);
  };

  const handleComment = (post) => {
    setSelectedPost(post);
    setCommentModalVisible(true);
  };

  const handleShare = async (post) => {
    try {
      await Share.share({
        message: `${post.content}\n\nModaVerse ile paylaşıldı! ✨`,
      });
    } catch (error) { console.error(error); }
  };

  const handleImagePress = (imageUrl) => {
    setSelectedImage(imageUrl);
    setFullImageVisible(true);
  };

  const handleMenuSelect = (action, post) => {
    switch (action) {
      case 'save':
        const isSaved = isPostSaved(post.id);
        handleSavePost(post.id, !isSaved);
        break;
      case 'go_to_trend':
        setSelectedTrend(post.trendTag);
        break;
      case 'go_to_profile':
        showToast({
          title: 'Profil',
          message: `${post.userName} profil sayfasına gidiliyor...`,
          type: 'info',
          autoClose: true,
          autoCloseDelay: 1500,
        });
        break;
      case 'not_interested':
        showToast({
          title: 'Bilgi',
          message: 'Bu gönderi gizlendi.',
          type: 'info',
          autoClose: true,
          autoCloseDelay: 1500,
        });
        break;
      case 'report':
        showToast({
          title: 'Şikayet',
          message: 'Gönderi şikayet edildi.',
          type: 'info',
          autoClose: true,
          autoCloseDelay: 1500,
        });
        break;
      default:
        break;
    }
  };

  const handleTrendSelect = (tag) => {
    if (selectedTrend === tag) {
      setSelectedTrend(null);
    } else {
      setSelectedTrend(tag);
    }
  };

  const handleAddComment = async (postId, commentsList) => {
    console.log('Yorum eklendi:', postId, commentsList);
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    await initializeServices();
    setRefreshing(false);
  }, []);

  const handleSharePost = () => {
    if (!user) {
      showToast({
        title: 'Giriş Yapın',
        message: 'Paylaşım yapmak için lütfen giriş yapın.',
        type: 'warning',
        autoClose: true,
        autoCloseDelay: 2500,
      });
      return;
    }
    setActionPanelVisible(true);
  };

  const handleAIAdvisor = () => {
    navigation.navigate('Tasarimcim');
  };

  const currentFeed = getCurrentFeed();

  // ============================================================
  // 📌 LIST HEADER
  // ============================================================
  const ListHeader = () => (
    <>
      <RotationSelector 
        selected={rotationValue} 
        onSelect={setRotationValue} 
        themeColors={colors}
      />
      <SquareTrends 
        trends={trendingItems} 
        onSelectTrend={handleTrendSelect}
        themeColors={colors}
      />
      {selectedTrend && (
        <View style={[styles.selectedTrendBar, { backgroundColor: colors.surface }]}>
          <Text style={[styles.selectedTrendText, { color: colors.text }]}>{selectedTrend} için sonuçlar</Text>
          <TouchableOpacity onPress={() => setSelectedTrend(null)}>
            <Text style={[styles.selectedTrendClear, { color: colors.textSecondary }]}>Temizle</Text>
          </TouchableOpacity>
        </View>
      )}
    </>
  );

  // ============================================================
  // 📌 RENDER
  // ============================================================
  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.text} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>YÜKLENİYOR...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />
      
      <View style={styles.header}>
        <Text style={[styles.logoText, { color: colors.text }]}>PODYUM</Text>
        <TouchableOpacity onPress={handleAIAdvisor} style={styles.headerAIButton}>
          <Ionicons name="color-wand-outline" size={22} color={colors.text} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={currentFeed}
        renderItem={({ item }) => (
          <FeedPostCard
            item={item}
            isLiked={likedPosts[item.id] || false}
            isSaved={isPostSaved(item.id)}
            onLike={handleLike}
            onSave={handleSavePost}
            onComment={() => handleComment(item)}
            onShare={() => handleShare(item)}
            onImagePress={handleImagePress}
            onMenuSelect={handleMenuSelect}
            themeColors={colors}
          />
        )}
        keyExtractor={item => item.id?.toString() || Math.random().toString()}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.text} colors={[colors.text]} />}
        contentContainerStyle={styles.feedList}
        ListHeaderComponent={ListHeader}
      />

      {/* + PAYLAŞIM BUTONU - SİYAH BEYAZ */}
      <TouchableOpacity 
        style={[
          styles.floatingShareButton, 
          { 
            backgroundColor: colors.text,
            borderColor: colors.background,
            borderWidth: 0.5,
          }
        ]} 
        onPress={handleSharePost}
      >
        <Ionicons name="add" size={28} color={colors.background} />
      </TouchableOpacity>

      {/* STORY ACTION PANEL */}
      <StoryActionPanel 
        visible={actionPanelVisible} 
        onClose={() => setActionPanelVisible(false)} 
        onSelect={handleActionSelect} 
      />

      {/* YENİ GÖNDERİ MODALI */}
      <NewPostModal 
        visible={newPostModalVisible} 
        onClose={() => setNewPostModalVisible(false)} 
        onPost={() => { 
          loadData(); 
        }} 
        user={user} 
      />

      {/* HİKAYE PAYLAŞ MODALI */}
      <StoryModal 
        visible={storyModalVisible} 
        onClose={() => setStoryModalVisible(false)} 
        onShare={() => { 
          loadData(); 
        }} 
        user={user} 
      />

      {/* HASHTAG PAYLAŞ MODALI */}
      <HashtagModal 
        visible={hashtagModalVisible} 
        onClose={() => setHashtagModalVisible(false)} 
        onShare={(tags) => {
          const hashtagString = tags.map(t => `#${t}`).join(' ');
          showToast({
            title: '🔥 Hashtag Paylaşıldı',
            message: `${hashtagString} trend olmaya aday! Stil ilhamı almak ister misin?`,
            type: 'success',
            autoClose: false,
            showPremium: true,
          });
          setHashtagModalVisible(false);
        }}
      />

      {/* Modallar */}
      <CommentModal
        visible={commentModalVisible}
        post={selectedPost}
        onClose={() => {
          setCommentModalVisible(false);
          setSelectedPost(null);
        }}
        onAddComment={handleAddComment}
        currentUser={{ 
          id: user?.uid || 'guest',
          name: user?.displayName || 'Kullanıcı',
          avatar: user?.photoURL || 'https://i.pravatar.cc/100'
        }}
        themeColors={colors}
      />

      <FullImageModal
        visible={fullImageVisible}
        imageUrl={selectedImage}
        onClose={() => {
          setFullImageVisible(false);
          setSelectedImage(null);
        }}
      />
    </SafeAreaView>
  );
};

// ============================================================
// 📌 STYLES
// ============================================================
const styles = StyleSheet.create({
  container: { flex: 1 },
  
  loadingContainer: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    gap: SIZES.md 
  },
  loadingText: { 
    ...TYPOGRAPHY.caption, 
    marginTop: SIZES.md,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },

  // HEADER
  header: { 
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SIZES.lg, 
    paddingTop: Platform.OS === 'ios' ? 12 : SIZES.md, 
    paddingBottom: SIZES.xs 
  },
  logoText: { 
    ...TYPOGRAPHY.logo, 
    fontSize: 18, 
    letterSpacing: 2,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  headerAIButton: { padding: 4 },

  // ROTATION
  rotationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginHorizontal: SIZES.lg,
    marginVertical: SIZES.md,
    gap: SIZES.sm
  },
  rotationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 25,
    gap: 4
  },
  rotationText: { 
    ...TYPOGRAPHY.caption, 
    fontSize: 11,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  rotationTextActive: { fontWeight: '600' },

  // SQUARE TRENDS
  squareTrendsContainer: { marginVertical: SIZES.sm },
  squareTrendsHeader: { paddingHorizontal: SIZES.lg, marginBottom: SIZES.sm },
  squareTrendsTitle: { 
    ...TYPOGRAPHY.caption, 
    fontSize: 12,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  squareTrendsList: { paddingHorizontal: SIZES.lg, gap: SIZES.sm },
  squareTrendItem: { width: 100, height: 120, borderRadius: 12, overflow: 'hidden', marginRight: SIZES.sm },
  squareTrendImage: { width: '100%', height: '100%' },
  squareTrendOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: SIZES.xs
  },
  squareTrendTag: { 
    ...TYPOGRAPHY.caption, 
    fontSize: 9, 
    color: COLORS.white,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  squareTrendCount: { 
    ...TYPOGRAPHY.caption, 
    fontSize: 7, 
    color: COLORS.grayMedium, 
    marginTop: 1,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  
  emptyTrendsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SIZES.xl,
    gap: SIZES.xs
  },
  emptyTrendsText: { 
    ...TYPOGRAPHY.body, 
    fontSize: 13,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  emptyTrendsSubtext: { 
    ...TYPOGRAPHY.caption, 
    fontSize: 11,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },

  // SELECTED TREND BAR
  selectedTrendBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SIZES.lg,
    paddingVertical: SIZES.xs,
    marginHorizontal: SIZES.lg,
    marginVertical: SIZES.sm,
    borderRadius: 8
  },
  selectedTrendText: { 
    ...TYPOGRAPHY.caption, 
    fontSize: 10,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  selectedTrendClear: { 
    ...TYPOGRAPHY.caption, 
    fontSize: 9,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },

  // FEED
  feedList: { paddingBottom: SIZES.xl },
  feedPostCard: {
    marginBottom: SIZES.lg,
    paddingHorizontal: SIZES.lg,
    paddingBottom: SIZES.sm
  },
  feedPostHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: SIZES.sm },
  feedPostAvatar: { width: 40, height: 40, borderRadius: 20, marginRight: SIZES.md },
  feedPostUserInfo: { flex: 1 },
  userNameRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 4 },
  feedPostUserName: { 
    ...TYPOGRAPHY.body, 
    fontWeight: '500',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  userTitleBadge: { 
    ...TYPOGRAPHY.caption, 
    fontSize: 8,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  feedPostTime: { 
    ...TYPOGRAPHY.caption, 
    fontSize: 8, 
    marginTop: 1,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  menuButton: { padding: 4 },
  feedPostContent: { 
    ...TYPOGRAPHY.body, 
    fontSize: 13, 
    lineHeight: 18, 
    marginBottom: SIZES.sm,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  feedPostImage: { width: '100%', height: 260, borderRadius: 12, marginBottom: SIZES.sm },
  feedPostActions: { flexDirection: 'row', alignItems: 'center', paddingTop: SIZES.xs },
  feedPostAction: { flexDirection: 'row', alignItems: 'center', marginRight: SIZES.lg },
  feedPostActionText: { 
    ...TYPOGRAPHY.caption, 
    fontSize: 10, 
    marginLeft: 2,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  feedPostActionTextLiked: { color: COLORS.error },
  feedPostSave: { marginLeft: 'auto' },

  // FLOATING PAYLAŞIM BUTONU
  floatingShareButton: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 100 : 80,
    right: SIZES.lg,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    borderWidth: 0.5,
  },

  // ============================================================
  // 🆕 MODAL STILLERİ - VİTRİNİM'DEN ALINAN
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
  cardCancelText: { 
    fontSize: 14, 
    fontWeight: '400', 
    letterSpacing: 0.3,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
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
  actionLabel: { 
    fontSize: 15, 
    fontWeight: '400', 
    letterSpacing: 0.3,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  actionDesc: { 
    fontSize: 11, 
    marginTop: 2, 
    letterSpacing: 0.2,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },

  // POST MODAL
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 18,
  },
  postCancel: { 
    fontSize: 14, 
    fontWeight: '400', 
    letterSpacing: 0.3,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
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
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  postUser: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 14,
  },
  postAvatar: { width: 36, height: 36, borderRadius: 18 },
  postUserName: { 
    fontSize: 14, 
    fontWeight: '400', 
    letterSpacing: 0.3,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  modalScrollCenter: { maxHeight: height * 0.55 },

  // CONTENT CARDS
  contentCard: {
    padding: 14,
    borderRadius: 14,
    borderWidth: 0.5,
    marginBottom: 12,
  },
  contentPlaceholder: {
    width: '100%',
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  placeholderText: { 
    fontSize: 13, 
    fontWeight: '400', 
    letterSpacing: 0.3,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  subText: { 
    fontSize: 11, 
    letterSpacing: 0.2,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  contentInput: {
    fontSize: 14,
    paddingHorizontal: 0,
    paddingVertical: 6,
    minHeight: 40,
    textAlignVertical: 'top',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
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
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 0.5,
    marginRight: 8,
  },
  categoryChipActive: {},
  categoryChipText: { 
    fontSize: 12, 
    fontWeight: '400', 
    letterSpacing: 0.3,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  charCount: {
    fontSize: 8,
    textAlign: 'right',
    marginTop: 2,
    fontWeight: '300',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },

  // AUDIENCE
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
  audienceLabel: { 
    fontSize: 12, 
    fontWeight: '400', 
    letterSpacing: 0.3,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },

  // LIST ITEMS
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
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },

  // SHARE BUTTON
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
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },

  // MEDIA HERO
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
  mediaCounterText: { 
    fontSize: 11, 
    color: '#FFFFFF', 
    fontWeight: '400',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },

  // HASHTAG MODAL
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
  tagChipText: { 
    fontSize: 13, 
    fontWeight: '400', 
    letterSpacing: 0.2,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
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
  suggestionTag: { 
    fontSize: 14, 
    fontWeight: '400', 
    letterSpacing: 0.3,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  suggestionCount: { 
    fontSize: 11, 
    fontWeight: '300', 
    letterSpacing: 0.2,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
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
  trendingChipText: { 
    fontSize: 12, 
    fontWeight: '400', 
    letterSpacing: 0.2,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  trendingChipCount: { 
    fontSize: 9, 
    fontWeight: '300', 
    letterSpacing: 0.2,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },

  // MODALS
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  
  threeDotMenuContainer: {
    borderRadius: 20,
    width: width * 0.85,
    padding: SIZES.md,
    alignSelf: 'center'
  },
  threeDotMenuHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.md,
    paddingBottom: SIZES.sm,
    borderBottomWidth: 0.5
  },
  threeDotMenuTitle: { 
    ...TYPOGRAPHY.caption, 
    fontSize: 12,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  threeDotMenuItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: SIZES.sm, gap: SIZES.md },
  threeDotMenuItemText: { 
    ...TYPOGRAPHY.body, 
    fontSize: 13,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  menuDivider: { height: 0.5, marginVertical: 4 },

  commentModalContainer: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
    paddingBottom: SIZES.md
  },
  commentModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SIZES.md,
    borderBottomWidth: 0.5
  },
  commentModalTitle: { 
    ...TYPOGRAPHY.caption, 
    fontSize: 12,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  commentItem: {
    flexDirection: 'row',
    padding: SIZES.md,
    borderBottomWidth: 0.5,
    alignItems: 'flex-start'
  },
  commentAvatar: { width: 32, height: 32, borderRadius: 16, marginRight: SIZES.md },
  commentContent: { flex: 1 },
  commentHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 2, gap: SIZES.xs },
  commentUserName: { 
    ...TYPOGRAPHY.body, 
    fontWeight: '500', 
    fontSize: 12,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  commentTime: { 
    ...TYPOGRAPHY.caption, 
    fontSize: 8,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  commentText: { 
    ...TYPOGRAPHY.body, 
    fontSize: 12, 
    lineHeight: 16,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  emptyComments: { padding: SIZES.xl, alignItems: 'center', gap: SIZES.sm },
  emptyCommentsIcon: { 
    width: 80, 
    height: 80, 
    borderRadius: 40, 
    borderWidth: 0.5,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SIZES.sm
  },
  emptyCommentsTitle: { 
    ...TYPOGRAPHY.body, 
    fontSize: 15, 
    fontWeight: '500',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  emptyCommentsText: { 
    ...TYPOGRAPHY.bodySmall, 
    fontSize: 12, 
    textAlign: 'center',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  commentInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SIZES.md,
    borderTopWidth: 0.5,
    gap: SIZES.md
  },
  commentInput: {
    flex: 1,
    ...TYPOGRAPHY.body,
    borderRadius: 25,
    paddingHorizontal: SIZES.md,
    paddingVertical: SIZES.xs,
    maxHeight: 80,
    borderWidth: 0.5,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  commentSendButton: { padding: SIZES.xs },

  // FULL IMAGE
  fullImageOverlay: { flex: 1, backgroundColor: COLORS.black, justifyContent: 'center', alignItems: 'center' },
  fullImageClose: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 40,
    right: SIZES.lg,
    zIndex: 10,
    padding: SIZES.sm
  },
  fullImage: { width: width, height: height * 0.7 },
});

export default PodiumScreen;