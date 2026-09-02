// 📁 src/screens/PostDetailScreen.js
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  Image,
  Dimensions,
  ScrollView,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY } from '../constants/Theme';

const { width } = Dimensions.get('window');

const PostDetailScreen = ({ navigation, route }) => {
  const { post } = route.params || {};
  const [isLiked, setIsLiked] = useState(false);
  const [likes, setLikes] = useState(post?.likes || 0);

  if (!post) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Gönderi bulunamadı</Text>
        </View>
      </SafeAreaView>
    );
  }

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikes(prev => isLiked ? prev - 1 : prev + 1);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.black} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Gönderi Detayı</Text>
        <TouchableOpacity style={styles.moreButton}>
          <Ionicons name="ellipsis-horizontal" size={20} color={COLORS.black} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <Image source={{ uri: post.image }} style={styles.postImage} />

        <View style={styles.actionsContainer}>
          <View style={styles.actionsLeft}>
            <TouchableOpacity onPress={handleLike} style={styles.actionButton}>
              <Ionicons name={isLiked ? 'heart' : 'heart-outline'} size={26} color={isLiked ? COLORS.error : COLORS.black} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="chatbubble-outline" size={24} color={COLORS.black} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="paper-plane-outline" size={24} color={COLORS.black} />
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="bookmark-outline" size={24} color={COLORS.black} />
          </TouchableOpacity>
        </View>

        <View style={styles.infoContainer}>
          <Text style={styles.likesText}>{likes} beğeni</Text>
          <View style={styles.captionContainer}>
            <Text style={styles.captionUser}>modasever</Text>
            <Text style={styles.captionText}>Stilini yansıtan mükemmel bir kombin! ✨</Text>
          </View>
          <TouchableOpacity style={styles.commentsLink}>
            <Text style={styles.commentsText}>{post.comments} yorumun hepsini gör</Text>
          </TouchableOpacity>
          <Text style={styles.dateText}>2 gün önce</Text>
        </View>
      </ScrollView>

      <View style={styles.commentInputContainer}>
        <TouchableOpacity style={styles.emojiButton}>
          <Ionicons name="happy-outline" size={24} color={COLORS.grayMedium} />
        </TouchableOpacity>
        <TextInput
          style={styles.commentInput}
          placeholder="Yorum ekle..."
          placeholderTextColor={COLORS.grayMedium}
        />
        <TouchableOpacity style={styles.postCommentButton}>
          <Text style={styles.postCommentText}>Gönder</Text>
        </TouchableOpacity>
      </View>
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
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: '#F0F0F0',
  },
  backButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { ...TYPOGRAPHY.body, fontSize: 15, fontWeight: '500' },
  moreButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  postImage: { width: width, height: width, resizeMode: 'cover', backgroundColor: '#F8F8F8' },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  actionsLeft: { flexDirection: 'row', gap: 16 },
  actionButton: { padding: 4 },
  infoContainer: { paddingHorizontal: 16, gap: 8 },
  likesText: { ...TYPOGRAPHY.body, fontSize: 14, fontWeight: '600' },
  captionContainer: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  captionUser: { ...TYPOGRAPHY.body, fontSize: 14, fontWeight: '600' },
  captionText: { ...TYPOGRAPHY.body, fontSize: 14, flex: 1 },
  commentsLink: { marginTop: 4 },
  commentsText: { ...TYPOGRAPHY.body, fontSize: 14, color: COLORS.grayMedium },
  dateText: { ...TYPOGRAPHY.caption, fontSize: 11, color: COLORS.grayMedium, marginTop: 4 },
  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorText: { ...TYPOGRAPHY.body, color: COLORS.grayMedium },
  commentInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 0.5,
    borderTopColor: '#F0F0F0',
    gap: 12,
  },
  emojiButton: { padding: 4 },
  commentInput: { flex: 1, ...TYPOGRAPHY.body, fontSize: 14, paddingVertical: 8 },
  postCommentButton: { paddingHorizontal: 12, paddingVertical: 6 },
  postCommentText: { ...TYPOGRAPHY.body, fontSize: 13, fontWeight: '500', color: COLORS.black },
});

export default PostDetailScreen;