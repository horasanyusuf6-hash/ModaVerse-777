// 📁 src/screens/VitrinimScreen.js - TAM REVİZE (ÇALIŞIR)
import React, { useState, useRef, useEffect, useCallback } from 'react';
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
} from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, TYPOGRAPHY, SIZES } from '../constants/Theme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth } from '../config/firebase';
import { outfitAPI, sefAPI, wardrobeAPI } from '../services/api';
import api from '../services/api';

const { width, height } = Dimensions.get('window');

// ============================================================
// 📌 KATEGORİLER
// ============================================================
const CATEGORIES = [
  { id: 'all', name: 'TÜMÜ', icon: 'grid-outline' },
  { id: 'üst', name: 'ÜST', icon: 'shirt-outline' },
  { id: 'alt', name: 'ALT', icon: 'walk-outline' },
  { id: 'ayakkabı', name: 'AYAKKABI', icon: 'footsteps-outline' },
  { id: 'ceket', name: 'CEKET', icon: 'umbrella-outline' },
  { id: 'elbise', name: 'ELBİSE', icon: 'flower-outline' },
];

const SORT_OPTIONS = [
  { id: 'recommended', name: 'ÖNERİLEN', icon: 'trending-up-outline' },
  { id: 'price_asc', name: 'FİYAT (ARTAN)', icon: 'arrow-up-outline' },
  { id: 'price_desc', name: 'FİYAT (AZALAN)', icon: 'arrow-down-outline' },
];

