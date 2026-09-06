// 📁 src/services/syncService.js
// Veri Senkronizasyon Servisi - Offline/Online veri yönetimi

import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from './api';

// Local storage anahtarları
const SYNC_QUEUE_KEY = '@sync_queue';
const SYNC_LAST_KEY = '@sync_last';
const SYNC_STATUS_KEY = '@sync_status';

// Senkronizasyon durumu
const SYNC_STATUS = {
  IDLE: 'idle',
  SYNCING: 'syncing',
  ERROR: 'error',
  OFFLINE: 'offline',
};

class SyncService {
  constructor() {
    this.isOnline = true;
    this.isSyncing = false;
    this.syncQueue = [];
    this.lastSync = null;
    this.status = SYNC_STATUS.IDLE;
    this.listeners = [];
  }

  /**
   * Servisi başlat
   */
  async initialize() {
    try {
      // Sync kuyruğunu yükle
      const queueData = await AsyncStorage.getItem(SYNC_QUEUE_KEY);
      this.syncQueue = queueData ? JSON.parse(queueData) : [];

      // Son sync zamanını yükle
      const lastData = await AsyncStorage.getItem(SYNC_LAST_KEY);
      this.lastSync = lastData ? JSON.parse(lastData) : null;

      // Status'u yükle
      const statusData = await AsyncStorage.getItem(SYNC_STATUS_KEY);
      this.status = statusData || SYNC_STATUS.IDLE;

      console.log('🔄 SyncService başlatıldı, kuyruk:', this.syncQueue.length);
      return true;
    } catch (error) {
      console.error('SyncService başlatma hatası:', error);
      return false;
    }
  }

  /**
   * Çevrimiçi durumu güncelle
   */
  setOnlineStatus(isOnline) {
    this.isOnline = isOnline;
    if (isOnline && this.syncQueue.length > 0) {
      this.processQueue();
    }
  }

  /**
   * Senkronizasyon dinleyicisi ekle
   */
  addListener(callback) {
    this.listeners.push(callback);
  }

  /**
   * Senkronizasyon dinleyicisini kaldır
   */
  removeListener(callback) {
    this.listeners = this.listeners.filter(cb => cb !== callback);
  }

  /**
   * Dinleyicileri bildir
   */
  notifyListeners(data) {
    this.listeners.forEach(cb => cb(data));
  }

