import React, { useContext, useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { NavigationContainer, ThemeContext } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { ThemeProvider } from './templates/ThemeContext';

import ProfileScreen from './templates/ProfileScreen';
import { CartContext, CartProvider } from './templates/CartContext';
import CheckoutScreen from './templates/CheckoutScreen';
import PaymentSuccessScreen from './templates/PaymentSuccessScreen';
import HomeScreen from './templates/HomeScreen';
import ProductDetailsScreen from './templates/ProductDetailsScreen';
import CartScreen from './templates/CartScreen';
import SettingsScreen from './templates/SettingsScreen';
import SignUpScreen from './templates/SignUpScreen';
import SignInScreen from './templates/SignInScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const HomeStack = createNativeStackNavigator();
function HomeStackNavigator() {
  return (
    <HomeStack.Navigator screenOptions={{ headerShown: false }}>
      <HomeStack.Screen name="HomeScreen" component={HomeScreen} />
      <HomeStack.Screen name="ProductDetails" component={ProductDetailsScreen} />
    </HomeStack.Navigator>
  );
}

// page shon after log in
function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, size }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Cart') {
            iconName = focused ? 'cart' : 'cart-outline';
          } else if (route.name === 'Settings') {
            iconName = focused ? 'settings' : 'settings-outline';
          }

          return <Ionicons name={iconName} size={size} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeStackNavigator} />
      <Tab.Screen name="Cart" component={CartScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}

// decides if user is logged in or would redirect tothe main app
function RootNavigator() {
  const { user, setUserAndPersist } = useContext(CartContext);
  const [checkingUser, setCheckingUser] = useState(true);

  useEffect(() => {
    const checkStoredUser = async () => {
      try {
        const raw = await AsyncStorage.getItem('pricecomp_user');
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed?.id) {
            await setUserAndPersist(parsed);
          }
        }
      } catch (error) {
        console.error('Error loading user from storage:', error);
      } finally {
        setCheckingUser(false);
      }
    };

    checkStoredUser();
  }, []);

  if (checkingUser) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {user && user.id ? (
        <Stack.Screen name="MainApp" component={MainTabs} />
      ) : (
        <>
          <Stack.Screen name="SignUp" component={SignUpScreen} />
          <Stack.Screen name="SignIn" component={SignInScreen} />
        </>
      )}
      <Stack.Screen name="Checkout" component={CheckoutScreen} />
      <Stack.Screen name="PaymentSuccess" component={PaymentSuccessScreen} />
      <Stack.Screen name="Profile" component={ProfileScreen} />

    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <CartProvider>
      <ThemeProvider>
      <NavigationContainer>
        <RootNavigator />
      </NavigationContainer>
      </ThemeProvider>
    </CartProvider>
  );
}
