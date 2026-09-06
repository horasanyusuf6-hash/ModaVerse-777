// 📁 src/services/brandService.js
// Marka İşlemleri Servisi - Marka yönetimi, takip, analiz

import AsyncStorage from '@react-native-async-storage/async-storage';

// Local storage anahtarları
const BRANDS_KEY = '@brands_data';
const FOLLOWING_KEY = '@following_brands';
const ANALYTICS_KEY = '@brand_analytics';

class BrandService {
  constructor() {
    this.brands = [];
    this.following = [];
    this.analytics = {};
    this.initialized = false;
  }

  /**
   * Servisi başlat
   */
  async initialize() {
    if (this.initialized) return;
    
    try {
      // Marka verilerini yükle
      const brandsData = await AsyncStorage.getItem(BRANDS_KEY);
      this.brands = brandsData ? JSON.parse(brandsData) : [];
      
      // Takip edilen markaları yükle
      const followingData = await AsyncStorage.getItem(FOLLOWING_KEY);
      this.following = followingData ? JSON.parse(followingData) : [];
      
      // Analiz verilerini yükle
      const analyticsData = await AsyncStorage.getItem(ANALYTICS_KEY);
      this.analytics = analyticsData ? JSON.parse(analyticsData) : {};
      
      this.initialized = true;
    } catch (error) {
      console.error('BrandService başlatma hatası:', error);
      this.brands = [];
      this.following = [];
      this.analytics = {};
    }
  }

  /**
   * Tüm markaları getir
   */
  async getAllBrands() {
    await this.initialize();
    return this.brands;
  }

  /**
   * Marka detayını getir
   */
  async getBrandDetails(brandId) {
    await this.initialize();
    return this.brands.find(b => b.id === brandId) || null;
  }

  /**
   * Markaları kategoriye göre filtrele
   */
  async getBrandsByCategory(category) {
    await this.initialize();
    if (category === 'all') return this.brands;
    return this.brands.filter(b => b.category === category);
  }

  /**
   * Marka ara
   */
  async searchBrands(query) {
    await this.initialize();
    const lowerQuery = query.toLowerCase();
    return this.brands.filter(b => 
      b.name.toLowerCase().includes(lowerQuery) ||
      b.title.toLowerCase().includes(lowerQuery) ||
      b.location.toLowerCase().includes(lowerQuery)
    );
  }

  /**
   * Marka takip et
   */
  async followBrand(brandId) {
    await this.initialize();
    
    if (!this.following.includes(brandId)) {
      this.following.push(brandId);
      await this.saveFollowing();
      
      // Marka takipçi sayısını artır
      const brand = this.brands.find(b => b.id === brandId);
      if (brand) {
        brand.followers = (brand.followers || 0) + 1;
        await this.saveBrands();
      }
      
      return true;
    }
    return false;
  }

  /**
   * Marka takip bırak
   */
  async unfollowBrand(brandId) {
    await this.initialize();
    
    const index = this.following.indexOf(brandId);
    if (index !== -1) {
      this.following.splice(index, 1);
      await this.saveFollowing();
      
      // Marka takipçi sayısını azalt
      const brand = this.brands.find(b => b.id === brandId);
      if (brand) {
        brand.followers = Math.max(0, (brand.followers || 0) - 1);
        await this.saveBrands();
      }
      
      return true;
    }
    return false;
  }

  /**
   * Takip edilen markaları getir
   */
  async getFollowingBrands() {
    await this.initialize();
    return this.brands.filter(b => this.following.includes(b.id));
  }

  /**
   * Marka takip durumunu kontrol et
   */
  async isFollowing(brandId) {
    await this.initialize();
    return this.following.includes(brandId);
  }

