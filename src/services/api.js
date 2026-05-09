import axios from 'axios';

// 📱 Platform bazlı API URL
const getBaseUrl = () => {
  // Emülatör için 10.0.2.2, gerçek cihaz için bilgisayar IP'si
  if (__DEV__) {
    // Geliştirme ortamında
    return 'http://10.0.2.2:5000/api'; // Android emülatör için
    // iOS simülatör için: 'http://localhost:5000/api'
    // Gerçek cihaz için: 'http://192.168.1.x:5000/api'
  }
  // Production'da gerçek URL
  return 'https://api.modaverse.com/api';
};

const API_BASE_URL = getBaseUrl();

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000, // 15 saniye
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor (her istekten önce)
api.interceptors.request.use(
  (config) => {
    // Token ekleme (ilerde)
    // const token = AsyncStorage.getItem('token');
    // if (token) config.headers.Authorization = `Bearer ${token}`;
    
    console.log(`📡 API İsteği: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('❌ API İstek Hatası:', error);
    return Promise.reject(error);
  }
);

// Response interceptor (her cevaptan sonra)
api.interceptors.response.use(
  (response) => {
    console.log(`✅ API Yanıt: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    if (error.response) {
      // Sunucu yanıt verdi (4xx, 5xx)
      console.error('❌ API Yanıt Hatası:', {
        status: error.response.status,
        data: error.response.data,
        url: error.config?.url,
      });
      
      // Özel hata mesajları
      switch (error.response.status) {
        case 401:
          // Yetkisiz - login sayfasına yönlendir
          break;
        case 404:
          console.error('Kaynak bulunamadı');
          break;
        case 500:
          console.error('Sunucu hatası');
          break;
      }
    } else if (error.request) {
      // İstek yapıldı ama cevap alınamadı (timeout)
      console.error('❌ Sunucuya ulaşılamıyor:', error.message);
    } else {
      // İstek oluşturulurken hata
      console.error('❌ İstek oluşturma hatası:', error.message);
    }
    
    return Promise.reject(error);
  }
);

// API fonksiyonları
export const wardrobeAPI = {
  // Kıyafet işlemleri
  getAllItems: async () => {
    try {
      const response = await api.get('/wardrobe/items');
      return response;
    } catch (error) {
      console.error('getAllItems hatası:', error);
      throw error;
    }
  },
  
  getItemById: async (id) => {
    try {
      const response = await api.get(`/wardrobe/items/${id}`);
      return response;
    } catch (error) {
      console.error(`getItemById hatası (${id}):`, error);
      throw error;
    }
  },
  
  createItem: async (formData) => {
    try {
      const response = await api.post('/wardrobe/items', formData, {
        headers: { 
          'Content-Type': 'multipart/form-data',
        },
      });
      return response;
    } catch (error) {
      console.error('createItem hatası:', error);
      throw error;
    }
  },
  
  updateItem: async (id, data) => {
    try {
      // Eğer formData ise header'ı değiştir
      const isFormData = data instanceof FormData;
      const response = await api.put(`/wardrobe/items/${id}`, data, {
        headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : {},
      });
      return response;
    } catch (error) {
      console.error(`updateItem hatası (${id}):`, error);
      throw error;
    }
  },
  
  deleteItem: async (id) => {
    try {
      const response = await api.delete(`/wardrobe/items/${id}`);
      return response;
    } catch (error) {
      console.error(`deleteItem hatası (${id}):`, error);
      throw error;
    }
  },

  // Kategori işlemleri
  getCategories: async () => {
    try {
      const response = await api.get('/wardrobe/categories');
      return response;
    } catch (error) {
      console.error('getCategories hatası:', error);
      throw error;
    }
  },
  
  getItemsByCategory: async (categoryId) => {
    try {
      const response = await api.get(`/wardrobe/categories/${categoryId}/items`);
      return response;
    } catch (error) {
      console.error(`getItemsByCategory hatası (${categoryId}):`, error);
      throw error;
    }
  },
};

// Base API'yi de export et (gerektiğinde direkt kullanım için)
export default api;