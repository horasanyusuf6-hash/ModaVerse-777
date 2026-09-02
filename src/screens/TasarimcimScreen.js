// 📁 src/screens/TasarimcimScreen.js - REVİZE (AI Kartı Doğru Yönlendirme)
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  StatusBar,
  ScrollView,
  Image,
  TouchableOpacity,
  FlatList,
  TextInput,
  Dimensions,
  Modal,
  Alert,
  RefreshControl,
  ActivityIndicator,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, TYPOGRAPHY, SIZES } from '../constants/Theme';

const { width, height } = Dimensions.get('window');

// KATEGORİLER
const CATEGORIES = [
  { id: 'all', name: 'TÜMÜ', icon: 'grid-outline' },
  { id: 'luxury', name: 'LÜKS', icon: 'diamond-outline' },
  { id: 'streetwear', name: 'STREETWEAR', icon: 'walk-outline' },
  { id: 'sustainable', name: 'SÜRDÜRÜLEBİLİR', icon: 'leaf-outline' },
  { id: 'minimalist', name: 'MİNİMALİST', icon: 'apps-outline' },
  { id: 'vintage', name: 'VİNTAGE', icon: 'time-outline' },
  { id: 'sport', name: 'SPOR', icon: 'basketball-outline' },
];

// AI İSTATİSTİKLERİ
const AI_STATS = {
  analyses: 1247,
  combinations: 89,
  matchRate: 94,
  savedItems: 342,
  outfitsCreated: 56,
};

