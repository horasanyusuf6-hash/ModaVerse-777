// 📁 src/screens/WardrobeScreen.js - TAM REVİZE (Backend Entegre)
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  FlatList,
  Alert,
  RefreshControl,
  StyleSheet,
  Image,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Dimensions,
  Platform,
  ActivityIndicator,
  Text
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY, SIZES } from '../constants/Theme';
import { auth } from '../config/firebase';
import { wardrobeAPI } from '../services/api';

const { width } = Dimensions.get('window');

// ============================================================
// 📌 ÜRÜN KARTI
// ============================================================
const WardrobeItemCard = ({ item, onDelete, onEdit, onToggleStar }) => {
  const [showActions, setShowActions] = useState(false);

  return (
    <TouchableOpacity 
      style={styles.card}
      onPress={() => setShowActions(!showActions)}
      activeOpacity={0.7}
    >
      <Image 
        source={{ uri: item.img_url || item.image_url || 'https://picsum.photos/400/500' }} 
        style={styles.cardImage} 
      />
      
      {item.is_star && (
        <View style={styles.starBadge}>
          <Ionicons name="star" size={12} color={COLORS.black} />
        </View>
      )}
      
      <View style={styles.cardContent}>
        <View style={styles.cardHeader}>
          <Text style={styles.itemName}>{item.ad || item.name || 'İsimsiz'}</Text>
          <Text style={styles.itemCategory}>{item.kategori || item.category || 'Kategori yok'}</Text>
        </View>
        
        <View style={styles.itemDetails}>
          {item.marka || item.brand ? (
            <View style={styles.detailChip}>
              <Ionicons name="business-outline" size={10} color={COLORS.grayMedium} />
              <Text style={styles.detailText}>{item.marka || item.brand}</Text>
            </View>
          ) : null}
          {item.renk || item.color ? (
            <View style={styles.detailChip}>
              <Ionicons name="color-palette-outline" size={10} color={COLORS.grayMedium} />
              <Text style={styles.detailText}>{item.renk || item.color}</Text>
            </View>
          ) : null}
          {item.size ? (
            <View style={styles.detailChip}>
              <Ionicons name="resize-outline" size={10} color={COLORS.grayMedium} />
              <Text style={styles.detailText}>{item.size}</Text>
            </View>
          ) : null}
        </View>
        
        {showActions && (
          <View style={styles.actionButtons}>
            <TouchableOpacity 
              style={[styles.actionButton, styles.starButton]} 
              onPress={() => onToggleStar?.(item)}
            >
              <Ionicons 
                name={item.is_star ? 'star' : 'star-outline'} 
                size={12} 
                color={COLORS.white} 
              />
              <Text style={styles.actionButtonText}>
                {item.is_star ? 'STAR' : 'STAR EKLE'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.actionButton, styles.editButton]} 
              onPress={() => onEdit?.(item)}
            >
              <Ionicons name="create-outline" size={12} color={COLORS.white} />
              <Text style={styles.actionButtonText}>DÜZENLE</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.actionButton, styles.deleteButton]} 
              onPress={() => onDelete?.(item.id)}
            >
              <Ionicons name="trash-outline" size={12} color={COLORS.white} />
              <Text style={styles.actionButtonText}>SİL</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

// ============================================================
// 📌 ANA BİLEŞEN
// ============================================================
const WardrobeScreen = ({ navigation }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [user, setUser] = useState(null);

  // Firebase Auth
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
    });
    return unsubscribe;
  }, []);

  // ============================================================
  // 📌 VERİ YÜKLE
  // ============================================================
  const loadItems = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const response = await wardrobeAPI.getAllItems(user.uid);
      
      if (response && response.success) {
        // Tüm kategorilerden ürünleri topla
        const allItems = [];
        if (response.categories) {
          Object.values(response.categories).forEach(categoryItems => {
            if (Array.isArray(categoryItems)) {
              allItems.push(...categoryItems);
            }
          });
        }
        setItems(allItems);
      } else {
        setItems([]);
      }
    } catch (error) {
      console.error('Load items error:', error);
      Alert.alert('Hata', 'Kıyafetler yüklenirken bir hata oluştu.');
      setItems([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      loadItems();
    }
  }, [user, loadItems]);

  // ============================================================
  // 📌 STAR PARÇA İŞARETLE
  // ============================================================
  const handleToggleStar = async (item) => {
    if (!user) return;

    try {
      const newStarStatus = !item.is_star;
      const response = await wardrobeAPI.toggleStar(
        user.uid,
        item.product_id || item.id,
        newStarStatus
      );

      if (response && response.success) {
        // Listeyi güncelle
        setItems(prevItems =>
          prevItems.map(i =>
            (i.id === item.id || i.product_id === item.product_id)
              ? { ...i, is_star: newStarStatus }
              : i
          )
        );
        Alert.alert('Başarılı', newStarStatus ? '⭐ Star parça eklendi!' : '⭐ Star parça kaldırıldı.');
      }
    } catch (error) {
      console.error('Star toggle error:', error);
      Alert.alert('Hata', 'İşlem başarısız oldu.');
    }
  };

  // ============================================================
  // 📌 ÜRÜN SİL
  // ============================================================
  const handleDeleteItem = (itemId) => {
    Alert.alert(
      'Ürünü Sil',
      'Bu ürünü silmek istediğinize emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: async () => {
            if (!user) return;
            try {
              setLoading(true);
              const response = await wardrobeAPI.deleteItem(itemId, user.uid);
              if (response && response.success) {
                await loadItems();
                Alert.alert('Başarılı', 'Ürün silindi.');
              }
            } catch (error) {
              console.error('Delete error:', error);
              Alert.alert('Hata', 'Silme işlemi başarısız.');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  // ============================================================
  // 📌 ÜRÜN DÜZENLE
  // ============================================================
  const handleEditItem = (item) => {
    navigation.navigate('AddItem', { 
      item: item,
      mode: 'edit'
    });
  };

  // ============================================================
  // 📌 YENİLE
  // ============================================================
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadItems();
  }, [loadItems]);

  // ============================================================
  // 📌 KATEGORİLER
  // ============================================================
  const handleCategories = () => {
    navigation.navigate('Categories');
  };

  // ============================================================
  // 📌 YENİ ÜRÜN EKLE
  // ============================================================
  const handleAddItem = () => {
    navigation.navigate('AddItem');
  };

  // ============================================================
  // 📌 RENDER ITEM
  // ============================================================
  const renderItem = useCallback(({ item }) => (
    <WardrobeItemCard 
      item={item} 
      onDelete={handleDeleteItem}
      onEdit={handleEditItem}
      onToggleStar={handleToggleStar}
    />
  ), [items]);

  const keyExtractor = useCallback((item) => 
    item?.id?.toString() || item?.product_id?.toString() || Math.random().toString(), 
    []
  );

  // ============================================================
  // 📌 BOŞ DURUM
  // ============================================================
  const renderEmptyState = useCallback(() => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconContainer}>
        <Ionicons name="shirt-outline" size={32} color={COLORS.grayMedium} />
      </View>
      <Text style={styles.emptyTitle}>HENÜZ ÜRÜN EKLENMEMİŞ</Text>
      <Text style={styles.emptyText}>
        Sanal dolabını oluşturmaya başla! İlk ürününü eklemek için + butonuna tıkla.
      </Text>
      <TouchableOpacity style={styles.emptyButton} onPress={handleAddItem}>
        <Ionicons name="add" size={14} color={COLORS.black} />
        <Text style={styles.emptyButtonText}>İLK ÜRÜNÜ EKLE</Text>
      </TouchableOpacity>
    </View>
  ), []);

  // ============================================================
  // 📌 RENDER
  // ============================================================
  if (loading && !refreshing) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.black} />
          <Text style={styles.loadingText}>YÜKLENİYOR...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>GİRİŞ YAPIN</Text>
          <Text style={styles.emptyText}>
            Gardırobunu görmek için lütfen giriş yapın.
          </Text>
          <TouchableOpacity 
            style={styles.emptyButton} 
            onPress={() => navigation.navigate('Auth')}
          >
            <Text style={styles.emptyButtonText}>GİRİŞ YAP</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>SANAL DOLABIM</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.headerIcon} onPress={handleCategories}>
            <Ionicons name="grid-outline" size={20} color={COLORS.black} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerIcon} onPress={onRefresh}>
            <Ionicons name="refresh-outline" size={20} color={COLORS.black} />
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={items}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        numColumns={2}
        contentContainerStyle={styles.listContainer}
        columnWrapperStyle={styles.columnWrapper}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            tintColor={COLORS.black}
          />
        }
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
      />

      {/* FAB Button */}
      <TouchableOpacity style={styles.fab} onPress={handleAddItem}>
        <Ionicons name="add" size={24} color={COLORS.white} />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

