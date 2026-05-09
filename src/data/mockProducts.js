// src/data/mockProducts.js - SADECE REVİZE (hatasız)

// Görsel temizleme fonksiyonu
const FALLBACK_IMAGE = 'https://via.placeholder.com/400x400/f9f6f2/888888?text=ModaVerse';
const clean = (url) => (url || '').trim() || FALLBACK_IMAGE;

export const mockProducts = [
  {
    id: 1,
    name: 'Beyaz Oversize Tişört',
    brand: 'ZARA',
    price: 149.99,
    category: 'Üst Giyim',
    color: 'Beyaz',
    fabric: '%100 Pamuk',
    size: ['S', 'M', 'L', 'XL'],
    description: 'Rahat ve şık oversize tişört',
    image: clean('https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400'),
    rating: 4.5,
    reviews: 128,
    inStock: true,
    aiMatch: 95
  },
  {
    id: 2,
    name: 'Siyah Deri Ceket',
    brand: 'Mango',
    price: 799.99,
    category: 'Dış Giyim',
    color: 'Siyah',
    fabric: 'Geri dönüştürülmüş deri',
    size: ['M', 'L', 'XL'],
    description: 'Klasik siyah deri ceket',
    image: clean('https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400'),
    rating: 4.8,
    reviews: 89,
    inStock: true,
    aiMatch: 88
  },
  {
    id: 3,
    name: 'Mavi Slim Fit Kot',
    brand: 'Levis',
    price: 599.99,
    category: 'Alt Giyim',
    color: 'Mavi',
    fabric: 'Denim',
    size: ['28', '30', '32', '34'],
    description: 'Klasik slim fit kot pantolon',
    image: clean('https://images.unsplash.com/photo-1542272604-787c3835535d?w=400'),
    rating: 4.3,
    reviews: 245,
    inStock: true,
    aiMatch: 92
  },
  {
    id: 4,
    name: 'Bej Trench Coat',
    brand: 'Massimo Dutti',
    price: 899.99,
    category: 'Dış Giyim',
    color: 'Bej',
    fabric: 'Pamuk',
    size: ['S', 'M', 'L'],
    description: 'Klasik trench coat',
    image: clean('https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=400'),
    rating: 4.7,
    reviews: 67,
    inStock: true,
    aiMatch: 90
  },
  {
    id: 5,
    name: 'Beyaz Sneaker',
    brand: 'Nike',
    price: 499.99,
    category: 'Ayakkabı',
    color: 'Beyaz',
    fabric: 'Deri',
    size: ['38', '39', '40', '41', '42'],
    description: 'Klasik beyaz sneaker',
    image: clean('https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400'),
    rating: 4.6,
    reviews: 312,
    inStock: true,
    aiMatch: 85
  },
  {
    id: 6,
    name: 'Siyah Gömlek',
    brand: 'H&M',
    price: 199.99,
    category: 'Üst Giyim',
    color: 'Siyah',
    fabric: 'Pamuk',
    size: ['S', 'M', 'L', 'XL'],
    description: 'Resmi siyah gömlek',
    image: clean('https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400'),
    rating: 4.2,
    reviews: 178,
    inStock: true,
    aiMatch: 87
  },
  {
    id: 7,
    name: 'Kahverengi Deri Çanta',
    brand: 'COACH',
    price: 1299.99,
    category: 'Aksesuar',
    color: 'Kahverengi',
    fabric: 'Deri',
    size: ['One Size'],
    description: 'Lüks deri çanta',
    image: clean('https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400'),
    rating: 4.9,
    reviews: 45,
    inStock: true,
    aiMatch: 82
  },
  {
    id: 8,
    name: 'Gri Sweatshirt',
    brand: 'Pull&Bear',
    price: 249.99,
    category: 'Üst Giyim',
    color: 'Gri',
    fabric: 'Pamuk',
    size: ['S', 'M', 'L', 'XL'],
    description: 'Rahat sweatshirt',
    image: clean('https://images.unsplash.com/photo-1529374255404-311a2a4f1fd9?w=400'),
    rating: 4.4,
    reviews: 96,
    inStock: true,
    aiMatch: 91
  },
  {
    id: 9,
    name: 'Siyah Etek',
    brand: 'ZARA',
    price: 299.99,
    category: 'Alt Giyim',
    color: 'Siyah',
    fabric: 'Polyester',
    size: ['XS', 'S', 'M'],
    description: 'Mini siyah etek',
    image: clean('https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?w=400'),
    rating: 4.1,
    reviews: 123,
    inStock: true,
    aiMatch: 89
  },
  {
    id: 10,
    name: 'Kırmızı Elbise',
    brand: 'Mango',
    price: 449.99,
    category: 'Üst Giyim',
    color: 'Kırmızı',
    fabric: 'İpek',
    size: ['S', 'M', 'L'],
    description: 'Gece elbisesi',
    image: clean('https://images.unsplash.com/photo-1539008835657-9e8e9680c956?w=400'),
    rating: 4.7,
    reviews: 78,
    inStock: true,
    aiMatch: 94
  },
  {
    id: 11,
    name: 'Deri Bileklik',
    brand: 'PANDORA',
    price: 149.99,
    category: 'Aksesuar',
    color: 'Siyah',
    fabric: 'Deri',
    size: ['One Size'],
    description: 'Deri bileklik',
    image: clean('https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=400'),
    rating: 4.3,
    reviews: 201,
    inStock: true,
    aiMatch: 80
  },
  {
    id: 12,
    name: 'Bej Pantolon',
    brand: 'H&M',
    price: 349.99,
    category: 'Alt Giyim',
    color: 'Bej',
    fabric: 'Pamuk',
    size: ['28', '30', '32', '34'],
    description: 'Klasik bej pantolon',
    image: clean('https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=400'),
    rating: 4.0,
    reviews: 89,
    inStock: true,
    aiMatch: 86
  },
  {
    id: 13,
    name: 'Siyah Mont',
    brand: 'The North Face',
    price: 1199.99,
    category: 'Dış Giyim',
    color: 'Siyah',
    fabric: 'Naylon',
    size: ['S', 'M', 'L', 'XL'],
    description: 'Kış montu',
    image: clean('https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?w=400'),
    rating: 4.8,
    reviews: 156,
    inStock: true,
    aiMatch: 93
  },
  {
    id: 14,
    name: 'Beyaz Topuklu Ayakkabı',
    brand: 'ZARA',
    price: 399.99,
    category: 'Ayakkabı',
    color: 'Beyaz',
    fabric: 'Suni deri',
    size: ['36', '37', '38', '39'],
    description: 'Topuklu ayakkabı',
    image: clean('https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=400'),
    rating: 4.2,
    reviews: 112,
    inStock: true,
    aiMatch: 84
  },
  {
    id: 15,
    name: 'Mavi Polo T-shirt',
    brand: 'Lacoste',
    price: 299.99,
    category: 'Üst Giyim',
    color: 'Mavi',
    fabric: 'Pamuk',
    size: ['S', 'M', 'L', 'XL'],
    description: 'Klasik polo t-shirt',
    image: clean('https://images.unsplash.com/photo-1581650107963-3e8c1f48241b?w=400'),
    rating: 4.5,
    reviews: 234,
    inStock: true,
    aiMatch: 88
  },
  {
    id: 16,
    name: 'Güneş Gözlüğü',
    brand: 'Ray-Ban',
    price: 599.99,
    category: 'Aksesuar',
    color: 'Siyah',
    fabric: 'Plastik',
    size: ['One Size'],
    description: 'Klasik güneş gözlüğü',
    image: clean('https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400'),
    rating: 4.7,
    reviews: 189,
    inStock: true,
    aiMatch: 81
  },
  {
    id: 17,
    name: 'Gri Ceket',
    brand: 'Massimo Dutti',
    price: 699.99,
    category: 'Dış Giyim',
    color: 'Gri',
    fabric: 'Yün',
    size: ['S', 'M', 'L'],
    description: 'İş ceketi',
    image: clean('https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=400'),
    rating: 4.6,
    reviews: 98,
    inStock: true,
    aiMatch: 90
  },
  {
    id: 18,
    name: 'Spor Ayakkabı',
    brand: 'Adidas',
    price: 549.99,
    category: 'Ayakkabı',
    color: 'Beyaz',
    fabric: 'Kumaş',
    size: ['39', '40', '41', '42', '43'],
    description: 'Spor ayakkabı',
    image: clean('https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?w=400'),
    rating: 4.4,
    reviews: 267,
    inStock: true,
    aiMatch: 87
  },
  {
    id: 19,
    name: 'Kırmızı Çanta',
    brand: 'ZARA',
    price: 399.99,
    category: 'Aksesuar',
    color: 'Kırmızı',
    fabric: 'Deri',
    size: ['One Size'],
    description: 'Kırmızı deri çanta',
    image: clean('https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400'),
    rating: 4.3,
    reviews: 76,
    inStock: true,
    aiMatch: 83
  },
  {
    id: 20,
    name: 'Denim Ceket',
    brand: 'Levis',
    price: 499.99,
    category: 'Dış Giyim',
    color: 'Mavi',
    fabric: 'Denim',
    size: ['S', 'M', 'L', 'XL'],
    description: 'Klasik denim ceket',
    image: clean('https://images.unsplash.com/photo-1521223890158-f9f7c3d5d504?w=400'),
    rating: 4.5,
    reviews: 145,
    inStock: true,
    aiMatch: 89
  }
];

