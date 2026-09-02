// 📁 src/screens/PodiumScreen.js - TAM REVİZE (Backend Entegre, Hata Düzeltmeleri ile)
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  TextInput,
  ScrollView,
  Dimensions,
  Modal,
  Alert,
  RefreshControl,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Pressable,
  Share
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, TYPOGRAPHY, SIZES, SHADOWS } from '../constants/Theme';
import { auth } from '../config/firebase';
import { outfitAPI, sefAPI } from '../services/api';

const { width, height } = Dimensions.get('window');

// ============================================================
// 📌 KULLANICI ÜNVANLARI
// ============================================================
const userTitles = {
  'FashionIcon': { title: 'Moda İkonu', detail: '1M+ beğeni topladı! ✨', icon: 'crown' },
  'SneakerKing': { title: 'Sneaker King', detail: '1000+ sneaker koleksiyonu 👟', icon: 'footsteps' },
  'StyleGuru': { title: 'Stil Gurusu', detail: 'Günlük kombinlerle ilham veriyor', icon: 'color-palette' },
  'default': { title: 'Moda Sever', detail: 'Moda yolculuğuna yeni başladın!', icon: 'person' },
};

// ============================================================
// 📌 FULL IMAGE MODAL
// ============================================================
const FullImageModal = ({ visible, imageUrl, onClose }) => {
  return (
    <Modal visible={visible} transparent onRequestClose={onClose}>
      <View style={styles.fullImageOverlay}>
        <TouchableOpacity style={styles.fullImageClose} onPress={onClose}>
          <Ionicons name="close" size={28} color={COLORS.white} />
        </TouchableOpacity>
        <Image source={{ uri: imageUrl }} style={styles.fullImage} resizeMode="contain" />
      </View>
    </Modal>
  );
};