// ============================================================
// 📌 STYLES
// ============================================================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
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
  
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SIZES.lg,
    paddingTop: Platform.OS === 'ios' ? 12 : SIZES.md,
    paddingBottom: SIZES.md,
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.grayLight,
  },
  headerTitle: {
    ...TYPOGRAPHY.caption,
    letterSpacing: 1.5,
  },
  headerRight: {
    flexDirection: 'row',
    gap: SIZES.md,
  },
  headerIcon: {
    padding: SIZES.xs,
  },
  
  listContainer: {
    paddingHorizontal: SIZES.md,
    paddingBottom: 100,
    paddingTop: SIZES.md,
  },
  columnWrapper: {
    justifyContent: 'space-between',
    marginBottom: SIZES.md,
  },
  
  card: {
    width: (width - SIZES.md * 2 - SIZES.md) / 2,
    backgroundColor: COLORS.white,
    borderWidth: 0.5,
    borderColor: COLORS.grayLight,
  },
  cardImage: {
    width: '100%',
    height: 160,
    backgroundColor: COLORS.surface,
    resizeMode: 'cover',
  },
  starBadge: {
    position: 'absolute',
    top: SIZES.sm,
    right: SIZES.sm,
    backgroundColor: COLORS.white,
    padding: 4,
    borderRadius: 12,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardContent: {
    padding: SIZES.md,
  },
  cardHeader: {
    marginBottom: SIZES.sm,
  },
  itemName: {
    ...TYPOGRAPHY.bodySmall,
    fontWeight: '500',
    marginBottom: 2,
  },
  itemCategory: {
    ...TYPOGRAPHY.caption,
    fontSize: 8,
    color: COLORS.grayMedium,
  },
  itemDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SIZES.xs,
    marginBottom: SIZES.sm,
  },
  detailChip: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 0.5,
    borderColor: COLORS.grayLight,
    paddingHorizontal: SIZES.xs,
    paddingVertical: 2,
    gap: 2,
  },
  detailText: {
    ...TYPOGRAPHY.caption,
    fontSize: 7,
    color: COLORS.grayMedium,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: SIZES.xs,
    marginTop: SIZES.sm,
    paddingTop: SIZES.sm,
    borderTopWidth: 0.5,
    borderTopColor: COLORS.grayLight,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    paddingVertical: 4,
  },
  starButton: {
    backgroundColor: COLORS.black,
  },
  editButton: {
    backgroundColor: COLORS.black,
  },
  deleteButton: {
    backgroundColor: COLORS.black,
  },
  actionButtonText: {
    ...TYPOGRAPHY.caption,
    fontSize: 7,
    color: COLORS.white,
  },
  
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SIZES.xl,
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
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: SIZES.lg,
  },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 0.5,
    borderColor: COLORS.grayLight,
    paddingHorizontal: SIZES.lg,
    paddingVertical: SIZES.sm,
    gap: SIZES.xs,
  },
  emptyButtonText: {
    ...TYPOGRAPHY.button,
    fontSize: 10,
    color: COLORS.black,
  },
  
  fab: {
    position: 'absolute',
    bottom: SIZES.lg,
    right: SIZES.lg,
    width: 56,
    height: 56,
    backgroundColor: COLORS.black,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 28,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
});

export default WardrobeScreen;