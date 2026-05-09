// 📁 src/data/mockData.js — REVİZE EDİLMİŞ (SADECE GEREKLİ DÜZENLEMELER)
const FALLBACK_IMAGE = 'https://via.placeholder.com/400x400/f9f6f2/888888?text=ModaVerse';

const clean = (url) => (url || '').trim() || FALLBACK_IMAGE;

// 🔥 HOME SCREEN İÇİN SOSYAL FEED DATA
export const mockFeedData = [
  {
    id: '1',
    name: 'Oversize Blazer',
    brand: 'ZARA',
    price: 799,
    category: 'Blazer',
    image: clean('https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=400'),
    description: 'Şık ve rahat oversize blazer, günlük kombinlerin vazgeçilmezi',
    fabric: 'Yün',
    color: 'Bej',
    user: {
      name: 'StyleHunter',
      avatar: clean('https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100'),
      isVerified: true
    },
    time: '2 saat önce',
    likes: 1420,
    comments: [
      { user: { name: 'ModaSever' }, text: 'Çok şık duruyor!' },
      { user: { name: 'StilDanışmanı' }, text: 'Renk harika 👌' }
    ],
    isLiked: false
  },
  {
    id: '2', 
    name: 'Air Force 1',
    brand: 'Nike',
    price: 899,
    category: 'Sneaker',
    image: clean('https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400'),
    description: 'Klasik beyaz sneaker, her tarza uygun',
    fabric: 'Deri',
    color: 'Beyaz',
    user: {
      name: 'SneakerHead',
      avatar: clean('https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100'),
      isVerified: false
    },
    time: '5 saat önce',
    likes: 2890,
    comments: [
      { user: { name: 'AyakkabıKoleksiyoner' }, text: 'Kesinlikle almalısın!' }
    ],
    isLiked: false
  },
  {
    id: '3',
    name: 'Leather Jacket',
    brand: 'Mango',
    price: 1299,
    category: 'Ceket',
    image: clean('https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400'),
    description: 'Kaliteli deri ceket, rock tarzı sevenler için',
    fabric: 'Deri',
    color: 'Siyah',
    user: {
      name: 'RockStyle',
      avatar: clean('https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100'),
      isVerified: true
    },
    time: '1 gün önce',
    likes: 1870,
    comments: [],
    isLiked: false
  },
  {
    id: '4',
    name: 'Runway Dress',
    brand: 'Prada',
    price: 4500,
    category: 'Elbise', 
    image: clean('https://images.unsplash.com/photo-1539008835657-9e8e9680c956?w=400'),
    description: 'Özel günler için tasarlanmış şık elbise',
    fabric: 'İpek',
    color: 'Kırmızı',
    user: {
      name: 'LuxuryFashion',
      avatar: clean('https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100'),
      isVerified: true
    },
    time: '1 gün önce',
    likes: 3560,
    comments: [
      { user: { name: 'GalaSever' }, text: 'Harika bir tasarım!' },
      { user: { name: 'ModaEditörü' }, text: 'Renk mükemmel ❤️' }
    ],
    isLiked: false
  }
];