// ============================================================
// 📌 3 NOKTA MENÜ MODALI
// ============================================================
const ThreeDotMenuModal = ({ visible, onClose, onSelect, post }) => {
  const menuItems = [
    { id: 'go_to_trend', label: 'Trende git', icon: 'trending-up', color: COLORS.primary },
    { id: 'go_to_profile', label: 'Gönderi sahibine git', icon: 'person', color: COLORS.black },
    { id: 'go_to_brand', label: 'Markaya git', icon: 'business', color: COLORS.success },
    { id: 'not_interested', label: 'İlgilenmiyorum', icon: 'close-circle', color: COLORS.grayMedium },
    { id: 'report', label: 'Şikayet et', icon: 'flag', color: COLORS.danger },
  ];

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity style={styles.menuOverlay} activeOpacity={1} onPress={onClose}>
        <View style={styles.threeDotMenuContainer}>
          <View style={styles.threeDotMenuHeader}>
            <Text style={styles.threeDotMenuTitle}>Bu gönderi için</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={20} color={COLORS.grayMedium} />
            </TouchableOpacity>
          </View>
          {menuItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.threeDotMenuItem}
              onPress={() => {
                onSelect(item.id, post);
                onClose();
              }}
            >
              <Ionicons name={item.icon} size={20} color={item.color} />
              <Text style={[styles.threeDotMenuItemText, { color: item.color }]}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

// ============================================================
// 📌 YORUM 3 NOKTA MENÜSÜ
// ============================================================
const CommentMenuModal = ({ visible, onClose, onSelect, comment, post }) => {
  const menuItems = [
    { id: 'go_to_trend', label: 'Trende git', icon: 'trending-up', color: COLORS.primary },
    { id: 'go_to_profile', label: 'Kullanıcıya git', icon: 'person', color: COLORS.black },
    { id: 'report_comment', label: 'Yorumu şikayet et', icon: 'flag', color: COLORS.danger },
  ];

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity style={styles.menuOverlay} activeOpacity={1} onPress={onClose}>
        <View style={styles.threeDotMenuContainer}>
          <View style={styles.threeDotMenuHeader}>
            <Text style={styles.threeDotMenuTitle}>Bu yorum için</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={20} color={COLORS.grayMedium} />
            </TouchableOpacity>
          </View>
          {menuItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.threeDotMenuItem}
              onPress={() => {
                onSelect(item.id, comment, post);
                onClose();
              }}
            >
              <Ionicons name={item.icon} size={20} color={item.color} />
              <Text style={[styles.threeDotMenuItemText, { color: item.color }]}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

// ============================================================
// 📌 YORUM MODALI
// ============================================================
const CommentModal = ({ visible, post, onClose, onAddComment, currentUser }) => {
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState([]);
  const [selectedComment, setSelectedComment] = useState(null);
  const [commentMenuVisible, setCommentMenuVisible] = useState(false);

  useEffect(() => {
    if (post) {
      setComments(post.commentsList || []);
    }
  }, [post]);

  const handleAddComment = () => {
    if (!commentText.trim()) {
      Alert.alert('Hata', 'Lütfen bir yorum yazın!');
      return;
    }

    const newComment = {
      id: Date.now().toString(),
      userId: currentUser?.id || 'guest',
      userName: currentUser?.name || 'Kullanıcı',
      userAvatar: currentUser?.avatar || 'https://i.pravatar.cc/100',
      text: commentText.trim(),
      time: 'Şimdi',
      likes: 0
    };

    const updatedComments = [...comments, newComment];
    setComments(updatedComments);
    onAddComment(post.id, updatedComments);
    setCommentText('');
  };

  const handleCommentMenuSelect = (action, comment, postData) => {
    switch (action) {
      case 'go_to_trend':
        Alert.alert('Trend', `${postData?.trendTag || '#Trend'} sayfasına gidiliyor...`);
        break;
      case 'go_to_profile':
        Alert.alert('Profil', `${comment.userName} profil sayfasına gidiliyor...`);
        break;
      case 'report_comment':
        Alert.alert('Şikayet', 'Yorum şikayet edildi');
        break;
    }
  };

  const handleDeleteComment = (commentId) => {
    Alert.alert('Yorumu Sil', 'Bu yorumu silmek istediğinize emin misiniz?', [
      { text: 'İptal', style: 'cancel' },
      {
        text: 'Sil',
        style: 'destructive',
        onPress: () => {
          const updatedComments = comments.filter(c => c.id !== commentId);
          setComments(updatedComments);
          onAddComment(post.id, updatedComments);
        }
      }
    ]);
  };

  return (
    <>
      <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
        <SafeAreaView style={styles.modalOverlay}>
          <View style={styles.commentModalContainer}>
            <View style={styles.commentModalHeader}>
              <Text style={styles.commentModalTitle}>Yorumlar ({comments.length})</Text>
              <TouchableOpacity onPress={onClose}>
                <Ionicons name="close" size={24} color={COLORS.black} />
              </TouchableOpacity>
            </View>

            <FlatList
              data={comments}
              renderItem={({ item }) => (
                <View style={styles.commentItem}>
                  <Image source={{ uri: item.userAvatar }} style={styles.commentAvatar} />
                  <View style={styles.commentContent}>
                    <View style={styles.commentHeader}>
                      <Text style={styles.commentUserName}>{item.userName}</Text>
                      <Text style={styles.commentTime}>{item.time}</Text>
                    </View>
                    <Text style={styles.commentText}>{item.text}</Text>
                  </View>
                  <TouchableOpacity onPress={() => {
                    setSelectedComment(item);
                    setCommentMenuVisible(true);
                  }}>
                    <Ionicons name="ellipsis-horizontal" size={18} color={COLORS.grayMedium} />
                  </TouchableOpacity>
                  {item.userId === currentUser?.id && (
                    <TouchableOpacity onPress={() => handleDeleteComment(item.id)} style={styles.deleteCommentButton}>
                      <Ionicons name="trash-outline" size={16} color={COLORS.grayMedium} />
                    </TouchableOpacity>
                  )}
                </View>
              )}
              keyExtractor={item => item.id}
              ListEmptyComponent={
                <View style={styles.emptyComments}>
                  <Text style={styles.emptyCommentsText}>Henüz yorum yok. İlk yorumu sen yap!</Text>
                </View>
              }
            />

            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
              <View style={styles.commentInputContainer}>
                <TextInput
                  style={styles.commentInput}
                  placeholder="Yorumunu yaz..."
                  placeholderTextColor={COLORS.grayMedium}
                  value={commentText}
                  onChangeText={setCommentText}
                  multiline
                />
                <TouchableOpacity style={styles.commentSendButton} onPress={handleAddComment}>
                  <Ionicons name="send" size={18} color={COLORS.black} />
                </TouchableOpacity>
              </View>
            </KeyboardAvoidingView>
          </View>
        </SafeAreaView>
      </Modal>

      <CommentMenuModal
        visible={commentMenuVisible}
        onClose={() => setCommentMenuVisible(false)}
        onSelect={handleCommentMenuSelect}
        comment={selectedComment}
        post={post}
      />
    </>
  );
};

// ============================================================
// 📌 POST CARD
// ============================================================
const FeedPostCard = ({ item, onLike, onComment, onShare, onImagePress, onMenuSelect, isLiked: initialLiked }) => {
  const [liked, setLiked] = useState(initialLiked || false);
  const [likeCount, setLikeCount] = useState(item.likes || 0);
  const [menuVisible, setMenuVisible] = useState(false);
  const titleInfo = userTitles[item.userName] || userTitles.default;

  const handleLike = () => {
    const newLiked = !liked;
    setLiked(newLiked);
    setLikeCount(prev => newLiked ? prev + 1 : prev - 1);
    onLike?.(item.id, newLiked);
  };

  const showTitleInfo = () => {
    Alert.alert(titleInfo.title, titleInfo.detail);
  };

  const formatNumber = (num) => {
    if (!num) return '0';
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  return (
    <View style={styles.feedPostCard}>
      <View style={styles.feedPostHeader}>
        <Image source={{ uri: item.userAvatar || 'https://i.pravatar.cc/100' }} style={styles.feedPostAvatar} />
        <View style={styles.feedPostUserInfo}>
          <View style={styles.userNameRow}>
            <Text style={styles.feedPostUserName}>{item.userName || 'Kullanıcı'}</Text>
            <TouchableOpacity onPress={showTitleInfo}>
              <Text style={styles.userTitleBadge}>{titleInfo.title}</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.feedPostTime}>{item.time || 'Şimdi'}</Text>
        </View>
        <TouchableOpacity onPress={() => setMenuVisible(true)} style={styles.menuButton}>
          <Ionicons name="ellipsis-horizontal" size={20} color={COLORS.grayMedium} />
        </TouchableOpacity>
      </View>
      
      <Text style={styles.feedPostContent}>{item.content || 'Paylaşım'}</Text>
      
      <TouchableOpacity onPress={() => onImagePress?.(item.image)} activeOpacity={0.9}>
        <Image source={{ uri: item.image || 'https://picsum.photos/400/300' }} style={styles.feedPostImage} />
      </TouchableOpacity>
      
      <View style={styles.feedPostActions}>
        <TouchableOpacity style={styles.feedPostAction} onPress={handleLike}>
          <Ionicons name={liked ? "heart" : "heart-outline"} size={22} color={liked ? COLORS.danger : COLORS.grayMedium} />
          <Text style={styles.feedPostActionText}>{formatNumber(likeCount)}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.feedPostAction} onPress={onComment}>
          <Ionicons name="chatbubble-outline" size={20} color={COLORS.grayMedium} />
          <Text style={styles.feedPostActionText}>{formatNumber(item.comments || 0)}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.feedPostAction} onPress={onShare}>
          <Ionicons name="share-social-outline" size={20} color={COLORS.grayMedium} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.feedPostSave}>
          <Ionicons name="bookmark-outline" size={20} color={COLORS.grayMedium} />
        </TouchableOpacity>
      </View>

      <ThreeDotMenuModal
        visible={menuVisible}
        onClose={() => setMenuVisible(false)}
        onSelect={onMenuSelect}
        post={item}
      />
    </View>
  );
};

