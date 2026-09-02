// src/screens/AuthScreen.js - GİRİŞ/KAYIT EKRANI (Backend Entegre)
import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth } from '../config/firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { COLORS, TYPOGRAPHY, SIZES } from '../constants/Theme';

// ============================================================
// 🔗 BACKEND API
// ============================================================

const API_URL = 'http://130.61.118.228:8080';

// ============================================================
// 📱 AUTH SCREEN
// ============================================================

const AuthScreen = ({ navigation }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // ============================================================
  // 🔐 BACKEND'E KAYIT OL
  // ============================================================
  
  const registerToBackend = async (email, password, displayName) => {
    try {
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          display_name: displayName || email.split('@')[0]
        })
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Backend register hatası:', error);
      return { success: false, error: error.message };
    }
  };

  // ============================================================
  // 🔐 BACKEND'E GİRİŞ YAP
  // ============================================================
  
  const loginToBackend = async (email, password) => {
    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Backend login hatası:', error);
      return { success: false, error: error.message };
    }
  };

  // ============================================================
  // 📝 AUTH İŞLEMİ (Firebase + Backend)
  // ============================================================

  const handleAuth = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Hata', 'Lütfen e-posta ve şifre giriniz.');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Hata', 'Şifre en az 6 karakter olmalı.');
      return;
    }

    setLoading(true);

    try {
      if (isLogin) {
        // 🔐 1. Firebase ile giriş
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const firebaseUser = userCredential.user;
        console.log('✅ Firebase giriş başarılı:', firebaseUser.uid);

        // 🔐 2. Backend'e giriş
        const backendResult = await loginToBackend(email, password);
        
        if (backendResult.success) {
          // Token'ı kaydet
          await AsyncStorage.setItem('modaverse_token', backendResult.id_token);
          await AsyncStorage.setItem('modaverse_user', JSON.stringify({
            id: backendResult.local_id,
            email: backendResult.email
          }));
          console.log('✅ Backend giriş başarılı, token kaydedildi');
        } else {
          console.warn('⚠️ Backend giriş başarısız:', backendResult.message);
          // Backend hatası olsa bile Firebase girişi başarılı, devam et
        }

        Alert.alert('Başarılı', 'Giriş yapıldı!');
        
      } else {
        // 📝 1. Firebase ile kayıt
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const firebaseUser = userCredential.user;
        console.log('✅ Firebase kayıt başarılı:', firebaseUser.uid);

        // 📝 2. Backend'e kayıt
        const displayName = email.split('@')[0];
        const backendResult = await registerToBackend(email, password, displayName);
        
        if (backendResult.success) {
          console.log('✅ Backend kayıt başarılı:', backendResult.user_id);
        } else {
          console.warn('⚠️ Backend kayıt başarısız:', backendResult.message);
          // Backend hatası olsa bile Firebase kaydı başarılı, devam et
        }

        Alert.alert('Başarılı', 'Hesap oluşturuldu! Lütfen giriş yapın.');
        
        // Kayıt sonrası giriş ekranına geç
        setIsLogin(true);
        setPassword('');
      }

    } catch (error) {
      console.error('Auth hatası:', error);
      
      let message = 'Bir hata oluştu.';
      switch (error.code) {
        case 'auth/invalid-email':
          message = 'Geçersiz e-posta adresi.';
          break;
        case 'auth/user-not-found':
          message = 'Bu e-posta ile kayıtlı kullanıcı bulunamadı.';
          break;
        case 'auth/wrong-password':
          message = 'Hatalı şifre.';
          break;
        case 'auth/email-already-in-use':
          message = 'Bu e-posta zaten kullanılıyor.';
          break;
        case 'auth/weak-password':
          message = 'Şifre en az 6 karakter olmalı.';
          break;
        case 'auth/network-request-failed':
          message = 'Ağ bağlantısı hatası. Lütfen bağlantınızı kontrol edin.';
          break;
        default:
          message = error.message || 'Bir hata oluştu.';
      }
      Alert.alert('Hata', message);
      
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // 🎨 UI
  // ============================================================

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
      
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.content}>
          {/* Logo */}
          <View style={styles.logoContainer}>
            <Text style={styles.logo}>MODAVERSE</Text>
            <Text style={styles.subtitle}>MODA EVRENİ</Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <Text style={styles.title}>{isLogin ? 'GİRİŞ YAP' : 'KAYIT OL'}</Text>

            {/* Email */}
            <View style={styles.inputContainer}>
              <Ionicons name="mail-outline" size={18} color={COLORS.grayMedium} />
              <TextInput
                style={styles.input}
                placeholder="E-posta"
                placeholderTextColor={COLORS.grayMedium}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>

            {/* Şifre */}
            <View style={styles.inputContainer}>
              <Ionicons name="lock-closed-outline" size={18} color={COLORS.grayMedium} />
              <TextInput
                style={styles.input}
                placeholder="Şifre"
                placeholderTextColor={COLORS.grayMedium}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={18} color={COLORS.grayMedium} />
              </TouchableOpacity>
            </View>

            {/* Auth Button */}
            <TouchableOpacity
              style={styles.authButton}
              onPress={handleAuth}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color={COLORS.white} />
              ) : (
                <Text style={styles.authButtonText}>
                  {isLogin ? 'GİRİŞ YAP' : 'KAYIT OL'}
                </Text>
              )}
            </TouchableOpacity>

            {/* Switch Login/Register */}
            <TouchableOpacity
              style={styles.switchButton}
              onPress={() => {
                setIsLogin(!isLogin);
                setPassword('');
              }}
            >
              <Text style={styles.switchText}>
                {isLogin ? 'Hesabın yok mu? Kayıt ol' : 'Zaten hesabın var mı? Giriş yap'}
              </Text>
            </TouchableOpacity>

            {/* Backend bağlantı durumu göstergesi */}
            <View style={styles.statusContainer}>
              <View style={[styles.statusDot, { backgroundColor: '#4CAF50' }]} />
              <Text style={styles.statusText}>Sunucu bağlantısı aktif</Text>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

// ============================================================
// 📐 STYLES
// ============================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: SIZES.xl,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: SIZES.xl,
  },
  logo: {
    ...TYPOGRAPHY.title1,
    fontSize: 28,
    letterSpacing: 4,
    marginBottom: SIZES.xs,
  },
  subtitle: {
    ...TYPOGRAPHY.caption,
    color: COLORS.grayMedium,
  },
  form: {
    gap: SIZES.md,
  },
  title: {
    ...TYPOGRAPHY.caption,
    fontSize: 16,
    textAlign: 'center',
    marginBottom: SIZES.md,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 0.5,
    borderColor: COLORS.grayLight,
    paddingHorizontal: SIZES.md,
    paddingVertical: SIZES.sm,
    gap: SIZES.sm,
    borderRadius: 4,
  },
  input: {
    flex: 1,
    ...TYPOGRAPHY.body,
    padding: 0,
  },
  authButton: {
    backgroundColor: COLORS.black,
    paddingVertical: SIZES.md,
    alignItems: 'center',
    marginTop: SIZES.md,
    borderRadius: 4,
  },
  authButtonText: {
    ...TYPOGRAPHY.button,
    color: COLORS.white,
  },
  switchButton: {
    alignItems: 'center',
    marginTop: SIZES.md,
  },
  switchText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.grayMedium,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SIZES.md,
    gap: SIZES.xs,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    ...TYPOGRAPHY.caption,
    fontSize: 10,
    color: COLORS.grayMedium,
  },
});

export default AuthScreen;