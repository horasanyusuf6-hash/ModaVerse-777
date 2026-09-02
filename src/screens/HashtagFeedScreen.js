// 📁 src/screens/HashtagFeedScreen.js - LÜKS MİNİMALİST VERSİYON
import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Dimensions,
  Alert,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRoute, useNavigation } from '@react-navigation/native';
import { COLORS, TYPOGRAPHY, SIZES } from '../constants/Theme';

const { width: screenWidth } = Dimensions.get('window');

const HashtagFeedScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { hashtag } = route.params || { hashtag: 'StreetStyle' };
  
  const [posts, setPosts] = useState([
    {
      id: '1',
      user: {
        name: 'Moda İkonu',
        avatar: 'https://i.pravatar.cc/100?img=1',
      },
      content: 'Bugün #StreetStyle ruhunu yakaladım! 🏙️',
      image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=400',
      likes: 245,
      comments: 18,
      time: '2 saat önce',
      tags: ['#StreetStyle', '#UrbanFashion'],
      isLiked: false,
      isSaved: false,
    },
    {
      id: '2',
      user: {
        name: 'Sokak Stili',
        avatar: 'https://i.pravatar.cc/100?img=2',
      },
      content: 'Minimalist sokak tarzı her zaman kazanır. 👟',
      image: 'https://images.unsplash.com/photo-1534452203293-494d7ddbf7e0?w=400',
      likes: 189,
      comments: 24,
      time: '5 saat önce',
      tags: ['#MinimalStyle', '#StreetWear'],
      isLiked: false,
      isSaved: false,
    },
    {
      id: '3',
      user: {
        name: 'Şehir Kaşifi',
        avatar: 'https://i.pravatar.cc/100?img=3',
      },
      content: 'Vintage parçalar sokak stiline karakter katar! ✨',
      image: 'https://images.unsplash.com/photo-1523380744952-b7e00e6e2ffa?w=400',
      likes: 312,
      comments: 42,
      time: '1 gün önce',
      tags: ['#VintageStyle', '#StreetFashion'],
      isLiked: false,
      isSaved: false,
    },
    {
      id: '4',
      user: {
        name: 'Trend Avcısı',
        avatar: 'https://i.pravatar.cc/100?img=4',
      },
      content: 'Bu sezonun favori parçası oversize ceketler! 🧥',
      image: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=400',
      likes: 567,
      comments: 78,
      time: '2 gün önce',
      tags: ['#Oversize', '#Trend'],
      isLiked: false,
      isSaved: false,
    },
  ]);

  const totalPosts = useMemo(() => posts.length, [posts]);

  const toggleLike = useCallback((postId) => {
    setPosts(prevPosts =>
      prevPosts.map(post =>
        post.id === postId
          ? { 
              ...post, 
              isLiked: !post.isLiked,
              likes: post.isLiked ? post.likes - 1 : post.likes + 1
            }
          : post
      )
    );
  }, []);

  const toggleSave = useCallback((postId) => {
    setPosts(prevPosts =>
      prevPosts.map(post =>
        post.id === postId
          ? { ...post, isSaved: !post.isSaved }
          : post
      )
    );
  }, []);

  const formatNumber = (num) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const renderPost = useCallback(({ item }) => (
    <View style={styles.postCard}>
      <View style={styles.postHeader}>
        <Image 
          source={{ uri: item.user?.avatar }} 
          style={styles.userAvatar}
        />
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{item.user?.name}</Text>
          <Text style={styles.postTime}>{item.time}</Text>
        </View>
        <TouchableOpacity 
          style={styles.moreButton}
          onPress={() => Alert.alert('Seçenekler', 'Bu gönderi için işlemler')}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="ellipsis-horizontal" size={18} color={COLORS.grayMedium} />
        </TouchableOpacity>
      </View>
      
      <TouchableOpacity 
        onPress={() => Alert.alert('Gönderi', 'Gönderi detayı açılıyor...')}
        activeOpacity={0.9}
      >
        <Image 
          source={{ uri: item.image }} 
          style={styles.postImage}
        />
      </TouchableOpacity>
      
      <View style={styles.postActions}>
        <TouchableOpacity 
          style={styles.postAction}
          onPress={() => toggleLike(item.id)}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons 
            name={item.isLiked ? "heart" : "heart-outline"} 
            size={20} 
            color={item.isLiked ? COLORS.black : COLORS.grayDark} 
          />
          <Text style={styles.actionText}>{formatNumber(item.likes)}</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.postAction}
          onPress={() => Alert.alert('Yorumlar', 'Yorumlar sayfası açılıyor...')}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="chatbubble-outline" size={20} color={COLORS.grayDark} />
          <Text style={styles.actionText}>{formatNumber(item.comments)}</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.postAction}
          onPress={() => Alert.alert('Paylaş', 'Gönderi paylaşılıyor...')}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="paper-plane-outline" size={20} color={COLORS.grayDark} />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.saveButton}
          onPress={() => toggleSave(item.id)}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons 
            name={item.isSaved ? "bookmark" : "bookmark-outline"} 
            size={20} 
            color={item.isSaved ? COLORS.black : COLORS.grayDark} 
          />
        </TouchableOpacity>
      </View>
      
      <View style={styles.postContent}>
        <Text style={styles.contentText}>
          <Text style={styles.userNameText}>{item.user?.name} </Text>
          {item.content}
        </Text>
        
        <View style={styles.tagsContainer}>
          {item.tags?.map((tag, index) => (
            <TouchableOpacity 
              key={index} 
              onPress={() => navigation.push('HashtagFeed', { hashtag: tag.replace('#', '') })}
            >
              <Text style={styles.tagText}>{tag}</Text>
            </TouchableOpacity>
          ))}
        </View>
        
        <TouchableOpacity onPress={() => Alert.alert('Yorumlar', 'Tüm yorumlar gösteriliyor...')}>
          <Text style={styles.commentsText}>
            {item.comments} yorumun tümünü gör
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  ), [toggleLike, toggleSave, navigation]);

  const renderEmptyList = useCallback(() => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconContainer}>
        <Ionicons name="hash-outline" size={40} color={COLORS.grayMedium} />
      </View>
      <Text style={styles.emptyTitle}>GÖNDERİ BULUNAMADI</Text>
      <Text style={styles.emptyText}>
        #{hashtag} etiketiyle henüz gönderi paylaşılmamış.
      </Text>
      <TouchableOpacity 
        style={styles.emptyButton}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.emptyButtonText}>GERİ DÖN</Text>
      </TouchableOpacity>
    </View>
  ), [hashtag, navigation]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          style={styles.backButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.black} />
        </TouchableOpacity>
        
        <View style={styles.headerCenter}>
          <Text style={styles.hashtagText}>#{hashtag}</Text>
          <Text style={styles.postCount}>
            {totalPosts.toLocaleString()} GÖNDERİ
          </Text>
        </View>
        
        <TouchableOpacity 
          onPress={() => Alert.alert('Bilgi', `#${hashtag} etiketi hakkında bilgi`)}
          style={styles.infoButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="information-circle-outline" size={22} color={COLORS.black} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={posts}
        renderItem={renderPost}
        keyExtractor={item => item.id}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={renderEmptyList}
        contentContainerStyle={styles.feedContent}
      />
    </SafeAreaView>
  );
};