// 🔥 TREND VERİLERİ (Podium için)
export const mockTrendData = [
  {
    id: '1',
    name: 'Oversize Blazer',
    brand: 'ZARA',
    price: 799,
    category: 'Blazer',
    image: clean('https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=400'),
    trendVelocity: 42,
    trendMentions: 15400,
    trendSpread: ['Istanbul', 'Izmir', 'Ankara'],
    trendLifespan: 45,
    trendRisk: 'high',
    type: 'trending',
    influencer: false,
    runway: false
  },
  {
    id: '2', 
    name: 'Air Force 1',
    brand: 'Nike',
    price: 899,
    category: 'Sneaker',
    image: clean('https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400'),
    trendVelocity: 78,
    trendMentions: 28900,
    trendSpread: ['Istanbul', 'Ankara', 'Bursa'],
    trendLifespan: 60,
    trendRisk: 'medium',
    type: 'trending',
    influencer: true,
    runway: false
  },
  {
    id: '3',
    name: 'Leather Jacket',
    brand: 'Mango',
    price: 1299,
    category: 'Ceket',
    image: clean('https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400'),
    trendVelocity: 15,
    trendMentions: 4200,
    trendSpread: ['Istanbul'],
    trendLifespan: 30,
    trendRisk: 'low',
    type: 'street',
    influencer: false,
    runway: false
  },
  {
    id: '4',
    name: 'Runway Dress',
    brand: 'Prada',
    price: 4500,
    category: 'Elbise', 
    image: clean('https://images.unsplash.com/photo-1539008835657-9e8e9680c956?w=400'),
    trendVelocity: 95,
    trendMentions: 51200,
    trendSpread: ['Milan', 'Paris', 'Istanbul'],
    trendLifespan: 90,
    trendRisk: 'high', 
    type: 'runway',
    influencer: true,
    runway: true
  },
  {
    id: '5',
    name: 'Denim Overalls',
    brand: 'Levi\'s',
    price: 649,
    category: 'Tulum',
    image: clean('https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400'),
    trendVelocity: 35,
    trendMentions: 8900,
    trendSpread: ['Istanbul', 'Izmir'],
    trendLifespan: 40,
    trendRisk: 'medium',
    type: 'trending',
    influencer: false,
    runway: false
  },
  {
    id: '6',
    name: 'Platform Boots',
    brand: 'Dr. Martens',
    price: 1299,
    category: 'Bot',
    image: clean('https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=400'),
    trendVelocity: 28,
    trendMentions: 6700,
    trendSpread: ['Istanbul'],
    trendLifespan: 35,
    trendRisk: 'low',
    type: 'street',
    influencer: true,
    runway: false
  },
  {
    id: '7',
    name: 'Silk Scarf',
    brand: 'Hermès',
    price: 1250,
    category: 'Aksesuar',
    image: clean('https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400'),
    trendVelocity: 55,
    trendMentions: 11200,
    trendSpread: ['Paris', 'Istanbul', 'Milan'],
    trendLifespan: 50,
    trendRisk: 'medium',
    type: 'runway',
    influencer: true,
    runway: true
  },
  {
    id: '8',
    name: 'Cargo Pants',
    brand: 'H&M',
    price: 349,
    category: 'Pantolon',
    image: clean('https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=400'),
    trendVelocity: 65,
    trendMentions: 18700,
    trendSpread: ['Istanbul', 'Ankara', 'Bursa'],
    trendLifespan: 55,
    trendRisk: 'high',
    type: 'trending',
    influencer: false,
    runway: false
  }
];

// 🔥 MOCK POSTS
export const mockPosts = [
  {
    id: 'post1',
    type: 'image',
    images: [clean('https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=400')],
    user: {
      name: 'EcoStyleBlog',
      avatar: clean('https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100'),
      verified: true
    },
    caption: 'Sürdürülebilir moda ile günlük kombinim ♻️ #SlowFashion hareketine destek oluyorum!',
    hashtags: ['SürdürülebilirModa', 'SlowFashion', 'EcoFriendly', 'Moda'],
    likes: 1420,
    comments: 89,
    saves: 256,
    timestamp: '2 saat önce',
    location: 'İstanbul',
    trending: true
  },
  {
    id: 'post2',
    type: 'carousel',
    images: [
      clean('https://images.unsplash.com/photo-1485231183945-fffde7cb34f9?w=400'),
      clean('https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400'),
      clean('https://images.unsplash.com/photo-1518894788259-000bac2f16d2?w=400')
    ],
    user: {
      name: 'StreetStyleIstanbul',
      avatar: clean('https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100'),
      verified: false
    },
    caption: 'Bugünkü street style avımızda bu oversize blazer çok dikkat çekti! 🧥✨',
    hashtags: ['OversizeBlazer', 'StreetStyle', 'Istanbul', 'Moda'],
    likes: 2890,
    comments: 142,
    saves: 512,
    timestamp: '5 saat önce',
    location: 'Nişantaşı',
    trending: true
  },
  {
    id: 'post3',
    type: 'video',
    images: [clean('https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400')],
    user: {
      name: 'RunwayMagazine',
      avatar: clean('https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100'),
      verified: true
    },
    caption: 'Milan Fashion Week\'den ilham: Minimalist kesimler ve doğal renkler ✨',
    hashtags: ['MilanFashionWeek', 'Minimalist', 'Runway', 'Luxury'],
    likes: 3560,
    comments: 210,
    saves: 890,
    timestamp: '1 gün önce',
    location: 'Milan',
    trending: true
  }
];

