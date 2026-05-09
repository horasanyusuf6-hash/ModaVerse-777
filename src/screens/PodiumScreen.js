// 📁 PodiumScreen.js - REVİZE EDİLMİŞ (MaterialIcons kaldırıldı)
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
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
  TextInput,
  Modal,
  Animated,
  Platform,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// 📏 Ekran boyutları
const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// 🎨 RENK PALETİ
const COLORS = {
  white: '#FFFFFF',
  ivory: '#F9F6F2',
  paper: '#F5F3EF',
  cloud: '#F0F0F0',
  mist: '#E8E8E8',
  ash: '#888888',
  charcoal: '#222222',
  noir: '#000000',
  accent: '#8C7853',
  success: '#4CAF50',
  warning: '#FF9800',
  error: '#F44336',
  like: '#E91E63',
  blue: '#1DA1F2',
  pink: '#F91880',
  green: '#00BA7C',
  purple: '#7856FF',
  orange: '#FF7A00',
  red: '#F4212E',
  gray50: '#F7F9F9',
  gray100: '#EFF3F4',
  gray200: '#E1E8ED',
  gray500: '#657786',
  gray700: '#536471',
  gray900: '#0F1419',
};

// 🍔 3 ÇİZGİ MENÜ
const ThreeLineMenu = ({ onPress }) => (
  <TouchableOpacity 
    style={menuStyles.container} 
    onPress={onPress}
    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
    activeOpacity={0.7}
  >
    <View style={menuStyles.line} />
    <View style={[menuStyles.line, { width: 20 }]} />
    <View style={[menuStyles.line, { width: 16 }]} />
  </TouchableOpacity>
);

