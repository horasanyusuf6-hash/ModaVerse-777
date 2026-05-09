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
  Image
} from 'react-native';
import { Appbar, Card, Button, Text, ActivityIndicator, Chip } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';

// 📏 Ekran boyutları
const { width, height } = Dimensions.get('window');

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
};

// ✅ MOCK API
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

// ✅ Global stiller
const globalStyles = {
  container: { flex: 1, backgroundColor: COLORS.white },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  card: { marginHorizontal: 16, marginBottom: 12, borderRadius: 8 },
  listContainer: { paddingTop: 16, paddingBottom: 32 },
};

// Kategori görsel eşleştirmeleri
const categoryImages = {
  'Elbise': 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=100',
  'Pantolon': 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=100',
  'Ceket': 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=100',
  'Ayakkabı': 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=100',
  'Aksesuar': 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=100',
  'Tişört': 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=100',
  'Etek': 'https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?w=100',
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
        image: categoryImages[cat.name] || 'https://via.placeholder.com/100',
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
    Alert.alert('Kategori', `${category.name} kategorisi açılıyor...`);
  }, []);

  const renderCategory = useCallback(({ item }) => (
    <TouchableOpacity 
      activeOpacity={0.7}
      onPress={() => handleCategoryPress(item)}
    >
      <Card style={[globalStyles.card, styles.card]}>
        <Card.Content style={styles.cardContent}>
          <Image 
            source={{ uri: item.image }} 
            style={styles.categoryImage}
          />
          
          <View style={styles.categoryInfo}>
            <Text style={styles.categoryName}>
              {item.name}
            </Text>
            
            <Chip 
              icon="hanger" 
              style={styles.countChip}
              textStyle={styles.countChipText}
            >
              {item.count} ürün
            </Chip>
          </View>
        </Card.Content>
        
        <Card.Actions style={styles.cardActions}>
          <Button 
            mode="contained"
            onPress={() => handleCategoryPress(item)}
            style={styles.viewButton}
            labelStyle={styles.viewButtonLabel}
          >
            Görüntüle
          </Button>
          <Button 
            mode="outlined"
            onPress={() => Alert.alert('Favoriler', `${item.name} kategorisi favorilere eklendi`)}
            style={styles.favoriteButton}
            labelStyle={styles.favoriteButtonLabel}
          >
            Favori
          </Button>
        </Card.Actions>
      </Card>
    </TouchableOpacity>
  ), [handleCategoryPress]);

  const renderHeader = useCallback(() => (
    <View style={styles.header}>
      <Appbar.Header style={styles.appbar}>
        <Appbar.BackAction 
          onPress={() => navigation.goBack()} 
          color={COLORS.white}
        />
        <Appbar.Content 
          title="Kategoriler" 
          titleStyle={styles.appbarTitle}
        />
        <Appbar.Action 
          icon="refresh" 
          color={COLORS.white}
          onPress={handleRefresh}
        />
      </Appbar.Header>
      
      <View style={styles.headerStats}>
        <Text style={styles.totalText}>
          Toplam {categories.length} kategori
        </Text>
      </View>
    </View>
  ), [categories.length, navigation, handleRefresh]);

  const renderEmptyState = useCallback(() => (
    <View style={globalStyles.centerContainer}>
      <Ionicons name="grid-outline" size={64} color={COLORS.cloud} />
      <Text style={styles.emptyTitle}>
        Henüz kategori yok
      </Text>
      <Text style={styles.emptyText}>
        Kategoriler eklendiğinde burada görünecek
      </Text>
      <Button 
        mode="contained" 
        onPress={handleRefresh}
        style={styles.refreshButton}
      >
        Yenile
      </Button>
    </View>
  ), [handleRefresh]);

  if (loading) {
    return (
      <SafeAreaView style={globalStyles.container}>
        <Appbar.Header style={styles.appbar}>
          <Appbar.BackAction onPress={() => navigation.goBack()} color={COLORS.white} />
          <Appbar.Content title="Kategoriler" titleStyle={styles.appbarTitle} />
        </Appbar.Header>
        <View style={globalStyles.centerContainer}>
          <ActivityIndicator size="large" color={COLORS.cognac} />
          <Text style={styles.loadingText}>Kategoriler yükleniyor...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={globalStyles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.cognac} />
      
      {renderHeader()}

      <FlatList
        data={categories}
        renderItem={renderCategory}
        keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
        contentContainerStyle={globalStyles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        ListEmptyComponent={renderEmptyState}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  appbar: {
    backgroundColor: COLORS.cognac,
  },
  appbarTitle: {
    color: COLORS.white,
    fontWeight: '600',
  },
  header: {
    backgroundColor: COLORS.cognac,
  },
  headerStats: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: COLORS.cognac,
  },
  totalText: {
    color: COLORS.white,
    fontSize: 14,
    opacity: 0.9,
  },
  card: {
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 12,
    overflow: 'hidden',
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  categoryImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: COLORS.porcelain,
    marginRight: 16,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryName: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.charcoal,
    marginBottom: 8,
  },
  countChip: {
    backgroundColor: COLORS.porcelain,
    alignSelf: 'flex-start',
  },
  countChipText: {
    fontSize: 12,
    color: COLORS.ash,
  },
  cardActions: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 8,
  },
  viewButton: {
    flex: 1,
    backgroundColor: COLORS.cognac,
  },
  viewButtonLabel: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '600',
  },
  favoriteButton: {
    flex: 1,
    borderColor: COLORS.cognac,
  },
  favoriteButtonLabel: {
    color: COLORS.cognac,
    fontSize: 14,
    fontWeight: '600',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: COLORS.ash,
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
    marginBottom: 20,
  },
  refreshButton: {
    backgroundColor: COLORS.cognac,
  },
});

export default CategoriesScreen;