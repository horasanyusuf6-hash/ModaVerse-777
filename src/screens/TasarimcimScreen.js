// 📁 src/screens/TasarimcimScreen.js - REVİZE EDİLMİŞ TAM VERSİYON
import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  StatusBar,
  ScrollView,
  Image,
  TouchableOpacity,
  FlatList,
  TextInput,
  Dimensions,
  Modal,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

// ✅ RENK PALETI (App.js ile uyumlu - TÜM RENKLER TAMAMLANDI)
const COLORS = {
  white: '#FFFFFF',
  ivory: '#F9F6F2',
  paper: '#F5F3EF',
  cloud: '#F0F0F0',
  mist: '#E8E8E8',
  ash: '#888888',
  charcoal: '#222222',
  noir: '#000000',
  accent: '#8C7853',
  success: '#8C7853',
  warning: '#B8A99A',
  error: '#A1887F',
  cognac: '#8C7853',
  porcelain: '#FAFAFA',
  gold: '#D4AF37',
  goldLight: '#E6C158',
};

const TasarimcimScreen = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('designers');
  const [showMenu, setShowMenu] = useState(false);
  const [selectedDesigner, setSelectedDesigner] = useState(null);

  // ✅ MARKA/TASARIMCI KATEGORILERI
  const categories = [
    { id: 'all', name: 'Tümü', icon: 'grid-outline' },
    { id: 'luxury', name: 'Lüks', icon: 'diamond-outline' },
    { id: 'street', name: 'Street', icon: 'walk-outline' },
    { id: 'sustainable', name: 'Sürdürülebilir', icon: 'leaf-outline' },
    { id: 'minimalist', name: 'Minimalist', icon: 'apps-outline' },
    { id: 'vintage', name: 'Vintage', icon: 'time-outline' },
  ];

  // ✅ GERÇEK TASARIMCILAR & MARKALAR
  const designersData = [
    {
      id: '1',
      type: 'designer',
      name: 'Zeynep Ak',
      title: 'Sürdürülebilir Moda Tasarımcısı',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=300',
      cover: 'https://images.unsplash.com/photo-1539008835657-9e8e9680c956?w=800',
      followers: '12.5K',
      rating: 4.8,
      projects: 42,
      location: 'İstanbul',
      website: 'zeynepak.com',
      instagram: '@zeynepakstudio',
      description: 'Sürdürülebilir ve etik moda üzerine çalışan ödüllü tasarımcı.',
      collections: ['Eko-Koleksiyon 2024', 'Doğal Dokunuşlar'],
      products: [
        { id: 'p1', name: 'Organik Pamuk Elbise', price: 1299, image: 'https://images.unsplash.com/photo-1569317002804-ab77bcf1bce4?w=400' },
        { id: 'p2', name: 'Geri Dönüşümlü Ceket', price: 899, image: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=400' },
      ],
      isVerified: true,
    },
    {
      id: '2',
      type: 'brand',
      name: 'Nike',
      title: 'Spor Giyim & Sneaker',
      avatar: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300',
      cover: 'https://images.unsplash.com/photo-1544441893-675973e31985?w=800',
      followers: '2.1M',
      rating: 4.7,
      products: 156,
      location: 'Global',
      website: 'nike.com',
      instagram: '@nike',
      description: 'Dünyanın önde gelen spor giyim ve ayakkabı markası.',
      collections: ['Air Max Serisi', 'Jordan Koleksiyonu'],
      designers: ['Tinker Hatfield', 'Peter Moore'],
      isVerified: true,
    },
    {
      id: '3',
      type: 'designer',
      name: 'Can Demir',
      title: 'Street Style Tasarımcısı',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300',
      cover: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800',
      followers: '8.7K',
      rating: 4.6,
      projects: 28,
      location: 'İstanbul',
      website: 'candemir.com',
      instagram: '@candesigns',
      description: 'Urban kültürden ilham alan genç tasarımcı.',
      collections: ['Urban Warriors', 'City Lights'],
      products: [
        { id: 'p3', name: 'Oversize Hoodie', price: 599, image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400' },
        { id: 'p4', name: 'Cargo Jogger', price: 449, image: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=400' },
      ],
      isVerified: false,
    },
    {
      id: '4',
      type: 'brand',
      name: 'ZARA',
      title: 'Fast Fashion',
      avatar: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=300',
      cover: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800',
      followers: '3.4M',
      rating: 4.5,
      products: 892,
      location: 'Global',
      website: 'zara.com',
      instagram: '@zara',
      description: 'Trendleri hızlı şekilde tüketiciye ulaştıran global marka.',
      collections: ['TRF Genç', 'Premium Collection'],
      designers: ['Amancio Ortega', 'Marta Ortega'],
      isVerified: true,
    },
    {
      id: '5',
      type: 'designer',
      name: 'Elif Şahin',
      title: 'Lüks Giyim Tasarımcısı',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300',
      cover: 'https://images.unsplash.com/photo-1534452203293-494d7ddbf7e0?w=800',
      followers: '15.2K',
      rating: 4.9,
      projects: 56,
      location: 'Paris',
      website: 'elifsahin.com',
      instagram: '@elifsahin.haute',
      description: 'Paris merkezli lüks giyim ve haute couture tasarımcısı.',
      collections: ['Parisian Nights', 'Golden Age'],
      products: [
        { id: 'p5', name: 'İpek Gece Elbisesi', price: 3499, image: 'https://images.unsplash.com/photo-1539008835657-9e8e9680c956?w=400' },
        { id: 'p6', name: 'Kadife Blazer', price: 1899, image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=400' },
      ],
      isVerified: true,
    },
  ];

  // ✅ AI DANIŞMAN VERISI
  const aiConsultant = {
    name: 'AI Stil Danışmanım',
    avatar: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=300',
    description: 'Yapay zeka destekli kişisel stil danışmanınız.',
    features: [
      'Gardırop Analizi',
      'Kombin Önerileri',
      'Trend Takibi',
      'Alışveriş Asistanı'
    ],
    stats: {
      analyses: '1,248',
      satisfaction: '94%',
      recommendations: '357'
    }
  };

  // ✅ ÖRNEK SORULAR (AI Danışman için)
  const sampleQuestions = [
    { id: 'q1', text: 'Bana hangi renkler yakışır?' },
    { id: 'q2', text: 'Mezuniyet töreni için kombin önerir misin?' },
    { id: 'q3', text: 'Vücut tipime göre hangi kıyafetleri seçmeliyim?' },
    { id: 'q4', text: 'Gardırobumdaki parçalarla kaç kombin yapabilirim?' },
    { id: 'q5', text: 'Bu sezon hangi trendler öne çıkıyor?' },
    { id: 'q6', text: 'Ofis şıklığı için temel parçalar neler?' },
  ];

  // ✅ 3 ÇİZGİ MENÜ İÇERİĞİ
  const menuItems = [
    { id: 1, name: 'Profilim', icon: 'person-outline' },
    { id: 2, name: 'Ayarlar', icon: 'settings-outline' },
    { id: 3, name: 'Favorilerim', icon: 'heart-outline' },
    { id: 4, name: 'Siparişlerim', icon: 'cube-outline' },
    { id: 5, name: 'Yardım', icon: 'help-circle-outline' },
    { id: 6, name: 'Çıkış Yap', icon: 'log-out-outline' },
  ];

  // ✅ AI DANIŞMAN KARTI
  const AIConsultantCard = () => (
    <TouchableOpacity 
      style={styles.aiCard}
      onPress={() => setActiveTab('ai')}
      activeOpacity={0.9}
    >
      <Image 
        source={{ uri: aiConsultant.avatar }} 
        style={styles.aiAvatar} 
      />
      
      <View style={styles.aiContent}>
        <View style={styles.aiHeader}>
          <Text style={styles.aiTitle}>🤖 {aiConsultant.name}</Text>
          <View style={styles.aiBadge}>
            <Ionicons name="sparkles" size={14} color="#FFF" />
            <Text style={styles.aiBadgeText}>AI</Text>
          </View>
        </View>
        
        <Text style={styles.aiDescription}>
          {aiConsultant.description} Kişisel stil analizi ve öneriler için tıklayın.
        </Text>
        
        <View style={styles.aiFeatures}>
          {aiConsultant.features.map((feature, index) => (
            <View key={index} style={styles.featureTag}>
              <Text style={styles.featureText}>{feature}</Text>
            </View>
          ))}
        </View>
        
        <View style={styles.aiStats}>
          <View style={styles.aiStat}>
            <Text style={styles.statNumber}>{aiConsultant.stats.analyses}</Text>
            <Text style={styles.statLabel}>Analiz</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.aiStat}>
            <Text style={styles.statNumber}>{aiConsultant.stats.satisfaction}</Text>
            <Text style={styles.statLabel}>Memnuniyet</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.aiStat}>
            <Text style={styles.statNumber}>{aiConsultant.stats.recommendations}</Text>
            <Text style={styles.statLabel}>Öneri</Text>
          </View>
        </View>
        
        <TouchableOpacity style={styles.aiButton} onPress={() => setActiveTab('ai')}>
          <Ionicons name="chatbubble-ellipses" size={20} color="#FFF" />
          <Text style={styles.aiButtonText}>Danışmana Sor</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  // ✅ AI DANIŞMAN İÇERİĞİ
  const AITabContent = () => (
    <View style={styles.aiTabContent}>
      <View style={styles.aiWelcomeCard}>
        <Ionicons name="sparkles" size={60} color={COLORS.accent} />
        <Text style={styles.aiWelcomeTitle}>AI Stil Danışmanım</Text>
        <Text style={styles.aiWelcomeText}>
          Size özel stil analizleri, kombin önerileri ve trend takibi için sorularınızı bekliyorum. 
          Aklınızdaki her şeyi bana sorabilirsiniz!
        </Text>
      </View>

      <View style={styles.sampleQuestionsContainer}>
        <Text style={styles.sampleQuestionsTitle}>💭 Sık Sorulan Sorular</Text>
        <Text style={styles.sampleQuestionsSubtitle}>
          Aşağıdaki sorulara tıklayarak hızlıca başlayabilirsiniz
        </Text>
        
        <View style={styles.questionsGrid}>
          {sampleQuestions.map((item) => (
            <TouchableOpacity 
              key={item.id} 
              style={styles.questionCard}
              onPress={() => {
                Alert.alert(
                  '🤖 AI Danışman',
                  `"${item.text}" sorusu için en kısa sürede cevap vereceğim.`,
                  [{ text: 'Tamam' }]
                );
              }}
            >
              <View style={styles.questionIcon}>
                <Ionicons name="help-circle" size={24} color={COLORS.accent} />
              </View>
              <Text style={styles.questionText}>{item.text}</Text>
              <Ionicons name="arrow-forward" size={20} color={COLORS.accent} />
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <TouchableOpacity style={styles.startChatButton}>
        <Ionicons name="chatbubbles" size={24} color={COLORS.white} />
        <Text style={styles.startChatText}>Yeni Sohbet Başlat</Text>
      </TouchableOpacity>

      <View style={styles.aiStatsCard}>
        <View style={styles.aiStatItem}>
          <Text style={styles.aiStatNumber}>1,248</Text>
          <Text style={styles.aiStatLabel}>Analiz</Text>
        </View>
        <View style={styles.aiStatDivider} />
        <View style={styles.aiStatItem}>
          <Text style={styles.aiStatNumber}>94%</Text>
          <Text style={styles.aiStatLabel}>Memnuniyet</Text>
        </View>
        <View style={styles.aiStatDivider} />
        <View style={styles.aiStatItem}>
          <Text style={styles.aiStatNumber}>357</Text>
          <Text style={styles.aiStatLabel}>Öneri</Text>
        </View>
      </View>
    </View>
  );

  // ✅ TASARIMCI/MARKA KARTI
  const DesignerCard = ({ item }) => (
    <TouchableOpacity 
      style={styles.designerCard}
      onPress={() => setSelectedDesigner(item)}
      activeOpacity={0.8}
    >
      <View style={styles.cardHeader}>
        <Image source={{ uri: item.avatar }} style={styles.designerAvatar} />
        <View style={styles.verificationBadge}>
          {item.isVerified && (
            <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
          )}
        </View>
      </View>
      
      <View style={styles.cardContent}>
        <View style={styles.nameRow}>
          <Text style={styles.designerName}>{item.name}</Text>
          <View style={styles.typeBadge}>
            <Text style={styles.typeText}>
              {item.type === 'designer' ? '👨‍🎨' : '🏢'}
            </Text>
          </View>
        </View>
        
        <Text style={styles.designerTitle}>{item.title}</Text>
        
        <View style={styles.designerStats}>
          <View style={styles.stat}>
            <Ionicons name="people-outline" size={14} color={COLORS.ash} />
            <Text style={styles.statText}>{item.followers}</Text>
          </View>
          <View style={styles.stat}>
            <Ionicons name="star-outline" size={14} color="#FFD700" />
            <Text style={styles.statText}>{item.rating}</Text>
          </View>
          <View style={styles.stat}>
            <Ionicons name="cube-outline" size={14} color={COLORS.ash} />
            <Text style={styles.statText}>
              {item.type === 'designer' ? `${item.projects}` : `${item.products}`}
            </Text>
          </View>
        </View>
        
        <Text style={styles.designerLocation}>
          <Ionicons name="location-outline" size={12} color={COLORS.ash} /> {item.location}
        </Text>
      </View>
      
      <TouchableOpacity style={styles.followButton}>
        <Ionicons name="add" size={18} color={COLORS.accent} />
        <Text style={styles.followText}>Takip Et</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  // ✅ TASARIMCI DETAY MODALI
  const DesignerDetailModal = () => {
    if (!selectedDesigner) return null;
    
    return (
      <Modal
        visible={!!selectedDesigner}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setSelectedDesigner(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <ScrollView>
              <View style={styles.modalHeader}>
                <Image 
                  source={{ uri: selectedDesigner.cover }} 
                  style={styles.modalCover} 
                />
                <TouchableOpacity 
                  style={styles.closeButton}
                  onPress={() => setSelectedDesigner(null)}
                >
                  <Ionicons name="close" size={24} color="#FFF" />
                </TouchableOpacity>
                
                <View style={styles.modalProfile}>
                  <Image 
                    source={{ uri: selectedDesigner.avatar }} 
                    style={styles.modalAvatar} 
                  />
                  <View style={styles.modalProfileInfo}>
                    <Text style={styles.modalName}>{selectedDesigner.name}</Text>
                    <Text style={styles.modalTitle}>{selectedDesigner.title}</Text>
                  </View>
                </View>
              </View>
              
              <View style={styles.modalContent}>
                <Text style={styles.modalDescription}>
                  {selectedDesigner.description}
                </Text>
                
                <View style={styles.socialLinks}>
                  <TouchableOpacity style={styles.socialButton}>
                    <Ionicons name="globe-outline" size={18} color={COLORS.accent} />
                    <Text style={styles.socialText}>{selectedDesigner.website}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.socialButton}>
                    <Ionicons name="logo-instagram" size={18} color={COLORS.accent} />
                    <Text style={styles.socialText}>{selectedDesigner.instagram}</Text>
                  </TouchableOpacity>
                </View>
                
                <Text style={styles.sectionTitle}>Koleksiyonlar</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {selectedDesigner.collections?.map((collection, index) => (
                    <View key={index} style={styles.collectionCard}>
                      <Text style={styles.collectionName}>{collection}</Text>
                    </View>
                  ))}
                </ScrollView>
                
                <Text style={styles.sectionTitle}>Öne Çıkan Ürünler</Text>
                <View style={styles.productsGrid}>
                  {selectedDesigner.products?.map((product) => (
                    <TouchableOpacity key={product.id} style={styles.productCard}>
                      <Image 
                        source={{ uri: product.image }} 
                        style={styles.productImage} 
                      />
                      <Text style={styles.productName}>{product.name}</Text>
                      <Text style={styles.productPrice}>₺{product.price}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    );
  };

  // ✅ 3 ÇİZGİ MENÜ MODALI
  const HamburgerMenu = () => (
    <Modal
      visible={showMenu}
      transparent={true}
      animationType="fade"
      onRequestClose={() => setShowMenu(false)}
    >
      <TouchableOpacity 
        style={styles.menuOverlay}
        activeOpacity={1}
        onPress={() => setShowMenu(false)}
      >
        <View style={styles.menuContainer}>
          <View style={styles.menuHeader}>
            <Text style={styles.menuTitle}>Menü</Text>
            <TouchableOpacity onPress={() => setShowMenu(false)}>
              <Ionicons name="close" size={24} color={COLORS.charcoal} />
            </TouchableOpacity>
          </View>
          
          {menuItems.map((item) => (
            <TouchableOpacity key={item.id} style={styles.menuItem}>
              <Ionicons name={item.icon} size={22} color={COLORS.ash} />
              <Text style={styles.menuItemText}>{item.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </TouchableOpacity>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
      
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.menuButton}
          onPress={() => setShowMenu(true)}
        >
          <Ionicons name="menu-outline" size={28} color={COLORS.charcoal} />
        </TouchableOpacity>
        
        <View style={styles.headerCenter}>
          <Text style={styles.title}>Tasarımcım</Text>
          <Text style={styles.subtitle}>Markalar & Tasarımcılar</Text>
        </View>
        
        <TouchableOpacity style={styles.notificationButton}>
          <Ionicons name="notifications-outline" size={24} color={COLORS.charcoal} />
          <View style={styles.notificationBadge} />
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.mainScrollView}
        showsVerticalScrollIndicator={true}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Ionicons name="search-outline" size={20} color={COLORS.ash} />
            <TextInput
              style={styles.searchInput}
              placeholder="Tasarımcı veya marka ara..."
              placeholderTextColor={COLORS.ash}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={18} color={COLORS.ash} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        <AIConsultantCard />

        <View style={styles.tabNavigation}>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'designers' && styles.activeTab]}
            onPress={() => setActiveTab('designers')}
          >
            <Text style={[styles.tabText, activeTab === 'designers' && styles.activeTabText]}>
              Tasarımcılar
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'brands' && styles.activeTab]}
            onPress={() => setActiveTab('brands')}
          >
            <Text style={[styles.tabText, activeTab === 'brands' && styles.activeTabText]}>
              Markalar
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'ai' && styles.activeTab]}
            onPress={() => setActiveTab('ai')}
          >
            <Text style={[styles.tabText, activeTab === 'ai' && styles.activeTabText]}>
              AI Danışman
            </Text>
          </TouchableOpacity>
        </View>

        {activeTab !== 'ai' && (
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.categoriesScroll}
          >
            {categories.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={styles.categoryButton}
              >
                <Ionicons name={category.icon} size={16} color={COLORS.charcoal} />
                <Text style={styles.categoryText}>{category.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        {activeTab === 'ai' ? (
          <AITabContent />
        ) : (
          <View style={styles.designersContainer}>
            <FlatList
              data={designersData.filter(item => 
                activeTab === 'designers' ? item.type === 'designer' :
                activeTab === 'brands' ? item.type === 'brand' :
                designersData
              )}
              renderItem={({ item }) => <DesignerCard item={item} />}
              keyExtractor={item => item.id}
              numColumns={2}
              columnWrapperStyle={styles.gridColumnWrapper}
              contentContainerStyle={styles.designersGrid}
              scrollEnabled={false}
              showsVerticalScrollIndicator={false}
            />
          </View>
        )}

        <View style={styles.bottomPadding} />
      </ScrollView>

      <HamburgerMenu />
      <DesignerDetailModal />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 12,
    backgroundColor: COLORS.white,
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.cloud,
    position: 'relative',
  },
  menuButton: {
    position: 'absolute',
    left: 20,
    top: 20,
    padding: 8,
    zIndex: 10,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '500',
    color: COLORS.charcoal,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 12,
    color: COLORS.ash,
    marginTop: 4,
    textAlign: 'center',
  },
  notificationButton: {
    position: 'absolute',
    right: 20,
    top: 20,
    padding: 8,
    zIndex: 10,
  },
  notificationBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF3B30',
  },
  
  mainScrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.ivory,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
    fontSize: 16,
    color: COLORS.charcoal,
    padding: 0,
  },
  
  aiCard: {
    backgroundColor: COLORS.accent,
    borderRadius: 16,
    marginHorizontal: 20,
    marginBottom: 20,
    overflow: 'hidden',
    flexDirection: 'row',
    padding: 16,
  },
  aiAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: COLORS.white,
  },
  aiContent: {
    flex: 1,
    marginLeft: 16,
  },
  aiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  aiTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.white,
    flex: 1,
  },
  aiBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  aiBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.white,
  },
  aiDescription: {
    fontSize: 14,
    color: COLORS.white,
    opacity: 0.9,
    marginBottom: 12,
    lineHeight: 18,
  },
  aiFeatures: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  featureTag: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  featureText: {
    fontSize: 12,
    color: COLORS.white,
    fontWeight: '500',
  },
  aiStats: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    justifyContent: 'space-around',
  },
  aiStat: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.white,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.white,
    opacity: 0.8,
  },
  statDivider: {
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  aiButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  aiButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.accent,
  },
  
  aiTabContent: {
    padding: 20,
  },
  aiWelcomeCard: {
    backgroundColor: COLORS.ivory,
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    marginBottom: 30,
  },
  aiWelcomeTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: COLORS.accent,
    marginTop: 15,
    marginBottom: 10,
  },
  aiWelcomeText: {
    fontSize: 14,
    color: COLORS.ash,
    textAlign: 'center',
    lineHeight: 20,
  },
  sampleQuestionsContainer: {
    marginBottom: 30,
  },
  sampleQuestionsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.charcoal,
    marginBottom: 8,
  },
  sampleQuestionsSubtitle: {
    fontSize: 14,
    color: COLORS.ash,
    marginBottom: 20,
  },
  questionsGrid: {
    gap: 12,
  },
  questionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.cloud,
    gap: 12,
  },
  questionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.ivory,
    justifyContent: 'center',
    alignItems: 'center',
  },
  questionText: {
    flex: 1,
    fontSize: 14,
    color: COLORS.charcoal,
  },
  startChatButton: {
    backgroundColor: COLORS.accent,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
    borderRadius: 12,
    gap: 10,
    marginBottom: 30,
  },
  startChatText: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.white,
  },
  aiStatsCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.ivory,
    borderRadius: 12,
    padding: 16,
    justifyContent: 'space-around',
  },
  aiStatItem: {
    alignItems: 'center',
    flex: 1,
  },
  aiStatNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.accent,
    marginBottom: 4,
  },
  aiStatLabel: {
    fontSize: 12,
    color: COLORS.ash,
  },
  aiStatDivider: {
    width: 1,
    backgroundColor: COLORS.cloud,
  },
  
  tabNavigation: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 10,
    padding: 4,
    borderWidth: 1,
    borderColor: COLORS.cloud,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: COLORS.ivory,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '300',
    color: COLORS.ash,
  },
  activeTabText: {
    color: COLORS.accent,
    fontWeight: '500',
  },
  
  categoriesScroll: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: COLORS.cloud,
    gap: 6,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '300',
    color: COLORS.charcoal,
  },
  
  designersContainer: {
    minHeight: 600,
  },
  designersGrid: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  gridColumnWrapper: {
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  
  designerCard: {
    width: (width - 48) / 2,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.cloud,
    marginBottom: 8,
  },
  cardHeader: {
    position: 'relative',
    alignItems: 'center',
    marginBottom: 12,
  },
  designerAvatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 2,
    borderColor: COLORS.accent,
  },
  verificationBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
  },
  cardContent: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  designerName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.charcoal,
    flex: 1,
  },
  typeBadge: {
    backgroundColor: COLORS.ivory,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  typeText: {
    fontSize: 12,
    color: COLORS.ash,
  },
  designerTitle: {
    fontSize: 12,
    color: COLORS.ash,
    marginBottom: 8,
  },
  designerStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 12,
    color: COLORS.ash,
  },
  designerLocation: {
    fontSize: 11,
    color: COLORS.ash,
    marginBottom: 12,
  },
  followButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.ivory,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.accent,
    gap: 6,
  },
  followText: {
    fontSize: 14,
    color: COLORS.accent,
    fontWeight: '500',
  },
  
  bottomPadding: {
    height: 40,
  },
  
  menuOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  menuContainer: {
    width: width * 0.7,
    backgroundColor: COLORS.white,
    height: '100%',
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  menuHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.cloud,
  },
  menuTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.charcoal,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.cloud,
    gap: 12,
  },
  menuItemText: {
    fontSize: 16,
    color: COLORS.charcoal,
  },
  
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: COLORS.white,
    marginTop: 60,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
  },
  modalHeader: {
    position: 'relative',
  },
  modalCover: {
    width: '100%',
    height: 200,
  },
  closeButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalProfile: {
    position: 'absolute',
    bottom: -30,
    left: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 4,
    borderColor: COLORS.white,
  },
  modalProfileInfo: {
    marginLeft: 16,
    backgroundColor: 'rgba(255,255,255,0.9)',
    padding: 12,
    borderRadius: 12,
    maxWidth: width * 0.6,
  },
  modalName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.charcoal,
    marginBottom: 4,
  },
  modalTitle: {
    fontSize: 14,
    color: COLORS.ash,
  },
  modalContent: {
    padding: 20,
    paddingTop: 40,
  },
  modalDescription: {
    fontSize: 16,
    color: COLORS.charcoal,
    lineHeight: 24,
    marginBottom: 20,
  },
  socialLinks: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 30,
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.ivory,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 8,
  },
  socialText: {
    fontSize: 14,
    color: COLORS.accent,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.charcoal,
    marginBottom: 16,
  },
  collectionCard: {
    backgroundColor: COLORS.ivory,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    marginRight: 12,
    marginBottom: 12,
  },
  collectionName: {
    fontSize: 14,
    color: COLORS.charcoal,
    fontWeight: '500',
  },
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  productCard: {
    width: '48%',
    marginBottom: 16,
  },
  productImage: {
    width: '100%',
    height: 120,
    borderRadius: 8,
    backgroundColor: COLORS.ivory,
    marginBottom: 8,
  },
  productName: {
    fontSize: 14,
    color: COLORS.charcoal,
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.accent,
  },
});

export default TasarimcimScreen;