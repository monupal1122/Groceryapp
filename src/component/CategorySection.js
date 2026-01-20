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
import { fetchWithRetry } from '../utils/api';

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
        const response = await fetchWithRetry('https://grocery-backend-3pow.onrender.com/api/categories');

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
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color="#16A34A" />
      </View>
    );
  }

  if (error || categories.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.errorText}>{error || "No categories found"}</Text>
      </View>
    );
  }

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
    >
      {categories.map((item) => {
        return (
          <Pressable
            key={item._id}
            style={({ pressed }) => [
              styles.card,
              { transform: [{ scale: pressed ? 0.95 : 1 }] }
            ]}
            onPress={() => navigation.navigate('ProductPage', { categoryId: item._id })}
          >
            <View style={styles.imageWrapper}>
              <Image
                source={{
                  uri: item.image?.startsWith('http')
                    ? item.image
                    : `${BASE_URL}${item.image?.startsWith('/') ? '' : '/'}${item.image}`
                }}
                style={styles.image}
                resizeMode="contain"
              />
            </View>
            <Text style={styles.name} numberOfLines={2}>
              {item.name}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    height: 130,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: '#9CA3AF',
    fontSize: 12,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  card: {
    alignItems: 'center',
    marginRight: 20,
    width: 90,
  },
  imageWrapper: {
    width: 90,
    height: 90,
    borderRadius: 20,
    backgroundColor: '#F9FAFB',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  image: {
    width: 60,
    height: 60,
  },
  name: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1F2937',
    textAlign: 'center',
    lineHeight: 16,
  },
});