// 📁 src/screens/OrdersScreen.js - LÜKS MİNİMALİST VERSİYON
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  FlatList,
  TouchableOpacity,
  Alert,
  RefreshControl,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, TYPOGRAPHY, SIZES } from '../constants/Theme';

const statusConfig = {
  pending: { label: 'HAZIRLANIYOR', color: COLORS.grayMedium, icon: 'time-outline' },
  shipping: { label: 'KARGODA', color: COLORS.grayMedium, icon: 'cube-outline' },
  delivered: { label: 'TESLİM EDİLDİ', color: COLORS.black, icon: 'checkmark-circle-outline' },
  cancelled: { label: 'İPTAL EDİLDİ', color: COLORS.grayMedium, icon: 'close-circle-outline' },
};

const OrdersScreen = ({ navigation }) => {
  const [orders, setOrders] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadOrders();
    const unsubscribe = navigation.addListener('focus', loadOrders);
    return unsubscribe;
  }, [navigation]);

  const loadOrders = async () => {
    const saved = await AsyncStorage.getItem('@user_orders');
    setOrders(saved ? JSON.parse(saved) : []);
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadOrders();
    setRefreshing(false);
  }, []);

  const getStatusConfig = (status) => {
    return statusConfig[status] || statusConfig.pending;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return `${date.toLocaleDateString('tr-TR')} • ${date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}`;
  };

  const formatPrice = (price) => {
    return Math.round(price).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

  const renderOrderItem = ({ item }) => {
    const status = getStatusConfig(item.status);
    
    return (
      <TouchableOpacity
        style={styles.orderCard}
        onPress={() => Alert.alert(
          'Sipariş Detayı',
          `Sipariş No: ${item.id.slice(-6)}\n\nToplam: ₺${formatPrice(item.totalPrice)}\nDurum: ${status.label}\n\nTarih: ${formatDate(item.createdAt)}`
        )}
        activeOpacity={0.7}
      >
        <View style={styles.orderHeader}>
          <View>
            <Text style={styles.orderId}>SİPARİŞ #{item.id.slice(-6)}</Text>
            <Text style={styles.orderDate}>{formatDate(item.createdAt)}</Text>
          </View>
          <View style={styles.statusBadge}>
            <Ionicons name={status.icon} size={10} color={status.color} />
            <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
          </View>
        </View>
        
        <View style={styles.orderItems}>
          {item.items.slice(0, 2).map((cartItem, index) => (
            <View key={index} style={styles.orderItemRow}>
              <Text style={styles.orderItemQuantity}>{cartItem.quantity}x</Text>
              <Text style={styles.orderItemName} numberOfLines={1}>{cartItem.name}</Text>
            </View>
          ))}
          {item.items.length > 2 && (
            <Text style={styles.orderItemMore}>+{item.items.length - 2} ÜRÜN DAHA</Text>
          )}
        </View>
        
        <View style={styles.orderFooter}>
          <Text style={styles.orderTotal}>₺{formatPrice(item.totalPrice)}</Text>
          {item.status === 'delivered' && (
            <TouchableOpacity style={styles.reviewButton}>
              <Text style={styles.reviewButtonText}>YORUM YAP</Text>
              <Ionicons name="star-outline" size={10} color={COLORS.black} />
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.black} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>SİPARİŞLERİM</Text>
        <View style={{ width: 40 }} />
      </View>

      {orders.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconContainer}>
            <Ionicons name="receipt-outline" size={40} color={COLORS.grayMedium} />
          </View>
          <Text style={styles.emptyTitle}>HENÜZ SİPARİŞİNİZ YOK</Text>
          <Text style={styles.emptyText}>
            Alışveriş yapmaya başlamak için ürünleri keşfedin.
          </Text>
          <TouchableOpacity
            style={styles.shopButton}
            onPress={() => navigation.navigate('Vitrinim')}
          >
            <Text style={styles.shopButtonText}>ALIŞVERİŞE BAŞLA</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={orders}
          renderItem={renderOrderItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.ordersList}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl 
              refreshing={refreshing} 
              onRefresh={onRefresh} 
              tintColor={COLORS.black}
            />
          }
        />
      )}
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
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingHorizontal: SIZES.lg, 
    paddingTop: Platform.OS === 'ios' ? 12 : SIZES.md, 
    paddingBottom: SIZES.md, 
    borderBottomWidth: 0.5, 
    borderBottomColor: COLORS.grayLight 
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  headerTitle: { 
    ...TYPOGRAPHY.caption,
    letterSpacing: 1,
  },
  
  // Orders List
  ordersList: { 
    padding: SIZES.lg, 
    paddingBottom: SIZES.xl 
  },
  orderCard: { 
    backgroundColor: COLORS.white, 
    padding: SIZES.md, 
    marginBottom: SIZES.md, 
    borderWidth: 0.5, 
    borderColor: COLORS.grayLight,
  },
  orderHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'flex-start', 
    marginBottom: SIZES.md 
  },
  orderId: { 
    ...TYPOGRAPHY.body,
    fontWeight: '500', 
    marginBottom: 2 
  },
  orderDate: { 
    ...TYPOGRAPHY.caption,
    fontSize: 9,
    color: COLORS.grayMedium 
  },
  statusBadge: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 4 
  },
  statusText: { 
    ...TYPOGRAPHY.caption,
    fontSize: 9,
  },
  
  // Order Items
  orderItems: { 
    marginBottom: SIZES.md,
    paddingTop: SIZES.sm,
    borderTopWidth: 0.5,
    borderTopColor: COLORS.grayLight,
  },
  orderItemRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginBottom: 4,
    gap: SIZES.sm,
  },
  orderItemQuantity: { 
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.grayMedium, 
    minWidth: 28 
  },
  orderItemName: { 
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.grayDark, 
    flex: 1 
  },
  orderItemMore: { 
    ...TYPOGRAPHY.caption,
    fontSize: 9,
    color: COLORS.grayMedium, 
    marginTop: 4 
  },
  
  // Order Footer
  orderFooter: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingTop: SIZES.md, 
    borderTopWidth: 0.5, 
    borderTopColor: COLORS.grayLight 
  },
  orderTotal: { 
    ...TYPOGRAPHY.body,
    fontWeight: '500', 
  },
  reviewButton: { 
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 0.5,
    borderColor: COLORS.grayLight,
    paddingHorizontal: SIZES.md, 
    paddingVertical: 4, 
    gap: 4,
  },
  reviewButtonText: { 
    ...TYPOGRAPHY.caption,
    fontSize: 9,
    color: COLORS.black 
  },
  
  // Empty State
  emptyContainer: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    padding: SIZES.xl 
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
    marginBottom: SIZES.sm 
  },
  emptyText: { 
    ...TYPOGRAPHY.bodySmall,
    textAlign: 'center', 
    lineHeight: 18,
    marginBottom: SIZES.lg 
  },
  shopButton: { 
    borderWidth: 0.5, 
    borderColor: COLORS.grayLight,
    paddingHorizontal: SIZES.xl, 
    paddingVertical: SIZES.md 
  },
  shopButtonText: { 
    ...TYPOGRAPHY.button,
    color: COLORS.black 
  },
});

export default OrdersScreen;