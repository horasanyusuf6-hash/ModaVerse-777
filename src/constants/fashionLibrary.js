// 📁 src/constants/fashionLibrary.js
// ModaVerse - Renk + Ürün + Kombin Veritabanı (Kapsamlı)

// ============================================================
// 1. RENK KOMBİNASYONLARI (60+ Renk)
// ============================================================
export const COLOR_COMBINATIONS = {
  // ----- ANA RENKLER (15) -----
  siyah: {
    hex: '#000000',
    matches: ['beyaz', 'gri', 'kırmızı', 'bordo', 'altın', 'bej', 'lacivert', 'hardal', 'mor', 'pembe'],
    style: 'Klasik, sofistike ve her duruma uygun.',
    season: 'Her mevsim',
    mood: 'Güçlü, şık, resmi'
  },
  beyaz: {
    hex: '#FFFFFF',
    matches: ['siyah', 'mavi', 'bej', 'krem', 'bordo', 'hardal', 'gri', 'yeşil', 'turuncu', 'pembe'],
    style: 'Temiz, ferah ve her renkle uyumlu.',
    season: 'İlkbahar, Yaz',
    mood: 'Saflık, huzur, ferahlık'
  },
  kırmızı: {
    hex: '#FF0000',
    matches: ['siyah', 'beyaz', 'bej', 'altın', 'lacivert', 'gri', 'bordo', 'hardal', 'mor'],
    style: 'Tutkulu, cesur ve dikkat çekici.',
    season: 'Kış, Sonbahar',
    mood: 'Tutku, cesaret, enerji'
  },
  mavi: {
    hex: '#0000FF',
    matches: ['beyaz', 'bej', 'gri', 'hardal', 'bordo', 'turuncu', 'pembe', 'mor', 'krem'],
    style: 'Huzurlu, güven veren ve profesyonel.',
    season: 'Her mevsim',
    mood: 'Huzur, güven, profesyonellik'
  },
  yeşil: {
    hex: '#008000',
    matches: ['bej', 'beyaz', 'hardal', 'bordo', 'kahverengi', 'siyah', 'gri', 'turuncu', 'krem'],
    style: 'Doğal, huzurlu ve taze.',
    season: 'İlkbahar, Sonbahar',
    mood: 'Doğa, huzur, denge'
  },
  sarı: {
    hex: '#FFFF00',
    matches: ['siyah', 'beyaz', 'mavi', 'gri', 'bordo', 'mor', 'yeşil', 'turuncu', 'bej'],
    style: 'Neşeli, enerjik ve dikkat çekici.',
    season: 'Yaz, İlkbahar',
    mood: 'Neşe, enerji, mutluluk'
  },
  turuncu: {
    hex: '#FFA500',
    matches: ['mavi', 'siyah', 'beyaz', 'bej', 'gri', 'bordo', 'hardal', 'mor', 'yeşil'],
    style: 'Canlı, sıcak ve enerjik.',
    season: 'Yaz, Sonbahar',
    mood: 'Enerji, canlılık, sıcaklık'
  },
  mor: {
    hex: '#800080',
    matches: ['altın', 'gümüş', 'siyah', 'beyaz', 'bej', 'gri', 'bordo', 'pembe', 'yeşil'],
    style: 'Yaratıcı, lüks ve mistik.',
    season: 'Kış, Sonbahar',
    mood: 'Yaratıcılık, lüks, mistisizm'
  },
  pembe: {
    hex: '#FFC0CB',
    matches: ['beyaz', 'bej', 'gri', 'siyah', 'mavi', 'mor', 'altın', 'gümüş', 'yeşil'],
    style: 'Feminen, tatlı ve romantik.',
    season: 'İlkbahar, Yaz',
    mood: 'Sevgi, feminenlik, masumiyet'
  },
  kahverengi: {
    hex: '#8B4513',
    matches: ['bej', 'beyaz', 'yeşil', 'turuncu', 'mavi', 'siyah', 'hardal', 'krem', 'haki'],
    style: 'Doğal, güvenilir ve toprak tonlu.',
    season: 'Her mevsim',
    mood: 'Toprak, güven, doğallık'
  },
  gri: {
    hex: '#808080',
    matches: ['siyah', 'beyaz', 'mavi', 'bordo', 'hardal', 'turuncu', 'mor', 'pembe', 'yeşil'],
    style: 'Nötr, modern ve sofistike.',
    season: 'Her mevsim',
    mood: 'Modern, nötr, sofistike'
  },
  bej: {
    hex: '#F5F5DC',
    matches: ['siyah', 'beyaz', 'bordo', 'lacivert', 'hardal', 'gri', 'kahverengi', 'yeşil', 'turuncu'],
    style: 'Nötr, sıcak ve zarif.',
    season: 'Her mevsim',
    mood: 'Zarif, sıcak, nötr'
  },
  bordo: {
    hex: '#800020',
    matches: ['hardal', 'bej', 'siyah', 'beyaz', 'gri', 'altın', 'lacivert', 'krem', 'yeşil'],
    style: 'Lüks, derin ve asil.',
    season: 'Kış, Sonbahar',
    mood: 'Lüks, derinlik, asalet'
  },
  hardal: {
    hex: '#FFDB58',
    matches: ['bordo', 'lacivert', 'siyah', 'bej', 'krem', 'gri', 'yeşil', 'turuncu', 'mor'],
    style: 'Sıcak, enerjik ve sonbahar tonu.',
    season: 'Sonbahar, Kış',
    mood: 'Sıcaklık, enerji, sonbahar'
  },
  lacivert: {
    hex: '#000080',
    matches: ['beyaz', 'bej', 'hardal', 'bordo', 'gri', 'siyah', 'turuncu', 'altın', 'krem'],
    style: 'Profesyonel, klasik ve zamansız.',
    season: 'Her mevsim',
    mood: 'Profesyonellik, klasik, güven'
  },

  // ----- PASTEL RENKLER (12) -----
  'pastel pembe': {
    hex: '#FFB6C1',
    matches: ['beyaz', 'bej', 'gri', 'mavi', 'mor', 'altın', 'gümüş', 'siyah', 'lacivert'],
    style: 'Tatlı, romantik ve feminen.',
    season: 'İlkbahar, Yaz',
    mood: 'Tatlılık, romantizm, feminenlik'
  },
  'pastel mavi': {
    hex: '#ADD8E6',
    matches: ['beyaz', 'bej', 'gri', 'pembe', 'mor', 'altın', 'gümüş', 'siyah', 'lacivert'],
    style: 'Huzurlu, sakin ve ferah.',
    season: 'İlkbahar, Yaz',
    mood: 'Huzur, sakinlik, ferahlık'
  },
  'pastel sarı': {
    hex: '#FFFACD',
    matches: ['beyaz', 'bej', 'gri', 'mavi', 'lacivert', 'mor', 'pembe', 'yeşil', 'siyah'],
    style: 'Neşeli, ışıltılı ve yumuşak.',
    season: 'İlkbahar, Yaz',
    mood: 'Neşe, ışıltı, yumuşaklık'
  },
  'pastel yeşil': {
    hex: '#98FF98',
    matches: ['beyaz', 'bej', 'gri', 'pembe', 'mor', 'altın', 'gümüş', 'siyah', 'bordo'],
    style: 'Taze, doğal ve huzurlu.',
    season: 'İlkbahar, Yaz',
    mood: 'Tazelik, doğa, huzur'
  },
  'pastel mor': {
    hex: '#D8BFD8',
    matches: ['beyaz', 'bej', 'gri', 'pembe', 'mavi', 'altın', 'gümüş', 'siyah', 'lacivert'],
    style: 'Narin, yaratıcı ve mistik.',
    season: 'İlkbahar, Yaz',
    mood: 'Narinlik, yaratıcılık, mistisizm'
  },
  'pastel turuncu': {
    hex: '#FFDAB9',
    matches: ['beyaz', 'bej', 'gri', 'mavi', 'lacivert', 'mor', 'pembe', 'yeşil', 'siyah'],
    style: 'Sıcak, yumuşak ve dostane.',
    season: 'Yaz, Sonbahar',
    mood: 'Sıcaklık, dostluk, yumuşaklık'
  },
  lavanta: {
    hex: '#E6E6FA',
    matches: ['beyaz', 'bej', 'gri', 'mor', 'pembe', 'altın', 'gümüş', 'siyah', 'lacivert'],
    style: 'Rahatlatıcı, sofistike ve feminen.',
    season: 'İlkbahar, Yaz',
    mood: 'Rahatlama, sofistikasyon, feminenlik'
  },
  'nane yeşili': {
    hex: '#98FF98',
    matches: ['beyaz', 'bej', 'gri', 'pembe', 'mor', 'altın', 'gümüş', 'siyah', 'bordo'],
    style: 'Ferahlatıcı, taze ve doğal.',
    season: 'İlkbahar, Yaz',
    mood: 'Ferahlık, tazelik, doğa'
  },
  şeftali: {
    hex: '#FFDAB9',
    matches: ['beyaz', 'bej', 'gri', 'mavi', 'lacivert', 'mor', 'pembe', 'yeşil', 'altın'],
    style: 'Sıcak, yumuşak ve samimi.',
    season: 'Yaz, İlkbahar',
    mood: 'Sıcaklık, samimiyet, yumuşaklık'
  },
  leylak: {
    hex: '#C8A2C8',
    matches: ['beyaz', 'bej', 'gri', 'mor', 'pembe', 'altın', 'gümüş', 'siyah', 'lacivert'],
    style: 'Narin, romantik ve sofistike.',
    season: 'İlkbahar, Yaz',
    mood: 'Narinlik, romantizm, sofistikasyon'
  },
  'gül kurusu': {
    hex: '#FFD1DC',
    matches: ['beyaz', 'bej', 'gri', 'mavi', 'lacivert', 'mor', 'pembe', 'yeşil', 'altın'],
    style: 'Tatlı, romantik ve feminen.',
    season: 'İlkbahar, Yaz',
    mood: 'Tatlılık, romantizm, feminenlik'
  },
  fildişi: {
    hex: '#FFFFF0',
    matches: ['siyah', 'beyaz', 'bej', 'bordo', 'lacivert', 'hardal', 'altın', 'gümüş', 'gri'],
    style: 'Zarif, sıcak ve nötr.',
    season: 'Her mevsim',
    mood: 'Zarafet, sıcaklık, nötrlük'
  },

  // ----- TOPRAK TONLARI (10) -----
  haki: {
    hex: '#6B8E23',
    matches: ['bej', 'krem', 'kahverengi', 'hardal', 'bordo', 'siyah', 'beyaz', 'gri', 'turuncu'],
    style: 'Doğal, askeri ve toprak tonlu.',
    season: 'Sonbahar, Kış',
    mood: 'Doğallık, askeri ruh, toprak'
  },
  biberiye: {
    hex: '#6F8B5E',
    matches: ['bej', 'krem', 'kahverengi', 'hardal', 'bordo', 'siyah', 'beyaz', 'gri', 'turuncu'],
    style: 'Doğal, huzurlu ve toprak tonlu.',
    season: 'Sonbahar, Kış',
    mood: 'Doğallık, huzur, toprak'
  },
  kestane: {
    hex: '#5C4033',
    matches: ['bej', 'krem', 'hardal', 'bordo', 'siyah', 'beyaz', 'gri', 'turuncu', 'yeşil'],
    style: 'Sıcak, zengin ve toprak tonlu.',
    season: 'Sonbahar, Kış',
    mood: 'Sıcaklık, zenginlik, toprak'
  },
  kül: {
    hex: '#5E5E5E',
    matches: ['siyah', 'beyaz', 'gri', 'bej', 'bordo', 'lacivert', 'hardal', 'turuncu', 'mor'],
    style: 'Modern, nötr ve sofistike.',
    season: 'Her mevsim',
    mood: 'Modern, nötr, sofistikasyon'
  },
  kum: {
    hex: '#C2B280',
    matches: ['beyaz', 'bej', 'krem', 'lacivert', 'bordo', 'hardal', 'siyah', 'gri', 'yeşil'],
    style: 'Sıcak, doğal ve nötr.',
    season: 'Yaz, İlkbahar',
    mood: 'Sıcaklık, doğallık, nötrlük'
  },
  'çam yeşili': {
    hex: '#1E4D2B',
    matches: ['bej', 'krem', 'hardal', 'bordo', 'siyah', 'beyaz', 'gri', 'turuncu', 'kahverengi'],
    style: 'Derin, doğal ve kış tonu.',
    season: 'Kış, Sonbahar',
    mood: 'Derinlik, doğa, kış'
  },
  zeytin: {
    hex: '#808000',
    matches: ['bej', 'krem', 'kahverengi', 'hardal', 'bordo', 'siyah', 'beyaz', 'gri', 'turuncu'],
    style: 'Doğal, askeri ve toprak tonlu.',
    season: 'Sonbahar, Kış',
    mood: 'Doğallık, askeri ruh, toprak'
  },
  'hardal sarısı': {
    hex: '#FFDB58',
    matches: ['bordo', 'lacivert', 'siyah', 'bej', 'krem', 'gri', 'yeşil', 'turuncu', 'mor'],
    style: 'Sıcak, enerjik ve sonbahar tonu.',
    season: 'Sonbahar, Kış',
    mood: 'Sıcaklık, enerji, sonbahar'
  },
  'toprak kahve': {
    hex: '#6B3A2A',
    matches: ['bej', 'krem', 'hardal', 'bordo', 'siyah', 'beyaz', 'gri', 'turuncu', 'yeşil'],
    style: 'Sıcak, doğal ve güvenilir.',
    season: 'Sonbahar, Kış',
    mood: 'Sıcaklık, doğallık, güven'
  },
  'koyu yeşil': {
    hex: '#1B4D3E',
    matches: ['bej', 'krem', 'hardal', 'bordo', 'siyah', 'beyaz', 'gri', 'turuncu', 'kahverengi'],
    style: 'Derin, doğal ve sofistike.',
    season: 'Kış, Sonbahar',
    mood: 'Derinlik, doğa, sofistikasyon'
  },

  // ----- METALİK RENKLER (4) -----
  altın: {
    hex: '#FFD700',
    matches: ['siyah', 'beyaz', 'bordo', 'mor', 'lacivert', 'kırmızı', 'yeşil', 'mavi', 'hardal'],
    style: 'Lüks, gösterişli ve kraliyet.',
    season: 'Kış, Sonbahar',
    mood: 'Lüks, gösteriş, başarı'
  },
  gümüş: {
    hex: '#C0C0C0',
    matches: ['siyah', 'beyaz', 'mavi', 'mor', 'gri', 'bordo', 'kırmızı', 'turuncu', 'yeşil'],
    style: 'Modern, soğuk ve teknolojik.',
    season: 'Kış, Sonbahar',
    mood: 'Modern, teknoloji, soğuk'
  },
  bronz: {
    hex: '#CD7F32',
    matches: ['siyah', 'beyaz', 'bej', 'bordo', 'yeşil', 'mavi', 'lacivert', 'mor', 'hardal'],
    style: 'Sıcak, zengin ve toprak tonlu.',
    season: 'Sonbahar, Kış',
    mood: 'Sıcaklık, zenginlik, toprak'
  },
  bakır: {
    hex: '#B87333',
    matches: ['siyah', 'beyaz', 'bej', 'bordo', 'yeşil', 'mavi', 'lacivert', 'mor', 'hardal'],
    style: 'Sıcak, parlak ve dikkat çekici.',
    season: 'Sonbahar, Kış',
    mood: 'Sıcaklık, parlaklık, dikkat çekicilik'
  },

  // ----- FLUO RENKLER (4) -----
  'fluo turuncu': {
    hex: '#FF6600',
    matches: ['siyah', 'beyaz', 'gri', 'mavi', 'lacivert', 'mor', 'turuncu', 'bej'],
    style: 'Enerjik, dikkat çekici ve modern.',
    season: 'Yaz',
    mood: 'Enerji, dikkat çekicilik, modern'
  },
  'fluo yeşil': {
    hex: '#00FF00',
    matches: ['siyah', 'beyaz', 'gri', 'mor', 'pembe', 'mavi', 'turuncu', 'bej'],
    style: 'Enerjik, dikkat çekici ve canlı.',
    season: 'Yaz',
    mood: 'Enerji, canlılık, dikkat çekicilik'
  },
  'fluo pembe': {
    hex: '#FF1493',
    matches: ['siyah', 'beyaz', 'gri', 'mavi', 'turuncu', 'yeşil', 'mor', 'bej'],
    style: 'Enerjik, dikkat çekici ve feminen.',
    season: 'Yaz',
    mood: 'Enerji, feminenlik, dikkat çekicilik'
  },
  'fluo sarı': {
    hex: '#FFFF00',
    matches: ['siyah', 'beyaz', 'gri', 'mavi', 'lacivert', 'bordo', 'mor', 'bej'],
    style: 'Enerjik, dikkat çekici ve neşeli.',
    season: 'Yaz',
    mood: 'Enerji, neşe, dikkat çekicilik'
  },

  // ----- KOYU / DERİN RENKLER (8) -----
  'koyu mavi': {
    hex: '#1A1A5E',
    matches: ['beyaz', 'bej', 'hardal', 'bordo', 'gri', 'siyah', 'turuncu', 'altın'],
    style: 'Derin, profesyonel ve klasik.',
    season: 'Kış, Sonbahar',
    mood: 'Derinlik, profesyonellik, klasik'
  },
  'koyu kırmızı': {
    hex: '#8B0000',
    matches: ['bej', 'siyah', 'beyaz', 'hardal', 'gri', 'altın', 'lacivert', 'krem'],
    style: 'Derin, tutkulu ve dramatik.',
    season: 'Kış, Sonbahar',
    mood: 'Tutku, derinlik, drama'
  },
  'koyu mor': {
    hex: '#4B0082',
    matches: ['altın', 'gümüş', 'siyah', 'beyaz', 'bej', 'gri', 'bordo', 'pembe'],
    style: 'Derin, lüks ve mistik.',
    season: 'Kış, Sonbahar',
    mood: 'Lüks, derinlik, mistisizm'
  },
  'koyu gri': {
    hex: '#404040',
    matches: ['siyah', 'beyaz', 'mavi', 'bordo', 'hardal', 'turuncu', 'mor', 'pembe'],
    style: 'Modern, nötr ve sofistike.',
    season: 'Her mevsim',
    mood: 'Modern, nötr, sofistikasyon'
  },
  'koyu kahverengi': {
    hex: '#3B1F0B',
    matches: ['bej', 'krem', 'hardal', 'bordo', 'siyah', 'beyaz', 'gri', 'turuncu'],
    style: 'Sıcak, doğal ve güvenilir.',
    season: 'Sonbahar, Kış',
    mood: 'Sıcaklık, doğallık, güven'
  },
  'koyu pembe': {
    hex: '#C71585',
    matches: ['siyah', 'beyaz', 'bej', 'gri', 'mavi', 'mor', 'altın', 'gümüş'],
    style: 'Derin, romantik ve feminen.',
    season: 'Kış, Sonbahar',
    mood: 'Romantizm, derinlik, feminenlik'
  },
  'koyu turuncu': {
    hex: '#CC5500',
    matches: ['siyah', 'beyaz', 'bej', 'gri', 'mavi', 'lacivert', 'mor', 'yeşil'],
    style: 'Sıcak, enerjik ve sonbahar tonu.',
    season: 'Sonbahar, Kış',
    mood: 'Sıcaklık, enerji, sonbahar'
  },

  // ----- NÖTR / AÇIK RENKLER (8) -----
  krem: {
    hex: '#FFFDD0',
    matches: ['siyah', 'beyaz', 'bej', 'bordo', 'lacivert', 'hardal', 'altın', 'gümüş'],
    style: 'Sıcak, zarif ve nötr.',
    season: 'Her mevsim',
    mood: 'Sıcaklık, zarafet, nötrlük'
  },
  'açık gri': {
    hex: '#D3D3D3',
    matches: ['siyah', 'beyaz', 'mavi', 'bordo', 'hardal', 'turuncu', 'mor', 'pembe'],
    style: 'Nötr, modern ve ferah.',
    season: 'Her mevsim',
    mood: 'Modern, nötr, ferahlık'
  },
  'açık mavi': {
    hex: '#87CEEB',
    matches: ['beyaz', 'bej', 'gri', 'pembe', 'mor', 'altın', 'gümüş', 'siyah'],
    style: 'Huzurlu, ferah ve yaz tonu.',
    season: 'İlkbahar, Yaz',
    mood: 'Huzur, ferahlık, yaz'
  },
  'açık yeşil': {
    hex: '#90EE90',
    matches: ['beyaz', 'bej', 'gri', 'pembe', 'mor', 'altın', 'gümüş', 'siyah'],
    style: 'Taze, doğal ve huzurlu.',
    season: 'İlkbahar, Yaz',
    mood: 'Tazelik, doğa, huzur'
  },
  'açık pembe': {
    hex: '#FFB6C1',
    matches: ['beyaz', 'bej', 'gri', 'mavi', 'mor', 'altın', 'gümüş', 'siyah'],
    style: 'Tatlı, romantik ve feminen.',
    season: 'İlkbahar, Yaz',
    mood: 'Tatlılık, romantizm, feminenlik'
  },
  'açık mor': {
    hex: '#D8BFD8',
    matches: ['beyaz', 'bej', 'gri', 'pembe', 'mavi', 'altın', 'gümüş', 'siyah'],
    style: 'Narin, yaratıcı ve mistik.',
    season: 'İlkbahar, Yaz',
    mood: 'Narinlik, yaratıcılık, mistisizm'
  },
  'açık kahverengi': {
    hex: '#D2B48C',
    matches: ['beyaz', 'bej', 'krem', 'bordo', 'lacivert', 'hardal', 'siyah', 'gri'],
    style: 'Sıcak, doğal ve nötr.',
    season: 'Her mevsim',
    mood: 'Sıcaklık, doğallık, nötrlük'
  },
  'açık turuncu': {
    hex: '#FFB07C',
    matches: ['beyaz', 'bej', 'gri', 'mavi', 'lacivert', 'mor', 'pembe', 'yeşil'],
    style: 'Sıcak, yumuşak ve dostane.',
    season: 'Yaz, İlkbahar',
    mood: 'Sıcaklık, dostluk, yumuşaklık'
  }
};

