import React, { useContext, useState, useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthContext } from '../context/AuthContext';
import LoginScreen from '../screens/LoginScreen';
import SignupScreen from '../screens/SignupScreen';
import SplashScreen from '../screens/SplashScreen';
// import OTPScreen from '../screens/OtpScreen';
import BottomTabs from './BottomTabs';

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  const { user, loading } = useContext(AuthContext);
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    // Show splash screen for 3 seconds
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  // Show splash screen OR loading indicator
  if (showSplash || loading) {
    return <SplashScreen />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{ headerShown: false, animationEnabled: true }}
      >
        {user ? (
          /* User is logged in - show main app */
          <Stack.Screen
            name="HomeStack"
            component={BottomTabs}
            options={{ animationEnabled: false }}
          />
        ) : (
          /* User not logged in - show login first */
          <Stack.Group>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Signup" component={SignupScreen} />
          </Stack.Group>
        )}

        {/* Auth screens - accessible even when logged in for re-auth */}
        <Stack.Group screenOptions={{ animationEnabled: true }}>
          <Stack.Screen name="LoginReauth" component={LoginScreen} />
          <Stack.Screen name="signupReauth" component={SignupScreen} />
        </Stack.Group>
      </Stack.Navigator>
    </NavigationContainer>
  );
}
