// 📁 src/screens/WashAssistantScreen.js - LÜKS MİNİMALİST VERSİYON
import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Alert, 
  Image, 
  ScrollView, 
  ActivityIndicator,
  Platform,
  Dimensions,
  Animated,
  SafeAreaView,
  StatusBar
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Camera } from 'expo-camera';
import * as ImageManipulator from 'expo-image-manipulator';
import { COLORS, TYPOGRAPHY, SIZES } from '../constants/Theme';

const { width, height } = Dimensions.get('window');

// Mock classifier
const fabricClassifier = {
  classifyFabric: async (imageUri) => {
    console.log('🤖 AI analiz yapılıyor:', imageUri);
    await new Promise(resolve => setTimeout(resolve, 1500));
    const fabrics = [
      { name: 'pamuk', icon: '🌿', temp: 40, program: 'Pamuklu', care: 'Makinede yıkanabilir, ters çevirerek yıkayın' },
      { name: 'polyester', icon: '🧵', temp: 30, program: 'Sentetik', care: 'Düşük sıcaklıkta yıkayın, kuru temizleme yaptırmayın' },
      { name: 'yün', icon: '🐑', temp: 30, program: 'Yünlü', care: 'Elde yıkayın veya kuru temizleme' },
      { name: 'ipek', icon: '🦋', temp: 30, program: 'İpekli', care: 'Sadece kuru temizleme veya elde soğuk suda' },
      { name: 'keten', icon: '🌾', temp: 40, program: 'Keten', care: 'Ütü yaparken nemliyken ütüleyin' },
      { name: 'viskon', icon: '👗', temp: 30, program: 'Hassas', care: 'Ters çevirerek yıkayın, sıkmayın' }
    ];
    const randomFabric = fabrics[Math.floor(Math.random() * fabrics.length)];
    
    return {
      fabric: randomFabric.name,
      confidence: 0.7 + Math.random() * 0.25,
      icon: randomFabric.icon,
      temperature: randomFabric.temp,
      program: randomFabric.program,
      care: randomFabric.care
    };
  }
};

