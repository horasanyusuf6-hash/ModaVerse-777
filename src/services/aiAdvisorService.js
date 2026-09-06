// 📁 src/services/aiAdvisorService.js
// AI Danışman Servisi - Groq + Gemini API entegrasyonu

import AsyncStorage from '@react-native-async-storage/async-storage';

// API anahtarları (gerçekte .env dosyasında saklanmalı)
const GROQ_API_KEY = 'gsk_your_groq_api_key_here';
const GEMINI_API_KEY = 'your_gemini_api_key_here';

// API URL'leri
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

// Kullanım limitleri
const API_LIMITS = {
  groq: {
    daily: 1000,
    minute: 30,
    used: 0,
    lastReset: new Date().toDateString(),
  },
  gemini: {
    daily: 1500,
    minute: 60,
    used: 0,
    lastReset: new Date().toDateString(),
  },
};

class AIAdvisorService {
  constructor() {
    this.cache = {};
    this.lastCall = {};
  }

  /**
   * API limit kontrolü
   */
  async checkLimits(provider) {
    const limits = API_LIMITS[provider];
    const today = new Date().toDateString();
    
    // Günlük limit reset
    if (limits.lastReset !== today) {
      limits.used = 0;
      limits.lastReset = today;
    }
    
    // Dakika limit kontrolü
    const minuteKey = `${provider}_${Math.floor(Date.now() / 60000)}`;
    if (this.lastCall[minuteKey]) {
      if (this.lastCall[minuteKey] >= limits.minute) {
        return { available: false, reason: 'Dakika limiti aşıldı' };
      }
    } else {
      this.lastCall[minuteKey] = 0;
    }
    
    // Günlük limit kontrolü
    if (limits.used >= limits.daily) {
      return { available: false, reason: 'Günlük limit aşıldı' };
    }
    
    return { available: true };
  }

  /**
   * API çağrısını kaydet
   */
  recordCall(provider) {
    const limits = API_LIMITS[provider];
    limits.used += 1;
    
    const minuteKey = `${provider}_${Math.floor(Date.now() / 60000)}`;
    this.lastCall[minuteKey] = (this.lastCall[minuteKey] || 0) + 1;
  }

  /**
   * Groq API ile stil önerisi al
   */
  async getGroqAdvice(query) {
    const check = await this.checkLimits('groq');
    if (!check.available) {
      return { error: check.reason, fallback: true };
    }

    try {
      const response = await fetch(GROQ_API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${GROQ_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'mixtral-8x7b-32768',
          messages: [
            {
              role: 'system',
              content: `Sen bir moda danışmanısın. Kullanıcıya stil, kombin, marka ve moda trendleri hakkında yardımcı oluyorsun.
              Cevapların Türkçe, samimi, bilgilendirici ve pratik olmalı. Emoji kullanabilirsin.
              Marka isimleri verirken gerçek markaları referans al.
              Kombin önerileri yaparken parçaları tek tek açıkla.`
            },
            {
              role: 'user',
              content: query
            }
          ],
          temperature: 0.7,
          max_tokens: 500,
        }),
      });

      const data = await response.json();
      
      if (data.choices && data.choices[0]) {
        this.recordCall('groq');
        return { 
          advice: data.choices[0].message.content,
          provider: 'groq',
          usedFallback: false 
        };
      }
      
