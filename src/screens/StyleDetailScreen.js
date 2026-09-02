// 📁 src/screens/StyleDetailScreen.js - LÜKS MİNİMALİST VERSİYON
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
  Dimensions,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY, SIZES } from '../constants/Theme';

const { width } = Dimensions.get('window');

const StyleDetailScreen = ({ route, navigation }) => {
  const styleId = route?.params?.styleId || 'evening';
  const [activeSubTab, setActiveSubTab] = useState(0);

  const styleData = {
    evening: {
      id: 'evening',
      title: 'AKŞAM STİLİ',
      description: 'Şık ve zarif akşam kıyafetleri',
      icon: 'moon-outline',
      subTabs: ['KOKTEYL', 'DÜĞÜN', 'GALA', 'ROMANTİK AKŞAM'],
      combinations: {
        'KOKTEYL': [
          { id: 1, name: 'Siyah Elbise & Kristal Aksesuar', likes: 124 },
          { id: 2, name: 'Kırmızı Abiye & Altın Kemer', likes: 98 },
          { id: 3, name: 'Saten Bluz & Siyah Pantolon', likes: 76 }
        ],
        'DÜĞÜN': [
          { id: 4, name: 'Pastel Elbise & İnce Topuk', likes: 156 },
          { id: 5, name: 'Dantel Süs & İnci Kolye', likes: 112 },
          { id: 6, name: 'Uzun Etek & Nakış Bluz', likes: 89 }
        ],
        'GALA': [
          { id: 7, name: 'Gece Elbisesi & Pırlanta Set', likes: 203 },
          { id: 8, name: 'Kürk Yelek & İpek Elbise', likes: 167 },
          { id: 9, name: 'Brode Kumaş & Kristal Topuk', likes: 134 }
        ],
        'ROMANTİK AKŞAM': [
          { id: 10, name: 'Kırmızı Elbise & Kırmızı Ruj', likes: 145 },
          { id: 11, name: 'Saten Gömlek & Deri Pantolon', likes: 98 },
          { id: 12, name: 'İşlemeli Bluz & Midi Etek', likes: 76 }
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
          { id: 13, name: 'Oversize T-shirt & Kot Şort', likes: 234 },
          { id: 14, name: 'Sweatshirt & Jogger Pantolon', likes: 187 },
          { id: 15, name: 'Basketbol Atlet & Eşofman', likes: 156 }
        ],
        'STREET STYLE': [
          { id: 16, name: 'Bomber Ceket & Ripped Kot', likes: 198 },
          { id: 17, name: 'Oversize Hoodie & Basket Ayakkabı', likes: 176 },
          { id: 18, name: 'Graphic T-shirt & Sneaker', likes: 154 }
        ],
        'MİNİMAL': [
          { id: 19, name: 'Beyaz Gömlek & Siyah Kot', likes: 167 },
          { id: 20, name: 'Nötr Tonlar & Deri Ayakkabı', likes: 143 },
          { id: 21, name: 'Basic T-shirt & Chino Pantolon', likes: 128 }
        ],
        'BOHEM': [
          { id: 22, name: 'İşlemeli Bluz & Maksı Etek', likes: 145 },
          { id: 23, name: 'Fular & Bol Pantolon', likes: 112 },
          { id: 24, name: 'Nakış Detay & Doğal Aksesuar', likes: 98 }
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
          { id: 25, name: 'Klasik Takım Elbise & Gömlek', likes: 189 },
          { id: 26, name: 'Blazer & Siyah Pantolon', likes: 156 },
          { id: 27, name: 'İpek Bluz & Pencil Etek', likes: 134 }
        ],
        'NORMAL GÜN': [
          { id: 28, name: 'Gömlek & Chino Pantolon', likes: 167 },
          { id: 29, name: 'Kazak & Kot Pantolon', likes: 145 },
          { id: 30, name: 'Tunik & Düz Etek', likes: 123 }
        ],
        'ÖZEL GÜN': [
          { id: 31, name: 'İpek Elbise & İnce Topuk', likes: 178 },
          { id: 32, name: 'Saten Bluz & Sade Takı', likes: 154 },
          { id: 33, name: 'Kırmızı Gömlek & Siyah Pantolon', likes: 132 }
        ],
        'DOĞUM GÜNÜ': [
          { id: 34, name: 'Renkli Bluz & Siyah Pantolon', likes: 145 },
          { id: 35, name: 'Desenli Elbise & Topuklu', likes: 128 },
          { id: 36, name: 'Sequins Top & Denim Pantolon', likes: 112 }
        ],
        'TERFİ': [
          { id: 37, name: 'Koyu Takım Elbise & Kırmızı Gömlek', likes: 167 },
          { id: 38, name: 'Siyah Elbise & İnci Kolye', likes: 145 },
          { id: 39, name: 'Blazer & İpek Bluz', likes: 134 }
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
          { id: 40, name: 'Tank Top & Legging', likes: 198 },
          { id: 41, name: 'Spor Atlet & Şort', likes: 176 },
          { id: 42, name: 'Croptop & Eşofman', likes: 154 }
        ],
        'YOGA': [
          { id: 43, name: 'Yoga Pantolon & Sports Bra', likes: 167 },
          { id: 44, name: 'Legging & Oversize T-shirt', likes: 145 },
          { id: 45, name: 'Yoga Set & Mat', likes: 128 }
        ],
        'KOŞU': [
          { id: 46, name: 'Running Atlet & Şort', likes: 156 },
          { id: 47, name: 'Rüzgarlık & Tights', likes: 134 },
          { id: 48, name: 'Koşu Ayakkabısı & Şapka', likes: 112 }
        ],
        'OUTDOOR': [
          { id: 49, name: 'Hiking Pantolon & Polar', likes: 145 },
          { id: 50, name: 'Windbreaker & Trekking Ayakkabı', likes: 123 },
          { id: 51, name: 'Fleece & Outdoor Şapka', likes: 98 }
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
          { id: 52, name: 'Beyaz Elbise & İnce Topuk', likes: 223 },
          { id: 53, name: 'Saten Bluz & Siyah Pantolon', likes: 187 },
          { id: 54, name: 'Dantel Dress & İnci Set', likes: 165 }
        ],
        'MEZUNİYET': [
          { id: 55, name: 'Cübbe Altı Elbise & Topuklu', likes: 198 },
          { id: 56, name: 'Blazer & Midi Etek', likes: 167 },
          { id: 57, name: 'Gömlek & Pantolon Kombini', likes: 145 }
        ],
        'DOĞUM GÜNÜ': [
          { id: 58, name: 'Sequins Elbise & Topuklu', likes: 176 },
          { id: 59, name: 'Renkli Bluz & Denim', likes: 154 },
          { id: 60, name: 'Parti Kıyafeti & Aksesuar', likes: 132 }
        ],
        'YILBAŞI': [
          { id: 61, name: 'Kırmızı Elbise & Kristal', likes: 189 },
          { id: 62, name: 'Saten Bluz & Siyah Pantolon', likes: 167 },
          { id: 63, name: 'Gece Kıyafeti & Topuklu', likes: 145 }
        ]
      }
    }
  };

  const currentStyle = styleData[styleId] || styleData.evening;
  const activeSubTabName = currentStyle.subTabs[activeSubTab] || currentStyle.subTabs[0];
  const currentCombinations = currentStyle.combinations[activeSubTabName] || [];

  const formatNumber = (num) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

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
      `Bu kombin ${formatNumber(item.likes)} kişi tarafından beğenildi.`,
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
          <Ionicons name="heart" size={10} color={COLORS.grayMedium} />
          <Text style={styles.likeCount}>{formatNumber(item.likes)}</Text>
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
          <Ionicons name="arrow-back" size={22} color={COLORS.black} />
        </TouchableOpacity>
        <Text style={styles.title}>{currentStyle.title}</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.favoriteButton}>
            <Ionicons name="heart-outline" size={18} color={COLORS.black} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.iconContainer}>
          <View style={styles.iconCircle}>
            <Ionicons name={currentStyle.icon || 'flower-outline'} size={22} color={COLORS.black} />
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
              {currentCombinations.length} KOMBİN
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
              <Ionicons name="images-outline" size={32} color={COLORS.grayMedium} />
              <Text style={styles.emptyText}>BU KATEGORİDE KOMBİN BULUNAMADI</Text>
            </View>
          )}
        </View>

        <View style={styles.aiSuggestion}>
          <Ionicons name="sparkles" size={14} color={COLORS.black} />
          <Text style={styles.aiText}>
            AI size {activeSubTabName.toLowerCase()} için özel kombinler öneriyor
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// ============ STILLER ============
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  scrollContent: {
    paddingBottom: SIZES.xl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SIZES.lg,
    paddingTop: Platform.OS === 'ios' ? 12 : SIZES.md,
    paddingBottom: SIZES.md,
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.grayLight,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  title: {
    ...TYPOGRAPHY.caption,
    letterSpacing: 1,
  },
  headerRight: {
    flexDirection: 'row',
  },
  favoriteButton: {
    padding: SIZES.xs,
  },
  iconContainer: {
    alignItems: 'center',
    paddingVertical: SIZES.xl,
    backgroundColor: COLORS.surface,
    marginBottom: SIZES.md,
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderWidth: 0.5,
    borderColor: COLORS.grayLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SIZES.md,
  },
  styleTitle: {
    ...TYPOGRAPHY.caption,
    fontSize: 16,
    letterSpacing: 2,
    marginBottom: SIZES.xs,
  },
  description: {
    ...TYPOGRAPHY.bodySmall,
    textAlign: 'center',
    paddingHorizontal: SIZES.xl,
    lineHeight: 18,
  },
  subTabsWrapper: {
    paddingHorizontal: SIZES.lg,
    marginBottom: SIZES.lg,
  },
  sectionLabel: {
    ...TYPOGRAPHY.caption,
    fontSize: 9,
    marginBottom: SIZES.md,
  },
  subTabsContainer: {
    marginBottom: SIZES.sm,
  },
  subTabsContent: {
    paddingRight: SIZES.lg,
  },
  subTab: {
    paddingHorizontal: SIZES.lg,
    paddingVertical: SIZES.sm,
    marginRight: SIZES.sm,
    borderWidth: 0.5,
    borderColor: COLORS.grayLight,
  },
  activeSubTab: {
    backgroundColor: COLORS.black,
    borderColor: COLORS.black,
  },
  subTabText: {
    ...TYPOGRAPHY.caption,
    fontSize: 10,
    color: COLORS.grayMedium,
  },
  activeSubTabText: {
    color: COLORS.white,
  },
  combinationsSection: {
    paddingHorizontal: SIZES.lg,
    marginBottom: SIZES.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.md,
  },
  sectionTitle: {
    ...TYPOGRAPHY.caption,
    fontSize: 11,
  },
  sectionCount: {
    ...TYPOGRAPHY.caption,
    fontSize: 9,
    color: COLORS.grayMedium,
  },
  combinationCard: {
    backgroundColor: COLORS.white,
    padding: SIZES.md,
    marginBottom: SIZES.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 0.5,
    borderColor: COLORS.grayLight,
  },
  combinationContent: {
    flex: 1,
  },
  combinationName: {
    ...TYPOGRAPHY.bodySmall,
    fontWeight: '500',
    marginBottom: 4,
  },
  likeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  likeCount: {
    ...TYPOGRAPHY.caption,
    fontSize: 9,
    color: COLORS.grayMedium,
    marginLeft: 4,
  },
  viewButton: {
    borderWidth: 0.5,
    borderColor: COLORS.grayLight,
    paddingHorizontal: SIZES.md,
    paddingVertical: 4,
  },
  viewButtonText: {
    ...TYPOGRAPHY.caption,
    fontSize: 8,
    color: COLORS.black,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: SIZES.xl,
    borderWidth: 0.5,
    borderColor: COLORS.grayLight,
  },
  emptyText: {
    ...TYPOGRAPHY.caption,
    fontSize: 9,
    color: COLORS.grayMedium,
    marginTop: SIZES.md,
  },
  aiSuggestion: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 0.5,
    borderColor: COLORS.grayLight,
    marginHorizontal: SIZES.lg,
    padding: SIZES.md,
    gap: SIZES.sm,
  },
  aiText: {
    flex: 1,
    ...TYPOGRAPHY.caption,
    fontSize: 10,
    lineHeight: 16,
  },
});

export default StyleDetailScreen;