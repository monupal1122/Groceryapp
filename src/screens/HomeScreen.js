import React from 'react';
import { ScrollView, View, Text, StyleSheet, SafeAreaView, Image, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import PosterSection from '../component/PosterSection';
import Navbar from '../component/Navbar';
import PosterSection2 from '../component/PosterSection2'
import CategorySection from "../component/CategorySection";
import ProductGrid from "../component/ProductGrid";
import Icon from 'react-native-vector-icons/Ionicons';
import { useState, useEffect, useContext } from 'react';
import { ActivityIndicator } from 'react-native';
import { AppContext } from '../context/AppContext';
import { fetchWithRetry } from '../utils/api';
import ProductCard from '../component/ProductCard';
import { Pressable } from 'react-native';
import DummyBannerSection from '../component/DummyBannerSection';

const BASE_URL = "https://grocery-backend-3pow.onrender.com";

export default function HomeScreen({ navigation }) {
  const { products: contextProducts } = useContext(AppContext);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [retrying, setRetrying] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchProducts();
    setRefreshing(false);
  };

  const fetchProducts = async () => {
    try {
      console.log("HomeScreen - Starting fetch...");
      setLoading(true);
      setError(null);
      setRetrying(false);

      const retryOptions = {
        onRetry: (attempt) => {
          console.log(`HomeScreen - Retry attempt ${attempt}`);
          setRetrying(true);
        }
      };

      // 1. Try to fetch categories
      const catRes = await fetchWithRetry(`${BASE_URL}/api/categories`, retryOptions).catch(() => null);
      let categoryId = null;

      if (catRes && catRes.ok) {
        const catJson = await catRes.json();
        const categories = Array.isArray(catJson) ? catJson : (catJson.categories || []);
        console.log(`HomeScreen - Fetched ${categories.length} categories`);
        if (categories.length > 0) {
          categoryId = categories[0]._id;
          console.log(`HomeScreen - Using Category ID: ${categoryId}`);
        }
      } else {
        console.log("HomeScreen - Categories fetch failed or timed out");
      }

      // 2. Fetch products
      let fetchUrl = categoryId
        ? `${BASE_URL}/api/products/category/${categoryId}`
        : `${BASE_URL}/api/products`;

      console.log(`HomeScreen - Fetching products from: ${fetchUrl}`);
      const response = await fetchWithRetry(fetchUrl, retryOptions);

      let products = [];
      if (response && response.ok) {
        const json = await response.json();
        products = Array.isArray(json) ? json : json.products || json.data || [];
      }

      // Fallback
      if (!response || !response.ok || products.length === 0) {
        console.log(`HomeScreen - Primary products failed/empty, falling back to all...`);
        const allRes = await fetchWithRetry(`${BASE_URL}/api/products`, retryOptions).catch(() => null);
        if (allRes && allRes.ok) {
          const allJson = await allRes.json();
          products = Array.isArray(allJson) ? allJson : (allJson.products || []);
          console.log(`HomeScreen - Loaded ${products.length} fallback products`);
        }
      } else {
        console.log(`HomeScreen - Successfully loaded ${products.length} category products`);
      }

      setData(products);

    } catch (error) {
      console.error("HomeScreen - Fetch Internal Error:", error);
      if (contextProducts.length === 0) {
        setError("The server is currently unreachable. Please check your connection or try again later.");
      }
    } finally {
      setLoading(false);
      setRetrying(false);
    }
  };



  return (
    <SafeAreaView style={styles.container}>
      <Navbar />

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#16A34A']} />
        }
      >
        {/* Welcome Section with Premium Header */}
        <View style={styles.headerGradient}>
          <Text style={styles.welcomeTitle}>Good morning! 👋</Text>
          <Text style={styles.welcomeSubtitle}>What would you like to order today?</Text>
        </View>

        <View style={styles.posterContainer}>
          <PosterSection />
        </View>

        {/* Categories Section */}
        <View style={styles.categoriesSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Shop by Category</Text>
            <TouchableOpacity onPress={() => navigation.navigate('SearchScreen')}>
              <Text style={styles.viewAllText}>View All →</Text>
            </TouchableOpacity>
          </View>
          <CategorySection />
        </View>

        {/* Popular Items - Modern Design */}
        <View style={styles.popularSection}>
          <View style={styles.sectionHeader}>
            <View style={{ paddingHorizontal: 20 }}>
              <Text style={styles.sectionTitle}>Popular Items 🔥</Text>
              <Text style={styles.sectionSubtitle}>Top picks this week</Text>
            </View>
            <TouchableOpacity style={{ paddingHorizontal: 20 }} onPress={() => navigation.navigate('SearchScreen')}>
              <Text style={styles.viewAllText}>See all</Text>
            </TouchableOpacity>
          </View>

          {loading && data.length === 0 && contextProducts.length === 0 ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#16A34A" />
              <Text style={styles.loadingText}>
                {retrying ? "Server is waking up..." : "Loading products..."}
              </Text>
              {retrying && (
                <Text style={styles.retryingSubtitle}>This might take a minute on initial load</Text>
              )}
            </View>
          ) : error && data.length === 0 && contextProducts.length === 0 ? (
            <View style={styles.errorContainer}>
              <Icon name="alert-circle-outline" size={48} color="#EF4444" />
              <Text style={styles.errorTitle}>Oops! Something went wrong</Text>
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity style={styles.retryButton} onPress={fetchProducts}>
                <Icon name="refresh" size={20} color="#fff" />
                <Text style={styles.retryText}>Retry</Text>
              </TouchableOpacity>
            </View>
          ) : (data.length === 0 && contextProducts.length === 0) ? (
            <View style={styles.emptyContainer}>
              <Icon name="basket-outline" size={64} color="#D1D5DB" />
              <Text style={styles.emptyTitle}>No Products Found</Text>
              <Text style={styles.emptyText}>Check back later for new items</Text>
            </View>
          ) : (
            <FlatList
              data={data.length > 0 ? data : contextProducts}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={(item, index) => item._id || item.id || index.toString()}
              contentContainerStyle={styles.productList}
              renderItem={({ item }) => <ProductCard product={item} />}
            />
          )}
        </View>

        <PosterSection2 />

        {/* Latest Products Section */}
        <View style={styles.featuredSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Latest Products</Text>
            <TouchableOpacity onPress={() => navigation.navigate('SearchScreen')}>
              <Text style={styles.viewAllText}>View All →</Text>
            </TouchableOpacity>
          </View>
          <ProductGrid />
        </View>

        {/* Dummy Top Offers Data */}
        <View style={styles.featuredSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Flash Deals ⚡</Text>
            <TouchableOpacity onPress={() => navigation.navigate('SearchScreen')}>
              <Text style={styles.viewAllText}>View All →</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={(data.length > 0 ? data : contextProducts).slice(0, 4)}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => `deal-${item._id || item.id}`}
            renderItem={({ item }) => <ProductCard product={item} />}
            contentContainerStyle={{ paddingHorizontal: 10 }}
          />
        </View>

        {/* New Dummy Banner Section */}
        <DummyBannerSection />

        {/* Extra Dummy Content: Special Offers */}
        <View style={styles.featuredSection}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>Bundle & Save 🛒</Text>
              <Text style={styles.sectionSubtitle}>Perfect for families</Text>
            </View>
            <TouchableOpacity onPress={() => navigation.navigate('SearchScreen')}>
              <Text style={styles.viewAllText}>Explore →</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={(data.length > 0 ? data : contextProducts).slice(2, 6)}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => `bundle-${item._id || item.id}`}
            renderItem={({ item }) => <ProductCard product={item} />}
            contentContainerStyle={{ paddingHorizontal: 10 }}
          />
        </View>

        {/* Quick Actions - Modern Cards */}
        <View style={styles.quickActions}>
          <Text style={styles.sectionTitle}>Why Choose Us?</Text>
          <View style={styles.actionsGrid}>
            <View style={styles.actionCard}>
              <View style={styles.iconCircle}>
                <Icon name="flash" size={24} color="#16A34A" />
              </View>
              <Text style={styles.actionText}>Express Delivery</Text>
              <Text style={styles.actionSubtext}>15-30 mins</Text>
            </View>
            <View style={styles.actionCard}>
              <View style={styles.iconCircle}>
                <Icon name="shield-checkmark" size={24} color="#3B82F6" />
              </View>
              <Text style={styles.actionText}>Quality Assured</Text>
              <Text style={styles.actionSubtext}>100% Fresh</Text>
            </View>
            <View style={styles.actionCard}>
              <View style={styles.iconCircle}>
                <Icon name="pricetag" size={24} color="#F59E0B" />
              </View>
              <Text style={styles.actionText}>Best Prices</Text>
              <Text style={styles.actionSubtext}>Guaranteed</Text>
            </View>
            <View style={styles.actionCard}>
              <View style={styles.iconCircle}>
                <Icon name="heart" size={24} color="#EF4444" />
              </View>
              <Text style={styles.actionText}>Favorites</Text>
              <Text style={styles.actionSubtext}>Quick reorder</Text>
            </View>
          </View>
        </View>

 {/* Bottom Section */}
      <View style={styles.bottomSection}>
        <View style={styles.statsContainer}>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>10K+</Text>
            <Text style={styles.statLabel}>Happy Customers</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>500+</Text>
            <Text style={styles.statLabel}>Products</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>4.8★</Text>
            <Text style={styles.statLabel}>Rating</Text>
          </View>
        </View>

        <View style={styles.downloadBanner}>
          <View style={styles.downloadContent}>
            <Icon name="phone-portrait" size={40} color="#16A34A" />
            <View style={styles.downloadText}>
              <Text style={styles.downloadTitle}>Get Our App</Text>
              <Text style={styles.downloadSubtitle}>Shop faster with mobile app</Text>
            </View>
          </View>
          <Pressable style={styles.downloadButton}>
            <Text style={styles.downloadButtonText}>Download</Text>
          </Pressable>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>© 2026 Your Store. All rights reserved.</Text>
          <View style={styles.footerLinks}>
            <Text style={styles.footerLink}>Terms</Text>
            <Text style={styles.footerDot}>•</Text>
            <Text style={styles.footerLink}>Privacy</Text>
            <Text style={styles.footerDot}>•</Text>
            <Text style={styles.footerLink}>Help</Text>
          </View>
        </View>
      </View>
    

        {/* Bottom spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  headerGradient: {
    paddingHorizontal: 20,
    paddingVertical: 30,
    backgroundColor: '#16A34A',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 4,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: '#E5E7EB',
    fontWeight: '400',
  },
  posterContainer: {
    marginVertical: 16,
  },
  categoriesSection: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: '#fff',
    marginVertical: 8,
    borderRadius: 16,
    marginHorizontal: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  sectionSubtitle: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  viewAllText: {
    fontSize: 14,
    color: '#16A34A',
    fontWeight: '600',
  },
  featuredSection: {
    paddingHorizontal: 5,
    paddingVertical: 10,
    backgroundColor: '#fff',
    marginVertical: 8,
    borderRadius: 16,
    marginHorizontal: 16,
  },
  popularSection: {
    paddingVertical: 20,
    backgroundColor: '#fff',
    marginVertical: 8,
    borderRadius: 16,
    marginHorizontal: 16,
  },
  productList: {
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 18,
    color: '#374151',
    fontWeight: '600',
    marginTop: 16,
  },
  retryingSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 8,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  errorContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    flexDirection: 'row',
    backgroundColor: '#16A34A',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    gap: 8,
  },
  retryText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  quickActions: {
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 16,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#F9FAFB',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
    textAlign: 'center',
  },
  actionSubtext: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  bottomSection: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 24,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 8,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: '#16A34A',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  downloadBanner: {
    backgroundColor: '#F0FDF4',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#BBF7D0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  downloadContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  downloadText: {
    marginLeft: 12,
    flex: 1,
  },
  downloadTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 2,
  },
  downloadSubtitle: {
    fontSize: 12,
    color: '#6B7280',
  },
  downloadButton: {
    backgroundColor: '#16A34A',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  downloadButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  footer: {
    alignItems: 'center',
    paddingTop: 16,
  },
  footerText: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 8,
  },
  footerLinks: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  footerLink: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  footerDot: {
    fontSize: 12,
    color: '#D1D5DB',
    marginHorizontal: 8,
  },
});