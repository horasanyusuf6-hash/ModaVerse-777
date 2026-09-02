// 📁 src/screens/HomeScreen.js - LÜKS MİNİMALİST VERSİYON
import React, { useState, useRef } from 'react';
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
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY, SIZES } from '../constants/Theme';

const { width: screenWidth } = Dimensions.get('window');

// MOCK DATA
const mockData = [
  {
    id: 1,
    brand: "ZARA",
    name: "Oversize Blazer",
    price: 799,
    image: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=400",
    category: "Blazer",
    material: "Yün",
    isNew: true
  },
  {
    id: 2,
    brand: "Nike",
    name: "Air Force 1",
    price: 899,
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400",
    category: "Ayakkabı",
    material: "Deri",
    isNew: false
  },
  {
    id: 3,
    brand: "Mango",
    name: "Trençkot",
    price: 1299,
    image: "https://images.unsplash.com/photo-1539533113208-f6df8cc8b543?w=400",
    category: "Dış Giyim",
    material: "Pamuk",
    isNew: true
  },
  {
    id: 4,
    brand: "Prada",
    name: "Sandalet",
    price: 2499,
    image: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400",
    category: "Ayakkabı",
    material: "Deri",
    isNew: false
  }
];

const featuredDesigners = [
  {
    id: '1',
    name: 'Zara Creative',
    category: 'Fast Fashion',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100'
  },
  {
    id: '2',
    name: 'Nike Design',
    category: 'Sportswear',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100'
  },
  {
    id: '3',
    name: 'Mango Studio',
    category: 'Premium',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100'
  },
  {
    id: '4',
    name: 'Prada Atelier',
    category: 'Luxury',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100'
  }
];

const explorePosts = [
  {
    id: 'post1',
    userName: 'StyleHunter',
    userAvatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100',
    time: '2 saat önce',
    content: 'Bugünkü kombinim: Oversize blazer ve vintage jean. Sizce nasıl?',
    likes: 1420,
    comments: 89,
    product: {
      id: '1',
      brand: 'ZARA',
      name: 'Oversize Blazer',
      price: 799,
      image: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=400',
      material: 'Yün',
      fit: 'Oversize',
      combination: 'Beyaz tişört + Siyah pantolon'
    }
  },
  {
    id: 'post2',
    userName: 'SneakerHead',
    userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
    time: '5 saat önce',
    content: 'Yeni Air Force 1\'lerim geldi! Klasik her zaman kazanır 👟',
    likes: 2890,
    comments: 142,
    product: {
      id: '2',
      brand: 'Nike',
      name: 'Air Force 1',
      price: 899,
      image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400',
      material: 'Deri',
      fit: 'Regular',
      combination: 'Spor kıyafet + Şort'
    }
  }
];

