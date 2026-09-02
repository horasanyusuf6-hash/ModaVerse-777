// 📁 src/screens/EditProfileScreen.js
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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY } from '../constants/Theme';

const EditProfileScreen = ({ navigation, route }) => {
  const { profile, onSave } = route.params || {};
  
  const [name, setName] = useState(profile?.name || '');
  const [surname, setSurname] = useState(profile?.surname || '');
  const [bio, setBio] = useState(profile?.bio || '');

  const handleSave = () => {
    if (!name.trim()) {
      Alert.alert('Hata', 'İsim giriniz!');
      return;
    }
    onSave({
      name: name.trim(),
      surname: surname.trim(),
      bio: bio.trim(),
      coverImage: profile?.coverImage || '',
      avatar: profile?.avatar || 'https://i.pravatar.cc/100?img=1',
    });
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.black} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profili Düzenle</Text>
        <TouchableOpacity style={styles.saveHeaderButton} onPress={handleSave}>
          <Text style={styles.saveHeaderText}>Kaydet</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>İsim</Text>
          <TextInput
            style={styles.input}
            placeholder="İsminiz"
            placeholderTextColor={COLORS.grayMedium}
            value={name}
            onChangeText={setName}
          />
        </View>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Soyisim</Text>
          <TextInput
            style={styles.input}
            placeholder="Soyisminiz"
            placeholderTextColor={COLORS.grayMedium}
            value={surname}
            onChangeText={setSurname}
          />
        </View>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Bio</Text>
          <TextInput
            style={[styles.input, styles.bioInput]}
            placeholder="Kendinizden bahsedin..."
            placeholderTextColor={COLORS.grayMedium}
            value={bio}
            onChangeText={setBio}
            multiline
            numberOfLines={3}
          />
        </View>
      </ScrollView>
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
  saveHeaderButton: { paddingHorizontal: 16, paddingVertical: 8 },
  saveHeaderText: { ...TYPOGRAPHY.body, fontSize: 14, fontWeight: '500', color: COLORS.black },
  content: { padding: 16, paddingBottom: 40 },
  inputGroup: { marginBottom: 16 },
  label: { ...TYPOGRAPHY.caption, marginBottom: 8, color: COLORS.grayMedium },
  input: {
    ...TYPOGRAPHY.body,
    backgroundColor: '#F8F8F8',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 0.5,
    borderColor: '#E0E0E0',
  },
  bioInput: { minHeight: 80, textAlignVertical: 'top' },
});

export default EditProfileScreen;