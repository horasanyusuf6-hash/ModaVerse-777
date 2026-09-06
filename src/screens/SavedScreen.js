// 📁 src/screens/SavedScreen.js - REVİZE EDİLMİŞ
import React, { useState, useEffect, useCallback, useMemo, memo, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  SafeAreaView,
  StatusBar,
  Alert,
  Dimensions,
  RefreshControl,
  Image,
  ActivityIndicator,
  Platform,
  InteractionManager
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { COLORS, TYPOGRAPHY, SIZES, SPACING } from '../constants/Theme';
import { auth } from '../config/firebase';
import { outfitAPI } from '../services/api';

const { width, height } = Dimensions.get('window');

// ============================================================
// 📌 YARDIMCI BİLEŞENLER (Memoized)
// ============================================================

// Avatar Component
const UserAvatar = memo(({ uri, size = 40 }) => {
  const [imageError, setImageError] = useState(false);
  
  return (
    <View style={[styles.userAvatar, { width: size, height: size }]}>
      {imageError ? (
        <View style={[styles.avatarFallback, { width: size, height: size }]}>
          <Ionicons name="person-outline" size={size * 0.5} color={COLORS.grayMedium} />
        </View>
      ) : (
        <Image 
          source={{ uri }} 
          style={[styles.userAvatar, { width: size, height: size }]}
          onError={() => setImageError(true)}
          loadingIndicatorSource={require('../assets/placeholder.png')}
        />
      )}
    </View>
  );
});

UserAvatar.displayName = 'UserAvatar';

// Stat Badge Component
const StatBadge = memo(({ icon, value, style }) => (
  <View style={[styles.statBadge, style]}>
    <Ionicons name={icon} size={12} color={COLORS.grayMedium} />
    <Text style={styles.statBadgeText}>{value}</Text>
  </View>
));

StatBadge.displayName = 'StatBadge';

// Selection Indicator
const SelectionIndicator = memo(({ isSelected, onPress }) => (
  <TouchableOpacity
    style={styles.selectionIndicator}
    onPress={onPress}
    hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
    accessibilityLabel={isSelected ? 'Seçili' : 'Seçilmedi'}
    accessibilityRole="checkbox"
    accessibilityState={{ checked: isSelected }}
  >
    <Ionicons 
      name={isSelected ? "checkbox" : "square-outline"} 
      size={20} 
      color={isSelected ? COLORS.black : COLORS.grayMedium} 
    />
  </TouchableOpacity>
));

SelectionIndicator.displayName = 'SelectionIndicator';

// ============================================================
// 📌 KAYDEDİLENLER HOOK (Optimized)
// ============================================================
const useSavedPosts = () => {
  const [savedPosts, setSavedPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [isOffline, setIsOffline] = useState(false);
  const [error, setError] = useState(null);
  const loadTimeoutRef = useRef(null);

  // Network listener
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsOffline(!state.isConnected);
    });
    return () => unsubscribe();
  }, []);

  // Auth listener
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        loadSavedPosts(currentUser);
      } else {
        setSavedPosts([]);
        setLoading(false);
      }
    });
    return unsubscribe;
  }, []);

  const loadSavedPosts = useCallback(async (currentUser) => {
    try {
      setLoading(true);
      setError(null);
      
      const uid = currentUser?.uid;
      if (!uid) {
        setSavedPosts([]);
        setLoading(false);
        return;
      }

      // 1. Önce cache'den yükle (hızlı gösterim)
      const cachedPosts = await loadFromCache();
      if (cachedPosts && cachedPosts.length > 0) {
        setSavedPosts(cachedPosts);
      }

      // 2. Offline kontrol
      if (isOffline) {
        setLoading(false);
        return;
      }

      // 3. Backend'den çek
      const response = await outfitAPI.getSavedPosts(uid);
      
      if (response?.success) {
        const posts = response.posts || [];
        setSavedPosts(posts);
        // Cache'e kaydet
        await AsyncStorage.setItem('@saved_posts', JSON.stringify(posts));
      } else {
        // Backend hata verirse cache'deki verileri göster
        if (!cachedPosts || cachedPosts.length === 0) {
          setError('Kaydedilen gönderiler yüklenemedi');
        }
      }
    } catch (error) {
      console.error('Kaydedilenler yükleme hatası:', error);
      setError('Bir hata oluştu, lütfen tekrar deneyin');
      
      // Hata durumunda cache'den dene
      const cachedPosts = await loadFromCache();
      if (cachedPosts && cachedPosts.length > 0) {
        setSavedPosts(cachedPosts);
      }
    } finally {
      setLoading(false);
    }
  }, [isOffline]);

  const loadFromCache = useCallback(async () => {
    try {
      const cached = await AsyncStorage.getItem('@saved_posts');
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  }, []);

  const savePost = useCallback(async (post) => {
    try {
      if (isOffline) {
        Alert.alert('Çevrimdışı', 'Kaydetme işlemi için internet bağlantısı gerekli');
        return { success: false, isSaved: false };
      }

      const currentSaved = [...savedPosts];
      const exists = currentSaved.some(p => p.id === post.id);
      
      let newSaved;
      if (exists) {
        newSaved = currentSaved.filter(p => p.id !== post.id);
      } else {
        newSaved = [...currentSaved, { ...post, savedAt: new Date().toISOString() }];
      }
      
      setSavedPosts(newSaved);
      await AsyncStorage.setItem('@saved_posts', JSON.stringify(newSaved));
      
      // Backend'e gönder
      if (exists) {
        await outfitAPI.unsavePost(post.id, user.uid);
      } else {
        await outfitAPI.savePost(post.id, user.uid);
      }
      
      return { success: true, isSaved: !exists };
    } catch (error) {
      console.error('Kaydetme hatası:', error);
      Alert.alert('Hata', 'İşlem başarısız oldu, lütfen tekrar deneyin');
      return { success: false };
    }
  }, [savedPosts, user, isOffline]);

  const removeSavedPost = useCallback(async (postId) => {
    try {
      if (isOffline) {
        Alert.alert('Çevrimdışı', 'Kaldırma işlemi için internet bağlantısı gerekli');
        return { success: false };
      }

      const newSaved = savedPosts.filter(p => p.id !== postId);
      setSavedPosts(newSaved);
      await AsyncStorage.setItem('@saved_posts', JSON.stringify(newSaved));
      
      await outfitAPI.unsavePost(postId, user.uid);
      
      return { success: true };
    } catch (error) {
      console.error('Kaldırma hatası:', error);
      Alert.alert('Hata', 'Kaldırma işlemi başarısız oldu');
      return { success: false };
    }
  }, [savedPosts, user, isOffline]);

  const removeMultipleSaved = useCallback(async (postIds) => {
    try {
      if (isOffline) {
        Alert.alert('Çevrimdışı', 'Toplu kaldırma için internet bağlantısı gerekli');
        return { success: false };
      }

      const newSaved = savedPosts.filter(p => !postIds.includes(p.id));
      setSavedPosts(newSaved);
      await AsyncStorage.setItem('@saved_posts', JSON.stringify(newSaved));
      
      // Toplu kaldırma
      await Promise.all(postIds.map(id => outfitAPI.unsavePost(id, user.uid)));
      
      return { success: true, count: postIds.length };
    } catch (error) {
      console.error('Toplu kaldırma hatası:', error);
      Alert.alert('Hata', 'Toplu kaldırma başarısız oldu');
      return { success: false };
    }
  }, [savedPosts, user, isOffline]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (loadTimeoutRef.current) {
        clearTimeout(loadTimeoutRef.current);
      }
    };
  }, []);

  return { 
    savedPosts, 
    loading, 
    error,
    isOffline,
    loadSavedPosts,
    savePost,
    removeSavedPost,
    removeMultipleSaved,
    user,
    loadFromCache
  };
};

