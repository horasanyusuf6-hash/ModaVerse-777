// 📁 src/models/CartModel.js
export const CartModel = {
  collection: 'cart',
  
  schema: {
    userId: '',
    productId: '',
    size: '',
    quantity: 0,
    addedAt: null,
  },
  
  example: {
    userId: 'user_123',
    productId: '123',
    size: 'M',
    quantity: 2,
    addedAt: new Date(),
  }
};