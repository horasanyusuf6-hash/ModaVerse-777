// 📁 src/services/api.js - REVİZE (Backend entegrasyonlu)

import AsyncStorage from '@react-native-async-storage/async-storage';

// ============================================================
// 📌 API YAPILANDIRMASI
// ============================================================

// Backend URL (Oracle Sunucu)
export const API_URL = 'http://130.61.118.228:8080';

// API Endpoint'leri
export const ENDPOINTS = {
  // Auth
  AUTH_REGISTER: '/api/auth/register',
  AUTH_LOGIN: '/api/auth/login',
  AUTH_ME: '/api/auth/me',
  AUTH_TEST: '/api/auth/test',
  AUTH_LOGOUT: '/api/auth/logout',
  
  // User Profile
  USER_ME: '/api/users/me',
  USER_UPDATE: '/api/users/update',
  USER_DELETE: '/api/users/delete',
  USER_STATS: (userId) => `/api/users/stats/${userId}`,
  
  // Wardrobe
  WARDROBE_LIST: (userId) => `/api/wardrobe/list/${userId}`,
  WARDROBE_ADD: '/api/wardrobe/add',
  WARDROBE_DELETE: (itemId) => `/api/wardrobe/delete/${itemId}`,
  WARDROBE_UPDATE: (itemId) => `/api/wardrobe/update/${itemId}`,
  WARDROBE_STAR: '/api/wardrobe/update-star',
  WARDROBE_STATS: (userId) => `/api/wardrobe/stats/${userId}`,
  
  // Outfit Suggestions
  OUTFIT_SUGGEST: '/api/outfit-suggest',
  OUTFIT_WEATHER: '/api/outfit-weather',
  SUGGEST_TURN1: '/api/suggest/turn1',
  SUGGEST_TURN2: '/api/suggest/turn2',
  SUGGEST_TURN3: '/api/suggest/turn3',
  
  // Chat
  CHAT: '/api/chat',
  
  // Karar Şefi
  SEF_KONUS: '/api/sef/konus',
  SEF_BILGI: '/api/sef/bilgi',
  
  // Community
  COMMUNITY_SHARE: '/api/community/share',
  COMMUNITY_FEED: '/api/community/feed',
  COMMUNITY_LIKE: '/api/community/like',
  COMMUNITY_CATEGORIES: '/api/community/categories',
  
  // Analyze
  ANALYZE: '/api/analyze',
  
  // Color & Category
  COLOR_CHECK: '/api/color-check',
  CATEGORY_CHECK: '/api/category-check',
  
  // Depo
  DEPO_URUNLER: '/api/depo/urunler',
  DEPO_URUN: (urunId) => `/api/depo/urun/${urunId}`,
  DEPO_URUN_ARA: '/api/depo/urun-ara',
  
  // System
  HEALTH: '/health',
  SYSTEM_STATUS: '/api/durum',
};

// ============================================================
// 📌 API SINIFI
// ============================================================

class ApiService {
  constructor() {
    this.baseUrl = API_URL;
    this.token = null;
  }

  /**
   * Token'ı ayarla
   */
  setToken(token) {
    this.token = token;
    if (token) {
      AsyncStorage.setItem('@auth_token', token);
    } else {
      AsyncStorage.removeItem('@auth_token');
    }
  }

  /**
   * Token'ı yükle
   */
  async loadToken() {
    try {
      const token = await AsyncStorage.getItem('@auth_token');
      if (token) {
        this.token = token;
      }
      return token;
    } catch (error) {
      console.error('Token yükleme hatası:', error);
      return null;
    }
  }

