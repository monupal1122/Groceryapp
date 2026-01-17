import React, { useContext } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthContext } from '../context/AuthContext';
import LoginScreen from '../screens/LoginScreen';
import SignupScreen from '../screens/SignupScreen';
// import OTPScreen from '../screens/OtpScreen';
import BottomTabs from './BottomTabs';

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#00C853" />
      </View>
    );
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
