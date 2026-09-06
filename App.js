// 📁 App.js - REVİZE (CustomToast Entegrasyonlu)

import React, { useState, useEffect, createContext, useContext, useRef } from 'react';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import * as SplashScreen from 'expo-splash-screen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFonts } from 'expo-font';
import { ActivityIndicator, View, StatusBar, AppState, Platform } from 'react-native';

import { COLORS, TYPOGRAPHY } from './src/constants/Theme';

// 🔥 Firebase
import { auth } from './src/config/firebase';
import { onAuthStateChanged } from 'firebase/auth';

// 🆕 Servisler
import { loadLocalData, migrateDataToFirestore } from './src/services/firestoreService';
import imagePoolService from './src/services/imagePoolService';
import brandService from './src/services/brandService';
import aiAdvisorService from './src/services/aiAdvisorService';
import syncService from './src/services/syncService';

// 🆕 CUSTOM TOAST
import { CustomToast, setToastRef, useToast } from './src/components/CustomAlert';

// 🆕 API Servis
import { API_URL } from './src/services/api';

// ============================================================
// 📌 ANA SAYFALAR (TAB'ler)
// ============================================================
import VitrinimScreen from './src/screens/VitrinimScreen';
import PodiumScreen from './src/screens/PodiumScreen';
import TasarimcimScreen from './src/screens/TasarimcimScreen';
import KoleksiyonumScreen from './src/screens/KoleksiyonumScreen';
import StilimScreen from './src/screens/StilimScreen';

// ============================================================
// 📌 VİTRİNİM SAYFALARI
// ============================================================
import FavoritesScreen from './src/screens/FavoritesScreen';
import SavedScreen from './src/screens/SavedScreen';
import SearchResultsScreen from './src/screens/SearchResultsScreen';
import CategoriesScreen from './src/screens/CategoriesScreen';

// ============================================================
// 📌 PODYUM SAYFALARI
// ============================================================
import HashtagFeedScreen from './src/screens/HashtagFeedScreen';

// ============================================================
// 📌 KOLEKSİYONUM SAYFALARI
// ============================================================
import AddItemScreen from './src/screens/AddItemScreen';
import WardrobeScreen from './src/screens/WardrobeScreen';

// ============================================================
// 📌 STİLİM SAYFALARI
// ============================================================
import OutfitSuggestionScreen from './src/screens/OutfitSuggestionScreen';
import StyleDetailScreen from './src/screens/StyleDetailScreen';
import WashAssistantScreen from './src/screens/WashAssistantScreen';
import PostsGalleryScreen from './src/screens/PostsGalleryScreen';
import FollowersScreen from './src/screens/FollowersScreen';
import PostDetailScreen from './src/screens/PostDetailScreen';
import IdentityGalleryScreen from './src/screens/IdentityGalleryScreen';
import EditProfileScreen from './src/screens/EditProfileScreen';

// ============================================================
// 📌 ORTAK SAYFALAR
// ============================================================
import ProductDetailScreen from './src/screens/ProductDetailScreen';
import CartScreen from './src/screens/CartScreen';
import CheckoutScreen from './src/screens/CheckoutScreen';
import OrdersScreen from './src/screens/OrdersScreen';

// ============================================================
// 📌 AUTH & ONBOARDING
// ============================================================
import OnboardingScreen from './src/screens/OnboardingScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import AuthScreen from './src/screens/AuthScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// ============================================================
// 🆕 CONTEXT'LER
// ============================================================

// TEMA CONTEXT
export const ThemeContext = createContext({ theme: 'light', toggleTheme: () => {}, isDark: false });

// AUTH CONTEXT
export const AuthContext = createContext({ user: null, loading: true });

// API CONTEXT
export const ApiContext = createContext({
  apiUrl: API_URL,
  isConnected: true,
  setConnected: () => {}
});

// APP STATE CONTEXT
export const AppStateContext = createContext({
  appState: 'active',
  isForeground: true,
});

