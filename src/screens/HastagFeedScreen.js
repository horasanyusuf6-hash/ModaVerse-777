import React, { useState, useLayoutEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Dimensions,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';

// 📏 Ekran boyutları
const { width: screenWidth } = Dimensions.get('window');

// 🎨 Renk paleti (App.js ile uyumlu - cognac düzeltildi)
const COLORS = {
  white: '#FFFFFF',
  ivory: '#F9F6F2',
  paper: '#F5F3EF',
  cloud: '#F0F0F0',
  mist: '#E8E8E8',
  ash: '#888888',
  charcoal: '#222222',
  noir: '#000000',
  cognac: '#8C7853',  // ✅ DÜZELTİLDİ
  porcelain: '#FAFAFA',
  accent: '#8C7853',
  success: '#4CAF50',
  warning: '#FF9800',
  error: '#F44336',
  like: '#E91E63',
  blue: '#0095f6',
  green: '#00ff88',
};

// ✅ Mock veriler (inline - import hatasını önlemek için)
const mockPosts = [
  {
    id: '1',
    user: {
      name: 'Fashionista',
      avatar: 'https://i.pravatar.cc/100?img=1',
      verified: true,
    },
    timestamp: '2 saat önce',
    images: ['https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=400'],
    likes: 1240,
    comments: 89,
    saves: 45,
    location: 'İstanbul',
    caption: 'Sürdürülebilir moda ile tarzınızı konuşturun!',
    hashtags: ['SürdürülebilirModa', 'EcoFashion'],
    trending: true,
    type: 'image',
  },
  {
    id: '2',
    user: {
      name: 'StreetStyle',
      avatar: 'https://i.pravatar.cc/100?img=2',
      verified: false,
    },
    timestamp: '5 saat önce',
    images: ['https://images.unsplash.com/photo-1539008835657-9e8e9680c956?w=400'],
    likes: 890,
    comments: 45,
    saves: 23,
    location: 'New York',
    caption: 'Milan Fashion Week\'ten en yeni trendler!',
    hashtags: ['MilanFashionWeek', 'StreetStyle'],
    trending: true,
    type: 'carousel',
  },
];

const hashtagTrends = {
  'SürdürülebilirModa': {
    posts: 15420,
    growth: 42,
    relatedTags: ['EcoFashion', 'SlowFashion', 'Recycle', 'Vintage'],
  },
  'MilanFashionWeek': {
    posts: 25600,
    growth: 68,
    relatedTags: ['StreetStyle', 'Luxury', 'Designer', 'Runway'],
  },
};

const HashtagFeedScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { hashtag } = route.params || { hashtag: 'SürdürülebilirModa' };

  const [activeTab, setActiveTab] = useState('top');
  const [likedPosts, setLikedPosts] = useState([]);
  const [savedPosts, setSavedPosts] = useState([]);

  const trendData = useMemo(() => 
    hashtagTrends[hashtag] || {
      posts: 0,
      growth: 0,
      relatedTags: []
    }, [hashtag]);

  const filteredPosts = useMemo(() => 
    mockPosts.filter(post => 
      post.hashtags?.includes(hashtag)
    ) || [], [hashtag]);

  const currentPosts = useMemo(() => {
    if (activeTab === 'top') {
      return filteredPosts.filter(post => post.trending);
    } else if (activeTab === 'recent') {
      return filteredPosts;
    } else {
      return filteredPosts.filter(post => post.type === 'carousel');
    }
  }, [activeTab, filteredPosts]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: `#${hashtag}`,
      headerStyle: { backgroundColor: COLORS.noir },
      headerTintColor: COLORS.white,
      headerTitleStyle: { fontWeight: '700', fontSize: 18 },
      headerLeft: () => (
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          style={{ marginLeft: 16 }}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="chevron-back" size={24} color={COLORS.white} />
        </TouchableOpacity>
      ),
    });
  }, [navigation, hashtag]);

  const toggleLike = useCallback((postId) => {
    setLikedPosts(prev =>
      prev.includes(postId)
        ? prev.filter(id => id !== postId)
        : [...prev, postId]
    );
  }, []);

  const toggleSave = useCallback((postId) => {
    setSavedPosts(prev =>
      prev.includes(postId)
        ? prev.filter(id => id !== postId)
        : [...prev, postId]
    );
  }, []);

  const goToHashtag = useCallback((tag) => {
    navigation.push('HashtagFeed', { hashtag: tag });
  }, [navigation]);

  const renderPostItem = useCallback(({ item }) => {
    const isLiked = likedPosts.includes(item.id);
    const isSaved = savedPosts.includes(item.id);
    
    return (
      <View style={styles.postCard}>
        <View style={styles.userInfo}>
          <Image source={{ uri: item.user?.avatar }} style={styles.avatar} />
          <View style={styles.userDetails}>
            <View style={styles.userNameContainer}>
              <Text style={styles.userName}>{item.user?.name}</Text>
              {item.user?.verified && (
                <Ionicons name="checkmark-circle" size={16} color={COLORS.blue} />
              )}
            </View>
            <Text style={styles.timestamp}>{item.timestamp}</Text>
          </View>
          <TouchableOpacity 
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            onPress={() => Alert.alert('Seçenekler', 'Bu gönderi için işlemler')}
          >
            <Ionicons name="ellipsis-horizontal" size={20} color={COLORS.white} />
          </TouchableOpacity>
        </View>

        <Image 
          source={{ uri: item.images?.[0] }} 
          style={styles.postImage}
        />

        <View style={styles.engagement}>
          <View style={styles.engagementStats}>
            <TouchableOpacity 
              style={styles.stat}
              onPress={() => toggleLike(item.id)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons 
                name={isLiked ? "heart" : "heart-outline"} 
                size={18} 
                color={isLiked ? COLORS.like : COLORS.white} 
              />
              <Text style={styles.statText}>{item.likes + (isLiked ? 1 : 0)}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.stat}
              onPress={() => Alert.alert('Yorumlar', 'Yorumlar sayfası açılıyor...')}
            >
              <Ionicons name="chatbubble-outline" size={18} color={COLORS.white} />
              <Text style={styles.statText}>{item.comments}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.stat}
              onPress={() => toggleSave(item.id)}
            >
              <Ionicons 
                name={isSaved ? "bookmark" : "bookmark-outline"} 
                size={18} 
                color={isSaved ? COLORS.cognac : COLORS.white} 
              />
              <Text style={styles.statText}>{item.saves + (isSaved ? 1 : 0)}</Text>
            </TouchableOpacity>
          </View>
          
          {item.location && (
            <View style={styles.location}>
              <Ionicons name="location-outline" size={12} color={COLORS.ash} />
              <Text style={styles.locationText}>{item.location}</Text>
            </View>
          )}
        </View>

        <View style={styles.captionContainer}>
          <Text style={styles.caption} numberOfLines={3}>
            <Text style={styles.userName}>{item.user?.name} </Text>
            {item.caption}
          </Text>
        </View>

        <View style={styles.hashtagsContainer}>
          {item.hashtags?.map((tag, index) => (
            <TouchableOpacity key={index} onPress={() => goToHashtag(tag)}>
              <Text style={styles.hashtagText}>#{tag} </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  }, [likedPosts, savedPosts, toggleLike, toggleSave, goToHashtag]);

  const RelatedTag = useCallback(({ tag }) => (
    <TouchableOpacity 
      style={styles.relatedTag}
      onPress={() => goToHashtag(tag)}
      activeOpacity={0.7}
    >
      <Text style={styles.relatedTagText}>#{tag}</Text>
    </TouchableOpacity>
  ), [goToHashtag]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.noir} />
      
      <View style={styles.hashtagHeader}>
        <View style={styles.hashtagInfo}>
          <Text style={styles.hashtagTitle}>#{hashtag}</Text>
          <View style={styles.hashtagStats}>
            <Text style={styles.postsCount}>
              {trendData.posts.toLocaleString()} gönderi
            </Text>
            {trendData.growth > 0 && (
              <View style={styles.growthBadge}>
                <Ionicons name="trending-up" size={12} color={COLORS.green} />
                <Text style={styles.growthText}>%{trendData.growth}</Text>
              </View>
            )}
          </View>
        </View>
      </View>

      {trendData.relatedTags?.length > 0 && (
        <View style={styles.relatedTagsSection}>
          <Text style={styles.relatedTagsTitle}>İlgili Trendler</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.relatedTagsContainer}>
              {trendData.relatedTags.map((tag, index) => (
                <RelatedTag key={index} tag={tag} />
              ))}
            </View>
          </ScrollView>
        </View>
      )}

      <View style={styles.tabContainer}>
        {[
          { id: 'top', label: '🔥 Trend' },
          { id: 'recent', label: '⏳ Son' },
          { id: 'media', label: '🎬 Medya' }
        ].map((tab) => (
          <TouchableOpacity
            key={tab.id}
            style={[styles.tab, activeTab === tab.id && styles.tabActive]}
            onPress={() => setActiveTab(tab.id)}
          >
            <Text style={[
              styles.tabText,
              activeTab === tab.id && styles.tabTextActive
            ]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={currentPosts}
        renderItem={renderPostItem}
        keyExtractor={item => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.feedContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="search-outline" size={48} color={COLORS.ash} />
            <Text style={styles.emptyText}>Bu hashtag'te henüz gönderi yok</Text>
            <TouchableOpacity 
              style={styles.emptyButton}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.emptyButtonText}>Geri Dön</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: COLORS.noir 
  },
  hashtagHeader: { 
    padding: 16, 
    borderBottomWidth: 0.5, 
    borderBottomColor: COLORS.charcoal 
  },
  hashtagInfo: { 
    alignItems: 'center' 
  },
  hashtagTitle: { 
    fontSize: 28, 
    fontWeight: '700', 
    color: COLORS.white, 
    marginBottom: 8 
  },
  hashtagStats: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 12 
  },
  postsCount: { 
    fontSize: 16, 
    color: COLORS.ash 
  },
  growthBadge: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: COLORS.charcoal, 
    paddingHorizontal: 8, 
    paddingVertical: 4, 
    borderRadius: 8, 
    gap: 4 
  },
  growthText: { 
    fontSize: 12, 
    color: COLORS.green, 
    fontWeight: '600' 
  },
  relatedTagsSection: { 
    padding: 16, 
    borderBottomWidth: 0.5, 
    borderBottomColor: COLORS.charcoal 
  },
  relatedTagsTitle: { 
    fontSize: 16, 
    fontWeight: '600', 
    color: COLORS.white, 
    marginBottom: 12 
  },
  relatedTagsContainer: { 
    flexDirection: 'row', 
    gap: 8 
  },
  relatedTag: { 
    backgroundColor: COLORS.charcoal, 
    paddingHorizontal: 16, 
    paddingVertical: 8, 
    borderRadius: 20, 
    borderWidth: 1, 
    borderColor: COLORS.ash 
  },
  relatedTagText: { 
    color: COLORS.white, 
    fontWeight: '500' 
  },
  tabContainer: { 
    flexDirection: 'row', 
    borderBottomWidth: 0.5, 
    borderBottomColor: COLORS.charcoal 
  },
  tab: { 
    flex: 1, 
    alignItems: 'center', 
    paddingVertical: 12 
  },
  tabActive: { 
    borderBottomWidth: 2, 
    borderBottomColor: COLORS.white 
  },
  tabText: { 
    color: COLORS.ash, 
    fontWeight: '600' 
  },
  tabTextActive: { 
    color: COLORS.white 
  },
  feedContainer: { 
    paddingBottom: 20 
  },
  postCard: { 
    backgroundColor: COLORS.charcoal, 
    marginBottom: 12, 
    borderBottomWidth: 0.5, 
    borderBottomColor: COLORS.ash 
  },
  userInfo: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    padding: 12 
  },
  avatar: { 
    width: 32, 
    height: 32, 
    borderRadius: 16,
    backgroundColor: COLORS.ash,
  },
  userDetails: { 
    flex: 1, 
    marginLeft: 8 
  },
  userNameContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 4 
  },
  userName: { 
    color: COLORS.white, 
    fontWeight: '600' 
  },
  timestamp: { 
    color: COLORS.ash, 
    fontSize: 12, 
    marginTop: 2 
  },
  postImage: { 
    width: '100%', 
    height: screenWidth, 
    backgroundColor: COLORS.ash 
  },
  engagement: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    padding: 12 
  },
  engagementStats: { 
    flexDirection: 'row', 
    gap: 16 
  },
  stat: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 4 
  },
  statText: { 
    color: COLORS.white, 
    fontSize: 12 
  },
  location: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 4 
  },
  locationText: { 
    color: COLORS.ash, 
    fontSize: 12 
  },
  captionContainer: { 
    paddingHorizontal: 12, 
    paddingBottom: 8 
  },
  caption: { 
    color: COLORS.white, 
    fontSize: 14, 
    lineHeight: 18 
  },
  hashtagsContainer: { 
    paddingHorizontal: 12, 
    paddingBottom: 12, 
    flexDirection: 'row', 
    flexWrap: 'wrap' 
  },
  hashtagText: { 
    color: COLORS.blue, 
    fontSize: 14 
  },
  emptyContainer: { 
    alignItems: 'center', 
    padding: 40 
  },
  emptyText: { 
    color: COLORS.ash, 
    fontSize: 16, 
    marginTop: 12, 
    textAlign: 'center' 
  },
  emptyButton: {
    marginTop: 20,
    paddingHorizontal: 30,
    paddingVertical: 12,
    backgroundColor: COLORS.cognac,
    borderRadius: 8,
  },
  emptyButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default HashtagFeedScreen;