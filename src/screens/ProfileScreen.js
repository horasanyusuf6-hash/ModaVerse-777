import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  SafeAreaView, 
  StatusBar,
  Dimensions,
  Alert  // ✅ EKLENDI (eksikti)
} from 'react-native';
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

const ProfileScreen = ({ navigation }) => {
  // Navigasyon kontrolü
  const handleNavigation = (screen) => {
    if (navigation && navigation.navigate) {
      navigation.navigate(screen);
    } else {
      Alert.alert('Bilgi', `${screen} sayfasına yönlendiriliyor...`);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
      
      {/* Minimal Header */}
      <View style={styles.header}>
        <Text style={styles.title}>PROFİL</Text>
        <TouchableOpacity 
          style={styles.settingsButton}
          onPress={() => handleNavigation('Ayarlar')}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="settings-outline" size={24} color={COLORS.charcoal} />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {/* Placeholder Icon */}
        <View style={styles.iconContainer}>
          <Ionicons name="person-circle-outline" size={80} color={COLORS.cognac} />
        </View>
        
        <Text style={styles.comingSoon}>Profil sayfası hazırlanıyor</Text>
        <Text style={styles.comingSoonSub}>
          Kişisel profil, stil analizi ve tercihleriniz burada olacak
        </Text>

        {/* Geçici Navigasyon Butonları */}
        <View style={styles.tempButtons}>
          <TouchableOpacity 
            style={styles.tempButton}
            onPress={() => handleNavigation('Stilim')}
          >
            <Ionicons name="color-wand-outline" size={20} color={COLORS.white} />
            <Text style={styles.tempButtonText}>Stilim</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.tempButton}
            onPress={() => handleNavigation('Koleksiyonum')}
          >
            <Ionicons name="grid-outline" size={20} color={COLORS.white} />
            <Text style={styles.tempButtonText}>Koleksiyonum</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Bottom Navigation (Profil için özel) */}
      <View style={styles.bottomNav}>
        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => handleNavigation('Vitrinim')}
        >
          <Ionicons name="home-outline" size={22} color={COLORS.ash} />
          <Text style={styles.navText}>Vitrin</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => handleNavigation('Koleksiyonum')}
        >
          <Ionicons name="grid-outline" size={22} color={COLORS.ash} />
          <Text style={styles.navText}>Koleksiyon</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.navItem, styles.activeNavItem]}
          onPress={() => handleNavigation('Profil')}
        >
          <Ionicons name="person" size={22} color={COLORS.cognac} />
          <Text style={[styles.navText, styles.activeNavText]}>Profil</Text>
        </TouchableOpacity>
      </View>
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
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.cloud,
    backgroundColor: COLORS.white,
  },
  title: {
    fontSize: 24,
    fontWeight: '300',
    color: COLORS.charcoal,
    letterSpacing: 1,
  },
  settingsButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.porcelain,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 2,
    borderColor: COLORS.cognac,
  },
  comingSoon: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.charcoal,
    textAlign: 'center',
    marginBottom: 12,
  },
  comingSoonSub: {
    fontSize: 14,
    color: COLORS.ash,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 32,
  },
  tempButtons: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 20,
  },
  tempButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.cognac,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    gap: 8,
  },
  tempButtonText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '600',
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.cloud,
    backgroundColor: COLORS.white,
  },
  navItem: {
    alignItems: 'center',
    padding: 8,
  },
  activeNavItem: {
    borderBottomWidth: 2,
    borderBottomColor: COLORS.cognac,
  },
  navText: {
    fontSize: 11,
    color: COLORS.ash,
    marginTop: 4,
  },
  activeNavText: {
    color: COLORS.cognac,
    fontWeight: '500',
  },
});

export default ProfileScreen;