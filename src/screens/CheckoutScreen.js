// 📁 src/screens/CheckoutScreen.js - LÜKS MİNİMALİST VERSİYON
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, TYPOGRAPHY, SIZES } from '../constants/Theme';

const CheckoutScreen = ({ route, navigation }) => {
  const { cartItems, totalPrice } = route.params;
  const [loading, setLoading] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState('credit_card');
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [newAddress, setNewAddress] = useState({
    title: '',
    name: '',
    phone: '',
    address: '',
    city: '',
    district: '',
  });

  useEffect(() => {
    loadAddresses();
  }, []);

  const loadAddresses = async () => {
    const saved = await AsyncStorage.getItem('@user_addresses');
    const addrList = saved ? JSON.parse(saved) : [];
    setAddresses(addrList);
    if (addrList.length > 0 && !selectedAddress) {
      setSelectedAddress(addrList[0]);
    }
  };

  const saveAddresses = async (newAddresses) => {
    await AsyncStorage.setItem('@user_addresses', JSON.stringify(newAddresses));
  };

  const addNewAddress = () => {
    if (!newAddress.title || !newAddress.name || !newAddress.phone || !newAddress.address || !newAddress.city) {
      Alert.alert('Hata', 'Lütfen tüm alanları doldurun!');
      return;
    }

    const address = {
      id: Date.now().toString(),
      ...newAddress,
    };
    const updatedAddresses = [...addresses, address];
    setAddresses(updatedAddresses);
    saveAddresses(updatedAddresses);
    setSelectedAddress(address);
    setShowAddAddress(false);
    setNewAddress({
      title: '',
      name: '',
      phone: '',
      address: '',
      city: '',
      district: '',
    });
    Alert.alert('Başarılı', 'Adres eklendi!');
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      Alert.alert('Hata', 'Lütfen bir adres seçin!');
      return;
    }

    setLoading(true);
    
    setTimeout(async () => {
      const newOrder = {
        id: Date.now().toString(),
        items: cartItems,
        totalPrice: totalPrice,
        address: selectedAddress,
        paymentMethod: paymentMethod,
        status: 'pending',
        createdAt: new Date().toISOString(),
      };

      const savedOrders = await AsyncStorage.getItem('@user_orders');
      const orders = savedOrders ? JSON.parse(savedOrders) : [];
      orders.unshift(newOrder);
      await AsyncStorage.setItem('@user_orders', JSON.stringify(orders));
      
      await AsyncStorage.setItem('@user_cart', JSON.stringify([]));
      
      setLoading(false);
      Alert.alert(
        'Siparişiniz Alındı!',
        `Sipariş numaranız: ${newOrder.id.slice(-6)}`,
        [{ text: 'Tamam', onPress: () => navigation.navigate('Orders') }]
      );
    }, 1500);
  };

  const formatPrice = (price) => {
    return Math.round(price).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

  const PaymentOption = ({ id, title, icon, onSelect }) => (
    <TouchableOpacity
      style={[styles.paymentOption, paymentMethod === id && styles.paymentOptionActive]}
      onPress={() => onSelect(id)}
      activeOpacity={0.7}
    >
      <View style={[styles.paymentIconContainer, paymentMethod === id && styles.paymentIconContainerActive]}>
        <Ionicons name={icon} size={18} color={paymentMethod === id ? COLORS.white : COLORS.black} />
      </View>
      <Text style={[styles.paymentOptionText, paymentMethod === id && styles.paymentOptionTextActive]}>
        {title}
      </Text>
      {paymentMethod === id && (
        <View style={styles.checkIcon}>
          <Ionicons name="checkmark" size={12} color={COLORS.white} />
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.black} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>ÖDEME</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={styles.scrollContent}
      >
        {/* Adres Bölümü */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>TESLİMAT ADRESİ</Text>
            <TouchableOpacity onPress={() => setShowAddAddress(!showAddAddress)}>
              <Text style={styles.addButton}>
                {showAddAddress ? 'İPTAL' : '+ YENİ ADRES'}
              </Text>
            </TouchableOpacity>
          </View>

          {showAddAddress ? (
            <View style={styles.addAddressForm}>
              <TextInput
                style={styles.input}
                placeholder="Adres Başlığı (Ev, İş, vb.)"
                placeholderTextColor={COLORS.grayMedium}
                value={newAddress.title}
                onChangeText={(text) => setNewAddress({...newAddress, title: text})}
              />
              <TextInput
                style={styles.input}
                placeholder="Ad Soyad"
                placeholderTextColor={COLORS.grayMedium}
                value={newAddress.name}
                onChangeText={(text) => setNewAddress({...newAddress, name: text})}
              />
              <TextInput
                style={styles.input}
                placeholder="Telefon"
                placeholderTextColor={COLORS.grayMedium}
                keyboardType="phone-pad"
                value={newAddress.phone}
                onChangeText={(text) => setNewAddress({...newAddress, phone: text})}
              />
              <View style={styles.rowInput}>
                <TextInput
                  style={[styles.input, styles.halfInput]}
                  placeholder="İlçe"
                  placeholderTextColor={COLORS.grayMedium}
                  value={newAddress.district}
                  onChangeText={(text) => setNewAddress({...newAddress, district: text})}
                />
                <TextInput
                  style={[styles.input, styles.halfInput]}
                  placeholder="İl"
                  placeholderTextColor={COLORS.grayMedium}
                  value={newAddress.city}
                  onChangeText={(text) => setNewAddress({...newAddress, city: text})}
                />
              </View>
              <TextInput
                style={[styles.input, styles.addressInput]}
                placeholder="Açık Adres"
                placeholderTextColor={COLORS.grayMedium}
                multiline
                value={newAddress.address}
                onChangeText={(text) => setNewAddress({...newAddress, address: text})}
              />
              <TouchableOpacity style={styles.saveAddressButton} onPress={addNewAddress}>
                <Text style={styles.saveAddressButtonText}>ADRESİ KAYDET</Text>
              </TouchableOpacity>
            </View>
          ) : (
            addresses.length === 0 ? (
              <TouchableOpacity style={styles.noAddress} onPress={() => setShowAddAddress(true)}>
                <View style={styles.noAddressIcon}>
                  <Ionicons name="location-outline" size={32} color={COLORS.grayMedium} />
                </View>
                <Text style={styles.noAddressTitle}>ADRES BULUNMUYOR</Text>
                <Text style={styles.noAddressText}>Teslimat için bir adres ekleyin</Text>
              </TouchableOpacity>
            ) : (
              addresses.map((address) => (
                <TouchableOpacity
                  key={address.id}
                  style={[styles.addressCard, selectedAddress?.id === address.id && styles.addressCardActive]}
                  onPress={() => setSelectedAddress(address)}
                  activeOpacity={0.7}
                >
                  <View style={styles.addressCardHeader}>
                    <View style={styles.addressCardTitleContainer}>
                      <Ionicons name="location" size={12} color={COLORS.black} />
                      <Text style={styles.addressCardTitle}>{address.title}</Text>
                    </View>
                    {selectedAddress?.id === address.id && (
                      <View style={styles.addressCheckIcon}>
                        <Ionicons name="checkmark" size={10} color={COLORS.white} />
                      </View>
                    )}
                  </View>
                  <Text style={styles.addressCardText}>{address.name}</Text>
                  <Text style={styles.addressCardText}>{address.phone}</Text>
                  <Text style={styles.addressCardText}>
                    {address.address}, {address.district}, {address.city}
                  </Text>
                </TouchableOpacity>
              ))
            )
          )}
        </View>

        {/* Ödeme Yöntemi */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ÖDEME YÖNTEMİ</Text>
          <PaymentOption
            id="credit_card"
            title="Kredi Kartı"
            icon="card-outline"
            onSelect={setPaymentMethod}
          />
          <PaymentOption
            id="transfer"
            title="Havale/EFT"
            icon="swap-horizontal-outline"
            onSelect={setPaymentMethod}
          />
          <PaymentOption
            id="cash"
            title="Kapıda Ödeme"
            icon="cash-outline"
            onSelect={setPaymentMethod}
          />
        </View>

        {/* Sipariş Özeti */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>SİPARİŞ ÖZETİ</Text>
          
          <View style={styles.orderItem}>
            <Text style={styles.orderItemLabel}>Ürün Toplamı</Text>
            <Text style={styles.orderItemValue}>₺{formatPrice(totalPrice)}</Text>
          </View>
          
          <View style={styles.orderItem}>
            <Text style={styles.orderItemLabel}>Kargo Ücreti</Text>
            <Text style={styles.orderItemValue}>ÜCRETSİZ</Text>
          </View>
          
          {totalPrice > 0 && totalPrice < 1000 && (
            <View style={styles.shippingInfo}>
              <Ionicons name="information-circle-outline" size={12} color={COLORS.grayMedium} />
              <Text style={styles.shippingInfoText}>
                1000 TL ve üzeri alışverişlerde kargo ücretsiz!
              </Text>
            </View>
          )}
          
          <View style={styles.orderDivider} />
          
          <View style={styles.orderTotal}>
            <Text style={styles.orderTotalLabel}>Toplam Tutar</Text>
            <Text style={styles.orderTotalValue}>₺{formatPrice(totalPrice)}</Text>
          </View>
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <View style={styles.footerTotal}>
          <Text style={styles.footerTotalLabel}>TOPLAM</Text>
          <Text style={styles.footerTotalValue}>₺{formatPrice(totalPrice)}</Text>
        </View>
        <TouchableOpacity
          style={[styles.placeOrderButton, loading && styles.placeOrderButtonDisabled]}
          onPress={handlePlaceOrder}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color={COLORS.white} />
          ) : (
            <>
              <Text style={styles.placeOrderButtonText}>SİPARİŞİ TAMAMLA</Text>
              <Ionicons name="arrow-forward" size={14} color={COLORS.white} />
            </>
          )}
        </TouchableOpacity>
      </View>
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
    alignItems: 'flex-start',
  },
  headerTitle: {
    ...TYPOGRAPHY.caption,
    letterSpacing: 2,
  },
  
  scrollContent: {
    paddingBottom: 100,
  },
  
  // Section
  section: {
    padding: SIZES.lg,
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.grayLight,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.md,
  },
  sectionTitle: {
    ...TYPOGRAPHY.caption,
  },
  addButton: {
    ...TYPOGRAPHY.caption,
    color: COLORS.black,
  },
  
  // Adres Form
  addAddressForm: {
    gap: SIZES.md,
  },
  input: {
    ...TYPOGRAPHY.body,
    borderWidth: 0.5,
    borderColor: COLORS.grayLight,
    paddingHorizontal: SIZES.md,
    paddingVertical: SIZES.sm,
    color: COLORS.black,
  },
  addressInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  rowInput: {
    flexDirection: 'row',
    gap: SIZES.md,
  },
  halfInput: {
    flex: 1,
  },
  saveAddressButton: {
    backgroundColor: COLORS.black,
    paddingVertical: SIZES.md,
    alignItems: 'center',
    marginTop: SIZES.sm,
  },
  saveAddressButtonText: {
    ...TYPOGRAPHY.button,
    color: COLORS.white,
  },
  
  // No Address
  noAddress: {
    alignItems: 'center',
    padding: SIZES.xl,
    borderWidth: 0.5,
    borderColor: COLORS.grayLight,
    gap: SIZES.md,
  },
  noAddressIcon: {
    width: 64,
    height: 64,
    borderWidth: 0.5,
    borderColor: COLORS.grayLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noAddressTitle: {
    ...TYPOGRAPHY.caption,
  },
  noAddressText: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.grayMedium,
  },
  
  // Address Card
  addressCard: {
    borderWidth: 0.5,
    borderColor: COLORS.grayLight,
    padding: SIZES.md,
    marginBottom: SIZES.md,
  },
  addressCardActive: {
    borderWidth: 1,
    borderColor: COLORS.black,
  },
  addressCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.sm,
  },
  addressCardTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.xs,
  },
  addressCardTitle: {
    ...TYPOGRAPHY.body,
    fontWeight: '500',
  },
  addressCheckIcon: {
    width: 16,
    height: 16,
    backgroundColor: COLORS.black,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addressCardText: {
    ...TYPOGRAPHY.bodySmall,
    marginBottom: 2,
  },
  
  // Payment Options
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SIZES.md,
    borderWidth: 0.5,
    borderColor: COLORS.grayLight,
    marginBottom: SIZES.md,
    gap: SIZES.md,
  },
  paymentOptionActive: {
    borderWidth: 1,
    borderColor: COLORS.black,
  },
  paymentIconContainer: {
    width: 36,
    height: 36,
    borderWidth: 0.5,
    borderColor: COLORS.grayLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  paymentIconContainerActive: {
    backgroundColor: COLORS.black,
    borderColor: COLORS.black,
  },
  paymentOptionText: {
    ...TYPOGRAPHY.body,
    flex: 1,
  },
  paymentOptionTextActive: {
    fontWeight: '500',
  },
  checkIcon: {
    width: 18,
    height: 18,
    backgroundColor: COLORS.black,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // Order Summary
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SIZES.md,
  },
  orderItemLabel: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.grayMedium,
  },
  orderItemValue: {
    ...TYPOGRAPHY.bodySmall,
    fontWeight: '500',
  },
  shippingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.xs,
    marginTop: SIZES.xs,
    marginBottom: SIZES.sm,
  },
  shippingInfoText: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.grayMedium,
  },
  orderDivider: {
    height: 0.5,
    backgroundColor: COLORS.grayLight,
    marginVertical: SIZES.md,
  },
  orderTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderTotalLabel: {
    ...TYPOGRAPHY.body,
    fontWeight: '500',
  },
  orderTotalValue: {
    ...TYPOGRAPHY.title3,
    fontWeight: '500',
  },
  
  // Footer
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.md,
    padding: SIZES.md,
    backgroundColor: COLORS.white,
    borderTopWidth: 0.5,
    borderTopColor: COLORS.grayLight,
  },
  footerTotal: {
    flex: 1,
  },
  footerTotalLabel: {
    ...TYPOGRAPHY.caption,
    color: COLORS.grayMedium,
  },
  footerTotalValue: {
    ...TYPOGRAPHY.title3,
    fontWeight: '500',
  },
  placeOrderButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SIZES.sm,
    backgroundColor: COLORS.black,
    paddingVertical: SIZES.md,
    paddingHorizontal: SIZES.lg,
    flex: 1,
  },
  placeOrderButtonDisabled: {
    opacity: 0.7,
  },
  placeOrderButtonText: {
    ...TYPOGRAPHY.button,
    color: COLORS.white,
  },
});

export default CheckoutScreen;