// ============================================================
// 2. KADIN GİYİM - ÜRÜN VERİTABANI (153 Ana Ürün + Varyasyonlar)
// ============================================================
export const WOMEN_CLOTHING = {
  // ----- ETEKLER (18 Ana + 50+ Varyasyon) -----
  etekler: {
    'kalem etek': {
      variations: ['diz altı', 'diz üstü', 'yırtmaçlı', 'ön yırtmaçlı', 'yan yırtmaçlı', 'arkası yırtmaçlı', 'dar kesim'],
      season: 'Her mevsim',
      occasions: ['Ofis', 'Günlük', 'İş toplantısı']
    },
    'pilili etek': {
      variations: ['kısa pilili', 'uzun pilili', 'akordeon pilili', 'düz pilili', 'çapraz pilili'],
      season: 'İlkbahar, Sonbahar',
      occasions: ['Günlük', 'Okul', 'Seyahat']
    },
    'a kesim etek': {
      variations: ['mini', 'midi', 'maksi', 'diz üstü'],
      season: 'Her mevsim',
      occasions: ['Günlük', 'Ofis', 'Seyahat']
    },
    'daire etek': {
      variations: ['kısa', 'uzun', 'katmanlı', 'mini', 'midi', 'maksi'],
      season: 'Yaz, İlkbahar',
      occasions: ['Plaj', 'Günlük', 'Parti']
    },
    'kumaş etek': {
      variations: ['mini', 'midi', 'maksi', 'yırtmaçlı', 'drapeli'],
      season: 'Her mevsim',
      occasions: ['Ofis', 'Günlük', 'Seyahat']
    },
    'dar etek': {
      variations: ['kalem', 'balıkçı', 'mini', 'midi'],
      season: 'Her mevsim',
      occasions: ['Ofis', 'Gece', 'Davet']
    },
    'kloş etek': {
      variations: ['midi', 'maksi', 'diz altı'],
      season: 'İlkbahar, Yaz',
      occasions: ['Günlük', 'Plaj', 'Seyahat']
    },
    'wrap etek': {
      variations: ['mini', 'midi', 'maksi', 'çapraz', 'asimetrik'],
      season: 'Her mevsim',
      occasions: ['Günlük', 'Seyahat', 'Plaj']
    },
    'kot etek': {
      variations: ['mini', 'midi', 'maksi', 'yırtmaçlı', 'yıkama', 'sökük'],
      season: 'İlkbahar, Yaz',
      occasions: ['Günlük', 'Okul', 'Seyahat']
    },
    'tül etek': {
      variations: ['katmanlı', 'uzun', 'kısa', 'midi', 'maksi'],
      season: 'İlkbahar, Yaz',
      occasions: ['Parti', 'Davet', 'Özel gün']
    },
    'kargo etek': {
      variations: ['mini', 'midi', 'cepli', 'kamuflaj'],
      season: 'İlkbahar, Sonbahar',
      occasions: ['Günlük', 'Seyahat', 'Kamp']
    },
    'saten etek': {
      variations: ['midi', 'maksi', 'parlak', 'mat'],
      season: 'Yaz, İlkbahar',
      occasions: ['Davet', 'Gece', 'Özel gün']
    },
    'kadife etek': {
      variations: ['mini', 'midi', 'maksi'],
      season: 'Kış, Sonbahar',
      occasions: ['Kış günleri', 'Parti', 'Ofis']
    },
    'deri etek': {
      variations: ['mini', 'midi', 'kalem', 'a kesim'],
      season: 'Kış, Sonbahar',
      occasions: ['Gece', 'Konser', 'Sokak']
    },
    'jersey etek': {
      variations: ['midi', 'maksi', 'drapeli'],
      season: 'Her mevsim',
      occasions: ['Günlük', 'Seyahat', 'Plaj']
    },
    'biker etek': {
      variations: ['mini', 'midi', 'deri', 'fermuarlı'],
      season: 'Kış, Sonbahar',
      occasions: ['Sokak', 'Konser', 'Gece']
    },
    'asimetrik etek': {
      variations: ['mini', 'midi', 'maksi'],
      season: 'Her mevsim',
      occasions: ['Günlük', 'Davet', 'Özel gün']
    },
    'fiyonk etek': {
      variations: ['mini', 'midi', 'beli fiyonklu'],
      season: 'İlkbahar, Yaz',
      occasions: ['Günlük', 'Romantik buluşma']
    }
  },

  // ----- T-SHIRTLER (15 Ana + 40+ Varyasyon) -----
  tshirtler: {
    'basic t-shirt': {
      variations: ['kısa kol', 'uzun kol', '3/4 kol', 'relax fit'],
      season: 'Her mevsim',
      occasions: ['Günlük', 'Spor', 'Seyahat']
    },
    'oversize t-shirt': {
      variations: ['kısa kol', 'uzun kol', 'drop shoulder'],
      season: 'Her mevsim',
      occasions: ['Günlük', 'Sokak', 'Seyahat']
    },
    'body t-shirt': {
      variations: ['kısa kol', 'uzun kol', 'v yaka', 'yuvarlak yaka'],
      season: 'Her mevsim',
      occasions: ['Günlük', 'Ofis', 'Seyahat']
    },
    'crop t-shirt': {
      variations: ['kısa kol', 'uzun kol', '3/4 kol', 'kare kesim'],
      season: 'Yaz, İlkbahar',
      occasions: ['Plaj', 'Günlük', 'Parti']
    },
    'baskılı t-shirt': {
      variations: ['kısa kol', 'uzun kol', 'slogan', 'logo', 'desenli'],
      season: 'Her mevsim',
      occasions: ['Günlük', 'Sokak', 'Konser']
    },
    'sıfır kol t-shirt': {
      variations: ['kolsuz', 'askılı', 'yaka detaylı'],
      season: 'Yaz',
      occasions: ['Plaj', 'Günlük', 'Spor']
    },
    'v yaka t-shirt': {
      variations: ['kısa kol', 'uzun kol', '3/4 kol'],
      season: 'Her mevsim',
      occasions: ['Günlük', 'Ofis', 'Seyahat']
    },
    'polka t-shirt': {
      variations: ['kısa kol', 'uzun kol', 'küçük desen', 'büyük desen'],
      season: 'İlkbahar, Yaz',
      occasions: ['Günlük', 'Plaj', 'Seyahat']
    },
    'çizgili t-shirt': {
      variations: ['kısa kol', 'uzun kol', 'ince çizgi', 'kalın çizgi'],
      season: 'Her mevsim',
      occasions: ['Günlük', 'Seyahat', 'Plaj']
    },
    'kareli t-shirt': {
      variations: ['kısa kol', 'uzun kol', 'ekose'],
      season: 'Sonbahar, Kış',
      occasions: ['Günlük', 'Okul', 'Seyahat']
    },
    'ribana t-shirt': {
      variations: ['kısa kol', 'uzun kol', 'dar kesim'],
      season: 'Her mevsim',
      occasions: ['Günlük', 'Ofis', 'Spor']
    },
    'asimetrik t-shirt': {
      variations: ['kısa kol', 'uzun kol', 'tek omuz'],
      season: 'Her mevsim',
      occasions: ['Günlük', 'Parti', 'Seyahat']
    },
    'drapeli t-shirt': {
      variations: ['kısa kol', 'uzun kol'],
      season: 'Her mevsim',
      occasions: ['Günlük', 'Ofis', 'Seyahat']
    },
    'rengarenk t-shirt': {
      variations: ['kısa kol', 'uzun kol', 'blok renk'],
      season: 'Yaz, İlkbahar',
      occasions: ['Günlük', 'Plaj', 'Parti']
    },
    'vintage t-shirt': {
      variations: ['kısa kol', 'uzun kol', 'yıkama', 'sökük'],
      season: 'Her mevsim',
      occasions: ['Günlük', 'Sokak', 'Konser']
    }
  },

  // ----- BLUZLAR (20 Ana + 50+ Varyasyon) -----
  bluzlar: {
    'klasik bluz': {
      variations: ['uzun kol', 'kısa kol', '3/4 kol', 'v yaka', 'yuvarlak yaka'],
      season: 'Her mevsim',
      occasions: ['Ofis', 'Günlük', 'Seyahat']
    },
    'ofis bluzu': {
      variations: ['uzun kol', 'kısa kol', 'klasik', 'drapeli'],
      season: 'Her mevsim',
      occasions: ['Ofis', 'İş toplantısı']
    },
    'şifon bluz': {
      variations: ['uzun kol', 'kısa kol', '3/4 kol', 'drapeli', 'fiyonklu'],
      season: 'İlkbahar, Yaz',
      occasions: ['Günlük', 'Romantik buluşma', 'Seyahat']
    },
    'ipek bluz': {
      variations: ['uzun kol', 'kısa kol', 'klasik', 'v yaka'],
      season: 'Her mevsim',
      occasions: ['Özel gün', 'Davet', 'Ofis']
    },
    'fiyonk bluz': {
      variations: ['uzun kol', 'kısa kol', 'büyük fiyonk', 'küçük fiyonk'],
      season: 'İlkbahar, Yaz',
      occasions: ['Günlük', 'Romantik buluşma']
    },
    'drapeli bluz': {
      variations: ['uzun kol', 'kısa kol', 'tek omuz', 'çapraz'],
      season: 'Her mevsim',
      occasions: ['Davet', 'Gece', 'Özel gün']
    },
    'abiye bluz': {
      variations: ['uzun kol', 'kısa kol', 'kolsuz', 'payetli', 'parlak'],
      season: 'Kış, Sonbahar',
      occasions: ['Davet', 'Gece', 'Özel gün']
    },
    'günlük bluz': {
      variations: ['uzun kol', 'kısa kol', '3/4 kol'],
      season: 'Her mevsim',
      occasions: ['Günlük', 'Seyahat', 'Okul']
    },
    'romantik bluz': {
      variations: ['uzun kol', 'kısa kol', '3/4 kol', 'dantelli', 'file'],
      season: 'İlkbahar, Yaz',
      occasions: ['Romantik buluşma', 'Günlük']
    },
    'dantelli bluz': {
      variations: ['uzun kol', 'kısa kol', '3/4 kol'],
      season: 'İlkbahar, Yaz',
      occasions: ['Günlük', 'Romantik buluşma']
    },
    'kadife bluz': {
      variations: ['uzun kol', 'kısa kol'],
      season: 'Kış, Sonbahar',
      occasions: ['Kış günleri', 'Parti', 'Ofis']
    },
    'deri bluz': {
      variations: ['uzun kol', 'kısa kol', 'fermuarlı'],
      season: 'Kış, Sonbahar',
      occasions: ['Gece', 'Konser', 'Sokak']
    },
    'plise bluz': {
      variations: ['uzun kol', 'kısa kol', '3/4 kol'],
      season: 'Her mevsim',
      occasions: ['Günlük', 'Ofis', 'Seyahat']
    },
    'asimetrik bluz': {
      variations: ['uzun kol', 'kısa kol', 'tek omuz'],
      season: 'Her mevsim',
      occasions: ['Günlük', 'Parti', 'Seyahat']
    },
    'balıkçı bluz': {
      variations: ['uzun kol', 'v yaka', 'yuvarlak yaka'],
      season: 'Kış, Sonbahar',
      occasions: ['Kış günleri', 'Ofis', 'Günlük']
    },
    'kesim bluz': {
      variations: ['uzun kol', 'kısa kol', 'farklı kesim'],
      season: 'Her mevsim',
      occasions: ['Günlük', 'Seyahat']
    },
    'ekose bluz': {
      variations: ['uzun kol', 'kısa kol'],
      season: 'Sonbahar, Kış',
      occasions: ['Günlük', 'Okul', 'Seyahat']
    },
    'çiçek bluz': {
      variations: ['uzun kol', 'kısa kol', '3/4 kol'],
      season: 'İlkbahar, Yaz',
      occasions: ['Günlük', 'Plaj', 'Seyahat']
    },
    'saten bluz': {
      variations: ['uzun kol', 'kısa kol', 'parlak'],
      season: 'Her mevsim',
      occasions: ['Davet', 'Gece', 'Özel gün']
    },
    'krep bluz': {
      variations: ['uzun kol', 'kısa kol', '3/4 kol'],
      season: 'Her mevsim',
      occasions: ['Günlük', 'Ofis', 'Seyahat']
    }
  },

  // ----- GÖMLEKLER (15 Ana + 35+ Varyasyon) -----
  gömlekler: {
    'klasik gömlek': {
      variations: ['uzun kol', 'kısa kol', '3/4 kol', 'v yaka', 'yuvarlak yaka'],
      season: 'Her mevsim',
      occasions: ['Ofis', 'İş toplantısı', 'Günlük']
    },
    'oversize gömlek': {
      variations: ['uzun kol', 'kısa kol', 'drop shoulder'],
      season: 'Her mevsim',
      occasions: ['Günlük', 'Sokak', 'Seyahat']
    },
    'ipek gömlek': {
      variations: ['uzun kol', 'kısa kol', 'v yaka'],
      season: 'Her mevsim',
      occasions: ['Özel gün', 'Davet', 'Ofis']
    },
    'denim gömlek': {
      variations: ['uzun kol', 'kısa kol', 'yıkama'],
      season: 'İlkbahar, Sonbahar',
      occasions: ['Günlük', 'Seyahat', 'Okul']
    },
    'çizgili gömlek': {
      variations: ['uzun kol', 'kısa kol', 'ince çizgi', 'kalın çizgi'],
      season: 'Her mevsim',
      occasions: ['Ofis', 'Günlük', 'Seyahat']
    },
    'kadife gömlek': {
      variations: ['uzun kol'],
      season: 'Kış, Sonbahar',
      occasions: ['Kış günleri', 'Parti', 'Ofis']
    },
    'asimetrik gömlek': {
      variations: ['uzun kol', 'kısa kol'],
      season: 'Her mevsim',
      occasions: ['Günlük', 'Parti', 'Seyahat']
    },
    'elbise gömlek': {
      variations: ['uzun kol', 'kısa kol', 'bel kemerli'],
      season: 'İlkbahar, Yaz',
      occasions: ['Günlük', 'Plaj', 'Seyahat']
    },
    'ofis gömleği': {
      variations: ['uzun kol', 'kısa kol', 'klasik'],
      season: 'Her mevsim',
      occasions: ['Ofis', 'İş toplantısı']
    },
    'kareli gömlek': {
      variations: ['uzun kol', 'kısa kol', 'ekose'],
      season: 'Sonbahar, Kış',
      occasions: ['Günlük', 'Okul', 'Seyahat']
    },
    'saten gömlek': {
      variations: ['uzun kol', 'kısa kol', 'parlak'],
      season: 'Her mevsim',
      occasions: ['Davet', 'Gece', 'Özel gün']
    },
    'yırtmaç gömlek': {
      variations: ['uzun kol', 'kısa kol'],
      season: 'Her mevsim',
      occasions: ['Günlük', 'Parti', 'Seyahat']
    },
    'fiyonk gömlek': {
      variations: ['uzun kol', 'kısa kol'],
      season: 'İlkbahar, Yaz',
      occasions: ['Günlük', 'Romantik buluşma']
    },
    'ribana gömlek': {
      variations: ['uzun kol', 'kısa kol'],
      season: 'Her mevsim',
      occasions: ['Günlük', 'Ofis', 'Seyahat']
    },
    'kırışık gömlek': {
      variations: ['uzun kol', 'kısa kol', '3/4 kol'],
      season: 'Her mevsim',
      occasions: ['Günlük', 'Seyahat', 'Plaj']
    }
  },

  // ----- PANTOLONLAR (20 Ana + 50+ Varyasyon) -----
  pantolonlar: {
    'dar pantolon': {
      variations: ['diz altı', 'tam boy', '7/8', '9/10', 'crop'],
      season: 'Her mevsim',
      occasions: ['Ofis', 'Günlük', 'Seyahat']
    },
    'bol pantolon': {
      variations: ['diz altı', 'tam boy', '7/8', '9/10'],
      season: 'Her mevsim',
      occasions: ['Günlük', 'Seyahat', 'Plaj']
    },
    'kumaş pantolon': {
      variations: ['diz altı', 'tam boy', '7/8', '9/10'],
      season: 'Her mevsim',
      occasions: ['Ofis', 'Günlük', 'Seyahat']
    },
    'kot pantolon': {
      variations: ['dar', 'bol', 'straight', 'flare', 'skinny', 'boyfriend', 'mom'],
      season: 'Her mevsim',
      occasions: ['Günlük', 'Seyahat', 'Okul']
    },
    'palazo pantolon': {
      variations: ['tam boy', '7/8', '9/10', 'drapeli'],
      season: 'Yaz, İlkbahar',
      occasions: ['Günlük', 'Ofis', 'Seyahat']
    },
    'jogger pantolon': {
      variations: ['diz altı', 'tam boy', '7/8'],
      season: 'Her mevsim',
      occasions: ['Spor', 'Günlük', 'Seyahat']
    },
    'kargo pantolon': {
      variations: ['diz altı', 'tam boy', '7/8', 'cepli'],
      season: 'İlkbahar, Sonbahar',
      occasions: ['Kamp', 'Seyahat', 'Günlük']
    },
    'deri pantolon': {
      variations: ['dar', 'bol', '7/8', 'tam boy'],
      season: 'Kış, Sonbahar',
      occasions: ['Gece', 'Konser', 'Sokak']
    },
    'kadife pantolon': {
      variations: ['dar', 'bol', '7/8', 'tam boy'],
      season: 'Kış, Sonbahar',
      occasions: ['Kış günleri', 'Parti', 'Ofis']
    },
    'asimetrik pantolon': {
      variations: ['tam boy', '7/8', '9/10'],
      season: 'Her mevsim',
      occasions: ['Günlük', 'Parti', 'Seyahat']
    },
    'krep pantolon': {
      variations: ['tam boy', '7/8', '9/10'],
      season: 'Her mevsim',
      occasions: ['Ofis', 'Günlük', 'Seyahat']
    },
    'saten pantolon': {
      variations: ['tam boy', '7/8', '9/10'],
      season: 'Her mevsim',
      occasions: ['Davet', 'Gece', 'Özel gün']
    },
    'flare pantolon': {
      variations: ['tam boy', '7/8'],
      season: 'Her mevsim',
      occasions: ['Günlük', 'Parti', 'Seyahat']
    },
    'mom jeans': {
      variations: ['7/8', 'tam boy', 'yıkama'],
      season: 'Her mevsim',
      occasions: ['Günlük', 'Okul', 'Seyahat']
    },
    'boyfriend jeans': {
      variations: ['7/8', 'tam boy', 'yıkama'],
      season: 'Her mevsim',
      occasions: ['Günlük', 'Seyahat', 'Okul']
    },
    'cargo pantolon': {
      variations: ['tam boy', '7/8', 'cepli'],
      season: 'İlkbahar, Sonbahar',
      occasions: ['Kamp', 'Seyahat', 'Günlük']
    },
    'faux leather pantolon': {
      variations: ['dar', 'bol', '7/8'],
      season: 'Kış, Sonbahar',
      occasions: ['Gece', 'Konser', 'Sokak']
    },
    'jumpsuit': {
      variations: ['kısa kol', 'uzun kol', 'kolsuz'],
      season: 'Yaz, İlkbahar',
      occasions: ['Günlük', 'Seyahat', 'Plaj']
    },
    'tulum': {
      variations: ['kısa', 'uzun'],
      season: 'Yaz',
      occasions: ['Plaj', 'Günlük', 'Seyahat']
    },
    'tayt': {
      variations: ['diz altı', 'tam boy', '7/8'],
      season: 'Her mevsim',
      occasions: ['Spor', 'Günlük', 'Seyahat']
    }
  },

  // ----- ELBİSELER (20 Ana + 50+ Varyasyon) -----
  elbiseler: {
    'mini elbise': {
      variations: ['kısa', 'bodycon', 'a kesim', 'çiçekli', 'düz'],
      season: 'Yaz, İlkbahar',
      occasions: ['Parti', 'Günlük', 'Plaj']
    },
    'midi elbise': {
      variations: ['diz altı', 'a kesim', 'bodycon', 'drapeli', 'fiyonklu'],
      season: 'Her mevsim',
      occasions: ['Ofis', 'Günlük', 'Davet']
    },
    'maksi elbise': {
      variations: ['uzun', 'plaj', 'abiye', 'çiçekli', 'düz'],
      season: 'Yaz, İlkbahar',
      occasions: ['Plaj', 'Davet', 'Seyahat']
    },
    'bodycon elbise': {
      variations: ['mini', 'midi', 'düz', 'desenli'],
      season: 'Her mevsim',
      occasions: ['Davet', 'Gece', 'Parti']
    },
    'a kesim elbise': {
      variations: ['mini', 'midi', 'maksi', 'çiçekli', 'düz'],
      season: 'Her mevsim',
      occasions: ['Günlük', 'Ofis', 'Seyahat']
    },
    'balıkçı elbise': {
      variations: ['mini', 'midi', 'maksi', 'saten', 'kadife'],
      season: 'Kış, Sonbahar',
      occasions: ['Kış günleri', 'Parti', 'Davet']
    },
    'çiçek elbise': {
      variations: ['mini', 'midi', 'maksi', 'küçük çiçek', 'büyük çiçek'],
      season: 'İlkbahar, Yaz',
      occasions: ['Günlük', 'Plaj', 'Seyahat']
    },
    'abiye elbise': {
      variations: ['midi', 'maksi', 'mini', 'payetli', 'drapeli'],
      season: 'Kış, Sonbahar',
      occasions: ['Davet', 'Gece', 'Özel gün']
    },
    'plaj elbisesi': {
      variations: ['mini', 'midi', 'maksi', 'saten', 'şifon'],
      season: 'Yaz',
      occasions: ['Plaj', 'Tatil', 'Seyahat']
    },
    'gömlek elbise': {
      variations: ['midi', 'maksi', 'bel kemerli'],
      season: 'İlkbahar, Yaz',
      occasions: ['Günlük', 'Ofis', 'Seyahat']
    },
    'drapeli elbise': {
      variations: ['midi', 'maksi', 'tek omuz', 'çapraz'],
      season: 'Her mevsim',
      occasions: ['Davet', 'Gece', 'Özel gün']
    },
    'saten elbise': {
      variations: ['mini', 'midi', 'maksi', 'parlak'],
      season: 'Her mevsim',
      occasions: ['Davet', 'Gece', 'Özel gün']
    },
    'kadife elbise': {
      variations: ['mini', 'midi', 'maksi'],
      season: 'Kış, Sonbahar',
      occasions: ['Kış günleri', 'Parti', 'Davet']
    },
    'şifon elbise': {
      variations: ['mini', 'midi', 'maksi', 'katmanlı'],
      season: 'İlkbahar, Yaz',
      occasions: ['Günlük', 'Seyahat', 'Plaj']
    },
    'tül elbise': {
      variations: ['midi', 'maksi', 'katmanlı'],
      season: 'İlkbahar, Yaz',
      occasions: ['Parti', 'Davet', 'Özel gün']
    },
    'paça elbise': {
      variations: ['midi', 'maksi', 'asimetrik'],
      season: 'Her mevsim',
      occasions: ['Günlük', 'Davet', 'Seyahat']
    },
    'asimetrik elbise': {
      variations: ['mini', 'midi', 'maksi'],
      season: 'Her mevsim',
      occasions: ['Günlük', 'Parti', 'Seyahat']
    },
    'fiyonk elbise': {
      variations: ['mini', 'midi', 'maksi', 'bel fiyonklu'],
      season: 'İlkbahar, Yaz',
      occasions: ['Günlük', 'Romantik buluşma']
    },
    'çapraz elbise': {
      variations: ['midi', 'maksi', 'drapeli'],
      season: 'Her mevsim',
      occasions: ['Davet', 'Gece', 'Özel gün']
    },
    'balon elbise': {
      variations: ['mini', 'midi', 'maksi'],
      season: 'İlkbahar, Yaz',
      occasions: ['Parti', 'Günlük', 'Seyahat']
    }
  },

  // ----- DIŞ GİYİM (20 Ana + 45+ Varyasyon) -----
  dis_giyim: {
    'trençkot': {
      variations: ['klasik', 'oversize', 'kuşaklı', 'kısa', 'uzun'],
      season: 'İlkbahar, Sonbahar',
      occasions: ['Günlük', 'Ofis', 'Seyahat']
    },
    'deri ceket': {
      variations: ['klasik', 'oversize', 'biker', 'kısa', 'uzun', 'çivili'],
      season: 'Kış, Sonbahar',
      occasions: ['Sokak', 'Konser', 'Gece']
    },
    'blazer': {
      variations: ['klasik', 'oversize', 'kadife', 'saten', 'keten'],
      season: 'Her mevsim',
      occasions: ['Ofis', 'İş toplantısı', 'Günlük']
    },
    'kaban': {
      variations: ['klasik', 'oversize', 'kuşaklı', 'kısa', 'uzun'],
      season: 'Kış',
      occasions: ['Kış günleri', 'Ofis', 'Günlük']
    },
    'mont': {
      variations: ['klasik', 'oversize', 'kuşaklı', 'diz altı'],
      season: 'Kış',
      occasions: ['Kış günleri', 'Seyahat', 'Günlük']
    },
    'yağmurluk': {
      variations: ['klasik', 'oversize', 'kısa', 'uzun'],
      season: 'İlkbahar, Sonbahar',
      occasions: ['Günlük', 'Seyahat']
    },
    'hırka': {
      variations: ['kısa', 'uzun', 'oversize', 'düğmeli', 'kemersiz'],
      season: 'Her mevsim',
      occasions: ['Günlük', 'Ofis', 'Seyahat']
    },
    'kazak': {
      variations: ['balıkçı yaka', 'v yaka', 'crewncek', 'yuvarlak yaka'],
      season: 'Kış, Sonbahar',
      occasions: ['Kış günleri', 'Ofis', 'Günlük']
    },
    'sweatshirt': {
      variations: ['oversize', 'klasik', 'v yaka', 'yuvarlak yaka'],
      season: 'Her mevsim',
      occasions: ['Günlük', 'Spor', 'Seyahat']
    },
    'biker ceket': {
      variations: ['deri', 'suni deri', 'çivili', 'fermuarlı'],
      season: 'Kış, Sonbahar',
      occasions: ['Sokak', 'Konser', 'Gece']
    },
    'vizon hırka': {
      variations: ['uzun', 'kısa', 'oversize'],
      season: 'Kış',
      occasions: ['Kış günleri', 'Davet', 'Gece']
    },
    'kepenk ceket': {
      variations: ['klasik', 'oversize'],
      season: 'İlkbahar, Sonbahar',
      occasions: ['Günlük', 'Ofis', 'Seyahat']
    },
    'bomber ceket': {
      variations: ['deri', 'suni deri', 'saten'],
      season: 'Her mevsim',
      occasions: ['Günlük', 'Sokak', 'Seyahat']
    },
    'parka': {
      variations: ['kısa', 'uzun', 'oversize'],
      season: 'Kış',
      occasions: ['Kış günleri', 'Seyahat', 'Günlük']
    },
    'puffer mont': {
      variations: ['kısa', 'uzun', 'oversize'],
      season: 'Kış',
      occasions: ['Kış günleri', 'Seyahat']
    },
    'şal': {
      variations: ['uzun', 'kısa', 'oversize'],
      season: 'Her mevsim',
      occasions: ['Günlük', 'Ofis', 'Seyahat']
    },
    'cape': {
      variations: ['kısa', 'uzun', 'oversize'],
      season: 'Sonbahar, Kış',
      occasions: ['Günlük', 'Davet', 'Seyahat']
    },
    'panama ceket': {
      variations: ['klasik', 'oversize'],
      season: 'İlkbahar, Yaz',
      occasions: ['Günlük', 'Seyahat']
    },
    'blazer yelek': {
      variations: ['klasik', 'oversize'],
      season: 'Her mevsim',
      occasions: ['Ofis', 'Günlük', 'Seyahat']
    },
    'yelek': {
      variations: ['deri', 'kumaş', 'örme'],
      season: 'Her mevsim',
      occasions: ['Günlük', 'Ofis', 'Seyahat']
    }
  },

  // ----- AYAKKABILAR (15 Ana + 40+ Varyasyon) -----
  ayakkabilar: {
    'topuklu': {
      variations: ['sivri burun', 'yuvarlak burun', 'ince topuk', 'kalın topuk', 'stiletto', 'klasik'],
      season: 'Her mevsim',
      occasions: ['Davet', 'Gece', 'Ofis']
    },
    'sandalet': {
      variations: ['düz', 'topuklu', 'platform', 'bağlamalı', 'takoz'],
      season: 'Yaz',
      occasions: ['Plaj', 'Günlük', 'Seyahat']
    },
    'bot': {
      variations: ['diz altı', 'diz üstü', 'kalın topuk', 'düz', 'klasik'],
      season: 'Kış, Sonbahar',
      occasions: ['Kış günleri', 'Seyahat', 'Günlük']
    },
    'çizme': {
      variations: ['diz altı', 'diz üstü', 'kalın topuk', 'düz', 'klasik'],
      season: 'Kış, Sonbahar',
      occasions: ['Kış günleri', 'Seyahat', 'Günlük']
    },
    'sneaker': {
      variations: ['beyaz', 'renkli', 'platform', 'düz', 'high top'],
      season: 'Her mevsim',
      occasions: ['Günlük', 'Spor', 'Seyahat']
    },
    'babet': {
      variations: ['düz', 'topuklu', 'yuvarlak burun', 'sivri burun'],
      season: 'Yaz, İlkbahar',
      occasions: ['Günlük', 'Ofis', 'Seyahat']
    },
    'loafer': {
      variations: ['düz', 'kalın taban', 'deri', 'saten'],
      season: 'Her mevsim',
      occasions: ['Ofis', 'Günlük', 'Seyahat']
    },
    'spor ayakkabı': {
      variations: ['koşu', 'yürüyüş', 'günlük', 'elektrik'],
      season: 'Her mevsim',
      occasions: ['Spor', 'Günlük', 'Seyahat']
    },
    'bot': {
      variations: ['diz altı', 'diz üstü', 'kalın topuk', 'düz'],
      season: 'Kış, Sonbahar',
      occasions: ['Kış günleri', 'Seyahat']
    },
    'topuklu sandalet': {
      variations: ['ince topuk', 'kalın topuk', 'platform'],
      season: 'Yaz',
      occasions: ['Davet', 'Gece', 'Plaj']
    },
    'sneaker': {
      variations: ['beyaz', 'renkli', 'platform', 'düz'],
      season: 'Her mevsim',
      occasions: ['Günlük', 'Spor', 'Seyahat']
    },
    'babet': {
      variations: ['düz', 'topuklu', 'yuvarlak burun'],
      season: 'Yaz, İlkbahar',
      occasions: ['Günlük', 'Ofis']
    },
    'loafer': {
      variations: ['düz', 'kalın taban', 'deri'],
      season: 'Her mevsim',
      occasions: ['Ofis', 'Günlük']
    },
    'spor ayakkabı': {
      variations: ['koşu', 'yürüyüş', 'günlük'],
      season: 'Her mevsim',
      occasions: ['Spor', 'Günlük']
    }
  },

  // ----- AKSESUARLAR (10 Ana + 25+ Varyasyon) -----
  aksesuarlar: {
    'çanta': {
      variations: ['omuz', 'crossbody', 'clutch', 'tote', 'sırt çantası'],
      season: 'Her mevsim',
      occasions: ['Günlük', 'Ofis', 'Davet']
    },
    'kemer': {
      variations: ['dar', 'geniş', 'deri', 'zincir', 'kumaş'],
      season: 'Her mevsim',
      occasions: ['Günlük', 'Ofis', 'Seyahat']
    },
    'şapka': {
      variations: ['bere', 'şapka', 'kasket', 'fedora', 'panama'],
      season: 'Her mevsim',
      occasions: ['Günlük', 'Seyahat', 'Plaj']
    },
    'atkı': {
      variations: ['klasik', 'şal', 'fular', 'kaşmir', 'yün'],
      season: 'Kış, Sonbahar',
      occasions: ['Kış günleri', 'Günlük', 'Seyahat']
    },
    'takı': {
      variations: ['kolye', 'küpe', 'bileklik', 'yüzük', 'broş'],
      season: 'Her mevsim',
      occasions: ['Günlük', 'Davet', 'Özel gün']
    },
    'gözlük': {
      variations: ['güneş gözlüğü', 'optik', 'büyük', 'kedi gözü'],
      season: 'Her mevsim',
      occasions: ['Günlük', 'Seyahat', 'Plaj']
    },
    'eldiven': {
      variations: ['deri', 'yün', 'örme', 'kadife'],
      season: 'Kış',
      occasions: ['Kış günleri', 'Seyahat']
    },
    'fular': {
      variations: ['büyük', 'küçük', 'ipek', 'kaşmir'],
      season: 'Her mevsim',
      occasions: ['Günlük', 'Ofis', 'Seyahat']
    },
    'kravat': {
      variations: ['klasik', 'slim', 'geniş'],
      season: 'Her mevsim',
      occasions: ['Ofis', 'İş toplantısı', 'Davet']
    },
    'kemer': {
      variations: ['dar', 'geniş', 'deri', 'zincir'],
      season: 'Her mevsim',
      occasions: ['Günlük', 'Ofis']
    }
  }
};