  /**
   * Marka analizi kaydet
   */
  async trackBrandView(brandId, userId) {
    await this.initialize();
    
    const key = `${brandId}_${userId}`;
    if (!this.analytics[key]) {
      this.analytics[key] = {
        brandId,
        userId,
        views: 0,
        engagements: 0,
        lastView: null,
        firstView: new Date().toISOString(),
      };
    }
    
    this.analytics[key].views += 1;
    this.analytics[key].lastView = new Date().toISOString();
    
    await this.saveAnalytics();
    return this.analytics[key];
  }

  /**
   * Marka etkileşim kaydet
   */
  async trackBrandEngagement(brandId, userId, type) {
    await this.initialize();
    
    const key = `${brandId}_${userId}`;
    if (!this.analytics[key]) {
      this.analytics[key] = {
        brandId,
        userId,
        views: 0,
        engagements: 0,
        engagementTypes: {},
        lastView: null,
        firstView: new Date().toISOString(),
      };
    }
    
    this.analytics[key].engagements += 1;
    this.analytics[key].engagementTypes[type] = 
      (this.analytics[key].engagementTypes[type] || 0) + 1;
    
    await this.saveAnalytics();
    return this.analytics[key];
  }

  /**
   * Marka analizlerini getir
   */
  async getBrandAnalytics(brandId) {
    await this.initialize();
    
    const brandAnalytics = {};
    let totalViews = 0;
    let totalEngagements = 0;
    let uniqueUsers = new Set();
    
    for (const [key, data] of Object.entries(this.analytics)) {
      if (data.brandId === brandId) {
        totalViews += data.views || 0;
        totalEngagements += data.engagements || 0;
        uniqueUsers.add(data.userId);
        
        if (!brandAnalytics[data.userId]) {
          brandAnalytics[data.userId] = {
            views: 0,
            engagements: 0,
            engagementTypes: {},
          };
        }
        brandAnalytics[data.userId].views += data.views || 0;
        brandAnalytics[data.userId].engagements += data.engagements || 0;
        
        if (data.engagementTypes) {
          for (const [type, count] of Object.entries(data.engagementTypes)) {
            brandAnalytics[data.userId].engagementTypes[type] = 
              (brandAnalytics[data.userId].engagementTypes[type] || 0) + count;
          }
        }
      }
    }
    
    const avgEngagementPerUser = uniqueUsers.size > 0 
      ? totalEngagements / uniqueUsers.size 
      : 0;
    
    const conversionRate = uniqueUsers.size > 0 && totalViews > 0
      ? ((totalEngagements / totalViews) * 100).toFixed(1)
      : 0;

    // En çok etkileşim yapan kullanıcılar
    const topUsers = Object.entries(brandAnalytics)
      .sort((a, b) => b[1].engagements - a[1].engagements)
      .slice(0, 5)
      .map(([userId, data]) => ({
        userId,
        engagements: data.engagements,
        views: data.views,
      }));

    return {
      brandId,
      views: totalViews,
      engagements: totalEngagements,
      uniqueUsers: uniqueUsers.size,
      avgEngagementPerUser: avgEngagementPerUser,
      conversionRate: parseFloat(conversionRate),
      topUsers,
      totalAnalytics: Object.keys(brandAnalytics).length,
    };
  }

  /**
   * Trend markaları getir
   */
  async getTrendingBrands(limit = 5) {
    await this.initialize();
    
    // Takipçi sayısına ve trendNo'ya göre sırala
    return this.brands
      .sort((a, b) => {
        // Önce trendNo, sonra takipçi sayısı
        if (a.trendNo !== b.trendNo) {
          return a.trendNo - b.trendNo;
        }
        return (b.followers || 0) - (a.followers || 0);
      })
      .slice(0, limit);
  }

