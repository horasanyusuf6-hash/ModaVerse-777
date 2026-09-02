// 📁 src/screens/SavedScreen.js - TAM REVİZE (Backend Entegre)
import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, TYPOGRAPHY, SIZES } from '../constants/Theme';
import { auth } from '../config/firebase';
import { outfitAPI } from '../services/api';

const { width, height } = Dimensions.get('window');

// ============================================================
// 📌 KAYDEDİLENLER HOOK (Backend Entegre)
// ============================================================
const useSavedPosts = () => {
  const [savedPosts, setSavedPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        loadSavedPosts(currentUser);
      } else {
        setLoading(false);
      }
    });
    return unsubscribe;
  }, []);

  const loadSavedPosts = async (currentUser) => {
    try {
      const uid = currentUser?.uid || user?.uid;
      if (!uid) {
        setSavedPosts([]);
        setLoading(false);
        return;
      }

      // Önce AsyncStorage'dan kaydedilenleri yükle
      const localSaved = await AsyncStorage.getItem('@saved_posts');
      const localPosts = localSaved ? JSON.parse(localSaved) : [];
      
      // Backend'den feed gönderilerini çek (kaydedilenleri bulmak için)
      const response = await outfitAPI.getFeed();
      
      if (response && response.success) {
        const posts = response.posts || [];
        
        // Backend'de kaydedilenleri bul (kaydetme API'si henüz yok)
        // Şimdilik local saved ile eşleştir
        const saved = localPosts.map(localPost => {
          const backendPost = posts.find(p => p.id === localPost.id);
          return backendPost || localPost;
        });
        
        setSavedPosts(saved);
      } else {
        // Backend yoksa local'den göster
        setSavedPosts(localPosts);
      }
    } catch (error) {
      console.error('Kaydedilenler yükleme hatası:', error);
      setSavedPosts([]);
    } finally {
      setLoading(false);
    }
  };

  const savePost = async (post) => {
    try {
      const currentSaved = [...savedPosts];
      const exists = currentSaved.some(p => p.id === post.id);
      
      let newSaved;
      if (exists) {
        newSaved = currentSaved.filter(p => p.id !== post.id);
      } else {
        newSaved = [...currentSaved, post];
      }
      
      setSavedPosts(newSaved);
      await AsyncStorage.setItem('@saved_posts', JSON.stringify(newSaved));
      
      // TODO: Backend'e kaydetme isteği gönder
      // await outfitAPI.savePost(post.id, user.uid);
      
      return { success: true, isSaved: !exists };
    } catch (error) {
      console.error('Kaydetme hatası:', error);
      return { success: false };
    }
  };

  const removeSavedPost = async (postId) => {
    try {
      const newSaved = savedPosts.filter(p => p.id !== postId);
      setSavedPosts(newSaved);
      await AsyncStorage.setItem('@saved_posts', JSON.stringify(newSaved));
      
      // TODO: Backend'den kaldır
      // await outfitAPI.unsavePost(postId, user.uid);
      
      return { success: true };
    } catch (error) {
      console.error('Kaldırma hatası:', error);
      return { success: false };
    }
  };

  const removeMultipleSaved = async (postIds) => {
    try {
      const newSaved = savedPosts.filter(p => !postIds.includes(p.id));
      setSavedPosts(newSaved);
      await AsyncStorage.setItem('@saved_posts', JSON.stringify(newSaved));
      return { success: true, count: postIds.length };
    } catch (error) {
      console.error('Toplu kaldırma hatası:', error);
      return { success: false };
    }
  };

  return { 
    savedPosts, 
    loading, 
    loadSavedPosts,
    savePost,
    removeSavedPost,
    removeMultipleSaved,
    user
  };
};

