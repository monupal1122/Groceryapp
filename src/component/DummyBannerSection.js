import React, { useState, useRef, useEffect } from 'react';
import { View, Image, FlatList, StyleSheet, Dimensions, TouchableOpacity, Animated } from 'react-native';

const { width } = Dimensions.get('window');

// Local dummy data with generated assets
const BANNERS = [
    {
        id: '1',
        image: require('../assets/banner1.png'), // These will need to be moved to assets
        title: 'Freshness Delivered'
    },
    {
        id: '2',
        image: require('../assets/banner2.png'),
        title: '50% OFF'
    }
];

export default function DummyBannerSection() {
    const [currentIndex, setCurrentIndex] = useState(0);
    const flatListRef = useRef(null);

    useEffect(() => {
        const timer = setInterval(() => {
            if (currentIndex < BANNERS.length - 1) {
                flatListRef.current?.scrollToIndex({
                    index: currentIndex + 1,
                    animated: true,
                });
            } else {
                flatListRef.current?.scrollToIndex({
                    index: 0,
                    animated: true,
                });
            }
        }, 4000);

        return () => clearInterval(timer);
    }, [currentIndex]);

    const onScroll = (event) => {
        const scrollOffset = event.nativeEvent.contentOffset.x;
        const index = Math.round(scrollOffset / width);
        setCurrentIndex(index);
    };

    return (
        <View style={styles.container}>
            <FlatList
                ref={flatListRef}
                data={BANNERS}
                keyExtractor={(item) => item.id}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onMomentumScrollEnd={onScroll}
                renderItem={({ item }) => (
                    <View style={styles.bannerContainer}>
                        <Image source={item.image} style={styles.bannerImage} resizeMode="cover" />
                    </View>
                )}
            />

            {/* Indicator */}
            <View style={styles.indicatorContainer}>
                {BANNERS.map((_, index) => (
                    <View
                        key={index}
                        style={[
                            styles.dot,
                            currentIndex === index ? styles.activeDot : null
                        ]}
                    />
                ))}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginVertical: 16,
        height: 180,
    },
    bannerContainer: {
        width: width,
        paddingHorizontal: 16,
    },
    bannerImage: {
        width: width - 32,
        height: 180,
        borderRadius: 16,
    },
    indicatorContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 8,
    },
    dot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#D1D5DB',
        marginHorizontal: 4,
    },
    activeDot: {
        backgroundColor: '#16A34A',
        width: 16,
    },
});
