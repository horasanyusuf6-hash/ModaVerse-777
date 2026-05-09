import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  SafeAreaView,
  StatusBar,
  Alert,
  Dimensions,
  RefreshControl  // ✅ EKLENDİ (eksikti)
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

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

// ✅ MOCK FAVORİT KONTEXT (import hatasını önlemek için)
const useFavorites = () => {
  const [favorites, setFavorites] = useState([
    {
      id: '1',
      user: { name: 'Fashionista', avatar: 'https://i.pravatar.cc/100?img=1' },
      description: 'Harika bir kombin!',
      image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=400',
      likes: 1240,
      comments: 89,
    },
    {
      id: '2',
      user: { name: 'StreetStyle', avatar: 'https://i.pravatar.cc/100?img=2' },
      description: 'Sokak stili her zaman kazanır',
      image: 'https://images.unsplash.com/photo-1539008835657-9e8e9680c956?w=400',
      likes: 890,
      comments: 45,
    },
  ]);

  const toggleFavorite = useCallback((itemId) => {
    setFavorites(prev => prev.filter(item => item.id !== itemId));
  }, []);

  return { favorites, toggleFavorite };
};

// ✅ MOCK FEED ITEM (import hatasını önlemek için)
const FeedItem = ({ item }) => (
  <View style={styles.mockFeedItem}>
    <View style={styles.mockFeedHeader}>
      <View style={styles.mockAvatar} />
      <Text style={styles.mockUserName}>{item.user?.name || 'Kullanıcı'}</Text>
    </View>
    <Text style={styles.mockDescription}>{item.description}</Text>
  </View>
);

