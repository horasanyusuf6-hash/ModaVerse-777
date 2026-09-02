// 📁 src/screens/HashtagFeedScreen.js - LÜKS MİNİMALİST VERSİYON
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
  Alert,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { COLORS, TYPOGRAPHY, SIZES } from '../constants/Theme';

const { width: screenWidth } = Dimensions.get('window');

// Mock veriler
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
      headerStyle: { backgroundColor: COLORS.white },
      headerTintColor: COLORS.black,
      headerTitleStyle: { 
        ...TYPOGRAPHY.caption,
        letterSpacing: 1,
      },
      headerLeft: () => (
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          style={{ marginLeft: SIZES.md, padding: 4 }}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.black} />
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

  const formatNumber = (num) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

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
                <Ionicons name="checkmark-circle" size={12} color={COLORS.black} />
              )}
            </View>
            <Text style={styles.timestamp}>{item.timestamp}</Text>
          </View>
          <TouchableOpacity 
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            onPress={() => Alert.alert('Seçenekler', 'Bu gönderi için işlemler')}
            style={styles.moreButton}
          >
            <Ionicons name="ellipsis-horizontal" size={18} color={COLORS.grayMedium} />
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
                color={isLiked ? COLORS.black : COLORS.grayMedium} 
              />
              <Text style={styles.statText}>{formatNumber(item.likes + (isLiked ? 1 : 0))}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.stat}
              onPress={() => Alert.alert('Yorumlar', 'Yorumlar sayfası açılıyor...')}
            >
              <Ionicons name="chatbubble-outline" size={18} color={COLORS.grayMedium} />
              <Text style={styles.statText}>{formatNumber(item.comments)}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.stat}
              onPress={() => toggleSave(item.id)}
            >
              <Ionicons 
                name={isSaved ? "bookmark" : "bookmark-outline"} 
                size={18} 
                color={isSaved ? COLORS.black : COLORS.grayMedium} 
              />
              <Text style={styles.statText}>{formatNumber(item.saves + (isSaved ? 1 : 0))}</Text>
            </TouchableOpacity>
          </View>
          
          {item.location && (
            <View style={styles.location}>
              <Ionicons name="location-outline" size={10} color={COLORS.grayMedium} />
              <Text style={styles.locationText}>{item.location}</Text>
            </View>
          )}
        </View>

        <View style={styles.captionContainer}>
          <Text style={styles.caption} numberOfLines={3}>
            <Text style={styles.captionUserName}>{item.user?.name} </Text>
            {item.caption}
          </Text>
        </View>

        <View style={styles.hashtagsContainer}>
          {item.hashtags?.map((tag, index) => (
            <TouchableOpacity key={index} onPress={() => goToHashtag(tag)}>
              <Text style={styles.hashtagText}>#{tag}</Text>
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
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
      
      <View style={styles.hashtagHeader}>
        <View style={styles.hashtagInfo}>
          <Text style={styles.hashtagTitle}>#{hashtag}</Text>
          <View style={styles.hashtagStats}>
            <Text style={styles.postsCount}>
              {trendData.posts.toLocaleString()} GÖNDERİ
            </Text>
            {trendData.growth > 0 && (
              <View style={styles.growthBadge}>
                <Ionicons name="trending-up" size={10} color={COLORS.grayMedium} />
                <Text style={styles.growthText}>%{trendData.growth}</Text>
              </View>
            )}
          </View>
        </View>
      </View>

      {trendData.relatedTags?.length > 0 && (
        <View style={styles.relatedTagsSection}>
          <Text style={styles.relatedTagsTitle}>İLGİLİ TRENDLER</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.relatedTagsContainer}
          >
            {trendData.relatedTags.map((tag, index) => (
              <RelatedTag key={index} tag={tag} />
            ))}
          </ScrollView>
        </View>
      )}

      <View style={styles.tabContainer}>
        {[
          { id: 'top', label: 'TREND' },
          { id: 'recent', label: 'SON' },
          { id: 'media', label: 'MEDYA' }
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
        }
      />
    </SafeAreaView>
  );
};

// ============ STILLER ============
const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: COLORS.white 
  },
  
  // Hashtag Header
  hashtagHeader: { 
    padding: SIZES.lg, 
    borderBottomWidth: 0.5, 
    borderBottomColor: COLORS.grayLight 
  },
  hashtagInfo: { 
    alignItems: 'center' 
  },
  hashtagTitle: { 
    ...TYPOGRAPHY.title2,
    marginBottom: SIZES.xs 
  },
  hashtagStats: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: SIZES.md 
  },
  postsCount: { 
    ...TYPOGRAPHY.caption,
    color: COLORS.grayMedium 
  },
  growthBadge: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    borderWidth: 0.5,
    borderColor: COLORS.grayLight,
    paddingHorizontal: SIZES.sm, 
    paddingVertical: 2, 
    gap: 2 
  },
  growthText: { 
    ...TYPOGRAPHY.caption,
    color: COLORS.grayMedium
  },
  
  // Related Tags
  relatedTagsSection: { 
    padding: SIZES.md, 
    borderBottomWidth: 0.5, 
    borderBottomColor: COLORS.grayLight 
  },
  relatedTagsTitle: { 
    ...TYPOGRAPHY.caption,
    marginBottom: SIZES.md 
  },
  relatedTagsContainer: { 
    flexDirection: 'row', 
    gap: SIZES.sm,
    paddingRight: SIZES.md,
  },
  relatedTag: { 
    borderWidth: 0.5, 
    borderColor: COLORS.grayLight, 
    paddingHorizontal: SIZES.md, 
    paddingVertical: SIZES.sm, 
  },
  relatedTagText: { 
    ...TYPOGRAPHY.caption,
    color: COLORS.black, 
  },
  
  // Tabs
  tabContainer: { 
    flexDirection: 'row', 
    borderBottomWidth: 0.5, 
    borderBottomColor: COLORS.grayLight 
  },
  tab: { 
    flex: 1, 
    alignItems: 'center', 
    paddingVertical: SIZES.md 
  },
  tabActive: { 
    borderBottomWidth: 1, 
    borderBottomColor: COLORS.black 
  },
  tabText: { 
    ...TYPOGRAPHY.caption,
    color: COLORS.grayMedium, 
  },
  tabTextActive: { 
    color: COLORS.black 
  },
  
  feedContainer: { 
    paddingBottom: SIZES.xl 
  },
  
  // Post Card
  postCard: { 
    backgroundColor: COLORS.white, 
    marginBottom: SIZES.md,
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.grayLight,
  },
  userInfo: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    padding: SIZES.md 
  },
  avatar: { 
    width: 40, 
    height: 40, 
    borderWidth: 0.5,
    borderColor: COLORS.grayLight,
    backgroundColor: COLORS.surface,
  },
  userDetails: { 
    flex: 1, 
    marginLeft: SIZES.md 
  },
  userNameContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 4 
  },
  userName: { 
    ...TYPOGRAPHY.body,
    fontWeight: '500', 
  },
  timestamp: { 
    ...TYPOGRAPHY.caption,
    color: COLORS.grayMedium, 
    marginTop: 2 
  },
  moreButton: {
    padding: 4,
  },
  postImage: { 
    width: '100%', 
    height: screenWidth, 
    backgroundColor: COLORS.surface,
    borderWidth: 0.5,
    borderColor: COLORS.grayLight,
  },
  engagement: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    padding: SIZES.md 
  },
  engagementStats: { 
    flexDirection: 'row', 
    gap: SIZES.lg 
  },
  stat: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 4 
  },
  statText: { 
    ...TYPOGRAPHY.caption,
  },
  location: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 2 
  },
  locationText: { 
    ...TYPOGRAPHY.caption,
    color: COLORS.grayMedium 
  },
  captionContainer: { 
    paddingHorizontal: SIZES.md, 
    paddingBottom: SIZES.sm 
  },
  caption: { 
    ...TYPOGRAPHY.body,
    lineHeight: 20,
  },
  captionUserName: {
    ...TYPOGRAPHY.body,
    fontWeight: '500',
  },
  hashtagsContainer: { 
    paddingHorizontal: SIZES.md, 
    paddingBottom: SIZES.md, 
    flexDirection: 'row', 
    flexWrap: 'wrap',
    gap: SIZES.sm,
  },
  hashtagText: { 
    ...TYPOGRAPHY.caption,
    color: COLORS.grayMedium 
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
    color: COLORS.grayMedium, 
    marginTop: SIZES.xs, 
    textAlign: 'center' 
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