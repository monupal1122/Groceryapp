import React, { useEffect, useRef, useState, useContext } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Image,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
  Animated,
  Alert,
} from "react-native";
import axios from "axios";
import { useRoute } from '@react-navigation/native';
import { AppContext } from "../context/AppContext";

const { width, height } = Dimensions.get("window");
const BASE_URL = "https://grocery-backend-3pow.onrender.com";


const ProductPage = ({ navigation }) => {
  // Get context
  const { cart, addToCart, updateQuantity, removeFromCart } = useContext(AppContext);

  // Get route params
  const route = useRoute();
  const { categoryId } = route.params || {};

  // State
  const [subcategories, setSubcategories] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  console.log("🚀 ProductPage products:", products);
  // Refs
  const productListRef = useRef(null);
  const categoryListRef = useRef(null);
  const scrollY = useRef(0);
  const isLoadingMore = useRef(false);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
  const categoryHighlightAnim = useRef(new Animated.Value(0)).current;

  // ---------------------------------------------
  // GET PRODUCT QUANTITY FROM CART
  // ---------------------------------------------
  const getProductQuantity = (productId) => {
    const cartItem = cart.find(item => item.id === productId || item._id === productId);
    return cartItem ? cartItem.quantity : 0;
  };

  // ---------------------------------------------
  // LOAD SUBCATEGORIES ON MOUNT
  // ---------------------------------------------
  useEffect(() => {
    if (categoryId) {
      console.log("🔄 Loading subcategories for categoryId:", categoryId);
      loadSubcategories(categoryId);
    } else {
      console.error("❌ No categoryId provided");
      setError("No category ID provided");
      Alert.alert("Error", "Category ID is missing. Please select a category.");
    }
  }, [categoryId]);

  // ---------------------------------------------
  // LOAD SUBCATEGORIES FROM API
  // ---------------------------------------------
  const loadSubcategories = async (categoryId) => {
    try {
      if (!categoryId) {
        console.log("❌ No categoryId found.");
        setError("No category ID provided");
        return;
      }

      setLoading(true);
      setError(null);

      console.log(`📡 Fetching: ${BASE_URL}/api/subcategories/category/${categoryId}`);

      const res = await axios.get(
        `${BASE_URL}/api/subcategories/category/${categoryId}`,
        {
          timeout: 10000,
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );

      const data = res.data;
      console.log("✅ Subcategories loaded:", data.length);

      setSubcategories(data);

      // Load products of first subcategory
      if (data && data.length > 0) {
        console.log("📦 Loading products for first subcategory:", data[0].name);
        loadProducts(data[0]._id);
      } else {
        console.log("⚠️ No subcategories found for this category.");
        setError("No subcategories available");
        Alert.alert("Notice", "No subcategories found for this category.");
      }

    } catch (err) {
      console.error("❌ Subcategory Error:", err.message);
      console.error("Error details:", err.response?.data || err);

      let errorMessage = "Failed to load subcategories";

      if (err.message === "Network Error") {
        errorMessage = "Network error. Please check your connection and API server.";
      } else if (err.code === "ECONNABORTED") {
        errorMessage = "Request timeout. Server is taking too long to respond.";
      } else if (err.response) {
        errorMessage = `Server error: ${err.response.status} - ${err.response.data?.message || err.message}`;
      }

      setError(errorMessage);
      Alert.alert("Error", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // ---------------------------------------------
  // BUILD IMAGE URL
  // ---------------------------------------------
  const buildImageUrl = (imgPath) => {
    if (!imgPath) return null;
    if (imgPath.startsWith("http")) return imgPath;
    return imgPath.startsWith("/") ? `${BASE_URL}${imgPath}` : `${BASE_URL}/${imgPath}`;
  };

  // ---------------------------------------------
  // LOAD PRODUCTS WITH ANIMATION
  // ---------------------------------------------
  const loadProducts = async (subcategoryId, direction = 'none') => {
    if (isLoadingMore.current) return;

    isLoadingMore.current = true;
    setIsTransitioning(true);

    try {
      // Start fade out animation
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0.3,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: direction === 'down' ? -50 : direction === 'up' ? 50 : 0,
          duration: 200,
          useNativeDriver: true,
        })
      ]).start();

      const url = `${BASE_URL}/api/products/subcategory/${subcategoryId}`;
      console.log(`📡 Fetching products: ${url}`);

      const res = await axios.get(url, {
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json',
        }
      });

      console.log("✅ Products loaded:", res.data.length);

      // Small delay for smooth transition
      await new Promise(resolve => setTimeout(resolve, 150));

      setProducts(res.data);

      // Reset scroll position based on direction
      if (direction === 'down') {
        productListRef.current?.scrollToOffset({
          offset: 0,
          animated: false,
        });
        scrollY.current = 0;
      } else if (direction === 'up') {
        // Set scroll position to allow scrolling up to trigger previous
        productListRef.current?.scrollToOffset({
          offset: 50,
          animated: false,
        });
        scrollY.current = 50;
      }

      // Fade in animation
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        })
      ]).start();

      if (res.data.length === 0) {
        console.log("⚠️ No products found for this subcategory");
      }

    } catch (err) {
      console.error("❌ Product Error:", err.message);
      console.error("Error details:", err.response?.data || err);

      let errorMessage = "Failed to load products";

      if (err.message === "Network Error") {
        errorMessage = "Network error. Please check your connection.";
      } else if (err.code === "ECONNABORTED") {
        errorMessage = "Request timeout.";
      } else if (err.response) {
        errorMessage = `Server error: ${err.response.status}`;
      }

      setError(errorMessage);
      setProducts([]);

      // Still fade in to show empty state
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();

    } finally {
      setIsTransitioning(false);
      isLoadingMore.current = false;
    }
  };

  // ---------------------------------------------
  // ANIMATE CATEGORY HIGHLIGHT
  // ---------------------------------------------
  const animateCategoryHighlight = () => {
    categoryHighlightAnim.setValue(0);
    Animated.sequence([
      Animated.timing(categoryHighlightAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(categoryHighlightAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      })
    ]).start();
  };

  // ---------------------------------------------
  // AUTO-LOAD PRODUCTS WHEN ACTIVE INDEX CHANGES
  // ---------------------------------------------
  useEffect(() => {
    if (subcategories.length > 0 && subcategories[activeIndex]) {
      console.log(`🔄 Switching to subcategory: ${subcategories[activeIndex].name}`);
      scrollCategoryToActive();
      animateCategoryHighlight();
    }
  }, [activeIndex]);

  // ---------------------------------------------
  // SCROLL LEFT LIST TO ACTIVE CATEGORY
  // ---------------------------------------------
  const scrollCategoryToActive = () => {
    if (categoryListRef.current && subcategories.length > 0) {
      categoryListRef.current?.scrollToIndex({
        index: activeIndex,
        animated: true,
        viewPosition: 0.4,
      });
    }
  };

  // ---------------------------------------------
  // CLICK CATEGORY (LEFT)
  // ---------------------------------------------
  const onCategoryPress = (index) => {
    if (isLoadingMore.current || isTransitioning) return;

    console.log(`👆 Category clicked: ${subcategories[index].name}`);

    const direction = index > activeIndex ? 'down' : 'up';
    setActiveIndex(index);
    loadProducts(subcategories[index]._id, direction);
  };

  // ---------------------------------------------
  // ADVANCED SCROLL LOGIC WITH THRESHOLD
  // ---------------------------------------------
  const onProductScroll = (e) => {
    if (isLoadingMore.current || isTransitioning) return;

    const currentScrollY = e.nativeEvent.contentOffset.y;
    const contentHeight = e.nativeEvent.contentSize.height;
    const layoutHeight = e.nativeEvent.layoutMeasurement.height;

    const scrollDiff = currentScrollY - scrollY.current;
    const isScrollingDown = scrollDiff > 0;
    const isScrollingUp = scrollDiff < 0;

    // SCROLL DOWN NEAR BOTTOM → LOAD NEXT SUBCATEGORY
    if (isScrollingDown) {
      const distanceFromBottom = contentHeight - (currentScrollY + layoutHeight);

      // Trigger when near the bottom (within 100 pixels)
      if (distanceFromBottom <= 100 && activeIndex < subcategories.length - 1) {
        console.log("⬇️ Near bottom, loading next subcategory");
        const nextIndex = activeIndex + 1;
        setActiveIndex(nextIndex);
        loadProducts(subcategories[nextIndex]._id, 'down');
        return; // Prevent updating scrollY to avoid immediate re-trigger
      }
    }
    // SCROLL UP NEAR TOP → LOAD PREVIOUS SUBCATEGORY
    else if (isScrollingUp) {
      // Trigger when scrolling up from initial position (50) to near top (within 10 pixels from top)
      if (currentScrollY <= 10 && activeIndex > 0) {
        console.log("⬆️ Near top, loading previous subcategory");
        const prevIndex = activeIndex - 1;
        setActiveIndex(prevIndex);
        loadProducts(subcategories[prevIndex]._id, 'up');
        return; // Prevent updating scrollY to avoid immediate re-trigger
      }
    }

    // Update scroll position
    scrollY.current = currentScrollY;
  };

  // ---------------------------------------------
  // HANDLE ADD TO CART (First Time)
  // ---------------------------------------------
  const handleAddToCart = (product) => {
    const img = (product.images?.length > 0 && buildImageUrl(product.images[0])) || buildImageUrl(product.image);

    addToCart({
      ...product,
      id: product._id,
      image: img,
      images: product.images || [img]
    });

    console.log("✅ Added to cart:", product.name);
  };

  // ---------------------------------------------
  // HANDLE INCREASE QUANTITY
  // ---------------------------------------------
  const handleIncreaseQuantity = (product) => {
    const currentQty = getProductQuantity(product._id);
    updateQuantity(product._id, currentQty + 1);
    console.log("⬆️ Increased quantity:", product.name);
  };

  // ---------------------------------------------
  // HANDLE DECREASE QUANTITY
  // ---------------------------------------------
  const handleDecreaseQuantity = (product) => {
    const currentQty = getProductQuantity(product._id);

    if (currentQty <= 1) {
      // Remove from cart if quantity becomes 0
      removeFromCart(product._id);
      console.log("🗑️ Removed from cart:", product.name);
    } else {
      updateQuantity(product._id, currentQty - 1);
      console.log("⬇️ Decreased quantity:", product.name);
    }
  };

  // ---------------------------------------------
  // NAVIGATE TO PRODUCT DETAIL
  // ---------------------------------------------
  const navigateToDetail = (product) => {
    const img = (product.images?.length > 0 && buildImageUrl(product.images[0])) || buildImageUrl(product.image);

    navigation.navigate("ProductDetailScreen", {
      product: {
        ...product,
        image: img
      }
    });
  };

  // ---------------------------------------------
  // RENDER SUBCATEGORY ITEM (LEFT LIST)
  // ---------------------------------------------
  const renderSubcategory = ({ item, index }) => {
    const active = index === activeIndex;

    const highlightScale = categoryHighlightAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [1, active ? 1.05 : 1],
    });

    return (
      <TouchableOpacity
        onPress={() => onCategoryPress(index)}
        style={[styles.subItem, active && styles.subItemActive]}
        activeOpacity={0.7}
        disabled={isTransitioning}
      >
        <Animated.View style={{ transform: [{ scale: active ? highlightScale : 1 }] }}>
          <Image
            source={{ uri: buildImageUrl(item.image) }}
            style={[
              styles.subImage,
              active && { borderColor: "#16A34A", borderWidth: 2 },
            ]}
            resizeMode="cover"
          />
        </Animated.View>

        <Text
          style={[styles.subText, active && styles.subTextActive]}
          numberOfLines={2}
        >
          {item.name}
        </Text>

        {/* Active indicator dot */}
        {active && <View style={styles.activeDot} />}
      </TouchableOpacity>
    );
  };

  // ---------------------------------------------
  // RENDER PRODUCT CARD (RIGHT LIST)
  // ---------------------------------------------
  const renderProduct = ({ item, index }) => {
    const img = (item.images?.length > 0 && buildImageUrl(item.images[0])) || buildImageUrl(item.image);
    const quantity = getProductQuantity(item._id);
    const inCart = quantity > 0;

    return (
      <View style={[styles.card, index % 2 === 0 ? styles.cardLeft : styles.cardRight]}>
        <TouchableOpacity
          onPress={() => navigateToDetail(item)}
          activeOpacity={0.9}
        >
          {img ? (
            <Image
              source={{ uri: img }}
              style={styles.cardImage}
              resizeMode="cover"
            />
          ) : (
            <View style={[styles.cardImage, styles.noImageContainer]}>
              <Text style={styles.noImageText}>No Image</Text>
            </View>
          )}

          <Text style={styles.cardName} numberOfLines={2}>
            {item.name}
          </Text>

          {item.desc && (
            <Text style={styles.cardDesc} numberOfLines={1}>
              {item.desc}
            </Text>
          )}

          <Text style={styles.cardPrice}>₹{item.price}</Text>
        </TouchableOpacity>

        {/* ADD BUTTON OR QUANTITY CONTROL */}
        {!inCart ? (
          // Show ADD button when not in cart
          <TouchableOpacity
            style={styles.addBtn}
            activeOpacity={0.8}
            onPress={() => handleAddToCart(item)}
          >
            <Text style={styles.addBtnText}>ADD</Text>
          </TouchableOpacity>
        ) : (
          // Show quantity controls when in cart
          <View style={styles.quantityContainer}>
            <TouchableOpacity
              style={styles.quantityBtn}
              activeOpacity={0.7}
              onPress={() => handleDecreaseQuantity(item)}
            >
              <Text style={styles.quantityBtnText}>−</Text>
            </TouchableOpacity>

            <View style={styles.quantityDisplay}>
              <Text style={styles.quantityText}>{quantity}</Text>
            </View>

            <TouchableOpacity
              style={styles.quantityBtn}
              activeOpacity={0.7}
              onPress={() => handleIncreaseQuantity(item)}
            >
              <Text style={styles.quantityBtnText}>+</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  // ---------------------------------------------
  // RENDER EMPTY STATE
  // ---------------------------------------------
  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>
        {error || "No products available"}
      </Text>
    </View>
  );

  // ---------------------------------------------
  // RENDER LOADING OVERLAY
  // ---------------------------------------------
  const renderLoadingOverlay = () => {
    if (!isTransitioning) return null;

    return (
      <View style={styles.loadingOverlay}>
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color="#16A34A" />
          <Text style={styles.loadingOverlayText}>Loading products...</Text>
        </View>
      </View>
    );
  };

  // ---------------------------------------------
  // MAIN RENDER
  // ---------------------------------------------
  return (
    <View style={styles.container}>
      {/* LEFT SUBCATEGORY LIST */}
      <View style={styles.left}>
        {subcategories.length > 0 ? (
          <>
            <View style={styles.sidebarHeader}>
              <Text style={styles.sidebarHeaderText}>Subcategories</Text>
            </View>
            <FlatList
              ref={categoryListRef}
              data={subcategories}
              keyExtractor={(item) => item._id}
              renderItem={renderSubcategory}
              showsVerticalScrollIndicator={false}
              onScrollToIndexFailed={(info) => {
                console.log("Scroll failed:", info);
                setTimeout(() => {
                  categoryListRef.current?.scrollToIndex({
                    index: info.index,
                    animated: true,
                  });
                }, 100);
              }}
            />
          </>
        ) : (
          <View style={styles.emptyContainer}>
            {loading ? (
              <ActivityIndicator size="small" color="#16A34A" />
            ) : (
              <Text style={styles.emptyText}>No categories</Text>
            )}
          </View>
        )}
      </View>

      {/* RIGHT PRODUCT LIST */}
      <View style={styles.right}>
        {/* Product Header */}
        <View style={styles.productsHeader}>
          <Text style={styles.productsTitle}>
            {subcategories[activeIndex]?.name || "Products"}
          </Text>
          {isTransitioning && (
            <View style={styles.headerLoadingContainer}>
              <ActivityIndicator size="small" color="#16A34A" />
              <Text style={styles.headerLoadingText}>Loading...</Text>
            </View>
          )}
        </View>

        {loading && !isTransitioning ? (
          <View style={styles.loader}>
            <ActivityIndicator size="large" color="#16A34A" />
            <Text style={styles.loadingText}>Loading products...</Text>
          </View>
        ) : (
          <Animated.View
            style={[
              styles.productContainer,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }]
              }
            ]}
          >
            <FlatList
              ref={productListRef}
              data={products}
              keyExtractor={(item) => item._id}
              renderItem={renderProduct}
              numColumns={2}
              onScroll={onProductScroll}
              scrollEventThrottle={16}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 80 }}
              ListEmptyComponent={renderEmptyState}
              extraData={cart}
            />
          </Animated.View>
        )}

        {/* Loading Overlay for Transitions */}
        {renderLoadingOverlay()}
      </View>

      {/* Scroll Hints */}
      {!loading && products.length > 0 && (
        <>
          {activeIndex < subcategories.length - 1 && (
            <View style={[styles.scrollHint, styles.scrollHintBottom]}>
              <Text style={styles.scrollHintText}>↓ Scroll down for more</Text>
            </View>
          )}
          {activeIndex > 0 && (
            <View style={[styles.scrollHint, styles.scrollHintTop]}>
              <Text style={styles.scrollHintText}>↑ Scroll up for previous</Text>
            </View>
          )}
        </>
      )}
    </View>
  );
};

