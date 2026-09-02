// src/services/api.js
// ModaVerse AI - Backend API Servisi (Oracle Bağlantılı)
// Versiyon: 2.0.0 - REVİZE

import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ============================================================
// 📱 PLATFORM BAZLI API URL
// ============================================================

const getBaseUrl = () => {
  // ✅ ORACLE SUNUCUSU (Her zaman aynı)
  const PROD_URL = 'http://130.61.118.228:8080';
  
  if (__DEV__) {
    // Geliştirme ortamında - Oracle IP'ye bağlan
    return PROD_URL;
  }
  
  // Production'da aynı URL
  return PROD_URL;
};

const API_BASE_URL = getBaseUrl();

console.log(`🌐 API Base URL: ${API_BASE_URL}`);

// ============================================================
// 📦 AXIOS CLIENT
// ============================================================

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000, // 15 saniye
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// ============================================================
// 🔑 TOKEN YÖNETİMİ
// ============================================================

const getToken = async () => {
  try {
    const token = await AsyncStorage.getItem('modaverse_token');
    return token;
  } catch (error) {
    console.error('Token alınamadı:', error);
    return null;
  }
};

// ============================================================
// 📡 REQUEST INTERCEPTOR (Her istekten önce)
// ============================================================

api.interceptors.request.use(
  async (config) => {
    // Token ekle
    const token = await getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    console.log(`📡 API İsteği: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('❌ API İstek Hatası:', error);
    return Promise.reject(error);
  }
);

// ============================================================
// 📡 RESPONSE INTERCEPTOR (Her cevaptan sonra)
// ============================================================

api.interceptors.response.use(
  (response) => {
    console.log(`✅ API Yanıt: ${response.status} ${response.config.url}`);
    return response;
  },
  async (error) => {
    if (error.response) {
      // Sunucu yanıt verdi (4xx, 5xx)
      console.error('❌ API Yanıt Hatası:', {
        status: error.response.status,
        data: error.response.data,
        url: error.config?.url,
      });
      
      // 🔥 Özel hata mesajları
      switch (error.response.status) {
        case 401:
          // Yetkisiz - Token geçersiz
          console.warn('⚠️ Token geçersiz, çıkış yapılıyor...');
          await AsyncStorage.removeItem('modaverse_token');
          await AsyncStorage.removeItem('modaverse_user');
          // Navigation yönlendirmesi App.js'de yapılacak
          break;
        case 404:
          console.error('❌ Kaynak bulunamadı');
          break;
        case 429:
          console.error('⚠️ Çok fazla istek, lütfen bekleyin');
          break;
        case 500:
          console.error('❌ Sunucu hatası');
          break;
      }
    } else if (error.request) {
      // İstek yapıldı ama cevap alınamadı (timeout / bağlantı hatası)
      console.error('❌ Sunucuya ulaşılamıyor:', error.message);
    } else {
      // İstek oluşturulurken hata
      console.error('❌ İstek oluşturma hatası:', error.message);
    }
    
    return Promise.reject(error);
  }
);

// ============================================================
// 🔐 AUTH API
// ============================================================

export const authAPI = {
  login: async (email, password) => {
    try {
      const response = await api.post('/api/auth/login', { email, password });
      return response.data;
    } catch (error) {
      console.error('Login hatası:', error);
      throw error;
    }
  },

  register: async (email, password, displayName) => {
    try {
      const response = await api.post('/api/auth/register', {
        email,
        password,
        display_name: displayName
      });
      return response.data;
    } catch (error) {
      console.error('Register hatası:', error);
      throw error;
    }
  },

  getProfile: async () => {
    try {
      const response = await api.get('/api/auth/me');
      return response.data;
    } catch (error) {
      console.error('Profil hatası:', error);
      throw error;
    }
  },

  logout: async () => {
    try {
      await AsyncStorage.removeItem('modaverse_token');
      await AsyncStorage.removeItem('modaverse_user');
      return { success: true };
    } catch (error) {
      console.error('Logout hatası:', error);
      throw error;
    }
  }
};

// ============================================================
// 👕 WARDIROBE API
// ============================================================

export const wardrobeAPI = {
  // Tüm ürünleri getir
  getAllItems: async (userId) => {
    try {
      const response = await api.get(`/api/wardrobe/list/${userId}`);
      return response.data;
    } catch (error) {
      console.error('getAllItems hatası:', error);
      throw error;
    }
  },

  // Yeni ürün ekle
  addItem: async (data) => {
    try {
      const response = await api.post('/api/wardrobe/add', data);
      return response.data;
    } catch (error) {
      console.error('addItem hatası:', error);
      throw error;
    }
  },

  // Ürün sil
  deleteItem: async (itemId, userId) => {
    try {
      const response = await api.delete(`/api/wardrobe/delete/${itemId}`, {
        params: { user_id: userId }
      });
      return response.data;
    } catch (error) {
      console.error(`deleteItem hatası (${itemId}):`, error);
      throw error;
    }
  },

  // Star parça işaretle
  toggleStar: async (userId, productId, isStar) => {
    try {
      const response = await api.post('/api/wardrobe/update-star', {
        user_id: userId,
        product_id: productId,
        is_star: isStar
      });
      return response.data;
    } catch (error) {
      console.error('toggleStar hatası:', error);
      throw error;
    }
  },

  // Gardırop istatistikleri
  getStats: async (userId) => {
    try {
      const response = await api.get(`/api/wardrobe/stats/${userId}`);
      return response.data;
    } catch (error) {
      console.error('getStats hatası:', error);
      throw error;
    }
  }
};

// ============================================================
// 🧠 AI / KARAR ŞEFİ API
// ============================================================

export const sefAPI = {
  // Karar Şefi'ne soru sor
  ask: async (question, userId = null) => {
    try {
      const response = await api.post('/api/sef/konus', {
        soru: question,
        user_id: userId
      });
      return response.data;
    } catch (error) {
      console.error('Sef API hatası:', error);
      throw error;
    }
  },

  // Kombin önerisi al
  getOutfitSuggestion: async (userId) => {
    try {
      const response = await api.post('/api/karar/konus', {
        user_id: userId
      });
      return response.data;
    } catch (error) {
      console.error('Kombin önerisi hatası:', error);
      throw error;
    }
  },

  // Turn1 - Tüm kombinler
  getTurn1Outfits: async (items) => {
    try {
      const response = await api.post('/api/suggest/turn1', { items });
      return response.data;
    } catch (error) {
      console.error('Turn1 hatası:', error);
      throw error;
    }
  },

  // Turn2 - Star parçalı kombinler
  getTurn2Outfits: async (items, starItems) => {
    try {
      const response = await api.post('/api/suggest/turn2', { items, star_items: starItems });
      return response.data;
    } catch (error) {
      console.error('Turn2 hatası:', error);
      throw error;
    }
  },

  // Turn3 - Zaman bazlı kombinler
  getTurn3Outfits: async (items, timeOfDay) => {
    try {
      const response = await api.post('/api/suggest/turn3', { items, time_of_day: timeOfDay });
      return response.data;
    } catch (error) {
      console.error('Turn3 hatası:', error);
      throw error;
    }
  }
};

// ============================================================
// 👔 OUTFIT API
// ============================================================

export const outfitAPI = {
  // Kombin oluştur
  createOutfit: async (data) => {
    try {
      const response = await api.post('/api/community/share', data);
      return response.data;
    } catch (error) {
      console.error('createOutfit hatası:', error);
      throw error;
    }
  },

  // Topluluk akışı
  getFeed: async (concept = null, page = 1, limit = 20) => {
    try {
      const response = await api.get('/api/community/feed', {
        params: { concept, page, limit }
      });
      return response.data;
    } catch (error) {
      console.error('getFeed hatası:', error);
      throw error;
    }
  },

  // Beğeni
  likePost: async (postId, userId, likeType) => {
    try {
      const response = await api.post('/api/community/like', {
        post_id: postId,
        user_id: userId,
        like_type: likeType
      });
      return response.data;
    } catch (error) {
      console.error('likePost hatası:', error);
      throw error;
    }
  },

  // Kategoriler
  getCategories: async () => {
    try {
      const response = await api.get('/api/community/categories');
      return response.data;
    } catch (error) {
      console.error('getCategories hatası:', error);
      throw error;
    }
  }
};

// ============================================================
// 🖼️ ANALYZE API
// ============================================================

export const analyzeAPI = {
  // Görsel analiz
  analyzeImage: async (formData) => {
    try {
      const response = await api.post('/api/analyze', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('analyzeImage hatası:', error);
      throw error;
    }
  },

  // Renk kontrolü
  checkColor: async (color1, color2) => {
    try {
      const response = await api.post('/api/color-check', { color1, color2 });
      return response.data;
    } catch (error) {
      console.error('checkColor hatası:', error);
      throw error;
    }
  },

  // Kategori kontrolü
  checkCategory: async (category1, category2) => {
    try {
      const response = await api.post('/api/category-check', { category1, category2 });
      return response.data;
    } catch (error) {
      console.error('checkCategory hatası:', error);
      throw error;
    }
  }
};

// ============================================================
// ⚙️ SYSTEM API
// ============================================================

export const systemAPI = {
  // Health check
  healthCheck: async () => {
    try {
      const response = await api.get('/health');
      return response.data;
    } catch (error) {
      console.error('Health check hatası:', error);
      throw error;
    }
  },

  // Sistem durumu
  getStatus: async () => {
    try {
      const response = await api.get('/api/durum');
      return response.data;
    } catch (error) {
      console.error('Sistem durumu hatası:', error);
      throw error;
    }
  },

  // Worker durumu
  getWorkerStatus: async () => {
    try {
      const response = await api.get('/api/worker/durum');
      return response.data;
    } catch (error) {
      console.error('Worker durumu hatası:', error);
      throw error;
    }
  }
};

// ============================================================
// 📤 EXPORT
// ============================================================

export default api;