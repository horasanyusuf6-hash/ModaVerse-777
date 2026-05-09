// 📁 src/screens/WashAssistantScreen.js - SADECE HATALAR DÜZELTİLDİ
import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Image, ScrollView, ActivityIndicator } from 'react-native';
import { Camera } from 'expo-camera';
import * as ImageManipulator from 'expo-image-manipulator';

// 🎨 Renkler
const COLORS = {
  white: '#FFFFFF',
  black: '#000000',
  cognac: '#8C7853',  // ✅ DÜZELTİLDİ
  error: '#F44336',
  success: '#4CAF50',
  warning: '#FF9800',
  gray: '#888888',
  darkGray: '#222222',
  lightGray: '#333333',
};

// ✅ Mock classifier (AI dosyası yoksa çalışsın)
const fabricClassifier = {
  classifyFabric: async (imageUri) => {
    console.log('🤖 Mock AI analiz yapılıyor:', imageUri);
    await new Promise(resolve => setTimeout(resolve, 1500));
    const fabrics = ['pamuk', 'polyester', 'yün', 'ipek', 'keten', 'viskon'];
    const randomFabric = fabrics[Math.floor(Math.random() * fabrics.length)];
    const icons = { pamuk: '👕', polyester: '🧥', yün: '🧣', ipek: '👘', keten: '👚', viskon: '👗' };
    
    return {
      fabric: randomFabric,
      confidence: 0.7 + Math.random() * 0.25,
      icon: icons[randomFabric] || '👕',
      temperature: randomFabric === 'yün' ? 30 : randomFabric === 'ipek' ? 30 : 40,
      program: randomFabric === 'pamuk' ? 'Pamuklu' : 'Hassas',
      care: randomFabric === 'yün' ? 'Sadece kuru temizleme' : 'Makinede yıkanabilir'
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

  useEffect(() => {
    (async () => {
      const { status } = await Camera.getCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const requestCameraPermission = async () => {
    try {
      console.log('📷 Kamera izni isteniyor...');
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
      
      if (status === 'granted') {
        setCameraVisible(true);
        console.log('✅ Kamera izni verildi');
      } else {
        Alert.alert(
          '📸 İzin Reddedildi', 
          'Kamera izni gerekli. Test fotoğrafı kullanabilirsiniz.',
          [
            { text: 'İptal', style: 'cancel' },
            { text: 'Test Fotoğrafı', onPress: useMockImage }
          ]
        );
      }
    } catch (error) {
      console.log('❌ Kamera hatası:', error);
      Alert.alert(
        'Kamera Hatası', 
        'Kamera açılamadı. Test fotoğrafı kullanın.',
        [
          { text: 'İptal', style: 'cancel' },
          { text: 'Test Fotoğrafı', onPress: useMockImage }
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
      console.log('📸 Fotoğraf çekiliyor...');
      
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        base64: false,
        exif: false
      });
      
      console.log('✅ Fotoğraf çekildi:', photo.uri);

      if (!photo.uri) {
        throw new Error('Fotoğraf URI alınamadı');
      }

      const manipulatedImage = await ImageManipulator.manipulateAsync(
        photo.uri,
        [{ resize: { width: 400, height: 400 } }],
        { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
      );

      console.log('🖼️ İşlenen fotoğraf:', manipulatedImage.uri);
      setCapturedImage(manipulatedImage.uri);
      setCameraVisible(false);
      setAnalysisResult(null);
      
      Alert.alert('✅ Başarılı!', 'Fotoğraf çekildi. Şimdi AI ile analiz edebilirsiniz.');

    } catch (error) {
      console.log('❌ Fotoğraf hatası:', error);
      Alert.alert('Hata', `Fotoğraf çekilemedi: ${error.message}`);
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
    console.log('🖼️ Mock fotoğraf kullanılıyor:', randomImage);
    setCapturedImage(randomImage);
    setAnalysisResult(null);
    Alert.alert('📸 Test Modu', 'Demo için örnek fotoğraf kullanılıyor.');
  };

  const analyzeFabric = async () => {
    if (!capturedImage) {
      Alert.alert('Hata', 'Önce kumaş fotoğrafı seçin!');
      return;
    }

    console.log('🤖 AI analiz başlatılıyor:', capturedImage);
    setIsAnalyzing(true);

    try {
      const result = await fabricClassifier.classifyFabric(capturedImage);
      console.log('🎯 AI Sonuç:', result);
      setAnalysisResult(result);
    } catch (error) {
      console.log('❌ AI analiz hatası:', error);
      
      const mockResult = {
        fabric: 'pamuk',
        confidence: 0.85,
        icon: '👕',
        temperature: 40,
        program: 'Pamuklu',
        care: 'Makinede yıkanabilir, ters çevirerek yıkayın'
      };
      
      setAnalysisResult(mockResult);
      Alert.alert(
        '⚠️ AI Servisi Hatası',
        'Demo modunda çalışıyor. Örnek sonuç gösteriliyor.'
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  const renderResult = () => {
    if (!analysisResult) return null;

    const confidencePercent = Math.round(analysisResult.confidence * 100);
    const confidenceColor = confidencePercent > 80 ? COLORS.success : confidencePercent > 60 ? COLORS.warning : COLORS.error;

    return (
      <View style={styles.resultContainer}>
        <View style={styles.resultHeader}>
          <Text style={styles.resultIcon}>{analysisResult.icon || '👕'}</Text>
          <Text style={styles.resultTitle}>ANALİZ SONUCU</Text>
        </View>
        
        <View style={styles.resultCard}>
          <View style={styles.resultRow}>
            <Text style={styles.resultLabel}>Kumaş Türü:</Text>
            <Text style={styles.resultValue}>{analysisResult.fabric.toUpperCase()}</Text>
          </View>
          
          <View style={styles.resultRow}>
            <Text style={styles.resultLabel}>Güven Seviyesi:</Text>
            <View style={styles.confidenceContainer}>
              <View style={[styles.confidenceBar, { width: `${confidencePercent}%`, backgroundColor: confidenceColor }]} />
              <Text style={styles.confidenceText}>%{confidencePercent}</Text>
            </View>
          </View>
          
          <View style={styles.resultRow}>
            <Text style={styles.resultLabel}>Önerilen Sıcaklık:</Text>
            <Text style={styles.resultValue}>{analysisResult.temperature || 30}°C</Text>
          </View>
          
          <View style={styles.resultRow}>
            <Text style={styles.resultLabel}>Yıkama Programı:</Text>
            <Text style={styles.resultValue}>{analysisResult.program || 'Hassas'}</Text>
          </View>
          
          <View style={styles.careContainer}>
            <Text style={styles.careText}>💡 {analysisResult.care || 'Soğuk suda ters yüz ederek yıkayın.'}</Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>🧼 YIKAMA ASİSTANTI</Text>
      <Text style={styles.subtitle}>Kumaşını tanı, doğru yıka</Text>
      
      {!cameraVisible && !capturedImage && (
        <View style={styles.initialView}>
          <Text style={styles.description}>
            AI ile kumaş türünü tanıyıp, en uygun yıkama talimatlarını veriyoruz.
          </Text>
          
          <TouchableOpacity style={styles.cameraButton} onPress={requestCameraPermission}>
            <Text style={styles.cameraButtonText}>📷 FOTOĞRAF ÇEK</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.galleryButton} onPress={useMockImage}>
            <Text style={styles.galleryButtonText}>🖼️ ÖRNEK FOTOĞRAF KULLAN</Text>
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
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.captureButton} onPress={takePicture}>
                <View style={styles.captureButtonInner} />
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.switchButton} onPress={switchCamera}>
                <Text style={styles.switchButtonText}>🔄</Text>
              </TouchableOpacity>
            </View>
          </Camera>
        </View>
      )}

      {capturedImage && (
        <View style={styles.previewContainer}>
          <Text style={styles.previewTitle}>📸 SEÇİLEN FOTOĞRAF</Text>
          
          <Image 
            source={{ uri: capturedImage }} 
            style={styles.previewImage} 
            onError={() => {
              Alert.alert('Hata', 'Fotoğraf yüklenemedi');
              setCapturedImage(null);
            }}
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
                <Text style={styles.analyzeButtonText}>🤖 AI İLE ANALİZ ET</Text>
              )}
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.retakeButton} onPress={() => {
              setCapturedImage(null);
              setAnalysisResult(null);
            }}>
              <Text style={styles.retakeButtonText}>🔄 YENİ FOTOĞRAF SEÇ</Text>
            </TouchableOpacity>
          </View>

          {renderResult()}
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { 
    flexGrow: 1, 
    backgroundColor: COLORS.black,
    paddingBottom: 40
  },
  title: { 
    color: COLORS.white,
    fontSize: 28, 
    fontWeight: '200',
    letterSpacing: 2,
    textAlign: 'center', 
    marginTop: 60,
    marginBottom: 10
  },
  subtitle: {
    color: COLORS.gray,
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 40,
    letterSpacing: 1
  },
  initialView: {
    padding: 30,
    alignItems: 'center'
  },
  description: {
    color: COLORS.gray,
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 50,
    lineHeight: 24,
    paddingHorizontal: 20
  },
  cameraButton: { 
    backgroundColor: '#007AFF', 
    padding: 18, 
    borderRadius: 12, 
    alignItems: 'center', 
    marginBottom: 15,
    width: '100%'
  },
  cameraButtonText: { 
    color: COLORS.white, 
    fontSize: 16, 
    fontWeight: '600',
    letterSpacing: 1
  },
  galleryButton: { 
    backgroundColor: '#5856D6', 
    padding: 18, 
    borderRadius: 12, 
    alignItems: 'center',
    width: '100%'
  },
  galleryButtonText: { 
    color: COLORS.white, 
    fontSize: 16, 
    fontWeight: '600',
    letterSpacing: 1
  },
  cameraContainer: { 
    height: 500,
    width: '100%',
    overflow: 'hidden',
    borderRadius: 20,
    marginTop: 20
  },
  camera: { 
    flex: 1,
    position: 'relative'
  },
  cameraOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center'
  },
  cameraFrame: {
    width: 250,
    height: 250,
    borderWidth: 2,
    borderColor: COLORS.white,
    borderRadius: 12,
    backgroundColor: 'transparent'
  },
  cameraControls: {
    position: 'absolute',
    bottom: 30,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 20
  },
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.white
  },
  switchButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  switchButtonText: {
    fontSize: 24,
    color: COLORS.white
  },
  closeButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  closeButtonText: {
    fontSize: 24,
    color: COLORS.white,
    fontWeight: 'bold'
  },
  previewContainer: {
    padding: 20,
    alignItems: 'center'
  },
  previewTitle: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 20,
    letterSpacing: 1
  },
  previewImage: { 
    width: 250, 
    height: 250, 
    borderRadius: 12, 
    marginBottom: 30,
    backgroundColor: COLORS.lightGray
  },
  previewActions: {
    width: '100%',
    alignItems: 'center'
  },
  analyzeButton: { 
    backgroundColor: COLORS.success, 
    padding: 16, 
    borderRadius: 10, 
    marginBottom: 12,
    width: '100%'
  },
  disabledButton: {
    backgroundColor: '#666',
    opacity: 0.7
  },
  analyzeButtonText: { 
    color: COLORS.white, 
    fontSize: 16, 
    fontWeight: '600',
    textAlign: 'center'
  },
  loadingContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center'
  },
  retakeButton: { 
    backgroundColor: COLORS.warning, 
    padding: 16, 
    borderRadius: 10,
    width: '100%'
  },
  retakeButtonText: { 
    color: COLORS.white, 
    fontSize: 16,
    textAlign: 'center',
    fontWeight: '600'
  },
  resultContainer: {
    width: '100%',
    marginTop: 30,
    backgroundColor: COLORS.darkGray,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.lightGray
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20
  },
  resultIcon: {
    fontSize: 30,
    marginRight: 10
  },
  resultTitle: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 1
  },
  resultCard: {
    gap: 15
  },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  resultLabel: {
    color: COLORS.gray,
    fontSize: 14
  },
  resultValue: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600'
  },
  confidenceContainer: {
    flex: 1,
    height: 24,
    backgroundColor: COLORS.lightGray,
    borderRadius: 12,
    marginLeft: 10,
    position: 'relative',
    overflow: 'hidden'
  },
  confidenceBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: '0%'
  },
  confidenceText: {
    position: 'absolute',
    top: 2,
    right: 8,
    color: COLORS.white,
    fontSize: 12,
    fontWeight: 'bold'
  },
  careContainer: {
    marginTop: 10,
    padding: 15,
    backgroundColor: COLORS.black,
    borderRadius: 10
  },
  careText: {
    color: COLORS.success,
    fontSize: 14,
    lineHeight: 20
  }
});

export default WashAssistantScreen;