  /**
   * Yeni marka ekle (Admin)
   */
  async addBrand(brandData) {
    await this.initialize();
    
    const newBrand = {
      id: `brand_${Date.now()}`,
      ...brandData,
      followers: brandData.followers || 0,
      trending: brandData.trending || 0,
      trendNo: this.brands.length + 1,
      designs: brandData.designs || [],
      advantages: brandData.advantages || [],
      privileges: brandData.privileges || [],
      campaigns: brandData.campaigns || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    this.brands.push(newBrand);
    await this.saveBrands();
    return newBrand;
  }

  /**
   * Marka güncelle (Admin)
   */
  async updateBrand(brandId, updates) {
    await this.initialize();
    
    const index = this.brands.findIndex(b => b.id === brandId);
    if (index !== -1) {
      this.brands[index] = {
        ...this.brands[index],
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      await this.saveBrands();
      return this.brands[index];
    }
    return null;
  }

  /**
   * Marka sil (Admin)
   */
  async deleteBrand(brandId) {
    await this.initialize();
    
    const index = this.brands.findIndex(b => b.id === brandId);
    if (index !== -1) {
      this.brands.splice(index, 1);
      await this.saveBrands();
      return true;
    }
    return false;
  }

  // ============================================================
  // 📌 KAYIT METODLARI
  // ============================================================

  async saveBrands() {
    try {
      await AsyncStorage.setItem(BRANDS_KEY, JSON.stringify(this.brands));
    } catch (error) {
      console.error('Marka kaydetme hatası:', error);
    }
  }

  async saveFollowing() {
    try {
      await AsyncStorage.setItem(FOLLOWING_KEY, JSON.stringify(this.following));
    } catch (error) {
      console.error('Takip kaydetme hatası:', error);
    }
  }

  async saveAnalytics() {
    try {
      await AsyncStorage.setItem(ANALYTICS_KEY, JSON.stringify(this.analytics));
    } catch (error) {
      console.error('Analiz kaydetme hatası:', error);
    }
  }

  /**
   * Servisi temizle (test amaçlı)
   */
  async clearAll() {
    this.brands = [];
    this.following = [];
    this.analytics = {};
    await this.saveBrands();
    await this.saveFollowing();
    await this.saveAnalytics();
  }

  /**
   * Örnek marka verileri yükle (test amaçlı)
   */
  async loadSampleData() {
    const sampleBrands = [
      {
        id: 'b1',
        type: 'brand',
        name: 'Vakko',
        title: 'Lüks Moda Evi',
        avatar: 'https://via.placeholder.com/60',
        cover: 'https://via.placeholder.com/400x200',
        description: 'Türkiye\'nin önde gelen lüks moda markası.',
        followers: 3200000,
        rating: 4.9,
        location: 'İstanbul',
        isVerified: true,
        trending: 95,
        category: 'luxury',
        trendNo: 1,
        advantages: ['%25 İndirim', 'Ücretsiz Kargo'],
        privileges: ['Vakko Club', 'Özel Davetiyeler'],
        campaigns: [
          { id: 'c1', title: 'Sezon Sonu Fırsatları', validUntil: '2026-12-31' },
        ],
        designs: [
          { id: 'd1', title: 'Yeni Sezon', image: 'https://via.placeholder.com/120x100', likes: 6800, comments: 450 },
        ],
      },
      {
        id: 'b2',
        type: 'brand',
        name: 'Mavi',
        title: 'Sokak Modası',
        avatar: 'https://via.placeholder.com/60',
        cover: 'https://via.placeholder.com/400x200',
        description: 'Özgün ve rahat sokak modası.',
        followers: 1850000,
        rating: 4.6,
        location: 'İstanbul',
        isVerified: true,
        trending: 85,
        category: 'streetwear',
        trendNo: 2,
        advantages: ['Sepette %15 İndirim'],
        privileges: ['VIP Üyelik', 'Özel Gün Hediyeleri'],
        campaigns: [
          { id: 'c1', title: 'Sokak Stili Haftası', validUntil: '2026-10-15' },
        ],
        designs: [
          { id: 'd1', title: 'Sokak Stili', image: 'https://via.placeholder.com/120x100', likes: 5200, comments: 340 },
        ],
      },
    ];
    
    this.brands = sampleBrands;
    await this.saveBrands();
    return this.brands;
  }
}

// Singleton instance
export const brandService = new BrandService();

export default brandService;