// ============================================================
// 🆕 NAVIGASYON TEMA RENKLERİ
// ============================================================
const getNavigationTheme = (isDark) => {
  if (isDark) {
    return {
      ...DarkTheme,
      colors: {
        ...DarkTheme.colors,
        primary: COLORS.white,
        background: '#121212',
        card: '#1E1E1E',
        text: COLORS.white,
        border: '#2D2D2D',
        notification: COLORS.cognac,
      },
    };
  }
  return {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      primary: COLORS.black,
      background: COLORS.white,
      card: COLORS.white,
      text: COLORS.black,
      border: COLORS.grayLight,
      notification: COLORS.cognac,
    },
  };
};

// ============================================================
// 🆕 TAB BAR ICON
// ============================================================
const getTabBarIcon = (routeName, focused) => {
  const icons = {
    'Vitrinim': focused ? 'home' : 'home-outline',
    'Podyum': focused ? 'trophy' : 'trophy-outline',
    'Tasarımcım': focused ? 'color-wand' : 'color-wand-outline',
    'Koleksiyonum': focused ? 'grid' : 'grid-outline',
    'Stilim': focused ? 'person' : 'person-outline',
  };
  return icons[routeName] || 'square-outline';
};

// ============================================================
// 🆕 SERVİS BAŞLATMA FONKSİYONU
// ============================================================
const initializeServices = async () => {
  try {
    console.log('🚀 Servisler başlatılıyor...');
    await Promise.all([
      imagePoolService.initialize(),
      brandService.initialize(),
      aiAdvisorService.loadCache(),
      syncService.initialize(),
    ]);
    console.log('✅ Tüm servisler başarıyla başlatıldı!');
  } catch (error) {
    console.error('❌ Servis başlatma hatası:', error);
  }
};

// ============================================================
// 🆕 GLOBAL HATA YAKALAMA
// ============================================================
const setupGlobalErrorHandler = () => {
  const originalConsoleError = console.error;
  console.error = (...args) => {
    const errorMessage = args.join(' ');
    if (errorMessage.includes('Non-Error exception') || 
        errorMessage.includes('undefined is not an object')) {
      originalConsoleError.apply(console, args);
    } else {
      originalConsoleError.apply(console, args);
    }
  };

  if (Platform.OS === 'web') {
    window.onerror = (message, source, lineno, colno, error) => {
      console.error('Global hata:', { message, source, lineno, colno });
      return true;
    };
  }
};

// ============================================================
// VİTRİNİM STACK
// ============================================================
function VitrinimStack() {
  const { theme } = useContext(ThemeContext);
  const isDark = theme === 'dark';
  
  return (
    <Stack.Navigator 
      screenOptions={{ 
        headerShown: false,
        contentStyle: { backgroundColor: isDark ? '#121212' : COLORS.white }
      }}
    >
      <Stack.Screen name="VitrinimMain" component={VitrinimScreen} />
      <Stack.Screen name="Favorites" component={FavoritesScreen} />
      <Stack.Screen name="Saved" component={SavedScreen} />
      <Stack.Screen name="SearchResults" component={SearchResultsScreen} />
      <Stack.Screen name="Categories" component={CategoriesScreen} />
      <Stack.Screen 
        name="ProductDetail" 
        component={ProductDetailScreen}
        options={{
          headerShown: true,
          title: 'ÜRÜN DETAYI',
          headerStyle: { backgroundColor: isDark ? '#1E1E1E' : COLORS.white },
          headerTintColor: isDark ? COLORS.white : COLORS.black,
          headerTitleStyle: { ...TYPOGRAPHY.caption, fontSize: 12, color: isDark ? COLORS.white : COLORS.black },
          headerShadowVisible: false,
        }}
      />
    </Stack.Navigator>
  );
}

