// 📁 src/screens/CheckoutScreen.js - REVİZE EDİLMİŞ LÜKS VERSİYON
import React, { useState, useEffect, useCallback, useMemo, memo, useRef } from 'react';
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
  Platform,
  KeyboardAvoidingView,
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { COLORS, TYPOGRAPHY, SIZES, SPACING } from '../constants/Theme';

const { width, height } = Dimensions.get('window');

// ============================================================
// 📌 YARDIMCI BİLEŞENLER (Memoized)
// ============================================================

// Input Component with Validation
const FormInput = memo(({ 
  label,
  placeholder,
  value,
  onChangeText,
  keyboardType = 'default',
  secureTextEntry = false,
  multiline = false,
  error,
  required = false,
  maxLength,
  autoCapitalize = 'none'
}) => (
  <View style={styles.inputGroup}>
    {label && (
      <View style={styles.inputLabelContainer}>
        <Text style={styles.inputLabel}>{label}</Text>
        {required && <Text style={styles.requiredStar}>*</Text>}
      </View>
    )}
    <TextInput
      style={[
        styles.input,
        multiline && styles.inputMultiline,
        error && styles.inputError
      ]}
      placeholder={placeholder}
      placeholderTextColor={COLORS.grayMedium || '#999999'}
      value={value}
      onChangeText={onChangeText}
      keyboardType={keyboardType}
      secureTextEntry={secureTextEntry}
      multiline={multiline}
      maxLength={maxLength}
      autoCapitalize={autoCapitalize}
      accessibilityLabel={label || placeholder}
      accessibilityHint={`${placeholder} giriş alanı`}
      accessibilityRole="text"
    />
    {error && <Text style={styles.inputErrorText}>{error}</Text>}
  </View>
));

FormInput.displayName = 'FormInput';

// Payment Option Component
const PaymentOption = memo(({ id, title, icon, selected, onSelect }) => (
  <TouchableOpacity
    style={[styles.paymentOption, selected && styles.paymentOptionActive]}
    onPress={() => onSelect(id)}
    activeOpacity={0.7}
    accessibilityLabel={`${title} ödeme yöntemi`}
    accessibilityRole="radio"
    accessibilityState={{ checked: selected }}
  >
    <View style={[styles.paymentIconContainer, selected && styles.paymentIconContainerActive]}>
      <Ionicons name={icon} size={18} color={selected ? COLORS.white : COLORS.black} />
    </View>
    <Text style={[styles.paymentOptionText, selected && styles.paymentOptionTextActive]}>
      {title}
    </Text>
    {selected && (
      <View style={styles.checkIcon}>
        <Ionicons name="checkmark" size={12} color={COLORS.white} />
      </View>
    )}
  </TouchableOpacity>
));

PaymentOption.displayName = 'PaymentOption';

// Address Card Component
const AddressCard = memo(({ address, selected, onSelect, onEdit, onDelete }) => {
  const [showActions, setShowActions] = useState(false);
  
  return (
    <TouchableOpacity
      style={[styles.addressCard, selected && styles.addressCardActive]}
      onPress={() => onSelect(address)}
      activeOpacity={0.7}
      accessibilityLabel={`${address.title} adresi`}
      accessibilityRole="button"
      onLongPress={() => setShowActions(true)}
    >
      <View style={styles.addressCardHeader}>
        <View style={styles.addressCardTitleContainer}>
          <Ionicons name="location" size={14} color={COLORS.black} />
          <Text style={styles.addressCardTitle}>{address.title}</Text>
        </View>
        {selected && (
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
      
      {showActions && (
        <View style={styles.addressActions}>
          <TouchableOpacity 
            style={styles.addressActionButton}
            onPress={() => {
              setShowActions(false);
              onEdit?.(address);
            }}
            accessibilityLabel="Adresi düzenle"
          >
            <Ionicons name="pencil-outline" size={16} color={COLORS.black} />
            <Text style={styles.addressActionText}>Düzenle</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.addressActionButton, styles.addressActionDelete]}
            onPress={() => {
              setShowActions(false);
              onDelete?.(address.id);
            }}
            accessibilityLabel="Adresi sil"
          >
            <Ionicons name="trash-outline" size={16} color={COLORS.red || '#FF3B30'} />
            <Text style={[styles.addressActionText, styles.addressActionDeleteText]}>Sil</Text>
          </TouchableOpacity>
        </View>
      )}
    </TouchableOpacity>
  );
});

