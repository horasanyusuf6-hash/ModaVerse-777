import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  FlatList,
  SafeAreaView,
  StatusBar,
  Alert,
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

// 🎨 Renk paleti (App.js ile uyumlu - cognac düzeltildi)
const COLORS = {
  white: '#FFFFFF',
  ivory: '#F9F6F2',
  paper: '#F5F3EF',
  cloud: '#F0F0F0',
  mist: '#E8E8E8',
  ash: '#888888',
  charcoal: '#222222',
  noir: '#000000',
  cognac: '#8C7853',  // ✅ DÜZELTİLDİ
  porcelain: '#FAFAFA',
  accent: '#8C7853',
  success: '#4CAF50',
  warning: '#FF9800',
  error: '#F44336',
  like: '#E91E63',
};

const StyleDetailScreen = ({ route, navigation }) => {
  const styleId = route?.params?.styleId || 'evening';
  const [activeSubTab, setActiveSubTab] = useState(0);

  // ✅ TÜM KONSEPTLER İÇİN ALT SEKMELER
  const styleData = {
    evening: {
      id: 'evening',
      title: 'AKŞAM STİLİ',
      description: 'Şık ve zarif akşam kıyafetleri',
      icon: 'moon-outline',
      subTabs: ['KOKTEYL', 'DÜĞÜN', 'GALA', 'ROMANTİK AKŞAM'],
      combinations: {
        'KOKTEYL': [
          { id: 1, name: 'Siyah Elbise & Kristal Aksesuar', likes: 124, image: 'https://images.unsplash.com/photo-1569317002804-ab77bcf1bce4?w=400' },
          { id: 2, name: 'Kırmızı Abiye & Altın Kemer', likes: 98, image: 'https://images.unsplash.com/photo-1539008835657-9e8e9680c956?w=400' },
          { id: 3, name: 'Saten Bluz & Siyah Pantolon', likes: 76, image: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=400' }
        ],
        'DÜĞÜN': [
          { id: 4, name: 'Pastel Elbise & İnce Topuk', likes: 156, image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=400' },
          { id: 5, name: 'Dantel Süs & İnci Kolye', likes: 112, image: 'https://images.unsplash.com/photo-1523380744952-b7e00e6e2ffa?w=400' },
          { id: 6, name: 'Uzun Etek & Nakış Bluz', likes: 89, image: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=400' }
        ],
        'GALA': [
          { id: 7, name: 'Gece Elbisesi & Pırlanta Set', likes: 203, image: 'https://images.unsplash.com/photo-1534452203293-494d7ddbf7e0?w=400' },
          { id: 8, name: 'Kürk Yelek & İpek Elbise', likes: 167, image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400' },
          { id: 9, name: 'Brode Kumaş & Kristal Topuk', likes: 134, image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=400' }
        ],
        'ROMANTİK AKŞAM': [
          { id: 10, name: 'Kırmızı Elbise & Kırmızı Ruj', likes: 145, image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=400' },
          { id: 11, name: 'Saten Gömlek & Deri Pantolon', likes: 98, image: 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=400' },
          { id: 12, name: 'İşlemeli Bluz & Midi Etek', likes: 76, image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400' }
        ]
      }
    },
    casual: {
      id: 'casual',
      title: 'GÜNLÜK STİL',
      description: 'Rahat ve şık günlük kıyafetler',
      icon: 'sunny-outline',
      subTabs: ['SPOR CASUAL', 'STREET STYLE', 'MİNİMAL', 'BOHEM'],
      combinations: {
        'SPOR CASUAL': [
          { id: 13, name: 'Oversize T-shirt & Kot Şort', likes: 234, image: 'https://images.unsplash.com/photo-1554568218-0f1715e72254?w=400' },
          { id: 14, name: 'Sweatshirt & Jogger Pantolon', likes: 187, image: 'https://images.unsplash.com/photo-1580657018955-f7aa5b3b3f0f?w=400' },
          { id: 15, name: 'Basketbol Atlet & Eşofman', likes: 156, image: 'https://images.unsplash.com/photo-1556906781-9a412961b5c8?w=400' }
        ],
        'STREET STYLE': [
          { id: 16, name: 'Bomber Ceket & Ripped Kot', likes: 198, image: 'https://images.unsplash.com/photo-1544441893-675973e31985?w=400' },
          { id: 17, name: 'Oversize Hoodie & Basket Ayakkabı', likes: 176, image: 'https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?w=400' },
          { id: 18, name: 'Graphic T-shirt & Sneaker', likes: 154, image: 'https://images.unsplash.com/photo-1554568218-0f1715e72254?w=400' }
        ],
        'MİNİMAL': [
          { id: 19, name: 'Beyaz Gömlek & Siyah Kot', likes: 167, image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=400' },
          { id: 20, name: 'Nötr Tonlar & Deri Ayakkabı', likes: 143, image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400' },
          { id: 21, name: 'Basic T-shirt & Chino Pantolon', likes: 128, image: 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=400' }
        ],
        'BOHEM': [
          { id: 22, name: 'İşlemeli Bluz & Maksı Etek', likes: 145, image: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=400' },
          { id: 23, name: 'Fular & Bol Pantolon', likes: 112, image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=400' },
          { id: 24, name: 'Nakış Detay & Doğal Aksesuar', likes: 98, image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=400' }
        ]
      }
    },
    business: {
      id: 'business',
      title: 'İŞ STİLİ',
      description: 'Profesyonel iş kıyafetleri',
      icon: 'briefcase-outline',
      subTabs: ['TOPLANTI', 'NORMAL GÜN', 'ÖZEL GÜN', 'DOĞUM GÜNÜ', 'TERFİ'],
      combinations: {
        'TOPLANTI': [
          { id: 25, name: 'Klasik Takım Elbise & Gömlek', likes: 189, image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=400' },
          { id: 26, name: 'Blazer & Siyah Pantolon', likes: 156, image: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=400' },
          { id: 27, name: 'İpek Bluz & Pencil Etek', likes: 134, image: 'https://images.unsplash.com/photo-1569317002804-ab77bcf1bce4?w=400' }
        ],
        'NORMAL GÜN': [
          { id: 28, name: 'Gömlek & Chino Pantolon', likes: 167, image: 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=400' },
          { id: 29, name: 'Kazak & Kot Pantolon', likes: 145, image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400' },
          { id: 30, name: 'Tunik & Düz Etek', likes: 123, image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=400' }
        ],
        'ÖZEL GÜN': [
          { id: 31, name: 'İpek Elbise & İnce Topuk', likes: 178, image: 'https://images.unsplash.com/photo-1539008835657-9e8e9680c956?w=400' },
          { id: 32, name: 'Saten Bluz & Sade Takı', likes: 154, image: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=400' },
          { id: 33, name: 'Kırmızı Gömlek & Siyah Pantolon', likes: 132, image: 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=400' }
        ],
        'DOĞUM GÜNÜ': [
          { id: 34, name: 'Renkli Bluz & Siyah Pantolon', likes: 145, image: 'https://images.unsplash.com/photo-1523380744952-b7e00e6e2ffa?w=400' },
          { id: 35, name: 'Desenli Elbise & Topuklu', likes: 128, image: 'https://images.unsplash.com/photo-1534452203293-494d7ddbf7e0?w=400' },
          { id: 36, name: 'Sequins Top & Denim Pantolon', likes: 112, image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400' }
        ],
        'TERFİ': [
          { id: 37, name: 'Koyu Takım Elbise & Kırmızı Gömlek', likes: 167, image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=400' },
          { id: 38, name: 'Siyah Elbise & İnci Kolye', likes: 145, image: 'https://images.unsplash.com/photo-1539008835657-9e8e9680c956?w=400' },
          { id: 39, name: 'Blazer & İpek Bluz', likes: 134, image: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=400' }
        ]
      }
    },
    sports: {
      id: 'sports',
      title: 'SPOR STİLİ',
      description: 'Konforlu ve fonksiyonel spor kıyafetleri',
      icon: 'fitness-outline',
      subTabs: ['FITNESS', 'YOGA', 'KOŞU', 'OUTDOOR'],
      combinations: {
        'FITNESS': [
          { id: 40, name: 'Tank Top & Legging', likes: 198, image: 'https://images.unsplash.com/photo-1556906781-9a412961b5c8?w=400' },
          { id: 41, name: 'Spor Atlet & Şort', likes: 176, image: 'https://images.unsplash.com/photo-1580657018955-f7aa5b3b3f0f?w=400' },
          { id: 42, name: 'Croptop & Eşofman', likes: 154, image: 'https://images.unsplash.com/photo-1554568218-0f1715e72254?w=400' }
        ],
        'YOGA': [
          { id: 43, name: 'Yoga Pantolon & Sports Bra', likes: 167, image: 'https://images.unsplash.com/photo-1556906781-9a412961b5c8?w=400' },
          { id: 44, name: 'Legging & Oversize T-shirt', likes: 145, image: 'https://images.unsplash.com/photo-1580657018955-f7aa5b3b3f0f?w=400' },
          { id: 45, name: 'Yoga Set & Mat', likes: 128, image: 'https://images.unsplash.com/photo-1554568218-0f1715e72254?w=400' }
        ],
        'KOŞU': [
          { id: 46, name: 'Running Atlet & Şort', likes: 156, image: 'https://images.unsplash.com/photo-1556906781-9a412961b5c8?w=400' },
          { id: 47, name: 'Rüzgarlık & Tights', likes: 134, image: 'https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?w=400' },
          { id: 48, name: 'Koşu Ayakkabısı & Şapka', likes: 112, image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400' }
        ],
        'OUTDOOR': [
          { id: 49, name: 'Hiking Pantolon & Polar', likes: 145, image: 'https://images.unsplash.com/photo-1556906781-9a412961b5c8?w=400' },
          { id: 50, name: 'Windbreaker & Trekking Ayakkabı', likes: 123, image: 'https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?w=400' },
          { id: 51, name: 'Fleece & Outdoor Şapka', likes: 98, image: 'https://images.unsplash.com/photo-1554568218-0f1715e72254?w=400' }
        ]
      }
    },
    special: {
      id: 'special',
      title: 'ÖZEL GÜNLER',
      description: 'Özel günler için unutulmaz stiller',
      icon: 'star-outline',
      subTabs: ['NİŞAN', 'MEZUNİYET', 'DOĞUM GÜNÜ', 'YILBAŞI'],
      combinations: {
        'NİŞAN': [
          { id: 52, name: 'Beyaz Elbise & İnce Topuk', likes: 223, image: 'https://images.unsplash.com/photo-1539008835657-9e8e9680c956?w=400' },
          { id: 53, name: 'Saten Bluz & Siyah Pantolon', likes: 187, image: 'https://images.unsplash.com/photo-1569317002804-ab77bcf1bce4?w=400' },
          { id: 54, name: 'Dantel Dress & İnci Set', likes: 165, image: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=400' }
        ],
        'MEZUNİYET': [
          { id: 55, name: 'Cübbe Altı Elbise & Topuklu', likes: 198, image: 'https://images.unsplash.com/photo-1523380744952-b7e00e6e2ffa?w=400' },
          { id: 56, name: 'Blazer & Midi Etek', likes: 167, image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=400' },
          { id: 57, name: 'Gömlek & Pantolon Kombini', likes: 145, image: 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=400' }
        ],
        'DOĞUM GÜNÜ': [
          { id: 58, name: 'Sequins Elbise & Topuklu', likes: 176, image: 'https://images.unsplash.com/photo-1534452203293-494d7ddbf7e0?w=400' },
          { id: 59, name: 'Renkli Bluz & Denim', likes: 154, image: 'https://images.unsplash.com/photo-1523380744952-b7e00e6e2ffa?w=400' },
          { id: 60, name: 'Parti Kıyafeti & Aksesuar', likes: 132, image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=400' }
        ],
        'YILBAŞI': [
          { id: 61, name: 'Kırmızı Elbise & Kristal', likes: 189, image: 'https://images.unsplash.com/photo-1539008835657-9e8e9680c956?w=400' },
          { id: 62, name: 'Saten Bluz & Siyah Pantolon', likes: 167, image: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=400' },
          { id: 63, name: 'Gece Kıyafeti & Topuklu', likes: 145, image: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=400' }
        ]
      }
    }
  };

  const currentStyle = styleData[styleId] || styleData.evening;
  const activeSubTabName = currentStyle.subTabs[activeSubTab] || currentStyle.subTabs[0];
  const currentCombinations = currentStyle.combinations[activeSubTabName] || [];

  const handleGoBack = () => {
    if (navigation && navigation.goBack) {
      navigation.goBack();
    } else {
      Alert.alert('Bilgi', 'Geri dönülüyor...');
    }
  };

  const handleViewCombination = (item) => {
    Alert.alert(
      item.name,
      `Bu kombin ${item.likes} kişi tarafından beğenildi.`,
      [
        {
          text: 'Detayları Gör',
          onPress: () => {
            if (navigation && navigation.navigate) {
              navigation.navigate('CombinationDetail', { combination: item });
            }
          }
        },
        { text: 'Kapat', style: 'cancel' }
      ]
    );
  };

  const renderCombinationItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.combinationCard}
      onPress={() => handleViewCombination(item)}
      activeOpacity={0.7}
    >
      <View style={styles.combinationContent}>
        <Text style={styles.combinationName}>{item.name}</Text>
        <View style={styles.likeContainer}>
          <Ionicons name="heart" size={16} color={COLORS.like} />
          <Text style={styles.likeCount}>{item.likes}</Text>
        </View>
      </View>
      <TouchableOpacity 
        style={styles.viewButton}
        onPress={() => handleViewCombination(item)}
      >
        <Text style={styles.viewButtonText}>DETAY</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
      
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={handleGoBack}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.charcoal} />
        </TouchableOpacity>
        <Text style={styles.title}>{currentStyle.title}</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.favoriteButton}>
            <Ionicons name="heart-outline" size={24} color={COLORS.charcoal} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.iconContainer}>
          <View style={styles.iconCircle}>
            <Ionicons name={currentStyle.icon || 'flower-outline'} size={32} color={COLORS.cognac} />
          </View>
          <Text style={styles.styleTitle}>{currentStyle.title}</Text>
          <Text style={styles.description}>{currentStyle.description}</Text>
        </View>

        <View style={styles.subTabsWrapper}>
          <Text style={styles.sectionLabel}>KATEGORİLER</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.subTabsContainer}
            contentContainerStyle={styles.subTabsContent}
          >
            {currentStyle.subTabs.map((tab, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.subTab,
                  activeSubTab === index && styles.activeSubTab
                ]}
                onPress={() => setActiveSubTab(index)}
                activeOpacity={0.7}
              >
                <Text style={[
                  styles.subTabText,
                  activeSubTab === index && styles.activeSubTabText
                ]}>
                  {tab}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.combinationsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              {activeSubTabName} KOMBİNLERİ
            </Text>
            <Text style={styles.sectionCount}>
              {currentCombinations.length} kombin
            </Text>
          </View>
          
          {currentCombinations.length > 0 ? (
            <FlatList
              data={currentCombinations}
              renderItem={renderCombinationItem}
              keyExtractor={item => item.id.toString()}
              scrollEnabled={false}
            />
          ) : (
            <View style={styles.emptyContainer}>
              <Ionicons name="images-outline" size={48} color={COLORS.ash} />
              <Text style={styles.emptyText}>Bu kategoride kombin bulunamadı</Text>
            </View>
          )}
        </View>

        <View style={styles.aiSuggestion}>
          <Ionicons name="sparkles" size={20} color={COLORS.cognac} />
          <Text style={styles.aiText}>
            AI size {activeSubTabName.toLowerCase()} için özel kombinler öneriyor
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  scrollContent: {
    paddingBottom: 30,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.cloud,
  },
  backButton: {
    padding: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.charcoal,
    letterSpacing: 1,
  },
  headerRight: {
    flexDirection: 'row',
  },
  favoriteButton: {
    padding: 4,
  },
  iconContainer: {
    alignItems: 'center',
    paddingVertical: 24,
    backgroundColor: COLORS.ivory,
    marginBottom: 16,
  },
  iconCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 2,
    borderColor: COLORS.cognac,
  },
  styleTitle: {
    fontSize: 24,
    fontWeight: '300',
    color: COLORS.charcoal,
    letterSpacing: 2,
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: COLORS.ash,
    textAlign: 'center',
    paddingHorizontal: 32,
    lineHeight: 22,
  },
  subTabsWrapper: {
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.ash,
    letterSpacing: 1,
    marginBottom: 12,
  },
  subTabsContainer: {
    marginBottom: 8,
  },
  subTabsContent: {
    paddingRight: 20,
  },
  subTab: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginRight: 8,
    borderRadius: 25,
    backgroundColor: COLORS.porcelain,
    borderWidth: 1,
    borderColor: COLORS.cloud,
  },
  activeSubTab: {
    backgroundColor: COLORS.cognac,
    borderColor: COLORS.cognac,
  },
  subTabText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.ash,
  },
  activeSubTabText: {
    color: COLORS.white,
  },
  combinationsSection: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.charcoal,
    letterSpacing: 1,
  },
  sectionCount: {
    fontSize: 14,
    color: COLORS.ash,
  },
  combinationCard: {
    backgroundColor: COLORS.porcelain,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.cloud,
  },
  combinationContent: {
    flex: 1,
  },
  combinationName: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.charcoal,
    marginBottom: 8,
  },
  likeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  likeCount: {
    fontSize: 14,
    color: COLORS.ash,
    marginLeft: 4,
  },
  viewButton: {
    backgroundColor: COLORS.cognac,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  viewButtonText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
    backgroundColor: COLORS.porcelain,
    borderRadius: 12,
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.ash,
    marginTop: 12,
  },
  aiSuggestion: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.ivory,
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 12,
    gap: 12,
    borderWidth: 1,
    borderColor: COLORS.cognac,
  },
  aiText: {
    flex: 1,
    fontSize: 14,
    color: COLORS.charcoal,
    lineHeight: 20,
  },
});

export default StyleDetailScreen;