// 🏷️ HASHTAG CARD
const HashtagCard = ({ hashtag, tweets, trending, onPress, onFollow }) => {
  const [isFollowing, setIsFollowing] = useState(false);
  
  const handleFollow = useCallback(() => {
    setIsFollowing(!isFollowing);
    if (onFollow) {
      onFollow(hashtag, !isFollowing);
    }
  }, [isFollowing, hashtag, onFollow]);

  const handleCardPress = useCallback(() => {
    if (onPress) {
      onPress(hashtag);
    }
  }, [hashtag, onPress]);
  
  return (
    <TouchableOpacity 
      style={hashtagStyles.card} 
      onPress={handleCardPress}
      activeOpacity={0.7}
    >
      <View style={hashtagStyles.header}>
        <View>
          <Text style={hashtagStyles.trendingText}>Türkiye'de gündemde</Text>
          <Text style={hashtagStyles.hashtag}>#{hashtag}</Text>
          <Text style={hashtagStyles.tweets}>{tweets} gönderi</Text>
        </View>
        <TouchableOpacity 
          style={[
            hashtagStyles.followButton,
            isFollowing && hashtagStyles.followingButton
          ]}
          onPress={handleFollow}
          activeOpacity={0.7}
        >
          <Text style={[
            hashtagStyles.followText,
            isFollowing && hashtagStyles.followingText
          ]}>
            {isFollowing ? 'Takip Ediliyor' : 'Takip Et'}
          </Text>
        </TouchableOpacity>
      </View>
      
      {trending && (
        <View style={hashtagStyles.trendingInfo}>
          <Ionicons name="trending-up" size={16} color={COLORS.blue} />
          <Text style={hashtagStyles.trendingStats}>{trending}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

// 📝 BLOG CARD
const BlogCard = ({ title, author, excerpt, likes, comments, image, onPress }) => (
  <TouchableOpacity 
    style={blogStyles.card} 
    onPress={onPress}
    activeOpacity={0.8}
  >
    <Image source={{ uri: image }} style={blogStyles.image} />
    <View style={blogStyles.content}>
      <Text style={blogStyles.title}>{title}</Text>
      <Text style={blogStyles.excerpt} numberOfLines={2}>{excerpt}</Text>
      
      <View style={blogStyles.footer}>
        <Text style={blogStyles.author}>{author}</Text>
        <View style={blogStyles.stats}>
          <View style={blogStyles.stat}>
            <Ionicons name="heart-outline" size={14} color={COLORS.gray700} />
            <Text style={blogStyles.statText}>{likes}</Text>
          </View>
          <View style={blogStyles.stat}>
            <Ionicons name="chatbubble-outline" size={14} color={COLORS.gray700} />
            <Text style={blogStyles.statText}>{comments}</Text>
          </View>
        </View>
      </View>
    </View>
  </TouchableOpacity>
);

// 📝 TWEET CARD
const TweetCard = ({ item, onLike, onComment, onShare }) => {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(item.likes);
  
  const handleLike = useCallback(() => {
    setLiked(!liked);
    setLikeCount(prev => liked ? prev - 1 : prev + 1);
    if (onLike) onLike(item.id, !liked);
  }, [liked, item.id, onLike]);
  
  return (
    <View style={styles.tweetCard}>
      <Image 
        source={{ uri: item.avatar }} 
        style={styles.avatar} 
      />
      <View style={styles.tweetContent}>
        <View style={styles.tweetHeader}>
          <Text style={styles.tweetName}>{item.name}</Text>
          <Text style={styles.tweetUsername}>@{item.username}</Text>
          <Text style={styles.tweetTime}>· {item.time}</Text>
        </View>
        <Text style={styles.tweetText}>{item.text}</Text>
        
        {item.image && (
          <Image 
            source={{ uri: item.image }}
            style={styles.tweetImage}
          />
        )}
        
        <View style={styles.tweetActions}>
          <TouchableOpacity style={styles.tweetAction} onPress={onComment}>
            <Ionicons name="chatbubble-outline" size={18} color={COLORS.gray500} />
            <Text style={styles.tweetActionCount}>{item.comments}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.tweetAction}>
            <Ionicons name="repeat-outline" size={18} color={COLORS.gray500} />
            <Text style={styles.tweetActionCount}>{item.retweets}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.tweetAction} onPress={handleLike}>
            <Ionicons 
              name={liked ? "heart" : "heart-outline"} 
              size={18} 
              color={liked ? COLORS.red : COLORS.gray500} 
            />
            <Text style={[
              styles.tweetActionCount,
              liked && { color: COLORS.red }
            ]}>
              {likeCount}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.tweetAction} onPress={onShare}>
            <Ionicons name="share-outline" size={18} color={COLORS.gray500} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const PodiumScreen = () => {
  const [activeTab, setActiveTab] = useState('fashion-feed');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [selectedHashtag, setSelectedHashtag] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const menuAnimation = useRef(new Animated.Value(-300)).current;

  // 🍔 MENÜ AÇ/KAPA
  const toggleMenu = useCallback(() => {
    if (isMenuOpen) {
      Animated.timing(menuAnimation, {
        toValue: -300,
        duration: 300,
        useNativeDriver: false,
      }).start(() => setIsMenuOpen(false));
    } else {
      setIsMenuOpen(true);
      Animated.timing(menuAnimation, {
        toValue: 0,
        duration: 300,
        useNativeDriver: false,
      }).start();
    }
  }, [isMenuOpen, menuAnimation]);

  // 🏷️ HASHTAG VERİSİ
  const hashtags = useMemo(() => [
    { id: 1, hashtag: 'SürdürülebilirModa', tweets: '15.4K', trending: '+42%' },
    { id: 2, hashtag: 'MilanFashionWeek', tweets: '25.6K', trending: '+68%' },
    { id: 3, hashtag: 'StreetStyleİstanbul', tweets: '9.8K', trending: '+15%' },
    { id: 4, hashtag: 'TürkTasarımcılar', tweets: '12.3K', trending: '+35%' },
    { id: 5, hashtag: 'ModaTeknolojisi', tweets: '8.7K', trending: '+22%' },
    { id: 6, hashtag: 'VintageAlışveriş', tweets: '6.9K', trending: '+18%' },
  ], []);

  // 📝 BLOG VERİSİ
  const blogs = useMemo(() => [
    {
      id: 1,
      title: '2024 Bahar Trendleri: Neler Giyeceğiz?',
      author: 'Elif Şen',
      excerpt: 'Sezonun en popüler renk paletleri, kesimler ve kombin önerileri...',
      likes: '1.2K',
      comments: '89',
      image: 'https://images.unsplash.com/photo-1539008835657-9e8e9680c956?w=400',
    },
    {
      id: 2,
      title: 'Sürdürülebilir Moda: Nasıl Daha Bilinçli Alışveriş Yapılır?',
      author: 'Can Demir',
      excerpt: 'Çevre dostu markalar ve etik alışveriş rehberi...',
      likes: '2.4K',
      comments: '156',
      image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400',
    },
    {
      id: 3,
      title: 'Minimalist Gardırop: 10 Parça ile 50 Kombin',
      author: 'Zeynep Kaya',
      excerpt: 'Sade ve şık bir gardırop oluşturmanın sırları...',
      likes: '3.1K',
      comments: '212',
      image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400',
    },
  ], []);

  // 📝 TWEET VERİSİ
  const tweets = useMemo(() => [
    {
      id: 1,
      name: 'Fashionista1',
      username: 'fashionista1',
      time: '2s',
      text: 'Just discovered this amazing sustainable brand! #SürdürülebilirModa',
      avatar: 'https://i.pravatar.cc/100?img=11',
      image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=400',
      likes: 289,
      comments: 45,
      retweets: 12,
    },
    {
      id: 2,
      name: 'StyleHunter',
      username: 'stylehunter',
      time: '1h',
      text: 'Milan Fashion Week is absolutely incredible! #MilanFashionWeek',
      avatar: 'https://i.pravatar.cc/100?img=12',
      image: null,
      likes: 567,
      comments: 89,
      retweets: 34,
    },
    {
      id: 3,
      name: 'VintageLover',
      username: 'vintagelover',
      time: '3h',
      text: 'Found this amazing vintage piece at a thrift store today! #VintageAlışveriş',
      avatar: 'https://i.pravatar.cc/100?img=13',
      image: 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=400',
      likes: 1234,
      comments: 156,
      retweets: 78,
    },
  ], []);

  // MODA AKIŞI
  const FashionFeed = () => (
    <ScrollView style={styles.feedContainer} showsVerticalScrollIndicator={false}>
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>🔥 Trend Hashtag'ler</Text>
          <TouchableOpacity onPress={() => Alert.alert('Tüm Hashtagler', 'Tüm hashtagler gösteriliyor')}>
            <Text style={styles.seeAll}>Tümünü Gör</Text>
          </TouchableOpacity>
        </View>
        
        <FlatList
          horizontal
          data={hashtags}
          renderItem={({ item }) => (
            <HashtagCard 
              {...item} 
              onPress={(tag) => {
                setSelectedHashtag(tag);
                Alert.alert('Hashtag', `#${tag} gönderileri gösteriliyor`);
              }}
              onFollow={(tag, following) => {
                Alert.alert(
                  following ? 'Takip Ediliyor' : 'Takip Bırakıldı',
                  `#${tag} ${following ? 'takip ediliyor' : 'takibi bırakıldı'}`
                );
              }}
            />
          )}
          keyExtractor={item => item.id.toString()}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.hashtagList}
          ItemSeparatorComponent={() => <View style={{ width: 12 }} />}
        />
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>💬 Popüler Gönderiler</Text>
          <TouchableOpacity onPress={() => Alert.alert('Tüm Gönderiler', 'Tüm gönderiler gösteriliyor')}>
            <Text style={styles.seeAll}>Daha Fazla</Text>
          </TouchableOpacity>
        </View>
        
        <FlatList
          data={tweets}
          renderItem={({ item }) => (
            <TweetCard 
              item={item}
              onLike={(id, liked) => console.log(`Tweet ${id} ${liked ? 'beğenildi' : 'beğeniden çıkarıldı'}`)}
              onComment={() => Alert.alert('Yorumlar', 'Yorumlar sayfası açılıyor...')}
              onShare={() => Alert.alert('Paylaş', 'Gönderi paylaşılıyor...')}
            />
          )}
          keyExtractor={item => item.id.toString()}
          scrollEnabled={false}
        />
      </View>
    </ScrollView>
  );

  // BLOGLAR
  const BlogsSection = () => (
    <ScrollView style={styles.blogsContainer} showsVerticalScrollIndicator={false}>
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>📚 Son Yazılar</Text>
          <TouchableOpacity onPress={() => Alert.alert('Tüm Bloglar', 'Tüm bloglar gösteriliyor')}>
            <Text style={styles.seeAll}>Tümü</Text>
          </TouchableOpacity>
        </View>
        
        <FlatList
          data={blogs}
          renderItem={({ item }) => (
            <BlogCard 
              {...item} 
              onPress={() => Alert.alert('Blog', `${item.title} açılıyor...`)}
            />
          )}
          keyExtractor={item => item.id.toString()}
          scrollEnabled={false}
          ItemSeparatorComponent={() => <View style={{ height: 16 }} />}
        />
        
        <View style={styles.authorsSection}>
          <Text style={styles.sectionTitle}>👩‍💼 Popüler Yazarlar</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {['Elif Şen', 'Can Demir', 'Zeynep Kaya', 'Ahmet Yılmaz', 'Selin Öztürk'].map((author, index) => (
              <TouchableOpacity 
                key={index} 
                style={styles.authorCard}
                onPress={() => Alert.alert('Yazar', `${author} profil sayfası açılıyor...`)}
              >
                <Image 
                  source={{ uri: `https://i.pravatar.cc/100?img=${index + 20}` }} 
                  style={styles.authorAvatar} 
                />
                <Text style={styles.authorName}>{author}</Text>
                <TouchableOpacity 
                  style={styles.followAuthorButton}
                  onPress={() => Alert.alert('Takip', `${author} takip ediliyor`)}
                >
                  <Text style={styles.followAuthorText}>Takip Et</Text>
                </TouchableOpacity>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    </ScrollView>
  );

  // TREND PARÇALAR
  const TrendingPieces = () => (
    <View style={styles.productsContainer}>
      <View style={styles.emptyStateContainer}>
        <Ionicons name="trending-up" size={64} color={COLORS.gray500} />
        <Text style={styles.comingSoon}>Trend Parçalar Yakında!</Text>
        <Text style={styles.comingSoonSubtitle}>
          En popüler ürünler ve kombinler burada olacak.
        </Text>
      </View>
    </View>
  );

  // MENÜ İÇERİĞİ
  const renderMenuContent = () => (
    <Animated.View style={[styles.menuContent, { left: menuAnimation }]}>
      <View style={styles.menuHeader}>
        <Text style={styles.menuTitle}>Menü</Text>
        <TouchableOpacity onPress={toggleMenu}>
          <Ionicons name="close" size={24} color={COLORS.gray900} />
        </TouchableOpacity>
      </View>
      
      <ScrollView style={styles.menuItems} showsVerticalScrollIndicator={false}>
        <View style={styles.menuSection}>
          <Text style={styles.menuSectionTitle}>Keşfet</Text>
          <TouchableOpacity 
            style={[styles.menuItem, activeTab === 'fashion-feed' && styles.menuItemActive]}
            onPress={() => { setActiveTab('fashion-feed'); toggleMenu(); }}
          >
            <Ionicons name="podium" size={20} color={COLORS.blue} />
            <Text style={styles.menuItemText}>Moda Akışı</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.menuItem, activeTab === 'trending-pieces' && styles.menuItemActive]}
            onPress={() => { setActiveTab('trending-pieces'); toggleMenu(); }}
          >
            <Ionicons name="trending-up" size={20} color={COLORS.pink} />
            <Text style={styles.menuItemText}>Trend Parçalar</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.menuItem, activeTab === 'blogs' && styles.menuItemActive]}
            onPress={() => { setActiveTab('blogs'); toggleMenu(); }}
          >
            <Ionicons name="newspaper" size={20} color={COLORS.green} />
            <Text style={styles.menuItemText}>Bloglar & Yazılar</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.menuSection}>
          <Text style={styles.menuSectionTitle}>Ayarlar</Text>
          <TouchableOpacity style={styles.menuItem} onPress={() => { toggleMenu(); Alert.alert('Ayarlar', 'Ayarlar sayfası açılıyor...'); }}>
            <Ionicons name="settings-outline" size={20} color={COLORS.gray700} />
            <Text style={styles.menuItemText}>Ayarlar ve Gizlilik</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem} onPress={() => { toggleMenu(); Alert.alert('Yardım', 'Yardım merkezi açılıyor...'); }}>
            <Ionicons name="help-circle-outline" size={20} color={COLORS.gray700} />
            <Text style={styles.menuItemText}>Yardım Merkezi</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </Animated.View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
      
      <View style={styles.header}>
        <ThreeLineMenu onPress={toggleMenu} />
        <View style={styles.headerCenter}>
          <Text style={styles.logo}>PODIUM</Text>
          <Text style={styles.subtitle}>Fashion Universe</Text>
        </View>
        <TouchableOpacity style={styles.notificationButton} onPress={() => Alert.alert('Bildirimler', 'Bildirimler sayfası açılıyor...')}>
          <Ionicons name="notifications-outline" size={24} color={COLORS.charcoal} />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color={COLORS.gray500} />
          <TextInput
            style={styles.searchInput}
            placeholder="Moda, hashtag, kişi ara..."
            placeholderTextColor={COLORS.gray500}
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
            onSubmitEditing={() => Alert.alert('Arama', `"${searchQuery}" aranıyor...`)}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={18} color={COLORS.gray500} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabsContainer} contentContainerStyle={styles.tabsContent}>
        {[
          { id: 'fashion-feed', label: 'Moda Akışı' },
          { id: 'trending-pieces', label: 'Trend Parçalar' },
          { id: 'blogs', label: 'Bloglar & Yazılar' }
        ].map((tab) => (
          <TouchableOpacity
            key={tab.id}
            style={[styles.tabButton, activeTab === tab.id && styles.tabButtonActive]}
            onPress={() => setActiveTab(tab.id)}
          >
            <Text style={[styles.tabText, activeTab === tab.id && styles.tabTextActive]}>
              {tab.label}
            </Text>
            {activeTab === tab.id && <View style={styles.tabIndicator} />}
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.content}>
        {activeTab === 'fashion-feed' && <FashionFeed />}
        {activeTab === 'trending-pieces' && <TrendingPieces />}
        {activeTab === 'blogs' && <BlogsSection />}
      </View>

      {isMenuOpen && (
        <TouchableOpacity style={styles.menuOverlay} activeOpacity={1} onPress={toggleMenu} />
      )}
      
      {renderMenuContent()}

      <TouchableOpacity 
        style={styles.floatingButton}
        onPress={() => Alert.alert('Yeni Gönderi', 'Yeni gönderi oluşturma sayfası açılıyor...')}
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={24} color={COLORS.white} />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

// 🎨 STYLES
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white },
  content: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8 },
  headerCenter: { alignItems: 'center' },
  logo: { fontSize: 28, fontWeight: '700', color: COLORS.charcoal },
  subtitle: { fontSize: 12, color: COLORS.gray700, marginTop: -2 },
  notificationButton: { padding: 8 },
  searchContainer: { paddingHorizontal: 16, paddingVertical: 12 },
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.gray100, paddingHorizontal: 16, paddingVertical: 12, borderRadius: 24 },
  searchInput: { flex: 1, marginLeft: 12, fontSize: 16, color: COLORS.charcoal },
  tabsContainer: { maxHeight: 50, borderBottomWidth: 1, borderBottomColor: COLORS.gray200 },
  tabsContent: { paddingHorizontal: 16 },
  tabButton: { paddingHorizontal: 20, paddingVertical: 16, marginRight: 24, position: 'relative' },
  tabText: { fontSize: 15, fontWeight: '500', color: COLORS.gray700 },
  tabTextActive: { color: COLORS.charcoal, fontWeight: '700' },
  tabIndicator: { position: 'absolute', bottom: 0, left: 20, right: 20, height: 4, backgroundColor: COLORS.blue, borderRadius: 2 },
  feedContainer: { flex: 1 },
  section: { paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: COLORS.gray200 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, marginBottom: 16 },
  sectionTitle: { fontSize: 20, fontWeight: '700', color: COLORS.charcoal },
  seeAll: { fontSize: 15, color: COLORS.blue, fontWeight: '500' },
  hashtagList: { paddingHorizontal: 16 },
  tweetCard: { flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: COLORS.gray200 },
  avatar: { width: 48, height: 48, borderRadius: 24, marginRight: 12 },
  tweetContent: { flex: 1 },
  tweetHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 4, flexWrap: 'wrap' },
  tweetName: { fontSize: 15, fontWeight: '700', color: COLORS.charcoal, marginRight: 4 },
  tweetUsername: { fontSize: 15, color: COLORS.gray700, marginRight: 4 },
  tweetTime: { fontSize: 15, color: COLORS.gray700 },
  tweetText: { fontSize: 15, color: COLORS.charcoal, lineHeight: 20, marginBottom: 12 },
  tweetImage: { width: '100%', height: 200, borderRadius: 12, marginBottom: 12, backgroundColor: COLORS.gray100 },
  tweetActions: { flexDirection: 'row', justifyContent: 'space-between', maxWidth: 300 },
  tweetAction: { flexDirection: 'row', alignItems: 'center' },
  tweetActionCount: { fontSize: 13, color: COLORS.gray700, marginLeft: 4 },
  blogsContainer: { flex: 1 },
  authorsSection: { paddingTop: 24 },
  authorCard: { alignItems: 'center', backgroundColor: COLORS.gray50, padding: 16, borderRadius: 12, marginRight: 12, width: 120 },
  authorAvatar: { width: 60, height: 60, borderRadius: 30, marginBottom: 8 },
  authorName: { fontSize: 14, fontWeight: '600', color: COLORS.charcoal, marginBottom: 8, textAlign: 'center' },
  followAuthorButton: { backgroundColor: COLORS.charcoal, paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20 },
  followAuthorText: { fontSize: 13, fontWeight: '700', color: COLORS.white },
  menuOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 99 },
  menuContent: { position: 'absolute', top: 0, bottom: 0, width: 300, backgroundColor: COLORS.white, zIndex: 100, shadowColor: COLORS.charcoal, shadowOffset: { width: 2, height: 0 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 10 },
  menuHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: Platform.OS === 'android' ? 40 : 60, paddingBottom: 20, borderBottomWidth: 1, borderBottomColor: COLORS.gray200 },
  menuTitle: { fontSize: 32, fontWeight: '700', color: COLORS.charcoal },
  menuItems: { flex: 1 },
  menuSection: { paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: COLORS.gray200 },
  menuSectionTitle: { fontSize: 13, fontWeight: '700', color: COLORS.gray700, textTransform: 'uppercase', letterSpacing: 0.5, paddingHorizontal: 20, marginBottom: 12 },
  menuItem: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16 },
  menuItemActive: { backgroundColor: COLORS.gray100, borderLeftWidth: 4, borderLeftColor: COLORS.blue },
  menuItemText: { fontSize: 16, fontWeight: '500', color: COLORS.charcoal, marginLeft: 16 },
  productsContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyStateContainer: { alignItems: 'center', padding: 40 },
  comingSoon: { fontSize: 24, fontWeight: '700', color: COLORS.charcoal, marginTop: 20, marginBottom: 10 },
  comingSoonSubtitle: { fontSize: 16, color: COLORS.gray700, textAlign: 'center', lineHeight: 22 },
  floatingButton: { position: 'absolute', bottom: 24, right: 24, width: 56, height: 56, borderRadius: 28, backgroundColor: COLORS.blue, justifyContent: 'center', alignItems: 'center', shadowColor: COLORS.charcoal, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 8, zIndex: 98 },
});

