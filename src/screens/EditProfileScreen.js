// 📁 src/screens/EditProfileScreen.js - REVİZE (Profil + Kapak Fotoğrafı)
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  Image,
  TextInput,
  ScrollView,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { COLORS, TYPOGRAPHY, SIZES } from '../constants/Theme';

const EditProfileScreen = ({ navigation, route }) => {
  const { profile, onSave } = route.params || {};
  
  // Temel bilgiler
  const [name, setName] = useState(profile?.name || '');
  const [surname, setSurname] = useState(profile?.surname || '');
  const [bio, setBio] = useState(profile?.bio || '');
  
  // 📸 Profil fotoğrafı
  const [avatar, setAvatar] = useState(
    profile?.avatar || 'https://i.pravatar.cc/100?img=1'
  );
  
  // 🖼️ Kapak fotoğrafları (en fazla 3)
  const [coverImages, setCoverImages] = useState([
    profile?.coverImage || 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800',
    profile?.coverImage2 || null,
    profile?.coverImage3 || null,
  ]);
  
  const [loading, setLoading] = useState(false);

  // ============================================================
  // 📸 FOTOĞRAF SEÇ
  // ============================================================
  const pickImage = async (type, index = null) => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Hata', 'Galeri izni gerekli!');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: true,
        aspect: type === 'avatar' ? [1, 1] : [16, 9],
        quality: 0.8,
      });

      if (!result.canceled) {
        const uri = result.assets[0].uri;
        
        if (type === 'avatar') {
          setAvatar(uri);
        } else if (type === 'cover' && index !== null) {
          const newCoverImages = [...coverImages];
          newCoverImages[index] = uri;
          setCoverImages(newCoverImages);
        }
      }
    } catch (error) {
      console.error('Fotoğraf seçme hatası:', error);
      Alert.alert('Hata', 'Fotoğraf seçilemedi');
    }
  };

  // ============================================================
  // 🗑️ KAPAK FOTOĞRAFI KALDIR
  // ============================================================
  const removeCoverImage = (index) => {
    const newCoverImages = [...coverImages];
    newCoverImages[index] = null;
    setCoverImages(newCoverImages);
  };

  // ============================================================
  // 💾 KAYDET
  // ============================================================
  const handleSave = () => {
    if (!name.trim()) {
      Alert.alert('Hata', 'İsim giriniz!');
      return;
    }

    setLoading(true);
    
    const updatedProfile = {
      name: name.trim(),
      surname: surname.trim(),
      bio: bio.trim(),
      avatar: avatar,
      coverImage: coverImages[0] || 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800',
      coverImage2: coverImages[1] || null,
      coverImage3: coverImages[2] || null,
    };

    setTimeout(() => {
      onSave(updatedProfile);
      setLoading(false);
      navigation.goBack();
    }, 500);
  };

  // ============================================================
  // 🖼️ KAPAK FOTOĞRAFI SEÇİCİ
  // ============================================================
  const CoverImageSelector = () => (
    <View style={styles.coverSection}>
      <View style={styles.coverSectionHeader}>
        <Text style={styles.coverSectionTitle}>Kapak Fotoğrafları</Text>
        <Text style={styles.coverSectionCount}>
          {coverImages.filter(img => img !== null).length}/3
        </Text>
      </View>
      
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.coverScroll}
        contentContainerStyle={styles.coverScrollContent}
      >
        {coverImages.map((img, index) => (
          <View key={index} style={styles.coverItemWrapper}>
            <TouchableOpacity
              style={styles.coverItem}
              onPress={() => pickImage('cover', index)}
              activeOpacity={0.8}
            >
              {img ? (
                <>
                  <Image source={{ uri: img }} style={styles.coverPreview} />
                  <TouchableOpacity 
                    style={styles.coverRemoveButton}
                    onPress={() => removeCoverImage(index)}
                  >
                    <Ionicons name="close-circle" size={20} color={COLORS.white} />
                  </TouchableOpacity>
                </>
              ) : (
                <View style={styles.coverPlaceholder}>
                  <Ionicons name="add" size={28} color={COLORS.grayMedium} />
                  <Text style={styles.coverPlaceholderText}>
                    {index === 0 ? 'Ana Kapak' : `${index + 1}. Kapak`}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
            <Text style={styles.coverLabel}>
              {index === 0 ? '⭐ Ana' : `${index + 1}.`}
            </Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );

  // ============================================================
  // 📸 PROFİL FOTOĞRAFI
  // ============================================================
  const AvatarSelector = () => (
    <View style={styles.avatarContainer}>
      <Image source={{ uri: avatar }} style={styles.avatar} />
      <TouchableOpacity 
        style={styles.avatarEditButton} 
        onPress={() => pickImage('avatar')}
      >
        <Ionicons name="camera" size={16} color={COLORS.white} />
      </TouchableOpacity>
      <Text style={styles.avatarHint}>Profil fotoğrafını değiştir</Text>
    </View>
  );

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
        <Text style={styles.headerTitle}>PROFİLİ DÜZENLE</Text>
        <TouchableOpacity 
          style={[styles.saveHeaderButton, loading && styles.saveHeaderDisabled]} 
          onPress={handleSave}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color={COLORS.black} />
          ) : (
            <Text style={styles.saveHeaderText}>KAYDET</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={styles.content}
      >
        {/* Profil Fotoğrafı */}
        <AvatarSelector />

        {/* Kapak Fotoğrafları */}
        <CoverImageSelector />

        {/* Form */}
        <View style={styles.formContainer}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>İsim</Text>
            <TextInput
              style={styles.input}
              placeholder="Adınız"
              placeholderTextColor={COLORS.grayMedium}
              value={name}
              onChangeText={setName}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Soyisim</Text>
            <TextInput
              style={styles.input}
              placeholder="Soyadınız"
              placeholderTextColor={COLORS.grayMedium}
              value={surname}
              onChangeText={setSurname}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Biyografi</Text>
            <TextInput
              style={[styles.input, styles.bioInput]}
              placeholder="Kendinizi tanıtın..."
              placeholderTextColor={COLORS.grayMedium}
              value={bio}
              onChangeText={setBio}
              multiline
              numberOfLines={4}
            />
            <Text style={styles.charCount}>{bio.length}/150</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// ============================================================
// 📌 STYLES
// ============================================================
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white },

  // HEADER
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 0.5,
    borderBottomColor: '#F0F0F0',
  },
  backButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { ...TYPOGRAPHY.caption, fontSize: 12, letterSpacing: 1 },
  saveHeaderButton: { paddingHorizontal: 16, paddingVertical: 8 },
  saveHeaderDisabled: { opacity: 0.5 },
  saveHeaderText: { ...TYPOGRAPHY.caption, fontSize: 11, fontWeight: '600', color: COLORS.black },

  content: { paddingBottom: 40 },

  // AVATAR
  avatarContainer: {
    alignItems: 'center',
    paddingVertical: SIZES.lg,
    borderBottomWidth: 0.5,
    borderBottomColor: '#F0F0F0',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: COLORS.grayLight,
    backgroundColor: COLORS.surface,
  },
  avatarEditButton: {
    position: 'absolute',
    bottom: 30,
    right: '35%',
    backgroundColor: COLORS.black,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  avatarHint: {
    ...TYPOGRAPHY.caption,
    fontSize: 10,
    color: COLORS.grayMedium,
    marginTop: SIZES.sm,
  },

  // COVER IMAGES
  coverSection: {
    paddingVertical: SIZES.lg,
    paddingHorizontal: SIZES.md,
    borderBottomWidth: 0.5,
    borderBottomColor: '#F0F0F0',
  },
  coverSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.sm,
  },
  coverSectionTitle: { ...TYPOGRAPHY.caption, fontSize: 10, color: COLORS.grayMedium },
  coverSectionCount: { ...TYPOGRAPHY.caption, fontSize: 9, color: COLORS.grayMedium },
  coverScroll: { flexDirection: 'row' },
  coverScrollContent: { gap: SIZES.sm, paddingVertical: 4 },
  coverItemWrapper: { alignItems: 'center' },
  coverItem: {
    width: 120,
    height: 75,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 0.5,
    borderColor: '#E0E0E0',
    backgroundColor: COLORS.surface,
  },
  coverPreview: { width: '100%', height: '100%' },
  coverRemoveButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 10,
  },
  coverPlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F8F8',
  },
  coverPlaceholderText: {
    ...TYPOGRAPHY.caption,
    fontSize: 7,
    color: COLORS.grayMedium,
    marginTop: 2,
  },
  coverLabel: {
    ...TYPOGRAPHY.caption,
    fontSize: 7,
    color: COLORS.grayMedium,
    marginTop: 2,
  },

  // FORM
  formContainer: { padding: SIZES.md },
  inputGroup: { marginBottom: SIZES.md },
  label: { ...TYPOGRAPHY.caption, fontSize: 10, color: COLORS.grayMedium, marginBottom: 4 },
  input: {
    ...TYPOGRAPHY.body,
    fontSize: 14,
    backgroundColor: '#F8F8F8',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 0.5,
    borderColor: '#E0E0E0',
    color: COLORS.black,
  },
  bioInput: { minHeight: 80, textAlignVertical: 'top' },
  charCount: {
    ...TYPOGRAPHY.caption,
    fontSize: 8,
    color: COLORS.grayMedium,
    textAlign: 'right',
    marginTop: 2,
  },
});

export default EditProfileScreen;