// 📁 src/screens/TasarimcimScreen.js - REVİZE (Premium Kart Eklendi)

import React, { useState, useEffect, useCallback, useRef, useContext } from 'react';
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
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, TYPOGRAPHY, SIZES, getThemeColors } from '../constants/Theme';
import { ThemeContext } from '../../App';

// ============================================================
// 📌 TOAST İMPORTU
// ============================================================
import { showToast } from '../components/CustomAlert';

// ============================================================
// 📌 SERVİS İMPORTLARI
// ============================================================
import imagePoolService from '../services/imagePoolService';
import aiAdvisorService from '../services/aiAdvisorService';
import brandService from '../services/brandService';

// ============================================================
// 📌 FASHION LIBRARY İMPORTLARI
// ============================================================
import { 
  getColorInfo,
  getProductInfo,
  getAllProductNames,
  getOutfitCombination,
} from '../constants/fashionLibrary';

// ============================================================
// 📌 MARKA KATEGORİLERİ
// ============================================================
const BRAND_CATEGORIES = [
  { id: 'all', label: 'TÜMÜ', icon: 'grid-outline' },
  { id: 'luxury', label: 'LÜKS', icon: 'diamond-outline' },
  { id: 'streetwear', label: 'SOKAK', icon: 'footsteps-outline' },
  { id: 'sport', label: 'SPOR', icon: 'barbell-outline' },
  { id: 'sustainable', label: 'SÜRDÜRÜLEBİLİR', icon: 'leaf-outline' },
  { id: 'vintage', label: 'VİNTAGE', icon: 'time-outline' },
  { id: 'minimalist', label: 'MİNİMALİST', icon: 'square-outline' },
  { id: 'accessory', label: 'AKSESUAR', icon: 'watch-outline' },
];

// ============================================================
// 📌 MARKA VERİLERİ
// ============================================================
const BRANDS_DATA = [
  {
    id: '1',
    name: 'LC Waikiki',
    category: 'sustainable',
    type: 'brand',
    avatar: 'https://via.placeholder.com/60',
    cover: 'https://via.placeholder.com/400x200',
    title: 'Sürdürülebilir Moda',
    description: 'Uygun fiyatlı ve sürdürülebilir moda anlayışı ile herkes için şık giyim.',
    followers: 2840000,
    advantages: ['%30 İndirim', 'Yeni Sezon', 'Ücretsiz Kargo'],
    privileges: ['Puan Toplama', 'Özel Kampanyalar', 'Erken Erişim'],
    trendNo: 1,
    rating: 4.8,
    location: 'Türkiye',
    isVerified: true,
    trending: 92,
    designs: [
      { id: 'd1', title: 'Bahar Koleksiyonu', image: 'https://via.placeholder.com/120x100', likes: 3400, comments: 230 },
      { id: 'd2', title: 'Sürdürülebilir Seri', image: 'https://via.placeholder.com/120x100', likes: 2800, comments: 180 },
      { id: 'd3', title: 'Basic Parçalar', image: 'https://via.placeholder.com/120x100', likes: 2100, comments: 150 },
    ],
    campaigns: [
      { id: 'c1', title: 'Yeni Sezon %30 İndirim', validUntil: '2026-12-31' },
      { id: 'c2', title: 'Ücretsiz Kargo Fırsatı', validUntil: '2026-11-30' },
    ]
  },
  {
    id: '2',
    name: 'Mavi',
    category: 'streetwear',
    type: 'brand',
    avatar: 'https://via.placeholder.com/60',
    cover: 'https://via.placeholder.com/400x200',
    title: 'Sokak Modası',
    description: 'Özgün ve rahat sokak modası ile gençlerin vazgeçilmez markası.',
    followers: 1850000,
    advantages: ['Sepette %15 İndirim', 'Kapıda Ödeme'],
    privileges: ['VIP Üyelik', 'Özel Gün Hediyeleri'],
    trendNo: 2,
    rating: 4.6,
    location: 'Türkiye',
    isVerified: true,
    trending: 85,
    designs: [
      { id: 'd1', title: 'Sokak Stili', image: 'https://via.placeholder.com/120x100', likes: 5200, comments: 340 },
      { id: 'd2', title: 'Denim Koleksiyonu', image: 'https://via.placeholder.com/120x100', likes: 4100, comments: 280 },
    ],
    campaigns: [
      { id: 'c1', title: 'Sokak Stili Haftası', validUntil: '2026-10-15' },
    ]
  },
  {
    id: '3',
    name: 'Beymen',
    category: 'luxury',
    type: 'brand',
    avatar: 'https://via.placeholder.com/60',
    cover: 'https://via.placeholder.com/400x200',
    title: 'Lüks Moda',
    description: 'Dünya markalarını bir araya getiren lüks moda deneyimi.',
    followers: 3200000,
    advantages: ['Özel Alışveriş Günü', 'Kişisel Alışveriş Asistanı'],
    privileges: ['Özel Davetiyeler', 'Lüks Sürprizler', 'Erken Sezon Erişimi'],
    trendNo: 1,
    rating: 4.9,
    location: 'Türkiye',
    isVerified: true,
    trending: 95,
    designs: [
      { id: 'd1', title: 'Sonbahar/Kış Koleksiyonu', image: 'https://via.placeholder.com/120x100', likes: 6800, comments: 450 },
      { id: 'd2', title: 'Özel Tasarım Serisi', image: 'https://via.placeholder.com/120x100', likes: 5500, comments: 380 },
      { id: 'd3', title: 'Lüks Aksesuarlar', image: 'https://via.placeholder.com/120x100', likes: 4900, comments: 320 },
      { id: 'd4', title: 'Yılbaşı Koleksiyonu', image: 'https://via.placeholder.com/120x100', likes: 7200, comments: 510 },
    ],
    campaigns: [
      { id: 'c1', title: 'Sezon Sonu Fırsatları', validUntil: '2026-12-31' },
      { id: 'c2', title: 'Özel VIP Alışveriş Günü', validUntil: '2026-11-20' },
    ]
  },
];

const { width } = Dimensions.get('window');

// ============================================================
// 📌 HELPERS
// ============================================================
const formatNumber = (num) => {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toString();
};

