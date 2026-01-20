import React, { useState, useRef, useEffect } from 'react';
import { View, Image, FlatList, StyleSheet, Dimensions, TouchableOpacity, Text, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { fetchWithRetry } from '../utils/api';

const { width } = Dimensions.get('window');

const BASE_URL = "https://grocery-backend-3pow.onrender.com";
const AUTO_SCROLL_INTERVAL = 3000; // 3 seconds

export default function PosterSection2() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [banner, setBanner] = useState([]);
  const [loading, setLoading] = useState(true);
  const flatListRef = useRef(null);
  const intervalRef = useRef(null);

  useEffect(() => {
    const fetchBanners = async () => {
      setLoading(true);
      try {
        const response = await fetchWithRetry(`${BASE_URL}/api/banners`);
        if (response && response.ok) {
          const json = await response.json();
          console.log("Banners loaded:", json.banners);
          setBanner(json.banners || []);
        }
      } catch (err) {
        console.log("Banner Fetch Error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchBanners();
  }, []);

  // Auto-scroll effect
  useEffect(() => {
    if (banner.length > 1) {
      startAutoScroll();
    }
    
    return () => {
      stopAutoScroll();
    };
  }, [banner.length]);

  const startAutoScroll = () => {
    stopAutoScroll();
    
    intervalRef.current = setInterval(() => {
      setCurrentIndex((prevIndex) => {
        const nextIndex = (prevIndex + 1) % banner.length;
        flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
        return nextIndex;
      });
    }, AUTO_SCROLL_INTERVAL);
  };

  const stopAutoScroll = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const handleScroll = (event) => {
    const scrollPosition = event.nativeEvent.contentOffset.x;
    const index = Math.round(scrollPosition / (width - 20));
    setCurrentIndex(index);
  };

  const scrollToIndex = (index) => {
    flatListRef.current?.scrollToIndex({ index, animated: true });
    setCurrentIndex(index);
  };

  const handleManualInteraction = () => {
    stopAutoScroll();
    // Restart auto-scroll after 5 seconds of no interaction
    setTimeout(() => {
      if (banner.length > 1) {
        startAutoScroll();
      }
    }, 5000);
  };

  if (loading && banner.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color="#16A34A" />
      </View>
    );
  }

  if (banner.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={banner}
        keyExtractor={(item) => item._id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        onScrollBeginDrag={stopAutoScroll}
        onScrollEndDrag={() => {
          setTimeout(() => {
            if (banner.length > 1) {
              startAutoScroll();
            }
          }, 3000);
        }}
        scrollEventThrottle={16}
        renderItem={({ item }) => {
          const imageUrl = item.imageUrl?.startsWith('http')
            ? item.imageUrl
            : `${BASE_URL}${item.imageUrl?.startsWith('/') ? '' : '/'}${item.imageUrl}`;

          console.log("Rendering banner:", item.title, imageUrl);

          return (
            <View style={styles.bannerContainer}>
              <Image 
                source={{ uri: imageUrl }} 
                style={styles.banner} 
                resizeMode="cover"
                onError={(error) => console.log("Image load error:", error.nativeEvent.error)}
                onLoad={() => console.log("Image loaded:", imageUrl)}
              />
              <View style={styles.overlay}>
                <View style={styles.textContainer}>
                  <Text style={styles.bannerTitle}>{item.title}</Text>
                </View>
              </View>
            </View>
          );
        }}
      />

      {/* Pagination Dots */}
      <View style={styles.pagination}>
        {banner.map((_, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.dot,
              currentIndex === index && styles.activeDot,
            ]}
            onPress={() => {
              handleManualInteraction();
              scrollToIndex(index);
            }}
          />
        ))}
      </View>

      {/* Navigation Arrows */}
      <TouchableOpacity
        style={[styles.navArrow, styles.leftArrow]}
        onPress={() => {
          handleManualInteraction();
          const newIndex = currentIndex > 0 ? currentIndex - 1 : banner.length - 1;
          scrollToIndex(newIndex);
        }}
      >
        <Icon name="chevron-back" size={20} color="#fff" />
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.navArrow, styles.rightArrow]}
        onPress={() => {
          handleManualInteraction();
          const newIndex = currentIndex < banner.length - 1 ? currentIndex + 1 : 0;
          scrollToIndex(newIndex);
        }}
      >
        <Icon name="chevron-forward" size={20} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    marginVertical: 8,
  },
  loadingContainer: {
    height: 180,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bannerContainer: {
    position: 'relative',
  },
  banner: {
    width: width - 20,
    height: 180,
    borderRadius: 12,
    marginHorizontal: 10,
    backgroundColor: '#F3F4F6',
  },
  overlay: {
    position: 'absolute',
    bottom: 0,
    left: 10,
    right: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    padding: 16,
  },
  textContainer: {
    alignItems: 'flex-start',
  },
  bannerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#D1D5DB',
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: '#16A34A',
    width: 20,
  },
  navArrow: {
    position: 'absolute',
    top: '50%',
    transform: [{ translateY: -15 }],
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  leftArrow: {
    left: 20,
  },
  rightArrow: {
    right: 20,
  },
});