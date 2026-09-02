// 📁 src/screens/CategoriesScreen.js - LÜKS MİNİMALİST VERSİYON
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  FlatList,
  Alert,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Dimensions,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY, SIZES } from '../constants/Theme';

const { width, height } = Dimensions.get('window');

// MOCK API
const wardrobeAPI = {
  getCategories: async () => {
    return {
      data: {
        data: [
          { id: '1', name: 'Elbise', count: 12 },
          { id: '2', name: 'Pantolon', count: 8 },
          { id: '3', name: 'Ceket', count: 5 },
          { id: '4', name: 'Ayakkabı', count: 15 },
          { id: '5', name: 'Aksesuar', count: 23 },
          { id: '6', name: 'Tişört', count: 18 },
          { id: '7', name: 'Etek', count: 7 },
        ]
      }
    };
  }
};

// Kategori görsel eşleştirmeleri
const categoryImages = {
  'Elbise': 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=200',
  'Pantolon': 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=200',
  'Ceket': 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=200',
  'Ayakkabı': 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=200',
  'Aksesuar': 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=200',
  'Tişört': 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=200',
  'Etek': 'https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?w=200',
};

const CategoriesScreen = ({ navigation }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadCategories = useCallback(async (isRefreshing = false) => {
    if (!isRefreshing) setLoading(true);
    
    try {
      const response = await wardrobeAPI.getCategories();
      
      let categoriesData = [];
      if (response?.data?.data) {
        categoriesData = response.data.data;
      } else if (response?.data) {
        categoriesData = response.data;
      } else if (Array.isArray(response)) {
        categoriesData = response;
      }
      
      categoriesData = categoriesData.map(cat => ({
        ...cat,
        image: categoryImages[cat.name] || 'https://via.placeholder.com/200',
        count: cat.count || Math.floor(Math.random() * 20) + 5,
      }));
      
      setCategories(categoriesData);
    } catch (error) {
      console.error('Load categories error:', error);
      Alert.alert('Hata', 'Kategoriler yüklenirken bir hata oluştu.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    loadCategories(true);
  }, [loadCategories]);

  const handleCategoryPress = useCallback((category) => {
    navigation.navigate('CategoryProducts', { categoryId: category.id, categoryName: category.name });
  }, [navigation]);

  const handleFavoritePress = useCallback((category) => {
    Alert.alert('Favori', `${category.name} kategorisi favorilere eklendi.`);
  }, []);

  const renderCategory = useCallback(({ item }) => (
    <View style={styles.card}>
      <TouchableOpacity 
        activeOpacity={0.7}
        onPress={() => handleCategoryPress(item)}
      >
        <View style={styles.cardContent}>
          <Image source={{ uri: item.image }} style={styles.categoryImage} />
          
          <View style={styles.categoryInfo}>
            <Text style={styles.categoryName}>{item.name}</Text>
            <View style={styles.chip}>
              <Ionicons name="hanger-outline" size={10} color={COLORS.grayMedium} />
              <Text style={styles.chipText}>{item.count} ÜRÜN</Text>
            </View>
          </View>
          
          <Ionicons name="chevron-forward" size={16} color={COLORS.grayMedium} />
        </View>
      </TouchableOpacity>
      
      <View style={styles.cardActions}>
        <TouchableOpacity 
          style={[styles.actionButton, styles.actionButtonPrimary]} 
          onPress={() => handleCategoryPress(item)}
        >
          <Ionicons name="eye-outline" size={14} color={COLORS.white} />
          <Text style={styles.actionButtonPrimaryText}>GÖRÜNTÜLE</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.actionButton, styles.actionButtonOutline]} 
          onPress={() => handleFavoritePress(item)}
        >
          <Ionicons name="heart-outline" size={14} color={COLORS.black} />
          <Text style={styles.actionButtonOutlineText}>FAVORİ</Text>
        </TouchableOpacity>
      </View>
    </View>
  ), [handleCategoryPress, handleFavoritePress]);

  const renderHeader = useCallback(() => (
    <View style={styles.header}>
      <View style={styles.headerTop}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.black} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>KATEGORİLER</Text>
        <TouchableOpacity onPress={handleRefresh} style={styles.refreshButton}>
          <Ionicons name="refresh-outline" size={20} color={COLORS.black} />
        </TouchableOpacity>
      </View>
      
      <View style={styles.headerStats}>
        <Text style={styles.totalText}>
          TOPLAM {categories.length} KATEGORİ
        </Text>
      </View>
    </View>
  ), [categories.length, navigation, handleRefresh]);

  const renderEmptyState = useCallback(() => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconContainer}>
        <Ionicons name="grid-outline" size={40} color={COLORS.grayMedium} />
      </View>
      <Text style={styles.emptyTitle}>HENÜZ KATEGORİ YOK</Text>
      <Text style={styles.emptyText}>
        Kategoriler eklendiğinde burada görünecek
      </Text>
      <TouchableOpacity style={styles.emptyButton} onPress={handleRefresh}>
        <Text style={styles.emptyButtonText}>YENİLE</Text>
      </TouchableOpacity>
    </View>
  ), [handleRefresh]);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
        <View style={styles.loadingHeader}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={COLORS.black} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>KATEGORİLER</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.black} />
          <Text style={styles.loadingText}>YÜKLENİYOR...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
      
      {renderHeader()}

      <FlatList
        data={categories}
        renderItem={renderCategory}
        keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        ListEmptyComponent={renderEmptyState}
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
    backgroundColor: COLORS.white,
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.grayLight,
    paddingBottom: SIZES.sm,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SIZES.lg,
    paddingTop: Platform.OS === 'ios' ? 12 : SIZES.md,
    paddingBottom: SIZES.md,
  },
  loadingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SIZES.lg,
    paddingTop: Platform.OS === 'ios' ? 12 : SIZES.md,
    paddingBottom: SIZES.md,
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.grayLight,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    ...TYPOGRAPHY.caption,
    letterSpacing: 2,
  },
  refreshButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerStats: {
    paddingHorizontal: SIZES.lg,
    paddingBottom: SIZES.sm,
  },
  totalText: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.grayMedium,
  },
  
  // List
  listContainer: {
    padding: SIZES.lg,
    paddingBottom: SIZES.xxl,
  },
  
  // Card
  card: {
    backgroundColor: COLORS.white,
    marginBottom: SIZES.md,
    borderWidth: 0.5,
    borderColor: COLORS.grayLight,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SIZES.md,
    gap: SIZES.md,
  },
  categoryImage: {
    width: 50,
    height: 50,
    backgroundColor: COLORS.surface,
    borderWidth: 0.5,
    borderColor: COLORS.grayLight,
  },
  categoryInfo: {
    flex: 1,
    gap: 4,
  },
  categoryName: {
    ...TYPOGRAPHY.body,
    fontWeight: '500',
  },
  cardActions: {
    flexDirection: 'row',
    gap: SIZES.md,
    paddingHorizontal: SIZES.md,
    paddingBottom: SIZES.md,
  },
  
  // Chip
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  chipText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.grayMedium,
  },
  
  // Action Buttons
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: SIZES.sm,
  },
  actionButtonPrimary: {
    backgroundColor: COLORS.black,
  },
  actionButtonOutline: {
    backgroundColor: 'transparent',
    borderWidth: 0.5,
    borderColor: COLORS.grayLight,
  },
  actionButtonPrimaryText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.white,
  },
  actionButtonOutlineText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.black,
  },
  
  // Loading State
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: SIZES.md,
  },
  loadingText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.grayMedium,
  },
  
  // Empty State
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SIZES.xxl,
    paddingHorizontal: SIZES.xl,
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
    marginBottom: SIZES.lg,
  },
  emptyButton: {
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

export default CategoriesScreen;