  /**
   * Headers oluştur
   */
  getHeaders(includeAuth = true) {
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    if (includeAuth && this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    return headers;
  }

  /**
   * GET isteği
   */
  async get(endpoint, includeAuth = true) {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'GET',
        headers: this.getHeaders(includeAuth),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`GET ${endpoint} hatası:`, error);
      throw error;
    }
  }

  /**
   * POST isteği
   */
  async post(endpoint, body, includeAuth = true) {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'POST',
        headers: this.getHeaders(includeAuth),
        body: JSON.stringify(body),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`POST ${endpoint} hatası:`, error);
      throw error;
    }
  }

  /**
   * PUT isteği
   */
  async put(endpoint, body, includeAuth = true) {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'PUT',
        headers: this.getHeaders(includeAuth),
        body: JSON.stringify(body),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`PUT ${endpoint} hatası:`, error);
      throw error;
    }
  }

  /**
   * DELETE isteği
   */
  async delete(endpoint, includeAuth = true) {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'DELETE',
        headers: this.getHeaders(includeAuth),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`DELETE ${endpoint} hatası:`, error);
      throw error;
    }
  }

  /**
   * Dosya yükleme (multipart/form-data)
   */
  async upload(endpoint, formData, includeAuth = true) {
    try {
      const headers = {
        'Accept': 'application/json',
      };

      if (includeAuth && this.token) {
        headers['Authorization'] = `Bearer ${this.token}`;
      }

      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'POST',
        headers: headers,
        body: formData,
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`UPLOAD ${endpoint} hatası:`, error);
      throw error;
    }
  }
}

// ============================================================
// 📌 AUTH API
// ============================================================

export const authAPI = {
  /**
   * Kullanıcı kaydı
   */
  register: async (email, password, displayName) => {
    return api.post(ENDPOINTS.AUTH_REGISTER, {
      email,
      password,
      display_name: displayName,
    }, false);
  },

  /**
   * Kullanıcı girişi
   */
  login: async (email, password) => {
    const response = await api.post(ENDPOINTS.AUTH_LOGIN, {
      email,
      password,
    }, false);

    if (response.success && response.id_token) {
      api.setToken(response.id_token);
    }

    return response;
  },

  /**
   * Mevcut kullanıcı bilgileri
   */
  getCurrentUser: async () => {
    return api.get(ENDPOINTS.AUTH_ME);
  },

  /**
   * Token testi
   */
  testToken: async () => {
    return api.get(ENDPOINTS.AUTH_TEST);
  },

  /**
   * Çıkış yap
   */
  logout: async () => {
    api.setToken(null);
    return { success: true };
  },
};

// ============================================================
// 📌 USER API
// ============================================================

export const userAPI = {
  /**
   * Kullanıcı profilini getir
   */
  getProfile: async () => {
    return api.get(ENDPOINTS.USER_ME);
  },

  /**
   * Kullanıcı profilini güncelle
   */
  updateProfile: async (displayName, photoUrl) => {
    return api.put(ENDPOINTS.USER_UPDATE, {
      display_name: displayName,
      photo_url: photoUrl,
    });
  },

  /**
   * Kullanıcı hesabını sil
   */
  deleteAccount: async () => {
    return api.delete(ENDPOINTS.USER_DELETE);
  },

  /**
   * Kullanıcı istatistikleri
   */
  getStats: async (userId) => {
    return api.get(ENDPOINTS.USER_STATS(userId));
  },
};

// ============================================================
// 📌 WARDROBE API
// ============================================================

export const wardrobeAPI = {
  /**
   * Gardırop listesini getir
   */
  getItems: async (userId) => {
    return api.get(ENDPOINTS.WARDROBE_LIST(userId));
  },

  /**
   * Gardıropa ürün ekle
   */
  addItem: async (data) => {
    return api.post(ENDPOINTS.WARDROBE_ADD, data);
  },

  /**
   * Gardıroptan ürün sil
   */
  deleteItem: async (itemId, userId) => {
    return api.delete(`${ENDPOINTS.WARDROBE_DELETE(itemId)}?user_id=${userId}`);
  },

  /**
   * Gardırop öğesini güncelle
   */
  updateItem: async (itemId, data) => {
    return api.put(ENDPOINTS.WARDROBE_UPDATE(itemId), data);
  },

  /**
   * Star işaretle
   */
  toggleStar: async (userId, productId, isStar) => {
    return api.post(ENDPOINTS.WARDROBE_STAR, {
      user_id: userId,
      product_id: productId,
      is_star: isStar,
    });
  },

  /**
   * Gardırop istatistikleri
   */
  getStats: async (userId) => {
    return api.get(ENDPOINTS.WARDROBE_STATS(userId));
  },
};