// Kategoriler (icon isimleri düzeltildi)
export const categories = [
  { id: 1, name: 'Üst Giyim', icon: 'shirt-outline' },
  { id: 2, name: 'Alt Giyim', icon: 'body-outline' },
  { id: 3, name: 'Dış Giyim', icon: 'jacket-outline' },
  { id: 4, name: 'Ayakkabı', icon: 'footsteps-outline' },
  { id: 5, name: 'Aksesuar', icon: 'glasses-outline' },
];

// ✅ YARDIMCI FONKSİYONLAR
export const getProductById = (id) => {
  return mockProducts.find(product => product.id === id);
};

export const getProductsByCategory = (category) => {
  return mockProducts.filter(product => product.category === category);
};

export const getProductsByBrand = (brand) => {
  return mockProducts.filter(product => product.brand === brand);
};

export const getProductsByPriceRange = (min, max) => {
  return mockProducts.filter(product => product.price >= min && product.price <= max);
};

export const getTrendingProducts = () => {
  return [...mockProducts].sort((a, b) => b.rating - a.rating).slice(0, 10);
};

export const getRecommendedForYou = (userStyle = null) => {
  // AI match yüksek olanları öner
  return [...mockProducts].sort((a, b) => b.aiMatch - a.aiMatch).slice(0, 10);
};

// ✅ DEFAULT EXPORT
export default {
  mockProducts,
  categories,
  getProductById,
  getProductsByCategory,
  getProductsByBrand,
  getProductsByPriceRange,
  getTrendingProducts,
  getRecommendedForYou
};