// ============================================================
// 📌 ANA BİLEŞEN
// ============================================================
const VitrinimScreen = ({ navigation }) => {
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
  const [shopFilterVisible, setShopFilterVisible] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [postMenuVisible, setPostMenuVisible] = useState(false);
  const [commentModalVisible, setCommentModalVisible] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [likedPosts, setLikedPosts] = useState({});
  const [savedPosts, setSavedPosts] = useState([]);
  const [user, setUser] = useState(null);

  const searchAnimation = useRef(new Animated.Value(0)).current;

  // ============================================================
  // 📌 FIREBASE AUTH
  // ============================================================
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
    });
    return unsubscribe;
  }, []);

  // ============================================================
  // 📌 VERİ YÜKLEME
  // ============================================================
  const loadData = async () => {
    setLoading(true);
    try {
      await loadProducts();
      await loadFeed();
      await loadFavorites();
      await loadCartCount();
      await loadSavedPosts();
    } catch (error) {
      console.error('Veri yükleme hatası:', error);
    } finally {
      setLoading(false);
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
  const formatPrice = (price) => {
    if (!price) return '0';
    return Math.round(price).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

  const formatNumber = (num) => {
    if (!num) return '0';
    if (typeof num === 'string' && num.includes('K')) return num;
    const n = parseInt(num);
    return n >= 1000 ? (n / 1000).toFixed(1) + 'K' : num.toString();
  };

  const toggleSearch = () => {
    if (!showSearch) {
      setShowSearch(true);
      Animated.timing(searchAnimation, { toValue: 1, duration: 250, useNativeDriver: false }).start();
    } else {
      Animated.timing(searchAnimation, { toValue: 0, duration: 200, useNativeDriver: false }).start(() => {
        setShowSearch(false);
        setSearchQuery('');
      });
    }
  };

  // ============================================================
  // 📌 FAVORİ EKLE/KALDIR
  // ============================================================
  const handleToggleFavorite = async (product) => {
    if (!user) {
      Alert.alert('Giriş Yapın', 'Favorilere eklemek için lütfen giriş yapın.', [
        { text: 'İptal', style: 'cancel' },
        { text: 'Giriş Yap', onPress: () => navigation.navigate('Auth') },
      ]);
      return;
    }

    try {
      const isFavorite = favorites.includes(product.id);
      const response = await wardrobeAPI.toggleStar(
        user.uid,
        product.id,
        !isFavorite
      );
      
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
      Alert.alert('Hata', 'Favori işlemi başarısız oldu.');
    }
  };

  // ============================================================
  // 📌 SEPETE EKLE
  // ============================================================
  const handleAddToCart = async (product) => {
    if (!user) {
      Alert.alert('Giriş Yapın', 'Sepete eklemek için lütfen giriş yapın.', [
        { text: 'İptal', style: 'cancel' },
        { text: 'Giriş Yap', onPress: () => navigation.navigate('Auth') },
      ]);
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
      
      Alert.alert('Sepete Eklendi', `${product.ad || product.name || 'Ürün'} sepete eklendi.`, [
        { text: 'Devam Et', style: 'cancel' },
        { text: 'Sepete Git', onPress: () => navigation.navigate('Cart') },
      ]);
    } catch (error) {
      console.error('Sepet hatası:', error);
      Alert.alert('Hata', 'Sepete ekleme başarısız oldu.');
    }
  };

  // ============================================================
  // 📌 GÖNDERİ KAYDET
  // ============================================================
  const handleSavePost = async (post) => {
    try {
      const isAlreadySaved = savedPosts.some((p) => p.id === post.id);
      let newSaved;
      if (!isAlreadySaved) {
        newSaved = [...savedPosts, post];
        Alert.alert('Gönderi Kaydedildi', '', [
          { text: 'Tamam', style: 'cancel' },
          { text: 'Kaydedilenler', onPress: () => navigation.navigate('Saved') },
        ]);
      } else {
        newSaved = savedPosts.filter((p) => p.id !== post.id);
      }
      setSavedPosts(newSaved);
      await AsyncStorage.setItem('@saved_posts', JSON.stringify(newSaved));
    } catch (error) {
      console.error(error);
    }
  };

  // ============================================================
  // 📌 PAYLAŞ
  // ============================================================
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

  // ============================================================
  // 📌 BEĞEN
  // ============================================================
  const handleLikePost = (postId) => {
    setLikedPosts((prev) => ({ ...prev, [postId]: !prev[postId] }));
  };

  // ============================================================
  // 📌 YORUM
  // ============================================================
  const handleComment = (post) => {
    setSelectedPost(post);
    setCommentModalVisible(true);
  };

  // ============================================================
  // 📌 GET FILTERED PRODUCTS
  // ============================================================
  const getFilteredAndSortedProducts = () => {
    let filtered = [...products];
    
    if (selectedCategory !== 'all') {
      filtered = filtered.filter((p) => 
        p.kategori && p.kategori.toLowerCase() === selectedCategory.toLowerCase()
      );
    }
    
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((p) => 
        (p.ad && p.ad.toLowerCase().includes(query)) || 
        (p.marka && p.marka.toLowerCase().includes(query))
      );
    }
    
    switch (selectedSort) {
      case 'price_asc':
        filtered.sort((a, b) => (a.fiyat || 0) - (b.fiyat || 0));
        break;
      case 'price_desc':
        filtered.sort((a, b) => (b.fiyat || 0) - (a.fiyat || 0));
        break;
      default:
        break;
    }
    
    return filtered;
  };

  // ============================================================
  // 📌 YENİLE
  // ============================================================
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, []);

  // ============================================================
  // 📌 TABS
  // ============================================================
  const TabToggle = () => (
    <View style={styles.toggleContainer}>
      <TouchableOpacity
        style={[styles.toggleButton, activeTab === 'explore' && styles.toggleButtonActive]}
        onPress={() => setActiveTab('explore')}
      >
        <Text style={[styles.toggleText, activeTab === 'explore' && styles.toggleTextActive]}>KEŞFET</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.toggleButton, activeTab === 'shop' && styles.toggleButtonActive]}
        onPress={() => setActiveTab('shop')}
      >
        <Text style={[styles.toggleText, activeTab === 'shop' && styles.toggleTextActive]}>MAĞAZA</Text>
      </TouchableOpacity>
    </View>
  );

  // ============================================================
  // 📌 EXPLORE POST CARD
  // ============================================================
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
      <View style={styles.postCard}>
        <View style={styles.postHeader}>
          <Image 
            source={{ uri: item.userAvatar || 'https://i.pravatar.cc/100' }} 
            style={styles.userAvatar} 
          />
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{item.userName || 'Kullanıcı'}</Text>
            <Text style={styles.postTime}>{item.time || 'Şimdi'}</Text>
          </View>
          <TouchableOpacity
            onPress={() => {
              setSelectedPost(item);
              setPostMenuVisible(true);
            }}
          >
            <Feather name="more-horizontal" size={18} color={COLORS.black} />
          </TouchableOpacity>
        </View>

        <Text style={styles.postContent}>{item.content || 'Paylaşım'}</Text>

        {item.image && (
          <Image 
            source={{ uri: item.image }} 
            style={styles.postImage} 
          />
        )}

        <View style={styles.postActions}>
          <TouchableOpacity style={styles.postAction} onPress={handleLike}>
            <Animated.View style={{ transform: [{ scale: likeAnim }] }}>
              <Ionicons name={isLiked ? 'heart' : 'heart-outline'} size={20} color={isLiked ? '#FF3B30' : COLORS.black} />
            </Animated.View>
            <Text style={[styles.actionText, isLiked && styles.actionTextActive]}>
              {formatNumber((item.likes || 0) + (isLiked ? 1 : 0))}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.postAction} onPress={() => handleComment(item)}>
            <Ionicons name="chatbubble-outline" size={20} color={COLORS.black} />
            <Text style={styles.actionText}>{formatNumber(item.comments || 0)}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.postAction} onPress={() => handleShare(item)}>
            <Ionicons name="paper-plane-outline" size={20} color={COLORS.black} />
          </TouchableOpacity>

          <TouchableOpacity style={[styles.postAction, styles.saveAction]} onPress={() => handleSavePost(item)}>
            <Ionicons name={isSaved ? 'bookmark' : 'bookmark-outline'} size={20} color={isSaved ? COLORS.cognac : COLORS.black} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // ============================================================
  // 📌 SHOP GRID
  // ============================================================
  const ShopGrid = () => {
    const filteredProducts = getFilteredAndSortedProducts();
    const hasNoResults = filteredProducts.length === 0;

    const ProductCard = ({ item }) => {
      const isFavorite = favorites.includes(item.id);
      return (
        <TouchableOpacity
          style={styles.shopProductCard}
          onPress={() =>
            navigation.navigate('ProductDetail', {
              product: item,
              headerShown: false,
            })
          }
        >
          <View style={styles.shopImageContainer}>
            <Image 
              source={{ uri: item.img_url || 'https://picsum.photos/400/500' }} 
              style={styles.shopProductImage} 
            />
            <TouchableOpacity 
              style={styles.shopFavoriteButton} 
              onPress={() => handleToggleFavorite(item)}
            >
              <Ionicons 
                name={isFavorite ? 'heart' : 'heart-outline'} 
                size={12} 
                color={isFavorite ? COLORS.black : COLORS.white} 
              />
            </TouchableOpacity>
          </View>
          <View style={styles.shopProductInfo}>
            <Text style={styles.shopBrandName}>{item.marka || 'Marka'}</Text>
            <Text style={styles.shopProductName} numberOfLines={2}>
              {item.ad || 'Ürün'}
            </Text>
            <Text style={styles.shopProductPrice}>₺{formatPrice(item.fiyat)}</Text>
          </View>
        </TouchableOpacity>
      );
    };

    return (
      <>
        {hasNoResults ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconContainer}>
              <Ionicons name="search-outline" size={40} color={COLORS.grayMedium} />
            </View>
            <Text style={styles.emptyTitle}>ÜRÜN BULUNAMADI</Text>
            {searchQuery && (
              <TouchableOpacity style={styles.clearButton} onPress={() => setSearchQuery('')}>
                <Text style={styles.clearButtonText}>ARAMAYI TEMİZLE</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <FlatList
            data={filteredProducts}
            renderItem={({ item }) => <ProductCard item={item} />}
            keyExtractor={(item) => item?.id?.toString()}
            numColumns={2}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.black} />}
            contentContainerStyle={styles.shopGrid}
            columnWrapperStyle={styles.columnWrapper}
          />
        )}
      </>
    );
  };

  // ============================================================
  // 📌 EXPLORE FEED
  // ============================================================
  const ExploreFeed = () => (
    <FlatList
      data={posts}
      renderItem={({ item }) => <ExplorePostCard item={item} />}
      keyExtractor={(item) => item.id?.toString()}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.black} />}
      ListHeaderComponent={
        <View style={styles.storiesSection}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {posts.slice(0, 8).map((item, i) => (
              <TouchableOpacity key={i} style={styles.storyCircle}>
                <View style={styles.storyRing}>
                  <Image 
                    source={{ uri: item.userAvatar || `https://i.pravatar.cc/100?img=${i + 1}` }} 
                    style={styles.storyImage} 
                  />
                </View>
                <Text style={styles.storyName}>{item.userName || `Kullanıcı`}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      }
      contentContainerStyle={styles.feedContent}
    />
  );

  // ============================================================
  // 📌 COMMENT MODAL
  // ============================================================
  const CommentModal = ({ visible, onClose, post }) => {
    const [commentText, setCommentText] = useState('');

    return (
      <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
        <View style={styles.modalOverlay}>
          <View style={styles.commentModalContent}>
            <View style={styles.commentModalHeader}>
              <Text style={styles.commentModalTitle}>YORUMLAR</Text>
              <TouchableOpacity onPress={onClose}>
                <Ionicons name="close" size={20} color={COLORS.black} />
              </TouchableOpacity>
            </View>
            <View style={styles.commentList}>
              <Text style={styles.emptyCommentsText}>Henüz yorum yok.</Text>
            </View>
            <View style={styles.commentInputContainer}>
              <TextInput
                style={styles.commentInput}
                placeholder="Yorumunu yaz..."
                placeholderTextColor={COLORS.grayMedium}
                value={commentText}
                onChangeText={setCommentText}
              />
              <TouchableOpacity style={styles.commentSendButton}>
                <Ionicons name="send" size={16} color={COLORS.black} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  // ============================================================
  // 📌 PREMIUM MENU MODAL
  // ============================================================
  const PremiumMenuModal = ({ visible, onClose, navigation }) => {
    const menuItems = [
      { icon: 'person-outline', label: 'Profilim', route: 'Profile' },
      { icon: 'heart-outline', label: 'Favorilerim', route: 'Favorites' },
      { icon: 'bookmark-outline', label: 'Kaydedilenler', route: 'Saved' },
      { icon: 'cart-outline', label: 'Sepetim', route: 'Cart' },
      { icon: 'time-outline', label: 'Siparişlerim', route: 'Orders' },
      { icon: 'settings-outline', label: 'Ayarlar', route: 'Settings' },
    ];

    return (
      <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
        <View style={styles.menuOverlay}>
          <TouchableOpacity style={styles.menuBackdrop} activeOpacity={1} onPress={onClose} />
          <View style={styles.menuContainer}>
            <View style={styles.menuHeader}>
              <View style={styles.menuUserInfo}>
                <Image 
                  source={{ uri: user?.photoURL || 'https://i.pravatar.cc/100' }} 
                  style={styles.menuAvatar} 
                />
                <View style={styles.menuUserText}>
                  <Text style={styles.menuUserName}>{user?.displayName || 'Moda Sever'}</Text>
                  <Text style={styles.menuUserEmail}>{user?.email || ''}</Text>
                </View>
              </View>
              <TouchableOpacity onPress={onClose} style={styles.menuCloseButton}>
                <Ionicons name="close" size={24} color={COLORS.black} />
              </TouchableOpacity>
            </View>
            <View style={styles.menuDivider} />
            <ScrollView showsVerticalScrollIndicator={false}>
              {menuItems.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.menuItem}
                  onPress={() => {
                    onClose();
                    if (item.route) navigation.navigate(item.route);
                  }}
                >
                  <View style={styles.menuItemIcon}>
                    <Ionicons name={item.icon} size={22} color={COLORS.black} />
                  </View>
                  <Text style={styles.menuItemLabel}>{item.label}</Text>
                  <Ionicons name="chevron-forward" size={16} color={COLORS.grayMedium} style={styles.menuItemArrow} />
                </TouchableOpacity>
              ))}
            </ScrollView>
            <View style={styles.menuFooter}>
              <TouchableOpacity 
                style={styles.menuLogout}
                onPress={async () => {
                  await auth.signOut();
                  onClose();
                }}
              >
                <Ionicons name="log-out-outline" size={20} color={COLORS.error} />
                <Text style={styles.menuLogoutText}>Çıkış Yap</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  // ============================================================
  // 📌 ACTION SHEET (DÜZELTİLDİ)
  // ============================================================
  const PremiumActionSheet = ({ visible, onClose, onSelect, post }) => {
    const actions = [
      { id: 'save', icon: 'bookmark-outline', label: 'Kaydet', color: COLORS.black },
      { divider: true },
      { id: 'not_interested', icon: 'eye-off-outline', label: 'İlgilenmiyorum', color: COLORS.grayMedium },
      { id: 'report', icon: 'flag-outline', label: 'Şikayet Et', color: COLORS.error },
    ];

    return (
      <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
        <TouchableOpacity 
          style={styles.actionOverlay} 
          activeOpacity={1} 
          onPress={onClose}
        >
          <View style={styles.actionContainer}>
            <View style={styles.actionHeader}>
              <View style={styles.actionHandle} />
              <Text style={styles.actionTitle}>BU GÖNDERİ İÇİN</Text>
            </View>
            {actions.map((action, index) =>
              action.divider ? (
                <View key={index} style={styles.actionDivider} />
              ) : (
                <TouchableOpacity
                  key={index}
                  style={styles.actionItem}
                  onPress={() => {
                    onSelect(action.id, post);
                    onClose();
                  }}
                >
                  <View style={[styles.actionItemIcon, { backgroundColor: action.color === COLORS.error ? 'rgba(255,59,48,0.1)' : 'transparent' }]}>
                    <Ionicons name={action.icon} size={22} color={action.color} />
                  </View>
                  <Text style={[styles.actionLabel, { color: action.color }]}>{action.label}</Text>
                  <Ionicons name="chevron-forward" size={16} color={COLORS.grayMedium} style={styles.actionArrow} />
                </TouchableOpacity>
              )
            )}
            <TouchableOpacity style={styles.actionCancel} onPress={onClose}>
              <Text style={styles.actionCancelText}>İPTAL</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    );
  };

  const handlePostMenuSelect = (action, post) => {
    switch (action) {
      case 'not_interested':
        Alert.alert('Gizlendi', 'Bu gönderi gizlendi');
        break;
      case 'report':
        Alert.alert('Şikayet Edildi', 'Şikayetiniz iletildi');
        break;
      case 'save':
        handleSavePost(post);
        break;
      default:
        break;
    }
  };

  // ============================================================
  // 📌 RENDER
  // ============================================================
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={TYPOGRAPHY.caption}>Yükleniyor...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />

      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.logoText}>MODAVERSE</Text>
        <View style={styles.headerIcons}>
          <TouchableOpacity style={styles.headerIcon} onPress={toggleSearch}>
            <Ionicons name="search-outline" size={20} color={COLORS.black} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.headerIcon} onPress={() => navigation.navigate('Favorites')}>
            <Ionicons name="heart-outline" size={20} color={COLORS.black} />
            {favoritesCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{favoritesCount}</Text>
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity style={styles.headerIcon} onPress={() => navigation.navigate('Cart')}>
            <Ionicons name="cart-outline" size={20} color={COLORS.black} />
            {cartCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{cartCount}</Text>
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity style={styles.headerIcon} onPress={() => setMenuVisible(true)}>
            <Ionicons name="menu-outline" size={20} color={COLORS.black} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Search Bar */}
      {showSearch && (
        <Animated.View
          style={[
            styles.searchContainer,
            {
              opacity: searchAnimation,
              maxHeight: searchAnimation.interpolate({ inputRange: [0, 1], outputRange: [0, 60] }),
            },
          ]}
        >
          <View style={styles.searchBar}>
            <Ionicons name="search" size={16} color={COLORS.grayMedium} />
            <TextInput
              style={styles.searchInput}
              placeholder="Tasarımcı, ürün ara..."
              placeholderTextColor={COLORS.grayMedium}
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoFocus={showSearch}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={14} color={COLORS.grayMedium} />
              </TouchableOpacity>
            )}
          </View>
        </Animated.View>
      )}

      <TabToggle />

      {activeTab === 'explore' ? <ExploreFeed /> : <ShopGrid />}

      {/* Modallar */}
      <PremiumMenuModal visible={menuVisible} onClose={() => setMenuVisible(false)} navigation={navigation} />

      <PremiumActionSheet
        visible={postMenuVisible}
        onClose={() => setPostMenuVisible(false)}
        onSelect={handlePostMenuSelect}
        post={selectedPost}
      />

      <CommentModal
        visible={commentModalVisible}
        onClose={() => {
          setCommentModalVisible(false);
          setSelectedPost(null);
        }}
        post={selectedPost}
      />
    </SafeAreaView>
  );
};