// ============================================================
// 📌 DÖNER SEÇENEKLER
// ============================================================
const RotationSelector = ({ selected, onSelect }) => {
  const options = [
    { id: 'trending', label: 'Trendler', icon: 'trending-up' },
    { id: 'following', label: 'Takip Ettiklerim', icon: 'people' },
    { id: 'suggested', label: 'Senin İçin', icon: 'bulb' },
  ];

  return (
    <View style={styles.rotationContainer}>
      {options.map((option) => (
        <TouchableOpacity
          key={option.id}
          style={[styles.rotationButton, selected === option.id && styles.rotationButtonActive]}
          onPress={() => onSelect(option.id)}
        >
          <Ionicons 
            name={option.icon} 
            size={16} 
            color={selected === option.id ? COLORS.white : COLORS.grayMedium} 
          />
          <Text style={[styles.rotationText, selected === option.id && styles.rotationTextActive]}>
            {option.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

// ============================================================
// 📌 KARE TRENDLER
// ============================================================
const SquareTrends = ({ trends, onSelectTrend }) => {
  if (!trends || trends.length === 0) {
    return (
      <View style={styles.squareTrendsContainer}>
        <View style={styles.squareTrendsHeader}>
          <Text style={styles.squareTrendsTitle}>Öne Çıkan Trendler</Text>
        </View>
        <View style={{ paddingHorizontal: SIZES.lg }}>
          <Text style={styles.emptyTrendsText}>Henüz trend yok</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.squareTrendsContainer}>
      <View style={styles.squareTrendsHeader}>
        <Text style={styles.squareTrendsTitle}>Öne Çıkan Trendler</Text>
      </View>
      <FlatList
        data={trends}
        horizontal
        showsHorizontalScrollIndicator={false}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.squareTrendItem} onPress={() => onSelectTrend(item.tag)} activeOpacity={0.8}>
            <Image source={{ uri: item.image || 'https://picsum.photos/200/200' }} style={styles.squareTrendImage} />
            <View style={styles.squareTrendOverlay}>
              <Text style={styles.squareTrendTag}>{item.tag}</Text>
              <Text style={styles.squareTrendCount}>{item.postCount || '0'}</Text>
            </View>
          </TouchableOpacity>
        )}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.squareTrendsList}
      />
    </View>
  );
};

// ============================================================
// 📌 ANA BİLEŞEN
// ============================================================
const PodiumScreen = ({ navigation }) => {
  const [rotationValue, setRotationValue] = useState('trending');
  const [selectedTrend, setSelectedTrend] = useState(null);
  const [commentModalVisible, setCommentModalVisible] = useState(false);
  const [fullImageVisible, setFullImageVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedPost, setSelectedPost] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [likedPosts, setLikedPosts] = useState({});
  const [feedPosts, setFeedPosts] = useState([]);
  const [followingPosts, setFollowingPosts] = useState([]);
  const [suggestedPosts, setSuggestedPosts] = useState([]);
  const [trendingItems, setTrendingItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  // Firebase Auth
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
    });
    return unsubscribe;
  }, []);

  // ============================================================
  // 📌 VERİ YÜKLEME
  // ============================================================
  const loadData = async () => {
    setLoading(true);
    try {
      await loadFeed();
      await loadTrends();
      await loadSuggested();
    } catch (error) {
      console.error('Veri yükleme hatası:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadFeed = async () => {
    try {
      const response = await outfitAPI.getFeed();
      if (response && response.success) {
        // 🛡️ GÜVENLİK KONTROLÜ EKLENDİ
        const posts = response.posts || [];
        const formattedPosts = Array.isArray(posts) 
          ? posts.map((post, index) => ({
              id: post.id || index.toString(),
              userName: post.user_name || 'Kullanıcı',
              userAvatar: post.user_avatar || `https://i.pravatar.cc/100?img=${index + 1}`,
              time: post.created_at || 'Şimdi',
              content: post.title || post.description || 'Paylaşım',
              image: post.image_url || `https://picsum.photos/id/${index + 20}/400/300`,
              likes: post.like_count || 0,
              comments: post.comment_count || 0,
              trendTag: post.concept_category || '#Moda',
              brand: post.brand || 'Marka',
              commentsList: post.comments || [],
              isLiked: false,
            }))
          : [];
        setFeedPosts(formattedPosts);
      } else {
        setFeedPosts([]);
      }
    } catch (error) {
      console.error('Feed yüklenemedi:', error);
      setFeedPosts([]);
    }
  };

  const loadTrends = async () => {
    try {
      const response = await outfitAPI.getCategories();
      if (response && response.success) {
        const categories = response.categories || [];
        const formattedTrends = Array.isArray(categories)
          ? categories.map((cat, index) => ({
              id: cat.id || index.toString(),
              tag: `#${cat.name || 'Trend'}`,
              postCount: cat.post_count || '0',
              image: cat.image_url || `https://picsum.photos/id/${index + 30}/200/200`,
              color: cat.color || '#E8D5C4'
            }))
          : [];
        setTrendingItems(formattedTrends);
      } else {
        setTrendingItems([]);
      }
    } catch (error) {
      console.error('Trendler yüklenemedi:', error);
      setTrendingItems([]);
    }
  };

  const loadSuggested = async () => {
    try {
      if (user) {
        const response = await sefAPI.getOutfitSuggestion(user.uid);
        if (response && response.success && response.kombinler) {
          const outfits = response.kombinler.slice(0, 5);
          const formatted = Array.isArray(outfits)
            ? outfits.map((outfit, index) => ({
                id: `suggested_${index}`,
                userName: 'AI Öneri',
                userAvatar: 'https://i.pravatar.cc/100?img=50',
                time: 'Şimdi',
                content: outfit.name || `Kombin ${index + 1}`,
                image: `https://picsum.photos/id/${index + 40}/400/300`,
                likes: 0,
                comments: 0,
                trendTag: '#AIKombin',
                brand: 'ModaVerse AI',
                commentsList: [],
                isLiked: false,
              }))
            : [];
          setSuggestedPosts(formatted);
        } else {
          setSuggestedPosts([]);
        }
      } else {
        setSuggestedPosts([]);
      }
    } catch (error) {
      console.error('Öneriler yüklenemedi:', error);
      setSuggestedPosts([]);
    }
  };

  // ============================================================
  // 📌 EFFECTS
  // ============================================================
  useEffect(() => {
    loadData();
  }, [user]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadData();
    });
    return unsubscribe;
  }, [navigation]);

  // ============================================================
  // 📌 HELPERS
  // ============================================================
  const getCurrentFeed = () => {
    let allPosts = [];
    
    if (selectedTrend) {
      const all = [...feedPosts, ...followingPosts, ...suggestedPosts];
      return all.filter(post => post.trendTag === selectedTrend);
    }
    
    switch (rotationValue) {
      case 'trending': allPosts = feedPosts; break;
      case 'following': allPosts = followingPosts; break;
      case 'suggested': allPosts = suggestedPosts; break;
      default: allPosts = feedPosts;
    }
    
    return allPosts;
  };

  // ============================================================
  // 📌 HANDLERS
  // ============================================================
  const handleLike = async (postId, isLiked) => {
    if (!user) {
      Alert.alert('Giriş Yapın', 'Beğenmek için lütfen giriş yapın.');
      return;
    }
    setLikedPosts(prev => ({ ...prev, [postId]: isLiked }));
    try {
      await outfitAPI.likePost(postId, user.uid, 'full_match');
    } catch (error) {
      console.error('Beğeni hatası:', error);
    }
  };

  const handleComment = (post) => {
    setSelectedPost(post);
    setCommentModalVisible(true);
  };

  const handleShare = async (post) => {
    try {
      await Share.share({
        message: `${post.content}\n\nModaVerse ile paylaşıldı! ✨`,
      });
    } catch (error) { console.error(error); }
  };

  const handleImagePress = (imageUrl) => {
    setSelectedImage(imageUrl);
    setFullImageVisible(true);
  };

  const handleMenuSelect = (action, post) => {
    switch (action) {
      case 'go_to_trend':
        setSelectedTrend(post.trendTag);
        break;
      case 'go_to_profile':
        Alert.alert('Profil', `${post.userName} profil sayfasına gidiliyor...`);
        break;
      case 'not_interested':
        Alert.alert('Bilgi', 'Bu gönderi gizlendi');
        break;
      case 'report':
        Alert.alert('Şikayet', 'Gönderi şikayet edildi');
        break;
    }
  };

  const handleTrendSelect = (tag) => {
    if (selectedTrend === tag) {
      setSelectedTrend(null);
    } else {
      setSelectedTrend(tag);
    }
  };

  const handleAddComment = async (postId, commentsList) => {
    console.log('Yorum eklendi:', postId, commentsList);
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, []);

  const currentFeed = getCurrentFeed();

  // ============================================================
  // 📌 LIST HEADER
  // ============================================================
  const ListHeader = () => (
    <>
      <RotationSelector selected={rotationValue} onSelect={setRotationValue} />
      <SquareTrends trends={trendingItems} onSelectTrend={handleTrendSelect} />
      {selectedTrend && (
        <View style={styles.selectedTrendBar}>
          <Text style={styles.selectedTrendText}>{selectedTrend} için sonuçlar</Text>
          <TouchableOpacity onPress={() => setSelectedTrend(null)}>
            <Text style={styles.selectedTrendClear}>Temizle</Text>
          </TouchableOpacity>
        </View>
      )}
    </>
  );

  // ============================================================
  // 📌 RENDER
  // ============================================================
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={COLORS.black} />
          <Text style={styles.loadingText}>YÜKLENİYOR...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
      
      <View style={styles.header}>
        <Text style={styles.logoText}>PODYUM</Text>
      </View>

      <FlatList
        data={currentFeed}
        renderItem={({ item }) => (
          <FeedPostCard
            item={item}
            isLiked={likedPosts[item.id] || false}
            onLike={handleLike}
            onComment={() => handleComment(item)}
            onShare={() => handleShare(item)}
            onImagePress={handleImagePress}
            onMenuSelect={handleMenuSelect}
          />
        )}
        keyExtractor={item => item.id?.toString() || Math.random().toString()}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.black]} />}
        contentContainerStyle={styles.feedList}
        ListHeaderComponent={ListHeader}
      />

      {/* Modallar */}
      <CommentModal
        visible={commentModalVisible}
        post={selectedPost}
        onClose={() => {
          setCommentModalVisible(false);
          setSelectedPost(null);
        }}
        onAddComment={handleAddComment}
        currentUser={{ 
          id: user?.uid || 'guest',
          name: user?.displayName || 'Kullanıcı',
          avatar: user?.photoURL || 'https://i.pravatar.cc/100'
        }}
      />

      <FullImageModal
        visible={fullImageVisible}
        imageUrl={selectedImage}
        onClose={() => {
          setFullImageVisible(false);
          setSelectedImage(null);
        }}
      />
    </SafeAreaView>
  );
};

