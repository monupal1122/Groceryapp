import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import { fetchWithRetry } from '../utils/api';
import Icon from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';

// Gradient color combinations for categories
const gradientColors = [
  ['#FF6B9D', '#C44569'],  // Pink-Red
  ['#56AB2F', '#A8E063'],  // Green
  ['#4FACFE', '#00F2FE'],  // Blue
  ['#FA709A', '#FEE140'],  // Pink-Yellow
  ['#FF8008', '#FFC837'],  // Orange
  ['#667EEA', '#764BA2'],  // Purple
  ['#E55D87', '#5FC3E4'],  // Pink-Blue
  ['#2E3192', '#1BFFFF'],  // Navy-Cyan
  ['#F857A6', '#FF5858'],  // Pink-Red
  ['#00C9FF', '#92FE9D'],  // Blue-Green
  ['#FC466B', '#3F5EFB'],  // Red-Blue
  ['#FDBB2D', '#22C1C3'],  // Yellow-Cyan
];

export default function CategorySection() {
  const navigation = useNavigation();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadCategories = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetchWithRetry('https://grocery-backend-3pow.onrender.com/api/categories', {
          onRetry: (attempt) => console.log(`CategorySection - Retry attempt ${attempt}`)
        });

        if (response && response.ok) {
          const resData = await response.json();
          const data = Array.isArray(resData) ? resData : (resData.categories || resData.data || []);
          setCategories(data);
        } else {
          setError("Failed to load categories");
        }
      } catch (err) {
        console.error("Category Fetch Error:", err);
        setError("Failed to load categories");
      } finally {
        setLoading(false);
      }
    };

    loadCategories();
  }, []);

  const BASE_URL = "https://grocery-backend-3pow.onrender.com";

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="small" color="#16A34A" />
      </View>
    );
  }

  if (error || categories.length === 0) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={styles.errorText}>{error || "No categories found"}</Text>
      </View>
    );
  }

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.container}
      contentContainerStyle={{ paddingHorizontal: 20 }}
    >
      {categories.map((item, index) => {
        const colors = gradientColors[index % gradientColors.length];

        return (
          <Pressable
            key={item._id}
            style={({ pressed }) => [styles.card, { opacity: pressed ? 0.8 : 1 }]}
            onPress={() =>
              navigation.navigate('ProductPage', { categoryId: item._id })
            }
          >
            <LinearGradient
              colors={colors}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.gradientBackground}
            >
              <View style={styles.imageContainer}>
                <Image
                  source={{
                    uri: item.image?.startsWith('http')
                      ? item.image
                      : `${BASE_URL}${item.image?.startsWith('/') ? '' : '/'}${item.image}`
                  }}
                  style={styles.image}
                  resizeMode="contain"
                />
                <View style={styles.iconOverlay}>
                  <Icon name="chevron-forward" size={12} color="#16A34A" />
                </View>
              </View>

              <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
            </LinearGradient>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 0,
    flexDirection: 'row',
    height: 120,
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  errorText: {
    color: '#9CA3AF',
    fontSize: 12,
  },
  card: {
    alignItems: 'center',
    marginRight: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
    minWidth: 80,
    overflow: 'hidden',
  },
  gradientBackground: {
    width: '100%',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
  },
  imageContainer: {
    position: 'relative',
    marginBottom: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 30,
    padding: 4,
  },
  image: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  iconOverlay: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#fff',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  name: {
    fontSize: 12,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});
