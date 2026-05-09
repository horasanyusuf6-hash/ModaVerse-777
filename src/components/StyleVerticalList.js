import React, { useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';

// 🎨 Renk paleti (App.js ile uyumlu - cognac düzeltildi)
const COLORS = {
  white: '#FFFFFF',
  charcoal: '#222222',
  ash: '#888888',
  cloud: '#F0F0F0',
  cognac: '#8C7853',  // ✅ DÜZELTİLDİ
};

// Stil kartlarını import et
import EveningStyleCard from './EveningStyleCard';
import CasualStyleCard from './CasualStyleCard';
import BusinessStyleCard from './BusinessStyleCard';
import SportsStyleCard from './SportsStyleCard';
import SpecialStyleCard from './SpecialStyleCard';

const StyleVerticalList = ({ 
  selectedStyles = [], 
  onStyleToggle, 
  onStylePress,
  showSectionTitle = true,
  containerStyle,
  listStyle 
}) => {
  
  // Stil kartları yapılandırması
  const styleCards = useMemo(() => [
    { 
      id: 'evening', 
      component: EveningStyleCard,
      combinationCount: 24,
      title: 'Akşam Stili'
    },
    { 
      id: 'casual', 
      component: CasualStyleCard,
      combinationCount: 18,
      title: 'Günlük Stil'
    },
    { 
      id: 'business', 
      component: BusinessStyleCard,
      combinationCount: 32,
      title: 'İş Stili'
    },
    { 
      id: 'sports', 
      component: SportsStyleCard,
      combinationCount: 15,
      title: 'Spor Stili'
    },
    { 
      id: 'special', 
      component: SpecialStyleCard,
      combinationCount: 28,
      title: 'Özel Günler'
    },
  ], []);

  // Kart render fonksiyonu
  const renderStyleCard = useCallback(({ item }) => {
    const CardComponent = item.component;
    const isSelected = selectedStyles.includes(item.id);
    
    const handlePress = () => {
      // Önce toggle işlemi (varsa)
      if (onStyleToggle) {
        onStyleToggle(item.id);
      }
      
      // Sonra press işlemi (varsa)
      if (onStylePress) {
        onStylePress(item.id);
      }
    };
    
    return (
      <CardComponent 
        onPress={handlePress}
        isSelected={isSelected}
        combinationCount={item.combinationCount}
      />
    );
  }, [selectedStyles, onStyleToggle, onStylePress]);

  // Boş liste durumu
  const ListEmptyComponent = useCallback(() => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>Stil kartları bulunamadı</Text>
    </View>
  ), []);

  return (
    <View style={[styles.container, containerStyle]}>
      {showSectionTitle && (
        <Text style={styles.sectionTitle}>KONSEPTLERİ SEÇ</Text>
      )}
      
      <FlatList
        data={styleCards}
        renderItem={renderStyleCard}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.listContent, listStyle]}
        ListEmptyComponent={ListEmptyComponent}
        initialNumToRender={5}
        maxToRenderPerBatch={5}
        windowSize={5}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginVertical: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 16,
    marginBottom: 16,
    color: COLORS.charcoal,
    letterSpacing: 1,
    textAlign: 'center',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  emptyContainer: {
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.ash,
  },
});

export default StyleVerticalList;