export default ProductPage;

// ---------------------------------------------
// STYLES
// ---------------------------------------------
const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "#F8F8F8"
  },

  left: {
    width: 100,
    backgroundColor: "#fff",
    borderRightWidth: 1,
    borderRightColor: "#E5E7EB",
  },

  sidebarHeader: {
    backgroundColor: "#16A34A",
    padding: 10,
    alignItems: "center",
  },
  sidebarHeaderText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
  },

  subItem: {
    alignItems: "center",
    paddingVertical: 14,
    position: 'relative',
  },
  subItemActive: {
    backgroundColor: "#d1fae5",
  },
  subImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginBottom: 6,
    backgroundColor: "#EEE",
  },
  subText: {
    fontSize: 12,
    textAlign: "center",
    color: "#333",
    paddingHorizontal: 4,
    fontWeight: "500",
  },
  subTextActive: {
    color: "#16A34A",
    fontWeight: "700",
  },
  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#16A34A",
    marginTop: 4,
  },

  right: {
    flex: 1,
    position: 'relative',
  },

  productsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderColor: "#E5E7EB",
  },
  productsTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111827",
  },
  headerLoadingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerLoadingText: {
    marginLeft: 8,
    fontSize: 14,
    color: "#6B7280",
  },

  productContainer: {
    flex: 1,
    padding: 10,
  },

  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: "#666",
  },

  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(248, 248, 248, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  loadingBox: {
    backgroundColor: '#fff',
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  loadingOverlayText: {
    marginTop: 12,
    fontSize: 15,
    color: "#333",
    fontWeight: "600",
  },

  card: {
    backgroundColor: "#fafafa",
    borderRadius: 10,
    padding: 10,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#E6E6E6",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardLeft: {
    marginRight: 6,
    width: (width - 140) / 2
  },
  cardRight: {
    marginLeft: 6,
    width: (width - 140) / 2
  },

  cardImage: {
    width: "100%",
    height: 120,
    borderRadius: 10,
    backgroundColor: "#F5F5F5",
  },
  noImageContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  noImageText: {
    color: "#888",
    fontSize: 12,
  },

  cardName: {
    fontSize: 13,
    fontWeight: "600",
    minHeight: 34,
    marginTop: 6,
    color: "#333",
  },

  cardDesc: {
    fontSize: 11,
    color: "#666",
    marginTop: 2,
  },

  cardPrice: {
    fontSize: 16,
    color: "#16A34A",
    fontWeight: "700",
    marginTop: 4
  },

  // ADD BUTTON (Not in cart)
  addBtn: {
    marginTop: 8,
    borderWidth: 1.4,
    borderColor: "#16A34A",
    borderRadius: 8,
    paddingVertical: 6,
    alignItems: "center",
    backgroundColor: "#fff",
  },
  addBtnText: {
    fontSize: 12,
    color: "#16A34A",
    fontWeight: "700"
  },

  // QUANTITY CONTROLS (In cart)
  quantityContainer: {
    marginTop: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#16A34A",
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 6,
  },
  quantityBtn: {
    width: 28,
    height: 28,
    borderRadius: 6,
    backgroundColor: "#15803D",
    alignItems: "center",
    justifyContent: "center",
  },
  quantityBtnText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
    lineHeight: 20,
  },
  quantityDisplay: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  quantityText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },

  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyText: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
  },

  scrollHint: {
    position: 'absolute',
    right: 120,
    backgroundColor: 'rgba(22, 163, 74, 0.9)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    zIndex: 100,
  },
  scrollHintTop: {
    top: 70,
  },
  scrollHintBottom: {
    bottom: 20,
  },
  scrollHintText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },
});