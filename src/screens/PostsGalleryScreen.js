// 📁 src/screens/PostsGalleryScreen.js
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  FlatList,
  TouchableOpacity,
  Image,
  Dimensions,
  TextInput,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY } from '../constants/Theme';

const { width } = Dimensions.get('window');

const MOCK_POSTS = [
  { id: '1', image: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=400', likes: 403, comments: 28 },
  { id: '2', image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=400', likes: 365, comments: 19 },
  { id: '3', image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=400', likes: 311, comments: 42 },
  { id: '4', image: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=400', likes: 402, comments: 31 },
  { id: '5', image: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=400', likes: 159, comments: 12 },
  { id: '6', image: 'https://images.unsplash.com/photo-1485968579580-b6d095142e6e?w=400', likes: 83, comments: 8 },
];

const PostsGalleryScreen = ({ navigation }) => {
  const [searchText, setSearchText] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1500);
  };

  const renderPost = ({ item }) => (
    <TouchableOpacity 
      style={styles.postItem}
      activeOpacity={0.85}
      onPress={() => navigation.navigate('PostDetail', { post: item })}
    >
      <Image source={{ uri: item.image }} style={styles.postImage} />
      <View style={styles.postOverlay}>
        <View style={styles.postStats}>
          <View style={styles.postStat}>
            <Ionicons name="heart" size={12} color={COLORS.white} />
            <Text style={styles.postStatText}>{item.likes}</Text>
          </View>
          <View style={styles.postStat}>
            <Ionicons name="chatbubble-outline" size={11} color={COLORS.white} />
            <Text style={styles.postStatText}>{item.comments}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.black} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Paylaşımlarım</Text>
        <View style={styles.headerRight} />
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={18} color={COLORS.grayMedium} />
        <TextInput
          style={styles.searchInput}
          placeholder="Gönderi ara..."
          placeholderTextColor={COLORS.grayMedium}
          value={searchText}
          onChangeText={setSearchText}
        />
      </View>

      <FlatList
        data={MOCK_POSTS}
        renderItem={renderPost}
        keyExtractor={(item) => item.id}
        numColumns={3}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.black} />}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white },
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
  headerTitle: { ...TYPOGRAPHY.title3, fontSize: 17, fontWeight: '600' },
  headerRight: { width: 40 },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: '#F8F8F8',
    borderRadius: 12,
    gap: 10,
  },
  searchInput: { flex: 1, ...TYPOGRAPHY.body, fontSize: 14, padding: 0 },
  listContent: { paddingBottom: 20 },
  postItem: {
    width: width / 3,
    height: width / 3,
    backgroundColor: '#F8F8F8',
    borderWidth: 0.5,
    borderColor: '#F0F0F0',
  },
  postImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  postOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 8,
    paddingVertical: 6,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  postStats: { flexDirection: 'row', gap: 10 },
  postStat: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  postStatText: { ...TYPOGRAPHY.caption, fontSize: 10, color: COLORS.white, fontWeight: '500' },
});

export default PostsGalleryScreen;