// ============================================================
// PODYUM STACK
// ============================================================
function PodiumStack() {
  const { theme } = useContext(ThemeContext);
  const isDark = theme === 'dark';
  
  return (
    <Stack.Navigator 
      screenOptions={{ 
        headerShown: false,
        contentStyle: { backgroundColor: isDark ? '#121212' : COLORS.white }
      }}
    >
      <Stack.Screen name="PodiumMain" component={PodiumScreen} />
      <Stack.Screen name="HashtagFeed" component={HashtagFeedScreen} />
      <Stack.Screen 
        name="ProductDetail" 
        component={ProductDetailScreen}
        options={{
          headerShown: true,
          title: 'ÜRÜN DETAYI',
          headerStyle: { backgroundColor: isDark ? '#1E1E1E' : COLORS.white },
          headerTintColor: isDark ? COLORS.white : COLORS.black,
          headerTitleStyle: { ...TYPOGRAPHY.caption, fontSize: 12, color: isDark ? COLORS.white : COLORS.black },
          headerShadowVisible: false,
        }}
      />
    </Stack.Navigator>
  );
}

// ============================================================
// TASARIMCIM STACK
// ============================================================
function TasarimcimStack() {
  const { theme } = useContext(ThemeContext);
  const isDark = theme === 'dark';
  
  return (
    <Stack.Navigator 
      screenOptions={{ 
        headerShown: false,
        contentStyle: { backgroundColor: isDark ? '#121212' : COLORS.white }
      }}
    >
      <Stack.Screen name="TasarimcimMain" component={TasarimcimScreen} />
      <Stack.Screen 
        name="ProductDetail" 
        component={ProductDetailScreen}
        options={{
          headerShown: true,
          title: 'ÜRÜN DETAYI',
          headerStyle: { backgroundColor: isDark ? '#1E1E1E' : COLORS.white },
          headerTintColor: isDark ? COLORS.white : COLORS.black,
          headerTitleStyle: { ...TYPOGRAPHY.caption, fontSize: 12, color: isDark ? COLORS.white : COLORS.black },
          headerShadowVisible: false,
        }}
      />
    </Stack.Navigator>
  );
}

// ============================================================
// KOLEKSİYONUM STACK
// ============================================================
function KoleksiyonumStack() {
  const { theme } = useContext(ThemeContext);
  const isDark = theme === 'dark';
  
  return (
    <Stack.Navigator 
      screenOptions={{ 
        headerShown: false,
        contentStyle: { backgroundColor: isDark ? '#121212' : COLORS.white }
      }}
    >
      <Stack.Screen name="KoleksiyonumMain" component={KoleksiyonumScreen} />
      <Stack.Screen name="AddItem" component={AddItemScreen} />
      <Stack.Screen name="Wardrobe" component={WardrobeScreen} />
      <Stack.Screen 
        name="ProductDetail" 
        component={ProductDetailScreen}
        options={{
          headerShown: true,
          title: 'ÜRÜN DETAYI',
          headerStyle: { backgroundColor: isDark ? '#1E1E1E' : COLORS.white },
          headerTintColor: isDark ? COLORS.white : COLORS.black,
          headerTitleStyle: { ...TYPOGRAPHY.caption, fontSize: 12, color: isDark ? COLORS.white : COLORS.black },
          headerShadowVisible: false,
        }}
      />
    </Stack.Navigator>
  );
}

// ============================================================
// STİLİM STACK
// ============================================================
function StilimStack() {
  const { theme } = useContext(ThemeContext);
  const isDark = theme === 'dark';
  
  return (
    <Stack.Navigator 
      screenOptions={{ 
        headerShown: false,
        contentStyle: { backgroundColor: isDark ? '#121212' : COLORS.white }
      }}
    >
      <Stack.Screen name="StilimMain" component={StilimScreen} />
      <Stack.Screen name="PostsGallery" component={PostsGalleryScreen} />
      <Stack.Screen name="Followers" component={FollowersScreen} />
      <Stack.Screen name="PostDetail" component={PostDetailScreen} />
      <Stack.Screen name="IdentityGallery" component={IdentityGalleryScreen} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />
      <Stack.Screen name="OutfitSuggestion" component={OutfitSuggestionScreen} />
      <Stack.Screen name="StyleDetail" component={StyleDetailScreen} />
      <Stack.Screen name="WashAssistant" component={WashAssistantScreen} />
      <Stack.Screen 
        name="ProductDetail" 
        component={ProductDetailScreen}
        options={{
          headerShown: true,
          title: 'ÜRÜN DETAYI',
          headerStyle: { backgroundColor: isDark ? '#1E1E1E' : COLORS.white },
          headerTintColor: isDark ? COLORS.white : COLORS.black,
          headerTitleStyle: { ...TYPOGRAPHY.caption, fontSize: 12, color: isDark ? COLORS.white : COLORS.black },
          headerShadowVisible: false,
        }}
      />
    </Stack.Navigator>
  );
}

