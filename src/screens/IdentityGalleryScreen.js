// 📁 src/screens/IdentityGalleryScreen.js
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  FlatList,
  TouchableOpacity,
  Image,
  Dimensions,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY } from '../constants/Theme';

const { width } = Dimensions.get('window');

const IdentityGalleryScreen = ({ navigation, route }) => {
  const { title, items, type } = route.params || {};

  const renderItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.gridItem}
      activeOpacity={0.85}
      onPress={() => {
        if (type === 'missing' && item.price) {
          Alert.alert('Alışveriş', `${item.name} sepete eklendi!`);
        } else {
          Alert.alert('Detay', item.name);
        }
      }}
    >
      <View style={styles.imageWrapper}>
        <Image 
          source={{ uri: `https://picsum.photos/300/300?random=${item.id || Math.random()}` }} 
          style={styles.image} 
        />
        {item.price && (
          <View style={styles.priceOverlay}>
            <Text style={styles.priceText}>₺{item.price}</Text>
          </View>
        )}
      </View>
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.sub} numberOfLines={1}>
          {item.brand || item.reason || item.followers || item.user}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.black} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{title}</Text>
        <View style={styles.headerCount}>
          <Text style={styles.headerCountText}>{items?.length || 0}</Text>
        </View>
      </View>

      <FlatList
        data={items}
        renderItem={renderItem}
        keyExtractor={(item, index) => item.id?.toString() || index.toString()}
        numColumns={2}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        columnWrapperStyle={styles.row}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="folder-outline" size={48} color={COLORS.grayLight} />
            <Text style={styles.emptyTitle}>Henüz kayıt yok</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 0.5,
    borderBottomColor: '#F0F0F0',
  },
  backButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { ...TYPOGRAPHY.title3, fontSize: 17, fontWeight: '600', flex: 1, marginLeft: 8 },
  headerCount: {
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  headerCountText: { ...TYPOGRAPHY.caption, fontSize: 12, color: COLORS.grayMedium, fontWeight: '600' },
  listContent: { padding: 12, paddingBottom: 24 },
  row: { justifyContent: 'space-between', marginBottom: 12, gap: 12 },
  gridItem: {
    flex: 1,
    maxWidth: (width - 48) / 2,
    backgroundColor: COLORS.white,
    borderWidth: 0.5,
    borderColor: '#F0F0F0',
    overflow: 'hidden',
  },
  imageWrapper: { position: 'relative', width: '100%', aspectRatio: 1, backgroundColor: '#F8F8F8' },
  image: { width: '100%', height: '100%', resizeMode: 'cover' },
  priceOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 8,
    paddingVertical: 6,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  priceText: { ...TYPOGRAPHY.caption, fontSize: 11, color: COLORS.white, fontWeight: '600' },
  info: { padding: 10 },
  name: { ...TYPOGRAPHY.body, fontSize: 13, fontWeight: '500', color: COLORS.black, marginBottom: 2 },
  sub: { ...TYPOGRAPHY.caption, fontSize: 10, color: COLORS.grayMedium },
  emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: 80, gap: 12 },
  emptyTitle: { ...TYPOGRAPHY.body, fontSize: 17, fontWeight: '500', color: COLORS.black },
});

export default IdentityGalleryScreen;