  /**
   * Senkronizasyon kuyruğuna işlem ekle
   */
  async addToQueue(operation) {
    const newItem = {
      id: `${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      operation: operation.type,
      data: operation.data,
      userId: operation.userId || 'guest',
      timestamp: new Date().toISOString(),
      retries: 0,
      status: 'pending',
    };

    this.syncQueue.push(newItem);
    await this.saveQueue();

    console.log(`📦 Sync kuyruğuna eklendi: ${operation.type} (${this.syncQueue.length} işlem)`);

    // Online ise hemen işle
    if (this.isOnline) {
      this.processQueue();
    }

    return newItem;
  }

  /**
   * Kuyruğu işle
   */
  async processQueue() {
    if (this.isSyncing || !this.isOnline || this.syncQueue.length === 0) {
      return;
    }

    this.isSyncing = true;
    this.status = SYNC_STATUS.SYNCING;
    await this.saveStatus();
    this.notifyListeners({ status: 'syncing', count: this.syncQueue.length });

    console.log(`🔄 Senkronizasyon başladı (${this.syncQueue.length} işlem)`);

    const failedItems = [];

    for (const item of this.syncQueue) {
      if (item.status === 'completed') continue;

      try {
        const result = await this.processItem(item);
        if (result.success) {
          item.status = 'completed';
          item.completedAt = new Date().toISOString();
          console.log(`✅ ${item.operation} başarıyla senkronize edildi`);
        } else {
          item.retries += 1;
          if (item.retries >= 3) {
            item.status = 'failed';
            failedItems.push(item);
            console.error(`❌ ${item.operation} başarısız (3 deneme)`);
          } else {
            console.log(`⏳ ${item.operation} yeniden deneniyor (${item.retries}/3)`);
          }
        }
      } catch (error) {
        console.error(`❌ ${item.operation} işlemi hatası:`, error);
        item.retries += 1;
        if (item.retries >= 3) {
          item.status = 'failed';
          failedItems.push(item);
        }
      }
    }

    // Başarılı olanları kaldır, başarısız olanları kuyrukta tut
    this.syncQueue = this.syncQueue.filter(
      item => item.status === 'pending' || item.status === 'failed'
    );

    this.lastSync = new Date().toISOString();
    await this.saveQueue();
    await this.saveLastSync();

    this.isSyncing = false;
    this.status = this.syncQueue.length > 0 ? SYNC_STATUS.ERROR : SYNC_STATUS.IDLE;
    await this.saveStatus();

    this.notifyListeners({
      status: this.status,
      count: this.syncQueue.length,
      lastSync: this.lastSync,
    });

    console.log(`✅ Senkronizasyon tamamlandı. Kalan: ${this.syncQueue.length}`);
  }

  /**
   * Tek bir işlemi işle
   */
  async processItem(item) {
    const url = `${API_URL}/api/sync/${item.operation}`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: item.userId,
          data: item.data,
          timestamp: item.timestamp,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        return { success: true, data: result };
      }

      return { success: false, error: `HTTP ${response.status}` };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Verileri manuel senkronize et
   */
  async syncNow() {
    if (!this.isOnline) {
      console.warn('⚠️ Çevrimdışı, senkronizasyon yapılamıyor');
      return { success: false, reason: 'offline' };
    }

    await this.processQueue();
    return { success: true, remaining: this.syncQueue.length };
  }

  /**
   * Tüm verileri senkronize et (tam sync)
   */
  async fullSync(userId) {
    if (!this.isOnline) {
      return { success: false, reason: 'offline' };
    }

    try {
      // Local verileri topla
      const [profile, products, favorites, cart] = await Promise.all([
        AsyncStorage.getItem('@user_profile'),
        AsyncStorage.getItem('@user_products'),
        AsyncStorage.getItem('@favorites'),
        AsyncStorage.getItem('@cart'),
      ]);

      const payload = {
        userId,
        profile: profile ? JSON.parse(profile) : null,
        products: products ? JSON.parse(products) : [],
        favorites: favorites ? JSON.parse(favorites) : [],
        cart: cart ? JSON.parse(cart) : [],
        timestamp: new Date().toISOString(),
      };

      const response = await fetch(`${API_URL}/api/sync/full`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const result = await response.json();
        this.lastSync = new Date().toISOString();
        await this.saveLastSync();

        // Gelen verileri local'e kaydet
        if (result.data) {
          if (result.data.profile) {
            await AsyncStorage.setItem('@user_profile', JSON.stringify(result.data.profile));
          }
          if (result.data.products) {
            await AsyncStorage.setItem('@user_products', JSON.stringify(result.data.products));
          }
        }

        console.log('✅ Tam senkronizasyon başarılı');
        this.notifyListeners({ status: 'full_sync_completed', lastSync: this.lastSync });
        return { success: true, data: result.data };
      }

      return { success: false, error: `HTTP ${response.status}` };
    } catch (error) {
      console.error('❌ Tam senkronizasyon hatası:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Kuyruk durumunu getir
   */
  getQueueStatus() {
    return {
      count: this.syncQueue.length,
      pending: this.syncQueue.filter(item => item.status === 'pending').length,
      failed: this.syncQueue.filter(item => item.status === 'failed').length,
      completed: this.syncQueue.filter(item => item.status === 'completed').length,
      isSyncing: this.isSyncing,
      isOnline: this.isOnline,
      lastSync: this.lastSync,
      status: this.status,
    };
  }

  /**
   * Kuyruğu temizle
   */
  async clearQueue() {
    this.syncQueue = [];
    await this.saveQueue();
    console.log('🧹 Sync kuyruğu temizlendi');
    this.notifyListeners({ status: 'cleared', count: 0 });
  }

  /**
   * Başarısız işlemleri yeniden dene
   */
  async retryFailed() {
    const failed = this.syncQueue.filter(item => item.status === 'failed');
    failed.forEach(item => {
      item.status = 'pending';
      item.retries = 0;
    });
    await this.saveQueue();

    if (this.isOnline) {
      await this.processQueue();
    }

    return { success: true, retried: failed.length };
  }

  // ============================================================
  // 📌 KAYIT METODLARI
  // ============================================================

  async saveQueue() {
    try {
      await AsyncStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(this.syncQueue));
    } catch (error) {
      console.error('Kuyruk kaydetme hatası:', error);
    }
  }

  async saveLastSync() {
    try {
      await AsyncStorage.setItem(SYNC_LAST_KEY, JSON.stringify(this.lastSync));
    } catch (error) {
      console.error('Son sync kaydetme hatası:', error);
    }
  }

  async saveStatus() {
    try {
      await AsyncStorage.setItem(SYNC_STATUS_KEY, this.status);
    } catch (error) {
      console.error('Status kaydetme hatası:', error);
    }
  }

  /**
   * Servisi temizle (test amaçlı)
   */
  async clearAll() {
    this.syncQueue = [];
    this.lastSync = null;
    this.status = SYNC_STATUS.IDLE;
    this.isSyncing = false;
    await this.saveQueue();
    await this.saveLastSync();
    await this.saveStatus();
    console.log('🧹 SyncService tamamen temizlendi');
  }
}

// Singleton instance
export const syncService = new SyncService();

export default syncService;