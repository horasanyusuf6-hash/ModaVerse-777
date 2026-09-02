// 📁 src/models/UserModel.js
export const UserModel = {
  collection: 'users',
  
  schema: {
    uid: '',
    email: '',
    name: '',
    surname: '',
    bio: '',
    avatar: '',
    coverImage: '',
    createdAt: null,
    updatedAt: null,
  },
  
  example: {
    uid: 'user_123',
    email: 'kullanici@email.com',
    name: 'Moda',
    surname: 'Sever',
    bio: 'Moda tutkunu | Stil danışmanı',
    avatar: 'https://...',
    coverImage: 'https://...',
    createdAt: new Date(),
    updatedAt: new Date(),
  }
};