// ============================================================
// PROFİL STACK
// ============================================================
function ProfileStack() {
  const { theme } = useContext(ThemeContext);
  const isDark = theme === 'dark';
  
  return (
    <Stack.Navigator 
      screenOptions={{ 
        headerShown: false,
        contentStyle: { backgroundColor: isDark ? '#121212' : COLORS.white }
      }}
    >
      <Stack.Screen name="ProfileMain" component={ProfileScreen} />
      <Stack.Screen 
        name="Orders" 
        component={OrdersScreen}
        options={{
          headerShown: true,
          title: 'SİPARİŞLERİM',
          headerStyle: { backgroundColor: isDark ? '#1E1E1E' : COLORS.white },
          headerTintColor: isDark ? COLORS.white : COLORS.black,
          headerTitleStyle: { ...TYPOGRAPHY.caption, fontSize: 12, color: isDark ? COLORS.white : COLORS.black },
          headerShadowVisible: false,
        }}
      />
    </Stack.Navigator>
  );
}

// ============================================================
// ANA MAIN STACK
// ============================================================
function MainStack() {
  const { theme } = useContext(ThemeContext);
  const isDark = theme === 'dark';
  
  return (
    <Stack.Navigator 
      screenOptions={{ 
        headerShown: false,
        contentStyle: { backgroundColor: isDark ? '#121212' : COLORS.white }
      }}
    >
      <Stack.Screen name="MainTabs" component={MainTabs} />
      <Stack.Screen 
        name="Checkout" 
        component={CheckoutScreen}
        options={{
          headerShown: true,
          title: 'ÖDEME',
          headerStyle: { backgroundColor: isDark ? '#1E1E1E' : COLORS.white },
          headerTintColor: isDark ? COLORS.white : COLORS.black,
          headerTitleStyle: { ...TYPOGRAPHY.caption, fontSize: 12, color: isDark ? COLORS.white : COLORS.black },
          headerShadowVisible: false,
        }}
      />
      <Stack.Screen 
        name="Cart" 
        component={CartScreen}
        options={{
          headerShown: true,
          title: 'SEPETİM',
          headerStyle: { backgroundColor: isDark ? '#1E1E1E' : COLORS.white },
          headerTintColor: isDark ? COLORS.white : COLORS.black,
          headerTitleStyle: { ...TYPOGRAPHY.caption, fontSize: 12, color: isDark ? COLORS.white : COLORS.black },
          headerShadowVisible: false,
        }}
      />
    </Stack.Navigator>
  );
}

// ============================================================
// ANA TAB BAR
// ============================================================
function MainTabs() {
  const { theme } = useContext(ThemeContext);
  const isDark = theme === 'dark';
  
  return (
    <Tab.Navigator
      initialRouteName="Vitrinim"
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          const iconName = getTabBarIcon(route.name, focused);
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: isDark ? COLORS.white : COLORS.black,
        tabBarInactiveTintColor: isDark ? '#666666' : COLORS.grayMedium,
        tabBarStyle: {
          backgroundColor: isDark ? '#1E1E1E' : COLORS.white,
          borderTopWidth: 0.5,
          borderTopColor: isDark ? '#2D2D2D' : COLORS.grayLight,
          height: 56,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: { 
          ...TYPOGRAPHY.caption, 
          fontSize: 9, 
          letterSpacing: 0.5,
          color: isDark ? '#AAAAAA' : COLORS.grayMedium,
        },
        headerShown: false,
      })}
    >
      <Tab.Screen name="Vitrinim" component={VitrinimStack} options={{ tabBarLabel: 'VİTRİN' }} />
      <Tab.Screen name="Podyum" component={PodiumStack} options={{ tabBarLabel: 'PODYUM' }} />
      <Tab.Screen name="Tasarımcım" component={TasarimcimStack} options={{ tabBarLabel: 'TASARIMCI' }} />
      <Tab.Screen name="Koleksiyonum" component={KoleksiyonumStack} options={{ tabBarLabel: 'KOLEKSİYON' }} />
      <Tab.Screen name="Stilim" component={StilimStack} options={{ tabBarLabel: 'STİLİM' }} />
    </Tab.Navigator>
  );
}

