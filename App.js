// 📁 App.js - v6 UYUMLU VERSİYON
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack'; // v6 için bu import doğru
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS } from './src/constants/Theme';

// Screen imports
import VitrinimScreen from './src/screens/VitrinimScreen';
import PodiumScreen from './src/screens/PodiumScreen';
import TasarimcimScreen from './src/screens/TasarimcimScreen';
import KoleksiyonumScreen from './src/screens/KoleksiyonumScreen';
import StilimScreen from './src/screens/StilimScreen';
import AddItemScreen from './src/screens/AddItemScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

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

// KOLEKSİYONUM STACK
function KoleksiyonumStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="KoleksiyonumMain" component={KoleksiyonumScreen} />
      <Stack.Screen 
        name="AddItem" 
        component={AddItemScreen}
        options={{ 
          headerShown: true,
          title: 'YENİ KIYAFET EKLE',
          headerStyle: { backgroundColor: COLORS.cognac },
          headerTintColor: COLORS.white,
          headerTitleStyle: {
            fontWeight: '400',
            letterSpacing: 1,
            fontSize: 16,
          },
        }}
      />
    </Stack.Navigator>
  );
}

// DİĞER STACK'LER (header gösterilmeyecek)
function VitrinimStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="VitrinimMain" component={VitrinimScreen} />
    </Stack.Navigator>
  );
}

function PodiumStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="PodiumMain" component={PodiumScreen} />
    </Stack.Navigator>
  );
}

function TasarimcimStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="TasarimcimMain" component={TasarimcimScreen} />
    </Stack.Navigator>
  );
}

function StilimStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="StilimMain" component={StilimScreen} />
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        initialRouteName="Vitrinim"
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            const iconName = getTabBarIcon(route.name, focused);
            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: COLORS.charcoal,
          tabBarInactiveTintColor: COLORS.silver,
          tabBarStyle: {
            backgroundColor: COLORS.white,
            borderTopWidth: 0.5,
            borderTopColor: COLORS.cloud,
            height: 60,
            paddingBottom: 10,
            paddingTop: 10,
          },
          tabBarLabelStyle: {
            fontSize: 10,
            fontWeight: '400',
            letterSpacing: 0.5,
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
    </NavigationContainer>
  );
}