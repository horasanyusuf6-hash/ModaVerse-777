// 📁 src/screens/OnboardingScreen.js - REVİZE (Premium Görseller + Can Alıcı Metinler)
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  Platform,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, TYPOGRAPHY, SIZES } from '../constants/Theme';

const { width, height } = Dimensions.get('window');

// ============================================================
// 📌 ONBOARDING SLIDES - REVİZE (CAN ALICI METİNLER)
// ============================================================
const slides = [
  {
    id: '1',
    title: '💫 STİLİNİ KEŞFET',
    subtitle: 'Sana özel AI destekli stil analizi',
    description: 'Gardırobundaki her parçayı yapay zeka ile analiz et, kişisel tarzını keşfet ve kombin önerileri al.',
    image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=800',
    gradient: ['#2d1b69', '#11998e'],
    badge: '✨ YAPAY ZEKA DESTEKLİ',
  },
  {
    id: '2',
    title: '👗 SANAL GARDIROBUN',
    subtitle: 'Tüm kıyafetlerin tek bir yerde',
    description: 'Kıyafetlerini ekle, kategorilere ayır, favorilerini işaretle. Hangi parçanın nerede olduğunu asla unutma.',
    image: 'https://images.unsplash.com/photo-1539008835657-9e8e9680c956?w=800',
    gradient: ['#1a1a2e', '#16213e'],
    badge: '📱 AKILLI GARDIROP',
  },
  {
    id: '3',
    title: '🤖 AI STİL DANIŞMANIN',
    subtitle: '7/24 yanında, her an yardıma hazır',
    description: 'Kombin önerileri, hava durumu analizi, stil ipuçları ve daha fazlası için AI asistanınla sohbet et.',
    image: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=800',
    gradient: ['#0f0c29', '#302b63'],
    badge: '⚡ 7/24 AKTİF',
  },
  {
    id: '4',
    title: '🌍 MODA TOPLULUĞU',
    subtitle: 'Stilini paylaş, ilham al, keşfet',
    description: 'Kendi kombinlerini paylaş, diğer moda severlerle etkileşime geç ve trendleri yakından takip et.',
    image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800',
    gradient: ['#4a00e0', '#8e2de2'],
    badge: '👥 BİNLERCE MODA SEVER',
  },
];

// ============================================================
// 📌 ANA BİLEŞEN
// ============================================================
const OnboardingScreen = ({ onComplete }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [slideOpacity] = useState(new Animated.Value(1));
  const flatListRef = useRef(null);

  // 📊 Slide değiştiğinde animasyon
  const animateSlide = () => {
    slideOpacity.setValue(0.8);
    Animated.timing(slideOpacity, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  };

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      flatListRef.current.scrollToIndex({ index: currentIndex + 1 });
      setCurrentIndex(currentIndex + 1);
      animateSlide();
    } else {
      onComplete();
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  // 📌 RENDER SLIDE
  const renderSlide = ({ item, index }) => {
    const isActive = index === currentIndex;
    
    return (
      <Animated.View 
        style={[
          styles.slide,
          { opacity: isActive ? slideOpacity : 1 }
        ]}
      >
        {/* 📸 Görsel - Gradient Overlay ile */}
        <View style={styles.imageContainer}>
          <Image source={{ uri: item.image }} style={styles.image} />
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.6)']}
            style={styles.imageGradient}
          />
          {/* 🏷️ Badge */}
          <View style={styles.badgeContainer}>
            <Text style={styles.badgeText}>{item.badge}</Text>
          </View>
        </View>

        {/* 📝 İçerik */}
        <View style={styles.contentContainer}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.subtitle}>{item.subtitle}</Text>
          <Text style={styles.description}>{item.description}</Text>
        </View>

        {/* 📊 Sayfa Göstergesi */}
        <View style={styles.paginationContainer}>
          {slides.map((_, dotIndex) => (
            <View
              key={dotIndex}
              style={[
                styles.dot,
                currentIndex === dotIndex && styles.dotActive,
              ]}
            />
          ))}
        </View>
      </Animated.View>
    );
  };

  // ============================================================
  // 📌 RENDER
  // ============================================================
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {/* 🔝 Skip Butonu */}
      <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
        <Text style={styles.skipText}>ATLA</Text>
        <Ionicons name="arrow-forward" size={12} color={COLORS.grayMedium} />
      </TouchableOpacity>

      {/* 📸 Slider */}
      <FlatList
        ref={flatListRef}
        data={slides}
        renderItem={renderSlide}
        keyExtractor={item => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(e) => {
          const index = Math.round(e.nativeEvent.contentOffset.x / width);
          setCurrentIndex(index);
          animateSlide();
        }}
      />

      {/* 🔽 Alt Buton */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
          <Text style={styles.nextButtonText}>
            {currentIndex === slides.length - 1 ? '💫 BAŞLAYALIM' : 'İLERİ →'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// ============================================================
// 📌 STILLER
// ============================================================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },

  // 🔝 Skip Butonu
  skipButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 55 : 35,
    right: SIZES.lg,
    zIndex: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: SIZES.md,
    paddingVertical: SIZES.xs,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 20,
    borderWidth: 0.5,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  skipText: {
    ...TYPOGRAPHY.caption,
    fontSize: 10,
    color: COLORS.grayMedium,
    letterSpacing: 0.5,
  },

  // 📸 Slide
  slide: {
    width: width,
    flex: 1,
  },

  imageContainer: {
    width: width,
    height: height * 0.55,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imageGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 120,
  },

  // 🏷️ Badge
  badgeContainer: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 100 : 80,
    left: SIZES.lg,
    backgroundColor: 'rgba(255,255,255,0.2)',
    backdropFilter: 'blur(10px)',
    paddingHorizontal: SIZES.md,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  badgeText: {
    ...TYPOGRAPHY.caption,
    fontSize: 9,
    color: COLORS.white,
    letterSpacing: 0.5,
    fontWeight: '600',
  },

  // 📝 İçerik
  contentContainer: {
    flex: 1,
    paddingHorizontal: SIZES.xl,
    paddingTop: SIZES.xl,
    paddingBottom: SIZES.md,
    backgroundColor: COLORS.white,
  },
  title: {
    ...TYPOGRAPHY.h2,
    fontSize: 26,
    fontWeight: '700',
    color: COLORS.black,
    marginBottom: 4,
  },
  subtitle: {
    ...TYPOGRAPHY.body,
    fontSize: 14,
    color: COLORS.cognac,
    fontWeight: '500',
    marginBottom: SIZES.md,
  },
  description: {
    ...TYPOGRAPHY.body,
    fontSize: 14,
    color: COLORS.grayMedium,
    lineHeight: 22,
    paddingRight: SIZES.md,
  },

  // 📊 Pagination
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    paddingVertical: SIZES.md,
    backgroundColor: COLORS.white,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.grayLight,
  },
  dotActive: {
    width: 24,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.black,
  },

  // 🔽 Alt Buton
  bottomContainer: {
    paddingHorizontal: SIZES.xl,
    paddingBottom: Platform.OS === 'ios' ? 40 : SIZES.xl,
    backgroundColor: COLORS.white,
  },
  nextButton: {
    backgroundColor: COLORS.black,
    paddingVertical: SIZES.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextButtonText: {
    ...TYPOGRAPHY.button,
    fontSize: 13,
    color: COLORS.white,
    letterSpacing: 1,
    fontWeight: '600',
  },
});

export default OnboardingScreen;