// 📁 src/utils/AIFabricClassifier.js - SADECE REVİZE
class AIFabricClassifier {
  constructor() {
    this.isInitialized = false;
    this.washRules = null;
    console.log('🤖 AI Fabric Classifier oluşturuldu');
  }

  // ✅ BAŞLATMA
  async init() {
    console.log('🔄 AI Mock modda başlatılıyor...');
    
    // WashRules'u yükle
    try {
      const WashRules = require('./WashRules').default;
      this.washRules = WashRules;
      console.log('✅ WashRules yüklendi');
    } catch (error) {
      console.error('❌ WashRules yüklenemedi:', error.message);
      this.washRules = this.getDefaultWashRules();
    }
    
    this.isInitialized = true;
    return true;
  }

  // ✅ VARSAYILAN YIKAMA KURALLARI
  getDefaultWashRules() {
    return {
      getWashAdvice: (fabric) => {
        const rules = {
          pamuk: { temperature: 40, program: 'Pamuklu', care: 'Makinede yıkanabilir' },
          ipek: { temperature: 30, program: 'Hassas', care: 'Kuru temizleme önerilir' },
          denim: { temperature: 40, program: 'Kot', care: 'Ters çevirerek yıkayın' },
          polyester: { temperature: 30, program: 'Sentetik', care: 'Düşük ısıda ütüleyin' },
          yün: { temperature: 30, program: 'Yünlü', care: 'Elde yıkama önerilir' }
        };
        return rules[fabric] || { temperature: 30, program: 'Hassas', care: 'Etiketi kontrol edin' };
      }
    };
  }

  // ✅ FOTOĞRAFTAN KUMAŞ TAHMİNİ - MOCK
  async classifyFabric(imageUri) {
    if (!this.isInitialized) {
      await this.init();
    }

    console.log('🔍 Görsel analiz ediliyor (mock):', imageUri ? imageUri.substring(0, 50) + '...' : 'null');
    
    // Mock tahmin döndür
    const mockResult = this.getMockPrediction();
    console.log('🤖 Mock tahmin:', mockResult);
    
    // Yıkama önerisi ekle
    const resultWithWash = this.getWashAdviceFromClassification(mockResult);
    
    return resultWithWash;
  }

  // ✅ MOCK TAHMİN SİSTEMİ
  getMockPrediction() {
    const fabrics = [
      { name: 'pamuk', confidence: 0.85, icon: '🌿', emoji: '👕' },
      { name: 'ipek', confidence: 0.78, icon: '🐛', emoji: '👗' },
      { name: 'denim', confidence: 0.92, icon: '👖', emoji: '👖' },
      { name: 'polyester', confidence: 0.67, icon: '🔬', emoji: '🧥' },
      { name: 'yün', confidence: 0.73, icon: '🐑', emoji: '🧣' }
    ];
    
    const randomFabric = fabrics[Math.floor(Math.random() * fabrics.length)];
    const confidencePercent = Math.round(randomFabric.confidence * 100);
    
    return {
      fabric: randomFabric.name,
      confidence: randomFabric.confidence,
      confidencePercent: confidencePercent,
      icon: randomFabric.icon,
      emoji: randomFabric.emoji,
      isMock: true,
      message: '🤖 Beta AI - Gerçek analiz yakında!',
      timestamp: new Date().toISOString()
    };
  }

  // ✅ YIKAMA ÖNERİSİ AL
  getWashAdviceFromClassification(result) {
    try {
      if (!this.washRules) {
        return result;
      }
      
      const washAdvice = this.washRules.getWashAdvice(result.fabric);
      
      return {
        ...result,
        washAdvice: {
          temperature: washAdvice.temperature || 30,
          program: washAdvice.program || 'Hassas',
          care: washAdvice.care || 'Etiketi kontrol edin',
        }
      };
    } catch (error) {
      console.error('❌ WashRules entegrasyon hatası:', error);
      return result;
    }
  }

  // ✅ BELİRLİ BİR KUMAŞ İÇİN TEST TAHMİNİ
  getPredictionForFabric(fabricName) {
    const fabrics = {
      pamuk: { name: 'pamuk', confidence: 0.95, icon: '🌿', emoji: '👕' },
      ipek: { name: 'ipek', confidence: 0.88, icon: '🐛', emoji: '👗' },
      denim: { name: 'denim', confidence: 0.97, icon: '👖', emoji: '👖' },
      polyester: { name: 'polyester', confidence: 0.85, icon: '🔬', emoji: '🧥' },
      yün: { name: 'yün', confidence: 0.90, icon: '🐑', emoji: '🧣' }
    };
    
    const fabric = fabrics[fabricName] || fabrics.pamuk;
    const result = {
      fabric: fabric.name,
      confidence: fabric.confidence,
      confidencePercent: Math.round(fabric.confidence * 100),
      icon: fabric.icon,
      emoji: fabric.emoji,
      isMock: true,
      message: '🤖 Test modu',
      timestamp: new Date().toISOString()
    };
    
    return this.getWashAdviceFromClassification(result);
  }

  // ✅ SABİT BİR TAHMİN DÖNDÜR (Test için)
  getFixedPrediction() {
    const result = {
      fabric: 'pamuk',
      confidence: 0.95,
      confidencePercent: 95,
      icon: '🌿',
      emoji: '👕',
      isMock: true,
      message: '🤖 Sabit test tahmini',
      timestamp: new Date().toISOString()
    };
    
    return this.getWashAdviceFromClassification(result);
  }
}

// ✅ SINGLETON INSTANCE
const fabricClassifier = new AIFabricClassifier();

// ✅ OTOMATİK BAŞLATMA
fabricClassifier.init().then(() => {
  console.log('🚀 AI Fabric Classifier hazır! (Mock mod)');
}).catch(error => {
  console.error('❌ AI Fabric Classifier başlatılamadı:', error);
});

export default fabricClassifier;