// ============================================================
// 📌 ANA BİLEŞEN
// ============================================================
const SavedScreen = ({ navigation }) => {
  const { 
    savedPosts, 
    loading, 
    error,
    isOffline,
    loadSavedPosts, 
    removeSavedPost, 
    removeMultipleSaved 
  } = useSavedPosts();
  
  const [refreshing, setRefreshing] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [sortBy, setSortBy] = useState('recent'); // 'recent' | 'oldest'
  
  // Sorted posts
  const sortedPosts = useMemo(() => {
    const posts = [...savedPosts];
    if (sortBy === 'recent') {
      return posts.sort((a, b) => new Date(b.savedAt || b.created_at || 0) - new Date(a.savedAt || a.created_at || 0));
    } else {
      return posts.sort((a, b) => new Date(a.savedAt || a.created_at || 0) - new Date(b.savedAt || b.created_at || 0));
    }
  }, [savedPosts, sortBy]);

  // ============================================================
  // 📌 HANDLERS (useCallback ile optimize)
  // ============================================================
  const handleRemoveSaved = useCallback((post) => {
    Alert.alert(
      'Kaydedilenlerden Çıkar',
      `Bu gönderi kaydedilenlerden çıkarılsın mı?`,
      [
        { text: 'İptal', style: 'cancel' },
        { 
          text: 'Çıkar', 
          onPress: async () => {
            const result = await removeSavedPost(post.id);
            if (result.success) {
              // Başarılı mesajı göster
            }
          },
          style: 'destructive'
        }
      ]
    );
  }, [removeSavedPost]);

  const toggleSelectionMode = useCallback(() => {
    setIsSelectionMode(prev => !prev);
    setSelectedItems([]);
  }, []);

  const toggleItemSelection = useCallback((postId) => {
    setSelectedItems(prev =>
      prev.includes(postId)
        ? prev.filter(id => id !== postId)
        : [...prev, postId]
    );
  }, []);

  const removeSelectedItems = useCallback(async () => {
    if (selectedItems.length === 0) return;
    
    Alert.alert(
      'Toplu Kaldırma',
      `${selectedItems.length} gönderi kaydedilenlerden çıkarılsın mı?`,
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Kaldır',
          onPress: async () => {
            const result = await removeMultipleSaved(selectedItems);
            if (result.success) {
              setSelectedItems([]);
              setIsSelectionMode(false);
            }
          },
          style: 'destructive'
        }
      ]
    );
  }, [selectedItems, removeMultipleSaved]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadSavedPosts();
    setRefreshing(false);
  }, [loadSavedPosts]);

  const handlePostPress = useCallback((post) => {
    if (!isSelectionMode) {
      // InteractionManager ile navigasyonu optimize et
      InteractionManager.runAfterInteractions(() => {
        navigation.navigate('PostDetail', { post });
      });
    }
  }, [isSelectionMode, navigation]);

  const handleSortToggle = useCallback(() => {
    setSortBy(prev => prev === 'recent' ? 'oldest' : 'recent');
  }, []);

  const formatNumber = useCallback((num) => {
    if (!num) return '0';
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num?.toString() || '0';
  }, []);

  // ============================================================
  // 📌 RENDER FUNCTIONS (useCallback ile optimize)
  // ============================================================
  const renderHeader = useCallback(() => (
    <View style={styles.header}>
      <View style={styles.headerLeft}>
        <TouchableOpacity 
          onPress={() => navigation?.goBack()}
          style={styles.backButton}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          accessibilityLabel="Geri dön"
          accessibilityRole="button"
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.black} />
        </TouchableOpacity>
        
        <View>
          <Text style={styles.title}>KAYDEDİLENLER</Text>
          <Text style={styles.subtitle}>
            {savedPosts.length} {savedPosts.length === 1 ? 'GÖNDERİ' : 'GÖNDERİ'}
          </Text>
        </View>
      </View>
      
      <View style={styles.headerRight}>
        {/* Sort Button */}
        <TouchableOpacity 
          onPress={handleSortToggle}
          style={styles.sortButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          accessibilityLabel="Sıralamayı değiştir"
          accessibilityRole="button"
        >
          <Ionicons 
            name={sortBy === 'recent' ? "time-outline" : "time"} 
            size={18} 
            color={COLORS.black} 
          />
        </TouchableOpacity>
        
        {savedPosts.length > 0 && (
          <TouchableOpacity 
            onPress={toggleSelectionMode}
            style={styles.selectButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            accessibilityLabel={isSelectionMode ? "Seçim modunu kapat" : "Seçim modunu aç"}
            accessibilityRole="button"
          >
            <Ionicons 
              name={isSelectionMode ? "close" : "checkbox-outline"} 
              size={20} 
              color={COLORS.black} 
            />
          </TouchableOpacity>
        )}
        
        {isSelectionMode && selectedItems.length > 0 && (
          <TouchableOpacity 
            onPress={removeSelectedItems}
            style={styles.deleteButton}
            accessibilityLabel={`${selectedItems.length} gönderiyi kaldır`}
            accessibilityRole="button"
          >
            <Ionicons name="trash-outline" size={14} color={COLORS.white} />
            <Text style={styles.deleteButtonText}>
              {selectedItems.length}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  ), [
    savedPosts.length, 
    isSelectionMode, 
    selectedItems.length, 
    toggleSelectionMode, 
    removeSelectedItems, 
    navigation,
    sortBy,
    handleSortToggle
  ]);

  const renderSavedPost = useCallback(({ item }) => {
    const isSelected = selectedItems.includes(item.id);
    const userName = item.user_name || item.userName || 'Kullanıcı';
    const userAvatar = item.user_avatar || item.userAvatar || `https://i.pravatar.cc/100?img=${(item.id || 1) % 10}`;
    const content = item.title || item.description || item.content || 'Kaydedilmiş bir gönderi';
    const time = item.created_at || item.time || 'Geçmiş';
    const likes = item.like_count || item.likes || 0;
    const comments = item.comment_count || item.comments || 0;
    const product = item.product || null;
    const images = item.images || [];
    const hasImage = images.length > 0;
    
    return (
      <TouchableOpacity 
        activeOpacity={0.7}
        onPress={() => {
          if (isSelectionMode) {
            toggleItemSelection(item.id);
          } else {
            handlePostPress(item);
          }
        }}
        onLongPress={() => {
          if (!isSelectionMode && savedPosts.length > 0) {
            toggleSelectionMode();
            toggleItemSelection(item.id);
          }
        }}
        delayLongPress={500}
        accessibilityLabel={`${userName} gönderisi`}
        accessibilityRole="button"
      >
        <View style={[styles.postCard, isSelected && styles.postCardSelected]}>
          {/* Selection Indicator */}
          {isSelectionMode && (
            <SelectionIndicator 
              isSelected={isSelected}
              onPress={() => toggleItemSelection(item.id)}
            />
          )}
          
          <View style={[styles.postContent, isSelectionMode && styles.postWithSelection]}>
            <View style={styles.postHeader}>
              <UserAvatar uri={userAvatar} size={40} />
              <View style={styles.userInfo}>
                <Text style={styles.userName}>{userName}</Text>
                <Text style={styles.postTime}>{time}</Text>
              </View>
              {!isSelectionMode && (
                <TouchableOpacity 
                  style={styles.removeIcon}
                  onPress={() => handleRemoveSaved(item)}
                  hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                  accessibilityLabel="Gönderiyi kaldır"
                  accessibilityRole="button"
                >
                  <Ionicons name="close" size={18} color={COLORS.grayMedium} />
                </TouchableOpacity>
              )}
            </View>
            
            {/* Image Preview */}
            {hasImage && (
              <View style={styles.imagePreviewContainer}>
                <Image 
                  source={{ uri: images[0] }}
                  style={styles.imagePreview}
                  resizeMode="cover"
                  defaultSource={require('../assets/placeholder.png')}
                />
                {images.length > 1 && (
                  <View style={styles.imageCountBadge}>
                    <Text style={styles.imageCountText}>+{images.length - 1}</Text>
                  </View>
                )}
              </View>
            )}
            
            <Text style={styles.postText} numberOfLines={3}>
              {content}
            </Text>
            
            {product && (
              <View style={styles.productTag}>
                <Ionicons name="shirt-outline" size={12} color={COLORS.grayMedium} />
                <Text style={styles.productTagText}>
                  {product.brand || 'Marka'} - {product.name || 'Ürün'}
                </Text>
              </View>
            )}
            
            <View style={styles.postFooter}>
              <View style={styles.stats}>
                <StatBadge icon="heart-outline" value={formatNumber(likes)} />
                <StatBadge 
                  icon="chatbubble-outline" 
                  value={formatNumber(comments)}
                  style={{ marginLeft: SIZES.md || 16 }}
                />
              </View>
              <View style={styles.savedBadge}>
                <Ionicons name="bookmark" size={12} color={COLORS.black} />
                <Text style={styles.savedBadgeText}>KAYDEDİLDİ</Text>
              </View>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  }, [
    isSelectionMode, 
    selectedItems, 
    toggleItemSelection, 
    handlePostPress, 
    toggleSelectionMode, 
    handleRemoveSaved,
    savedPosts.length,
    formatNumber
  ]);

  const renderEmptyState = useCallback(() => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconContainer}>
        <Ionicons name="bookmark-outline" size={48} color={COLORS.grayMedium} />
      </View>
      <Text style={styles.emptyTitle}>KAYDEDİLEN GÖNDERİ YOK</Text>
      <Text style={styles.emptyText}>
        Beğendiğin gönderileri kaydederek buradan takip edebilirsin.
      </Text>
      <TouchableOpacity 
        style={styles.exploreButton}
        onPress={() => navigation?.goBack()}
        accessibilityLabel="Gönderileri keşfet"
        accessibilityRole="button"
      >
        <Text style={styles.exploreButtonText}>GÖNDERİLERİ KEŞFET</Text>
      </TouchableOpacity>
    </View>
  ), [navigation]);

  const renderErrorState = useCallback(() => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconContainer}>
        <Ionicons name="alert-circle-outline" size={48} color={COLORS.grayMedium} />
      </View>
      <Text style={styles.emptyTitle}>BİR HATA OLUŞTU</Text>
      <Text style={styles.emptyText}>
        {error || 'Gönderiler yüklenirken bir sorun oluştu.'}
      </Text>
      <TouchableOpacity 
        style={styles.exploreButton}
        onPress={onRefresh}
        accessibilityLabel="Tekrar dene"
        accessibilityRole="button"
      >
        <Text style={styles.exploreButtonText}>TEKRAR DENE</Text>
      </TouchableOpacity>
    </View>
  ), [error, onRefresh]);

  const renderOfflineBanner = useCallback(() => {
    if (!isOffline) return null;
    return (
      <View style={styles.offlineBanner}>
        <Ionicons name="wifi-outline" size={16} color={COLORS.white} />
        <Text style={styles.offlineText}>Çevrimdışı - Kaydedilenler gösteriliyor</Text>
      </View>
    );
  }, [isOffline]);

  // ============================================================
  // 📌 RENDER
  // ============================================================
  if (loading && savedPosts.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.black} />
          <Text style={styles.loadingText}>YÜKLENİYOR...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
      
      {renderHeader()}
      {renderOfflineBanner()}
      
      {error && savedPosts.length === 0 ? (
        renderErrorState()
      ) : (
        <FlatList
          data={sortedPosts}
          keyExtractor={(item) => item?.id?.toString() || Math.random().toString()}
          renderItem={renderSavedPost}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={COLORS.black}
              colors={[COLORS.black]}
            />
          }
          ListEmptyComponent={renderEmptyState}
          removeClippedSubviews={true}
          maxToRenderPerBatch={10}
          windowSize={10}
          initialNumToRender={5}
        />
      )}
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
    alignItems: 'center', 
    gap: SIZES.md || 16 
  },
  loadingText: { 
    ...TYPOGRAPHY.caption, 
    color: COLORS.grayMedium 
  },

  // OFFLINE BANNER
  offlineBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.black,
    paddingVertical: SIZES.xs || 8,
    paddingHorizontal: SIZES.md || 16,
    gap: SIZES.xs || 8,
  },
  offlineText: {
    ...TYPOGRAPHY.caption,
    fontSize: 10,
    color: COLORS.white,
  },

  // HEADER
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SIZES.lg || 20,
    paddingVertical: SIZES.md || 16,
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.grayLight || '#E5E5E5',
    backgroundColor: COLORS.white,
  },
  headerLeft: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: SIZES.md || 16 
  },
  backButton: { 
    width: 40, 
    height: 40, 
    justifyContent: 'center', 
    alignItems: 'flex-start' 
  },
  title: { 
    ...TYPOGRAPHY.caption, 
    letterSpacing: 1 
  },
  subtitle: { 
    ...TYPOGRAPHY.caption, 
    fontSize: 9, 
    color: COLORS.grayMedium || '#999999', 
    marginTop: 2 
  },
  headerRight: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: SIZES.md || 16 
  },
  sortButton: { 
    padding: 4 
  },
  selectButton: { 
    padding: 4 
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.black,
    paddingHorizontal: SIZES.sm || 12,
    paddingVertical: 4,
    gap: 4,
  },
  deleteButtonText: { 
    ...TYPOGRAPHY.caption, 
    fontSize: 9, 
    color: COLORS.white 
  },

  // LIST
  listContent: { 
    paddingHorizontal: SIZES.lg || 20, 
    paddingBottom: SIZES.xl || 40, 
    paddingTop: SIZES.md || 16 
  },

  // POST CARD
  postCard: { 
    backgroundColor: COLORS.white, 
    borderWidth: 0.5, 
    borderColor: COLORS.grayLight || '#E5E5E5', 
    marginBottom: SIZES.md || 16 
  },
  postCardSelected: { 
    borderColor: COLORS.black, 
    borderWidth: 1 
  },
  selectionIndicator: { 
    position: 'absolute', 
    left: SIZES.md || 16, 
    top: SIZES.md || 16, 
    zIndex: 10 
  },
  postContent: { 
    padding: SIZES.md || 16 
  },
  postWithSelection: { 
    marginLeft: 40 
  },
  
  // POST HEADER
  postHeader: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginBottom: SIZES.md || 16 
  },
  userAvatar: { 
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: COLORS.surface || '#F5F5F5',
    borderWidth: 0.5,
    borderColor: COLORS.grayLight || '#E5E5E5',
  },
  avatarFallback: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.surface || '#F5F5F5',
    borderRadius: 20,
  },
  userInfo: { 
    flex: 1, 
    marginLeft: SIZES.md || 16 
  },
  userName: { 
    ...TYPOGRAPHY.body, 
    fontWeight: '500' 
  },
  postTime: { 
    ...TYPOGRAPHY.caption, 
    fontSize: 9, 
    color: COLORS.grayMedium || '#999999', 
    marginTop: 2 
  },
  removeIcon: { 
    padding: 4 
  },

  // IMAGE PREVIEW
  imagePreviewContainer: {
    position: 'relative',
    marginBottom: SIZES.md || 16,
    borderRadius: 4,
    overflow: 'hidden',
  },
  imagePreview: {
    width: '100%',
    height: 200,
    backgroundColor: COLORS.surface || '#F5F5F5',
  },
  imageCountBadge: {
    position: 'absolute',
    top: SIZES.sm || 12,
    right: SIZES.sm || 12,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: SIZES.sm || 12,
    paddingVertical: 4,
    borderRadius: 4,
  },
  imageCountText: {
    ...TYPOGRAPHY.caption,
    fontSize: 10,
    color: COLORS.white,
  },

  // POST CONTENT
  postText: { 
    ...TYPOGRAPHY.bodySmall, 
    lineHeight: 20, 
    marginBottom: SIZES.sm || 12 
  },
  productTag: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 0.5,
    borderColor: COLORS.grayLight || '#E5E5E5',
    paddingHorizontal: SIZES.sm || 12,
    paddingVertical: 4,
    alignSelf: 'flex-start',
    marginBottom: SIZES.sm || 12,
    gap: 4,
  },
  productTagText: { 
    ...TYPOGRAPHY.caption, 
    fontSize: 9, 
    color: COLORS.grayMedium || '#999999' 
  },

  // POST FOOTER
  postFooter: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginTop: 4 
  },
  stats: { 
    flexDirection: 'row', 
    alignItems: 'center' 
  },
  statBadge: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 4 
  },
  statBadgeText: { 
    ...TYPOGRAPHY.caption, 
    fontSize: 10, 
    color: COLORS.grayMedium || '#999999' 
  },
  savedBadge: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 4 
  },
  savedBadgeText: { 
    ...TYPOGRAPHY.caption, 
    fontSize: 8, 
    color: COLORS.black 
  },

  // EMPTY STATE
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SIZES.xl || 40,
    minHeight: height * 0.6,
  },
  emptyIconContainer: { 
    width: 80, 
    height: 80, 
    borderWidth: 0.5, 
    borderColor: COLORS.grayLight || '#E5E5E5', 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginBottom: SIZES.lg || 20 
  },
  emptyTitle: { 
    ...TYPOGRAPHY.caption, 
    marginBottom: 4 
  },
  emptyText: { 
    ...TYPOGRAPHY.bodySmall, 
    textAlign: 'center', 
    lineHeight: 20, 
    marginBottom: SIZES.lg || 20 
  },
  exploreButton: { 
    borderWidth: 0.5, 
    borderColor: COLORS.grayLight || '#E5E5E5', 
    paddingHorizontal: SIZES.xl || 40, 
    paddingVertical: SIZES.md || 16 
  },
  exploreButtonText: { 
    ...TYPOGRAPHY.button, 
    color: COLORS.black 
  },
});

export default SavedScreen;