// ============================================================
// 📌 STYLES
// ============================================================
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white },
  loadingText: { ...TYPOGRAPHY.caption, marginTop: SIZES.md, color: COLORS.grayMedium },

  // HEADER
  header: { paddingHorizontal: SIZES.lg, paddingTop: Platform.OS === 'ios' ? 12 : SIZES.md, paddingBottom: SIZES.xs },
  logoText: { ...TYPOGRAPHY.logo, fontSize: 18, letterSpacing: 2, color: COLORS.black },

  // ROTATION
  rotationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginHorizontal: SIZES.lg,
    marginVertical: SIZES.md,
    gap: SIZES.sm
  },
  rotationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 25,
    gap: 4
  },
  rotationButtonActive: { backgroundColor: COLORS.black },
  rotationText: { ...TYPOGRAPHY.caption, fontSize: 11, color: COLORS.grayMedium },
  rotationTextActive: { color: COLORS.white },

  // SQUARE TRENDS
  squareTrendsContainer: { marginVertical: SIZES.sm },
  squareTrendsHeader: { paddingHorizontal: SIZES.lg, marginBottom: SIZES.sm },
  squareTrendsTitle: { ...TYPOGRAPHY.caption, fontSize: 12, color: COLORS.black },
  squareTrendsList: { paddingHorizontal: SIZES.lg, gap: SIZES.sm },
  squareTrendItem: { width: 100, height: 120, borderRadius: 12, overflow: 'hidden', marginRight: SIZES.sm },
  squareTrendImage: { width: '100%', height: '100%' },
  squareTrendOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: SIZES.xs
  },
  squareTrendTag: { ...TYPOGRAPHY.caption, fontSize: 9, color: COLORS.white },
  squareTrendCount: { ...TYPOGRAPHY.caption, fontSize: 7, color: COLORS.grayMedium, marginTop: 1 },
  emptyTrendsText: { ...TYPOGRAPHY.caption, fontSize: 12, color: COLORS.grayMedium, textAlign: 'center', paddingVertical: SIZES.md },

  // SELECTED TREND BAR
  selectedTrendBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    paddingHorizontal: SIZES.lg,
    paddingVertical: SIZES.xs,
    marginHorizontal: SIZES.lg,
    marginVertical: SIZES.sm,
    borderRadius: 8
  },
  selectedTrendText: { ...TYPOGRAPHY.caption, fontSize: 10, color: COLORS.black },
  selectedTrendClear: { ...TYPOGRAPHY.caption, fontSize: 9, color: COLORS.grayMedium },

  // FEED
  feedList: { paddingBottom: SIZES.xl },
  feedPostCard: {
    backgroundColor: COLORS.white,
    marginBottom: SIZES.lg,
    paddingHorizontal: SIZES.lg,
    paddingBottom: SIZES.sm
  },
  feedPostHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: SIZES.sm },
  feedPostAvatar: { width: 40, height: 40, borderRadius: 20, marginRight: SIZES.md, backgroundColor: COLORS.surface },
  feedPostUserInfo: { flex: 1 },
  userNameRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 4 },
  feedPostUserName: { ...TYPOGRAPHY.body, fontWeight: '500' },
  userTitleBadge: { ...TYPOGRAPHY.caption, fontSize: 8, color: COLORS.primary },
  feedPostTime: { ...TYPOGRAPHY.caption, fontSize: 8, color: COLORS.grayMedium, marginTop: 1 },
  menuButton: { padding: 4 },
  feedPostContent: { ...TYPOGRAPHY.body, fontSize: 13, lineHeight: 18, marginBottom: SIZES.sm },
  feedPostImage: { width: '100%', height: 260, borderRadius: 12, marginBottom: SIZES.sm, backgroundColor: COLORS.surface },
  feedPostActions: { flexDirection: 'row', alignItems: 'center', paddingTop: SIZES.xs },
  feedPostAction: { flexDirection: 'row', alignItems: 'center', marginRight: SIZES.lg },
  feedPostActionText: { ...TYPOGRAPHY.caption, fontSize: 10, color: COLORS.grayMedium, marginLeft: 2 },
  feedPostSave: { marginLeft: 'auto' },

  // MODALS
  menuOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  threeDotMenuContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    width: width * 0.85,
    padding: SIZES.md,
    alignSelf: 'center'
  },
  threeDotMenuHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.md,
    paddingBottom: SIZES.sm,
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.grayLight
  },
  threeDotMenuTitle: { ...TYPOGRAPHY.caption, fontSize: 12 },
  threeDotMenuItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: SIZES.sm, gap: SIZES.md },
  threeDotMenuItemText: { ...TYPOGRAPHY.body, fontSize: 13 },

  commentModalContainer: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
    paddingBottom: SIZES.md
  },
  commentModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SIZES.md,
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.grayLight
  },
  commentModalTitle: { ...TYPOGRAPHY.caption, fontSize: 12 },
  commentItem: {
    flexDirection: 'row',
    padding: SIZES.md,
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.grayLight,
    alignItems: 'flex-start'
  },
  commentAvatar: { width: 32, height: 32, borderRadius: 16, marginRight: SIZES.md },
  commentContent: { flex: 1 },
  commentHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 2, gap: SIZES.xs },
  commentUserName: { ...TYPOGRAPHY.body, fontWeight: '500', fontSize: 12 },
  commentTime: { ...TYPOGRAPHY.caption, fontSize: 8, color: COLORS.grayMedium },
  commentText: { ...TYPOGRAPHY.body, fontSize: 12, lineHeight: 16 },
  deleteCommentButton: { padding: 4, marginLeft: SIZES.xs },
  emptyComments: { padding: SIZES.xl, alignItems: 'center' },
  emptyCommentsText: { ...TYPOGRAPHY.body, fontSize: 12, color: COLORS.grayMedium, textAlign: 'center' },
  commentInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SIZES.md,
    borderTopWidth: 0.5,
    borderTopColor: COLORS.grayLight,
    gap: SIZES.md
  },
  commentInput: {
    flex: 1,
    ...TYPOGRAPHY.body,
    backgroundColor: COLORS.surface,
    borderRadius: 25,
    paddingHorizontal: SIZES.md,
    paddingVertical: SIZES.xs,
    maxHeight: 80
  },
  commentSendButton: { padding: SIZES.xs },

  // FULL IMAGE
  fullImageOverlay: { flex: 1, backgroundColor: COLORS.black, justifyContent: 'center', alignItems: 'center' },
  fullImageClose: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 40,
    right: SIZES.lg,
    zIndex: 10,
    padding: SIZES.sm
  },
  fullImage: { width: width, height: height * 0.7 },
});

export default PodiumScreen;