// ============================================================
// 3. KOMBİN ÖNERİLERİ
// ============================================================
export const OUTFIT_COMBINATIONS = {
  // ----- OFİS KOMBİNLERİ -----
  ofis: [
    {
      name: 'Klasik Ofis',
      pieces: ['Klasik blazer', 'Beyaz gömlek', 'Kalem etek', 'Topuklu ayakkabı'],
      colors: ['Lacivert', 'Beyaz', 'Bej'],
      style: 'Profesyonel ve zamansız'
    },
    {
      name: 'Modern Ofis',
      pieces: ['Oversize blazer', 'İpek bluz', 'Kumaş pantolon', 'Loafer'],
      colors: ['Gri', 'Krem', 'Siyah'],
      style: 'Modern ve rahat'
    }
  ],

  // ----- GÜNLÜK KOMBİNLER -----
  gunluk: [
    {
      name: 'Rahat Günlük',
      pieces: ['Basic tişört', 'Kot pantolon', 'Sneaker', 'Omuz çantası'],
      colors: ['Beyaz', 'Mavi', 'Bej'],
      style: 'Rahat ve şık'
    },
    {
      name: 'Sokak Stili',
      pieces: ['Oversize tişört', 'Kargo pantolon', 'Sneaker', 'Şapka'],
      colors: ['Siyah', 'Haki', 'Beyaz'],
      style: 'Cool ve rahat'
    }
  ],

  // ----- DAVET KOMBİNLERİ -----
  davet: [
    {
      name: 'Gece Daveti',
      pieces: ['Bodycon elbise', 'Topuklu sandalet', 'Küçük çanta', 'Takı'],
      colors: ['Siyah', 'Altın', 'Gümüş'],
      style: 'Şık ve iddialı'
    },
    {
      name: 'Romantik Davet',
      pieces: ['Midi elbise', 'Sandalet', 'Clutch çanta', 'Takı'],
      colors: ['Pembe', 'Bej', 'Altın'],
      style: 'Romantik ve feminen'
    }
  ]
};