// ============ STILLER ============
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SIZES.lg,
    paddingVertical: SIZES.md,
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.grayLight,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  infoButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  headerCenter: {
    alignItems: 'center',
  },
  hashtagText: {
    ...TYPOGRAPHY.body,
    fontWeight: '500',
    letterSpacing: 0.5,
  },
  postCount: {
    ...TYPOGRAPHY.caption,
    color: COLORS.grayMedium,
    marginTop: 2,
  },
  
  feedContent: {
    paddingBottom: SIZES.xl,
  },
  
  // Post Card
  postCard: {
    marginBottom: SIZES.lg,
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.grayLight,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SIZES.lg,
    paddingVertical: SIZES.md,
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderWidth: 0.5,
    borderColor: COLORS.grayLight,
    backgroundColor: COLORS.surface,
    marginRight: SIZES.md,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    ...TYPOGRAPHY.body,
    fontWeight: '500',
    marginBottom: 2,
  },
  postTime: {
    ...TYPOGRAPHY.caption,
    color: COLORS.grayMedium,
  },
  moreButton: {
    padding: 4,
  },
  postImage: {
    width: screenWidth,
    height: screenWidth,
    backgroundColor: COLORS.surface,
  },
  
  // Post Actions
  postActions: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SIZES.lg,
    paddingVertical: SIZES.md,
  },
  postAction: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: SIZES.lg,
    gap: 4,
  },
  actionText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.grayMedium,
  },
  saveButton: {
    marginLeft: 'auto',
  },
  
  // Post Content
  postContent: {
    paddingHorizontal: SIZES.lg,
    paddingBottom: SIZES.md,
  },
  contentText: {
    ...TYPOGRAPHY.body,
    lineHeight: 20,
    marginBottom: SIZES.sm,
  },
  userNameText: {
    ...TYPOGRAPHY.body,
    fontWeight: '500',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: SIZES.xs,
    gap: SIZES.sm,
  },
  tagText: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.grayMedium,
  },
  commentsText: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.grayMedium,
    marginTop: 2,
  },
  
  // Empty State
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: SIZES.xl,
    minHeight: 400,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderWidth: 0.5,
    borderColor: COLORS.grayLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SIZES.lg,
  },
  emptyTitle: {
    ...TYPOGRAPHY.caption,
    marginBottom: SIZES.sm,
  },
  emptyText: {
    ...TYPOGRAPHY.bodySmall,
    textAlign: 'center',
    lineHeight: 18,
  },
  emptyButton: {
    marginTop: SIZES.lg,
    borderWidth: 0.5,
    borderColor: COLORS.grayLight,
    paddingHorizontal: SIZES.xl,
    paddingVertical: SIZES.md,
  },
  emptyButtonText: {
    ...TYPOGRAPHY.button,
    color: COLORS.black,
  },
});

export default HashtagFeedScreen;