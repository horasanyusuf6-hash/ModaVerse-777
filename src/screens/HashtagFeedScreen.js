// screens/HashtagFeedScreen.js - SADECE HATALAR DÜZELTİLDİ
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
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRoute, useNavigation } from '@react-navigation/native';

const { width: screenWidth } = Dimensions.get('window');

const COLORS = {
  white: '#FFFFFF',
  ivory: '#F9F6F2',
  ash: '#888888',
  charcoal: '#222222',
  cloud: '#F0F0F0',
  accent: '#8C7853',
  like: '#E91E63',
  success: '#4CAF50',
  error: '#F44336',
};

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
          <Ionicons name="ellipsis-horizontal" size={20} color={COLORS.ash} />
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
            size={24} 
            color={item.isLiked ? COLORS.like : COLORS.charcoal} 
          />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.postAction}
          onPress={() => Alert.alert('Yorumlar', 'Yorumlar sayfası açılıyor...')}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="chatbubble-outline" size={24} color={COLORS.charcoal} />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.postAction}
          onPress={() => Alert.alert('Paylaş', 'Gönderi paylaşılıyor...')}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="paper-plane-outline" size={24} color={COLORS.charcoal} />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.saveButton}
          onPress={() => toggleSave(item.id)}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons 
            name={item.isSaved ? "bookmark" : "bookmark-outline"} 
            size={24} 
            color={item.isSaved ? COLORS.accent : COLORS.charcoal} 
          />
        </TouchableOpacity>
      </View>
      
      <View style={styles.postContent}>
        <Text style={styles.likesText}>{item.likes} beğenme</Text>
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
          <Text style={styles.commentsText}>{item.comments} yorumun tümünü gör</Text>
        </TouchableOpacity>
      </View>
    </View>
  ), [toggleLike, toggleSave, navigation]);

  const renderEmptyList = useCallback(() => (
    <View style={styles.emptyContainer}>
      <Ionicons name="search-outline" size={48} color={COLORS.ash} />
      <Text style={styles.emptyTitle}>Gönderi bulunamadı</Text>
      <Text style={styles.emptyText}>
        #{hashtag} etiketiyle henüz gönderi yok.
      </Text>
      <TouchableOpacity 
        style={styles.emptyButton}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.emptyButtonText}>Geri Dön</Text>
      </TouchableOpacity>
    </View>
  ), [hashtag, navigation]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
      
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="chevron-back" size={24} color={COLORS.charcoal} />
        </TouchableOpacity>
        
        <View style={styles.headerCenter}>
          <Text style={styles.hashtagText}>#{hashtag}</Text>
          <Text style={styles.postCount}>
            {totalPosts.toLocaleString()} gönderi
          </Text>
        </View>
        
        <TouchableOpacity 
          onPress={() => Alert.alert('Bilgi', `#${hashtag} etiketi hakkında bilgi`)}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="information-circle-outline" size={24} color={COLORS.charcoal} />
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.cloud,
  },
  headerCenter: {
    alignItems: 'center',
  },
  hashtagText: {
    fontSize: 18,
    fontWeight: '300',
    color: COLORS.charcoal,
    letterSpacing: 0.5,
  },
  postCount: {
    fontSize: 13,
    fontWeight: '300',
    color: COLORS.ash,
    marginTop: 2,
  },
  feedContent: {
    paddingBottom: 20,
  },
  postCard: {
    marginBottom: 24,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.ivory,
    marginRight: 12,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 15,
    fontWeight: '400',
    color: COLORS.charcoal,
    marginBottom: 2,
  },
  postTime: {
    fontSize: 12,
    fontWeight: '300',
    color: COLORS.ash,
  },
  moreButton: {
    padding: 4,
  },
  postImage: {
    width: screenWidth,
    height: screenWidth,
    backgroundColor: COLORS.ivory,
  },
  postActions: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  postAction: {
    marginRight: 16,
  },
  saveButton: {
    marginLeft: 'auto',
  },
  postContent: {
    paddingHorizontal: 16,
  },
  likesText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.charcoal,
    marginBottom: 8,
  },
  contentText: {
    fontSize: 14,
    fontWeight: '300',
    color: COLORS.charcoal,
    lineHeight: 20,
    marginBottom: 8,
  },
  userNameText: {
    fontWeight: '500',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  tagText: {
    fontSize: 14,
    fontWeight: '300',
    color: COLORS.accent,
    marginRight: 8,
  },
  commentsText: {
    fontSize: 14,
    fontWeight: '300',
    color: COLORS.ash,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    minHeight: 400,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.charcoal,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.ash,
    textAlign: 'center',
    lineHeight: 20,
  },
  emptyButton: {
    marginTop: 20,
    paddingHorizontal: 30,
    paddingVertical: 12,
    backgroundColor: COLORS.accent,
    borderRadius: 8,
  },
  emptyButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default HashtagFeedScreen;