      return { error: 'Groq yanıt veremedi', fallback: true };
      
    } catch (error) {
      console.error('Groq API hatası:', error);
      return { error: error.message, fallback: true };
    }
  }

  /**
   * Gemini API ile stil önerisi al
   */
  async getGeminiAdvice(query) {
    const check = await this.checkLimits('gemini');
    if (!check.available) {
      return { error: check.reason, fallback: true };
    }

    try {
      const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `Sen bir moda danışmanısın. Kullanıcıya stil, kombin, marka ve moda trendleri hakkında yardımcı oluyorsun.
                  Cevapların Türkçe, samimi, bilgilendirici ve pratik olmalı. Emoji kullanabilirsin.
                  Marka isimleri verirken gerçek markaları referans al.
                  Kombin önerileri yaparken parçaları tek tek açıkla.
                  
                  Kullanıcı sorusu: ${query}`
                }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 500,
          },
        }),
      });

      const data = await response.json();
      
      if (data.candidates && data.candidates[0]) {
        this.recordCall('gemini');
        return { 
          advice: data.candidates[0].content.parts[0].text,
          provider: 'gemini',
          usedFallback: false 
        };
      }
      
      return { error: 'Gemini yanıt veremedi', fallback: true };
      
    } catch (error) {
      console.error('Gemini API hatası:', error);
      return { error: error.message, fallback: true };
    }
  }

  /**
   * Ana danışman metodu - Önce Groq, olmazsa Gemini
   */
  async getAdvice(query, preferredProvider = 'groq') {
    // Cache kontrolü
    const cacheKey = `${preferredProvider}_${query.toLowerCase().trim()}`;
    if (this.cache[cacheKey]) {
      const cached = this.cache[cacheKey];
      // 1 saatlik cache
      if (Date.now() - cached.timestamp < 3600000) {
        return cached.advice;
      }
    }

    let result;
    
    if (preferredProvider === 'groq') {
      result = await this.getGroqAdvice(query);
      if (result.fallback || result.error) {
        // Groq başarısız, Gemini'yi dene
        result = await this.getGeminiAdvice(query);
      }
    } else {
      result = await this.getGeminiAdvice(query);
      if (result.fallback || result.error) {
        // Gemini başarısız, Groq'yu dene
        result = await this.getGroqAdvice(query);
      }
    }

    // Hala başarısızsa, offline cevap üret
    if (result.fallback || result.error) {
      const offlineResponse = this.getOfflineAdvice(query);
      return `🔮 **ModaVerse AI Asistanı** (Offline Mod)\n\n${offlineResponse}\n\n⚠️ *AI servislerine şu an bağlanılamıyor. Online modda daha detaylı yanıt alabilirsin.*`;
    }

    // Cache'e kaydet
    this.cache[cacheKey] = {
      advice: result.advice,
      timestamp: Date.now(),
    };

    return result.advice;
  }

  /**
   * Offline modda çalışan basit cevap üretici
   */
  getOfflineAdvice(query) {
    const lowerQuery = query.toLowerCase();
    
    if (lowerQuery.includes('marka') || lowerQuery.includes('markalar')) {
      return `🛍️ **Popüler Marka Önerileri**

👔 **Lüks:** Vakko, Beymen, Louis Vuitton, Gucci
👕 **Sokak:** Mavi, Zara, H&M, LC Waikiki
♻️ **Sürdürülebilir:** Mavi, Koton, Marks & Spencer

📌 *Her markanın kendine özel tarzı var. Gardırobuna en uygun olanı seç!*`;
    }
    
    if (lowerQuery.includes('kombin') || lowerQuery.includes('giyim')) {
      return `👗 **Kombin Önerileri**

📅 **Günlük:** Basic tişört + Kot pantolon + Sneaker
💼 **Ofis:** Blazer ceket + Düz pantolon + Topuklu ayakkabı
🎯 **Davet:** Uzun elbise + Topuklu + Şık çanta
🏖️ **Tatil:** Midi elbise + Sandalet + Hasır çanta

📌 *Kombinini renk uyumuyla tamamla!*`;
    }
    
    if (lowerQuery.includes('stil') || lowerQuery.includes('tarz')) {
      return `🎨 **Stil İpuçları**

1. **Renk Uyumu:** Nötr renkler (siyah, beyaz, bej) ile renkli parçaları dengeleyin.
2. **Vücut Tipi:** Vücut tipinize uygun kesimleri seçin.
3. **Aksesuar:** Sade ama şık aksesuarlarla kombinizi tamamlayın.
4. **Mevsim:** Mevsime uygun kumaşlar tercih edin.
5. **Özgüven:** En önemli aksesuar özgüvendir!

📌 *Altın Kural: Gardırobunun %70'i temel, %30'u trend parçalar olsun.*`;
    }
    
    if (lowerQuery.includes('trend') || lowerQuery.includes('moda')) {
      return `📈 **2024-2025 Moda Trendleri**

🎨 **Renkler:** Mercan, lavanta, bordo, hardal
👗 **Silüet:** Oversized, asimetrik kesimler
🧵 **Kumaş:** Keten, tül, deri, kaşmir
👟 **Ayakkabı:** Platform sneaker, yarım topuk
👜 **Çanta:** Mini çantalar, file çantalar
💎 **Aksesuar:** Katmanlı kolyeler, büyük küpeler

📌 *Trendleri gardırobuna küçük dokunuşlarla ekle!*`;
    }
    
    return `🤖 **ModaVerse AI Asistanı**

Şu konularda yardımcı olabilirim:

🛍️ **Marka Önerileri** - "Bana marka öner"
👗 **Kombin Fikirleri** - "Kombin öner"
🎨 **Stil İpuçları** - "Stil önerisi ver"
📈 **Moda Trendleri** - "Trendleri söyle"

Sormak istediğin bir şey var mı? ✨`;
  }

  /**
   * Markaya özel stil önerisi
   */
  async getStyleAdvice(brandName, category = 'general') {
    const prompt = `Bana "${brandName}" markası hakkında stil önerileri ver.
    Bu marka ${category} kategorisinde.
    Hangi parçaları tercih etmeli, hangi renklerle kombin yapmalı,
    markanın karakteristik tarzı nedir detaylı açıkla.`;
    
    return await this.getAdvice(prompt);
  }

  /**
   * Hava durumuna göre giyim önerisi
   */
  async getWeatherBasedAdvice(city, temp, condition) {
    const prompt = `${city} şehrinde hava ${temp}°C ve ${condition} durumunda.
    Bu hava koşuluna göre nasıl giyinmeliyim? Detaylı ve pratik öneriler ver.`;
    
    return await this.getAdvice(prompt);
  }

  /**
   * API limit istatistikleri
   */
  getLimits() {
    const today = new Date().toDateString();
    return {
      groq: {
        daily: API_LIMITS.groq.daily,
        used: API_LIMITS.groq.used,
        remaining: API_LIMITS.groq.daily - API_LIMITS.groq.used,
        reset: API_LIMITS.groq.lastReset,
      },
      gemini: {
        daily: API_LIMITS.gemini.daily,
        used: API_LIMITS.gemini.used,
        remaining: API_LIMITS.gemini.daily - API_LIMITS.gemini.used,
        reset: API_LIMITS.gemini.lastReset,
      },
    };
  }

  /**
   * Servisi temizle (test amaçlı)
   */
  async clearCache() {
    this.cache = {};
    this.lastCall = {};
    await AsyncStorage.removeItem('@ai_cache');
  }

  /**
   * Cache'i kaydet
   */
  async saveCache() {
    try {
      await AsyncStorage.setItem('@ai_cache', JSON.stringify({
        cache: this.cache,
        timestamp: Date.now(),
      }));
    } catch (error) {
      console.error('Cache kaydetme hatası:', error);
    }
  }

  /**
   * Cache'i yükle
   */
  async loadCache() {
    try {
      const data = await AsyncStorage.getItem('@ai_cache');
      if (data) {
        const parsed = JSON.parse(data);
        this.cache = parsed.cache || {};
      }
    } catch (error) {
      console.error('Cache yükleme hatası:', error);
    }
  }
}

// Singleton instance
export const aiAdvisorService = new AIAdvisorService();

export default aiAdvisorService;