// ============================================================
// 📌 OUTFIT API
// ============================================================

export const outfitAPI = {
  /**
   * Kombin önerisi al
   */
  suggest: async (items) => {
    return api.post(ENDPOINTS.OUTFIT_SUGGEST, { items });
  },

  /**
   * Hava durumuna göre kombin
   */
  suggestWithWeather: async (items, city = 'istanbul') => {
    return api.post(ENDPOINTS.OUTFIT_WEATHER, { items, city });
  },

  /**
   * 1.Tur: Tüm kombinler
   */
  turn1: async (items) => {
    return api.post(ENDPOINTS.SUGGEST_TURN1, { items });
  },

  /**
   * 2.Tur: Star kombinler
   */
  turn2: async (items, starItems) => {
    return api.post(ENDPOINTS.SUGGEST_TURN2, { items, star_items: starItems });
  },

  /**
   * 3.Tur: Zaman bazlı kombin
   */
  turn3: async (items, timeOfDay) => {
    return api.post(ENDPOINTS.SUGGEST_TURN3, { items, time_of_day: timeOfDay });
  },
};

// ============================================================
// 📌 CHAT API
// ============================================================

export const chatAPI = {
  /**
   * AI ile sohbet
   */
  chat: async (message, items = [], city = null) => {
    return api.post(ENDPOINTS.CHAT, { message, items, city });
  },
};

// ============================================================
// 📌 SEF API
// ============================================================

export const sefAPI = {
  /**
   * Karar Şefi ile konuş
   */
  konus: async (soru, userId = null) => {
    return api.post(ENDPOINTS.SEF_KONUS, { soru, user_id: userId });
  },

  /**
   * Şef bilgileri
   */
  getBilgi: async () => {
    return api.get(ENDPOINTS.SEF_BILGI);
  },
};

// ============================================================
// 📌 COMMUNITY API
// ============================================================

export const communityAPI = {
  /**
   * Kombin paylaş
   */
  share: async (data) => {
    return api.post(ENDPOINTS.COMMUNITY_SHARE, data);
  },

  /**
   * Feed'i getir
   */
  getFeed: async (concept = null, page = 1, limit = 20) => {
    let url = `${ENDPOINTS.COMMUNITY_FEED}?page=${page}&limit=${limit}`;
    if (concept) {
      url += `&concept=${encodeURIComponent(concept)}`;
    }
    return api.get(url);
  },

  /**
   * Beğen
   */
  like: async (userId, postId, likeType) => {
    return api.post(ENDPOINTS.COMMUNITY_LIKE, {
      user_id: userId,
      post_id: postId,
      like_type: likeType,
    });
  },

  /**
   * Kategorileri getir
   */
  getCategories: async () => {
    return api.get(ENDPOINTS.COMMUNITY_CATEGORIES);
  },
};

// ============================================================
// 📌 DEPO API
// ============================================================

export const depoAPI = {
  /**
   * Tüm ürünleri getir
   */
  getUrunler: async () => {
    return api.get(ENDPOINTS.DEPO_URUNLER);
  },

  /**
   * Ürün detayı
   */
  getUrun: async (urunId) => {
    return api.get(ENDPOINTS.DEPO_URUN(urunId));
  },

  /**
   * Ürün ara
   */
  searchUrun: async (filtre) => {
    return api.post(ENDPOINTS.DEPO_URUN_ARA, filtre);
  },
};

// ============================================================
// 📌 SYSTEM API
// ============================================================

export const systemAPI = {
  /**
   * Health check
   */
  health: async () => {
    return api.get(ENDPOINTS.HEALTH, false);
  },

  /**
   * Sistem durumu
   */
  getStatus: async () => {
    return api.get(ENDPOINTS.SYSTEM_STATUS);
  },
};

// ============================================================
// 📌 SINGLETON INSTANCE
// ============================================================

export const api = new ApiService();

// Başlangıçta token'ı yükle
api.loadToken();

export default api;