// ============================================================
// 📌 STİL KİMLİĞİ KARTLARI (YENİ - DİKDÖRTGEN, YATAY KAYDIRMA)
// ============================================================
const StyleIdentityCards = ({ onCardPress }) => {
  const { theme } = useContext(ThemeContext);
  const isDark = theme === 'dark';
  const colors = getThemeColors(isDark);

  const styleCards = [
    { id: '1', title: 'Sokak Stili', image: 'https://picsum.photos/id/1/400/500', likes: 12400, comments: 3400 },
    { id: '2', title: 'Lüks Kombin', image: 'https://picsum.photos/id/2/400/500', likes: 8900, comments: 2100 },
    { id: '3', title: 'Minimal Look', image: 'https://picsum.photos/id/3/400/500', likes: 6700, comments: 1800 },
    { id: '4', title: 'Vintage Tarz', image: 'https://picsum.photos/id/4/400/500', likes: 5200, comments: 1400 },
    { id: '5', title: 'Spor Şıklık', image: 'https://picsum.photos/id/5/400/500', likes: 4800, comments: 1200 },
  ];

  return (
    <View style={styles.styleIdentityContainer}>
      <View style={styles.styleIdentityHeader}>
        <Text style={[styles.styleIdentityTitle, { color: colors.text }]}>🌟 STİL KİMLİĞİM</Text>
        <TouchableOpacity onPress={() => onCardPress?.('seeAll')}>
          <Text style={[styles.styleIdentitySeeAll, { color: colors.textSecondary }]}>TÜMÜNÜ GÖR</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={styleCards}
        horizontal
        showsHorizontalScrollIndicator={false}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={[styles.styleIdentityCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={() => onCardPress?.(item)}
            activeOpacity={0.9}
          >
            <Image source={{ uri: item.image }} style={styles.styleIdentityImage} />
            <View style={styles.styleIdentityOverlay}>
              <View style={styles.styleIdentityContent}>
                <Text style={styles.styleIdentityCardTitle}>{item.title}</Text>
                <View style={styles.styleIdentityStats}>
                  <View style={styles.styleIdentityStat}>
                    <Ionicons name="heart" size={12} color="#FF3B30" />
                    <Text style={styles.styleIdentityStatText}>{formatNumber(item.likes)}</Text>
                  </View>
                  <View style={styles.styleIdentityStat}>
                    <Ionicons name="chatbubble" size={12} color="#FFFFFF" />
                    <Text style={styles.styleIdentityStatText}>{formatNumber(item.comments)}</Text>
                  </View>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        )}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.styleIdentityList}
      />
    </View>
  );
};

