import React, { useState, useRef, useEffect } from 'react';
import { View, Image, FlatList, StyleSheet, Dimensions, TouchableOpacity, Text } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

const { width } = Dimensions.get('window');

const banners = [
  {
    id: '1',
    image: {
      uri: 'https://cdn.grofers.com/cdn-cgi/image/f=auto,fit=scale-down,q=70,metadata=none,w=720/layout-engine/2023-07/pharmacy-WEB.jpg',
    },
    title: 'Pharmacy & Health',
    subtitle: 'Medicines & wellness products',
  },
  {
    id: '2',
    image: {
      uri: 'https://cdn.grofers.com/cdn-cgi/image/f=auto,fit=scale-down,q=70,metadata=none,w=720/layout-engine/2023-07/Pet-Care_WEB.jpg',
    },
    title: 'Pet Care',
    subtitle: 'Everything for your furry friends',
  },
  {
    id: '3',
    image: {
      uri: 'https://cdn.grofers.com/cdn-cgi/image/f=auto,fit=scale-down,q=70,metadata=none,w=720/layout-engine/2023-03/babycare-WEB.jpg',
    },
    title: 'Baby Care',
    subtitle: 'Premium baby products',
  },
  {
    id: '4',
    image: {
      uri: 'https://img.freepik.com/free-vector/flat-design-grocery-store-sale-banner_23-2151074240.jpg?w=826&t=st=1711455579~exp=1711456179~hmac=127f790b24c92aa7267418aa84732471f440ea3a30944c84e7ba2797dae294b9',
    },
    title: 'Fresh Groceries',
    subtitle: 'Daily essentials delivered fast',
  },
  {
    id: '5',
    image: {
      uri:'https://img.freepik.com/free-vector/hand-drawn-grocery-store-sale-banner_23-2151058137.jpg?w=1060&t=st=1707646831~exp=1707647431~hmac=e974d5a6d0cab376080f6bb497bc059752b4ffe76d5dbb79272f4f91e238e4b5',
    title: 'Exclusive Offers',
    subtitle: 'Best deals on top products',
  }
}
];

export default function PosterSection() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isUserInteracting, setIsUserInteracting] = useState(false);
  const flatListRef = useRef(null);
  const autoScrollTimer = useRef(null);

  // Auto-scroll functionality
  useEffect(() => {
    startAutoScroll();
    return () => {
      stopAutoScroll();
    };
  }, [currentIndex]);

  const startAutoScroll = () => {
    stopAutoScroll(); // Clear any existing timer
    if (!isUserInteracting) {
      autoScrollTimer.current = setTimeout(() => {
        const nextIndex = (currentIndex + 1) % banners.length;
        scrollToIndex(nextIndex);
      }, 3000); // Auto-scroll every 3 seconds
    }
  };

  const stopAutoScroll = () => {
    if (autoScrollTimer.current) {
      clearTimeout(autoScrollTimer.current);
      autoScrollTimer.current = null;
    }
  };

  const handleUserInteraction = () => {
    setIsUserInteracting(true);
    stopAutoScroll();
    // Resume auto-scroll after 5 seconds of no interaction
    setTimeout(() => {
      setIsUserInteracting(false);
    }, 8000);
  };

  const handleScroll = (event) => {
    const scrollPosition = event.nativeEvent.contentOffset.x;
    const index = Math.round(scrollPosition / (width - 20));
    setCurrentIndex(index);
  };

  const scrollToIndex = (index) => {
    setCurrentIndex(index);
    flatListRef.current?.scrollToIndex({ index, animated: true });
  };

  const handleDotPress = (index) => {
    handleUserInteraction();
    scrollToIndex(index);
  };

  const handleArrowPress = (direction) => {
    handleUserInteraction();
    const newIndex = direction === 'left' 
      ? (currentIndex > 0 ? currentIndex - 1 : banners.length - 1)
      : (currentIndex < banners.length - 1 ? currentIndex + 1 : 0);
    scrollToIndex(newIndex);
  };

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={banners}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        onScrollBeginDrag={handleUserInteraction}
        renderItem={({ item }) => (
          <View style={styles.bannerContainer}>
            <Image source={item.image} style={styles.banner} resizeMode="cover" />
            <View style={styles.overlay}>
              <View style={styles.textContainer}>
                <Text style={styles.bannerTitle}>{item.title}</Text>
                <Text style={styles.bannerSubtitle}>{item.subtitle}</Text>
              </View>
            </View>
          </View>
        )}
      />

      {/* Pagination Dots */}
      <View style={styles.pagination}>
        {banners.map((_, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.dot,
              currentIndex === index && styles.activeDot,
            ]}
            onPress={() => handleDotPress(index)}
          />
        ))}
      </View>

      {/* Navigation Arrows */}
      <TouchableOpacity
        style={[styles.navArrow, styles.leftArrow]}
        onPress={() => handleArrowPress('left')}
      >
        <Icon name="chevron-back" size={20} color="#fff" />
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.navArrow, styles.rightArrow]}
        onPress={() => handleArrowPress('right')}
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
  bannerContainer: {
    position: 'relative',
  },
  banner: {
    width: width - 20,
    height: 180,
    borderRadius: 12,
    marginHorizontal: 10,
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
  bannerSubtitle: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.9,
    fontWeight: '500',
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
