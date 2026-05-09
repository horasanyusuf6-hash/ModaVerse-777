// 📁 src/screens/WardrobeScreen.js - SADECE HATALAR DÜZELTİLDİ
import React, { useState, useEffect } from 'react';
import {
  View,
  FlatList,
  Alert,
  RefreshControl,
  StyleSheet  // ✅ EKLENDI
} from 'react-native';
import {
  Appbar,
  Card,
  Button,
  Text,
  ActivityIndicator,
  FAB,
} from 'react-native-paper';

// 🎨 Renk paleti (cognac düzeltildi)
const COLORS = {
  white: '#FFFFFF',
  cognac: '#8C7853',  // ✅ DÜZELTİLDİ
  error: '#F44336',
};

// ✅ MOCK API (backend yoksa çalışsın)
const wardrobeAPI = {
  getAllItems: async () => {
    return {
      data: {
        data: [
          {
            id: 1,
            name: 'Oversize Blazer',
            category_name: 'Ceket',
            brand: 'ZARA',
            color: 'Siyah',
            size: 'M',
            image_url: '/uploads/image1.jpg'
          },
          {
            id: 2,
            name: 'Air Force 1',
            category_name: 'Ayakkabı',
            brand: 'Nike',
            color: 'Beyaz',
            size: '38',
            image_url: '/uploads/image2.jpg'
          }
        ]
      }
    };
  },
  deleteItem: async (id) => {
    console.log(`Item ${id} silindi`);
    return { success: true };
  }
};

// ✅ Global stiller (mock)
const globalStyles = {
  container: { flex: 1, backgroundColor: COLORS.white },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  card: { marginHorizontal: 16, marginBottom: 12, borderRadius: 8 },
  cardImage: { height: 200 },
  cardContent: { padding: 12 },
  categoryText: { color: COLORS.cognac, marginTop: 4 },
  listContainer: { paddingTop: 16, paddingBottom: 80 },
  fab: { position: 'absolute', margin: 16, right: 0, bottom: 0, backgroundColor: COLORS.cognac },
};

const WardrobeScreen = ({ navigation }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadItems = async () => {
    try {
      const response = await wardrobeAPI.getAllItems();
      if (response && response.data && response.data.data) {
        setItems(response.data.data);
      } else if (response && response.data) {
        setItems(response.data);
      } else {
        setItems([]);
      }
    } catch (error) {
      console.error('Load items error:', error);
      Alert.alert('Hata', 'Kıyafetler yüklenirken bir hata oluştu.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadItems();
  }, []);

  const handleDeleteItem = (id) => {
    Alert.alert(
      '🗑️ Sil',
      'Bu kıyafeti silmek istediğinizden emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              await wardrobeAPI.deleteItem(id);
              await loadItems();
              Alert.alert('✅ Başarılı', 'Kıyafet silindi');
            } catch (error) {
              console.error('Delete error:', error);
              Alert.alert('Hata', 'Silme işlemi başarısız');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadItems();
  };

  const renderItem = ({ item }) => (
    <Card style={globalStyles.card} mode="elevated">
      <Card.Content style={globalStyles.cardContent}>
        <Text variant="titleMedium">{item.name || 'İsimsiz'}</Text>
        <Text variant="bodyMedium" style={globalStyles.categoryText}>
          {item.category_name || item.category || 'Kategori yok'}
        </Text>
        {item.brand && (
          <Text variant="bodySmall">🏷️ Marka: {item.brand}</Text>
        )}
        {item.color && (
          <Text variant="bodySmall">🎨 Renk: {item.color}</Text>
        )}
        {item.size && (
          <Text variant="bodySmall">📏 Beden: {item.size}</Text>
        )}
      </Card.Content>
      <Card.Actions>
        <Button 
          icon="pencil" 
          onPress={() => Alert.alert('Düzenle', 'Düzenleme sayfası açılıyor...')}
        >
          Düzenle
        </Button>
        <Button 
          icon="delete" 
          onPress={() => handleDeleteItem(item.id)}
          textColor={COLORS.error}
        >
          Sil
        </Button>
      </Card.Actions>
    </Card>
  );

  if (loading) {
    return (
      <View style={globalStyles.centerContainer}>
        <ActivityIndicator size="large" color={COLORS.cognac} />
        <Text style={{ marginTop: 10 }}>Kıyafetler yükleniyor...</Text>
      </View>
    );
  }

  return (
    <View style={globalStyles.container}>
      <Appbar.Header style={{ backgroundColor: COLORS.cognac }}>
        <Appbar.Content title="👕 Sanal Dolabım" color={COLORS.white} />
        <Appbar.Action 
          icon="view-list" 
          color={COLORS.white}
          onPress={() => Alert.alert('Kategoriler', 'Kategoriler sayfası açılıyor...')} 
        />
      </Appbar.Header>

      <FlatList
        data={items}
        renderItem={renderItem}
        keyExtractor={(item) => (item.id ? item.id.toString() : Math.random().toString())}
        contentContainerStyle={globalStyles.listContainer}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            colors={[COLORS.cognac]}
          />
        }
        ListEmptyComponent={
          <View style={globalStyles.centerContainer}>
            <Text variant="bodyLarge">👗 Henüz kıyafet eklenmemiş</Text>
            <Text variant="bodySmall" style={{ marginTop: 5, marginBottom: 15 }}>
              Sanal dolabını oluşturmaya başla!
            </Text>
            <Button 
              mode="contained" 
              onPress={() => Alert.alert('Ekle', 'Kıyafet ekleme sayfası açılıyor...')}
              style={{ marginTop: 10 }}
              icon="plus"
              buttonColor={COLORS.cognac}
            >
              İlk Kıyafeti Ekle
            </Button>
          </View>
        }
      />

      <FAB
        icon="plus"
        style={globalStyles.fab}
        onPress={() => Alert.alert('Ekle', 'Kıyafet ekleme sayfası açılıyor...')}
      />
    </View>
  );
};

const styles = StyleSheet.create({});

export default WardrobeScreen;