// ============================================================
// 4. YARDIMCI FONKSİYONLAR
// ============================================================

// Renk bilgisi getir
export const getColorInfo = (colorName) => {
  const normalized = colorName.toLowerCase().trim();
  return COLOR_COMBINATIONS[normalized] || null;
};

// Tüm renk isimlerini getir
export const getAllColorNames = () => {
  return Object.keys(COLOR_COMBINATIONS);
};

// Renkle uyumlu renkleri getir
export const getMatchingColors = (colorName) => {
  const color = getColorInfo(colorName);
  return color ? color.matches : [];
};

// Ürün bilgisi getir (kategori ve varyasyon)
export const getProductInfo = (productName) => {
  const normalized = productName.toLowerCase().trim();
  
  for (const category of Object.values(WOMEN_CLOTHING)) {
    if (category[normalized]) {
      return { ...category[normalized], category: Object.keys(WOMEN_CLOTHING).find(
        key => WOMEN_CLOTHING[key] === category
      ) };
    }
  }
  return null;
};

// Tüm ürün isimlerini getir
export const getAllProductNames = () => {
  const products = [];
  for (const category of Object.values(WOMEN_CLOTHING)) {
    products.push(...Object.keys(category));
  }
  return products;
};

// Kategoriye göre ürünleri getir
export const getProductsByCategory = (categoryName) => {
  return WOMEN_CLOTHING[categoryName] || null;
};

// Kombin önerisi getir
export const getOutfitCombination = (type) => {
  return OUTFIT_COMBINATIONS[type] || null;
};

// Tüm kombin tiplerini getir
export const getAllOutfitTypes = () => {
  return Object.keys(OUTFIT_COMBINATIONS);
};

export default {
  COLOR_COMBINATIONS,
  WOMEN_CLOTHING,
  OUTFIT_COMBINATIONS,
  getColorInfo,
  getAllColorNames,
  getMatchingColors,
  getProductInfo,
  getAllProductNames,
  getProductsByCategory,
  getOutfitCombination,
  getAllOutfitTypes
};