// 📁 src/models/ProductModel.js
export const ProductModel = {
  collection: 'products',
  
  schema: {
    id: '',
    name: '',
    brand: '',
    price: 0,
    image: '',
    category: '',
    size: '',
    color: '',
    material: '',
    fit: '',
    stock: 0,
    isNew: false,
    createdAt: null,
    userId: '',
  },
  
  example: {
    id: '123',
    name: 'Oversize Blazer',
    brand: 'ZARA',
    price: 799,
    image: 'https://...',
    category: 'üst',
    size: 'M',
    color: 'Siyah',
    material: 'Yün',
    fit: 'Oversize',
    stock: 12,
    isNew: true,
    createdAt: new Date(),
    userId: 'user_123',
  }
};