// TASARIMCILAR & MARKALAR
const designersAndBrands = [
  {
    id: '1',
    type: 'designer',
    name: 'Zeynep Ak',
    title: 'Sürdürülebilir Moda Tasarımcısı',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400',
    cover: 'https://images.unsplash.com/photo-1539008835657-9e8e9680c956?w=800',
    followers: 12500,
    followersDisplay: '12.5K',
    rating: 4.8,
    location: 'İstanbul',
    description: 'Sürdürülebilir ve etik moda üzerine çalışan ödüllü tasarımcı.',
    isVerified: true,
    trending: 98,
    category: 'sustainable',
    designs: [
      { id: 'd1', image: 'https://images.unsplash.com/photo-1569317002804-ab77bcf1bce4?w=600', title: 'Eko-Koleksiyon 2024', likes: 3420, comments: 156 },
      { id: 'd2', image: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600', title: 'Sonbahar Tasarımı', likes: 2890, comments: 98 },
      { id: 'd3', image: 'https://images.unsplash.com/photo-1539008835657-9e8e9680c956?w=600', title: 'Paris Moda Haftası', likes: 5670, comments: 234 },
    ],
  },
  {
    id: '2',
    type: 'brand',
    name: 'Nike',
    title: 'Spor Giyim & Sneaker',
    avatar: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400',
    cover: 'https://images.unsplash.com/photo-1544441893-973675e31985?w=800',
    followers: 2100000,
    followersDisplay: '2.1M',
    rating: 4.7,
    location: 'Global',
    description: 'Dünyanın önde gelen spor giyim ve ayakkabı markası.',
    isVerified: true,
    trending: 95,
    category: 'sport',
    designs: [
      { id: 'd1', image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600', title: 'Air Max Günleri', likes: 8920, comments: 456 },
      { id: 'd2', image: 'https://images.unsplash.com/photo-1544441893-973675e31985?w=600', title: 'Jordan Koleksiyonu', likes: 12400, comments: 892 },
      { id: 'd3', image: 'https://images.unsplash.com/photo-1556906781-9a412961c28c?w=600', title: 'Tech Fleece Serisi', likes: 5670, comments: 234 },
    ],
  },
  {
    id: '3',
    type: 'designer',
    name: 'Can Demir',
    title: 'Street Style Tasarımcısı',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
    cover: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800',
    followers: 8700,
    followersDisplay: '8.7K',
    rating: 4.6,
    location: 'İstanbul',
    description: 'Urban kültürden ilham alan genç tasarımcı.',
    isVerified: false,
    trending: 92,
    category: 'streetwear',
    designs: [
      { id: 'd1', image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=600', title: 'Urban Warriors', likes: 2340, comments: 89 },
      { id: 'd2', image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600', title: 'Street Collection', likes: 1890, comments: 67 },
      { id: 'd3', image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=600', title: 'City Lights', likes: 1230, comments: 45 },
    ],
  },
  {
    id: '4',
    type: 'brand',
    name: 'ZARA',
    title: 'Fast Fashion',
    avatar: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=400',
    cover: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800',
    followers: 3400000,
    followersDisplay: '3.4M',
    rating: 4.5,
    location: 'Global',
    description: 'Trendleri hızlı şekilde tüketiciye ulaştıran global marka.',
    isVerified: true,
    trending: 88,
    category: 'luxury',
    designs: [
      { id: 'd1', image: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600', title: 'Sonbahar Koleksiyonu', likes: 12400, comments: 892 },
      { id: 'd2', image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600', title: 'Yeni Sezon', likes: 8900, comments: 456 },
      { id: 'd3', image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=600', title: 'Basic Serisi', likes: 5670, comments: 234 },
    ],
  },
  {
    id: '5',
    type: 'designer',
    name: 'Elif Şahin',
    title: 'Lüks Giyim Tasarımcısı',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400',
    cover: 'https://images.unsplash.com/photo-1534452203293-494d7ddbf7e0?w=800',
    followers: 15200,
    followersDisplay: '15.2K',
    rating: 4.9,
    location: 'Paris',
    description: 'Paris merkezli lüks giyim ve haute couture tasarımcısı.',
    isVerified: true,
    trending: 96,
    category: 'luxury',
    designs: [
      { id: 'd1', image: 'https://images.unsplash.com/photo-1539008835657-9e8e9680c956?w=600', title: 'Parisian Nights', likes: 5670, comments: 234 },
      { id: 'd2', image: 'https://images.unsplash.com/photo-1534452203293-494d7ddbf7e0?w=600', title: 'Haute Couture', likes: 4320, comments: 178 },
      { id: 'd3', image: 'https://images.unsplash.com/photo-1539008835657-9e8e9680c956?w=600', title: 'Golden Collection', likes: 3210, comments: 123 },
    ],
  },
  {
    id: '6',
    type: 'brand',
    name: 'Mango',
    title: 'Minimalist Moda',
    avatar: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=400',
    cover: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800',
    followers: 2800000,
    followersDisplay: '2.8M',
    rating: 4.6,
    location: 'Barcelona',
    description: 'Minimalist ve şık tasarımlarıyla bilinen marka.',
    isVerified: true,
    trending: 85,
    category: 'minimalist',
    designs: [
      { id: 'd1', image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600', title: 'Minimalist Collection', likes: 3450, comments: 123 },
      { id: 'd2', image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600', title: 'Neutral Tones', likes: 2780, comments: 98 },
      { id: 'd3', image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600', title: 'Capsule Wardrobe', likes: 1890, comments: 67 },
    ],
  },
  {
    id: '7',
    type: 'brand',
    name: 'Adidas',
    title: 'Sport Performance',
    avatar: 'https://images.unsplash.com/photo-1587563871167-1ee9c731aefb?w=400',
    cover: 'https://images.unsplash.com/photo-1556906781-9a412961c28c?w=800',
    followers: 5600000,
    followersDisplay: '5.6M',
    rating: 4.8,
    location: 'Germany',
    description: 'Spor performans ve günlük giyimde lider marka.',
    isVerified: true,
    trending: 94,
    category: 'sport',
    designs: [
      { id: 'd1', image: 'https://images.unsplash.com/photo-1587563871167-1ee9c731aefb?w=600', title: 'Ultraboost 2024', likes: 8920, comments: 567 },
      { id: 'd2', image: 'https://images.unsplash.com/photo-1556906781-9a412961c28c?w=600', title: 'Originals Serisi', likes: 6780, comments: 345 },
      { id: 'd3', image: 'https://images.unsplash.com/photo-1587563871167-1ee9c731aefb?w=600', title: 'Yeezy Koleksiyonu', likes: 12340, comments: 890 },
    ],
  },
];

// ============ AI DANIŞMAN KARTI (REVİZE - DOĞRU YÖNLENDİRME) ============
const AIConsultantCard = ({ navigation }) => {
  const [aiStats] = useState(AI_STATS);

  const formatNumber = (num) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  return (
    <TouchableOpacity 
      style={styles.aiCard}
      activeOpacity={0.7}
      onPress={() => {
        // ✅ DOĞRU YÖNLENDİRME - Stilim tab'ına ve OutfitSuggestion ekranına git
        navigation.navigate('Stilim', { 
          screen: 'OutfitSuggestion' 
        });
      }}
    >
      <Image 
        source={{ uri: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=800' }} 
        style={styles.aiCoverImage} 
      />
      <View style={styles.aiOverlay} />
      <View style={styles.aiContent}>
        <View style={styles.aiHeader}>
          <View style={styles.aiTitleContainer}>
            <Text style={styles.aiTitle}>AI STİL DANIŞMANIM</Text>
            <View style={styles.aiBadge}>
              <Ionicons name="sparkles" size={10} color={COLORS.white} />
              <Text style={styles.aiBadgeText}>AKTİF</Text>
            </View>
          </View>
          <View style={styles.aiArrowContainer}>
            <Ionicons name="arrow-forward" size={16} color={COLORS.white} />
          </View>
        </View>
        
        <Text style={styles.aiSlogan}>💬 "Stil danışmanınla sohbet et, kombinlerini keşfet!"</Text>
        
        <View style={styles.aiStatsGrid}>
          <View style={styles.aiStatCard}>
            <View style={styles.aiStatIconBg}>
              <Ionicons name="shirt-outline" size={14} color={COLORS.black} />
            </View>
            <Text style={styles.aiStatNumber}>{formatNumber(aiStats.analyses)}</Text>
            <Text style={styles.aiStatLabel}>PARÇA</Text>
          </View>
          
          <View style={styles.aiStatCard}>
            <View style={styles.aiStatIconBg}>
              <Ionicons name="color-palette-outline" size={14} color={COLORS.black} />
            </View>
            <Text style={styles.aiStatNumber}>{formatNumber(aiStats.combinations)}</Text>
            <Text style={styles.aiStatLabel}>KOMBİN</Text>
          </View>
          
          <View style={styles.aiStatCard}>
            <View style={styles.aiStatIconBg}>
              <Ionicons name="save-outline" size={14} color={COLORS.black} />
            </View>
            <Text style={styles.aiStatNumber}>{formatNumber(aiStats.savedItems)}</Text>
            <Text style={styles.aiStatLabel}>GARDIROP</Text>
          </View>
          
          <View style={styles.aiStatCard}>
            <View style={styles.aiStatIconBg}>
              <Ionicons name="trending-up" size={14} color={COLORS.black} />
            </View>
            <Text style={styles.aiStatNumber}>%{aiStats.matchRate}</Text>
            <Text style={styles.aiStatLabel}>UYUM</Text>
          </View>
        </View>
        
        <View style={styles.aiButton}>
          <Ionicons name="chatbubble-ellipses" size={12} color={COLORS.white} />
          <Text style={styles.aiButtonText}>SOHBET ET</Text>
          <Ionicons name="arrow-forward" size={10} color={COLORS.white} />
        </View>
      </View>
    </TouchableOpacity>
  );
};

// ============ TASARIMCI/MARKA KARTI ============
const DesignerBrandCard = ({ item, onPress, onFollow, isFollowing }) => {
  const [showAllDesigns, setShowAllDesigns] = useState(false);
  const displayDesigns = showAllDesigns ? item.designs : item.designs.slice(0, 2);

  const formatNumber = (num) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  return (
    <View style={styles.designerCard}>
      <TouchableOpacity style={styles.cardHeader} onPress={() => onPress(item)} activeOpacity={0.7}>
        <Image source={{ uri: item.avatar }} style={styles.cardAvatar} />
        <View style={styles.cardUserInfo}>
          <View style={styles.cardNameRow}>
            <Text style={styles.cardName}>{item.name}</Text>
            {item.isVerified && (
              <Ionicons name="checkmark-circle" size={12} color={COLORS.black} />
            )}
            <View style={styles.cardTypeBadge}>
              <Text style={styles.cardTypeBadgeText}>
                {item.type === 'designer' ? 'TASARIMCI' : 'MARKA'}
              </Text>
            </View>
          </View>
          <Text style={styles.cardTitle}>{item.title}</Text>
          <View style={styles.cardStats}>
            <View style={styles.cardStat}>
              <Ionicons name="people-outline" size={10} color={COLORS.grayMedium} />
              <Text style={styles.cardStatText}>{item.followersDisplay}</Text>
            </View>
            <View style={styles.cardStat}>
              <Ionicons name="star-outline" size={10} color={COLORS.grayMedium} />
              <Text style={styles.cardStatText}>{item.rating}</Text>
            </View>
            <View style={styles.cardStat}>
              <Ionicons name="location-outline" size={10} color={COLORS.grayMedium} />
              <Text style={styles.cardStatText}>{item.location}</Text>
            </View>
          </View>
        </View>
        <TouchableOpacity 
          style={[styles.followButton, isFollowing && styles.followButtonActive]}
          onPress={() => onFollow(item.id)}
        >
          <Text style={[styles.followButtonText, isFollowing && styles.followButtonTextActive]}>
            {isFollowing ? 'TAKİP' : 'TAKİP ET'}
          </Text>
        </TouchableOpacity>
      </TouchableOpacity>

      {item.designs && item.designs.length > 0 && (
        <View style={styles.designsSection}>
          <View style={styles.designsHeader}>
            <Text style={styles.designsTitle}>
              {item.type === 'designer' ? 'SON TASARIMLAR' : 'SON KOLEKSİYONLAR'}
            </Text>
            {item.designs.length > 2 && (
              <TouchableOpacity onPress={() => setShowAllDesigns(!showAllDesigns)}>
                <Text style={styles.designsSeeAll}>
                  {showAllDesigns ? 'DAHA AZ' : 'TÜMÜ'}
                </Text>
              </TouchableOpacity>
            )}
          </View>
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.designsScroll}>
            {displayDesigns.map((design, idx) => (
              <TouchableOpacity key={idx} style={styles.designCard} activeOpacity={0.7}>
                <Image source={{ uri: design.image }} style={styles.designImage} />
                <View style={styles.designOverlay}>
                  <Text style={styles.designTitle} numberOfLines={1}>{design.title}</Text>
                  <View style={styles.designStats}>
                    <View style={styles.designStat}>
                      <Ionicons name="heart-outline" size={8} color={COLORS.white} />
                      <Text style={styles.designStatText}>{formatNumber(design.likes)}</Text>
                    </View>
                    <View style={styles.designStat}>
                      <Ionicons name="chatbubble-outline" size={8} color={COLORS.white} />
                      <Text style={styles.designStatText}>{formatNumber(design.comments)}</Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
};

// ============ KATEGORİ FİLTRELEME ============
const CategoryFilters = ({ selectedCategory, onSelectCategory }) => {
  return (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false} 
      style={styles.categoriesScroll}
      contentContainerStyle={styles.categoriesContent}
    >
      {CATEGORIES.map((category) => (
        <TouchableOpacity
          key={category.id}
          style={[styles.categoryChip, selectedCategory === category.id && styles.categoryChipActive]}
          onPress={() => onSelectCategory(category.id)}
        >
          <Ionicons 
            name={category.icon} 
            size={12} 
            color={selectedCategory === category.id ? COLORS.white : COLORS.grayMedium} 
          />
          <Text style={[styles.categoryChipText, selectedCategory === category.id && styles.categoryChipTextActive]}>
            {category.name}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};

// ============ TREND BÖLÜMÜ ============
const TrendingSection = ({ items, onPress, onFollow, following, type }) => {
  return (
    <View style={styles.trendingSection}>
      <View style={styles.trendingHeader}>
        <Text style={styles.trendingTitle}>
          TREND {type === 'designer' ? 'TASARIMCILAR' : 'MARKALAR'}
        </Text>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.trendingScroll}>
        {items.map((item) => (
          <TouchableOpacity 
            key={item.id} 
            style={styles.trendingCard}
            onPress={() => onPress(item)}
            activeOpacity={0.7}
          >
            <Image source={{ uri: item.avatar }} style={styles.trendingAvatar} />
            <Text style={styles.trendingName} numberOfLines={1}>{item.name}</Text>
            <Text style={styles.trendingTitleText} numberOfLines={1}>{item.title}</Text>
            <View style={styles.trendingTrend}>
              <Ionicons name="trending-up" size={8} color={COLORS.grayMedium} />
              <Text style={styles.trendingPercent}>%{item.trending}</Text>
            </View>
            <TouchableOpacity 
              style={[styles.trendingFollowBtn, following.includes(item.id) && styles.trendingFollowBtnActive]}
              onPress={() => onFollow(item.id)}
            >
              <Text style={[styles.trendingFollowBtnText, following.includes(item.id) && styles.trendingFollowBtnTextActive]}>
                {following.includes(item.id) ? 'TAKİP' : 'TAKİP ET'}
              </Text>
            </TouchableOpacity>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

// ============ ANA BİLEŞEN ============
const TasarimcimScreen = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('designers');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedItem, setSelectedItem] = useState(null);
  const [following, setFollowing] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [displayData, setDisplayData] = useState([]);
  const pageSize = 5;
  
  const flatListRef = useRef(null);

  useEffect(() => {
    loadFollowing();
  }, []);

  useEffect(() => {
    updateDisplayData();
  }, [searchQuery, selectedCategory, activeTab, following, page]);

  const loadFollowing = async () => {
    try {
      const saved = await AsyncStorage.getItem('@following_designers');
      const followingList = saved ? JSON.parse(saved) : [];
      setFollowing(followingList);
    } catch (error) {
      console.error(error);
    }
  };

  const saveFollowing = async (followingList) => {
    try {
      await AsyncStorage.setItem('@following_designers', JSON.stringify(followingList));
    } catch (error) {
      console.error(error);
    }
  };

  const getFilteredData = () => {
    let filtered = designersAndBrands.filter(item => item.type === activeTab);
    
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(item => item.category === selectedCategory);
    }
    
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(item => 
        item.name.toLowerCase().includes(query) ||
        item.title.toLowerCase().includes(query) ||
        item.location.toLowerCase().includes(query)
      );
    }
    
    filtered.sort((a, b) => b.trending - a.trending);
    return filtered;
  };

  const updateDisplayData = () => {
    const filtered = getFilteredData();
    setDisplayData(filtered.slice(0, page * pageSize));
  };

  const loadMoreData = () => {
    if (isLoadingMore) return;
    const filtered = getFilteredData();
    if (page * pageSize < filtered.length) {
      setIsLoadingMore(true);
      setTimeout(() => {
        setPage(prev => prev + 1);
        setIsLoadingMore(false);
      }, 500);
    }
  };

  const handleFollow = async (itemId) => {
    const isCurrentlyFollowing = following.includes(itemId);
    const newFollowing = isCurrentlyFollowing
      ? following.filter(id => id !== itemId)
      : [...following, itemId];
    
    setFollowing(newFollowing);
    await saveFollowing(newFollowing);
    
    const item = designersAndBrands.find(d => d.id === itemId);
    Alert.alert(
      isCurrentlyFollowing ? 'Takip Bırakıldı' : 'Takip Ediliyor',
      `${item?.name || 'Kullanıcı'} artık ${isCurrentlyFollowing ? 'takip etmiyorsunuz' : 'takip ediyorsunuz'}.`
    );
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    setPage(1);
    await loadFollowing();
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  const handleCategorySelect = (categoryId) => {
    setSelectedCategory(categoryId);
    setPage(1);
    flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
  };

  const getTrendingItems = () => {
    return designersAndBrands
      .filter(item => item.type === activeTab)
      .sort((a, b) => b.trending - a.trending)
      .slice(0, 5);
  };

  const EmptyState = () => {
    const hasFilters = searchQuery || selectedCategory !== 'all';
    return (
      <View style={styles.emptyContainer}>
        <View style={styles.emptyIconContainer}>
          <Ionicons name="search-outline" size={32} color={COLORS.grayMedium} />
        </View>
        <Text style={styles.emptyTitle}>SONUÇ BULUNAMADI</Text>
        <Text style={styles.emptyText}>
          {searchQuery ? `"${searchQuery}" ile eşleşen ${activeTab === 'designers' ? 'tasarımcı' : 'marka'} yok` : 
           selectedCategory !== 'all' ? `Bu kategoride ${activeTab === 'designers' ? 'tasarımcı' : 'marka'} yok` :
           `${activeTab === 'designers' ? 'Tasarımcı' : 'Marka'} bulunamadı`}
        </Text>
        {hasFilters && (
          <TouchableOpacity 
            style={styles.clearButton} 
            onPress={() => {
              setSearchQuery('');
              setSelectedCategory('all');
            }}
          >
            <Text style={styles.clearButtonText}>FİLTRELERİ TEMİZLE</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const DesignerDetailModal = () => {
    if (!selectedItem) return null;
    
    return (
      <Modal
        visible={!!selectedItem}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setSelectedItem(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.modalHeader}>
                <Image source={{ uri: selectedItem.cover }} style={styles.modalCover} />
                <TouchableOpacity style={styles.closeButton} onPress={() => setSelectedItem(null)}>
                  <Ionicons name="close" size={20} color={COLORS.white} />
                </TouchableOpacity>
                <View style={styles.modalProfile}>
                  <Image source={{ uri: selectedItem.avatar }} style={styles.modalAvatar} />
                  <View style={styles.modalProfileInfo}>
                    <Text style={styles.modalName}>{selectedItem.name}</Text>
                    <Text style={styles.modalTitle}>{selectedItem.title}</Text>
                  </View>
                </View>
              </View>
              <View style={styles.modalContent}>
                <Text style={styles.modalDescription}>{selectedItem.description}</Text>
                <View style={styles.modalStats}>
                  <View style={styles.modalStat}>
                    <Text style={styles.modalStatNumber}>{selectedItem.followersDisplay}</Text>
                    <Text style={styles.modalStatLabel}>TAKİPÇİ</Text>
                  </View>
                  <View style={styles.modalStatDivider} />
                  <View style={styles.modalStat}>
                    <Text style={styles.modalStatNumber}>{selectedItem.rating}</Text>
                    <Text style={styles.modalStatLabel}>PUAN</Text>
                  </View>
                </View>
                
                {selectedItem.designs && selectedItem.designs.length > 0 && (
                  <View style={styles.modalDesignsSection}>
                    <Text style={styles.modalDesignsTitle}>
                      {selectedItem.type === 'designer' ? 'TASARIMLARIM' : 'KOLEKSİYONLARIM'}
                    </Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                      {selectedItem.designs.map((design, idx) => (
                        <TouchableOpacity key={idx} style={styles.modalDesignCard}>
                          <Image source={{ uri: design.image }} style={styles.modalDesignImage} />
                          <Text style={styles.modalDesignTitle}>{design.title}</Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                )}
                
                <TouchableOpacity 
                  style={[styles.modalFollowButton, following.includes(selectedItem.id) && styles.modalFollowButtonActive]}
                  onPress={() => {
                    handleFollow(selectedItem.id);
                    setSelectedItem(null);
                  }}
                >
                  <Text style={[styles.modalFollowText, following.includes(selectedItem.id) && styles.modalFollowTextActive]}>
                    {following.includes(selectedItem.id) ? 'TAKİP EDİLİYOR' : 'TAKİP ET'}
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    );
  };

  const ListHeader = () => (
    <>
      <AIConsultantCard navigation={navigation} />

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'designers' && styles.tabButtonActive]}
          onPress={() => {
            setActiveTab('designers');
            setPage(1);
            flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
          }}
        >
          <Ionicons name="person" size={14} color={activeTab === 'designers' ? COLORS.white : COLORS.grayMedium} />
          <Text style={[styles.tabButtonText, activeTab === 'designers' && styles.tabButtonTextActive]}>
            TASARIMCILAR
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'brands' && styles.tabButtonActive]}
          onPress={() => {
            setActiveTab('brands');
            setPage(1);
            flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
          }}
        >
          <Ionicons name="business" size={14} color={activeTab === 'brands' ? COLORS.white : COLORS.grayMedium} />
          <Text style={[styles.tabButtonText, activeTab === 'brands' && styles.tabButtonTextActive]}>
            MARKALAR
          </Text>
        </TouchableOpacity>
      </View>

      <CategoryFilters selectedCategory={selectedCategory} onSelectCategory={handleCategorySelect} />

      <TrendingSection 
        items={getTrendingItems()}
        onPress={setSelectedItem}
        onFollow={handleFollow}
        following={following}
        type={activeTab}
      />
    </>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
      
      <View style={styles.header}>
        <Text style={styles.logoText}>TASARIMCIM</Text>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={16} color={COLORS.grayMedium} />
          <TextInput
            style={styles.searchInput}
            placeholder="Tasarımcı veya marka ara..."
            placeholderTextColor={COLORS.grayMedium}
            value={searchQuery}
            onChangeText={(text) => {
              setSearchQuery(text);
              setPage(1);
            }}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={14} color={COLORS.grayMedium} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <FlatList
        ref={flatListRef}
        data={displayData}
        renderItem={({ item }) => (
          <DesignerBrandCard
            item={item}
            onPress={setSelectedItem}
            onFollow={handleFollow}
            isFollowing={following.includes(item.id)}
          />
        )}
        keyExtractor={item => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.black} />}
        onEndReached={loadMoreData}
        onEndReachedThreshold={0.3}
        ListHeaderComponent={ListHeader}
        ListEmptyComponent={EmptyState}
        ListFooterComponent={
          isLoadingMore && (
            <View style={styles.loadingMore}>
              <ActivityIndicator size="small" color={COLORS.black} />
              <Text style={styles.loadingMoreText}>YÜKLENİYOR...</Text>
            </View>
          )
        }
      />

      <DesignerDetailModal />
    </SafeAreaView>
  );
};

// ============ STILLER ============
const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: COLORS.white 
  },
  
  header: { 
    paddingHorizontal: SIZES.lg, 
    paddingTop: Platform.OS === 'ios' ? 12 : SIZES.md, 
    paddingBottom: SIZES.xs 
  },
  logoText: { 
    ...TYPOGRAPHY.caption,
    fontSize: 16,
    letterSpacing: 2,
  },
  
  searchContainer: { 
    paddingHorizontal: SIZES.lg, 
    paddingVertical: SIZES.md 
  },
  searchBar: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    borderWidth: 0.5, 
    borderColor: COLORS.grayLight, 
    paddingHorizontal: SIZES.md, 
    paddingVertical: SIZES.sm 
  },
  searchInput: { 
    flex: 1, 
    marginLeft: SIZES.sm, 
    ...TYPOGRAPHY.body,
    color: COLORS.black 
  },
  
  listContent: { 
    paddingBottom: 100 
  },
  
  aiCard: { 
    marginHorizontal: SIZES.lg, 
    marginBottom: SIZES.lg, 
    borderWidth: 0.5, 
    borderColor: COLORS.grayLight, 
    overflow: 'hidden' 
  },
  aiCoverImage: { 
    width: '100%', 
    height: 200, 
    resizeMode: 'cover' 
  },
  aiOverlay: { 
    ...StyleSheet.absoluteFillObject, 
    backgroundColor: 'rgba(0,0,0,0.4)' 
  },
  aiContent: { 
    padding: SIZES.md 
  },
  aiHeader: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    marginBottom: 4 
  },
  aiTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  aiTitle: { 
    ...TYPOGRAPHY.caption,
    fontSize: 11,
    color: COLORS.white 
  },
  aiBadge: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    borderWidth: 0.5,
    borderColor: COLORS.white,
    paddingHorizontal: SIZES.xs, 
    paddingVertical: 2, 
    gap: 2 
  },
  aiBadgeText: { 
    ...TYPOGRAPHY.caption,
    fontSize: 8,
    color: COLORS.white 
  },
  aiArrowContainer: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  aiSlogan: { 
    ...TYPOGRAPHY.caption,
    fontSize: 9,
    color: COLORS.white, 
    opacity: 0.8, 
    marginBottom: SIZES.md, 
    fontStyle: 'italic' 
  },
  aiStatsGrid: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    gap: SIZES.sm, 
    marginBottom: SIZES.md 
  },
  aiStatCard: { 
    flex: 1, 
    minWidth: '22%', 
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.3)',
    padding: SIZES.xs, 
    alignItems: 'center' 
  },
  aiStatIconBg: { 
    width: 28, 
    height: 28, 
    backgroundColor: COLORS.white, 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginBottom: 2 
  },
  aiStatNumber: { 
    ...TYPOGRAPHY.caption,
    fontSize: 10,
    color: COLORS.white, 
    marginBottom: 2 
  },
  aiStatLabel: { 
    ...TYPOGRAPHY.caption,
    fontSize: 7,
    color: COLORS.white, 
    opacity: 0.7 
  },
  aiButton: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    backgroundColor: COLORS.cognac,
    paddingVertical: SIZES.sm, 
    gap: 4,
    borderRadius: 20,
  },
  aiButtonText: { 
    ...TYPOGRAPHY.caption,
    fontSize: 9,
    color: COLORS.white 
  },
  
  tabContainer: { 
    flexDirection: 'row', 
    marginHorizontal: SIZES.lg, 
    marginBottom: SIZES.md, 
    borderWidth: 0.5, 
    borderColor: COLORS.grayLight 
  },
  tabButton: { 
    flex: 1, 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    paddingVertical: SIZES.sm, 
    gap: 4, 
    backgroundColor: COLORS.white 
  },
  tabButtonActive: { 
    backgroundColor: COLORS.black 
  },
  tabButtonText: { 
    ...TYPOGRAPHY.caption,
    fontSize: 10,
    color: COLORS.grayMedium 
  },
  tabButtonTextActive: { 
    color: COLORS.white 
  },
  
  categoriesScroll: { 
    marginBottom: SIZES.md 
  },
  categoriesContent: { 
    paddingHorizontal: SIZES.lg, 
    gap: SIZES.sm 
  },
  categoryChip: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    borderWidth: 0.5, 
    borderColor: COLORS.grayLight, 
    paddingHorizontal: SIZES.md, 
    paddingVertical: 4, 
    gap: 4 
  },
  categoryChipActive: { 
    backgroundColor: COLORS.black,
    borderColor: COLORS.black,
  },
  categoryChipText: { 
    ...TYPOGRAPHY.caption,
    fontSize: 9,
    color: COLORS.grayMedium 
  },
  categoryChipTextActive: { 
    color: COLORS.white 
  },
  
  trendingSection: { 
    marginBottom: SIZES.lg 
  },
  trendingHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingHorizontal: SIZES.lg, 
    marginBottom: SIZES.md 
  },
  trendingTitle: { 
    ...TYPOGRAPHY.caption,
    fontSize: 10,
  },
  trendingScroll: { 
    paddingLeft: SIZES.lg 
  },
  trendingCard: { 
    width: 110, 
    borderWidth: 0.5, 
    borderColor: COLORS.grayLight, 
    padding: SIZES.sm, 
    marginRight: SIZES.sm, 
    alignItems: 'center' 
  },
  trendingAvatar: { 
    width: 48, 
    height: 48, 
    borderWidth: 0.5,
    borderColor: COLORS.grayLight,
    marginBottom: 4 
  },
  trendingName: { 
    ...TYPOGRAPHY.bodySmall,
    fontWeight: '500', 
    marginBottom: 2, 
    textAlign: 'center' 
  },
  trendingTitleText: { 
    ...TYPOGRAPHY.caption,
    fontSize: 8,
    color: COLORS.grayMedium, 
    marginBottom: 4, 
    textAlign: 'center' 
  },
  trendingTrend: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 2, 
    marginBottom: 4 
  },
  trendingPercent: { 
    ...TYPOGRAPHY.caption,
    fontSize: 8,
    color: COLORS.grayMedium 
  },
  trendingFollowBtn: { 
    borderWidth: 0.5, 
    borderColor: COLORS.grayLight, 
    paddingHorizontal: SIZES.sm, 
    paddingVertical: 2 
  },
  trendingFollowBtnActive: { 
    backgroundColor: COLORS.black,
    borderColor: COLORS.black,
  },
  trendingFollowBtnText: { 
    ...TYPOGRAPHY.caption,
    fontSize: 7,
    color: COLORS.black 
  },
  trendingFollowBtnTextActive: { 
    color: COLORS.white 
  },
  
  designerCard: { 
    marginHorizontal: SIZES.lg, 
    marginBottom: SIZES.md, 
    borderWidth: 0.5, 
    borderColor: COLORS.grayLight, 
  },
  cardHeader: { 
    flexDirection: 'row', 
    padding: SIZES.md, 
    gap: SIZES.md 
  },
  cardAvatar: { 
    width: 48, 
    height: 48, 
    borderWidth: 0.5,
    borderColor: COLORS.grayLight,
    backgroundColor: COLORS.surface 
  },
  cardUserInfo: { 
    flex: 1 
  },
  cardNameRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    flexWrap: 'wrap', 
    gap: 4, 
    marginBottom: 2 
  },
  cardName: { 
    ...TYPOGRAPHY.body,
    fontWeight: '500', 
  },
  cardTypeBadge: { 
    borderWidth: 0.5, 
    borderColor: COLORS.grayLight, 
    paddingHorizontal: 4, 
    paddingVertical: 1 
  },
  cardTypeBadgeText: { 
    ...TYPOGRAPHY.caption,
    fontSize: 7,
    color: COLORS.grayMedium 
  },
  cardTitle: { 
    ...TYPOGRAPHY.caption,
    fontSize: 9,
    color: COLORS.grayMedium, 
    marginBottom: 4 
  },
  cardStats: { 
    flexDirection: 'row', 
    gap: SIZES.md 
  },
  cardStat: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 2 
  },
  cardStatText: { 
    ...TYPOGRAPHY.caption,
    fontSize: 8,
    color: COLORS.grayMedium 
  },
  followButton: { 
    borderWidth: 0.5, 
    borderColor: COLORS.grayLight, 
    paddingHorizontal: SIZES.md, 
    paddingVertical: 4, 
    alignSelf: 'flex-start' 
  },
  followButtonActive: { 
    backgroundColor: COLORS.black,
    borderColor: COLORS.black,
  },
  followButtonText: { 
    ...TYPOGRAPHY.caption,
    fontSize: 9,
    color: COLORS.black 
  },
  followButtonTextActive: { 
    color: COLORS.white 
  },
  
  designsSection: { 
    paddingHorizontal: SIZES.md, 
    paddingBottom: SIZES.md 
  },
  designsHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: SIZES.sm 
  },
  designsTitle: { 
    ...TYPOGRAPHY.caption,
    fontSize: 9,
  },
  designsSeeAll: { 
    ...TYPOGRAPHY.caption,
    fontSize: 8,
    color: COLORS.grayMedium 
  },
  designsScroll: { 
    flexDirection: 'row' 
  },
  designCard: { 
    width: 120, 
    borderWidth: 0.5, 
    borderColor: COLORS.grayLight, 
    overflow: 'hidden', 
    marginRight: SIZES.sm, 
    backgroundColor: COLORS.surface 
  },
  designImage: { 
    width: 120, 
    height: 100, 
    resizeMode: 'cover' 
  },
  designOverlay: { 
    position: 'absolute', 
    bottom: 0, 
    left: 0, 
    right: 0, 
    backgroundColor: 'rgba(0,0,0,0.6)', 
    padding: 4 
  },
  designTitle: { 
    ...TYPOGRAPHY.caption,
    fontSize: 8,
    color: COLORS.white, 
    marginBottom: 2 
  },
  designStats: { 
    flexDirection: 'row', 
    gap: SIZES.sm 
  },
  designStat: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 2 
  },
  designStatText: { 
    ...TYPOGRAPHY.caption,
    fontSize: 7,
    color: COLORS.white 
  },
  
  emptyContainer: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    paddingTop: SIZES.xl, 
    minHeight: 300 
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
    marginTop: SIZES.sm, 
    marginBottom: 4 
  },
  emptyText: { 
    ...TYPOGRAPHY.caption,
    fontSize: 9,
    color: COLORS.grayMedium, 
    textAlign: 'center', 
    marginBottom: SIZES.lg 
  },
  clearButton: { 
    borderWidth: 0.5, 
    borderColor: COLORS.grayLight,
    paddingHorizontal: SIZES.xl, 
    paddingVertical: SIZES.sm 
  },
  clearButtonText: { 
    ...TYPOGRAPHY.caption,
    fontSize: 9,
    color: COLORS.black 
  },
  
  loadingMore: { 
    flexDirection: 'row', 
    justifyContent: 'center', 
    alignItems: 'center', 
    paddingVertical: SIZES.lg, 
    gap: SIZES.sm 
  },
  loadingMoreText: { 
    ...TYPOGRAPHY.caption,
    fontSize: 9,
    color: COLORS.grayMedium 
  },
  
  modalOverlay: { 
    flex: 1, 
    backgroundColor: 'rgba(0,0,0,0.8)' 
  },
  modalContainer: { 
    flex: 1, 
    backgroundColor: COLORS.white, 
    marginTop: 60, 
    overflow: 'hidden' 
  },
  modalHeader: { 
    position: 'relative' 
  },
  modalCover: { 
    width: '100%', 
    height: 180 
  },
  closeButton: { 
    position: 'absolute', 
    top: SIZES.lg, 
    right: SIZES.lg, 
    backgroundColor: COLORS.black, 
    width: 32, 
    height: 32, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  modalProfile: { 
    position: 'absolute', 
    bottom: -24, 
    left: SIZES.lg, 
    flexDirection: 'row', 
    alignItems: 'center' 
  },
  modalAvatar: { 
    width: 64, 
    height: 64, 
    borderWidth: 2, 
    borderColor: COLORS.white 
  },
  modalProfileInfo: { 
    marginLeft: SIZES.md, 
    backgroundColor: 'rgba(0,0,0,0.7)', 
    padding: SIZES.sm, 
    maxWidth: width * 0.6 
  },
  modalName: { 
    ...TYPOGRAPHY.body,
    fontWeight: '500',
    color: COLORS.white, 
    marginBottom: 2 
  },
  modalTitle: { 
    ...TYPOGRAPHY.caption,
    fontSize: 9,
    color: COLORS.grayLight 
  },
  modalContent: { 
    padding: SIZES.lg, 
    paddingTop: SIZES.xl 
  },
  modalDescription: { 
    ...TYPOGRAPHY.bodySmall,
    lineHeight: 18, 
    marginBottom: SIZES.lg 
  },
  modalStats: { 
    flexDirection: 'row', 
    justifyContent: 'space-around', 
    borderWidth: 0.5, 
    borderColor: COLORS.grayLight, 
    padding: SIZES.md, 
    marginBottom: SIZES.lg 
  },
  modalStat: { 
    alignItems: 'center', 
    flex: 1 
  },
  modalStatNumber: { 
    ...TYPOGRAPHY.body,
    fontWeight: '500',
  },
  modalStatLabel: { 
    ...TYPOGRAPHY.caption,
    fontSize: 8,
    color: COLORS.grayMedium, 
    marginTop: 2 
  },
  modalStatDivider: { 
    width: 0.5, 
    backgroundColor: COLORS.grayLight 
  },
  modalDesignsSection: { 
    marginBottom: SIZES.lg 
  },
  modalDesignsTitle: { 
    ...TYPOGRAPHY.caption,
    marginBottom: SIZES.md 
  },
  modalDesignCard: { 
    marginRight: SIZES.md, 
    borderWidth: 0.5, 
    borderColor: COLORS.grayLight, 
    overflow: 'hidden', 
    backgroundColor: COLORS.surface 
  },
  modalDesignImage: { 
    width: 120, 
    height: 140, 
    resizeMode: 'cover' 
  },
  modalDesignTitle: { 
    ...TYPOGRAPHY.caption,
    fontSize: 9,
    padding: 4, 
    textAlign: 'center' 
  },
  modalFollowButton: { 
    borderWidth: 0.5, 
    borderColor: COLORS.grayLight,
    paddingVertical: SIZES.md, 
    alignItems: 'center', 
    marginTop: SIZES.sm 
  },
  modalFollowButtonActive: { 
    backgroundColor: COLORS.black,
    borderColor: COLORS.black,
  },
  modalFollowText: { 
    ...TYPOGRAPHY.button,
    color: COLORS.black 
  },
  modalFollowTextActive: { 
    color: COLORS.white 
  },
});

export default TasarimcimScreen;