// 📁 src/services/aiService.js - REVİZE (IP Güncellendi)
import axios from 'axios';

// 📱 AI SERVICE (Python backend bağlantılı)
// ✅ YENİ IP: 10.215.252.67 (AI sunucusundan alındı)
const API_BASE_URL = 'http://10.215.252.67:5000';

const AIService = {
  // 🔍 Sağlık Kontrolü
  checkHealth: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/health`);
      return response.data.status === 'healthy';
    } catch (error) {
      console.log('🔌 AI sunucusuna bağlanılamadı:', error.message);
      return false;
    }
  },
  
  // 📸 Görsel Analiz (ürün fotoğrafından kategori, renk, vb. çıkar)
  analyzeImage: async (uri) => {
    try {
      const formData = new FormData();
      formData.append('image', {
        uri: uri,
        name: 'photo.jpg',
        type: 'image/jpeg'
      });

      const response = await axios.post(`${API_BASE_URL}/api/analyze`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 30000
      });
      
      return response.data;
    } catch (error) {
      console.error('Görsel analiz hatası:', error);
      return { success: false, error: error.message };
    }
  },
  
  // 👕 Kombin Önerisi (gardıroptaki ürünlere göre)
  suggestOutfit: async (wardrobeItems) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/outfit-suggest`, {
        items: wardrobeItems
      }, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 15000
      });
      
      return response.data;
    } catch (error) {
      console.error('Kombin öneri hatası:', error);
      return { success: false, error: error.message };
    }
  },

  // 🌤️ Hava Durumuna Göre Kombin Önerisi
  suggestOutfitWithWeather: async (wardrobeItems, city) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/outfit-weather`, {
        items: wardrobeItems,
        city: city
      }, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 15000
      });
      
      return response.data;
    } catch (error) {
      console.error('Hava durumu kombin hatası:', error);
      return { success: false, error: error.message };
    }
  },

  // 📊 Gardırop Analizi (eksik parçalar, kategori dağılımı)
  analyzeWardrobe: async (wardrobeItems) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/wardrobe-analyze`, {
        items: wardrobeItems
      }, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 15000
      });
      
      return response.data;
    } catch (error) {
      console.error('Gardırop analizi hatası:', error);
      return { success: false, error: error.message };
    }
  },

  // 🎨 Renk Uyumu Kontrolü
  checkColorHarmony: async (color1, color2) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/color-check`, {
        color1: color1,
        color2: color2
      }, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 10000
      });
      
      return response.data;
    } catch (error) {
      console.error('Renk uyumu hatası:', error);
      return { success: false, error: error.message };
    }
  },

  // 🏷️ Kategori Uyumu Kontrolü
  checkCategoryCompatibility: async (category1, category2) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/category-check`, {
        category1: category1,
        category2: category2
      }, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 10000
      });
      
      return response.data;
    } catch (error) {
      console.error('Kategori uyumu hatası:', error);
      return { success: false, error: error.message };
    }
  },

  // 🧪 API Bağlantı Testi (Hızlı kontrol için)
  testConnection: async () => {
    try {
      const startTime = Date.now();
      const response = await axios.get(`${API_BASE_URL}/health`, { timeout: 5000 });
      const endTime = Date.now();
      return {
        success: true,
        status: response.data.status,
        responseTime: endTime - startTime,
        url: API_BASE_URL
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        url: API_BASE_URL
      };
    }
  }
};

export default AIService;