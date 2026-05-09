import React, { useState, memo, useCallback, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Image,
  TouchableWithoutFeedback,
  Animated,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

// 🎨 Renk paleti (App.js ile uyumlu - cognac düzeltildi)
const COLORS = {
  white: '#FFFFFF',
  ivory: '#F9F6F2',
  cloud: '#F0F0F0',
  ash: '#888888',
  charcoal: '#222222',
  noir: '#000000',
  cognac: '#8C7853',  // ✅ DÜZELTİLDİ
  accent: '#8C7853',
  success: '#4CAF50',
  warning: '#FF9800',
  error: '#F44336',
  like: '#FF6B6B',
  gold: '#C4A747',
};

// ✅ FavoritesContext import (try-catch ile güvenli)
let useFavorites;
try {
  useFavorites = require('../context/FavoritesContext').useFavorites;
} catch (error) {
  console.warn('FavoritesContext bulunamadı, mock kullanılacak');
  useFavorites = () => ({
    isFavorite: () => false,
    toggleFavorite: () => {}
  });
}

const FeedItem = memo(({ item }) => {
  const navigation = useNavigation();
  const doubleTapRef = useRef(null);
  const heartScaleAnim = useRef(new Animated.Value(0)).current;

  // HATA KONTROLÜ
  if (!item || typeof item !== 'object') {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={32} color={COLORS.error} />
        <Text style={styles.errorText}>Gönderi yüklenirken hata oluştu</Text>
      </View>
    );
  }

  // STATE'LER
  const [isLiked, setIsLiked] = useState(item.isLiked || false);
  const [likeCount, setLikeCount] = useState(item.likeCount || item.likes || 0);
  const [showDoubleTapHeart, setShowDoubleTapHeart] = useState(false);
  const { isFavorite, toggleFavorite } = useFavorites();

  // FALLBACK VERİLER
  const user = item.user || { 
    name: item.username || 'Kullanıcı', 
    avatar: item.userAvatar || 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150'
  };
  
  const imageUrl = item.imageUrl || item.image || 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=400';
  const description = item.description || 'Açıklama bulunamadı';
  const timestamp = item.timestamp || item.time || 'Şimdi';
  const commentCount = item.commentCount || item.comments?.length || 0;

  // Çift tıklama animasyonu
  const animateDoubleTap = useCallback(() => {
    setShowDoubleTapHeart(true);
    heartScaleAnim.setValue(0);
    
    Animated.sequence([
      Animated.spring(heartScaleAnim, {
        toValue: 1,
        friction: 3,
        useNativeDriver: true,
      }),
      Animated.delay(500),
      Animated.timing(heartScaleAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => setShowDoubleTapHeart(false));
  }, [heartScaleAnim]);

  // HANDLER'LAR
  const handleLike = useCallback(() => {
    setIsLiked(prev => !prev);
    setLikeCount(prev => isLiked ? prev - 1 : prev + 1);
  }, [isLiked]);

  const handleDoubleTapLike = useCallback(() => {
    if (!isLiked) {
      setIsLiked(true);
      setLikeCount(prev => prev + 1);
      animateDoubleTap();
    }
  }, [isLiked, animateDoubleTap]);

  const handleFavorite = useCallback(() => {
    toggleFavorite(item);
    Alert.alert(
      isFavorite(item.id) ? '⛔️ Favorilerden Çıkarıldı' : '💎 Favorilere Eklendi',
      isFavorite(item.id) 
        ? `${user.name} gönderisi favorilerden çıkarıldı.`
        : `${user.name} gönderisi favorilere eklendi.`
    );
  }, [item, user.name, isFavorite, toggleFavorite]);

  const handleComment = useCallback(() => {
    navigation.navigate('Comments', { postId: item.id, post: item });
  }, [navigation, item]);

  const handleShare = useCallback(() => {
    Alert.alert(
      '📤 Paylaş',
      'Bu gönderiyi paylaşmak istediğinize emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        { text: 'Paylaş', onPress: () => console.log('Paylaşıldı:', item.id) }
      ]
    );
  }, [item.id]);

  const handleMoreOptions = useCallback(() => {
    Alert.alert(
      '⚙️ Seçenekler',
      'Bu gönderi için ne yapmak istersiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        { text: 'Şikayet Et', onPress: () => console.log('Şikayet edildi') },
        { text: 'Gizle', onPress: () => console.log('Gizlendi') },
      ]
    );
  }, []);

  const handleProfilePress = useCallback(() => {
    navigation.navigate('Profile', { userId: user.id });
  }, [navigation, user.id]);

  const handleImagePress = useCallback(() => {
    navigation.navigate('ProductDetail', { product: item.product || item });
  }, [navigation, item]);

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleProfilePress}>
          <Image 
            source={{ uri: user.avatar }} 
            style={styles.avatar}
          />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.userInfo} onPress={handleProfilePress}>
          <Text style={styles.username}>{user.name}</Text>
          <Text style={styles.timestamp}>{timestamp}</Text>
        </TouchableOpacity>
        
        <TouchableOpacity onPress={handleFavorite} style={styles.favoriteButton} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Ionicons 
            name={isFavorite(item.id) ? "bookmark" : "bookmark-outline"} 
            size={24} 
            color={isFavorite(item.id) ? COLORS.gold : COLORS.ash} 
          />
        </TouchableOpacity>
      </View>

      {/* STIL TIPI BADGE */}
      {item.styleType && (
        <View style={styles.styleTypeBadge}>
          <Ionicons name="sparkles" size={12} color={COLORS.white} />
          <Text style={styles.styleTypeText}>{item.styleType}</Text>
        </View>
      )}

      {/* GÖRSEL - Çift tıklama ile beğenme */}
      <TouchableWithoutFeedback 
        onPress={handleDoubleTapLike}
        delayDoublePress={300}
      >
        <View style={styles.imageContainer}>
          <TouchableOpacity activeOpacity={1} onPress={handleImagePress}>
            <Image 
              source={{ uri: imageUrl }} 
              style={styles.image}
              resizeMode="cover"
            />
          </TouchableOpacity>
          
          {/* Çift tıklama animasyonu */}
          {showDoubleTapHeart && (
            <Animated.View style={[
              styles.doubleTapHeart,
              {
                transform: [
                  { scale: heartScaleAnim.interpolate({
                    inputRange: [0, 0.5, 1],
                    outputRange: [0, 1.2, 1]
                  })}
                ]
              }
            ]}>
              <Ionicons name="heart" size={80} color={COLORS.white} />
            </Animated.View>
          )}
        </View>
      </TouchableWithoutFeedback>

      {/* ACTION BUTTONLARI */}
      <View style={styles.actions}>
        <View style={styles.leftActions}>
          <TouchableOpacity onPress={handleLike} style={styles.actionButton} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Ionicons 
              name={isLiked ? "heart" : "heart-outline"} 
              size={28} 
              color={isLiked ? COLORS.like : COLORS.charcoal} 
            />
          </TouchableOpacity>
          
          <TouchableOpacity onPress={handleComment} style={styles.actionButton} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Ionicons name="chatbubble-outline" size={24} color={COLORS.charcoal} />
          </TouchableOpacity>
          
          <TouchableOpacity onPress={handleShare} style={styles.actionButton} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Ionicons name="paper-plane-outline" size={24} color={COLORS.charcoal} />
          </TouchableOpacity>
        </View>
        
        <TouchableOpacity style={styles.moreButton} onPress={handleMoreOptions} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Ionicons name="ellipsis-horizontal" size={20} color={COLORS.charcoal} />
        </TouchableOpacity>
      </View>

      {/* BEĞENME SAYISI */}
      {likeCount > 0 && (
        <Text style={styles.likes}>
          {likeCount.toLocaleString('tr-TR')} beğenme
        </Text>
      )}

      {/* AÇIKLAMA */}
      <Text style={styles.description} numberOfLines={3}>
        <Text style={styles.usernameInline} onPress={handleProfilePress}>{user.name} </Text>
        {description}
      </Text>

      {/* YORUM SAYISI */}
      {commentCount > 0 && (
        <TouchableOpacity onPress={handleComment}>
          <Text style={styles.comments}>
            {commentCount} yorumun tümünü gör
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.cloud,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    paddingBottom: 8,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
    borderWidth: 1,
    borderColor: COLORS.cloud,
  },
  userInfo: {
    flex: 1,
  },
  username: {
    fontWeight: '600',
    fontSize: 14,
    color: COLORS.charcoal,
    marginBottom: 2,
  },
  usernameInline: {
    fontWeight: '600',
    fontSize: 14,
    color: COLORS.charcoal,
  },
  timestamp: {
    fontSize: 12,
    color: COLORS.ash,
  },
  favoriteButton: {
    padding: 6,
  },
  styleTypeBadge: {
    position: 'absolute',
    top: 50,
    left: 12,
    backgroundColor: 'rgba(0,0,0,0.7)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    zIndex: 1,
  },
  styleTypeText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },
  imageContainer: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: 400,
    backgroundColor: COLORS.ivory,
  },
  doubleTapHeart: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  leftActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    marginRight: 20,
    padding: 4,
  },
  moreButton: {
    padding: 4,
  },
  likes: {
    fontWeight: '600',
    paddingHorizontal: 12,
    paddingVertical: 4,
    fontSize: 14,
    color: COLORS.charcoal,
  },
  description: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    fontSize: 14,
    lineHeight: 20,
    color: COLORS.charcoal,
  },
  comments: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    fontSize: 14,
    color: COLORS.ash,
    marginBottom: 8,
  },
  errorContainer: {
    backgroundColor: COLORS.white,
    padding: 30,
    marginBottom: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.cloud,
    borderRadius: 8,
  },
  errorText: {
    color: COLORS.ash,
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
});

export default FeedItem;