// ============================================================
// AUTH LOADING EKRANI
// ============================================================
const AppLoading = ({ theme }) => {
  const isDark = theme === 'dark';
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: isDark ? '#121212' : COLORS.white }}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={isDark ? '#121212' : COLORS.white} />
      <ActivityIndicator size="large" color={isDark ? COLORS.white : COLORS.black} />
    </View>
  );
};

// ============================================================
// ROOT STACK
// ============================================================
function RootStack() {
  const { user, loading } = useContext(AuthContext);
  const { theme } = useContext(ThemeContext);
  const isDark = theme === 'dark';

  if (loading) {
    return <AppLoading theme={theme} />;
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!user ? (
        <Stack.Screen name="Auth" component={AuthScreen} />
      ) : (
        <Stack.Screen name="Main" component={MainStack} />
      )}
    </Stack.Navigator>
  );
}

// ============================================================
// 🆕 ÖN PLAN/ARKA PLAN VERİ YÖNETİMİ
// ============================================================
const refreshDataOnForeground = async () => {
  try {
    await initializeServices();
    if (syncService.isOnline) {
      await syncService.syncNow();
    }
  } catch (error) {
    console.error('Ön plan veri yenileme hatası:', error);
  }
};

const saveDataOnBackground = async () => {
  try {
    console.log('💾 Arka plan veri kaydı yapıldı');
  } catch (error) {
    console.error('Arka plan veri kaydetme hatası:', error);
  }
};