// 🔥 HASHTAG FEEDS
export const hashtagFeeds = {
  'SürdürülebilirModa': [
    {
      id: 'hf1',
      image: clean('https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=400'),
      user: { 
        name: 'EcoStyleBlog', 
        avatar: clean('https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100') 
      },
      likes: 1420,
      caption: 'Sürdürülebilir moda ile günlük kombinim ♻️'
    },
    {
      id: 'hf2',
      image: clean('https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=400'),
      user: { 
        name: 'GreenFashion', 
        avatar: clean('https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100') 
      },
      likes: 890,
      caption: 'Organik pamuklu tişörtüm ve geri dönüştürülmüş kot pantolonum 🌿'
    }
  ],
  'OversizeBlazer': [
    {
      id: 'hf3',
      image: clean('https://images.unsplash.com/photo-1485231183945-fffde7cb34f9?w=400'),
      user: { 
        name: 'StreetStyleIstanbul', 
        avatar: clean('https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100') 
      },
      likes: 2890,
      caption: 'Oversize blazer + basic t-shirt = mükemmel kombin!'
    },
    {
      id: 'hf4',
      image: clean('https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400'),
      user: { 
        name: 'FashionInfluencer', 
        avatar: clean('https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100') 
      },
      likes: 1560,
      caption: 'Ofis tarzına modern bir dokunuş 👔'
    }
  ],
  'StreetStyle': [
    {
      id: 'hf5',
      image: clean('https://images.unsplash.com/photo-1518894788259-000bac2f16d2?w=400'),
      user: { 
        name: 'UrbanExplorer', 
        avatar: clean('https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100') 
      },
      likes: 2340,
      caption: 'İstanbul sokaklarında street style avı 🏙️'
    }
  ],
  'MilanFashionWeek': [
    {
      id: 'hf6',
      image: clean('https://images.unsplash.com/photo-1534452203293-494d7ddbf7e0?w=400'),
      user: { 
        name: 'RunwayMagazine', 
        avatar: clean('https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100') 
      },
      likes: 3560,
      caption: 'Milan\'dan ilk görüntüler! Minimalizm geri döndü ✨'
    }
  ]
};

// 🔥 HASHTAG TRENDS
export const hashtagTrends = {
  'SürdürülebilirModa': {
    posts: 15400,
    growth: 42,
    topPosts: ['post1', 'post4'],
    relatedTags: ['EcoFriendly', 'SlowFashion', 'GreenStyle']
  },
  'OversizeBlazer': {
    posts: 12100, 
    growth: 28,
    topPosts: ['post2'],
    relatedTags: ['StreetStyle', 'Blazer', 'Oversize']
  },
  'StreetStyle': {
    posts: 9800,
    growth: 15,
    topPosts: ['post2', 'post4'],
    relatedTags: ['Urban', 'Istanbul', 'GünlükStil']
  },
  'MilanFashionWeek': {
    posts: 25600,
    growth: 68,
    topPosts: ['post3'],
    relatedTags: ['Runway', 'Luxury', 'Designer']
  }
};

// ✅ YARDIMCI FONKSİYONLAR
export const getMockData = () => {
  return mockFeedData;
};

export const getTrendData = () => {
  return mockTrendData;
};

export const getHashtagFeed = (hashtag) => {
  return hashtagFeeds[hashtag] || [];
};

export const getHashtagTrend = (hashtag) => {
  return hashtagTrends[hashtag] || { posts: 0, growth: 0, relatedTags: [] };
};

// ✅ TÜM VERİ
export const allData = {
  feedData: mockFeedData,
  trendData: mockTrendData,
  posts: mockPosts,
  hashtags: hashtagTrends,
  hashtagFeeds: hashtagFeeds
};

// ✅ DEFAULT EXPORT
export default {
  mockFeedData,
  mockTrendData,
  mockPosts,
  hashtagTrends,
  hashtagFeeds,
  allData,
  getMockData,
  getTrendData,
  getHashtagFeed,
  getHashtagTrend
};