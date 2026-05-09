// HomeScreen.js - SADECE HATALAR DÜZELTİLDİ
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
  Animated
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// ✅ MOCK DATA (import edilen dosya olmadığı için inline tanımlandı)
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
  sand: '#D7C1A9',
  taupe: '#B8A99A',
  blush: '#E8D4C6',
  accent: '#8C7853',
};

const { width: screenWidth } = Dimensions.get('window');

// 🎯 TASARIMCI VERİSİ
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

// 📱 EXPLORE POSTS VERİSİ
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

  const TabToggle = () => (
    <View style={styles.toggleContainer}>
      <TouchableOpacity
        style={[styles.toggleButton, activeTab === 'explore' && styles.toggleButtonActive]}
        onPress={() => setActiveTab('explore')}
      >
        <Text style={[styles.toggleText, activeTab === 'explore' && styles.toggleTextActive]}>Keşfet</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.toggleButton, activeTab === 'shop' && styles.toggleButtonActive]}
        onPress={() => setActiveTab('shop')}
      >
        <Text style={[styles.toggleText, activeTab === 'shop' && styles.toggleTextActive]}>Mağaza</Text>
      </TouchableOpacity>
    </View>
  );

  const MenuButton = () => (
    <TouchableOpacity style={styles.menuButton}>
      <View style={styles.menuLine} />
      <View style={[styles.menuLine, { width: 20 }]} />
      <View style={[styles.menuLine, { width: 16 }]} />
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
        <Text style={styles.sectionTitle}>Seçilen Tasarımcılar</Text>
        <TouchableOpacity><Text style={styles.seeAllText}>Tümü</Text></TouchableOpacity>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.designersScroll}>
        {featuredDesigners?.map((designer) => (
          <TouchableOpacity key={designer.id} style={styles.designerCard}>
            <Image source={{ uri: designer.avatar }} style={styles.designerAvatar} />
            <View style={styles.designerInfo}>
              <Text style={styles.designerName}>{designer.name}</Text>
              <Text style={styles.designerCategory}>{designer.category}</Text>
              <View style={styles.followButton}><Text style={styles.followText}>Takip Et</Text></View>
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
          <TouchableOpacity><Ionicons name="ellipsis-horizontal" size={20} color={COLORS.ash} /></TouchableOpacity>
        </View>
        <Text style={styles.postContent}>{item.content}</Text>
        {item.product && (
          <TouchableOpacity style={styles.productDisplay}>
            <Image source={{ uri: item.product.image }} style={styles.productDisplayImage} />
            <View style={styles.productDisplayInfo}>
              <Text style={styles.productDisplayBrand}>{item.product.brand}</Text>
              <Text style={styles.productDisplayName}>{item.product.name}</Text>
              <View style={styles.productFeatures}>
                <View style={styles.featureTag}><Text style={styles.featureText}>{item.product.material}</Text></View>
                <View style={styles.featureTag}><Text style={styles.featureText}>{item.product.fit}</Text></View>
              </View>
              <View style={styles.combinationSection}>
                <Text style={styles.combinationTitle}>👗 Kombin Önerisi:</Text>
                <Text style={styles.combinationText}>{item.product.combination}</Text>
              </View>
              <View style={styles.productActions}>
                <Text style={styles.productPrice}>₺{item.product.price}</Text>
                <TouchableOpacity onPress={() => toggleFavorite(item.product.id)}>
                  <Ionicons name={isFavorite ? "heart" : "heart-outline"} size={18} color={isFavorite ? COLORS.accent : COLORS.ash} />
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        )}
        <View style={styles.postActions}>
          <TouchableOpacity style={styles.postAction}><Ionicons name="heart-outline" size={20} color={COLORS.ash} /><Text style={styles.actionText}>{item.likes}</Text></TouchableOpacity>
          <TouchableOpacity style={styles.postAction}><Ionicons name="chatbubble-outline" size={20} color={COLORS.ash} /><Text style={styles.actionText}>{item.comments}</Text></TouchableOpacity>
          <TouchableOpacity style={styles.postAction}><Ionicons name="share-social-outline" size={20} color={COLORS.ash} /></TouchableOpacity>
          <TouchableOpacity style={styles.saveButton}><Ionicons name="bookmark-outline" size={20} color={COLORS.ash} /></TouchableOpacity>
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
              <Ionicons name={isFavorite ? "heart" : "heart-outline"} size={18} color={isFavorite ? COLORS.accent : COLORS.white} />
            </TouchableOpacity>
            {item.isNew && <View style={styles.shopNewBadge}><Text style={styles.shopNewBadgeText}>YENİ</Text></View>}
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
        keyExtractor={item => item?.id?.toString() || Math.random().toString()}
        numColumns={2}
        contentContainerStyle={styles.shopGrid}
        columnWrapperStyle={styles.columnWrapper}
        ListHeaderComponent={
          <View style={styles.shopHeader}>
            <Text style={styles.shopTitle}>Moda Koleksiyonu</Text>
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
          <Text style={styles.subtitle}>Modern Moda Evreni</Text>
        </View>
        <TouchableOpacity onPress={toggleSearch}><Ionicons name="search-outline" size={22} color={COLORS.charcoal} /></TouchableOpacity>
      </View>
      {showSearch && (
        <Animated.View style={[styles.searchContainer, { opacity: searchAnimation, height: searchAnimation.interpolate({ inputRange: [0, 1], outputRange: [0, 60] }) }]}>
          <View style={styles.searchBar}>
            <Ionicons name="search-outline" size={18} color={COLORS.ash} />
            <TextInput style={styles.searchInput} placeholder="Tasarımcı, ürün veya trend ara..." value={searchQuery} onChangeText={setSearchQuery} />
          </View>
        </Animated.View>
      )}
      <TabToggle />
      {activeTab === 'explore' ? <ExploreFeed /> : <ShopGrid />}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 16 },
  menuButton: { padding: 8 },
  menuLine: { width: 24, height: 2, backgroundColor: COLORS.charcoal, marginVertical: 2, borderRadius: 1 },
  logoContainer: { alignItems: 'center' },
  logo: { fontSize: 24, fontWeight: '200', letterSpacing: 3, color: COLORS.charcoal },
  subtitle: { fontSize: 12, fontWeight: '300', color: COLORS.ash, letterSpacing: 1, marginTop: 2 },
  searchContainer: { paddingHorizontal: 20, overflow: 'hidden' },
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.white, paddingHorizontal: 16, paddingVertical: 12, borderRadius: 8, borderWidth: 0.5, borderColor: COLORS.cloud },
  searchInput: { flex: 1, marginLeft: 12, fontSize: 16, fontWeight: '300', color: COLORS.charcoal },
  toggleContainer: { flexDirection: 'row', backgroundColor: COLORS.white, marginHorizontal: 20, marginBottom: 20, borderRadius: 8, padding: 4, borderWidth: 0.5, borderColor: COLORS.cloud },
  toggleButton: { flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: 6 },
  toggleButtonActive: { backgroundColor: COLORS.charcoal },
  toggleText: { fontSize: 15, fontWeight: '300', color: COLORS.ash, letterSpacing: 1 },
  toggleTextActive: { color: COLORS.white, fontWeight: '400' },
  designersSection: { paddingHorizontal: 20, marginBottom: 24 },
  designersScroll: { paddingRight: 20 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '300', color: COLORS.charcoal, letterSpacing: 1 },
  seeAllText: { fontSize: 14, fontWeight: '300', color: COLORS.ash },
  designerCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.white, padding: 16, borderRadius: 12, marginRight: 12, width: screenWidth * 0.7, borderWidth: 0.5, borderColor: COLORS.cloud },
  designerAvatar: { width: 60, height: 60, borderRadius: 30, marginRight: 16 },
  designerInfo: { flex: 1 },
  designerName: { fontSize: 16, fontWeight: '300', color: COLORS.charcoal, marginBottom: 4 },
  designerCategory: { fontSize: 13, fontWeight: '300', color: COLORS.ash, marginBottom: 12 },
  followButton: { alignSelf: 'flex-start', paddingHorizontal: 16, paddingVertical: 6, backgroundColor: COLORS.charcoal, borderRadius: 15 },
  followText: { fontSize: 12, fontWeight: '400', color: COLORS.white },
  storiesSection: { paddingHorizontal: 20, marginBottom: 24 },
  storyCircle: { alignItems: 'center', marginRight: 16 },
  storyImage: { width: 64, height: 64, borderRadius: 32, marginBottom: 8 },
  storyName: { fontSize: 12, fontWeight: '300', color: COLORS.charcoal },
  feedContent: { paddingBottom: 24 },
  postCard: { backgroundColor: COLORS.white, marginBottom: 24, paddingHorizontal: 20 },
  postHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  userAvatar: { width: 40, height: 40, borderRadius: 20, marginRight: 12 },
  userInfo: { flex: 1 },
  userName: { fontSize: 15, fontWeight: '400', color: COLORS.charcoal, marginBottom: 2 },
  postTime: { fontSize: 12, fontWeight: '300', color: COLORS.ash },
  postContent: { fontSize: 15, fontWeight: '300', color: COLORS.charcoal, lineHeight: 22, marginBottom: 16 },
  productDisplay: { flexDirection: 'row', backgroundColor: COLORS.ivory, borderRadius: 12, overflow: 'hidden', marginBottom: 16 },
  productDisplayImage: { width: 100, height: 140 },
  productDisplayInfo: { flex: 1, padding: 16 },
  productDisplayBrand: { fontSize: 11, fontWeight: '400', color: COLORS.ash, textTransform: 'uppercase', marginBottom: 4 },
  productDisplayName: { fontSize: 15, fontWeight: '300', color: COLORS.charcoal, marginBottom: 12 },
  productFeatures: { flexDirection: 'row', marginBottom: 12 },
  featureTag: { paddingHorizontal: 10, paddingVertical: 4, backgroundColor: COLORS.white, borderRadius: 12, marginRight: 8, borderWidth: 0.5, borderColor: COLORS.cloud },
  featureText: { fontSize: 11, fontWeight: '300', color: COLORS.ash },
  combinationSection: { marginBottom: 12 },
  combinationTitle: { fontSize: 13, fontWeight: '400', color: COLORS.charcoal, marginBottom: 4 },
  combinationText: { fontSize: 13, fontWeight: '300', color: COLORS.ash },
  productActions: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  productPrice: { fontSize: 16, fontWeight: '400', color: COLORS.charcoal },
  postActions: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderTopWidth: 0.5, borderTopColor: COLORS.cloud },
  postAction: { flexDirection: 'row', alignItems: 'center', marginRight: 20 },
  actionText: { fontSize: 14, fontWeight: '300', color: COLORS.ash, marginLeft: 6 },
  saveButton: { marginLeft: 'auto' },
  shopHeader: { paddingHorizontal: 8, paddingTop: 8, paddingBottom: 24, alignItems: 'center' },
  shopTitle: { fontSize: 24, fontWeight: '200', color: COLORS.charcoal, letterSpacing: 2, marginBottom: 8 },
  shopSubtitle: { fontSize: 14, fontWeight: '300', color: COLORS.ash },
  shopGrid: { paddingHorizontal: 16, paddingBottom: 24 },
  columnWrapper: { justifyContent: 'space-between', marginBottom: 16 },
  shopProductCard: { flex: 1, maxWidth: '48%', backgroundColor: COLORS.white },
  shopImageContainer: { position: 'relative', marginBottom: 12 },
  shopProductImage: { width: '100%', height: 200, borderRadius: 8 },
  shopFavoriteButton: { position: 'absolute', top: 12, right: 12, backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: 15, padding: 6 },
  shopNewBadge: { position: 'absolute', bottom: 12, left: 12, backgroundColor: COLORS.accent, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 4 },
  shopNewBadgeText: { fontSize: 10, fontWeight: '500', color: COLORS.white },
  shopProductInfo: { paddingHorizontal: 4 },
  shopBrandName: { fontSize: 11, fontWeight: '400', color: COLORS.ash, textTransform: 'uppercase', marginBottom: 4 },
  shopProductName: { fontSize: 14, fontWeight: '300', color: COLORS.charcoal, marginBottom: 8 },
  shopFeatures: { flexDirection: 'row', marginBottom: 8 },
  shopFeatureText: { fontSize: 12, fontWeight: '300', color: COLORS.ash, marginRight: 8 },
  shopProductPrice: { fontSize: 15, fontWeight: '400', color: COLORS.charcoal },
});

export default HomeScreen;