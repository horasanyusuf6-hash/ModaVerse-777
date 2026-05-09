import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';

// 🎨 Renk paleti (App.js ile uyumlu - renk düzeltildi)
const COLORS = {
  white: '#FFFFFF',
  primary: '#8C7853',  // ✅ DÜZELTİLDİ: cognac rengine uygun
  overlay: 'rgba(0,0,0,0.4)',
  shadow: '#000',
  borderTransparent: 'transparent',
  textShadow: 'rgba(0,0,0,0.8)',
};

const SpecialStyleCard = ({ 
  onPress, 
  isSelected = false, 
  combinationCount = 0,
  imageUrl = 'https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?w=400&auto=format&fit=crop&q=80',
  title = 'ÖZEL GÜNLER'
}) => {
  return (
    <TouchableOpacity 
      style={[
        styles.card,
        isSelected && styles.selectedCard
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Image 
        source={{ uri: imageUrl }}
        style={styles.image}
        resizeMode="cover"
      />
      <View style={styles.overlay}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.combinationCount}>
          {combinationCount} kombin
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    marginVertical: 8,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    borderWidth: 2,
    borderColor: COLORS.borderTransparent,
    height: 200,
    overflow: 'hidden',
    position: 'relative',
  },
  selectedCard: {
    borderColor: COLORS.primary,
  },
  image: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  overlay: {
    flex: 1,
    backgroundColor: COLORS.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.white,
    marginBottom: 8,
    textShadowColor: COLORS.textShadow,
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 4,
  },
  combinationCount: {
    fontSize: 18,
    color: COLORS.white,
    fontWeight: '600',
    textShadowColor: COLORS.textShadow,
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 4,
  },
});

export default SpecialStyleCard;