// ============================================================
// ANA APP BİLEŞENİ
// ============================================================
export default function App() {
  const [appIsReady, setAppIsReady] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [theme, setTheme] = useState('light');
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [dataMigrated, setDataMigrated] = useState(false);
  const [isApiConnected, setIsApiConnected] = useState(true);
  const [appState, setAppState] = useState(AppState.currentState);

  // 🆕 Toast Hook
  const { showToast, ToastComponent } = useToast();

  // FONTLARI YÜKLE
  const [fontsLoaded, fontError] = useFonts({
    'Inter-Regular': require('./assets/fonts/Inter-Regular.ttf'),
    'Inter-Medium': require('./assets/fonts/Inter-Medium.ttf'),
    'Inter-SemiBold': require('./assets/fonts/Inter-SemiBold.ttf'),
    'Inter-Bold': require('./assets/fonts/Inter-Bold.ttf'),
  });

  const isDark = theme === 'dark';

  // 🆕 Toast ref'i global olarak ayarla
  useEffect(() => {
    setToastRef({ showToast });
  }, [showToast]);

  // APP STATE YÖNETİMİ
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      setAppState(nextAppState);
      
      if (nextAppState === 'active') {
        console.log('📱 Uygulama ön plana geldi');
        refreshDataOnForeground();
      } else if (nextAppState === 'background') {
        console.log('📱 Uygulama arka plana alındı');
        saveDataOnBackground();
      }
    });

    return () => subscription.remove();
  }, []);

  // GLOBAL HATA YAKALAMA BAŞLAT
  useEffect(() => {
    setupGlobalErrorHandler();
  }, []);

  // SERVİSLERİ BAŞLAT
  useEffect(() => {
    if (appIsReady) {
      initializeServices();
    }
  }, [appIsReady]);

  // NETWORK DURUMU TAKİBİ
  useEffect(() => {
    const checkNetwork = async () => {
      try {
        const response = await fetch(`${API_URL}/health`);
        const online = response.ok;
        syncService.setOnlineStatus(online);
        if (online) {
          console.log('✅ Backend bağlantısı başarılı!');
        } else {
          console.warn('⚠️ Backend bağlantısı başarısız!');
        }
      } catch (error) {
        syncService.setOnlineStatus(false);
        console.error('❌ Backend bağlantı hatası:', error.message);
      }
    };

    checkNetwork();
    const interval = setInterval(checkNetwork, 30000);
    return () => clearInterval(interval);
  }, []);

  // FIREBASE AUTH STATE
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
      console.log("🔥 Firebase Auth:", currentUser ? `Giriş yapan: ${currentUser.email}` : "Giriş yapılmadı");
    });
    return () => unsubscribe();
  }, []);

  // ASYNCSTORAGE → FIRESTORE VERİ TAŞIMA
  useEffect(() => {
    const migrateData = async () => {
      if (user && !dataMigrated) {
        try {
          console.log('🔄 Veri taşıma başlatılıyor...');
          const localData = await loadLocalData();
          
          if (localData) {
            const hasData = localData.profile || 
                           (localData.products && localData.products.length > 0) || 
                           (localData.favorites && localData.favorites.length > 0) || 
                           (localData.cart && localData.cart.length > 0);
            
            if (hasData) {
              console.log('📦 Local veri bulundu, Firestore\'a taşınıyor...');
              const result = await migrateDataToFirestore(user.uid, localData);
              
              if (result.success) {
                console.log('✅ Veriler Firestore\'a başarıyla taşındı!');
                setDataMigrated(true);
              } else {
                console.log('❌ Veri taşıma hatası:', result.error);
              }
            } else {
              console.log('ℹ️ Taşınacak local veri bulunamadı.');
              setDataMigrated(true);
            }
          }
        } catch (error) {
          console.error('Veri taşıma işlemi sırasında hata:', error);
        }
      }
    };
    
    migrateData();
  }, [user, dataMigrated]);

  // APP HAZIRLAMA
  useEffect(() => {
    async function prepare() {
      try {
        await SplashScreen.preventAutoHideAsync();
        
        const hasSeenOnboarding = await AsyncStorage.getItem('@has_seen_onboarding');
        if (!hasSeenOnboarding) {
          setShowOnboarding(true);
        }
        
        const savedTheme = await AsyncStorage.getItem('@app_theme');
        if (savedTheme) {
          setTheme(savedTheme);
        }
        
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (e) {
        console.warn(e);
      } finally {
        setAppIsReady(true);
        await SplashScreen.hideAsync();
      }
    }
    prepare();
  }, []);

  const toggleTheme = async () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    await AsyncStorage.setItem('@app_theme', newTheme);
  };

  const handleOnboardingComplete = async () => {
    await AsyncStorage.setItem('@has_seen_onboarding', 'true');
    setShowOnboarding(false);
  };

  // FONTLAR YÜKLENMEDİYSE
  if ((!fontsLoaded && !fontError) || !appIsReady) {
    return <AppLoading theme={theme} />;
  }

  // ONBOARDING GÖSTER
  if (showOnboarding) {
    return <OnboardingScreen onComplete={handleOnboardingComplete} />;
  }

  // Navigasyon Teması
  const navigationTheme = getNavigationTheme(isDark);

  // ANA UYGULAMA
  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, isDark }}>
      <AuthContext.Provider value={{ user, loading: authLoading }}>
        <ApiContext.Provider value={{ apiUrl: API_URL, isConnected: isApiConnected, setConnected: setIsApiConnected }}>
          <AppStateContext.Provider value={{ appState, isForeground: appState === 'active' }}>
            <StatusBar 
              barStyle={isDark ? 'light-content' : 'dark-content'} 
              backgroundColor={isDark ? '#121212' : COLORS.white} 
            />
            <NavigationContainer theme={navigationTheme}>
              <RootStack />
            </NavigationContainer>
            
            {/* 🆕 CUSTOM TOAST - En üstte */}
            <ToastComponent />
          </AppStateContext.Provider>
        </ApiContext.Provider>
      </AuthContext.Provider>
    </ThemeContext.Provider>
  );
}