AddressCard.displayName = 'AddressCard';

// ============================================================
// 📌 ANA BİLEŞEN
// ============================================================
const CheckoutScreen = ({ route, navigation }) => {
  const { cartItems = [], totalPrice = 0 } = route.params || {};
  
  const [loading, setLoading] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState('credit_card');
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [isEditingAddress, setIsEditingAddress] = useState(null);
  
  const [newAddress, setNewAddress] = useState({
    title: '',
    name: '',
    phone: '',
    address: '',
    city: '',
    district: '',
  });
  
  const [cardInfo, setCardInfo] = useState({
    number: '',
    expiry: '',
    cvv: '',
    name: ''
  });
  
  const scrollViewRef = useRef(null);

  // ============================================================
  // 📌 NETWORK & LOADING
  // ============================================================
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsOffline(!state.isConnected);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    loadAddresses();
  }, []);

  const loadAddresses = useCallback(async () => {
    try {
      const saved = await AsyncStorage.getItem('@user_addresses');
      const addrList = saved ? JSON.parse(saved) : [];
      setAddresses(addrList);
      if (addrList.length > 0 && !selectedAddress) {
        setSelectedAddress(addrList[0]);
      }
    } catch (error) {
      console.error('Adres yüklenemedi:', error);
    }
  }, [selectedAddress]);

  const saveAddresses = useCallback(async (newAddresses) => {
    try {
      await AsyncStorage.setItem('@user_addresses', JSON.stringify(newAddresses));
    } catch (error) {
      console.error('Adres kaydedilemedi:', error);
    }
  }, []);

  // ============================================================
  // 📌 ADDRESS VALIDATION
  // ============================================================
  const validateAddress = useCallback((address) => {
    const errors = {};
    
    if (!address.title?.trim()) {
      errors.title = 'Adres başlığı gerekli';
    } else if (address.title.trim().length < 2) {
      errors.title = 'Adres başlığı en az 2 karakter olmalı';
    }
    
    if (!address.name?.trim()) {
      errors.name = 'Ad soyad gerekli';
    } else if (address.name.trim().length < 3) {
      errors.name = 'Ad soyad en az 3 karakter olmalı';
    }
    
    if (!address.phone?.trim()) {
      errors.phone = 'Telefon numarası gerekli';
    } else if (!/^[0-9]{10,15}$/.test(address.phone.replace(/\s/g, ''))) {
      errors.phone = 'Geçerli bir telefon numarası girin';
    }
    
    if (!address.address?.trim()) {
      errors.address = 'Açık adres gerekli';
    } else if (address.address.trim().length < 5) {
      errors.address = 'Açık adres en az 5 karakter olmalı';
    }
    
    if (!address.city?.trim()) {
      errors.city = 'İl gerekli';
    }
    
    return errors;
  }, []);

  const validateCard = useCallback((card) => {
    const errors = {};
    
    if (!card.number?.trim()) {
      errors.number = 'Kart numarası gerekli';
    } else if (!/^[0-9]{16}$/.test(card.number.replace(/\s/g, ''))) {
      errors.number = 'Geçerli bir kart numarası girin (16 haneli)';
    }
    
    if (!card.expiry?.trim()) {
      errors.expiry = 'Son kullanma tarihi gerekli';
    } else if (!/^(0[1-9]|1[0-2])\/([0-9]{2})$/.test(card.expiry)) {
      errors.expiry = 'Geçerli bir tarih girin (MM/YY)';
    }
    
    if (!card.cvv?.trim()) {
      errors.cvv = 'CVV kodu gerekli';
    } else if (!/^[0-9]{3,4}$/.test(card.cvv)) {
      errors.cvv = 'Geçerli bir CVV girin (3-4 haneli)';
    }
    
    if (!card.name?.trim()) {
      errors.name = 'Kart sahibi adı gerekli';
    }
    
    return errors;
  }, []);

  // ============================================================
  // 📌 ADDRESS CRUD
  // ============================================================
  const addNewAddress = useCallback(() => {
    const errors = validateAddress(newAddress);
    setValidationErrors(errors);
    
    if (Object.keys(errors).length > 0) {
      Alert.alert('Hata', 'Lütfen tüm alanları doğru doldurun');
      return;
    }

    const address = {
      id: Date.now().toString(),
      ...newAddress,
      createdAt: new Date().toISOString(),
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
    setValidationErrors({});
    Alert.alert('Başarılı', 'Adres eklendi!');
  }, [newAddress, addresses, validateAddress, saveAddresses]);

  const editAddress = useCallback((address) => {
    setNewAddress({
      title: address.title,
      name: address.name,
      phone: address.phone,
      address: address.address,
      city: address.city,
      district: address.district || '',
    });
    setIsEditingAddress(address.id);
    setShowAddAddress(true);
  }, []);

  const updateAddress = useCallback(() => {
    const errors = validateAddress(newAddress);
    setValidationErrors(errors);
    
    if (Object.keys(errors).length > 0) {
      Alert.alert('Hata', 'Lütfen tüm alanları doğru doldurun');
      return;
    }

    const updatedAddresses = addresses.map(addr => 
      addr.id === isEditingAddress 
        ? { ...addr, ...newAddress, updatedAt: new Date().toISOString() }
        : addr
    );
    
    setAddresses(updatedAddresses);
    saveAddresses(updatedAddresses);
    setSelectedAddress(updatedAddresses.find(a => a.id === isEditingAddress));
    setShowAddAddress(false);
    setIsEditingAddress(null);
    setNewAddress({
      title: '',
      name: '',
      phone: '',
      address: '',
      city: '',
      district: '',
    });
    setValidationErrors({});
    Alert.alert('Başarılı', 'Adres güncellendi!');
  }, [newAddress, addresses, isEditingAddress, validateAddress, saveAddresses]);

  const deleteAddress = useCallback((addressId) => {
    Alert.alert(
      'Adresi Sil',
      'Bu adresi silmek istediğinize emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: () => {
            const updatedAddresses = addresses.filter(a => a.id !== addressId);
            setAddresses(updatedAddresses);
            saveAddresses(updatedAddresses);
            if (selectedAddress?.id === addressId) {
              setSelectedAddress(updatedAddresses[0] || null);
            }
          }
        }
      ]
    );
  }, [addresses, selectedAddress, saveAddresses]);

  // ============================================================
  // 📌 ORDER HANDLING
  // ============================================================
  const handlePlaceOrder = useCallback(async () => {
    if (!selectedAddress) {
      Alert.alert('Hata', 'Lütfen bir adres seçin!');
      return;
    }

    if (paymentMethod === 'credit_card') {
      const cardErrors = validateCard(cardInfo);
      if (Object.keys(cardErrors).length > 0) {
        setValidationErrors(cardErrors);
        Alert.alert('Hata', 'Lütfen kart bilgilerini doğru girin');
        return;
      }
    }

    if (isOffline) {
      Alert.alert(
        'Çevrimdışı',
        'Sipariş vermek için internet bağlantısı gerekli. Lütfen bağlantınızı kontrol edin.',
        [{ text: 'Tamam' }]
      );
      return;
    }

    setIsProcessing(true);
    setLoading(true);

    try {
      // Simüle edilmiş sipariş işlemi
      await new Promise(resolve => setTimeout(resolve, 2000));

      const newOrder = {
        id: `ORD-${Date.now().toString().slice(-8)}`,
        items: cartItems,
        totalPrice: totalPrice,
        address: selectedAddress,
        paymentMethod: paymentMethod,
        status: 'pending',
        createdAt: new Date().toISOString(),
        orderNumber: `#${Date.now().toString().slice(-6)}`,
        itemCount: cartItems.length,
      };

      const savedOrders = await AsyncStorage.getItem('@user_orders');
      const orders = savedOrders ? JSON.parse(savedOrders) : [];
      orders.unshift(newOrder);
      await AsyncStorage.setItem('@user_orders', JSON.stringify(orders));
      
      await AsyncStorage.setItem('@user_cart', JSON.stringify([]));
      
      setIsProcessing(false);
      setLoading(false);
      
      Alert.alert(
        '🎉 Siparişiniz Alındı!',
        `Sipariş numaranız: ${newOrder.orderNumber}\nToplam: ₺${formatPrice(totalPrice)}\nTeslimat adresi: ${selectedAddress.title}`,
        [{ 
          text: 'Siparişlerim', 
          onPress: () => navigation.navigate('Orders'),
          style: 'default'
        },
        { 
          text: 'Ana Sayfa', 
          onPress: () => navigation.navigate('Home'),
          style: 'cancel'
        }]
      );
    } catch (error) {
      console.error('Sipariş hatası:', error);
      setIsProcessing(false);
      setLoading(false);
      Alert.alert('Hata', 'Sipariş işlemi sırasında bir sorun oluştu. Lütfen tekrar deneyin.');
    }
  }, [selectedAddress, paymentMethod, cardInfo, cartItems, totalPrice, isOffline, validateCard, navigation]);

  const formatPrice = useCallback((price) => {
    if (!price) return '0';
    return Math.round(price).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  }, []);

  // ============================================================
  // 📌 CARD INPUT FORMATING
  // ============================================================
  const formatCardNumber = useCallback((text) => {
    const cleaned = text.replace(/\s/g, '');
    const formatted = cleaned.replace(/(.{4})/g, '$1 ').trim();
    return formatted.slice(0, 19);
  }, []);

  const formatExpiry = useCallback((text) => {
    const cleaned = text.replace(/\D/g, '');
    if (cleaned.length >= 2) {
      return `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}`;
    }
    return cleaned;
  }, []);

  // ============================================================
  // 📌 RENDER
  // ============================================================
  const renderAddressSection = useCallback(() => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>TESLİMAT ADRESİ</Text>
        <TouchableOpacity 
          onPress={() => {
            setShowAddAddress(!showAddAddress);
            setIsEditingAddress(null);
            setNewAddress({
              title: '',
              name: '',
              phone: '',
              address: '',
              city: '',
              district: '',
            });
            setValidationErrors({});
          }}
          accessibilityLabel={showAddAddress ? "Adres eklemeyi iptal" : "Yeni adres ekle"}
          accessibilityRole="button"
        >
          <Text style={styles.addButton}>
            {showAddAddress ? 'İPTAL' : '+ YENİ ADRES'}
          </Text>
        </TouchableOpacity>
      </View>

      {showAddAddress ? (
        <View style={styles.addAddressForm}>
          <FormInput
            label="Adres Başlığı"
            placeholder="Ev, İş, vb."
            value={newAddress.title}
            onChangeText={(text) => setNewAddress({...newAddress, title: text})}
            required
            error={validationErrors.title}
            autoCapitalize="words"
          />
          <FormInput
            label="Ad Soyad"
            placeholder="Adınız ve soyadınız"
            value={newAddress.name}
            onChangeText={(text) => setNewAddress({...newAddress, name: text})}
            required
            error={validationErrors.name}
            autoCapitalize="words"
          />
          <FormInput
            label="Telefon"
            placeholder="5XX XXX XX XX"
            value={newAddress.phone}
            onChangeText={(text) => setNewAddress({...newAddress, phone: text})}
            keyboardType="phone-pad"
            required
            error={validationErrors.phone}
          />
          <View style={styles.rowInput}>
            <FormInput
              label="İlçe"
              placeholder="İlçe"
              value={newAddress.district}
              onChangeText={(text) => setNewAddress({...newAddress, district: text})}
              style={styles.halfInput}
              autoCapitalize="words"
            />
            <FormInput
              label="İl"
              placeholder="İl"
              value={newAddress.city}
              onChangeText={(text) => setNewAddress({...newAddress, city: text})}
              required
              error={validationErrors.city}
              style={styles.halfInput}
              autoCapitalize="words"
            />
          </View>
          <FormInput
            label="Açık Adres"
            placeholder="Mahalle, sokak, apartman, daire..."
            value={newAddress.address}
            onChangeText={(text) => setNewAddress({...newAddress, address: text})}
            multiline
            required
            error={validationErrors.address}
            maxLength={200}
          />
          <TouchableOpacity 
            style={styles.saveAddressButton} 
            onPress={isEditingAddress ? updateAddress : addNewAddress}
            accessibilityLabel={isEditingAddress ? "Adresi güncelle" : "Adresi kaydet"}
            accessibilityRole="button"
          >
            <Text style={styles.saveAddressButtonText}>
              {isEditingAddress ? 'ADRESSİ GÜNCELLE' : 'ADRESİ KAYDET'}
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        addresses.length === 0 ? (
          <TouchableOpacity 
            style={styles.noAddress} 
            onPress={() => setShowAddAddress(true)}
            accessibilityLabel="Adres ekle"
            accessibilityRole="button"
          >
            <View style={styles.noAddressIcon}>
              <Ionicons name="location-outline" size={32} color={COLORS.grayMedium} />
            </View>
            <Text style={styles.noAddressTitle}>ADRES BULUNMUYOR</Text>
            <Text style={styles.noAddressText}>Teslimat için bir adres ekleyin</Text>
          </TouchableOpacity>
        ) : (
          addresses.map((address) => (
            <AddressCard
              key={address.id}
              address={address}
              selected={selectedAddress?.id === address.id}
              onSelect={setSelectedAddress}
              onEdit={editAddress}
              onDelete={deleteAddress}
            />
          ))
        )
      )}
    </View>
  ), [
    showAddAddress,
    newAddress,
    validationErrors,
    addresses,
    selectedAddress,
    isEditingAddress,
    addNewAddress,
    updateAddress,
    editAddress,
    deleteAddress
  ]);

  const renderPaymentSection = useCallback(() => {
    const paymentOptions = [
      { id: 'credit_card', title: 'Kredi Kartı', icon: 'card-outline' },
      { id: 'transfer', title: 'Havale/EFT', icon: 'swap-horizontal-outline' },
      { id: 'cash', title: 'Kapıda Ödeme', icon: 'cash-outline' },
    ];

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>ÖDEME YÖNTEMİ</Text>
        
        {paymentOptions.map(option => (
          <PaymentOption
            key={option.id}
            id={option.id}
            title={option.title}
            icon={option.icon}
            selected={paymentMethod === option.id}
            onSelect={setPaymentMethod}
          />
        ))}

        {paymentMethod === 'credit_card' && (
          <View style={styles.cardForm}>
            <FormInput
              label="Kart Numarası"
              placeholder="1234 5678 9012 3456"
              value={cardInfo.number}
              onChangeText={(text) => setCardInfo({...cardInfo, number: formatCardNumber(text)})}
              keyboardType="numeric"
              required
              error={validationErrors.number}
              maxLength={19}
            />
            <View style={styles.rowInput}>
              <FormInput
                label="Son Kullanma"
                placeholder="MM/YY"
                value={cardInfo.expiry}
                onChangeText={(text) => setCardInfo({...cardInfo, expiry: formatExpiry(text)})}
                keyboardType="numeric"
                required
                error={validationErrors.expiry}
                style={styles.halfInput}
                maxLength={5}
              />
              <FormInput
                label="CVV"
                placeholder="123"
                value={cardInfo.cvv}
                onChangeText={(text) => setCardInfo({...cardInfo, cvv: text.replace(/\D/g, '').slice(0, 4)})}
                keyboardType="numeric"
                required
                error={validationErrors.cvv}
                style={styles.halfInput}
                maxLength={4}
                secureTextEntry
              />
            </View>
            <FormInput
              label="Kart Sahibi Adı"
              placeholder="Adınız ve soyadınız"
              value={cardInfo.name}
              onChangeText={(text) => setCardInfo({...cardInfo, name: text})}
              required
              error={validationErrors.name}
              autoCapitalize="words"
            />
          </View>
        )}
      </View>
    );
  }, [paymentMethod, cardInfo, validationErrors, formatCardNumber, formatExpiry]);

  const renderOrderSummary = useCallback(() => {
    const hasShippingFee = totalPrice > 0 && totalPrice < 1000;
    
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>SİPARİŞ ÖZETİ</Text>
        
        <View style={styles.orderItem}>
          <Text style={styles.orderItemLabel}>
            Ürün Toplamı ({cartItems.length} ürün)
          </Text>
          <Text style={styles.orderItemValue}>₺{formatPrice(totalPrice)}</Text>
        </View>
        
        <View style={styles.orderItem}>
          <Text style={styles.orderItemLabel}>Kargo Ücreti</Text>
          <Text style={[styles.orderItemValue, hasShippingFee && styles.orderItemValueFee]}>
            {hasShippingFee ? '₺29.90' : 'ÜCRETSİZ'}
          </Text>
        </View>
        
        {hasShippingFee && (
          <View style={styles.shippingInfo}>
            <Ionicons name="information-circle-outline" size={14} color={COLORS.grayMedium} />
            <Text style={styles.shippingInfoText}>
              {formatPrice(1000 - totalPrice)} TL daha alışveriş yaparsanız kargo ücretsiz!
            </Text>
          </View>
        )}
        
        <View style={styles.orderDivider} />
        
        <View style={styles.orderTotal}>
          <Text style={styles.orderTotalLabel}>Toplam Tutar</Text>
          <Text style={styles.orderTotalValue}>
            ₺{formatPrice(hasShippingFee ? totalPrice + 29.90 : totalPrice)}
          </Text>
        </View>
      </View>
    );
  }, [totalPrice, cartItems.length, formatPrice]);

  // ============================================================
  // 📌 MAIN RENDER
  // ============================================================
  if (!cartItems || cartItems.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
        <View style={styles.emptyContainer}>
          <Ionicons name="cart-outline" size={64} color={COLORS.grayMedium} />
          <Text style={styles.emptyTitle}>SEPET BOŞ</Text>
          <Text style={styles.emptyText}>Ödeme yapmak için sepete ürün ekleyin</Text>
          <TouchableOpacity 
            style={styles.exploreButton}
            onPress={() => navigation.goBack()}
            accessibilityLabel="Alışverişe dön"
            accessibilityRole="button"
          >
            <Text style={styles.exploreButtonText}>ALIŞVERİŞE DÖN</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
      
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            onPress={() => navigation.goBack()} 
            style={styles.backButton}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            accessibilityLabel="Geri dön"
            accessibilityRole="button"
          >
            <Ionicons name="arrow-back" size={24} color={COLORS.black} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>ÖDEME</Text>
          <View style={{ width: 40 }} />
        </View>

        {isOffline && (
          <View style={styles.offlineBanner}>
            <Ionicons name="wifi-outline" size={16} color={COLORS.white} />
            <Text style={styles.offlineText}>Çevrimdışı - Sipariş verilemez</Text>
          </View>
        )}

        <ScrollView 
          ref={scrollViewRef}
          showsVerticalScrollIndicator={false} 
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {renderAddressSection()}
          {renderPaymentSection()}
          {renderOrderSummary()}
        </ScrollView>

        {/* Footer */}
        <View style={styles.footer}>
          <View style={styles.footerTotal}>
            <Text style={styles.footerTotalLabel}>TOPLAM</Text>
            <Text style={styles.footerTotalValue}>
              ₺{formatPrice(totalPrice)}
            </Text>
            <Text style={styles.footerItemCount}>
              {cartItems.length} ürün
            </Text>
          </View>
          <TouchableOpacity
            style={[
              styles.placeOrderButton, 
              (loading || isProcessing || isOffline) && styles.placeOrderButtonDisabled
            ]}
            onPress={handlePlaceOrder}
            disabled={loading || isProcessing || isOffline}
            accessibilityLabel="Siparişi tamamla"
            accessibilityRole="button"
          >
            {loading || isProcessing ? (
              <ActivityIndicator size="small" color={COLORS.white} />
            ) : (
              <>
                <Text style={styles.placeOrderButtonText}>SİPARİŞİ TAMAMLA</Text>
                <Ionicons name="arrow-forward" size={16} color={COLORS.white} />
              </>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
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
  
  // Empty State
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SIZES.xl || 40,
  },
  emptyTitle: {
    ...TYPOGRAPHY.caption,
    marginTop: SIZES.lg || 20,
    marginBottom: 4,
  },
  emptyText: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.grayMedium || '#999999',
    textAlign: 'center',
    marginBottom: SIZES.lg || 20,
  },
  exploreButton: {
    borderWidth: 0.5,
    borderColor: COLORS.grayLight || '#E5E5E5',
    paddingHorizontal: SIZES.xl || 40,
    paddingVertical: SIZES.md || 16,
  },
  exploreButtonText: {
    ...TYPOGRAPHY.button,
    color: COLORS.black,
  },

  // Offline Banner
  offlineBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.red || '#FF3B30',
    paddingVertical: SIZES.xs || 8,
    paddingHorizontal: SIZES.md || 16,
    gap: SIZES.xs || 8,
  },
  offlineText: {
    ...TYPOGRAPHY.caption,
    fontSize: 10,
    color: COLORS.white,
  },
  
  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SIZES.lg || 20,
    paddingTop: Platform.OS === 'ios' ? 12 : SIZES.md || 16,
    paddingBottom: SIZES.md || 16,
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.grayLight || '#E5E5E5',
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
    paddingBottom: 120,
  },
  
  // Section
  section: {
    padding: SIZES.lg || 20,
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.grayLight || '#E5E5E5',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.md || 16,
  },
  sectionTitle: {
    ...TYPOGRAPHY.caption,
  },
  addButton: {
    ...TYPOGRAPHY.caption,
    color: COLORS.black,
  },
  
  // Form Input
  inputGroup: {
    marginBottom: SIZES.md || 16,
  },
  inputLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.xs || 8,
  },
  inputLabel: {
    ...TYPOGRAPHY.caption,
    fontSize: 11,
    color: COLORS.grayMedium || '#999999',
  },
  requiredStar: {
    ...TYPOGRAPHY.caption,
    fontSize: 11,
    color: COLORS.red || '#FF3B30',
    marginLeft: 4,
  },
  input: {
    ...TYPOGRAPHY.body,
    borderWidth: 0.5,
    borderColor: COLORS.grayLight || '#E5E5E5',
    paddingHorizontal: SIZES.md || 16,
    paddingVertical: SIZES.sm || 12,
    color: COLORS.black,
    fontSize: 14,
  },
  inputMultiline: {
    minHeight: 80,
    textAlignVertical: 'top',
    paddingTop: SIZES.sm || 12,
  },
  inputError: {
    borderColor: COLORS.red || '#FF3B30',
  },
  inputErrorText: {
    ...TYPOGRAPHY.caption,
    fontSize: 10,
    color: COLORS.red || '#FF3B30',
    marginTop: 4,
  },
  rowInput: {
    flexDirection: 'row',
    gap: SIZES.md || 16,
  },
  halfInput: {
    flex: 1,
  },
  
  // Add Address
  addAddressForm: {
    gap: SIZES.md || 16,
  },
  saveAddressButton: {
    backgroundColor: COLORS.black,
    paddingVertical: SIZES.md || 16,
    alignItems: 'center',
    marginTop: SIZES.sm || 12,
  },
  saveAddressButtonText: {
    ...TYPOGRAPHY.button,
    color: COLORS.white,
  },
  
  // No Address
  noAddress: {
    alignItems: 'center',
    padding: SIZES.xl || 40,
    borderWidth: 0.5,
    borderColor: COLORS.grayLight || '#E5E5E5',
    gap: SIZES.md || 16,
  },
  noAddressIcon: {
    width: 64,
    height: 64,
    borderWidth: 0.5,
    borderColor: COLORS.grayLight || '#E5E5E5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  noAddressTitle: {
    ...TYPOGRAPHY.caption,
  },
  noAddressText: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.grayMedium || '#999999',
  },
  
  // Address Card
  addressCard: {
    borderWidth: 0.5,
    borderColor: COLORS.grayLight || '#E5E5E5',
    padding: SIZES.md || 16,
    marginBottom: SIZES.md || 16,
  },
  addressCardActive: {
    borderWidth: 1,
    borderColor: COLORS.black,
  },
  addressCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.sm || 12,
  },
  addressCardTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.xs || 8,
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
  addressActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: SIZES.md || 16,
    marginTop: SIZES.md || 16,
    paddingTop: SIZES.md || 16,
    borderTopWidth: 0.5,
    borderTopColor: COLORS.grayLight || '#E5E5E5',
  },
  addressActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  addressActionDelete: {
    marginLeft: SIZES.md || 16,
  },
  addressActionText: {
    ...TYPOGRAPHY.caption,
    fontSize: 10,
  },
  addressActionDeleteText: {
    color: COLORS.red || '#FF3B30',
  },
  
  // Payment Options
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SIZES.md || 16,
    borderWidth: 0.5,
    borderColor: COLORS.grayLight || '#E5E5E5',
    marginBottom: SIZES.md || 16,
    gap: SIZES.md || 16,
  },
  paymentOptionActive: {
    borderWidth: 1,
    borderColor: COLORS.black,
  },
  paymentIconContainer: {
    width: 36,
    height: 36,
    borderWidth: 0.5,
    borderColor: COLORS.grayLight || '#E5E5E5',
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
  
  // Card Form
  cardForm: {
    marginTop: SIZES.md || 16,
    paddingTop: SIZES.md || 16,
    borderTopWidth: 0.5,
    borderTopColor: COLORS.grayLight || '#E5E5E5',
  },
  
  // Order Summary
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SIZES.md || 16,
  },
  orderItemLabel: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.grayMedium || '#999999',
  },
  orderItemValue: {
    ...TYPOGRAPHY.bodySmall,
    fontWeight: '500',
  },
  orderItemValueFee: {
    color: COLORS.black,
  },
  shippingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.xs || 8,
    marginTop: -SIZES.xs || -8,
    marginBottom: SIZES.sm || 12,
  },
  shippingInfoText: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.grayMedium || '#999999',
    fontSize: 10,
  },
  orderDivider: {
    height: 0.5,
    backgroundColor: COLORS.grayLight || '#E5E5E5',
    marginVertical: SIZES.md || 16,
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
    gap: SIZES.md || 16,
    padding: SIZES.md || 16,
    backgroundColor: COLORS.white,
    borderTopWidth: 0.5,
    borderTopColor: COLORS.grayLight || '#E5E5E5',
  },
  footerTotal: {
    flex: 1,
  },
  footerTotalLabel: {
    ...TYPOGRAPHY.caption,
    color: COLORS.grayMedium || '#999999',
    fontSize: 10,
  },
  footerTotalValue: {
    ...TYPOGRAPHY.title3,
    fontWeight: '600',
    fontSize: 18,
  },
  footerItemCount: {
    ...TYPOGRAPHY.caption,
    fontSize: 9,
    color: COLORS.grayMedium || '#999999',
  },
  placeOrderButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SIZES.sm || 12,
    backgroundColor: COLORS.black,
    paddingVertical: SIZES.md || 16,
    paddingHorizontal: SIZES.lg || 20,
    flex: 1,
    minHeight: 50,
  },
  placeOrderButtonDisabled: {
    opacity: 0.5,
  },
  placeOrderButtonText: {
    ...TYPOGRAPHY.button,
    color: COLORS.white,
  },
});

export default CheckoutScreen;