const WashAssistantScreen = () => {
  const [hasPermission, setHasPermission] = useState(null);
  const [cameraVisible, setCameraVisible] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [cameraType, setCameraType] = useState(Camera.Constants.Type.back);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const cameraRef = useRef(null);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    (async () => {
      const { status } = await Camera.getCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const requestCameraPermission = async () => {
    try {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
      
      if (status === 'granted') {
        setCameraVisible(true);
      } else {
        Alert.alert(
          'Kamera İzni Gerekli', 
          'Kumaş analizi için kamera iznine ihtiyaç var. Örnek fotoğraf kullanabilirsiniz.',
          [
            { text: 'İptal', style: 'cancel' },
            { text: 'Örnek Fotoğraf', onPress: useMockImage }
          ]
        );
      }
    } catch (error) {
      Alert.alert(
        'Kamera Hatası', 
        'Kamera açılamadı. Örnek fotoğraf kullanın.',
        [
          { text: 'İptal', style: 'cancel' },
          { text: 'Örnek Fotoğraf', onPress: useMockImage }
        ]
      );
    }
  };

  const takePicture = async () => {
    if (!cameraRef.current) {
      Alert.alert('Hata', 'Kamera hazır değil!');
      return;
    }

    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        base64: false,
        exif: false
      });

      const manipulatedImage = await ImageManipulator.manipulateAsync(
        photo.uri,
        [{ resize: { width: 500, height: 500 } }],
        { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
      );

      setCapturedImage(manipulatedImage.uri);
      setCameraVisible(false);
      setAnalysisResult(null);
      
      Alert.alert('Fotoğraf Çekildi', 'Şimdi AI ile analiz edebilirsiniz.');
    } catch (error) {
      Alert.alert('Hata', 'Fotoğraf çekilemedi');
    }
  };

  const switchCamera = () => {
    setCameraType(
      cameraType === Camera.Constants.Type.back
        ? Camera.Constants.Type.front
        : Camera.Constants.Type.back
    );
  };

  const useMockImage = () => {
    const mockImages = [
      'https://images.unsplash.com/photo-1523380744952-b7e00e6e2ffa?w=400&h=400&fit=crop',
      'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=400&h=400&fit=crop',
      'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=400&h=400&fit=crop'
    ];
    
    const randomImage = mockImages[Math.floor(Math.random() * mockImages.length)];
    setCapturedImage(randomImage);
    setAnalysisResult(null);
  };

  const analyzeFabric = async () => {
    if (!capturedImage) {
      Alert.alert('Uyarı', 'Önce bir fotoğraf seçin!');
      return;
    }

    setIsAnalyzing(true);
    Animated.sequence([
      Animated.timing(fadeAnim, { toValue: 0.5, duration: 300, useNativeDriver: true }),
      Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true })
    ]).start();

    try {
      const result = await fabricClassifier.classifyFabric(capturedImage);
      setAnalysisResult(result);
    } catch (error) {
      const mockResult = {
        fabric: 'pamuk',
        confidence: 0.85,
        icon: '🌿',
        temperature: 40,
        program: 'Pamuklu',
        care: 'Makinede yıkanabilir, ters çevirerek yıkayın.'
      };
      setAnalysisResult(mockResult);
      Alert.alert('Demo Modu', 'Örnek sonuç gösteriliyor.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const renderResult = () => {
    if (!analysisResult) return null;

    const confidencePercent = Math.round(analysisResult.confidence * 100);
    const confidenceColor = confidencePercent > 80 ? COLORS.black : confidencePercent > 60 ? COLORS.grayMedium : COLORS.grayLight;

    return (
      <Animated.View style={[styles.resultContainer, { opacity: fadeAnim }]}>
        <View style={styles.resultHeader}>
          <Text style={styles.resultIcon}>{analysisResult.icon}</Text>
          <Text style={styles.resultTitle}>ANALİZ SONUCU</Text>
        </View>
        
        <View style={styles.resultCard}>
          <View style={styles.resultRow}>
            <Text style={styles.resultLabel}>KUMAŞ TÜRÜ</Text>
            <Text style={styles.resultValue}>{analysisResult.fabric.toUpperCase()}</Text>
          </View>
          
          <View style={styles.resultRow}>
            <Text style={styles.resultLabel}>GÜVEN SEVİYESİ</Text>
            <View style={styles.confidenceContainer}>
              <View style={[styles.confidenceBar, { width: `${confidencePercent}%`, backgroundColor: confidenceColor }]} />
              <Text style={styles.confidenceText}>%{confidencePercent}</Text>
            </View>
          </View>
          
          <View style={styles.resultRow}>
            <Text style={styles.resultLabel}>ÖNERİLEN SICAKLIK</Text>
            <Text style={styles.resultValue}>{analysisResult.temperature}°C</Text>
          </View>
          
          <View style={styles.resultRow}>
            <Text style={styles.resultLabel}>YIKAMA PROGRAMI</Text>
            <Text style={styles.resultValue}>{analysisResult.program}</Text>
          </View>
          
          <View style={styles.careContainer}>
            <Ionicons name="bulb-outline" size={14} color={COLORS.black} />
            <Text style={styles.careText}>{analysisResult.care}</Text>
          </View>
        </View>
      </Animated.View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
      
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>YIKAMA ASİSTANI</Text>
          <View style={styles.headerIcon}>
            <Ionicons name="water-outline" size={20} color={COLORS.black} />
          </View>
        </View>
        
        <Text style={styles.subtitle}>KUMAŞINI TANI, DOĞRU YIKA</Text>
        
        {!cameraVisible && !capturedImage && (
          <View style={styles.initialView}>
            <View style={styles.illustrationContainer}>
              <Ionicons name="shirt-outline" size={64} color={COLORS.grayMedium} />
              <View style={styles.waterDrops}>
                <Ionicons name="water" size={18} color={COLORS.black} />
                <Ionicons name="water" size={24} color={COLORS.black} />
                <Ionicons name="water" size={14} color={COLORS.black} />
              </View>
            </View>
            
            <Text style={styles.description}>
              AI ile kumaş türünü tanıyıp, en uygun yıkama talimatlarını alın.
            </Text>
            
            <TouchableOpacity style={styles.cameraButton} onPress={requestCameraPermission}>
              <Ionicons name="camera-outline" size={16} color={COLORS.white} />
              <Text style={styles.cameraButtonText}>FOTOĞRAF ÇEK</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.galleryButton} onPress={useMockImage}>
              <Ionicons name="images-outline" size={16} color={COLORS.black} />
              <Text style={styles.galleryButtonText}>ÖRNEK FOTOĞRAF KULLAN</Text>
            </TouchableOpacity>
          </View>
        )}

        {cameraVisible && hasPermission && (
          <View style={styles.cameraContainer}>
            <Camera 
              style={styles.camera} 
              ref={cameraRef}
              type={cameraType}
              ratio="1:1"
            >
              <View style={styles.cameraOverlay}>
                <View style={styles.cameraFrame} />
              </View>
              
              <View style={styles.cameraControls}>
                <TouchableOpacity style={styles.closeButton} onPress={() => setCameraVisible(false)}>
                  <Ionicons name="close" size={20} color={COLORS.white} />
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.captureButton} onPress={takePicture}>
                  <View style={styles.captureButtonInner} />
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.switchButton} onPress={switchCamera}>
                  <Ionicons name="camera-reverse-outline" size={20} color={COLORS.white} />
                </TouchableOpacity>
              </View>
            </Camera>
          </View>
        )}

        {capturedImage && (
          <View style={styles.previewContainer}>
            <View style={styles.previewHeader}>
              <Text style={styles.previewTitle}>SEÇİLEN FOTOĞRAF</Text>
              <TouchableOpacity onPress={() => {
                setCapturedImage(null);
                setAnalysisResult(null);
              }}>
                <Ionicons name="refresh-outline" size={18} color={COLORS.grayMedium} />
              </TouchableOpacity>
            </View>
            
            <Image 
              source={{ uri: capturedImage }} 
              style={styles.previewImage} 
            />
            
            <View style={styles.previewActions}>
              <TouchableOpacity 
                style={[styles.analyzeButton, isAnalyzing && styles.disabledButton]}
                onPress={analyzeFabric}
                disabled={isAnalyzing}
              >
                {isAnalyzing ? (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator size="small" color={COLORS.white} />
                    <Text style={styles.analyzeButtonText}> ANALİZ EDİLİYOR...</Text>
                  </View>
                ) : (
                  <>
                    <Ionicons name="sparkles-outline" size={16} color={COLORS.white} />
                    <Text style={styles.analyzeButtonText}>AI İLE ANALİZ ET</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>

            {renderResult()}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

// ============ STILLER ============
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  scrollContent: {
    paddingBottom: SIZES.xl,
  },
  
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SIZES.lg,
    paddingTop: Platform.OS === 'ios' ? 12 : SIZES.md,
    paddingBottom: SIZES.xs,
  },
  headerTitle: {
    ...TYPOGRAPHY.caption,
    letterSpacing: 1.5,
  },
  headerIcon: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  
  subtitle: {
    ...TYPOGRAPHY.caption,
    fontSize: 10,
    color: COLORS.grayMedium,
    textAlign: 'center',
    marginBottom: SIZES.xl,
  },
  
  initialView: {
    paddingHorizontal: SIZES.xl,
    alignItems: 'center',
  },
  illustrationContainer: {
    position: 'relative',
    alignItems: 'center',
    marginBottom: SIZES.xl,
  },
  waterDrops: {
    position: 'absolute',
    bottom: -10,
    right: 20,
    flexDirection: 'row',
    gap: 2,
  },
  description: {
    ...TYPOGRAPHY.bodySmall,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: SIZES.xl,
  },
  
  cameraButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SIZES.sm,
    backgroundColor: COLORS.black,
    paddingVertical: SIZES.md,
    width: '100%',
    marginBottom: SIZES.md,
  },
  cameraButtonText: {
    ...TYPOGRAPHY.button,
    color: COLORS.white,
  },
  galleryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SIZES.sm,
    borderWidth: 0.5,
    borderColor: COLORS.grayLight,
    paddingVertical: SIZES.md,
    width: '100%',
  },
  galleryButtonText: {
    ...TYPOGRAPHY.button,
    color: COLORS.black,
  },
  
  cameraContainer: {
    height: height * 0.55,
    marginHorizontal: SIZES.lg,
    marginTop: SIZES.md,
    borderWidth: 0.5,
    borderColor: COLORS.grayLight,
    overflow: 'hidden',
  },
  camera: {
    flex: 1,
  },
  cameraOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraFrame: {
    width: 200,
    height: 200,
    borderWidth: 1,
    borderColor: COLORS.white,
    backgroundColor: 'transparent',
  },
  cameraControls: {
    position: 'absolute',
    bottom: SIZES.xl,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: SIZES.lg,
  },
  captureButton: {
    width: 60,
    height: 60,
    borderWidth: 2,
    borderColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButtonInner: {
    width: 50,
    height: 50,
    backgroundColor: COLORS.white,
  },
  switchButton: {
    width: 40,
    height: 40,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButton: {
    width: 40,
    height: 40,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  previewContainer: {
    padding: SIZES.lg,
    alignItems: 'center',
  },
  previewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: SIZES.md,
  },
  previewTitle: {
    ...TYPOGRAPHY.caption,
    fontSize: 10,
    color: COLORS.grayMedium,
  },
  previewImage: {
    width: 200,
    height: 200,
    borderWidth: 0.5,
    borderColor: COLORS.grayLight,
    marginBottom: SIZES.lg,
    backgroundColor: COLORS.surface,
  },
  previewActions: {
    width: '100%',
    alignItems: 'center',
  },
  analyzeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SIZES.sm,
    backgroundColor: COLORS.black,
    paddingVertical: SIZES.md,
    width: '100%',
  },
  disabledButton: {
    opacity: 0.7,
  },
  analyzeButtonText: {
    ...TYPOGRAPHY.button,
    color: COLORS.white,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.xs,
  },
  
  resultContainer: {
    width: '100%',
    marginTop: SIZES.lg,
    borderWidth: 0.5,
    borderColor: COLORS.grayLight,
    padding: SIZES.lg,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.md,
    gap: SIZES.sm,
  },
  resultIcon: {
    fontSize: 28,
  },
  resultTitle: {
    ...TYPOGRAPHY.caption,
    fontSize: 11,
  },
  resultCard: {
    gap: SIZES.md,
  },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  resultLabel: {
    ...TYPOGRAPHY.caption,
    fontSize: 9,
    color: COLORS.grayMedium,
  },
  resultValue: {
    ...TYPOGRAPHY.bodySmall,
    fontWeight: '500',
  },
  confidenceContainer: {
    flex: 0.6,
    height: 24,
    borderWidth: 0.5,
    borderColor: COLORS.grayLight,
    position: 'relative',
    overflow: 'hidden',
  },
  confidenceBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
  },
  confidenceText: {
    position: 'absolute',
    top: 4,
    right: 8,
    ...TYPOGRAPHY.caption,
    fontSize: 9,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  careContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.sm,
    marginTop: SIZES.sm,
    padding: SIZES.md,
    borderWidth: 0.5,
    borderColor: COLORS.grayLight,
  },
  careText: {
    flex: 1,
    ...TYPOGRAPHY.caption,
    fontSize: 9,
    lineHeight: 16,
  },
});

export default WashAssistantScreen;