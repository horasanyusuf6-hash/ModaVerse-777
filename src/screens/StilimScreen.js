// 📁 src/screens/StilimScreen.js - REVİZE EDİLMİŞ (SADECE HATALAR DÜZELTİLDİ)
import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Image,
  SafeAreaView,
  StatusBar,
  Alert,
  Modal,
  Platform,
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// 📏 Ekran boyutları
const { width, height } = Dimensions.get('window');

// 🎨 RENK PALETİ (SADECE cognac RENGİ DÜZELTİLDİ)
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
  success: '#4CAF50',
  warning: '#FF9800',
  error: '#F44336',
};

// 📱 Cihaz tipi kontrolü
const isWeb = Platform.OS === 'web';
const isIOS = Platform.OS === 'ios';
const isAndroid = Platform.OS === 'android';

// 🖼️ Base64 varsayılan avatar
const DEFAULT_AVATAR_BASE64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';

const StilimScreen = ({ navigation }) => {
  // STATE'LER
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [userData, setUserData] = useState({
    name: "Yağmur",
    username: "@yagmurstyle",
    bio: "Minimalist tarz • Sustainable fashion • İstanbul",
    followers: "2.4K",
    following: "356",
    posts: "128",
    avatar: "https://i.pravatar.cc/300?img=12"
  });

  // Stil istatistikleri (icon isimleri düzeltildi)
  const [styleStats, setStyleStats] = useState([
    { id: 1, title: "Minimal", value: 85, icon: "leaf-outline", color: COLORS.cognac },
    { id: 2, title: "Street", value: 45, icon: "shirt-outline", color: COLORS.charcoal },
    { id: 3, title: "Classic", value: 60, icon: "briefcase-outline", color: COLORS.ash },
    { id: 4, title: "Luxury", value: 30, icon: "diamond-outline", color: COLORS.cognac },
  ]);

  // Son aktiviteler
  const [recentActivities, setRecentActivities] = useState([
    { id: 1, type: "like", target: "Siyah Deri Ceket", time: "2s ago", icon: "💎" },
    { id: 2, type: "save", target: "Beyaz Tişört", time: "1d ago", icon: "💼" },
    { id: 3, type: "follow", target: "ZARA", time: "2d ago", icon: "🏷️" },
    { id: 4, type: "purchase", target: "Spor Ayakkabı", time: "1w ago", icon: "📌" },
  ]);

  // Önerilen stiller
  const [recommendedStyles, setRecommendedStyles] = useState([
    { id: 1, name: "Boho Chic", match: 92, image: "https://images.unsplash.com/photo-1539008835657-9e8e9680c956?w=400" },
    { id: 2, name: "Sporty", match: 78, image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400" },
    { id: 3, name: "Business Casual", match: 65, image: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=400" },
  ]);

  // Güvenli navigasyon
  const safeNavigate = (screenName, params = {}) => {
    if (navigation && navigation.navigate) {
      navigation.navigate(screenName, params);
    } else {
      console.warn(`Navigation to ${screenName} failed`);
      Alert.alert("Bilgi", `${screenName} sayfasına yönlendiriliyor...`);
    }
  };

  // Cross-platform prompt
  const showPrompt = (title, message, defaultValue, onConfirm) => {
    if (isWeb) {
      const result = prompt(message, defaultValue);
      if (result !== null && result.trim()) {
        onConfirm(result);
      }
    } else {
      Alert.prompt(
        title,
        message,
        [
          { text: "İptal", style: "cancel" },
          { text: "Kaydet", onPress: (value) => {
              if (value && value.trim()) {
                onConfirm(value);
              }
            }
          }
        ],
        'plain-text',
        defaultValue
      );
    }
  };

  // Profil Düzenleme
  const handleEditProfile = () => {
    if (isIOS || isAndroid) {
      Alert.alert(
        "Profil Düzenle",
        "Hangi bilgiyi düzenlemek istiyorsun?",
        [
          { text: "İsim", onPress: () => showPrompt("İsim Değiştir", "Yeni isminiz:", userData.name, (newName) => {
              setUserData({...userData, name: newName});
              Alert.alert("✅ Başarılı", "İsim güncellendi!");
            })
          },
          { text: "Kullanıcı Adı", onPress: () => showPrompt("Kullanıcı Adı Değiştir", "Yeni kullanıcı adınız:", userData.username.replace('@', ''), (newUsername) => {
              setUserData({...userData, username: `@${newUsername}`});
              Alert.alert("✅ Başarılı", "Kullanıcı adı güncellendi!");
            })
          },
          { text: "Bio", onPress: () => showPrompt("Bio Değiştir", "Yeni bio:", userData.bio, (newBio) => {
              setUserData({...userData, bio: newBio});
              Alert.alert("✅ Başarılı", "Bio güncellendi!");
            })
          },
          { text: "İptal", style: "cancel" }
        ]
      );
    } else {
      const action = prompt("Ne düzenlemek istiyorsunuz? (isim/kullanıcı/bio):");
      if (action === 'isim') {
        const newName = prompt("Yeni isminiz:", userData.name);
        if (newName) setUserData({...userData, name: newName});
      } else if (action === 'kullanıcı') {
        const newUsername = prompt("Yeni kullanıcı adınız:", userData.username.replace('@', ''));
        if (newUsername) setUserData({...userData, username: `@${newUsername}`});
      } else if (action === 'bio') {
        const newBio = prompt("Yeni bio:", userData.bio);
        if (newBio) setUserData({...userData, bio: newBio});
      }
    }
  };

  const handleFavoritesPress = () => {
    safeNavigate('Koleksiyonum');
  };

  const handleActivityPress = (activity) => {
    let message = '';
    let targetScreen = '';
    let targetParams = {};
    
    switch(activity.type) {
      case 'like':
        message = `"${activity.target}" ürününü beğendiniz`;
        targetScreen = 'Koleksiyonum';
        targetParams = { filter: 'likes' };
        break;
      case 'save':
        message = `"${activity.target}" ürününü kaydettiniz`;
        targetScreen = 'Koleksiyonum';
        targetParams = { filter: 'saved' };
        break;
      case 'follow':
        message = `"${activity.target}" markasını takip etmeye başladınız`;
        targetScreen = 'Tasarimcim';
        targetParams = { brand: activity.target };
        break;
      case 'purchase':
        message = `"${activity.target}" ürününü satın aldınız`;
        targetScreen = 'Siparislerim';
        targetParams = { orderId: activity.id };
        break;
      default:
        message = `Aktivite: ${activity.target}`;
        targetScreen = 'AnaSayfa';
    }
    
    Alert.alert("📋 Aktivite Detayı", message, [
      { text: "Git", onPress: () => safeNavigate(targetScreen, targetParams) },
      { text: "Tamam", style: "cancel" }
    ]);
  };

  const handleQuickAction = (action) => {
    switch(action) {
      case 'favorites':
        safeNavigate('Koleksiyonum');
        break;
      case 'orders':
        Alert.alert("📦 Siparişlerim", "Siparişleriniz yükleniyor...", [
          { text: "Detaylar", onPress: () => safeNavigate('Siparislerim') },
          { text: "Tamam" }
        ]);
        break;
      case 'reviews':
        Alert.alert("⭐ İncelemelerim", "İncelemeleriniz yükleniyor...", [
          { text: "Detaylar", onPress: () => safeNavigate('Incelemelerim') },
          { text: "Tamam" }
        ]);
        break;
      case 'settings':
        Alert.alert("⚙️ Ayarlar", "Ayarlar sayfasına yönlendiriliyorsunuz...", [
          { text: "Git", onPress: () => safeNavigate('Ayarlar') },
          { text: "Tamam" }
        ]);
        break;
      default:
        Alert.alert("ℹ️ Bilgi", `${action} özelliği yakında eklenecek!`);
    }
  };

  const updateStyleStats = () => {
    const updatedStats = styleStats.map(stat => ({
      ...stat,
      value: Math.min(100, stat.value + Math.floor(Math.random() * 10))
    }));
    setStyleStats(updatedStats);
    
    const newRecommendations = [
      { id: 1, name: "Boho Chic", match: Math.floor(Math.random() * 30 + 70), image: "https://images.unsplash.com/photo-1539008835657-9e8e9680c956?w=400" },
      { id: 2, name: "Sporty", match: Math.floor(Math.random() * 30 + 70), image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400" },
      { id: 3, name: "Business Casual", match: Math.floor(Math.random() * 30 + 70), image: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=400" },
    ];
    setRecommendedStyles(newRecommendations);
    
    Alert.alert("🎨 Stil Analizi", "Stil istatistikleriniz güncellendi! AI size yeni stiller öneriyor.", [
      { text: "Önerileri Gör", onPress: () => {} },
      { text: "Tamam" }
    ]);
  };

  const filterActivities = (filter) => {
    setSelectedFilter(filter);
    
    const allActivities = [
      { id: 1, type: "like", target: "Siyah Deri Ceket", time: "2s ago", icon: "💎" },
      { id: 2, type: "save", target: "Beyaz Tişört", time: "1d ago", icon: "💼" },
      { id: 3, type: "follow", target: "ZARA", time: "2d ago", icon: "🏷️" },
      { id: 4, type: "purchase", target: "Spor Ayakkabı", time: "1w ago", icon: "📌" },
      { id: 5, type: "like", target: "Kot Ceket", time: "3d ago", icon: "💎" },
      { id: 6, type: "save", target: "Deri Bot", time: "5d ago", icon: "💼" },
    ];
    
    if (filter === 'all') {
      setRecentActivities(allActivities.slice(0, 4));
    } else {
      const filtered = allActivities.filter(activity => activity.type === filter).slice(0, 4);
      setRecentActivities(filtered);
    }
  };

  const viewAllActivities = () => {
    Alert.alert("📊 Tüm Aktiviteler", "Toplam 6 aktiviteniz bulunuyor. Detaylı liste için tıklayın.", [
      { text: "Detaylı Gör", onPress: () => safeNavigate('Aktiviteler') },
      { text: "Tamam" }
    ]);
  };

  const changeAvatar = () => {
    Alert.alert("📸 Profil Fotoğrafı", "Fotoğrafınızı nasıl değiştirmek istiyorsunuz?", [
      { text: "📷 Kamera", onPress: () => { Alert.alert("Kamera", "Kamera açılıyor...", [
          { text: "Fotoğraf Çek", onPress: () => safeNavigate('Kamera') },
          { text: "İptal", style: "cancel" }
        ]);
      }},
      { text: "🖼️ Galeri", onPress: () => { Alert.alert("Galeri", "Galeri açılıyor...", [
          { text: "Fotoğraf Seç", onPress: () => {
              const randomAvatar = `https://i.pravatar.cc/300?img=${Math.floor(Math.random() * 70)}`;
              setUserData({...userData, avatar: randomAvatar});
              Alert.alert("✅ Başarılı", "Profil fotoğrafı değiştirildi!");
            }
          },
          { text: "İptal", style: "cancel" }
        ]);
      }},
      { text: "🎲 Rastgele", onPress: () => {
          const newAvatar = `https://i.pravatar.cc/300?img=${Math.floor(Math.random() * 70)}`;
          setUserData({...userData, avatar: newAvatar});
          Alert.alert("✅ Başarılı", "Profil fotoğrafı değiştirildi!");
        }
      },
      { text: "İptal", style: "cancel" }
    ]);
  };

  const handleStyleRecommendation = (style) => {
    Alert.alert(`✨ ${style.name}`, `Bu stile %${style.match} oranında uyuyorsunuz.\n\nSize özel kombin önerileri için tıklayın.`, [
      { text: "Kombinleri Gör", onPress: () => safeNavigate('Kombinler', { style: style.name }) },
      { text: "Tamam" }
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
      
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Text style={styles.logo}>STİLİM</Text>
        </View>
        <Text style={styles.subtitle}>Kişisel Stil Profilim</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* PROFİL BÖLÜMÜ */}
        <View style={styles.profileSection}>
          <TouchableOpacity style={styles.avatarContainer} onPress={changeAvatar} activeOpacity={0.8}>
            <Image source={{ uri: userData.avatar }} style={styles.avatar} defaultSource={{ uri: DEFAULT_AVATAR_BASE64 }} />
            <TouchableOpacity style={styles.editBadge} onPress={changeAvatar}>
              <Ionicons name="camera-outline" size={14} color={COLORS.white} />
            </TouchableOpacity>
          </TouchableOpacity>
          
          <Text style={styles.userName}>{userData.name}</Text>
          <Text style={styles.userUsername}>{userData.username}</Text>
          <Text style={styles.userBio}>{userData.bio}</Text>
          
          <TouchableOpacity style={styles.editButton} onPress={handleEditProfile} activeOpacity={0.7}>
            <Ionicons name="create-outline" size={16} color={COLORS.cognac} />
            <Text style={styles.editButtonText}>Profili Düzenle</Text>
          </TouchableOpacity>
          
          <View style={styles.statsContainer}>
            <TouchableOpacity style={styles.statItem} onPress={() => safeNavigate('Gonderilerim')}>
              <Text style={styles.statNumber}>{userData.posts}</Text>
              <Text style={styles.statLabel}>Gönderi</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.statItem} onPress={() => safeNavigate('Takipciler')}>
              <Text style={styles.statNumber}>{userData.followers}</Text>
              <Text style={styles.statLabel}>Takipçi</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.statItem} onPress={() => safeNavigate('TakipEdilenler')}>
              <Text style={styles.statNumber}>{userData.following}</Text>
              <Text style={styles.statLabel}>Takip</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* AI STİL ÖNERİLERİ */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>🤖 AI Stil Önerileri</Text>
              <Text style={styles.sectionSubtitle}>Size özel seçildi</Text>
            </View>
            <TouchableOpacity onPress={updateStyleStats}>
              <Text style={styles.seeAllText}>Yenile</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.recommendationsScroll}>
            {recommendedStyles.map((style) => (
              <TouchableOpacity key={style.id} style={styles.recommendationCard} onPress={() => handleStyleRecommendation(style)}>
                <Image source={{ uri: style.image }} style={styles.recommendationImage} />
                <View style={styles.recommendationOverlay}>
                  <Text style={styles.recommendationName}>{style.name}</Text>
                  <View style={styles.matchBadge}>
                    <Text style={styles.matchText}>%{style.match}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* STİL İSTATİSTİKLERİ */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>🎨 Stil Analizim</Text>
              <Text style={styles.sectionSubtitle}>AI tarz eşleştirme ile kişiselleştirildi</Text>
            </View>
            <TouchableOpacity onPress={updateStyleStats}>
              <Text style={styles.seeAllText}>Analiz Et</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.statsGrid}>
            {styleStats.map((stat) => (
              <TouchableOpacity key={stat.id} style={styles.styleStat} onPress={() => Alert.alert(`📊 ${stat.title} Stili`, `${stat.title} tarzına %${stat.value} oranında uyuyorsunuz.`)}>
                <View style={[styles.statIconContainer, { backgroundColor: stat.color }]}>
                  <Ionicons name={stat.icon} size={18} color={COLORS.white} />
                </View>
                <Text style={[styles.statValue, { color: stat.color }]}>%{stat.value}</Text>
                <Text style={styles.statTitle}>{stat.title}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* AKTİVİTE FİLTRELERİ */}
        <View style={styles.filterSection}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {[
              { id: 'all', label: 'Tümü' },
              { id: 'like', label: '❤️ Beğeniler' },
              { id: 'save', label: '💾 Kaydedilenler' },
              { id: 'follow', label: '👥 Takip' },
              { id: 'purchase', label: '🛍️ Satın Alımlar' }
            ].map((filter) => (
              <TouchableOpacity
                key={filter.id}
                style={[styles.filterButton, selectedFilter === filter.id && styles.filterButtonActive]}
                onPress={() => filterActivities(filter.id)}
              >
                <Text style={[styles.filterText, selectedFilter === filter.id && styles.filterTextActive]}>
                  {filter.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* SON AKTİVİTELER */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>📋 Son Aktiviteler</Text>
              <Text style={styles.sectionSubtitle}>En son yaptıkların</Text>
            </View>
            <TouchableOpacity onPress={viewAllActivities}>
              <Text style={styles.seeAllText}>Tümü</Text>
            </TouchableOpacity>
          </View>
          
          {recentActivities.length > 0 ? (
            recentActivities.map((activity) => (
              <TouchableOpacity key={activity.id} style={styles.activityItem} onPress={() => handleActivityPress(activity)} activeOpacity={0.7}>
                <View style={styles.activityLeft}>
                  <View style={[styles.activityIcon, { backgroundColor: COLORS.porcelain }]}>
                    <Text style={styles.activityIconText}>{activity.icon}</Text>
                  </View>
                  <View style={styles.activityInfo}>
                    <Text style={styles.activityText}>
                      <Text style={styles.activityAction}>
                        {activity.type === 'like' && 'Beğendin: '}
                        {activity.type === 'save' && 'Kaydettin: '}
                        {activity.type === 'follow' && 'Takip ettin: '}
                        {activity.type === 'purchase' && 'Satın aldın: '}
                      </Text>
                      <Text style={styles.activityTarget}>{activity.target}</Text>
                    </Text>
                    <Text style={styles.activityTime}>{activity.time}</Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward-outline" size={16} color={COLORS.ash} />
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Bu kategoride aktivite bulunmuyor.</Text>
              <TouchableOpacity style={styles.emptyButton} onPress={() => filterActivities('all')}>
                <Text style={styles.emptyButtonText}>Tümünü Göster</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* HIZLI ERİŞİM */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⚡ Hızlı Erişim</Text>
          <Text style={styles.sectionSubtitle}>Sık kullanılan sayfalar</Text>
          
          <View style={styles.quickActions}>
            <TouchableOpacity style={styles.quickAction} onPress={() => handleQuickAction('favorites')} activeOpacity={0.7}>
              <View style={[styles.quickIcon, { backgroundColor: COLORS.porcelain }]}>
                <Text style={styles.quickIconText}>💎</Text>
              </View>
              <Text style={styles.quickText}>Favorilerim</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.quickAction} onPress={() => handleQuickAction('orders')} activeOpacity={0.7}>
              <View style={[styles.quickIcon, { backgroundColor: COLORS.porcelain }]}>
                <Text style={styles.quickIconText}>💼</Text>
              </View>
              <Text style={styles.quickText}>Siparişlerim</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.quickAction} onPress={() => handleQuickAction('reviews')} activeOpacity={0.7}>
              <View style={[styles.quickIcon, { backgroundColor: COLORS.porcelain }]}>
                <Text style={styles.quickIconText}>🏷️</Text>
              </View>
              <Text style={styles.quickText}>İncelemelerim</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.quickAction} onPress={() => handleQuickAction('settings')} activeOpacity={0.7}>
              <View style={[styles.quickIcon, { backgroundColor: COLORS.porcelain }]}>
                <Text style={styles.quickIconText}>⚙️</Text>
              </View>
              <Text style={styles.quickText}>Ayarlar</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ÇIKIŞ YAP BUTONU */}
        <TouchableOpacity style={styles.logoutButton} onPress={() => {
          Alert.alert("🚪 Çıkış Yap", "Hesabınızdan çıkmak istediğinize emin misiniz?", [
            { text: "İptal", style: "cancel" },
            { text: "Çıkış Yap", onPress: () => Alert.alert("✅", "Başarıyla çıkış yapıldı."), style: "destructive" }
          ]);
        }}>
          <Ionicons name="log-out-outline" size={20} color={COLORS.error} />
          <Text style={styles.logoutText}>Çıkış Yap</Text>
        </TouchableOpacity>
      </ScrollView>

      <Modal animationType="slide" transparent={true} visible={isEditModalVisible} onRequestClose={() => setIsEditModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Profil Düzenle</Text>
            <Text style={styles.modalText}>Bu özellik yakında eklenecek!</Text>
            <TouchableOpacity style={styles.modalCloseButton} onPress={() => setIsEditModalVisible(false)}>
              <Text style={styles.modalCloseText}>Kapat</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

// 🎨 STYLES (tüm stiller aynen korundu)
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white },
  scrollContent: { paddingBottom: 30 },
  header: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: COLORS.cloud },
  logoContainer: { marginBottom: 4 },
  logo: { fontSize: 24, fontWeight: '300', letterSpacing: 3, color: COLORS.charcoal, textAlign: 'center' },
  subtitle: { fontSize: 14, fontWeight: '400', color: COLORS.ash, textAlign: 'center', letterSpacing: 1 },
  profileSection: { alignItems: 'center', padding: 24, borderBottomWidth: 1, borderBottomColor: COLORS.cloud },
  avatarContainer: { position: 'relative', marginBottom: 16 },
  avatar: { width: 100, height: 100, borderRadius: 50, backgroundColor: COLORS.porcelain, borderWidth: 2, borderColor: COLORS.cognac },
  editBadge: { position: 'absolute', bottom: 0, right: 0, width: 32, height: 32, borderRadius: 16, backgroundColor: COLORS.cognac, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: COLORS.white },
  userName: { fontSize: 28, fontWeight: '300', color: COLORS.charcoal, marginBottom: 4, letterSpacing: 1 },
  userUsername: { fontSize: 16, fontWeight: '400', color: COLORS.cognac, marginBottom: 8 },
  userBio: { fontSize: 14, fontWeight: '400', color: COLORS.ash, textAlign: 'center', lineHeight: 20, marginBottom: 16, maxWidth: 300 },
  editButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.porcelain, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, marginBottom: 20, borderWidth: 1, borderColor: COLORS.cloud },
  editButtonText: { marginLeft: 6, fontSize: 14, fontWeight: '500', color: COLORS.cognac },
  statsContainer: { flexDirection: 'row', justifyContent: 'space-around', width: '100%', maxWidth: 300, paddingTop: 16, borderTopWidth: 1, borderTopColor: COLORS.cloud },
  statItem: { alignItems: 'center', paddingHorizontal: 20 },
  statNumber: { fontSize: 20, fontWeight: '600', color: COLORS.charcoal, marginBottom: 4 },
  statLabel: { fontSize: 12, fontWeight: '400', color: COLORS.ash, letterSpacing: 0.5 },
  section: { padding: 20, borderBottomWidth: 1, borderBottomColor: COLORS.cloud },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: COLORS.charcoal, letterSpacing: 0.5 },
  sectionSubtitle: { fontSize: 14, fontWeight: '400', color: COLORS.ash, marginTop: 4, letterSpacing: 0.5 },
  seeAllText: { fontSize: 14, fontWeight: '500', color: COLORS.cognac },
  recommendationsScroll: { marginHorizontal: -20, paddingHorizontal: 20 },
  recommendationCard: { width: 150, height: 200, borderRadius: 12, marginRight: 12, overflow: 'hidden', position: 'relative' },
  recommendationImage: { width: '100%', height: '100%' },
  recommendationOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(0,0,0,0.5)', padding: 12 },
  recommendationName: { fontSize: 16, fontWeight: '600', color: COLORS.white, marginBottom: 4 },
  matchBadge: { backgroundColor: COLORS.cognac, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8, alignSelf: 'flex-start' },
  matchText: { fontSize: 12, fontWeight: '600', color: COLORS.white },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  styleStat: { width: '48%', alignItems: 'center', backgroundColor: COLORS.white, padding: 20, borderRadius: 12, marginBottom: 12, borderWidth: 1, borderColor: COLORS.cloud },
  statIconContainer: { width: 50, height: 50, borderRadius: 25, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  statValue: { fontSize: 24, fontWeight: '700', marginBottom: 6 },
  statTitle: { fontSize: 14, fontWeight: '500', color: COLORS.charcoal, letterSpacing: 0.5 },
  filterSection: { paddingHorizontal: 20, paddingVertical: 12, backgroundColor: COLORS.porcelain },
  filterButton: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: COLORS.white, marginRight: 10, borderWidth: 1, borderColor: COLORS.cloud },
  filterButtonActive: { backgroundColor: COLORS.cognac, borderColor: COLORS.cognac },
  filterText: { fontSize: 12, fontWeight: '500', color: COLORS.ash },
  filterTextActive: { color: COLORS.white },
  activityItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: COLORS.cloud },
  activityLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  activityIcon: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  activityIconText: { fontSize: 20 },
  activityInfo: { flex: 1 },
  activityText: { fontSize: 15, fontWeight: '400', color: COLORS.charcoal, lineHeight: 20 },
  activityAction: { color: COLORS.ash },
  activityTarget: { color: COLORS.charcoal, fontWeight: '500' },
  activityTime: { fontSize: 12, fontWeight: '400', color: COLORS.ash, marginTop: 4, letterSpacing: 0.3 },
  emptyContainer: { alignItems: 'center', paddingVertical: 30 },
  emptyText: { fontSize: 14, color: COLORS.ash, textAlign: 'center', fontStyle: 'italic', marginBottom: 15 },
  emptyButton: { backgroundColor: COLORS.porcelain, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8, borderWidth: 1, borderColor: COLORS.cloud },
  emptyButtonText: { fontSize: 14, fontWeight: '500', color: COLORS.cognac },
  quickActions: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginTop: 12 },
  quickAction: { width: '48%', flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.white, padding: 16, borderRadius: 12, marginBottom: 12, borderWidth: 1, borderColor: COLORS.cloud },
  quickIcon: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  quickIconText: { fontSize: 20 },
  quickText: { fontSize: 14, fontWeight: '500', color: COLORS.charcoal, letterSpacing: 0.3 },
  logoutButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.white, padding: 16, marginHorizontal: 20, marginTop: 20, marginBottom: 30, borderRadius: 12, borderWidth: 1, borderColor: COLORS.error, gap: 8 },
  logoutText: { fontSize: 16, fontWeight: '600', color: COLORS.error },
  modalOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalContent: { backgroundColor: COLORS.white, padding: 24, borderRadius: 12, width: width * 0.8, maxHeight: '80%' },
  modalTitle: { fontSize: 20, fontWeight: '600', color: COLORS.charcoal, marginBottom: 20, textAlign: 'center' },
  modalText: { fontSize: 16, color: COLORS.ash, textAlign: 'center', marginBottom: 20 },
  modalCloseButton: { backgroundColor: COLORS.cognac, padding: 12, borderRadius: 8, alignItems: 'center', marginTop: 20 },
  modalCloseText: { color: COLORS.white, fontWeight: '600', fontSize: 16 },
});

export default StilimScreen;