const menuStyles = StyleSheet.create({
  container: { padding: 8 },
  line: { width: 24, height: 2, backgroundColor: COLORS.charcoal, marginVertical: 2, borderRadius: 1 },
});

const hashtagStyles = StyleSheet.create({
  card: { backgroundColor: COLORS.gray50, padding: 16, borderRadius: 12, width: 280, borderWidth: 1, borderColor: COLORS.gray200 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  trendingText: { fontSize: 13, color: COLORS.gray700, marginBottom: 2 },
  hashtag: { fontSize: 18, fontWeight: '700', color: COLORS.charcoal, marginBottom: 4 },
  tweets: { fontSize: 14, color: COLORS.gray700 },
  followButton: { backgroundColor: COLORS.charcoal, paddingHorizontal: 20, paddingVertical: 8, borderRadius: 20, minWidth: 80, alignItems: 'center' },
  followingButton: { backgroundColor: COLORS.gray200 },
  followText: { fontSize: 14, fontWeight: '700', color: COLORS.white },
  followingText: { color: COLORS.charcoal },
  trendingInfo: { flexDirection: 'row', alignItems: 'center' },
  trendingStats: { fontSize: 14, fontWeight: '600', color: COLORS.blue, marginLeft: 6 },
});

const blogStyles = StyleSheet.create({
  card: { backgroundColor: COLORS.white, borderRadius: 12, overflow: 'hidden', borderWidth: 1, borderColor: COLORS.gray200 },
  image: { width: '100%', height: 180, backgroundColor: COLORS.gray100 },
  content: { padding: 16 },
  title: { fontSize: 18, fontWeight: '700', color: COLORS.charcoal, marginBottom: 8, lineHeight: 24 },
  excerpt: { fontSize: 15, color: COLORS.gray700, lineHeight: 20, marginBottom: 16 },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  author: { fontSize: 14, color: COLORS.gray700 },
  stats: { flexDirection: 'row' },
  stat: { flexDirection: 'row', alignItems: 'center', marginLeft: 16 },
  statText: { fontSize: 14, color: COLORS.gray700, marginLeft: 4 },
});

export default PodiumScreen;