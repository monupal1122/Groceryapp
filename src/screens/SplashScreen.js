import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

export default function SplashScreen() {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.3)).current;
  const bounceAnim = useRef(new Animated.Value(0)).current;
  const spinValue = useRef(new Animated.Value(0)).current;
  const floatAnim1 = useRef(new Animated.Value(0)).current;
  const floatAnim2 = useRef(new Animated.Value(0)).current;
  const floatAnim3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Main content animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();

    // Logo bounce animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(bounceAnim, {
          toValue: -15,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(bounceAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Spinner rotation
    Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: true,
      })
    ).start();

    // Floating emojis
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim1, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim1, {
          toValue: 0,
          duration: 3000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim2, {
          toValue: 1,
          duration: 4000,
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim2, {
          toValue: 0,
          duration: 4000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim3, {
          toValue: 1,
          duration: 3500,
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim3, {
          toValue: 0,
          duration: 3500,
          useNativeDriver: true,
        }),
      ])
    ).start();
    
    // No navigation - RootNavigator handles the timing
  }, []);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const float1Y = floatAnim1.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -30],
  });

  const float2Y = floatAnim2.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -40],
  });

  const float3Y = floatAnim3.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -35],
  });

  return (
    <View style={styles.container}>
      {/* Animated background gradient circles */}
      <View style={styles.bgCircle1} />
      <View style={styles.bgCircle2} />
      <View style={styles.bgCircle3} />

      {/* Floating emojis with animation */}
      <Animated.Text
        style={[
          styles.floatingEmoji,
          styles.emoji1,
          { transform: [{ translateY: float1Y }] },
        ]}
      >
        🥬
      </Animated.Text>
      <Animated.Text
        style={[
          styles.floatingEmoji,
          styles.emoji2,
          { transform: [{ translateY: float2Y }] },
        ]}
      >
        🍎
      </Animated.Text>
      <Animated.Text
        style={[
          styles.floatingEmoji,
          styles.emoji3,
          { transform: [{ translateY: float3Y }] },
        ]}
      >
        🥕
      </Animated.Text>
      <Animated.Text
        style={[
          styles.floatingEmoji,
          styles.emoji4,
          { transform: [{ translateY: float1Y }] },
        ]}
      >
        🍌
      </Animated.Text>
      <Animated.Text
        style={[
          styles.floatingEmoji,
          styles.emoji5,
          { transform: [{ translateY: float2Y }] },
        ]}
      >
        🥦
      </Animated.Text>

      {/* Main content */}
      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        {/* Logo with bounce animation */}
        <Animated.View
          style={[
            styles.logoContainer,
            { transform: [{ translateY: bounceAnim }] },
          ]}
        >
          <View style={styles.logoBox}>
            {/* Shopping bag made with pure View components */}
            <View style={styles.bagContainer}>
              <View style={styles.bagHandle} />
              <View style={styles.bagBody}>
                <View style={styles.bagItem1} />
                <View style={styles.bagItem2} />
                <View style={styles.bagItem3} />
              </View>
            </View>
            
            {/* Sparkle decorations */}
            <Text style={[styles.sparkle, styles.sparkle1]}>✨</Text>
            <Text style={[styles.sparkle, styles.sparkle2]}>✨</Text>
          </View>
        </Animated.View>

        {/* App name with gradient effect */}
        <View style={styles.textContainer}>
          <Text style={styles.appName}>Grocery App</Text>
          <View style={styles.underline} />
        </View>

        <Text style={styles.tagline}>🌿 Fresh groceries at your doorstep</Text>

        {/* Animated loading spinner */}
        <Animated.View style={styles.loadingContainer}>
          <Animated.View
            style={[
              styles.spinner,
              { transform: [{ rotate: spin }] },
            ]}
          />
          <View style={styles.spinnerInner} />
        </Animated.View>

        <Text style={styles.loadingText}>Loading your fresh picks...</Text>
      </Animated.View>

      {/* Bottom decoration */}
      <View style={styles.bottomDecoration}>
        <View style={styles.wave1} />
        <View style={styles.wave2} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fffe',
    position: 'relative',
    overflow: 'hidden',
  },
  bgCircle1: {
    position: 'absolute',
    top: -100,
    left: -100,
    width: 350,
    height: 350,
    borderRadius: 175,
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
  },
  bgCircle2: {
    position: 'absolute',
    bottom: -150,
    right: -120,
    width: 450,
    height: 450,
    borderRadius: 225,
    backgroundColor: 'rgba(0, 208, 132, 0.06)',
  },
  bgCircle3: {
    position: 'absolute',
    top: '40%',
    right: -80,
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: 'rgba(5, 150, 105, 0.05)',
  },
  content: {
    alignItems: 'center',
    zIndex: 10,
  },
  logoContainer: {
    marginBottom: 35,
    alignItems: 'center',
  },
  logoBox: {
    width: 140,
    height: 140,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 70,
    shadowColor: '#00b761',
    shadowOffset: { width: 0, height: 15 },
    shadowOpacity: 0.35,
    shadowRadius: 25,
    elevation: 15,
  },
  bagContainer: {
    width: 90,
    height: 100,
    alignItems: 'center',
  },
  bagHandle: {
    width: 50,
    height: 30,
    borderWidth: 6,
    borderColor: '#00b761',
    borderBottomWidth: 0,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    marginBottom: -5,
  },
  bagBody: {
    width: 70,
    height: 80,
    backgroundColor: '#10b981',
    borderRadius: 8,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#047857',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  bagItem1: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    position: 'absolute',
    top: 15,
    left: 15,
  },
  bagItem2: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    position: 'absolute',
    top: 20,
    right: 15,
  },
  bagItem3: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    position: 'absolute',
    bottom: 15,
    left: 25,
  },
  sparkle: {
    position: 'absolute',
    fontSize: 16,
  },
  sparkle1: {
    top: 10,
    right: 15,
  },
  sparkle2: {
    bottom: 20,
    left: 10,
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 12,
  },
  appName: {
    fontSize: 48,
    fontWeight: '800',
    color: '#047857',
    letterSpacing: -1.5,
    textShadowColor: 'rgba(0, 183, 97, 0.15)',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 8,
  },
  underline: {
    width: 120,
    height: 4,
    backgroundColor: '#00d084',
    borderRadius: 2,
    marginTop: 8,
  },
  tagline: {
    fontSize: 17,
    color: '#059669',
    fontWeight: '500',
    marginBottom: 45,
    letterSpacing: 0.3,
  },
  loadingContainer: {
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  spinner: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 5,
    borderColor: '#d1fae5',
    borderTopColor: '#00b761',
    borderRightColor: '#10b981',
  },
  spinnerInner: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ecfdf5',
  },
  loadingText: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
    marginTop: 5,
  },
  floatingEmoji: {
    position: 'absolute',
    fontSize: 45,
    opacity: 0.15,
  },
  emoji1: {
    top: '12%',
    left: '10%',
  },
  emoji2: {
    top: '25%',
    right: '12%',
  },
  emoji3: {
    bottom: '35%',
    left: '8%',
  },
  emoji4: {
    top: '65%',
    right: '15%',
  },
  emoji5: {
    bottom: '15%',
    left: '20%',
  },
  bottomDecoration: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 100,
  },
  wave1: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
    backgroundColor: '#e8f5e9',
    opacity: 0.5,
    borderTopLeftRadius: 100,
    borderTopRightRadius: 100,
  },
  wave2: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 40,
    backgroundColor: '#d1fae5',
    opacity: 0.3,
    borderTopLeftRadius: 80,
    borderTopRightRadius: 80,
  },
});