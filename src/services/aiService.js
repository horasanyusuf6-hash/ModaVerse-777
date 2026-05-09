import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StyleSheet,
  ScrollView
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';

// 📱 GERÇEK AI SERVICE (Python backend bağlantılı)
const API_BASE_URL = 'http://10.116.185.67:5000'; // ✅ Senin IP'n ile değiştir!

const AIService = {
  checkHealth: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/health`);
      return response.data.status === 'healthy';
    } catch (error) {
      console.log('🔌 AI sunucusuna bağlanılamadı:', error.message);
      return false;
    }
  },
  
  analyzeImage: async (uri) => {
    const formData = new FormData();
    formData.append('image', {
      uri: uri,
      name: 'photo.jpg',
      type: 'image/jpeg'
    });

    const response = await axios.post(`${API_BASE_URL}/api/analyze`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    
    return response.data;
  },
  
  addItem: async (imageUri) => {
    const formData = new FormData();
    formData.append('image', {
      uri: imageUri,
      name: 'photo.jpg',
      type: 'image/jpeg'
    });

    const response = await axios.post(`${API_BASE_URL}/api/add-item`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    
    return response.data;
  }
};

export default function AddItemScreen() {
  const [image, setImage] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [apiConnected, setApiConnected] = useState(false);

  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    try {
      const connected = await AIService.checkHealth();
      setApiConnected(connected);
      if (!connected) {
        Alert.alert(
          'Uyarı',
          'AI sunucusuna bağlanılamıyor. Python API\'nın çalıştığından emin olun.'
        );
      } else {
        console.log('✅ AI sunucusu bağlı');
      }
    } catch (error) {
      console.error('Bağlantı hatası:', error);
      setApiConnected(false);
    }
  };

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('İzin Gerekli', 'Kamera kullanımı için izin gerekiyor');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const selectedImage = result.assets[0];
        setImage(selectedImage.uri);
        setAnalysis(null);
        await analyzeImage(selectedImage.uri);
      }
    } catch (error) {
      console.error('Kamera hatası:', error);
      Alert.alert('Hata', 'Fotoğraf çekilemedi');
    }
  };

  const analyzeImage = async (uri) => {
    if (!apiConnected) {
      Alert.alert('Hata', 'AI sunucusuna bağlı değil');
      return;
    }

    setLoading(true);
    try {
      console.log('🔍 AI analiz başlıyor...');
      const result = await AIService.analyzeImage(uri);
      console.log('✅ AI analiz tamamlandı:', result);
      setAnalysis(result);
    } catch (error) {
      console.error('Analiz hatası:', error);
      Alert.alert('Hata', 'Analiz yapılamadı: ' + (error.message || 'Bilinmeyen hata'));
    } finally {
      setLoading(false);
    }
  };

  const saveItem = async () => {
    if (!image) {
      Alert.alert('Uyarı', 'Lütfen önce bir fotoğraf çekin');
      return;
    }

    setLoading(true);
    try {
      console.log('💾 Kıyafet kaydediliyor...');
      const result = await AIService.addItem(image);
      console.log('✅ Kayıt başarılı:', result);
      
      Alert.alert('Başarılı', 'Kıyafet dolaba eklendi!');
      
      setImage(null);
      setAnalysis(null);
      checkConnection();
    } catch (error) {
      console.error('Kayıt hatası:', error);
      Alert.alert('Hata', 'Kaydedilemedi: ' + (error.message || 'Bilinmeyen hata'));
    } finally {
      setLoading(false);
    }
  };

  const pickImageFromGallery = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('İzin Gerekli', 'Galeri erişimi için izin gerekiyor');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const selectedImage = result.assets[0];
        setImage(selectedImage.uri);
        setAnalysis(null);
        await analyzeImage(selectedImage.uri);
      }
    } catch (error) {
      console.error('Galeri hatası:', error);
      Alert.alert('Hata', 'Fotoğraf seçilemedi');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={[styles.statusBar, apiConnected ? styles.connected : styles.disconnected]}>
        <Text style={styles.statusText}>
          {apiConnected ? '✅ AI Sunucusu Bağlı' : '❌ AI Sunucusu Bağlı Değil'}
        </Text>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={[styles.button, styles.cameraButton]} onPress={pickImage}>
          <Text style={styles.buttonText}>📸 Fotoğraf Çek</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.button, styles.galleryButton]} onPress={pickImageFromGallery}>
          <Text style={styles.buttonText}>🖼️ Galeriden Seç</Text>
        </TouchableOpacity>
      </View>

      {image && (
        <View style={styles.imageContainer}>
          <Image source={{ uri: image }} style={styles.image} />
          <TouchableOpacity style={styles.removeButton} onPress={() => setImage(null)}>
            <Text style={styles.removeButtonText}>✕</Text>
          </TouchableOpacity>
        </View>
      )}

      {loading && (
        <View style={styles.loading}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>AI analiz yapıyor...</Text>
        </View>
      )}

      {analysis && !loading && (
        <View style={styles.resultContainer}>
          <Text style={styles.resultTitle}>🔍 AI Analiz Sonuçları</Text>
          
          <View style={styles.resultItem}>
            <Text style={styles.label}>Kategori:</Text>
            <Text style={styles.value}>{analysis.category || 'Belirlenemedi'}</Text>
          </View>

          <View style={styles.resultItem}>
            <Text style={styles.label}>Renk:</Text>
            <Text style={styles.value}>{analysis.color || 'Belirlenemedi'}</Text>
          </View>

          {analysis.brand && (
            <View style={styles.resultItem}>
              <Text style={styles.label}>Marka:</Text>
              <Text style={styles.value}>{analysis.brand}</Text>
            </View>
          )}

          <View style={styles.resultItem}>
            <Text style={styles.label}>Cinsiyet:</Text>
            <Text style={styles.value}>{analysis.gender || 'Unisex'}</Text>
          </View>

          {analysis.pattern && (
            <View style={styles.resultItem}>
              <Text style={styles.label}>Desen:</Text>
              <Text style={styles.value}>{analysis.pattern}</Text>
            </View>
          )}

          <View style={styles.resultItem}>
            <Text style={styles.label}>Mevsim:</Text>
            <Text style={styles.value}>{analysis.season || 'Dört mevsim'}</Text>
          </View>

          <View style={styles.captionBox}>
            <Text style={styles.captionLabel}>📝 AI Açıklaması:</Text>
            <Text style={styles.caption}>{analysis.caption || 'Açıklama yok'}</Text>
          </View>

          <TouchableOpacity style={styles.saveButton} onPress={saveItem}>
            <Text style={styles.saveButtonText}>💾 Dolaba Ekle</Text>
          </TouchableOpacity>
        </View>
      )}

      {!apiConnected && !loading && (
        <View style={styles.warningContainer}>
          <Text style={styles.warningText}>
            ⚠️ AI sunucusuna bağlı değil. Lütfen Python API'nın çalıştığından emin olun.
          </Text>
          <TouchableOpacity style={styles.retryButton} onPress={checkConnection}>
            <Text style={styles.retryButtonText}>Tekrar Dene</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  statusBar: {
    padding: 10,
    alignItems: 'center',
    marginHorizontal: 15,
    marginTop: 10,
    borderRadius: 8,
  },
  connected: {
    backgroundColor: '#4CAF50',
  },
  disconnected: {
    backgroundColor: '#f44336',
  },
  statusText: {
    color: 'white',
    fontWeight: 'bold',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    margin: 15,
  },
  button: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    flex: 0.45,
  },
  cameraButton: {
    backgroundColor: '#007AFF',
  },
  galleryButton: {
    backgroundColor: '#8C7853',
  },
  buttonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  imageContainer: {
    alignItems: 'center',
    margin: 15,
    position: 'relative',
  },
  image: {
    width: 300,
    height: 300,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#ddd',
  },
  removeButton: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: 'rgba(0,0,0,0.5)',
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loading: {
    alignItems: 'center',
    margin: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: '#666',
  },
  resultContainer: {
    backgroundColor: 'white',
    margin: 15,
    padding: 15,
    borderRadius: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  resultItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  label: {
    fontSize: 14,
    color: '#666',
  },
  value: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  captionBox: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    marginVertical: 15,
  },
  captionLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 5,
    color: '#555',
  },
  caption: {
    fontStyle: 'italic',
    color: '#555',
    lineHeight: 20,
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  warningContainer: {
    margin: 15,
    padding: 15,
    backgroundColor: '#FFF3CD',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FFE69C',
  },
  warningText: {
    color: '#856404',
    fontSize: 14,
    marginBottom: 10,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#856404',
    padding: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
  retryButtonText: {
    color: 'white',
    fontWeight: '600',
  },
});