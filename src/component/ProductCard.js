// src/component/ProductCard.js
import React, { useContext, useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { AppContext } from '../context/AppContext';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.42;
const BASE_URL = "https://grocery-backend-3pow.onrender.com";

export default function ProductCard({ product }) {
  const navigation = useNavigation();
  const { cart, addToCart, updateQuantity, removeFromCart } = useContext(AppContext);
  const [imageError, setImageError] = useState(false);

  // Normalize ID and image path
  const productId = product?._id || product?.id;
  const cartItem = cart.find(item => item.id === productId);
  const quantity = cartItem ? cartItem.quantity : 0;
  const isInCart = quantity > 0;

  const getImageUrl = () => {
    let url = "";
    if (Array.isArray(product.images) && product.images.length > 0) {
      url = product.images[0];
    } else {
      url = product.imageUrl || product.image;
    }

    if (typeof url !== 'string' || !url) return "https://via.placeholder.com/150";
    if (url.startsWith('http')) return url;
    return `${BASE_URL}${url.startsWith('/') ? '' : '/'}${url}`;
  };

  const imageUrl = getImageUrl();

  const handleAddToCart = () => {
    addToCart({
      ...product,
      id: productId,
      image: imageUrl,
      images: product.images || [imageUrl]
    });
  };

  const handleIncrease = () => {
    updateQuantity(productId, quantity + 1);
  };

  const handleDecrease = () => {
    if (quantity <= 1) {
      removeFromCart(productId);
    } else {
      updateQuantity(productId, quantity - 1);
    }
  };

  const goToDetails = () => {
    navigation.navigate('ProductDetailScreen', {
      product: {
        ...product,
        id: productId,
        image: imageUrl
      }
    });
  };

  // Calculate discount if available
  const originalPrice = product.originalPrice || (product.price * 1.2).toFixed(0); // Demo fallback
  const discount = Math.round(((originalPrice - product.price) / originalPrice) * 100);

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.9}
      onPress={goToDetails}
    >
      {/* Discount Badge */}
      {discount > 0 && (
        <View style={styles.discountBadge}>
          <Text style={styles.discountText}>{discount}% OFF</Text>
        </View>
      )}

      {/* Low Stock Badge */}
      {product.stock && product.stock < 10 && product.stock > 0 && (
        <View style={styles.stockBadge}>
          <Icon name="alert-circle" size={10} color="#fff" />
          <Text style={styles.stockText}>Only {product.stock} left!</Text>
        </View>
      )}

      {/* Product Image */}
      <View style={styles.imageContainer}>
        {!imageError ? (
          <Image
            source={{ uri: imageUrl }}
            style={styles.image}
            resizeMode="contain"
            onError={() => setImageError(true)}
          />
        ) : (
          <View style={styles.placeholderContainer}>
            <Icon name="image-outline" size={40} color="#CBD5E1" />
          </View>
        )}
      </View>

      {/* Product Info */}
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>{product.name || product.title}</Text>
        <Text style={styles.weight}>{product.weight || '500g'}</Text>

        <View style={styles.priceContainer}>
          <View>
            <Text style={styles.price}>₹{product.price}</Text>
            {originalPrice > product.price && (
              <Text style={styles.originalPrice}>₹{originalPrice}</Text>
            )}
          </View>

          {/* Action Button */}
          {!isInCart ? (
            <TouchableOpacity
              style={styles.addBtn}
              onPress={handleAddToCart}
              activeOpacity={0.8}
            >
              <Text style={styles.addBtnText}>ADD</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.quantityContainer}>
              <TouchableOpacity style={styles.qBtn} onPress={handleDecrease}>
                <Text style={styles.qBtnText}>-</Text>
              </TouchableOpacity>
              <Text style={styles.qText}>{quantity}</Text>
              <TouchableOpacity style={styles.qBtn} onPress={handleIncrease}>
                <Text style={styles.qBtnText}>+</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginVertical: 8,
    marginHorizontal: 4,
    width: CARD_WIDTH,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  discountBadge: {
    position: 'absolute',
    top: 0,
    left: 0,
    backgroundColor: '#2563EB',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderBottomRightRadius: 8,
    zIndex: 1,
  },
  discountText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },
  stockBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#F97316',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderBottomLeftRadius: 8,
    zIndex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  stockText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: '700',
    marginLeft: 2,
  },
  imageContainer: {
    height: CARD_WIDTH * 0.9,
    width: '100%',
    padding: 12,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholderContainer: {
    width: '100%',
    height: '100%',
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  name: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 2,
  },
  weight: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 8,
  },
  priceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  price: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  originalPrice: {
    fontSize: 12,
    color: '#94A3B8',
    textDecorationLine: 'line-through',
  },
  addBtn: {
    backgroundColor: '#fff',
    borderColor: '#16A34A',
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 5,
    borderRadius: 6,
  },
  addBtnText: {
    color: '#16A34A',
    fontWeight: '700',
    fontSize: 12,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#16A34A',
    borderRadius: 6,
    paddingHorizontal: 4,
  },
  qBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  qBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  qText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
    marginHorizontal: 4,
  },
});