// 📁 src/screens/FollowersScreen.js
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
  TextInput,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY } from '../constants/Theme';

const MOCK_FOLLOWERS = [
  { id: '1', name: 'Ayşe Yılmaz', username: 'ayseyilmaz', avatar: 'https://i.pravatar.cc/100?img=4', isFollowing: false },
  { id: '2', name: 'Mehmet Demir', username: 'mehmetdemir', avatar: 'https://i.pravatar.cc/100?img=5', isFollowing: false },
  { id: '3', name: 'Zeynep Kaya', username: 'zeynepkaya', avatar: 'https://i.pravatar.cc/100?img=6', isFollowing: true },
];

const FollowersScreen = ({ navigation, route }) => {
  const { type = 'followers' } = route.params || {};
  const [searchText, setSearchText] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const isFollowing = type === 'following';
  const title = isFollowing ? 'Takip Ettiklerim' : 'Takipçilerim';
  const icon = isFollowing ? 'person-add-outline' : 'people-outline';

  const renderFollower = ({ item }) => (
    <View style={styles.followerItem}>
      <View style={styles.followerLeft}>
        <Image source={{ uri: item.avatar }} style={styles.followerAvatar} />
        <View style={styles.followerInfo}>
          <Text style={styles.followerName}>{item.name}</Text>
          <Text style={styles.followerUsername}>@{item.username}</Text>
        </View>
      </View>
      <TouchableOpacity style={styles.followButton}>
        <Text style={styles.followButtonText}>Takip Et</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.black} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <View style={styles.headerIconContainer}>
            <Ionicons name={icon} size={18} color={COLORS.white} />
          </View>
          <Text style={styles.headerTitle}>{title}</Text>
        </View>
        <View style={styles.headerCount}>
          <Text style={styles.headerCountText}>{MOCK_FOLLOWERS.length}</Text>
        </View>
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={18} color={COLORS.grayMedium} />
        <TextInput
          style={styles.searchInput}
          placeholder="Kullanıcı ara..."
          placeholderTextColor={COLORS.grayMedium}
          value={searchText}
          onChangeText={setSearchText}
        />
      </View>

      <FlatList
        data={MOCK_FOLLOWERS}
        renderItem={renderFollower}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => {}} tintColor={COLORS.black} />}
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
  headerCenter: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  headerIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.black,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: { ...TYPOGRAPHY.title3, fontSize: 17, fontWeight: '600' },
  headerCount: {
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  headerCountText: { ...TYPOGRAPHY.caption, fontSize: 12, color: COLORS.grayMedium, fontWeight: '600' },
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
  followerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 0.5,
    borderBottomColor: '#F5F5F5',
  },
  followerLeft: { flexDirection: 'row', alignItems: 'center', gap: 14, flex: 1 },
  followerAvatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#F5F5F5' },
  followerInfo: { flex: 1 },
  followerName: { ...TYPOGRAPHY.body, fontSize: 14, fontWeight: '500', marginBottom: 2 },
  followerUsername: { ...TYPOGRAPHY.bodySmall, fontSize: 12, color: COLORS.grayMedium },
  followButton: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: COLORS.black,
  },
  followButtonText: { ...TYPOGRAPHY.caption, fontSize: 11, color: COLORS.white, fontWeight: '500' },
});

export default FollowersScreen;