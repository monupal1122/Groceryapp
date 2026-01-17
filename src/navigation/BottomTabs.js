import React, { useContext } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { AppContext } from '../context/AppContext';

import HomeScreen from '../screens/HomeScreen';
import ProductPage from '../screens/ProductPage';
import ProductDetailScreen from '../screens/ProductDetailScreen';
import SearchScreen from '../screens/SearchScreen';
import CartScreen from '../screens/CartScreen';
import ProfileScreen from '../screens/ProfileScreen';
import AddressScreen from '../screens/AddressScreen';
import AddAddressScreen from '../screens/AddAddressScreen';
import PaymentScreen from '../screens/PaymentScreen';
import PaymentSuccessScreen from '../screens/PaymentSuccessScreen';
import OrdersScreen from '../screens/OrdersScreen';
import PersonalInfoScreen from '../screens/PersonalInfoScreen';
import CategoryPage from '../screens/CategoryPage';
import Login from "../screens/LoginScreen"
import OtpScreen from "../screens/OtpScreen";

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// ✅ Stack inside Home Tab
function HomeStack() {
  return (
    <Stack.Navigator initialRouteName="HomeScreen"
      screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name="HomeScreen"
        component={HomeScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ProductPage"
        component={ProductPage}
        options={{ title: 'Products' }}
      />
      <Stack.Screen
        name="ProductDetailScreen"
        component={ProductDetailScreen}
        options={{ title: 'Product Details' }}
      />
      <Stack.Screen
        name="CategoryPage"
        component={CategoryPage}
        options={{ title: 'Category' }}
      />
      <Stack.Screen
        name="SearchScreen"
        component={SearchScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}

// ✅ Stack inside Search Tab
function SearchStack() {
  return (
    <Stack.Navigator initialRouteName="SearchScreen"
      screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name="SearchScreen"
        component={SearchScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ProductDetailScreen"
        component={ProductDetailScreen}
        options={{ title: 'Product Details' }}
      />
    </Stack.Navigator>
  );
}

// ✅ Stack inside Profile Tab (with nested screens)
function ProfileStack() {
  return (
    <Stack.Navigator
      initialRouteName="ProfileHome"
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen
        name="ProfileHome"
        component={ProfileScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="PersonalInfo"
        component={PersonalInfoScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ProfileAddress"
        component={AddressScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="AddAddress"
        component={AddAddressScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Orders"
        component={OrdersScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}

// ✅ Stack for Cart Tab (with Address screen)
function CartStack() {
  return (
    <Stack.Navigator
      initialRouteName="CartHome"
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen
        name="CartHome"
        component={CartScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Address"
        component={AddressScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="AddAddress"
        component={AddAddressScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Payment"
        component={PaymentScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="PaymentSuccess"
        component={PaymentSuccessScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}

function BottomTabs() {
  const { cart, hasNewOrders } = useContext(AppContext);
  const cartCount = cart?.length || 0;

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: true,
        tabBarStyle: {
          height: 60,
          paddingBottom: 8,
          paddingTop: 5,
        },
        tabBarActiveTintColor: '#00A82D', // Blinkit green
        tabBarInactiveTintColor: 'gray',
        tabBarIcon: ({ color, size }) => {
          let iconName;
          if (route.name === 'Home') iconName = 'home-outline';
          else if (route.name === 'Search') iconName = 'search-outline';
          else if (route.name === 'Cart') iconName = 'cart-outline';
          else if (route.name === 'Profile') iconName = 'person-outline';
          return <Ionicons name={iconName} size={22} color={color} />;
        },
        tabBarBadge: (() => {
          if (route.name === 'Cart' && cartCount > 0) {
            return cartCount;
          } else if (route.name === 'Profile' && hasNewOrders) {
            return ' ';
          }
          return undefined;
        })(),
        tabBarBadgeStyle: (() => {
          if (route.name === 'Cart') {
            return {
              backgroundColor: '#EF4444',
              color: '#fff',
              fontSize: 12,
            };
          } else if (route.name === 'Profile' && hasNewOrders) {
            return {
              backgroundColor: '#16A34A',
              minWidth: 8,
              height: 8,
              borderRadius: 4,
              fontSize: 1,
            };
          }
          return {
            backgroundColor: '#EF4444',
            color: '#fff',
            fontSize: 12,
          };
        })(),
      })}

    >
      {/* 👇 Stack Navigator under Home Tab */}
      <Tab.Screen name="Home" component={HomeStack} />
      {/* 👇 Stack Navigator under Search Tab */}
      <Tab.Screen name="Search" component={SearchStack} />
      <Tab.Screen name="Cart" component={CartStack} />
      {/* 👇 Stack Navigator under Profile Tab with nested screens */}
      <Tab.Screen
        name="Profile"
        component={ProfileStack}
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            // Reset to profile home when tab is pressed
            const state = navigation.getState();
            const profileRoute = state.routes.find(route => route.name === 'Profile');
            if (profileRoute && profileRoute.state) {
              // Reset the profile stack to show the main profile page
              navigation.reset({
                index: 0,
                routes: [
                  {
                    name: 'Profile',
                    state: {
                      routes: [{ name: 'ProfileHome' }],
                      index: 0,
                    },
                  },
                ],
              });
              e.preventDefault();
            }
          },
        })}
      />
    </Tab.Navigator>
  );
}

export default BottomTabs;
