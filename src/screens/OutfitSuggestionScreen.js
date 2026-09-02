// 📁 src/screens/OutfitSuggestionScreen.js - TAM REVİZE (Backend Entegre)
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  TextInput,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Image,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY, SIZES } from '../constants/Theme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth } from '../config/firebase';
import { sefAPI, wardrobeAPI } from '../services/api';

// ============================================================
// 📌 MESAJ BUBBLE
// ============================================================
const MessageBubble = ({ message, isUser }) => {
  const [showTime, setShowTime] = useState(false);

  // Mesaj içindeki \n'leri satır satır göster
  const renderMessageText = (text) => {
    if (!text) return null;
    const lines = text.split('\n');
    return lines.map((line, index) => {
      // Kalın yazıları tespit et (**metin**)
      if (line.includes('**')) {
        const parts = line.split(/\*\*(.*?)\*\*/g);
        return (
          <Text key={index} style={[styles.messageText, isUser ? styles.userText : styles.aiText]}>
            {parts.map((part, i) => {
              if (i % 2 === 1) {
                return <Text key={i} style={{ fontWeight: 'bold' }}>{part}</Text>;
              }
              return part;
            })}
          </Text>
        );
      }
      // Emoji içeren satırlar
      if (line.match(/[\u{1F300}-\u{1FAFF}]/u)) {
        return (
          <Text key={index} style={[styles.messageText, isUser ? styles.userText : styles.aiText, { fontSize: 18 }]}>
            {line}
          </Text>
        );
      }
      return (
        <Text key={index} style={[styles.messageText, isUser ? styles.userText : styles.aiText]}>
          {line || ' '}
        </Text>
      );
    });
  };

  return (
    <TouchableOpacity 
      style={[styles.messageRow, isUser ? styles.userRow : styles.aiRow]}
      onPress={() => setShowTime(!showTime)}
      activeOpacity={0.8}
    >
      {!isUser && (
        <View style={styles.aiAvatar}>
          <Text style={styles.aiAvatarText}>🧠</Text>
        </View>
      )}
      <View style={[styles.messageBubble, isUser ? styles.userBubble : styles.aiBubble]}>
        <View>
          {renderMessageText(message.text)}
        </View>
        {showTime && (
          <Text style={styles.messageTime}>{message.time}</Text>
        )}
      </View>
      {isUser && (
        <View style={styles.userAvatar}>
          <Text style={styles.userAvatarText}>👤</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

// ============================================================
// 📌 ÖNERİ BUTONLARI
// ============================================================
const SuggestionChips = ({ onPress, loading }) => {
  const suggestions = [
    { id: 'outfit', label: '👕 Kombin Öner', icon: 'shirt-outline' },
    { id: 'weather', label: '🌤️ Hava Durumu', icon: 'cloud-outline' },
    { id: 'wardrobe', label: '📊 Gardırop Analiz', icon: 'stats-chart-outline' },
    { id: 'style', label: '🎨 Stil Tavsiyesi', icon: 'color-palette-outline' },
  ];

  if (loading) return null;

  return (
    <View style={styles.chipContainer}>
      {suggestions.map((chip) => (
        <TouchableOpacity
          key={chip.id}
          style={styles.chip}
          onPress={() => onPress(chip.id)}
        >
          <Ionicons name={chip.icon} size={16} color={COLORS.primary} />
          <Text style={styles.chipText}>{chip.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

// ============================================================
// 📌 ANA BİLEŞEN
// ============================================================
const OutfitSuggestionScreen = ({ navigation }) => {
  const [messages, setMessages] = useState([
    {
      id: '1',
      text: 'Merhaba! 👋 Ben senin AI Stil Danışmanın.\n\nSana nasıl yardımcı olabilirim?\n\nAşağıdaki butonlardan birine tıklayarak başlayabilirsin:',
      isUser: false,
      time: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const flatListRef = useRef(null);

  // Firebase Auth
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
    });
    return unsubscribe;
  }, []);

  // ============================================================
  // 📌 GARDIROP VERİLERİNİ GETİR
  // ============================================================
  const getWardrobeItems = async () => {
    if (!user) return [];
    try {
      const response = await wardrobeAPI.getAllItems(user.uid);
      if (response && response.success) {
        const allItems = [];
        if (response.categories) {
          Object.values(response.categories).forEach(categoryItems => {
            if (Array.isArray(categoryItems)) {
              allItems.push(...categoryItems);
            }
          });
        }
        return allItems;
      }
      return [];
    } catch (error) {
      console.error('Gardırop yüklenirken hata:', error);
      return [];
    }
  };

  // ============================================================
  // 📌 AI YANITI AL
  // ============================================================
  const getAIResponse = async (userMessage) => {
    if (!user) {
      return '⚠️ Lütfen önce giriş yapın!';
    }

    setLoading(true);
    
    try {
      // Gardırop verilerini al
      const wardrobeItems = await getWardrobeItems();
      
      // Soru tipine göre işlem yap
      const lowerMsg = userMessage.toLowerCase();
      
      // Kombin önerisi
      if (lowerMsg.includes('kombin') || lowerMsg.includes('öner') || lowerMsg.includes('giy')) {
        if (wardrobeItems.length === 0) {
          return '📭 Gardırobunda hiç ürün yok. Lütfen önce ürün ekle!\n\n➕ **Nasıl eklerim?**\n1. Ana ekrandan "Koleksiyonum" sekmesine git\n2. "+" butonuna tıkla\n3. Fotoğraf çek veya galeriden seç\n4. AI otomatik analiz etsin!';
        }
        
        const response = await sefAPI.getOutfitSuggestion(user.uid);
        if (response && response.success && response.kombinler && response.kombinler.length > 0) {
          let reply = '👕 **Kombin Önerilerim:**\n\n';
          response.kombinler.slice(0, 3).forEach((outfit, index) => {
            const items = outfit.items || [];
            reply += `✨ **${index + 1}. ${outfit.name || 'Kombin'}**\n`;
            items.forEach(item => reply += `   • ${item}\n`);
            if (outfit.stil) reply += `   🎨 Stil: ${outfit.stil}\n`;
            if (outfit.puan) reply += `   ⭐ ${outfit.puan}/5\n`;
            reply += '\n';
          });
          reply += '💡 **İpucu:** Beğendiğin kombinleri kaydedebilirsin!';
          return reply;
        }
        return '🔍 Kombin önerisi alınamadı. Lütfen daha sonra tekrar dene.';
      }
      
      // Gardırop analizi
      if (lowerMsg.includes('analiz') || lowerMsg.includes('gardırop') || lowerMsg.includes('dolap')) {
        if (wardrobeItems.length === 0) {
          return '📭 Gardırobunda hiç ürün yok. Önce ürün ekle!';
        }
        
        const stats = await wardrobeAPI.getStats(user.uid);
        let reply = '📊 **Gardırop Analizin:**\n\n';
        reply += `📦 **Toplam Ürün:** ${wardrobeItems.length}\n\n`;
        
        // Kategori dağılımı
        const categories = {};
        wardrobeItems.forEach(item => {
          const cat = item.kategori || item.category || 'diger';
          categories[cat] = (categories[cat] || 0) + 1;
        });
        
        reply += '📂 **Kategori Dağılımı:**\n';
        Object.entries(categories).forEach(([cat, count]) => {
          reply += `   • ${cat}: ${count}\n`;
        });
        
        // Renk dağılımı
        const colors = {};
        wardrobeItems.forEach(item => {
          const color = item.renk || item.color;
          if (color) {
            colors[color] = (colors[color] || 0) + 1;
          }
        });
        
        if (Object.keys(colors).length > 0) {
          reply += '\n🎨 **Renk Dağılımı:**\n';
          Object.entries(colors).slice(0, 5).forEach(([color, count]) => {
            reply += `   • ${color}: ${count}\n`;
          });
        }
        
        // Eksik parçalar
        const hasUpper = categories['üst'] || categories['ust'] || 0;
        const hasLower = categories['alt'] || 0;
        const hasShoes = categories['ayakkabı'] || categories['ayakkabi'] || 0;
        
        const missing = [];
        if (hasUpper === 0) missing.push('👕 Üst giyim');
        if (hasLower === 0) missing.push('👖 Alt giyim');
        if (hasShoes === 0) missing.push('👟 Ayakkabı');
        
        if (missing.length > 0) {
          reply += '\n⚠️ **Eksik Parçalar:**\n';
          missing.forEach(item => reply += `   • ${item}\n`);
        }
        
        if (stats && stats.success) {
          reply += `\n⭐ **Star Parça:** ${stats.star_items || 0}`;
        }
        
        return reply;
      }
      
      // Stil tavsiyesi
      if (lowerMsg.includes('stil') || lowerMsg.includes('tarz') || lowerMsg.includes('şık')) {
        const response = await sefAPI.ask('Bana stil tavsiyesi ver', user.uid);
        if (response && response.cevap) {
          return `🎨 **Stil Tavsiyesi:**\n\n${response.cevap}`;
        }
        return '🎨 Stil tavsiyesi alınamadı. Lütfen tekrar dene.';
      }
      
      // Genel AI sorusu
      const response = await sefAPI.ask(userMessage, user.uid);
      if (response && response.cevap) {
        return response.cevap;
      }
      
      return '🤔 Anlamadım. Lütfen farklı bir şekilde sormayı dene!';
      
    } catch (error) {
      console.error('AI yanıt hatası:', error);
      return '❌ Bir hata oluştu. Lütfen tekrar dene!\n\n' + error.message;
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // 📌 MESAJ GÖNDER
  // ============================================================
  const sendMessage = async () => {
    if (!inputText.trim()) return;

    // Kullanıcı mesajını ekle
    const userMessage = {
      id: Date.now().toString(),
      text: inputText.trim(),
      isUser: true,
      time: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages(prev => [...prev, userMessage]);
    setInputText('');

    // AI yanıtını al
    const aiReply = await getAIResponse(userMessage.text);
    
    const aiMessage = {
      id: (Date.now() + 1).toString(),
      text: aiReply,
      isUser: false,
      time: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages(prev => [...prev, aiMessage]);

    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 200);
  };

  // ============================================================
  // 📌 CHIP PRESS
  // ============================================================
  const handleChipPress = (chipId) => {
    const chipMessages = {
      'outfit': 'Bana bir kombin önerir misin?',
      'weather': 'Bugün hava nasıl, ne giymeliyim?',
      'wardrobe': 'Gardırop analizimi yapar mısın?',
      'style': 'Bana stil tavsiyesi verir misin?',
    };
    setInputText(chipMessages[chipId] || '');
    setTimeout(() => sendMessage(), 300);
  };

  // ============================================================
  // 📌 RENDER
  // ============================================================
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.black} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>🧠 AI Stil Asistanı</Text>
          <View style={styles.onlineBadge}>
            <View style={styles.onlineDot} />
            <Text style={styles.onlineText}>Aktif</Text>
          </View>
        </View>
        <TouchableOpacity onPress={() => {
          setMessages([messages[0]]);
          Alert.alert('Sohbet Temizlendi', 'Yeni bir sohbete başlayabilirsin.');
        }} style={styles.clearButton}>
          <Ionicons name="refresh-outline" size={20} color={COLORS.grayMedium} />
        </TouchableOpacity>
      </View>

      {/* Mesajlar */}
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={({ item }) => <MessageBubble message={item} isUser={item.isUser} />}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.messagesList}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
      />

      {/* Öneri Butonları */}
      <SuggestionChips onPress={handleChipPress} loading={loading} />

      {/* Input */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Mesajını yaz..."
            placeholderTextColor={COLORS.grayMedium}
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={500}
          />
          <TouchableOpacity 
            style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
            onPress={sendMessage}
            disabled={!inputText.trim() || loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color={COLORS.white} />
            ) : (
              <Ionicons name="send" size={20} color={COLORS.white} />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

// ============================================================
// 📌 STYLES
// ============================================================
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SIZES.lg,
    paddingTop: Platform.OS === 'ios' ? 12 : SIZES.md,
    paddingBottom: SIZES.sm,
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.grayLight,
  },
  backButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'flex-start' },
  headerCenter: { alignItems: 'center' },
  headerTitle: { ...TYPOGRAPHY.caption, fontSize: 14, fontWeight: '600' },
  onlineBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  onlineDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: COLORS.success },
  onlineText: { ...TYPOGRAPHY.caption, fontSize: 9, color: COLORS.grayMedium },
  clearButton: { padding: SIZES.xs },

  // Mesajlar
  messagesList: { paddingHorizontal: SIZES.lg, paddingVertical: SIZES.md, paddingBottom: SIZES.xl },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: SIZES.md,
    gap: 8,
  },
  userRow: { justifyContent: 'flex-end' },
  aiRow: { justifyContent: 'flex-start' },
  aiAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  aiAvatarText: { fontSize: 16 },
  userAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.black,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userAvatarText: { fontSize: 14, color: COLORS.white },
  messageBubble: { maxWidth: '80%', padding: SIZES.md, borderRadius: 16 },
  userBubble: { backgroundColor: COLORS.black, borderTopRightRadius: 4 },
  aiBubble: { backgroundColor: COLORS.surface, borderTopLeftRadius: 4 },
  messageText: { ...TYPOGRAPHY.body, fontSize: 13, lineHeight: 18 },
  userText: { color: COLORS.white },
  aiText: { color: COLORS.black },
  messageTime: { ...TYPOGRAPHY.caption, fontSize: 9, color: COLORS.grayMedium, marginTop: 4, alignSelf: 'flex-end' },

  // Chip Butonları
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: SIZES.lg,
    gap: 8,
    marginBottom: SIZES.md,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.surface,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 25,
    borderWidth: 0.5,
    borderColor: COLORS.grayLight,
  },
  chipText: { ...TYPOGRAPHY.caption, fontSize: 11, color: COLORS.primary },

  // Input
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 12,
    paddingHorizontal: SIZES.lg,
    paddingVertical: SIZES.md,
    borderTopWidth: 0.5,
    borderTopColor: COLORS.grayLight,
    backgroundColor: COLORS.white,
  },
  input: {
    flex: 1,
    ...TYPOGRAPHY.body,
    fontSize: 14,
    backgroundColor: COLORS.surface,
    borderRadius: 25,
    paddingHorizontal: 16,
    paddingVertical: 10,
    maxHeight: 100,
    minHeight: 44,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: { backgroundColor: COLORS.grayMedium },
});

export default OutfitSuggestionScreen;