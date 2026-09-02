// 📁 src/screens/OnboardingScreen.js - LÜKS MİNİMALİST VERSİYON
import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY, SIZES } from '../constants/Theme';

const { width, height } = Dimensions.get('window');

const slides = [
  {
    id: '1',
    title: 'MODA DÜNYASINA HOŞ GELDİN',
    description: 'En yeni trendleri keşfet, stilini oluştur ve moda topluluğuna katıl.',
    image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=400',
  },
  {
    id: '2',
    title: 'KENDİ STİLİNİ OLUŞTUR',
    description: 'Gardırobunu oluştur, kombinlerini paylaş ve ilham al.',
    image: 'https://images.unsplash.com/photo-1539008835657-9e8e9680c956?w=400',
  },
  {
    id: '3',
    title: 'AI STİL DANIŞMANIN',
    description: 'Yapay zeka destekli stil önerileri ile tarzını geliştir.',
    image: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=400',
  },
];

const OnboardingScreen = ({ onComplete }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef(null);

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      flatListRef.current.scrollToIndex({ index: currentIndex + 1 });
      setCurrentIndex(currentIndex + 1);
    } else {
      onComplete();
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  const renderSlide = ({ item }) => (
    <View style={styles.slide}>
      <View style={styles.imageContainer}>
        <Image source={{ uri: item.image }} style={styles.image} />
        <View style={styles.imageOverlay} />
      </View>
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.description}>{item.description}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
      
      <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
        <Text style={styles.skipText}>ATLA</Text>
      </TouchableOpacity>

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
        }}
      />

      <View style={styles.pagination}>
        {slides.map((_, index) => (
          <View
            key={index}
            style={[styles.dot, currentIndex === index && styles.dotActive]}
          />
        ))}
      </View>

      <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
        <Text style={styles.nextButtonText}>
          {currentIndex === slides.length - 1 ? 'BAŞLAYALIM' : 'İLERİ'}
        </Text>
        <Ionicons name="arrow-forward" size={14} color={COLORS.white} />
      </TouchableOpacity>
    </View>
  );
};

// ============ STILLER ============
const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: COLORS.white 
  },
  skipButton: { 
    position: 'absolute', 
    top: Platform.OS === 'ios' ? 60 : 40, 
    right: SIZES.lg, 
    zIndex: 10,
    paddingHorizontal: SIZES.md,
    paddingVertical: SIZES.xs,
    borderWidth: 0.5,
    borderColor: COLORS.grayLight,
  },
  skipText: { 
    ...TYPOGRAPHY.caption,
    color: COLORS.grayMedium 
  },
  slide: { 
    width: width, 
    alignItems: 'center', 
    paddingHorizontal: SIZES.xl, 
    paddingTop: Platform.OS === 'ios' ? 80 : 60 
  },
  imageContainer: {
    width: width - SIZES.xl * 2,
    height: 280,
    borderWidth: 0.5,
    borderColor: COLORS.grayLight,
    overflow: 'hidden',
    marginBottom: SIZES.xl,
  },
  image: { 
    width: '100%', 
    height: '100%', 
    resizeMode: 'cover' 
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  title: { 
    ...TYPOGRAPHY.title2,
    fontSize: 22,
    letterSpacing: 1,
    textAlign: 'center', 
    marginBottom: SIZES.md 
  },
  description: { 
    ...TYPOGRAPHY.body,
    color: COLORS.grayMedium, 
    textAlign: 'center', 
    lineHeight: 22,
    paddingHorizontal: SIZES.lg,
  },
  pagination: { 
    flexDirection: 'row', 
    justifyContent: 'center', 
    marginBottom: SIZES.xl 
  },
  dot: { 
    width: 4, 
    height: 4, 
    backgroundColor: COLORS.grayLight, 
    marginHorizontal: SIZES.xs, 
  },
  dotActive: { 
    width: 20, 
    backgroundColor: COLORS.black 
  },
  nextButton: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    backgroundColor: COLORS.black, 
    marginHorizontal: SIZES.xl, 
    marginBottom: Platform.OS === 'ios' ? 40 : SIZES.xl,
    paddingVertical: SIZES.md, 
    gap: SIZES.sm 
  },
  nextButtonText: { 
    ...TYPOGRAPHY.button,
    color: COLORS.white 
  },
});

export default OnboardingScreen;