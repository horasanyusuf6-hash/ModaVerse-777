// 📁 src/components/CustomAlert.js - TAM REVİZE (Premium Kart Eklendi)

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Animated,
  Dimensions,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

// ============================================================
// 📌 PREMIUM TOAST/ALERT BİLEŞENİ
// ============================================================
const CustomAlert = ({
  visible,
  title,
  message,
  type = 'success',
  buttonText = 'Tamam',
  onPress,
  onClose,
  autoClose = true,
  autoCloseDelay = 2000,
  showPremium = false, // 🆕 Premium kart modu
}) => {
  const [isVisible, setIsVisible] = useState(visible);
  const slideAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      setIsVisible(true);
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 1,
          tension: 70,
          friction: 12,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();

      if (autoClose && !showPremium) {
        const timer = setTimeout(() => {
          handleClose();
        }, autoCloseDelay);
        return () => clearTimeout(timer);
      }
    } else {
      handleClose();
    }
  }, [visible]);

  const handleClose = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setIsVisible(false);
      if (onClose) onClose();
    });
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return { name: 'checkmark-circle', color: '#4CAF50' };
      case 'error':
        return { name: 'close-circle', color: '#FF3B30' };
      case 'warning':
        return { name: 'warning', color: '#FF9500' };
      case 'info':
        return { name: 'information-circle', color: '#007AFF' };
      default:
        return { name: 'checkmark-circle', color: '#4CAF50' };
    }
  };

  const icon = getIcon();

  if (!isVisible) return null;

  return (
    <Modal transparent visible={isVisible} animationType="none" onRequestClose={handleClose}>
      <TouchableOpacity 
        style={styles.overlay} 
        activeOpacity={1} 
        onPress={autoClose && !showPremium ? handleClose : undefined}
      >
        <Animated.View 
          style={[
            styles.container,
            {
              backgroundColor: '#1A1A1A',
              transform: [
                {
                  translateY: slideAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-100, 0],
                  }),
                },
              ],
              opacity: fadeAnim,
              borderColor: showPremium ? 'rgba(255,215,0,0.3)' : 'rgba(255,255,255,0.08)',
              borderWidth: showPremium ? 1 : 0.5,
            },
          ]}
        >
          {/* 🆕 Premium Rozet */}
          {showPremium && (
            <View style={styles.premiumBadge}>
              <Ionicons name="diamond" size={12} color="#FFD700" />
              <Text style={styles.premiumBadgeText}>PREMIUM</Text>
            </View>
          )}

          <View style={[styles.iconContainer, { backgroundColor: `${icon.color}20` }]}>
            <Ionicons name={icon.name} size={28} color={icon.color} />
          </View>

          <View style={styles.content}>
            {title && (
              <Text style={[styles.title, { color: '#FFFFFF' }]}>{title}</Text>
            )}
            <Text style={[styles.message, { color: 'rgba(255,255,255,0.85)' }]}>
              {message}
            </Text>
          </View>

          {(!autoClose || showPremium) && (
            <TouchableOpacity 
              style={[
                styles.button, 
                showPremium && styles.premiumButton
              ]} 
              onPress={onPress || handleClose}
            >
              <Text style={[
                styles.buttonText, 
                showPremium && styles.premiumButtonText
              ]}>
                {showPremium ? '✨ STİL İLHAMI AL' : buttonText}
              </Text>
            </TouchableOpacity>
          )}

          {!autoClose && !showPremium && (
            <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
              <Ionicons name="close" size={18} color="rgba(255,255,255,0.5)" />
            </TouchableOpacity>
          )}
        </Animated.View>
      </TouchableOpacity>
    </Modal>
  );
};

// ============================================================
// 📌 TOAST HOOK
// ============================================================
export const useToast = () => {
  const [toast, setToast] = useState({
    visible: false,
    title: '',
    message: '',
    type: 'success',
    buttonText: 'Tamam',
    autoClose: true,
    autoCloseDelay: 2000,
    onPress: null,
    showPremium: false, // 🆕 Premium kart modu
  });

  const showToast = ({
    title,
    message,
    type = 'success',
    buttonText = 'Tamam',
    autoClose = true,
    autoCloseDelay = 2000,
    onPress = null,
    showPremium = false, // 🆕 Premium kart modu
  }) => {
    setToast({
      visible: true,
      title,
      message,
      type,
      buttonText,
      autoClose,
      autoCloseDelay: showPremium ? 3000 : autoCloseDelay,
      onPress,
      showPremium,
    });
  };

  const hideToast = () => {
    setToast(prev => ({ ...prev, visible: false }));
  };

  const ToastComponent = () => (
    <CustomAlert
      visible={toast.visible}
      title={toast.title}
      message={toast.message}
      type={toast.type}
      buttonText={toast.buttonText}
      autoClose={toast.autoClose}
      autoCloseDelay={toast.autoCloseDelay}
      showPremium={toast.showPremium}
      onPress={() => {
        if (toast.onPress) toast.onPress();
        hideToast();
      }}
      onClose={hideToast}
    />
  );

  return { showToast, hideToast, ToastComponent };
};

// ============================================================
// 📌 STANDALONE TOAST
// ============================================================
let toastRef = null;

export const setToastRef = (ref) => {
  toastRef = ref;
};

export const showToast = (options) => {
  if (toastRef) {
    toastRef.showToast(options);
  } else {
    console.warn('Toast ref not initialized. Call setToastRef first.');
  }
};

export const CustomToast = () => {
  const { showToast: show, hideToast, ToastComponent } = useToast();
  
  useEffect(() => {
    setToastRef({ showToast: show, hideToast });
  }, []);

  return <ToastComponent />;
};

// ============================================================
// 📌 STILLER
// ============================================================
const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    backgroundColor: 'transparent',
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    width: width * 0.9,
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 15,
    position: 'relative',
  },
  // 🆕 Premium Rozet
  premiumBadge: {
    position: 'absolute',
    top: -8,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,215,0,0.15)',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
    gap: 4,
    borderWidth: 0.5,
    borderColor: 'rgba(255,215,0,0.3)',
  },
  premiumBadgeText: {
    fontSize: 7,
    fontWeight: '700',
    color: '#FFD700',
    letterSpacing: 1,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    letterSpacing: 0.3,
    marginBottom: 2,
  },
  message: {
    fontSize: 13,
    fontWeight: '400',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    letterSpacing: 0.2,
    lineHeight: 18,
  },
  button: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginLeft: 8,
  },
  premiumButton: {
    backgroundColor: '#FFD700',
  },
  buttonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    letterSpacing: 0.5,
  },
  premiumButtonText: {
    color: '#1A1A1A',
  },
  closeButton: {
    padding: 4,
    marginLeft: 8,
  },
});

export default CustomAlert;