import React, { useState, useContext, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  FlatList,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { AppContext } from '../context/AppContext';
const BASE_URL = "https://grocery-backend-3pow.onrender.com";
// 🧠 Android Emulator

const QuantitySelector = ({ quantity, setQuantity }) => {
  return (
    <View style={styles.quantityContainer}>
      <TouchableOpacity
        style={styles.quantityBtn}
        onPress={() => setQuantity(Math.max(1, quantity - 1))}
      >
        <Text style={styles.quantityBtnText}>-</Text>
      </TouchableOpacity>
      <Text style={styles.quantity}>{quantity}</Text>
      <TouchableOpacity
        style={styles.quantityBtn}
        onPress={() => setQuantity(quantity + 1)}
      >
        <Text style={styles.quantityBtnText}>+</Text>
      </TouchableOpacity>
    </View>
  );
};

const ProductDetailScreen = ({ route, navigation }) => {
  const { product } = route.params;
  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isInCart, setIsInCart] = useState(false);
  const { addToCart, updateQuantity, cart } = useContext(AppContext);

  // Check if product is already in cart
  useEffect(() => {
    const productId = product?._id || product?.id;
    if (!productId) return;

    const cartItem = cart.find(item => item.id === productId);
    if (cartItem) {
      setIsInCart(true);
      setQuantity(cartItem.quantity);
    } else {
      setIsInCart(false); // Reset if not found
    }
  }, [cart, product._id, product.id]);

  // Get images array, fallback to single image for backward compatibility
  const rawImages = (Array.isArray(product.images) && product.images.length > 0) ? product.images : [product.image];
  const images = rawImages.map(img => {
    if (typeof img !== 'string') return "";
    if (img.startsWith('http')) return img;
    return `${BASE_URL}${img.startsWith('/') ? '' : '/'}${img}`;
  }).filter(img => img !== "");

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="chevron-back" size={28} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Product Details</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.imageContainer}>
          <Image source={{ uri: images[selectedImageIndex] }} style={styles.image} />
          <View style={styles.priceBadge}>
            <Text style={styles.priceBadgeText}>₹{product.price}</Text>
          </View>
        </View>

        {/* Image Thumbnails */}
        {images.length > 1 && (
          <View style={styles.thumbnailsContainer}>
            <FlatList
              data={images}
              renderItem={({ item, index }) => (
                <TouchableOpacity
                  onPress={() => setSelectedImageIndex(index)}
                  style={[
                    styles.thumbnail,
                    selectedImageIndex === index && styles.selectedThumbnail
                  ]}
                >
                  <Image
                    source={{ uri: item }}
                    style={styles.thumbnailImage}
                    resizeMode="cover"
                  />
                </TouchableOpacity>
              )}
              keyExtractor={(item, index) => index.toString()}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.thumbnailsList}
            />
          </View>
        )}

        <View style={styles.detailsContainer}>
          <Text style={styles.name}>{product.name}</Text>
          <Text style={styles.price}>₹{product.price}/ea</Text>

          <View style={styles.ratingContainer}>
            <View style={styles.stars}>
              {[...Array(5)].map((_, i) => (
                <Icon
                  key={i}
                  name={i < Math.floor(product.rating || 4) ? "star" : "star-outline"}
                  size={16}
                  color="#FFD700"
                />
              ))}
            </View>
            <Text style={styles.ratingText}>{product.rating || 4.5} / 5</Text>
          </View>

          <View style={styles.quantitySection}>
            <Text style={styles.sectionTitle}>Quantity</Text>
            <QuantitySelector quantity={quantity} setQuantity={setQuantity} />
          </View>

          <TouchableOpacity style={styles.addButton} onPress={() => {
            // normalize `_id` to `id` and construct full image URI
            addToCart({
              ...product,
              id: product._id,
              image: images[0] // Use the first processed image string
            });
          }}>
            <Icon name="bag-add" size={20} color="#fff" />
            <Text style={styles.addButtonText}>Add to Cart</Text>
          </TouchableOpacity>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Product Description</Text>
            <Text style={styles.sectionText}>{product.description}</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Customer Reviews</Text>
            <View style={styles.reviewContainer}>
              <View style={styles.stars}>
                {[...Array(5)].map((_, i) => (
                  <Icon
                    key={i}
                    name={i < Math.floor(product.rating || 4) ? "star" : "star-outline"}
                    size={18}
                    color="#FFD700"
                  />
                ))}
              </View>
              <Text style={styles.reviewText}>{product.rating || 4.5} out of 5 stars</Text>
              <Text style={styles.reviewCount}>(Based on customer reviews)</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Delivery Information</Text>
            <View style={styles.deliveryInfo}>
              <Icon name="time-outline" size={20} color="#16A34A" />
              <Text style={styles.deliveryText}>Standard delivery in 15-30 minutes</Text>
            </View>
            <View style={styles.deliveryInfo}>
              <Icon name="shield-checkmark-outline" size={20} color="#16A34A" />
              <Text style={styles.deliveryText}>100% fresh and quality guaranteed</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F0FDF4' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  imageContainer: {
    position: 'relative',
  },
  image: {
    width: '100%',
    height: 300,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  priceBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: '#16A34A',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  priceBadgeText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  detailsContainer: {
    padding: 20,
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  price: {
    fontSize: 20,
    color: '#16A34A',
    fontWeight: '600',
    marginBottom: 12,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  stars: {
    flexDirection: 'row',
    marginRight: 8,
  },
  ratingText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  quantitySection: {
    marginBottom: 20,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  quantityBtn: {
    backgroundColor: '#16A34A',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityBtnText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  quantity: {
    fontSize: 18,
    marginHorizontal: 20,
    fontWeight: '600',
    color: '#111827',
    minWidth: 30,
    textAlign: 'center',
  },
  addButton: {
    backgroundColor: '#16A34A',
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
  cartControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#16A34A',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  section: {
    marginBottom: 24,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  sectionText: {
    color: '#374151',
    lineHeight: 24,
    fontSize: 15,
  },
  reviewContainer: {
    alignItems: 'center',
  },
  reviewText: {
    fontSize: 16,
    color: '#111827',
    fontWeight: '500',
    marginTop: 8,
  },
  reviewCount: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  deliveryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  deliveryText: {
    fontSize: 14,
    color: '#374151',
    marginLeft: 8,
    flex: 1,
  },
  thumbnailsContainer: {
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderColor: '#E5E7EB',
  },
  thumbnailsList: {
    paddingHorizontal: 4,
  },
  thumbnail: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginHorizontal: 4,
    borderWidth: 2,
    borderColor: 'transparent',
    overflow: 'hidden',
  },
  selectedThumbnail: {
    borderColor: '#16A34A',
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
});

export default ProductDetailScreen;