// ============================================================
// 📌 STYLES
// ============================================================
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white },

  // HEADER
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SIZES.lg,
    paddingTop: Platform.OS === 'ios' ? 12 : SIZES.md,
    paddingBottom: SIZES.xs,
  },
  logoText: { ...TYPOGRAPHY.caption, fontSize: 14, letterSpacing: 3 },
  headerIcons: { flexDirection: 'row', gap: SIZES.md },
  headerIcon: { position: 'relative', padding: 2 },
  badge: {
    position: 'absolute',
    top: -4,
    right: -6,
    backgroundColor: COLORS.black,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: { ...TYPOGRAPHY.caption, fontSize: 8, color: COLORS.white },

  // SEARCH
  searchContainer: { paddingHorizontal: SIZES.lg, overflow: 'hidden', marginBottom: SIZES.md },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 0.5,
    borderColor: COLORS.grayLight,
    paddingHorizontal: SIZES.md,
    paddingVertical: SIZES.sm,
  },
  searchInput: { flex: 1, marginLeft: SIZES.md, ...TYPOGRAPHY.body, color: COLORS.black },

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
  toggleText: { ...TYPOGRAPHY.caption, color: COLORS.grayMedium },
  toggleTextActive: { color: COLORS.black },

  // SHOP GRID
  shopGrid: { paddingHorizontal: SIZES.lg, paddingBottom: SIZES.xl },
  columnWrapper: { justifyContent: 'space-between', marginBottom: SIZES.md },
  shopProductCard: { flex: 1, maxWidth: '48%', borderWidth: 0.5, borderColor: COLORS.grayLight, padding: SIZES.sm },
  shopImageContainer: { position: 'relative', marginBottom: SIZES.md },
  shopProductImage: { width: '100%', height: 180, backgroundColor: COLORS.surface },
  shopFavoriteButton: { position: 'absolute', top: 4, right: 4, backgroundColor: COLORS.black, padding: 4 },
  shopProductInfo: { paddingHorizontal: 2 },
  shopBrandName: { ...TYPOGRAPHY.caption, fontSize: 8, marginBottom: 2 },
  shopProductName: { ...TYPOGRAPHY.bodySmall, fontWeight: '500', marginBottom: 4 },
  shopProductPrice: { ...TYPOGRAPHY.bodySmall, fontWeight: '500' },

  // EMPTY
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 100 },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderWidth: 0.5,
    borderColor: COLORS.grayLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SIZES.md,
  },
  emptyTitle: { ...TYPOGRAPHY.caption, marginTop: SIZES.sm, marginBottom: 4 },
  clearButton: { borderWidth: 0.5, borderColor: COLORS.grayLight, paddingHorizontal: SIZES.xl, paddingVertical: SIZES.sm },
  clearButtonText: { ...TYPOGRAPHY.caption, fontSize: 9, color: COLORS.black },

  // POST
  feedContent: { paddingBottom: SIZES.xl },
  postCard: { backgroundColor: COLORS.white, marginBottom: SIZES.lg, paddingHorizontal: SIZES.lg },
  postHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: SIZES.md },
  userAvatar: { width: 40, height: 40, borderRadius: 20, borderWidth: 0.5, borderColor: COLORS.grayLight, marginRight: SIZES.md, backgroundColor: COLORS.surface },
  userInfo: { flex: 1 },
  userName: { ...TYPOGRAPHY.body, fontWeight: '500' },
  postTime: { ...TYPOGRAPHY.caption, fontSize: 8, color: COLORS.grayMedium },
  postContent: { ...TYPOGRAPHY.bodySmall, lineHeight: 18, marginBottom: SIZES.md },
  postImage: { width: '100%', height: 200, backgroundColor: COLORS.surface, marginBottom: SIZES.md },

  postActions: { flexDirection: 'row', alignItems: 'center', paddingVertical: SIZES.md, borderTopWidth: 0.5, borderTopColor: COLORS.grayLight },
  postAction: { flexDirection: 'row', alignItems: 'center', marginRight: SIZES.md },
  actionText: { ...TYPOGRAPHY.caption, fontSize: 11, marginLeft: 4, color: COLORS.grayMedium, fontWeight: '500' },
  actionTextActive: { color: '#FF3B30' },
  saveAction: { marginLeft: 'auto' },

  // MENU
  menuOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  menuBackdrop: { flex: 1 },
  menuContainer: {
    backgroundColor: COLORS.white,
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
  menuAvatar: { width: 52, height: 52, borderRadius: 26, backgroundColor: '#F5F5F5' },
  menuUserText: { gap: 2 },
  menuUserName: { ...TYPOGRAPHY.body, fontSize: 16, fontWeight: '600', color: COLORS.black },
  menuUserEmail: { ...TYPOGRAPHY.caption, fontSize: 12, color: COLORS.grayMedium },
  menuCloseButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#F5F5F5', justifyContent: 'center', alignItems: 'center' },
  menuDivider: { height: 0.5, backgroundColor: '#F0F0F0', marginBottom: 8 },
  menuItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 0.5, borderBottomColor: '#F5F5F5' },
  menuItemIcon: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#F8F8F8', justifyContent: 'center', alignItems: 'center', marginRight: 14 },
  menuItemLabel: { ...TYPOGRAPHY.body, fontSize: 15, fontWeight: '500', color: COLORS.black, flex: 1 },
  menuItemArrow: { marginLeft: 'auto' },
  menuFooter: { marginTop: 12, paddingTop: 12, borderTopWidth: 0.5, borderTopColor: '#F0F0F0' },
  menuLogout: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14 },
  menuLogoutText: { ...TYPOGRAPHY.body, fontSize: 15, fontWeight: '500', color: COLORS.error },

  // ACTION SHEET
  actionOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  actionContainer: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingBottom: 20,
    paddingTop: 12,
  },
  actionHeader: { alignItems: 'center', paddingVertical: 8, marginBottom: 8 },
  actionHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: '#E0E0E0', marginBottom: 8 },
  actionTitle: { ...TYPOGRAPHY.caption, fontSize: 11, color: COLORS.grayMedium, letterSpacing: 1, fontWeight: '600' },
  actionItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 0.5, borderBottomColor: '#F5F5F5' },
  actionItemIcon: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center', marginRight: 14 },
  actionLabel: { ...TYPOGRAPHY.body, fontSize: 15, fontWeight: '500', flex: 1 },
  actionArrow: { marginLeft: 'auto' },
  actionDivider: { height: 0.5, backgroundColor: '#F0F0F0', marginVertical: 4 },
  actionCancel: { marginTop: 8, paddingVertical: 16, alignItems: 'center', borderWidth: 0.5, borderColor: '#E0E0E0', borderRadius: 12 },
  actionCancelText: { ...TYPOGRAPHY.body, fontSize: 14, fontWeight: '600', color: COLORS.black },

  // STORIES
  storiesSection: { paddingHorizontal: SIZES.lg, marginBottom: SIZES.lg },
  storyCircle: { alignItems: 'center', marginRight: SIZES.md },
  storyRing: { padding: 2, borderWidth: 1, borderColor: COLORS.black, borderRadius: 30, marginBottom: SIZES.xs },
  storyImage: { width: 56, height: 56, borderRadius: 28, backgroundColor: COLORS.surface },
  storyName: { ...TYPOGRAPHY.caption, fontSize: 8, color: COLORS.grayMedium },

  // COMMENT
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  commentModalContent: { backgroundColor: COLORS.white, width: width, maxHeight: '80%', padding: SIZES.lg },
  commentModalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SIZES.md, paddingBottom: SIZES.md, borderBottomWidth: 0.5, borderBottomColor: COLORS.grayLight },
  commentModalTitle: { ...TYPOGRAPHY.caption },
  commentList: { maxHeight: 400 },
  emptyCommentsText: { ...TYPOGRAPHY.bodySmall, textAlign: 'center', padding: SIZES.xl },
  commentInputContainer: { flexDirection: 'row', alignItems: 'center', marginTop: SIZES.md, paddingTop: SIZES.md, borderTopWidth: 0.5, borderTopColor: COLORS.grayLight, gap: SIZES.md },
  commentInput: { flex: 1, ...TYPOGRAPHY.body, borderWidth: 0.5, borderColor: COLORS.grayLight, paddingHorizontal: SIZES.md, paddingVertical: SIZES.sm },
  commentSendButton: { padding: SIZES.xs },
});

export default VitrinimScreen;