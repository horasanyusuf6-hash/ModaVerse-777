// 📁 src/components/ExploreFeed.js - SADECE REVİZE
import React, { useState, useContext, useCallback } from 'react';
import { 
  View, 
  FlatList, 
  Image, 
  Text, 
  TouchableOpacity, 
  StyleSheet,
  Alert,
  RefreshControl
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

// 🎨 Renk paleti (Theme.js yoksa çalışır)
const COLORS = {
  white: '#FFFFFF',
  porcelain: '#F9F6F2',
  cloud: '#F0F0F0',
  ash: '#888888',
  charcoal: '#222222',
  slate: '#666666',
  gold: '#C4A747',
  cognac: '#8C7853',  // ✅ DÜZELTİLDİ
  silver: '#E8E8E8',
};

// 📝 Font stilleri
const FONTS = {
  body1: { fontSize: 16, lineHeight: 24 },
  body2: { fontSize: 14, lineHeight: 20 },
  body3: { fontSize: 13, lineHeight: 18 },
  body4: { fontSize: 12, lineHeight: 16 },
  subtitle: { fontSize: 11, letterSpacing: 1 },
  productCode: { fontSize: 10, letterSpacing: 2 },
  price: { fontSize: 16, fontWeight: '500' },
};

// ✅ FavoritesContext import (try-catch ile güvenli)
let FavoritesContext;
try {
  FavoritesContext = require('../context/FavoritesContext').FavoritesContext;
} catch (error) {
  console.warn('FavoritesContext bulunamadı, mock context kullanılacak');
  FavoritesContext = React.createContext({
    favorites: [],
    addToFavorites: () => {},
    removeFromFavorites: () => {},
  });
}

// Mock feed data
const mockFeedData = [
  {
    id: 1,
    user: {
      id: 101,
      name: 'MODA ATELIER',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100',
      isVerified: true
    },
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400',
    description: 'Oversize silhouette in pure cotton. SS24 collection.',
    likes: 2450,
    isLiked: false,
    comments: [
      { id: 1, user: { name: 'COLLECTOR' }, text: 'Essential piece.' },
      { id: 2, user: { name: 'EDITOR' }, text: 'Perfect drape.' }
    ],
    time: '2h ago',
    product: {
      id: 1,
      name: 'Oversize Cotton Shirt',
      brand: 'ZARA',
      price: 149.99,
      fabric: '100% Cotton',
      color: 'White'
    }
  },
  {
    id: 2,
    user: {
      id: 102,
      name: 'LEATHER HOUSE',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100',
      isVerified: true
    },
    image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400',
    description: 'Reclaimed leather jacket. Timeless silhouette.',
    likes: 3120,
    isLiked: true,
    comments: [
      { id: 3, user: { name: 'STYLIST' }, text: 'Perfect fit.' }
    ],
    time: '5h ago',
    product: {
      id: 2,
      name: 'Leather Biker Jacket',
      brand: 'MANGO',
      price: 799.99,
      fabric: 'Reclaimed Leather',
      color: 'Black'
    }
  },
  {
    id: 3,
    user: {
      id: 103,
      name: 'DENIM LAB',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
      isVerified: false
    },
    image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=400',
    description: 'Slim fit denim. Raw selvedge. Made in Japan.',
    likes: 1890,
    isLiked: false,
    comments: [],
    time: '1d ago',
    product: {
      id: 3,
      name: 'Selvedge Denim Jeans',
      brand: 'LEVIS',
      price: 599.99,
      fabric: 'Japanese Denim',
      color: 'Indigo'
    }
  },
  {
    id: 4,
    user: {
      id: 104,
      name: 'COAT MAISON',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100',
      isVerified: true
    },
    image: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=400',
    description: 'Double-breasted trench. British wool.',
    likes: 4280,
    isLiked: true,
    comments: [
      { id: 4, user: { name: 'EDITOR' }, text: 'Classic.' },
      { id: 5, user: { name: 'BUYER' }, text: 'Perfect tailoring.' }
    ],
    time: '2d ago',
    product: {
      id: 4,
      name: 'Wool Trench Coat',
      brand: 'MASSIMO DUTTI',
      price: 899.99,
      fabric: 'British Wool',
      color: 'Camel'
    }
  }
];

const ExploreFeed = () => {
  const navigation = useNavigation();
  const [feedData, setFeedData] = useState(mockFeedData);
  const context = useContext(FavoritesContext);
  
  const favorites = context?.favorites || [];
  const addToFavorites = context?.addToFavorites || (() => {});
  const removeFromFavorites = context?.removeFromFavorites || (() => {});
  
  const [refreshing, setRefreshing] = useState(false);

  const toggleLike = useCallback((postId) => {
    setFeedData(prev => prev.map(item => 
      item.id === postId ? { 
        ...item, 
        isLiked: !item.isLiked, 
        likes: item.isLiked ? item.likes - 1 : item.likes + 1 
      } : item
    ));
  }, []);

  const toggleFavorite = useCallback((product) => {
    const isFavorite = favorites.some(fav => fav?.id === product?.id);
    if (isFavorite) {
      removeFromFavorites(product.id);
      Alert.alert('⛔️ Kaldırıldı', `${product.name} favorilerden çıkarıldı.`);
    } else {
      addToFavorites(product);
      Alert.alert('💎 Eklendi', `${product.name} favorilere eklendi.`);
    }
  }, [favorites, addToFavorites, removeFromFavorites]);

  const goToProductDetail = useCallback((product) => {
    navigation.navigate('ProductDetail', { product });
  }, [navigation]);

  const goToHashtag = useCallback((hashtag) => {
    navigation.navigate('HashtagFeed', { hashtag });
  }, [navigation]);

  const viewComments = useCallback((post) => {
    if (post.comments.length === 0) {
      Alert.alert('💬 Yorumlar', 'Bu gönderi için henüz yorum yapılmamış.');
    } else {
      Alert.alert(
        '💬 Yorumlar',
        post.comments.map(c => `• ${c.user.name}: ${c.text}`).join('\n')
      );
    }
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
      Alert.alert('🔄', 'Feed yenilendi');
    }, 1500);
  }, []);

  const renderFeedItem = useCallback(({ item }) => {
    const isProductFavorite = favorites.some(fav => fav?.id === item.product?.id);

    return (
      <View style={styles.luxuryCard}>
        <View style={styles.postHeader}>
          <View style={styles.userInfo}>
            <Image source={{ uri: item.user.avatar }} style={styles.avatar} />
            <View style={styles.userDetails}>
              <View style={styles.nameContainer}>
                <Text style={styles.designerName}>{item.user.name}</Text>
                {item.user.isVerified && (
                  <Ionicons name="checkmark-circle" size={16} color={COLORS.gold} style={styles.verifiedIcon} />
                )}
              </View>
              <Text style={styles.collectionName}>SS24 COLLECTION</Text>
            </View>
          </View>
          <TouchableOpacity
            onPress={() => Alert.alert('Seçenekler', 'Gönderi seçenekleri')}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="ellipsis-horizontal" size={20} color={COLORS.charcoal} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={() => goToProductDetail(item.product)} activeOpacity={0.9}>
          <Image source={{ uri: item.image }} style={styles.luxuryImage} />
        </TouchableOpacity>

        <View style={styles.luxuryInteractions}>
          <View style={styles.interactionLeft}>
            <TouchableOpacity 
              style={styles.luxuryIconButton}
              onPress={() => toggleLike(item.id)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons 
                name={item.isLiked ? "diamond" : "diamond-outline"} 
                size={24} 
                color={item.isLiked ? COLORS.gold : COLORS.charcoal} 
              />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.luxuryIconButton}
              onPress={() => viewComments(item)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="chatbubble-outline" size={24} color={COLORS.charcoal} />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.luxuryIconButton}
              onPress={() => Alert.alert('📌 Sabitle', 'Gönderi sabitlendi')}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="pin-outline" size={24} color={COLORS.charcoal} />
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity 
            style={styles.luxuryIconButton}
            onPress={() => toggleFavorite(item.product)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons 
              name={isProductFavorite ? "briefcase" : "briefcase-outline"} 
              size={24} 
              color={isProductFavorite ? COLORS.cognac : COLORS.charcoal} 
            />
          </TouchableOpacity>
        </View>

        <Text style={styles.likes}>{item.likes.toLocaleString()} curated</Text>
        <Text style={styles.description}>
          <Text style={styles.designerName}>{item.user.name} </Text>
          {item.description}
        </Text>

        <TouchableOpacity 
          style={styles.productCardLuxury}
          onPress={() => goToProductDetail(item.product)}
          activeOpacity={0.7}
        >
          <Image source={{ uri: item.image }} style={styles.productImageLuxury} />
          <View style={styles.productInfoLuxury}>
            <Text style={styles.productCode}>PV24-{item.id.toString().padStart(3, '0')}</Text>
            <Text style={styles.productNameLuxury}>{item.product.name}</Text>
            <View style={styles.productMeta}>
              <Text style={styles.productFabric}>{item.product.fabric}</Text>
              <Text style={styles.productColor}>• {item.product.color}</Text>
            </View>
            <View style={styles.productFooter}>
              <Text style={styles.productPriceLuxury}>€{item.product.price}</Text>
              <TouchableOpacity 
                style={styles.shopButtonLuxury}
                onPress={() => toggleFavorite(item.product)}
                hitSlop={{ top: 5, bottom: 5, left: 5, right: 5 }}
              >
                <Ionicons 
                  name={isProductFavorite ? "diamond" : "diamond-outline"} 
                  size={18} 
                  color={isProductFavorite ? COLORS.gold : COLORS.charcoal} 
                />
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>

        {item.comments.length > 0 && (
          <TouchableOpacity onPress={() => viewComments(item)}>
            <Text style={styles.viewComments}>
              {item.comments.length === 1 
                ? `"${item.comments[0].text}"`
                : `${item.comments.length} notes`
              }
            </Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity 
          style={styles.addComment}
          onPress={() => Alert.alert('📝 Yorum', 'Yorum ekleme sayfası açılıyor...')}
        >
          <Text style={styles.commentPlaceholder}>Add a note...</Text>
          <View style={styles.commentActions}>
            <Ionicons name="create-outline" size={18} color={COLORS.ash} />
          </View>
        </TouchableOpacity>
      </View>
    );
  }, [favorites, toggleLike, toggleFavorite, viewComments, goToProductDetail]);

  return (
    <FlatList
      data={feedData}
      renderItem={renderFeedItem}
      keyExtractor={item => item.id.toString()}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={COLORS.gold}
          colors={[COLORS.gold]}
        />
      }
      contentContainerStyle={styles.feedContainer}
    />
  );
};

const styles = StyleSheet.create({
  feedContainer: {
    paddingTop: 8,
    paddingBottom: 100,
    backgroundColor: COLORS.porcelain,
  },
  luxuryCard: {
    backgroundColor: COLORS.white,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: COLORS.cloud,
    marginHorizontal: 16,
    borderRadius: 8,
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.cloud,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.porcelain,
    borderWidth: 1,
    borderColor: COLORS.cloud,
  },
  userDetails: {
    marginLeft: 12,
    flex: 1,
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  designerName: {
    ...FONTS.body2,
    fontWeight: '500',
    color: COLORS.charcoal,
  },
  verifiedIcon: {
    marginLeft: 6,
  },
  collectionName: {
    ...FONTS.subtitle,
    color: COLORS.ash,
    letterSpacing: 0.5,
  },
  luxuryImage: {
    width: '100%',
    height: 400,
    backgroundColor: COLORS.porcelain,
  },
  luxuryInteractions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.cloud,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.cloud,
  },
  interactionLeft: {
    flexDirection: 'row',
    gap: 20,
  },
  luxuryIconButton: {
    padding: 4,
  },
  likes: {
    ...FONTS.body2,
    fontWeight: '500',
    color: COLORS.charcoal,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  description: {
    ...FONTS.body2,
    color: COLORS.slate,
    lineHeight: 20,
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  productCardLuxury: {
    flexDirection: 'row',
    backgroundColor: COLORS.porcelain,
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.cloud,
    borderRadius: 6,
  },
  productImageLuxury: {
    width: 70,
    height: 70,
    backgroundColor: COLORS.cloud,
    borderWidth: 1,
    borderColor: COLORS.silver,
  },
  productInfoLuxury: {
    flex: 1,
    marginLeft: 12,
  },
  productCode: {
    ...FONTS.productCode,
    color: COLORS.ash,
    marginBottom: 4,
  },
  productNameLuxury: {
    ...FONTS.body1,
    fontWeight: '400',
    color: COLORS.charcoal,
    marginBottom: 6,
  },
  productMeta: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
  },
  productFabric: {
    ...FONTS.body4,
    color: COLORS.ash,
    fontStyle: 'italic',
  },
  productColor: {
    ...FONTS.body4,
    color: COLORS.ash,
  },
  productFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  productPriceLuxury: {
    ...FONTS.price,
    color: COLORS.charcoal,
  },
  shopButtonLuxury: {
    padding: 8,
    backgroundColor: COLORS.white,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.cloud,
  },
  viewComments: {
    ...FONTS.body3,
    color: COLORS.ash,
    paddingHorizontal: 16,
    paddingBottom: 8,
    fontStyle: 'italic',
  },
  addComment: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.cloud,
  },
  commentPlaceholder: {
    ...FONTS.body3,
    color: COLORS.ash,
    flex: 1,
  },
  commentActions: {
    flexDirection: 'row',
  },
});

export default ExploreFeed;