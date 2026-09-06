// 📁 src/services/imagePoolService.js
// Görsel Havuzu Sistemi - Ürün görsellerini tekrar kullanılabilir hale getirir

import AsyncStorage from '@react-native-async-storage/async-storage';

// Görsel havuzu için localStorage anahtarları
const IMAGE_POOL_KEY = '@image_pool';
const IMAGE_HASH_KEY = '@image_hashes';

class ImagePoolService {
  constructor() {
    this.imagePool = [];
    this.imageHashes = {};
    this.initialized = false;
  }

  /**
   * Servisi başlat ve verileri yükle
   */
  async initialize() {
    if (this.initialized) return;
    
    try {
      // Görsel havuzunu yükle
      const poolData = await AsyncStorage.getItem(IMAGE_POOL_KEY);
      this.imagePool = poolData ? JSON.parse(poolData) : [];
      
      // Hash verilerini yükle
      const hashData = await AsyncStorage.getItem(IMAGE_HASH_KEY);
      this.imageHashes = hashData ? JSON.parse(hashData) : {};
      
      this.initialized = true;
    } catch (error) {
      console.error('ImagePoolService başlatma hatası:', error);
      this.imagePool = [];
      this.imageHashes = {};
    }
  }

  /**
   * Görsel için basit hash oluştur (gerçek uygulamada daha karmaşık)
   */
  generateImageHash(imageUrl) {
    // Basit bir hash algoritması
    let hash = 0;
    const str = imageUrl.toString();
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return hash.toString(16);
  }

  /**
   * Görsel havuzunda benzer ürün ara
   */
  async findSimilarProduct(imageUrl, productName) {
    await this.initialize();
    
    const imageHash = this.generateImageHash(imageUrl);
    const similarProducts = [];
    
    // Önce hash ile ara
    if (this.imageHashes[imageHash]) {
      const productIds = this.imageHashes[imageHash];
      for (const id of productIds) {
        const product = this.imagePool.find(p => p.id === id);
        if (product) {
          similarProducts.push(product);
        }
      }
    }
    
    // Sonra isim benzerliğine göre ara
    if (productName) {
      const nameLower = productName.toLowerCase();
      const nameMatches = this.imagePool.filter(p => 
        p.name.toLowerCase().includes(nameLower) ||
        nameLower.includes(p.name.toLowerCase())
      );
      
      for (const match of nameMatches) {
        if (!similarProducts.find(p => p.id === match.id)) {
          similarProducts.push(match);
        }
      }
    }
    
    return similarProducts;
  }

  /**
   * Yeni ürün görselini havuza ekle
   */
  async addProductToPool(product) {
    await this.initialize();
    
    const newProduct = {
      id: product.id || `pool_${Date.now()}`,
      name: product.name,
      imageUrl: product.imageUrl,
      category: product.category || 'general',
      addedBy: product.addedBy || 'system',
      addedAt: new Date().toISOString(),
      tags: product.tags || [],
      usageCount: 1,
      brand: product.brand || null,
    };
    
    // Havuza ekle
    this.imagePool.push(newProduct);
    
    // Hash ekle
    const hash = this.generateImageHash(product.imageUrl);
    if (!this.imageHashes[hash]) {
      this.imageHashes[hash] = [];
    }
    if (!this.imageHashes[hash].includes(newProduct.id)) {
      this.imageHashes[hash].push(newProduct.id);
    }
    
    // Kaydet
    await this.savePool();
    return newProduct;
  }

  /**
   * Ürün kullanım sayısını artır
   */
  async incrementUsage(productId) {
    await this.initialize();
    
    const product = this.imagePool.find(p => p.id === productId);
    if (product) {
      product.usageCount = (product.usageCount || 0) + 1;
      await this.savePool();
      return product;
    }
    return null;
  }

  /**
   * Havuzdaki tüm ürünleri getir
   */
  async getAllProducts() {
    await this.initialize();
    return this.imagePool;
  }

  /**
   * Kategoriye göre ürünleri filtrele
   */
  async getProductsByCategory(category) {
    await this.initialize();
    return this.imagePool.filter(p => p.category === category);
  }

  /**
   * En çok kullanılan ürünleri getir
   */
  async getMostUsedProducts(limit = 10) {
    await this.initialize();
    return this.imagePool
      .sort((a, b) => (b.usageCount || 0) - (a.usageCount || 0))
      .slice(0, limit);
  }

  /**
   * Kullanıcıya benzer ürün öner
   */
  async getSuggestedProducts(userId, limit = 5) {
    await this.initialize();
    
    // Kullanıcının geçmişini kontrol et (basit)
    const userHistory = await AsyncStorage.getItem(`@user_history_${userId}`);
    const history = userHistory ? JSON.parse(userHistory) : [];
    
    // Kullanıcının en çok baktığı kategorileri bul
    const categoryCounts = {};
    for (const item of history) {
      if (item.category) {
        categoryCounts[item.category] = (categoryCounts[item.category] || 0) + 1;
      }
    }
    
    // En çok bakılan kategori
    const topCategory = Object.keys(categoryCounts)
      .sort((a, b) => categoryCounts[b] - categoryCounts[a])[0];
    
    let suggestions = [];
    if (topCategory) {
      suggestions = this.imagePool
        .filter(p => p.category === topCategory)
        .sort((a, b) => (b.usageCount || 0) - (a.usageCount || 0));
    }
    
    // Yeterli öneri yoksa popüler ürünleri getir
    if (suggestions.length < limit) {
      const popular = await this.getMostUsedProducts(limit * 2);
      for (const item of popular) {
        if (!suggestions.find(p => p.id === item.id)) {
          suggestions.push(item);
        }
      }
    }
    
    return suggestions.slice(0, limit);
  }

  /**
   * Havuzu kaydet
   */
  async savePool() {
    try {
      await AsyncStorage.setItem(IMAGE_POOL_KEY, JSON.stringify(this.imagePool));
      await AsyncStorage.setItem(IMAGE_HASH_KEY, JSON.stringify(this.imageHashes));
    } catch (error) {
      console.error('Havuz kaydetme hatası:', error);
    }
  }

  /**
   * Havuzu temizle (test amaçlı)
   */
  async clearPool() {
    this.imagePool = [];
    this.imageHashes = {};
    await this.savePool();
  }

  /**
   * Havuz istatistiklerini getir
   */
  async getPoolStats() {
    await this.initialize();
    
    const categories = {};
    for (const product of this.imagePool) {
      const cat = product.category || 'general';
      categories[cat] = (categories[cat] || 0) + 1;
    }
    
    return {
      totalProducts: this.imagePool.length,
      categories: categories,
      mostUsed: await this.getMostUsedProducts(5),
    };
  }
}

// Singleton instance
export const imagePoolService = new ImagePoolService();

export default imagePoolService;