// ============================================================
// 📌 ANA BİLEŞEN
// ============================================================
const SavedScreen = ({ navigation }) => {
  const { savedPosts, loading, loadSavedPosts, removeSavedPost, removeMultipleSaved } = useSavedPosts();
  
  const [refreshing, setRefreshing] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);
  const [isSelectionMode, setIsSelectionMode] = useState(false);

  // ============================================================
  // 📌 HANDLERS
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
              Alert.alert('Başarılı', 'Kaydedilenlerden çıkarıldı');
            }
          },
          style: 'destructive'
        }
      ]
    );
  }, [removeSavedPost]);

  const toggleSelectionMode = useCallback(() => {
    setIsSelectionMode(!isSelectionMode);
    setSelectedItems([]);
  }, [isSelectionMode]);

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
              Alert.alert('Başarılı', `${result.count} gönderi çıkarıldı`);
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
      navigation.navigate('PostDetail', { post });
    }
  }, [isSelectionMode, navigation]);

  const formatNumber = (num) => {
    if (!num) return '0';
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num?.toString() || '0';
  };

  // ============================================================
  // 📌 RENDER FUNCTIONS
  // ============================================================
  const renderHeader = useCallback(() => (
    <View style={styles.header}>
      <View style={styles.headerLeft}>
        <TouchableOpacity 
          onPress={() => navigation?.goBack()}
          style={styles.backButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="arrow-back" size={22} color={COLORS.black} />
        </TouchableOpacity>
        
        <View>
          <Text style={styles.title}>KAYDEDİLENLER</Text>
          <Text style={styles.subtitle}>
            {savedPosts.length} {savedPosts.length === 1 ? 'GÖNDERİ' : 'GÖNDERİ'}
          </Text>
        </View>
      </View>
      
      <View style={styles.headerRight}>
        {savedPosts.length > 0 && (
          <TouchableOpacity 
            onPress={toggleSelectionMode}
            style={styles.selectButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons 
              name={isSelectionMode ? "close" : "checkbox-outline"} 
              size={18} 
              color={COLORS.black} 
            />
          </TouchableOpacity>
        )}
        
        {isSelectionMode && selectedItems.length > 0 && (
          <TouchableOpacity 
            onPress={removeSelectedItems}
            style={styles.deleteButton}
          >
            <Ionicons name="trash-outline" size={10} color={COLORS.white} />
            <Text style={styles.deleteButtonText}>
              {selectedItems.length}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  ), [savedPosts.length, isSelectionMode, selectedItems.length, toggleSelectionMode, removeSelectedItems, navigation]);

  const renderSavedPost = useCallback(({ item }) => {
    const isSelected = selectedItems.includes(item.id);
    const userName = item.user_name || item.userName || 'Kullanıcı';
    const userAvatar = item.user_avatar || item.userAvatar || `https://i.pravatar.cc/100?img=${(item.id || 1) % 10}`;
    const content = item.title || item.description || item.content || 'Kaydedilmiş bir gönderi';
    const time = item.created_at || item.time || 'Geçmiş';
    const likes = item.like_count || item.likes || 0;
    const comments = item.comment_count || item.comments || 0;
    const product = item.product || null;
    
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
          if (!isSelectionMode) {
            toggleSelectionMode();
            toggleItemSelection(item.id);
          }
        }}
        delayLongPress={500}
      >
        <View style={[styles.postCard, isSelected && styles.postCardSelected]}>
          {isSelectionMode && (
            <View style={styles.selectionIndicator}>
              <Ionicons 
                name={isSelected ? "checkbox" : "square-outline"} 
                size={16} 
                color={isSelected ? COLORS.black : COLORS.grayMedium} 
              />
            </View>
          )}
          
          <View style={[styles.postContent, isSelectionMode && styles.postWithSelection]}>
            <View style={styles.postHeader}>
              <Image source={{ uri: userAvatar }} style={styles.userAvatar} />
              <View style={styles.userInfo}>
                <Text style={styles.userName}>{userName}</Text>
                <Text style={styles.postTime}>{time}</Text>
              </View>
              {!isSelectionMode && (
                <TouchableOpacity 
                  style={styles.removeIcon}
                  onPress={() => handleRemoveSaved(item)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Ionicons name="close" size={16} color={COLORS.grayMedium} />
                </TouchableOpacity>
              )}
            </View>
            
            <Text style={styles.postText} numberOfLines={3}>
              {content}
            </Text>
            
            {product && (
              <View style={styles.productTag}>
                <Ionicons name="shirt-outline" size={10} color={COLORS.grayMedium} />
                <Text style={styles.productTagText}>
                  {product.brand || 'Marka'} - {product.name || 'Ürün'}
                </Text>
              </View>
            )}
            
            <View style={styles.postFooter}>
              <View style={styles.stats}>
                <Ionicons name="heart-outline" size={12} color={COLORS.grayMedium} />
                <Text style={styles.statsText}>{formatNumber(likes)}</Text>
                <Ionicons name="chatbubble-outline" size={12} color={COLORS.grayMedium} style={{ marginLeft: SIZES.md }} />
                <Text style={styles.statsText}>{formatNumber(comments)}</Text>
              </View>
              <View style={styles.savedBadge}>
                <Ionicons name="bookmark" size={10} color={COLORS.black} />
                <Text style={styles.savedBadgeText}>KAYDEDİLDİ</Text>
              </View>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  }, [isSelectionMode, selectedItems, toggleItemSelection, handlePostPress, toggleSelectionMode, handleRemoveSaved]);

  const renderEmptyState = useCallback(() => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconContainer}>
        <Ionicons name="bookmark-outline" size={40} color={COLORS.grayMedium} />
      </View>
      <Text style={styles.emptyTitle}>KAYDEDİLEN GÖNDERİ YOK</Text>
      <Text style={styles.emptyText}>
        Beğendiğin gönderileri kaydederek buradan takip edebilirsin.
      </Text>
      <TouchableOpacity 
        style={styles.exploreButton}
        onPress={() => navigation?.goBack()}
      >
        <Text style={styles.exploreButtonText}>GÖNDERİLERİ KEŞFET</Text>
      </TouchableOpacity>
    </View>
  ), [navigation]);

  // ============================================================
  // 📌 RENDER
  // ============================================================
  if (loading) {
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
      
      <FlatList
        data={savedPosts}
        keyExtractor={(item) => item?.id?.toString() || Math.random().toString()}
        renderItem={renderSavedPost}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.black}
          />
        }
        ListEmptyComponent={renderEmptyState}
      />
    </SafeAreaView>
  );
};