const FavoritesScreen = () => {
  const navigation = useNavigation();
  const { favorites, toggleFavorite } = useFavorites();
  
  const [refreshing, setRefreshing] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);
  const [isSelectionMode, setIsSelectionMode] = useState(false);

  const favoritesCount = useMemo(() => favorites.length, [favorites]);

  const handleRemoveFavorite = useCallback((itemId) => {
    Alert.alert(
      '❤️ Favorilerden Çıkar',
      'Bu öğeyi favorilerinizden çıkarmak istediğinize emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        { 
          text: 'Çıkar', 
          onPress: () => toggleFavorite(itemId),
          style: 'destructive'
        }
      ]
    );
  }, [toggleFavorite]);

  const toggleSelectionMode = useCallback(() => {
    setIsSelectionMode(!isSelectionMode);
    setSelectedItems([]);
  }, [isSelectionMode]);

  const toggleItemSelection = useCallback((itemId) => {
    setSelectedItems(prev =>
      prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  }, []);

  const removeSelectedItems = useCallback(() => {
    if (selectedItems.length === 0) return;
    
    Alert.alert(
      'Toplu Kaldırma',
      `${selectedItems.length} öğeyi favorilerinizden çıkarmak istediğinize emin misiniz?`,
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Kaldır',
          onPress: () => {
            selectedItems.forEach(id => toggleFavorite(id));
            setSelectedItems([]);
            setIsSelectionMode(false);
          },
          style: 'destructive'
        }
      ]
    );
  }, [selectedItems, toggleFavorite]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);

  const handleGoBack = useCallback(() => {
    if (navigation && navigation.goBack) {
      navigation.goBack();
    }
  }, [navigation]);

  const renderHeader = useCallback(() => (
    <View style={styles.header}>
      <View style={styles.headerLeft}>
        <TouchableOpacity 
          onPress={handleGoBack}
          style={styles.backButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="chevron-back" size={24} color={COLORS.charcoal} />
        </TouchableOpacity>
        
        <View>
          <Text style={styles.title}>FAVORİLERİM</Text>
          <Text style={styles.subtitle}>
            {favoritesCount} {favoritesCount === 1 ? 'gönderi' : 'gönderi'}
          </Text>
        </View>
      </View>
      
      <View style={styles.headerRight}>
        {favoritesCount > 0 && (
          <TouchableOpacity 
            onPress={toggleSelectionMode}
            style={styles.selectButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons 
              name={isSelectionMode ? "close" : "checkbox-outline"} 
              size={22} 
              color={COLORS.charcoal} 
            />
          </TouchableOpacity>
        )}
        
        {isSelectionMode && selectedItems.length > 0 && (
          <TouchableOpacity 
            onPress={removeSelectedItems}
            style={styles.deleteButton}
          >
            <Ionicons name="trash-outline" size={20} color={COLORS.white} />
            <Text style={styles.deleteButtonText}>
              {selectedItems.length} seçili
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  ), [favoritesCount, isSelectionMode, selectedItems.length, handleGoBack, toggleSelectionMode, removeSelectedItems]);

  const renderItem = useCallback(({ item }) => {
    const isSelected = selectedItems.includes(item.id);
    
    return (
      <TouchableOpacity 
        activeOpacity={0.9}
        onPress={() => {
          if (isSelectionMode) {
            toggleItemSelection(item.id);
          } else {
            Alert.alert('Gönderi', 'Gönderi detayı açılıyor...');
          }
        }}
        onLongPress={() => {
          if (!isSelectionMode) {
            toggleSelectionMode();
            toggleItemSelection(item.id);
          }
        }}
        delayLongPress={500}
      >
        <View style={styles.itemContainer}>
          {isSelectionMode && (
            <View style={styles.selectionIndicator}>
              <Ionicons 
                name={isSelected ? "checkbox" : "square-outline"} 
                size={24} 
                color={isSelected ? COLORS.cognac : COLORS.ash} 
              />
            </View>
          )}
          
          <View style={[styles.itemContent, isSelectionMode && styles.itemWithSelection]}>
            <FeedItem item={item} />
            
            {!isSelectionMode && (
              <TouchableOpacity 
                style={styles.removeButton}
                onPress={() => handleRemoveFavorite(item.id)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="close-circle" size={24} color={COLORS.ash} />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  }, [isSelectionMode, selectedItems, toggleItemSelection, handleRemoveFavorite, toggleSelectionMode]);

  const renderEmptyState = useCallback(() => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconContainer}>
        <Ionicons name="heart-outline" size={64} color={COLORS.cloud} />
      </View>
      <Text style={styles.emptyTitle}>Henüz favorin yok</Text>
      <Text style={styles.emptyText}>
        Beğendiğin gönderiler, ürünler ve stiller burada görünecek
      </Text>
      <TouchableOpacity 
        style={styles.exploreButton}
        onPress={() => navigation.navigate('Home')}
      >
        <Text style={styles.exploreButtonText}>Keşfetmeye Başla</Text>
      </TouchableOpacity>
    </View>
  ), [navigation]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
      
      {renderHeader()}
      
      <FlatList
        data={favorites}
        keyExtractor={(item) => item?.id?.toString() || Math.random().toString()}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.cognac}
            colors={[COLORS.cognac]}
          />
        }
        ListEmptyComponent={renderEmptyState}
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.cloud,
    backgroundColor: COLORS.white,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backButton: {
    padding: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: '300',
    color: COLORS.charcoal,
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 13,
    color: COLORS.ash,
    marginTop: 2,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  selectButton: {
    padding: 4,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.error,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  deleteButtonText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '600',
  },
  listContent: {
    paddingBottom: 20,
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectionIndicator: {
    width: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemContent: {
    flex: 1,
    position: 'relative',
  },
  itemWithSelection: {
    marginRight: 40,
  },
  removeButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 2,
    shadowColor: COLORS.charcoal,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    minHeight: 400,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.ivory,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '500',
    color: COLORS.charcoal,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.ash,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  exploreButton: {
    backgroundColor: COLORS.cognac,
    paddingHorizontal: 30,
    paddingVertical: 14,
    borderRadius: 25,
  },
  exploreButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 1,
  },
  placeholder: {
    padding: 20,
    backgroundColor: COLORS.porcelain,
    borderRadius: 8,
    marginHorizontal: 16,
    marginVertical: 8,
    alignItems: 'center',
  },
  // Mock FeedItem stilleri
  mockFeedItem: {
    backgroundColor: COLORS.white,
    padding: 12,
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    borderWidth: 0.5,
    borderColor: COLORS.cloud,
  },
  mockFeedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  mockAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.ivory,
    marginRight: 12,
  },
  mockUserName: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.charcoal,
  },
  mockDescription: {
    fontSize: 13,
    color: COLORS.ash,
    lineHeight: 18,
  },
});

export default FavoritesScreen;