import React, { createContext, useState, useEffect } from "react";
import AsyncStorage from '@react-native-async-storage/async-storage';

export const AppContext = createContext();

const BASE_URL = "https://grocery-backend-3pow.onrender.com";


export const AppProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [products, setProducts] = useState([]);
  const [authToken, setAuthToken] = useState(null);
  const [userId, setUserId] = useState(null);
  const [hasNewOrders, setHasNewOrders] = useState(false);

  // Load cart and products from backend when user logs in
  useEffect(() => {
    const loadDataFromBackend = async () => {
      try {
        const token = await AsyncStorage.getItem('authToken');
        const userData = await AsyncStorage.getItem('userData');

        if (token && userData) {
          const user = JSON.parse(userData);
          setAuthToken(token);
          setUserId(user.id);

          // Fetch user's saved cart from backend
          const cartRes = await fetch(`${BASE_URL}/api/cart/${user.id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const cartData = await cartRes.json();
          if (cartRes.ok && cartData.cart && cartData.cart.length > 0) {
            // First fetch products to merge with cart data
            const productsRes = await fetch(`${BASE_URL}/api/products`);
            const productsDataRaw = await productsRes.json(); // Fetch and parse once
            if (productsRes.ok) {
              // Use the already parsed productsDataRaw
              const productsData = Array.isArray(productsDataRaw) ? productsDataRaw : (productsDataRaw.products || productsDataRaw.data || []);

              // Merge cart data with product details
              const enrichedCart = cartData.cart.map(cartItem => {
                const product = productsData.find(p => (p._id || p.id) === cartItem.productId);
                if (product) {
                  return {
                    ...product,
                    id: product._id,
                    image: product.images && product.images[0] ? `${BASE_URL}${product.images[0]}` : null,
                    quantity: cartItem.quantity
                  };
                }
                return cartItem;
              }).filter(item => item.name); // Filter out items where product wasn't found

              console.log('Loaded enriched cart:', enrichedCart);
              setCart(enrichedCart);
            }
          }
        }

        // Fetch products (always available)
        console.log('Fetching products from:', `${BASE_URL}/api/products`);
        const productsRes = await fetch(`${BASE_URL}/api/products`);
        const productsData = await productsRes.json();
        console.log('Products response status:', productsRes.status);
        console.log('Products data:', productsData);
        if (productsRes.ok) {
          // Add full image URLs and id field for consistency
          const data = Array.isArray(productsData) ? productsData : (productsData.products || productsData.data || []);
          const productsWithImages = data.map(product => {
            const firstImage = Array.isArray(product.images) && product.images.length > 0
              ? product.images[0]
              : (product.imageUrl || product.image);

            return {
              ...product,
              id: product._id || product.id,
              image: firstImage
                ? (firstImage.startsWith('http') ? firstImage : `${BASE_URL}${firstImage.startsWith('/') ? '' : '/'}${firstImage}`)
                : null
            };
          });
          console.log('Setting products:', productsWithImages.length, 'products');
          setProducts(productsWithImages);
        } else {
          console.error('Failed to fetch products:', productsData);
        }
      } catch (err) {
        console.error("Error loading data from backend:", err);
      }
    };
    loadDataFromBackend();
  }, []);

  const addToCart = (product) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === product.id);
      const productWithImage = {
        ...product,
        image: product.image || (product.images && product.images[0] ? `https://grocery-backend-3pow.onrender.com${product.images[0]}` : null),
        id: product.id || product._id
      };

      const newCart = existingItem
        ? prevCart.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
        : [...prevCart, { ...productWithImage, quantity: 1 }];

      // Save to backend
      if (authToken && userId) {
        saveCartToBackend(newCart);
      }
      return newCart;
    });
  };

  const removeFromCart = (productId) => {
    console.log('removeFromCart called with productId:', productId);
    setCart((prevCart) => {
      console.log('Previous cart:', prevCart.map(item => ({ id: item.id, name: item.name })));
      const newCart = prevCart.filter((item) => item.id !== productId);
      console.log('New cart after removal:', newCart.map(item => ({ id: item.id, name: item.name })));
      if (authToken && userId) {
        saveCartToBackend(newCart);
      }
      return newCart;
    });
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
    } else {
      setCart((prevCart) => {
        const newCart = prevCart.map((item) =>
          item.id === productId ? { ...item, quantity } : item
        );
        if (authToken && userId) {
          saveCartToBackend(newCart);
        }
        return newCart;
      });
    }
  };

  const saveCartToBackend = async (cartData) => {
    try {
      if (!authToken || !userId) return;

      // Transform cart data to match backend schema (only productId and quantity)
      const backendCartData = cartData.map(item => ({
        productId: item.id || item._id,
        quantity: item.quantity
      }));

      console.log('Saving cart to backend:', backendCartData);

      const response = await fetch(`${BASE_URL}/api/cart/save`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ userId, cart: backendCartData }),
      });

      if (!response.ok) {
        const error = await response.json();
        console.error('Cart save failed:', error);
      } else {
        console.log('Cart saved successfully');
      }
    } catch (err) {
      console.error("Error saving cart to backend:", err);
    }
  };

  const clearCart = () => {
    setCart([]);
    if (authToken && userId) {
      saveCartToBackend([]);
    }
  };

  const getTotalPrice = () => {
    if (!cart || !Array.isArray(cart)) return 0;
    const total = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    return parseFloat(total.toFixed(2));
  };

  const markOrderAsNew = () => {
    setHasNewOrders(true);
  };

  const clearNewOrderIndicator = () => {
    setHasNewOrders(false);
  };

  return (
    <AppContext.Provider
      value={{
        cart,
        products,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getTotalPrice,
        hasNewOrders,
        markOrderAsNew,
        clearNewOrderIndicator,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