const HomeScreen = () => {
  const [activeTab, setActiveTab] = useState('explore');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [favorites, setFavorites] = useState([]);
  const searchAnimation = useRef(new Animated.Value(0)).current;

  const toggleFavorite = (itemId) => {
    setFavorites(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const formatNumber = (num) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

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

  const MenuButton = () => (
    <TouchableOpacity style={styles.menuButton}>
      <View style={styles.menuLine} />
      <View style={[styles.menuLine, { width: 18 }]} />
      <View style={[styles.menuLine, { width: 14 }]} />
    </TouchableOpacity>
  );

  const toggleSearch = () => {
    if (showSearch) {
      Animated.timing(searchAnimation, {
        toValue: 0,
        duration: 300,
        useNativeDriver: false,
      }).start(() => setShowSearch(false));
    } else {
      setShowSearch(true);
      Animated.timing(searchAnimation, {
        toValue: 1,
        duration: 300,
        useNativeDriver: false,
      }).start();
    }
  };

  const FeaturedDesigners = () => (
    <View style={styles.designersSection}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>SEÇİLEN TASARIMCILAR</Text>
        <TouchableOpacity>
          <Text style={styles.seeAllText}>TÜMÜ</Text>
        </TouchableOpacity>
      </View>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false} 
        contentContainerStyle={styles.designersScroll}
      >
        {featuredDesigners?.map((designer) => (
          <TouchableOpacity key={designer.id} style={styles.designerCard}>
            <Image source={{ uri: designer.avatar }} style={styles.designerAvatar} />
            <View style={styles.designerInfo}>
              <Text style={styles.designerName}>{designer.name}</Text>
              <Text style={styles.designerCategory}>{designer.category}</Text>
              <View style={styles.followButton}>
                <Text style={styles.followText}>TAKİP ET</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const ExplorePostCard = ({ item }) => {
    const isFavorite = favorites.includes(item.product?.id);
    return (
      <View style={styles.postCard}>
        <View style={styles.postHeader}>
          <Image source={{ uri: item.userAvatar }} style={styles.userAvatar} />
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{item.userName}</Text>
            <Text style={styles.postTime}>{item.time}</Text>
          </View>
          <TouchableOpacity>
            <Ionicons name="ellipsis-horizontal" size={18} color={COLORS.grayMedium} />
          </TouchableOpacity>
        </View>
        <Text style={styles.postContent}>{item.content}</Text>
        {item.product && (
          <TouchableOpacity style={styles.productDisplay}>
            <Image source={{ uri: item.product.image }} style={styles.productDisplayImage} />
            <View style={styles.productDisplayInfo}>
              <Text style={styles.productDisplayBrand}>{item.product.brand}</Text>
              <Text style={styles.productDisplayName}>{item.product.name}</Text>
              <View style={styles.productFeatures}>
                <View style={styles.featureTag}>
                  <Text style={styles.featureText}>{item.product.material}</Text>
                </View>
                <View style={styles.featureTag}>
                  <Text style={styles.featureText}>{item.product.fit}</Text>
                </View>
              </View>
              <View style={styles.combinationSection}>
                <Text style={styles.combinationTitle}>KOMBİN ÖNERİSİ</Text>
                <Text style={styles.combinationText}>{item.product.combination}</Text>
              </View>
              <View style={styles.productActions}>
                <Text style={styles.productPrice}>₺{item.product.price}</Text>
                <TouchableOpacity onPress={() => toggleFavorite(item.product.id)}>
                  <Ionicons 
                    name={isFavorite ? "heart" : "heart-outline"} 
                    size={16} 
                    color={isFavorite ? COLORS.black : COLORS.grayMedium} 
                  />
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        )}
        <View style={styles.postActions}>
          <TouchableOpacity style={styles.postAction}>
            <Ionicons name="heart-outline" size={18} color={COLORS.grayMedium} />
            <Text style={styles.actionText}>{formatNumber(item.likes)}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.postAction}>
            <Ionicons name="chatbubble-outline" size={18} color={COLORS.grayMedium} />
            <Text style={styles.actionText}>{formatNumber(item.comments)}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.postAction}>
            <Ionicons name="share-social-outline" size={18} color={COLORS.grayMedium} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.saveButton}>
            <Ionicons name="bookmark-outline" size={18} color={COLORS.grayMedium} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const ExploreFeed = () => (
    <FlatList
      data={explorePosts || []}
      renderItem={({ item }) => <ExplorePostCard item={item} />}
      keyExtractor={item => item.id}
      showsVerticalScrollIndicator={false}
      ListHeaderComponent={
        <>
          <FeaturedDesigners />
          <View style={styles.storiesSection}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {[...Array(8)].map((_, i) => (
                <TouchableOpacity key={i} style={styles.storyCircle}>
                  <Image source={{ uri: `https://i.pravatar.cc/100?img=${i + 1}` }} style={styles.storyImage} />
                  <Text style={styles.storyName}>Kullanıcı{i + 1}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </>
      }
      contentContainerStyle={styles.feedContent}
    />
  );

  const ShopGrid = () => {
    const ProductCard = ({ item }) => {
      const isFavorite = favorites.includes(item.id);
      return (
        <TouchableOpacity style={styles.shopProductCard}>
          <View style={styles.shopImageContainer}>
            <Image source={{ uri: item.image }} style={styles.shopProductImage} />
            <TouchableOpacity style={styles.shopFavoriteButton} onPress={() => toggleFavorite(item.id)}>
              <Ionicons 
                name={isFavorite ? "heart" : "heart-outline"} 
                size={14} 
                color={isFavorite ? COLORS.black : COLORS.white} 
              />
            </TouchableOpacity>
            {item.isNew && (
              <View style={styles.shopNewBadge}>
                <Text style={styles.shopNewBadgeText}>YENİ</Text>
              </View>
            )}
          </View>
          <View style={styles.shopProductInfo}>
            <Text style={styles.shopBrandName}>{item.brand}</Text>
            <Text style={styles.shopProductName} numberOfLines={2}>{item.name}</Text>
            <View style={styles.shopFeatures}>
              <Text style={styles.shopFeatureText}>{item.category}</Text>
              {item.material && <Text style={styles.shopFeatureText}>• {item.material}</Text>}
            </View>
            <Text style={styles.shopProductPrice}>₺{item.price}</Text>
          </View>
        </TouchableOpacity>
      );
    };
    
    return (
      <FlatList
        data={mockData}
        renderItem={({ item }) => <ProductCard item={item} />}
        keyExtractor={item => item?.id?.toString()}
        numColumns={2}
        contentContainerStyle={styles.shopGrid}
        columnWrapperStyle={styles.columnWrapper}
        ListHeaderComponent={
          <View style={styles.shopHeader}>
            <Text style={styles.shopTitle}>MODA KOLEKSİYONU</Text>
            <Text style={styles.shopSubtitle}>Sezonun en iyi parçaları</Text>
          </View>
        }
      />
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
      
      <View style={styles.header}>
        <MenuButton />
        <View style={styles.logoContainer}>
          <Text style={styles.logo}>VİTRİNİM</Text>
          <Text style={styles.subtitle}>MODA EVRENİ</Text>
        </View>
        <TouchableOpacity onPress={toggleSearch} style={styles.searchIcon}>
          <Ionicons name="search-outline" size={20} color={COLORS.black} />
        </TouchableOpacity>
      </View>
      
      {showSearch && (
        <Animated.View style={[
          styles.searchContainer, 
          { 
            opacity: searchAnimation, 
            height: searchAnimation.interpolate({ 
              inputRange: [0, 1], 
              outputRange: [0, 56] 
            }) 
          }
        ]}>
          <View style={styles.searchBar}>
            <Ionicons name="search-outline" size={16} color={COLORS.grayMedium} />
            <TextInput 
              style={styles.searchInput} 
              placeholder="Tasarımcı, ürün veya trend ara..." 
              placeholderTextColor={COLORS.grayMedium}
              value={searchQuery} 
              onChangeText={setSearchQuery} 
            />
          </View>
        </Animated.View>
      )}
      
      <TabToggle />
      
      {activeTab === 'explore' ? <ExploreFeed /> : <ShopGrid />}
    </SafeAreaView>
  );
};

// ============ STILLER ============
const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: COLORS.white 
  },
  
  // Header
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    paddingHorizontal: SIZES.lg, 
    paddingTop: Platform.OS === 'ios' ? 12 : SIZES.md, 
    paddingBottom: SIZES.md 
  },
  menuButton: { 
    padding: SIZES.xs,
    width: 40,
  },
  menuLine: { 
    width: 20, 
    height: 1, 
    backgroundColor: COLORS.black, 
    marginVertical: 3 
  },
  logoContainer: { 
    alignItems: 'center' 
  },
  logo: { 
    ...TYPOGRAPHY.caption,
    fontSize: 16,
    letterSpacing: 3, 
  },
  subtitle: { 
    ...TYPOGRAPHY.caption,
    fontSize: 8,
    color: COLORS.grayMedium, 
    letterSpacing: 1, 
    marginTop: 2 
  },
  searchIcon: {
    padding: SIZES.xs,
    width: 40,
    alignItems: 'flex-end',
  },
  
  // Search
  searchContainer: { 
    paddingHorizontal: SIZES.lg, 
    overflow: 'hidden' 
  },
  searchBar: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: COLORS.white, 
    paddingHorizontal: SIZES.md, 
    paddingVertical: SIZES.sm, 
    borderWidth: 0.5, 
    borderColor: COLORS.grayLight 
  },
  searchInput: { 
    flex: 1, 
    marginLeft: SIZES.md, 
    ...TYPOGRAPHY.body,
    color: COLORS.black 
  },
  
  // Toggle
  toggleContainer: { 
    flexDirection: 'row', 
    marginHorizontal: SIZES.lg, 
    marginBottom: SIZES.lg, 
    borderWidth: 0.5, 
    borderColor: COLORS.grayLight 
  },
  toggleButton: { 
    flex: 1, 
    paddingVertical: SIZES.sm, 
    alignItems: 'center' 
  },
  toggleButtonActive: { 
    backgroundColor: COLORS.black 
  },
  toggleText: { 
    ...TYPOGRAPHY.caption,
    color: COLORS.grayMedium 
  },
  toggleTextActive: { 
    color: COLORS.white 
  },
  
  // Designers Section
  designersSection: { 
    paddingHorizontal: SIZES.lg, 
    marginBottom: SIZES.lg 
  },
  designersScroll: { 
    paddingRight: SIZES.lg 
  },
  sectionHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: SIZES.md 
  },
  sectionTitle: { 
    ...TYPOGRAPHY.caption,
  },
  seeAllText: { 
    ...TYPOGRAPHY.caption,
    color: COLORS.grayMedium 
  },
  designerCard: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: COLORS.white, 
    padding: SIZES.md, 
    marginRight: SIZES.md, 
    width: screenWidth * 0.65, 
    borderWidth: 0.5, 
    borderColor: COLORS.grayLight 
  },
  designerAvatar: { 
    width: 50, 
    height: 50, 
    borderWidth: 0.5,
    borderColor: COLORS.grayLight,
    marginRight: SIZES.md 
  },
  designerInfo: { 
    flex: 1 
  },
  designerName: { 
    ...TYPOGRAPHY.body,
    fontWeight: '500', 
    marginBottom: 2 
  },
  designerCategory: { 
    ...TYPOGRAPHY.caption,
    color: COLORS.grayMedium, 
    marginBottom: SIZES.sm 
  },
  followButton: { 
    alignSelf: 'flex-start', 
    paddingHorizontal: SIZES.md, 
    paddingVertical: 2, 
    borderWidth: 0.5, 
    borderColor: COLORS.black 
  },
  followText: { 
    ...TYPOGRAPHY.caption,
    color: COLORS.black,
    fontSize: 9,
  },
  
  // Stories
  storiesSection: { 
    paddingHorizontal: SIZES.lg, 
    marginBottom: SIZES.lg 
  },
  storyCircle: { 
    alignItems: 'center', 
    marginRight: SIZES.md 
  },
  storyImage: { 
    width: 56, 
    height: 56, 
    borderWidth: 0.5,
    borderColor: COLORS.grayLight,
    marginBottom: SIZES.xs,
    backgroundColor: COLORS.surface,
  },
  storyName: { 
    ...TYPOGRAPHY.caption,
    fontSize: 9,
    color: COLORS.grayMedium 
  },
  
  feedContent: { 
    paddingBottom: SIZES.xl 
  },
  
  // Post Card
  postCard: { 
    backgroundColor: COLORS.white, 
    marginBottom: SIZES.lg, 
    paddingHorizontal: SIZES.lg 
  },
  postHeader: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginBottom: SIZES.md 
  },
  userAvatar: { 
    width: 40, 
    height: 40, 
    borderWidth: 0.5,
    borderColor: COLORS.grayLight,
    marginRight: SIZES.md 
  },
  userInfo: { 
    flex: 1 
  },
  userName: { 
    ...TYPOGRAPHY.body,
    fontWeight: '500', 
    marginBottom: 2 
  },
  postTime: { 
    ...TYPOGRAPHY.caption,
    color: COLORS.grayMedium 
  },
  postContent: { 
    ...TYPOGRAPHY.body,
    lineHeight: 20, 
    marginBottom: SIZES.md 
  },
  
  // Product Display
  productDisplay: { 
    flexDirection: 'row', 
    borderWidth: 0.5, 
    borderColor: COLORS.grayLight, 
    marginBottom: SIZES.md 
  },
  productDisplayImage: { 
    width: 90, 
    height: 120, 
    backgroundColor: COLORS.surface 
  },
  productDisplayInfo: { 
    flex: 1, 
    padding: SIZES.md 
  },
  productDisplayBrand: { 
    ...TYPOGRAPHY.caption,
    marginBottom: 2 
  },
  productDisplayName: { 
    ...TYPOGRAPHY.body,
    fontWeight: '500', 
    marginBottom: SIZES.sm 
  },
  productFeatures: { 
    flexDirection: 'row', 
    marginBottom: SIZES.sm 
  },
  featureTag: { 
    paddingHorizontal: SIZES.sm, 
    paddingVertical: 2, 
    borderWidth: 0.5, 
    borderColor: COLORS.grayLight, 
    marginRight: SIZES.xs 
  },
  featureText: { 
    ...TYPOGRAPHY.caption,
    fontSize: 9,
    color: COLORS.grayMedium 
  },
  combinationSection: { 
    marginBottom: SIZES.sm 
  },
  combinationTitle: { 
    ...TYPOGRAPHY.caption,
    fontSize: 9,
    marginBottom: 2 
  },
  combinationText: { 
    ...TYPOGRAPHY.caption,
    fontSize: 9,
    color: COLORS.grayMedium 
  },
  productActions: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center' 
  },
  productPrice: { 
    ...TYPOGRAPHY.body,
    fontWeight: '500', 
  },
  
  // Post Actions
  postActions: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingVertical: SIZES.md, 
    borderTopWidth: 0.5, 
    borderTopColor: COLORS.grayLight 
  },
  postAction: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginRight: SIZES.lg 
  },
  actionText: { 
    ...TYPOGRAPHY.caption,
    marginLeft: 4 
  },
  saveButton: { 
    marginLeft: 'auto' 
  },
  
  // Shop Grid
  shopHeader: { 
    paddingHorizontal: SIZES.sm, 
    paddingTop: SIZES.sm, 
    paddingBottom: SIZES.lg, 
    alignItems: 'center' 
  },
  shopTitle: { 
    ...TYPOGRAPHY.title3,
    fontSize: 18,
    marginBottom: 4 
  },
  shopSubtitle: { 
    ...TYPOGRAPHY.caption,
    color: COLORS.grayMedium 
  },
  shopGrid: { 
    paddingHorizontal: SIZES.md, 
    paddingBottom: SIZES.xl 
  },
  columnWrapper: { 
    justifyContent: 'space-between', 
    marginBottom: SIZES.md 
  },
  shopProductCard: { 
    flex: 1, 
    maxWidth: '48%' 
  },
  shopImageContainer: { 
    position: 'relative', 
    marginBottom: SIZES.md 
  },
  shopProductImage: { 
    width: '100%', 
    height: 200, 
    borderWidth: 0.5,
    borderColor: COLORS.grayLight,
    backgroundColor: COLORS.surface 
  },
  shopFavoriteButton: { 
    position: 'absolute', 
    top: SIZES.sm, 
    right: SIZES.sm, 
    backgroundColor: COLORS.black, 
    padding: 4 
  },
  shopNewBadge: { 
    position: 'absolute', 
    bottom: SIZES.sm, 
    left: SIZES.sm, 
    borderWidth: 0.5, 
    borderColor: COLORS.black,
    paddingHorizontal: SIZES.sm, 
    paddingVertical: 2 
  },
  shopNewBadgeText: { 
    ...TYPOGRAPHY.caption,
    fontSize: 8,
    color: COLORS.black 
  },
  shopProductInfo: { 
    paddingHorizontal: 2 
  },
  shopBrandName: { 
    ...TYPOGRAPHY.caption,
    marginBottom: 2 
  },
  shopProductName: { 
    ...TYPOGRAPHY.body,
    fontWeight: '500', 
    marginBottom: 4 
  },
  shopFeatures: { 
    flexDirection: 'row', 
    marginBottom: 4 
  },
  shopFeatureText: { 
    ...TYPOGRAPHY.caption,
    fontSize: 9,
    color: COLORS.grayMedium, 
    marginRight: 4 
  },
  shopProductPrice: { 
    ...TYPOGRAPHY.body,
    fontWeight: '500', 
  },
});

export default HomeScreen;