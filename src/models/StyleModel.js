// 📁 src/models/StyleModel.js
export const StyleModel = {
  collection: 'styles',
  
  schema: {
    userId: '',
    name: '',
    description: '',
    percentage: 0,
    rank: 0,
    rankLabel: '',
    createdAt: null,
  },
  
  example: {
    userId: 'user_123',
    name: 'Minimalist',
    description: 'Sade ve şık parçalar',
    percentage: 65,
    rank: 1,
    rankLabel: 'Birincil',
    createdAt: new Date(),
  }
};