// ============================================================
// 📌 KOLEKSİYONUM (YENİ TASARIM - DÜZELTİLDİ)
// ============================================================
const MyCollection = ({ items, onItemPress }) => {
  const { theme } = useContext(ThemeContext);
  const isDark = theme === 'dark';
  const colors = getThemeColors(isDark);

  if (!items || items.length === 0) {
    return (
      <View style={[styles.collectionEmptyContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Ionicons name="albums-outline" size={40} color={colors.textSecondary} />
        <Text style={[styles.collectionEmptyTitle, { color: colors.text }]}>KOLEKSİYONUN BOŞ</Text>
        <Text style={[styles.collectionEmptyText, { color: colors.textSecondary }]}>
          Markalardan ilham alarak koleksiyon oluştur!
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.collectionContainer}>
      <View style={styles.collectionHeader}>
        <Text style={[styles.collectionTitle, { color: colors.text }]}>👗 KOLEKSİYONUM</Text>
        <TouchableOpacity onPress={() => onItemPress?.('seeAll')}>
          <Text style={[styles.collectionSeeAll, { color: colors.textSecondary }]}>TÜMÜNÜ GÖR</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={items}
        horizontal
        showsHorizontalScrollIndicator={false}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={[styles.collectionItem, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={() => onItemPress?.(item)}
            activeOpacity={0.8}
          >
            <Image source={{ uri: item.image || 'https://picsum.photos/120/160' }} style={styles.collectionItemImage} />
            <View style={styles.collectionItemInfo}>
              <Text style={[styles.collectionItemName, { color: colors.text }]} numberOfLines={1}>{item.name || 'Parça'}</Text>
              <Text style={[styles.collectionItemBrand, { color: colors.textSecondary }]} numberOfLines={1}>{item.brand || 'Marka'}</Text>
              <Text style={[styles.collectionItemPrice, { color: colors.text }]}>₺{item.price || '0'}</Text>
            </View>
          </TouchableOpacity>
        )}
        keyExtractor={(item, index) => item.id || index.toString()}
        contentContainerStyle={styles.collectionList}
      />
    </View>
  );
};

// ============================================================
// 📌 PREMİUM BİLGİLENDİRME KARTI (YENİ TASARIM)
// ============================================================
const PremiumInfoCard = ({ onPress }) => {
  const { theme } = useContext(ThemeContext);
  const isDark = theme === 'dark';
  const colors = getThemeColors(isDark);

  const features = [
    { icon: 'shield-checkmark', label: 'Özel Güvenlik' },
    { icon: 'gift', label: 'VIP Üyelik' },
    { icon: 'cash', label: 'Kapıda Ödeme' },
    { icon: 'pricetag', label: '%15 İndirim' },
  ];

  return (
    <LinearGradient
      colors={isDark ? ['#1A1A1A', '#2D2D2D'] : ['#1A1A1A', '#2D2D2D']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.premiumCard, { borderColor: isDark ? '#3D3D3D' : 'rgba(255,255,255,0.1)' }]}
    >
      <View style={styles.premiumCardContent}>
        <View style={styles.premiumCardHeader}>
          <View style={styles.premiumCardIconWrap}>
            <Ionicons name="diamond" size={20} color="#FFD700" />
          </View>
          <View style={styles.premiumCardBadge}>
            <Text style={styles.premiumCardBadgeText}>PREMIUM</Text>
          </View>
        </View>

        <Text style={styles.premiumCardTitle}>STİL İLHAMI AL</Text>
        <Text style={styles.premiumCardSubtitle}>
          Markalardan ilham al, kendi stilini yarat. Premium deneyim seni bekliyor.
        </Text>

        <View style={styles.premiumCardFeatures}>
          {features.map((item, idx) => (
            <View key={idx} style={styles.premiumCardFeature}>
              <Ionicons name={item.icon} size={14} color="rgba(255,255,255,0.7)" />
              <Text style={styles.premiumCardFeatureText}>{item.label}</Text>
            </View>
          ))}
        </View>

        <TouchableOpacity 
          style={styles.premiumCardButton} 
          onPress={onPress}
          activeOpacity={0.8}
        >
          <Text style={styles.premiumCardButtonText}>KEŞFET</Text>
          <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
};

// ============================================================
// 📌 MARKA KARTI BİLEŞENİ
// ============================================================
const BrandCard = ({ item, onPress, onFollow, isFollowing, onStyleInspire }) => {
  const { theme } = useContext(ThemeContext);
  const isDark = theme === 'dark';
  const colors = getThemeColors(isDark);

  return (
    <TouchableOpacity 
      style={[styles.brandCard, { borderColor: colors.border, backgroundColor: colors.surface }]}
      onPress={() => onPress(item)}
      activeOpacity={0.9}
    >
      <View style={styles.brandCardHeader}>
        <Image source={{ uri: item.avatar }} style={[styles.brandAvatar, { borderColor: colors.border }]} />
        <View style={styles.brandInfo}>
          <View style={styles.brandNameRow}>
            <Text style={[styles.brandName, { color: colors.text }]}>{item.name}</Text>
            {item.isVerified && (
              <Ionicons name="checkmark-circle" size={14} color={colors.primary || colors.text} />
            )}
            <View style={[styles.brandTrendBadge, { backgroundColor: colors.primary || colors.text }]}>
              <Text style={[styles.brandTrendText, { color: colors.background }]}>
                #{item.trendNo}
              </Text>
            </View>
          </View>
          <Text style={[styles.brandCategory, { color: colors.textSecondary }]}>
            {BRAND_CATEGORIES.find(c => c.id === item.category)?.label || 'Moda'}
          </Text>
          <View style={styles.brandStats}>
            <View style={styles.brandStat}>
              <Ionicons name="people-outline" size={12} color={colors.textSecondary} />
              <Text style={[styles.brandStatText, { color: colors.textSecondary }]}>
                {formatNumber(item.followers)} Takipçi
              </Text>
            </View>
            <View style={[styles.brandStatDivider, { backgroundColor: colors.border }]} />
            <View style={styles.brandStat}>
              <Ionicons name="star-outline" size={12} color={colors.textSecondary} />
              <Text style={[styles.brandStatText, { color: colors.textSecondary }]}>
                {item.rating}
              </Text>
            </View>
          </View>
        </View>
        <TouchableOpacity 
          style={[styles.followButton, isFollowing && styles.followButtonActive, { borderColor: colors.border }]}
          onPress={() => onFollow(item.id)}
        >
          <Text style={[styles.followButtonText, isFollowing && styles.followButtonTextActive, { color: isFollowing ? colors.background : colors.text }]}>
            {isFollowing ? 'TAKİP' : 'TAKİP ET'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={[styles.brandAdvantages, { borderTopColor: colors.border }]}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {item.advantages?.map((adv, idx) => (
            <View key={idx} style={[styles.advantageChip, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Ionicons name="pricetag-outline" size={10} color={colors.textSecondary} />
              <Text style={[styles.advantageText, { color: colors.textSecondary }]}>{adv}</Text>
            </View>
          ))}
          {item.privileges?.map((priv, idx) => (
            <View key={idx} style={[styles.privilegeChip, { backgroundColor: colors.primary || colors.text, borderColor: colors.border }]}>
              <Ionicons name="star" size={10} color={colors.background} />
              <Text style={[styles.privilegeText, { color: colors.background }]}>{priv}</Text>
            </View>
          ))}
        </ScrollView>
      </View>

      <TouchableOpacity 
        style={[styles.styleInspireButton, { borderColor: colors.border }]}
        onPress={() => onStyleInspire(item.id)}
      >
        <Ionicons name="bulb-outline" size={14} color={colors.text} />
        <Text style={[styles.styleInspireText, { color: colors.text }]}>STİL İLHAMI AL</Text>
        <Ionicons name="arrow-forward" size={12} color={colors.text} />
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

// ============================================================
// 📌 MARKA DETAY PANELİ
// ============================================================
const BrandDetailPanel = ({ visible, brand, onClose, isFollowing, onFollow }) => {
  const { theme } = useContext(ThemeContext);
  const isDark = theme === 'dark';
  const colors = getThemeColors(isDark);

  const [activeTab, setActiveTab] = useState('normal');
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (brand && visible) {
      loadAnalytics();
    }
  }, [brand, visible]);

  const loadAnalytics = async () => {
    if (!brand) return;
    setLoading(true);
    try {
      const data = await brandService.getBrandAnalytics(brand.id);
      setAnalytics(data);
    } catch (error) {
      console.error('Analytics yükleme hatası:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!brand) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <SafeAreaView style={[styles.panelContainer, { backgroundColor: colors.background }]}>
        <View style={[styles.panelHeader, { borderBottomColor: colors.border }]}>
          <TouchableOpacity onPress={onClose} style={styles.panelBackButton}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.panelTitle, { color: colors.text }]}>{brand.name}</Text>
          <View style={styles.panelHeaderRight} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          <Image source={{ uri: brand.cover }} style={styles.panelCover} />
          
          <View style={styles.panelContent}>
            <View style={styles.panelProfileSection}>
              <Image source={{ uri: brand.avatar }} style={[styles.panelAvatar, { borderColor: colors.background }]} />
              <View style={styles.panelProfileInfo}>
                <Text style={[styles.panelBrandName, { color: colors.text }]}>{brand.name}</Text>
                <Text style={[styles.panelBrandTitle, { color: colors.textSecondary }]}>{brand.title}</Text>
                <Text style={[styles.panelBrandLocation, { color: colors.textSecondary }]}>
                  <Ionicons name="location-outline" size={12} /> {brand.location}
                </Text>
              </View>
            </View>

            <View style={[styles.panelStats, { borderColor: colors.border }]}>
              <View style={styles.panelStat}>
                <Text style={[styles.panelStatNumber, { color: colors.text }]}>{formatNumber(brand.followers)}</Text>
                <Text style={[styles.panelStatLabel, { color: colors.textSecondary }]}>TAKİPÇİ</Text>
              </View>
              <View style={[styles.panelStatDivider, { backgroundColor: colors.border }]} />
              <View style={styles.panelStat}>
                <Text style={[styles.panelStatNumber, { color: colors.text }]}>{brand.rating}</Text>
                <Text style={[styles.panelStatLabel, { color: colors.textSecondary }]}>PUAN</Text>
              </View>
              <View style={[styles.panelStatDivider, { backgroundColor: colors.border }]} />
              <View style={styles.panelStat}>
                <Text style={[styles.panelStatNumber, { color: colors.text }]}>#{brand.trendNo}</Text>
                <Text style={[styles.panelStatLabel, { color: colors.textSecondary }]}>TREND</Text>
              </View>
            </View>

            {brand.campaigns && brand.campaigns.length > 0 && (
              <View style={styles.panelCampaigns}>
                <Text style={[styles.panelSectionTitle, { color: colors.text }]}>📢 AKTİF KAMPANYALAR</Text>
                {brand.campaigns.map((campaign, idx) => (
                  <View key={idx} style={[styles.panelCampaign, { borderColor: colors.border }]}>
                    <Ionicons name="megaphone-outline" size={16} color={colors.text} />
                    <View style={styles.panelCampaignInfo}>
                      <Text style={[styles.panelCampaignTitle, { color: colors.text }]}>{campaign.title}</Text>
                      <Text style={[styles.panelCampaignDate, { color: colors.textSecondary }]}>
                        Son Kullanım: {campaign.validUntil}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            )}

            {analytics && (
              <View style={styles.panelAnalytics}>
                <Text style={[styles.panelSectionTitle, { color: colors.text }]}>📊 TRAFİK ANALİZİ</Text>
                <View style={[styles.panelAnalyticsGrid, { borderColor: colors.border }]}>
                  <View style={[styles.panelAnalyticsItem, { borderColor: colors.border }]}>
                    <Text style={[styles.panelAnalyticsNumber, { color: colors.text }]}>{formatNumber(analytics.views || 0)}</Text>
                    <Text style={[styles.panelAnalyticsLabel, { color: colors.textSecondary }]}>Ziyaret</Text>
                  </View>
                  <View style={[styles.panelAnalyticsItem, { borderColor: colors.border }]}>
                    <Text style={[styles.panelAnalyticsNumber, { color: colors.text }]}>{formatNumber(analytics.engagements || 0)}</Text>
                    <Text style={[styles.panelAnalyticsLabel, { color: colors.textSecondary }]}>Etkileşim</Text>
                  </View>
                  <View style={[styles.panelAnalyticsItem, { borderColor: colors.border }]}>
                    <Text style={[styles.panelAnalyticsNumber, { color: colors.text }]}>{analytics.conversionRate || 0}%</Text>
                    <Text style={[styles.panelAnalyticsLabel, { color: colors.textSecondary }]}>Dönüşüm</Text>
                  </View>
                </View>
              </View>
            )}

            <View style={[styles.panelTabs, { borderColor: colors.border }]}>
              <TouchableOpacity
                style={[styles.panelTab, activeTab === 'normal' && styles.panelTabActive, { backgroundColor: activeTab === 'normal' ? colors.text : colors.background }]}
                onPress={() => setActiveTab('normal')}
              >
                <Text style={[styles.panelTabText, activeTab === 'normal' && styles.panelTabTextActive, { color: activeTab === 'normal' ? colors.background : colors.text }]}>
                  NORMAL
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.panelTab, activeTab === 'personal' && styles.panelTabActive, { backgroundColor: activeTab === 'personal' ? colors.text : colors.background }]}
                onPress={() => setActiveTab('personal')}
              >
                <Text style={[styles.panelTabText, activeTab === 'personal' && styles.panelTabTextActive, { color: activeTab === 'personal' ? colors.background : colors.text }]}>
                  BANA ÖZEL
                </Text>
              </TouchableOpacity>
            </View>

            {activeTab === 'normal' && (
              <View style={styles.panelTabContent}>
                <Text style={[styles.panelDescription, { color: colors.text }]}>{brand.description}</Text>
                
                <View style={styles.panelAdvantages}>
                  <Text style={[styles.panelSubTitle, { color: colors.text }]}>✨ Avantajlar</Text>
                  <View style={styles.panelAdvantagesGrid}>
                    {brand.advantages.map((adv, idx) => (
                      <View key={idx} style={[styles.panelAdvantageItem, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                        <Ionicons name="checkmark-circle" size={16} color={colors.text} />
                        <Text style={[styles.panelAdvantageText, { color: colors.text }]}>{adv}</Text>
                      </View>
                    ))}
                  </View>
                </View>

                <View style={styles.panelPrivileges}>
                  <Text style={[styles.panelSubTitle, { color: colors.text }]}>⭐ Ayrıcalıklar</Text>
                  <View style={styles.panelPrivilegesGrid}>
                    {brand.privileges.map((priv, idx) => (
                      <View key={idx} style={[styles.panelPrivilegeItem, { backgroundColor: colors.text }]}>
                        <Ionicons name="star" size={14} color={colors.background} />
                        <Text style={[styles.panelPrivilegeText, { color: colors.background }]}>{priv}</Text>
                      </View>
                    ))}
                  </View>
                </View>

                {brand.designs && brand.designs.length > 0 && (
                  <View style={styles.panelDesigns}>
                    <Text style={[styles.panelSubTitle, { color: colors.text }]}>👗 Koleksiyonlar</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                      {brand.designs.map((design, idx) => (
                        <TouchableOpacity key={idx} style={[styles.panelDesignItem, { borderColor: colors.border, backgroundColor: colors.surface }]}>
                          <Image source={{ uri: design.image }} style={styles.panelDesignImage} />
                          <Text style={[styles.panelDesignTitle, { color: colors.text }]} numberOfLines={1}>{design.title}</Text>
                          <View style={styles.panelDesignStats}>
                            <Ionicons name="heart-outline" size={10} color={colors.textSecondary} />
                            <Text style={[styles.panelDesignStatText, { color: colors.textSecondary }]}>{formatNumber(design.likes)}</Text>
                          </View>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                )}
              </View>
            )}

            {activeTab === 'personal' && (
              <View style={styles.panelTabContent}>
                <Text style={[styles.panelPersonalTitle, { color: colors.text }]}>👤 Sana Özel Öneriler</Text>
                <View style={[styles.panelPersonalCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                  <Ionicons name="sparkles" size={24} color={colors.text} />
                  <View style={styles.panelPersonalInfo}>
                    <Text style={[styles.panelPersonalText, { color: colors.text }]}>Bu markaya özel stil önerileri</Text>
                    <Text style={[styles.panelPersonalSubText, { color: colors.textSecondary }]}>
                      {brand.name} tarzına uygun kombinler ve ürün önerileri
                    </Text>
                  </View>
                </View>
                
                <View style={styles.panelPersonalRecommendations}>
                  <Text style={[styles.panelSubTitle, { color: colors.text }]}>🎯 Sana Özel Kombinler</Text>
                  <View style={[styles.panelPersonalRecItem, { borderColor: colors.border, backgroundColor: colors.surface }]}>
                    <Image source={{ uri: 'https://via.placeholder.com/60x60' }} style={styles.panelPersonalRecImage} />
                    <View style={styles.panelPersonalRecInfo}>
                      <Text style={[styles.panelPersonalRecTitle, { color: colors.text }]}>{brand.name} Tarzı Kombin</Text>
                      <Text style={[styles.panelPersonalRecDesc, { color: colors.textSecondary }]}>Bu kombin sana çok yakışacak!</Text>
                    </View>
                    <TouchableOpacity style={[styles.panelPersonalRecButton, { backgroundColor: colors.text }]}>
                      <Text style={[styles.panelPersonalRecButtonText, { color: colors.background }]}>DENE</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            )}
          </View>
        </ScrollView>

        <View style={[styles.panelFooter, { borderTopColor: colors.border, backgroundColor: colors.background }]}>
          <TouchableOpacity 
            style={[styles.panelFollowButton, isFollowing && styles.panelFollowButtonActive, { borderColor: colors.border, backgroundColor: isFollowing ? colors.text : 'transparent' }]}
            onPress={() => {
              onFollow(brand.id);
              onClose();
            }}
          >
            <Text style={[styles.panelFollowText, isFollowing && styles.panelFollowTextActive, { color: isFollowing ? colors.background : colors.text }]}>
              {isFollowing ? 'TAKİP EDİLİYOR' : 'TAKİP ET'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.panelInspireButton, { backgroundColor: colors.text }]}
            onPress={() => {
              showToast({
                title: '✨ Stil İlhamı',
                message: `${brand.name} tarzı için özel öneriler geliyor!`,
                type: 'success',
                autoClose: false,
                showPremium: true,
              });
            }}
          >
            <Ionicons name="bulb-outline" size={16} color={colors.background} />
            <Text style={[styles.panelInspireText, { color: colors.background }]}>STİL İLHAMI AL</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

// ============================================================
// 📌 AI KONUŞMA MODALI
// ============================================================
const AIConversationModal = ({ visible, onClose }) => {
  const { theme } = useContext(ThemeContext);
  const isDark = theme === 'dark';
  const colors = getThemeColors(isDark);

  const [messages, setMessages] = useState([
    {
      id: '1',
      text: '👋 Merhaba! Ben ModaVerse AI Stil Danışmanı. Sana markalar, kombin önerileri, hava durumu ve stil ipuçları konusunda yardımcı olabilirim. Sormak istediğin bir şey var mı?',
      sender: 'ai',
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const flatListRef = useRef(null);

  const sendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage = {
      id: Date.now().toString(),
      text: inputText.trim(),
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      const response = await aiAdvisorService.getAdvice(userMessage.text);
      
      const aiMessage = {
        id: (Date.now() + 1).toString(),
        text: response || 'Üzgünüm, şu anda bir cevap üretemiyorum. Lütfen tekrar dener misin?',
        sender: 'ai',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('AI yanıt hatası:', error);
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        text: '⚠️ Üzgünüm, şu anda AI servisine bağlanılamıyor. Lütfen daha sonra tekrar dener misin?',
        sender: 'ai',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    }
  };

  const renderMessage = ({ item }) => {
    const isAI = item.sender === 'ai';
    return (
      <View style={[styles.messageWrapper, isAI ? styles.aiMessageWrapper : styles.userMessageWrapper]}>
        {isAI && (
          <View style={styles.aiAvatarContainer}>
            <View style={[styles.aiAvatar, { backgroundColor: colors.primary || colors.text }]}>
              <Ionicons name="color-wand" size={16} color={colors.background} />
            </View>
          </View>
        )}
        <View style={[styles.messageBubble, isAI ? [styles.aiBubble, { backgroundColor: colors.surface }] : [styles.userBubble, { backgroundColor: colors.primary || colors.text }]]}>
          <Text style={[styles.messageText, isAI ? [styles.aiMessageText, { color: colors.text }] : [styles.userMessageText, { color: colors.background }]]}>
            {item.text}
          </Text>
          <Text style={[styles.messageTime, { color: colors.textSecondary }]}>
            {item.timestamp.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
      <SafeAreaView style={[styles.modalContainer, { backgroundColor: colors.background }]}>
        <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
          <TouchableOpacity onPress={onClose} style={styles.modalBackButton}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <View style={styles.modalHeaderCenter}>
            <View style={[styles.modalHeaderAvatar, { backgroundColor: colors.primary || colors.text }]}>
              <Ionicons name="color-wand" size={20} color={colors.background} />
            </View>
            <View>
              <Text style={[styles.modalHeaderTitle, { color: colors.text }]}>AI Stil Danışmanı</Text>
              <View style={styles.modalHeaderStatus}>
                <View style={[styles.statusDot, { backgroundColor: '#4CAF50' }]} />
                <Text style={[styles.modalHeaderStatusText, { color: colors.textSecondary }]}>ÇEVRİMİÇİ</Text>
              </View>
            </View>
          </View>
          <TouchableOpacity onPress={() => {
            setMessages([{
              id: '1',
              text: '👋 Merhaba! Ben ModaVerse AI Stil Danışmanı. Sana nasıl yardımcı olabilirim?',
              sender: 'ai',
              timestamp: new Date(),
            }]);
          }} style={styles.modalResetButton}>
            <Ionicons name="refresh-outline" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.messagesList}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        />

        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}>
          <View style={[styles.inputContainer, { borderTopColor: colors.border, backgroundColor: colors.background }]}>
            <TextInput
              style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
              placeholder="Bir şeyler sor..."
              placeholderTextColor={colors.textSecondary}
              value={inputText}
              onChangeText={setInputText}
              multiline
              maxLength={500}
            />
            <TouchableOpacity
              style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled, { backgroundColor: !inputText.trim() ? colors.surface : colors.primary || colors.text }]}
              onPress={sendMessage}
              disabled={!inputText.trim() || isLoading}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color={colors.background} />
              ) : (
                <Ionicons name="send" size={18} color={colors.background} />
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
};

// ============================================================
// 📌 ANA BİLEŞEN
// ============================================================
const TasarimcimScreen = ({ navigation }) => {
  const { theme } = useContext(ThemeContext);
  const isDark = theme === 'dark';
  const colors = getThemeColors(isDark);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [following, setFollowing] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [brands, setBrands] = useState(BRANDS_DATA);
  const [aiModalVisible, setAiModalVisible] = useState(false);
  const [brandPanelVisible, setBrandPanelVisible] = useState(false);
  const flatListRef = useRef(null);

  const [collectionItems, setCollectionItems] = useState([
    { id: 'c1', name: 'Deri Ceket', brand: 'Zara', price: '1299', image: 'https://picsum.photos/id/10/120/160' },
    { id: 'c2', name: 'Sneaker', brand: 'Nike', price: '899', image: 'https://picsum.photos/id/20/120/160' },
    { id: 'c3', name: 'Elbise', brand: 'Mavi', price: '599', image: 'https://picsum.photos/id/30/120/160' },
    { id: 'c4', name: 'Saat', brand: 'Daniel Wellington', price: '2499', image: 'https://picsum.photos/id/40/120/160' },
  ]);

  useEffect(() => {
    loadFollowing();
    loadBrands();
    initializeServices();
  }, []);

  const initializeServices = async () => {
    try {
      await brandService.initialize();
      await imagePoolService.initialize();
      await aiAdvisorService.loadCache();
    } catch (error) {
      console.error('Servis başlatma hatası:', error);
    }
  };

  const loadFollowing = async () => {
    try {
      const saved = await AsyncStorage.getItem('@following_brands');
      const followingList = saved ? JSON.parse(saved) : [];
      setFollowing(followingList);
    } catch (error) {
      console.error('Takip yükleme hatası:', error);
    }
  };

  const loadBrands = async () => {
    try {
      const savedBrands = await AsyncStorage.getItem('@brands_data');
      if (savedBrands) {
        setBrands(JSON.parse(savedBrands));
      }
    } catch (error) {
      console.error('Marka yükleme hatası:', error);
    }
  };

  const saveFollowing = async (followingList) => {
    try {
      await AsyncStorage.setItem('@following_brands', JSON.stringify(followingList));
    } catch (error) {
      console.error('Takip kaydetme hatası:', error);
    }
  };

  const getFilteredBrands = () => {
    let filtered = brands;
    
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
    
    filtered.sort((a, b) => a.trendNo - b.trendNo);
    return filtered;
  };

  const handleFollow = async (brandId) => {
    const isFollowing = following.includes(brandId);
    let newFollowing;
    
    if (isFollowing) {
      await brandService.unfollowBrand(brandId);
      newFollowing = following.filter(id => id !== brandId);
    } else {
      await brandService.followBrand(brandId);
      newFollowing = [...following, brandId];
    }
    
    setFollowing(newFollowing);
    await saveFollowing(newFollowing);

    const brand = brands.find(b => b.id === brandId);
    showToast({
      title: isFollowing ? 'Takip Bırakıldı' : 'Takip Ediliyor',
      message: `${brand?.name || 'Marka'} artık ${isFollowing ? 'takip etmiyorsunuz' : 'takip ediyorsunuz'}. Yeni stiller keşfetmek ister misin?`,
      type: isFollowing ? 'info' : 'success',
      autoClose: false,
      showPremium: !isFollowing,
    });
  };

  const handleStyleInspire = async (brandId) => {
    const brand = brands.find(b => b.id === brandId);
    if (!brand) return;

    try {
      const suggestion = await aiAdvisorService.getStyleAdvice(brand.name, brand.category);
      showToast({
        title: '✨ Stil İlhamı',
        message: `${brand.name} tarzı için öneriler hazır!`,
        type: 'success',
        autoClose: false,
        showPremium: true,
      });
    } catch (error) {
      console.error('Stil önerisi hatası:', error);
      showToast({
        title: '✨ Stil İlhamı',
        message: `${brand.name} tarzı için sade, şık ve rahat parçalar tercih et.`,
        type: 'success',
        autoClose: false,
        showPremium: true,
      });
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadFollowing();
    await loadBrands();
    await initializeServices();
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  const handleCategorySelect = (categoryId) => {
    setSelectedCategory(categoryId);
    flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
  };

  // ============================================================
  // 📌 LIST HEADER
  // ============================================================
  const ListHeader = () => (
    <>
      <StyleIdentityCards onCardPress={(item) => {
        if (item === 'seeAll') {
          showToast({
            title: 'Tüm Stiller',
            message: 'Tüm stil kimliği kartları gösteriliyor.',
            type: 'info',
            autoClose: true,
            autoCloseDelay: 1500,
          });
        } else {
          showToast({
            title: 'Stil Detayı',
            message: `${item.title} stili detayları gösteriliyor.`,
            type: 'info',
            autoClose: true,
            autoCloseDelay: 1500,
          });
        }
      }} />

      <MyCollection 
        items={collectionItems} 
        onItemPress={(item) => {
          if (item === 'seeAll') {
            showToast({
              title: 'Tüm Koleksiyon',
              message: 'Tüm koleksiyon öğeleri gösteriliyor.',
              type: 'info',
              autoClose: true,
              autoCloseDelay: 1500,
            });
          } else {
            showToast({
              title: 'Ürün Detayı',
              message: `${item.name} ürün detayları gösteriliyor.`,
              type: 'info',
              autoClose: true,
              autoCloseDelay: 1500,
            });
          }
        }}
      />

      <PremiumInfoCard onPress={() => {
        showToast({
          title: '✨ Premium',
          message: 'Premium özellikler gösteriliyor. Stil ilhamı almak ister misin?',
          type: 'success',
          autoClose: false,
          showPremium: true,
        });
      }} />

      <TouchableOpacity 
        style={[styles.aiCard, { borderColor: colors.border }]}
        onPress={() => setAiModalVisible(true)}
        activeOpacity={0.85}
      >
        <LinearGradient
          colors={['#1a1a1a', '#2d2d2d', '#1a1a1a']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.aiCardGradient}
        >
          <View style={styles.aiCardContent}>
            <View style={styles.aiCardHeader}>
              <View style={[styles.aiCardIconContainer, { backgroundColor: 'rgba(255,255,255,0.1)' }]}>
                <Ionicons name="color-wand" size={24} color={colors.primary || COLORS.white} />
              </View>
              <View style={[styles.aiCardBadge, { backgroundColor: 'rgba(255,255,255,0.1)' }]}>
                <View style={[styles.aiCardBadgeDot, { backgroundColor: '#4CAF50' }]} />
                <Text style={[styles.aiCardBadgeText, { color: COLORS.white }]}>AKTİF</Text>
              </View>
            </View>
            
            <Text style={[styles.aiCardTitle, { color: COLORS.white }]}>AI Stil Danışmanı</Text>
            <Text style={[styles.aiCardSubtitle, { color: 'rgba(255,255,255,0.7)' }]}>
              💬 "Marka önerileri, kombin fikirleri ve stil ipuçları için AI danışmanını aktif et!"
            </Text>
            
            <View style={styles.aiCardFeatures}>
              <View style={[styles.aiCardFeature, { backgroundColor: 'rgba(255,255,255,0.05)' }]}>
                <Ionicons name="chatbubble-ellipses" size={14} color={colors.primary || COLORS.white} />
                <Text style={[styles.aiCardFeatureText, { color: 'rgba(255,255,255,0.6)' }]}>7/24 Sohbet</Text>
              </View>
              <View style={[styles.aiCardFeature, { backgroundColor: 'rgba(255,255,255,0.05)' }]}>
                <Ionicons name="bulb-outline" size={14} color={colors.primary || COLORS.white} />
                <Text style={[styles.aiCardFeatureText, { color: 'rgba(255,255,255,0.6)' }]}>Stil Öneri</Text>
              </View>
              <View style={[styles.aiCardFeature, { backgroundColor: 'rgba(255,255,255,0.05)' }]}>
                <Ionicons name="business-outline" size={14} color={colors.primary || COLORS.white} />
                <Text style={[styles.aiCardFeatureText, { color: 'rgba(255,255,255,0.6)' }]}>Marka Analizi</Text>
              </View>
            </View>
            
            <View style={[styles.aiCardButton, { backgroundColor: colors.primary || COLORS.white }]}>
              <Text style={[styles.aiCardButtonText, { color: colors.background }]}>SOHBET BAŞLAT</Text>
              <Ionicons name="arrow-forward" size={14} color={colors.background} />
            </View>
          </View>
        </LinearGradient>
      </TouchableOpacity>

      <View style={styles.categorySection}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.categoriesScroll}
          contentContainerStyle={styles.categoriesContent}
        >
          {BRAND_CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              style={[styles.categoryChip, selectedCategory === cat.id && styles.categoryChipActive, { borderColor: colors.border, backgroundColor: selectedCategory === cat.id ? colors.primary || colors.text : colors.surface }]}
              onPress={() => handleCategorySelect(cat.id)}
            >
              <Ionicons 
                name={cat.icon} 
                size={12} 
                color={selectedCategory === cat.id ? colors.background : colors.textSecondary} 
              />
              <Text style={[styles.categoryChipText, selectedCategory === cat.id && styles.categoryChipTextActive, { color: selectedCategory === cat.id ? colors.background : colors.text }]}>
                {cat.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </>
  );

  // ============================================================
  // 📌 RENDER
  // ============================================================
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />
      
      <View style={styles.header}>
        <Text style={[styles.logoText, { color: colors.text }]}>TASARIMCIM</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.headerButton} onPress={() => setAiModalVisible(true)}>
            <Ionicons name="color-wand-outline" size={20} color={colors.text} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.searchContainer}>
        <View style={[styles.searchBar, { borderColor: colors.border, backgroundColor: colors.surface }]}>
          <Ionicons name="search-outline" size={16} color={colors.textSecondary} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Marka ara..."
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={(text) => setSearchQuery(text)}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={14} color={colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <FlatList
        ref={flatListRef}
        data={getFilteredBrands()}
        renderItem={({ item }) => (
          <BrandCard
            item={item}
            onPress={() => {
              setSelectedBrand(item);
              setBrandPanelVisible(true);
            }}
            onFollow={handleFollow}
            onStyleInspire={handleStyleInspire}
            isFollowing={following.includes(item.id)}
          />
        )}
        keyExtractor={item => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.text} colors={[colors.text]} />}
        ListHeaderComponent={ListHeader}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Ionicons name="business-outline" size={48} color={colors.textSecondary} />
            <Text style={[styles.emptyTitle, { color: colors.text }]}>MARKA BULUNAMADI</Text>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              {searchQuery ? `"${searchQuery}" ile eşleşen marka yok` : 'Filtreleri değiştir veya yeniden dene'}
            </Text>
            {(searchQuery || selectedCategory !== 'all') && (
              <TouchableOpacity 
                style={[styles.clearButton, { borderColor: colors.border }]} 
                onPress={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                }}
              >
                <Text style={[styles.clearButtonText, { color: colors.text }]}>FİLTRELERİ TEMİZLE</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      />

      <AIConversationModal 
        visible={aiModalVisible}
        onClose={() => setAiModalVisible(false)}
      />

      <BrandDetailPanel
        visible={brandPanelVisible}
        brand={selectedBrand}
        onClose={() => {
          setBrandPanelVisible(false);
          setSelectedBrand(null);
        }}
        isFollowing={selectedBrand ? following.includes(selectedBrand.id) : false}
        onFollow={handleFollow}
      />
    </SafeAreaView>
  );
};

// ============================================================
// 📌 STILLER
// ============================================================
const styles = StyleSheet.create({
  container: { flex: 1 },
  
  header: { 
    paddingHorizontal: 20, 
    paddingTop: Platform.OS === 'ios' ? 12 : 16, 
    paddingBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logoText: { 
    fontSize: 16, 
    fontWeight: '600', 
    letterSpacing: 2,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 16,
  },
  headerButton: {
    padding: 4,
  },
  
  searchContainer: { 
    paddingHorizontal: 20, 
    paddingVertical: 8,
    marginBottom: 4,
  },
  searchBar: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    borderWidth: 0.5, 
    paddingHorizontal: 16, 
    paddingVertical: 8,
    borderRadius: 8,
  },
  searchInput: { 
    flex: 1, 
    marginLeft: 8, 
    fontSize: 14,
    padding: 0,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  
  listContent: { 
    paddingBottom: 100,
    paddingHorizontal: 20,
  },

  // STİL KİMLİĞİ KARTLARI
  styleIdentityContainer: {
    marginBottom: 16,
  },
  styleIdentityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  styleIdentityTitle: {
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 1,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  styleIdentitySeeAll: {
    fontSize: 10,
    fontWeight: '400',
    letterSpacing: 0.5,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  styleIdentityList: {
    gap: 8,
  },
  styleIdentityCard: {
    width: 160,
    height: 200,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 0.5,
    marginRight: 10,
  },
  styleIdentityImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  styleIdentityOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 10,
  },
  styleIdentityContent: {
    gap: 4,
  },
  styleIdentityCardTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  styleIdentityStats: {
    flexDirection: 'row',
    gap: 12,
  },
  styleIdentityStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  styleIdentityStatText: {
    fontSize: 10,
    color: '#FFFFFF',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },

  // KOLEKSİYONUM
  collectionContainer: {
    marginBottom: 16,
  },
  collectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  collectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 1,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  collectionSeeAll: {
    fontSize: 10,
    fontWeight: '400',
    letterSpacing: 0.5,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  collectionList: {
    gap: 8,
  },
  collectionItem: {
    width: 110,
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 0.5,
    marginRight: 10,
  },
  collectionItemImage: {
    width: '100%',
    height: 140,
    resizeMode: 'cover',
  },
  collectionItemInfo: {
    padding: 8,
    gap: 2,
  },
  collectionItemName: {
    fontSize: 11,
    fontWeight: '500',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  collectionItemBrand: {
    fontSize: 9,
    fontWeight: '400',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  collectionItemPrice: {
    fontSize: 11,
    fontWeight: '600',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  collectionEmptyContainer: {
    padding: 30,
    borderRadius: 12,
    borderWidth: 0.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  collectionEmptyTitle: {
    fontSize: 13,
    fontWeight: '500',
    marginTop: 8,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  collectionEmptyText: {
    fontSize: 10,
    fontWeight: '400',
    textAlign: 'center',
    marginTop: 4,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },

  // PREMİUM BİLGİLENDİRME KARTI
  premiumCard: {
    borderRadius: 14,
    overflow: 'hidden',
    marginBottom: 16,
    borderWidth: 0.5,
  },
  premiumCardContent: {
    padding: 16,
    gap: 12,
  },
  premiumCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  premiumCardIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,215,0,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  premiumCardBadge: {
    backgroundColor: 'rgba(255,215,0,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
  },
  premiumCardBadgeText: {
    fontSize: 8,
    fontWeight: '700',
    color: '#FFD700',
    letterSpacing: 1,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  premiumCardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  premiumCardSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    lineHeight: 18,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  premiumCardFeatures: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  premiumCardFeature: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.05)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  premiumCardFeatureText: {
    fontSize: 9,
    color: 'rgba(255,255,255,0.7)',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  premiumCardButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingVertical: 10,
    borderRadius: 10,
    marginTop: 4,
  },
  premiumCardButtonText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: 1,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },

  // AI KART
  aiCard: {
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
  aiCardGradient: {
    padding: 16,
  },
  aiCardContent: {
    gap: 12,
  },
  aiCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  aiCardIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  aiCardBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  aiCardBadgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  aiCardBadgeText: {
    fontSize: 8,
    fontWeight: '600',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  aiCardTitle: {
    fontSize: 20,
    fontWeight: '700',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  aiCardSubtitle: {
    fontSize: 13,
    lineHeight: 20,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  aiCardFeatures: {
    flexDirection: 'row',
    gap: 12,
    flexWrap: 'wrap',
  },
  aiCardFeature: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  aiCardFeatureText: {
    fontSize: 9,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  aiCardButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 4,
  },
  aiCardButtonText: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },

  // KATEGORİLER
  categorySection: {
    marginBottom: 12,
  },
  categoriesScroll: {
    marginBottom: 12,
  },
  categoriesContent: {
    gap: 8,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 0.5,
    paddingHorizontal: 16,
    paddingVertical: 6,
    gap: 4,
    borderRadius: 20,
  },
  categoryChipText: {
    fontSize: 10,
    fontWeight: '500',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  categoryChipActive: {
    borderWidth: 1,
  },
  categoryChipTextActive: {
    fontWeight: '600',
  },

  // MARKA KARTI
  brandCard: {
    borderWidth: 0.5,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  brandCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  brandAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 0.5,
  },
  brandInfo: {
    flex: 1,
  },
  brandNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flexWrap: 'wrap',
  },
  brandName: {
    fontSize: 15,
    fontWeight: '600',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  brandTrendBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  brandTrendText: {
    fontSize: 8,
    fontWeight: '700',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  brandCategory: {
    fontSize: 10,
    marginBottom: 2,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  brandStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  brandStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  brandStatText: {
    fontSize: 10,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  brandStatDivider: {
    width: 1,
    height: 12,
  },
  followButton: {
    borderWidth: 0.5,
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderRadius: 4,
  },
  followButtonActive: {
    borderWidth: 1,
  },
  followButtonText: {
    fontSize: 9,
    fontWeight: '600',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  followButtonTextActive: {
    fontWeight: '700',
  },

  // AVANTAJLAR
  brandAdvantages: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 0.5,
  },
  advantageChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 0.5,
    marginRight: 6,
  },
  advantageText: {
    fontSize: 8,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  privilegeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 0.5,
    marginRight: 6,
  },
  privilegeText: {
    fontSize: 8,
    fontWeight: '600',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },

  // STİL İLHAMI
  styleInspireButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 6,
    marginTop: 8,
    borderWidth: 0.5,
    borderRadius: 8,
  },
  styleInspireText: {
    fontSize: 10,
    fontWeight: '500',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },

  // MARKA PANEL
  panelContainer: {
    flex: 1,
  },
  panelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 0.5,
  },
  panelBackButton: {
    padding: 4,
  },
  panelTitle: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  panelHeaderRight: {
    width: 32,
  },
  panelCover: {
    width: '100%',
    height: 180,
    resizeMode: 'cover',
  },
  panelContent: {
    padding: 16,
  },
  panelProfileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 16,
    marginTop: -40,
  },
  panelAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
  },
  panelProfileInfo: {
    flex: 1,
  },
  panelBrandName: {
    fontSize: 20,
    fontWeight: '700',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  panelBrandTitle: {
    fontSize: 13,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  panelBrandLocation: {
    fontSize: 11,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  panelStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderWidth: 0.5,
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  panelStat: {
    alignItems: 'center',
    flex: 1,
  },
  panelStatNumber: {
    fontSize: 18,
    fontWeight: '600',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  panelStatLabel: {
    fontSize: 9,
    marginTop: 2,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  panelStatDivider: {
    width: 0.5,
  },
  panelSectionTitle: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1,
    marginBottom: 12,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  panelCampaigns: {
    marginBottom: 16,
  },
  panelCampaign: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    borderWidth: 0.5,
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  panelCampaignInfo: {
    flex: 1,
  },
  panelCampaignTitle: {
    fontSize: 13,
    fontWeight: '500',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  panelCampaignDate: {
    fontSize: 9,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  panelAnalytics: {
    marginBottom: 16,
  },
  panelAnalyticsGrid: {
    flexDirection: 'row',
    borderWidth: 0.5,
    borderRadius: 8,
    overflow: 'hidden',
  },
  panelAnalyticsItem: {
    flex: 1,
    padding: 12,
    alignItems: 'center',
    borderRightWidth: 0.5,
  },
  panelAnalyticsNumber: {
    fontSize: 20,
    fontWeight: '700',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  panelAnalyticsLabel: {
    fontSize: 9,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  panelTabs: {
    flexDirection: 'row',
    borderWidth: 0.5,
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 16,
  },
  panelTab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
  },
  panelTabActive: {
    borderWidth: 1,
  },
  panelTabText: {
    fontSize: 10,
    fontWeight: '500',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  panelTabTextActive: {
    fontWeight: '700',
  },
  panelTabContent: {
    gap: 16,
  },
  panelDescription: {
    fontSize: 13,
    lineHeight: 20,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  panelSubTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  panelAdvantagesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  panelAdvantageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 0.5,
  },
  panelAdvantageText: {
    fontSize: 10,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  panelPrivilegesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  panelPrivilegeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  panelPrivilegeText: {
    fontSize: 10,
    fontWeight: '600',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  panelDesigns: {
    gap: 8,
  },
  panelDesignItem: {
    width: 140,
    borderWidth: 0.5,
    borderRadius: 8,
    overflow: 'hidden',
    marginRight: 8,
  },
  panelDesignImage: {
    width: 140,
    height: 120,
    resizeMode: 'cover',
  },
  panelDesignTitle: {
    fontSize: 10,
    padding: 4,
    textAlign: 'center',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  panelDesignStats: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingBottom: 4,
  },
  panelDesignStatText: {
    fontSize: 9,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  panelPersonalTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  panelPersonalCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    padding: 16,
    borderWidth: 0.5,
    borderRadius: 12,
    marginBottom: 16,
  },
  panelPersonalInfo: {
    flex: 1,
  },
  panelPersonalText: {
    fontSize: 13,
    fontWeight: '500',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  panelPersonalSubText: {
    fontSize: 10,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  panelPersonalRecommendations: {
    gap: 12,
  },
  panelPersonalRecItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    padding: 12,
    borderWidth: 0.5,
    borderRadius: 12,
  },
  panelPersonalRecImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  panelPersonalRecInfo: {
    flex: 1,
  },
  panelPersonalRecTitle: {
    fontSize: 13,
    fontWeight: '500',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  panelPersonalRecDesc: {
    fontSize: 10,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  panelPersonalRecButton: {
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderRadius: 4,
  },
  panelPersonalRecButtonText: {
    fontSize: 9,
    fontWeight: '600',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  panelFooter: {
    flexDirection: 'row',
    gap: 16,
    padding: 16,
    borderTopWidth: 0.5,
  },
  panelFollowButton: {
    flex: 1,
    borderWidth: 0.5,
    paddingVertical: 14,
    alignItems: 'center',
    borderRadius: 8,
  },
  panelFollowButtonActive: {
    borderWidth: 1,
  },
  panelFollowText: {
    fontSize: 12,
    fontWeight: '600',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  panelFollowTextActive: {
    fontWeight: '700',
  },
  panelInspireButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 14,
    borderRadius: 8,
  },
  panelInspireText: {
    fontSize: 12,
    fontWeight: '600',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },

  // EMPTY STATE
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 32,
    minHeight: 300,
  },
  emptyTitle: {
    marginTop: 16,
    marginBottom: 4,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  emptyText: {
    fontSize: 9,
    textAlign: 'center',
    marginBottom: 16,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  clearButton: {
    borderWidth: 0.5,
    paddingHorizontal: 32,
    paddingVertical: 8,
    borderRadius: 8,
  },
  clearButtonText: {
    fontSize: 9,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },

  // AI MODAL
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 0.5,
  },
  modalBackButton: {
    padding: 4,
  },
  modalHeaderCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  modalHeaderAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalHeaderTitle: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  modalHeaderStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  modalHeaderStatusText: {
    fontSize: 9,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  modalResetButton: {
    padding: 4,
  },
  messagesList: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    flexGrow: 1,
  },
  messageWrapper: {
    flexDirection: 'row',
    marginBottom: 12,
    maxWidth: '85%',
  },
  aiMessageWrapper: {
    alignSelf: 'flex-start',
  },
  userMessageWrapper: {
    alignSelf: 'flex-end',
  },
  aiAvatarContainer: {
    marginRight: 8,
    alignSelf: 'flex-end',
  },
  aiAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  messageBubble: {
    padding: 12,
    borderRadius: 12,
    maxWidth: '100%',
  },
  aiBubble: {
    borderTopLeftRadius: 4,
  },
  userBubble: {
    borderTopRightRadius: 4,
  },
  messageText: {
    fontSize: 13,
    lineHeight: 20,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  messageTime: {
    fontSize: 8,
    marginTop: 4,
    alignSelf: 'flex-end',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderTopWidth: 0.5,
    gap: 8,
  },
  input: {
    flex: 1,
    fontSize: 14,
    maxHeight: 100,
    padding: 10,
    borderWidth: 0.5,
    borderRadius: 8,
    minHeight: 40,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
});

export default TasarimcimScreen;