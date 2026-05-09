// mobile/src/components/StyleSuggestionCards.js - SADECE REVİZE
import React, { useCallback, useMemo } from 'react';
import { 
  View, 
  Text, 
  Image, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView,
  Alert 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// 🎨 Renk paleti (App.js ile uyumlu - cognac düzeltildi)
const COLORS = {
  white: '#FFFFFF',
  ivory: '#F9F6F2',
  ash: '#888888',
  charcoal: '#222222',
  cloud: '#F0F0F0',
  accent: '#8C7853',
  gold: '#C4A747',
  cognac: '#8C7853',  // ✅ DÜZELTİLDİ
  error: '#F44336',
};

// Mock data - gerçek uygulamada API'den gelecek
const SUGGESTIONS_DATA = {
  casual: [
    {
      id: 1,
      title: 'Rahat Günlük Kombin',
      items: ['Beyaz Tişört', 'Kot Pantolon', 'Sneaker'],
      image: '👕👖👟',
      likes: 124,
      saved: false,
      style: 'casual'
    },
    {
      id: 2,
      title: 'Hafta Sonu Stili',
      items: ['Oversize Sweatshirt', 'Jogger Pantolon', 'Spor Ayakkabı'],
      image: '🧥👖👟',
      likes: 89,
      saved: true,
      style: 'casual'
    }
  ],
  elegant: [
    {
      id: 3,
      title: 'Şık Akşam Yemeği',
      items: ['Siyah Elbise', 'Topuklu Ayakkabı', 'Küpe'],
      image: '👗👠💎',
      likes: 215,
      saved: false,
      style: 'elegant'
    }
  ],
  sport: [
    {
      id: 4,
      title: 'Spor Salonu Kombini',
      items: ['Spor Atlet', 'Eşofman Altı', 'Spor Ayakkabı'],
      image: '🎽🩳👟',
      likes: 167,
      saved: false,
      style: 'sport'
    }
  ],
  street: [
    {
      id: 5,
      title: 'Sokak Stili',
      items: ['Oversize Hoodie', 'Kargo Pantolon', 'Sneaker'],
      image: '🧥👖👟',
      likes: 234,
      saved: false,
      style: 'street'
    }
  ],
  business: [
    {
      id: 6,
      title: 'Ofis Kombini',
      items: ['Blazer', 'Gömlek', 'Pantolon'],
      image: '👔👖👞',
      likes: 178,
      saved: false,
      style: 'business'
    }
  ]
};

const StyleSuggestionCards = ({ 
  selectedStyles = [], 
  onLike, 
  onSave,
  onCardPress,
  showEmptyState = true 
}) => {
  
  // Seçilen stillere göre önerileri filtrele
  const filteredSuggestions = useMemo(() => {
    if (!selectedStyles || selectedStyles.length === 0) {
      // Tüm stilleri göster
      return Object.values(SUGGESTIONS_DATA).flat();
    }
    
    return selectedStyles.flatMap(style => 
      SUGGESTIONS_DATA[style] || []
    );
  }, [selectedStyles]);

  // Beğeni handler
  const handleLike = useCallback((id) => {
    if (onLike) {
      onLike(id);
    } else {
      Alert.alert('❤️ Beğeni', 'Bu özellik yakında eklenecek!');
    }
  }, [onLike]);

  // Kaydetme handler
  const handleSave = useCallback((id) => {
    if (onSave) {
      onSave(id);
    } else {
      Alert.alert('⭐ Kaydet', 'Bu özellik yakında eklenecek!');
    }
  }, [onSave]);

  // Kart tıklama handler
  const handleCardPress = useCallback((suggestion) => {
    if (onCardPress) {
      onCardPress(suggestion);
    } else {
      Alert.alert(
        suggestion.title,
        `Önerilen parçalar:\n${suggestion.items.map(item => `• ${item}`).join('\n')}`,
        [{ text: 'Tamam' }]
      );
    }
  }, [onCardPress]);

  if (filteredSuggestions.length === 0) {
    if (!showEmptyState) return null;
    
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyIcon}>👗</Text>
        <Text style={styles.emptyTitle}>Henüz Öneri Yok</Text>
        <Text style={styles.emptyText}>
          Yukarıdan stiller seçerek kişiselleştirilmiş kombin önerileri al!
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Sana Özel Kombin Önerileri</Text>
        <Text style={styles.count}>{filteredSuggestions.length} öneri</Text>
      </View>
      
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {filteredSuggestions.map((suggestion) => (
          <TouchableOpacity 
            key={suggestion.id} 
            style={styles.card}
            onPress={() => handleCardPress(suggestion)}
            activeOpacity={0.9}
          >
            {/* KART BAŞLIĞI */}
            <View style={styles.cardHeader}>
              <View style={styles.titleContainer}>
                <Text style={styles.cardEmoji}>{suggestion.image}</Text>
                <Text style={styles.cardTitle}>{suggestion.title}</Text>
              </View>
              
              <View style={styles.actions}>
                {/* BEĞENİ BUTONU */}
                <TouchableOpacity 
                  style={styles.actionButton}
                  onPress={() => handleLike(suggestion.id)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Ionicons 
                    name="heart-outline" 
                    size={20} 
                    color={COLORS.ash} 
                  />
                  <Text style={styles.actionCount}>{suggestion.likes}</Text>
                </TouchableOpacity>
                
                {/* KAYDET BUTONU */}
                <TouchableOpacity 
                  style={styles.actionButton}
                  onPress={() => handleSave(suggestion.id)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Ionicons 
                    name={suggestion.saved ? "bookmark" : "bookmark-outline"} 
                    size={20} 
                    color={suggestion.saved ? COLORS.gold : COLORS.ash} 
                  />
                </TouchableOpacity>
              </View>
            </View>
            
            {/* PARÇA LİSTESİ */}
            <View style={styles.itemsContainer}>
              {suggestion.items.map((item, index) => (
                <View key={index} style={styles.itemRow}>
                  <Text style={styles.itemBullet}>•</Text>
                  <Text style={styles.itemText}>{item}</Text>
                </View>
              ))}
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.charcoal,
  },
  count: {
    fontSize: 14,
    color: COLORS.ash,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: COLORS.charcoal,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: COLORS.cloud,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  cardEmoji: {
    fontSize: 32,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.charcoal,
    flex: 1,
  },
  actions: {
    flexDirection: 'row',
    gap: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionCount: {
    fontSize: 12,
    color: COLORS.ash,
  },
  itemsContainer: {
    marginLeft: 44, // Emoji genişliği + gap
  },
  itemRow: {
    flexDirection: 'row',
    marginBottom: 8,
    gap: 8,
  },
  itemBullet: {
    fontSize: 14,
    color: COLORS.ash,
    width: 10,
  },
  itemText: {
    fontSize: 14,
    color: COLORS.charcoal,
    flex: 1,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 32,
  },
  emptyIcon: {
    fontSize: 60,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
    color: COLORS.charcoal,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.ash,
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default StyleSuggestionCards;