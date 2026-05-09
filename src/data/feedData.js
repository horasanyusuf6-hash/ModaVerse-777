// 📁 src/data/feedData.js - SADECE REVİZE (hatasız)
export const feedData = [
  {
    id: 1,
    username: 'ModaTutkunu',
    userAvatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&auto=format&fit=crop&q=80',
    styleType: 'evening',
    styleName: 'Akşam Konsepti',
    imageUrl: 'https://images.unsplash.com/photo-1539008835657-9e8e9680c956?w=400&auto=format&fit=crop&q=80',
    description: 'Bu akşam özel davet için hazırlandım! Mor ve siyah kombinimle çok şık durduğunu düşünüyorum.',
    likeCount: 124,
    commentCount: 23,
    isLiked: false,
    isSaved: false,
    timestamp: '2 saat önce',
    product: {
      id: 101,
      brand: 'ZARA',
      name: 'Gece Elbisesi',
      price: 899.99
    }
  },
  {
    id: 2,
    username: 'SporStil',
    userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
    styleType: 'sports',
    styleName: 'Spor Konsepti',
    imageUrl: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400&auto=format&fit=crop&q=80',
    description: 'Sabah koşusu için rahat ve şık bir kombin. Yeni spor ayakkabılarımı denedim!',
    likeCount: 89,
    commentCount: 15,
    isLiked: true,
    isSaved: true,
    timestamp: '5 saat önce',
    product: {
      id: 102,
      brand: 'Nike',
      name: 'Spor Ayakkabı',
      price: 1299.99
    }
  },
  {
    id: 3,
    username: 'İşModası',
    userAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&auto=format&fit=crop&q=80',
    styleType: 'business',
    styleName: 'İş Konsepti',
    imageUrl: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=400&auto=format&fit=crop&q=80',
    description: 'Önemli bir toplantı için klasik ve profesyonel bir görünüm. Gri takım elbise her zaman kazanır!',
    likeCount: 156,
    commentCount: 34,
    isLiked: false,
    isSaved: true,
    timestamp: '1 gün önce',
    product: {
      id: 103,
      brand: 'Hugo Boss',
      name: 'Gri Takım Elbise',
      price: 3499.99
    }
  },
  {
    id: 4,
    username: 'SokakStili',
    userAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=80',
    styleType: 'casual',
    styleName: 'Günlük Konsept',
    imageUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&auto=format&fit=crop&q=80',
    description: 'Hafta sonu sokak stili. Oversize sweatshirt ve bol kot kombinim.',
    likeCount: 234,
    commentCount: 56,
    isLiked: false,
    isSaved: false,
    timestamp: '3 gün önce',
    product: {
      id: 104,
      brand: 'Mango',
      name: 'Oversize Sweatshirt',
      price: 299.99
    }
  },
  {
    id: 5,
    username: 'ÖzelGünler',
    userAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
    styleType: 'special',
    styleName: 'Özel Gün Konsepti',
    imageUrl: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=400&auto=format&fit=crop&q=80',
    description: 'Yılbaşı partisi için hazırladığım ışıltılı kombin. Herkes çok beğendi!',
    likeCount: 312,
    commentCount: 78,
    isLiked: true,
    isSaved: true,
    timestamp: '1 hafta önce',
    product: {
      id: 105,
      brand: 'Massimo Dutti',
      name: 'Işıltılı Elbise',
      price: 1599.99
    }
  }
];

// ✅ İSTEĞE BAĞLI: EKSTRA VERİLER
export const getFeedByStyleType = (styleType) => {
  return feedData.filter(item => item.styleType === styleType);
};

export const getTrendingFeeds = () => {
  return [...feedData].sort((a, b) => b.likeCount - a.likeCount);
};

export const getRecentFeeds = () => {
  return [...feedData];
};