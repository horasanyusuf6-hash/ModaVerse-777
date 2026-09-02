// 📁 src/models/FavoriteModel.js
export const FavoriteModel = {
  collection: 'favorites',
  
  schema: {
    userId: '',
    productId: '',
    createdAt: null,
  },
  
  example: {
    userId: 'user_123',
    productId: '123',
    createdAt: new Date(),
  }
};