// ============================================================
// 📌 STYLES
// ============================================================
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: SIZES.md },
  loadingText: { ...TYPOGRAPHY.caption, color: COLORS.grayMedium },

  // HEADER
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SIZES.lg,
    paddingVertical: SIZES.md,
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.grayLight,
    backgroundColor: COLORS.white,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: SIZES.md },
  backButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'flex-start' },
  title: { ...TYPOGRAPHY.caption, letterSpacing: 1 },
  subtitle: { ...TYPOGRAPHY.caption, fontSize: 9, color: COLORS.grayMedium, marginTop: 2 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: SIZES.md },
  selectButton: { padding: 4 },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.black,
    paddingHorizontal: SIZES.sm,
    paddingVertical: 2,
    gap: 4,
  },
  deleteButtonText: { ...TYPOGRAPHY.caption, fontSize: 9, color: COLORS.white },

  // LIST
  listContent: { paddingHorizontal: SIZES.lg, paddingBottom: SIZES.xl, paddingTop: SIZES.md },

  // POST CARD
  postCard: { backgroundColor: COLORS.white, borderWidth: 0.5, borderColor: COLORS.grayLight, marginBottom: SIZES.md },
  postCardSelected: { borderColor: COLORS.black, borderWidth: 1 },
  selectionIndicator: { position: 'absolute', left: SIZES.md, top: SIZES.md, zIndex: 10 },
  postContent: { padding: SIZES.md },
  postWithSelection: { marginLeft: 36 },
  postHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: SIZES.md },
  userAvatar: { width: 40, height: 40, borderWidth: 0.5, borderColor: COLORS.grayLight, backgroundColor: COLORS.surface },
  userInfo: { flex: 1, marginLeft: SIZES.md },
  userName: { ...TYPOGRAPHY.body, fontWeight: '500' },
  postTime: { ...TYPOGRAPHY.caption, fontSize: 9, color: COLORS.grayMedium, marginTop: 2 },
  removeIcon: { padding: 4 },
  postText: { ...TYPOGRAPHY.bodySmall, lineHeight: 18, marginBottom: SIZES.sm },
  productTag: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 0.5,
    borderColor: COLORS.grayLight,
    paddingHorizontal: SIZES.sm,
    paddingVertical: 4,
    alignSelf: 'flex-start',
    marginBottom: SIZES.sm,
    gap: 4,
  },
  productTagText: { ...TYPOGRAPHY.caption, fontSize: 9, color: COLORS.grayMedium },
  postFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 },
  stats: { flexDirection: 'row', alignItems: 'center' },
  statsText: { ...TYPOGRAPHY.caption, fontSize: 9, color: COLORS.grayMedium, marginLeft: 2 },
  savedBadge: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  savedBadgeText: { ...TYPOGRAPHY.caption, fontSize: 8, color: COLORS.black },

  // EMPTY STATE
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SIZES.xl,
    minHeight: 500,
  },
  emptyIconContainer: { width: 80, height: 80, borderWidth: 0.5, borderColor: COLORS.grayLight, justifyContent: 'center', alignItems: 'center', marginBottom: SIZES.lg },
  emptyTitle: { ...TYPOGRAPHY.caption, marginBottom: 4 },
  emptyText: { ...TYPOGRAPHY.bodySmall, textAlign: 'center', lineHeight: 18, marginBottom: SIZES.lg },
  exploreButton: { borderWidth: 0.5, borderColor: COLORS.grayLight, paddingHorizontal: SIZES.xl, paddingVertical: SIZES.md },
  exploreButtonText: { ...TYPOGRAPHY.button, color: COLORS.black },
});

export default SavedScreen;