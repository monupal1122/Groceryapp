import React, { useContext, useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import Icon from "react-native-vector-icons/Ionicons";
import CustomAlert from '../components/CustomAlert';
import { AppContext } from "../context/AppContext";
import { AuthContext } from "../context/AuthContext";

const CartScreen = () => {
  const navigation = useNavigation();
  const { cart, removeFromCart, updateQuantity, getTotalPrice } = useContext(AppContext);
  const { user } = useContext(AuthContext);
  const [alertConfig, setAlertConfig] = useState({
    visible: false,
    title: '',
    message: '',
    type: 'info',
    onConfirm: null,
    onCancel: null
  });

  const deliveryFee = 3.99;

  const showAlert = (title, message, type = 'info', onConfirm = null, onCancel = null) => {
    setAlertConfig({
      visible: true,
      title,
      message,
      type,
      onConfirm,
      onCancel
    });
  };

  const hideAlert = () => {
    setAlertConfig(prev => ({ ...prev, visible: false }));
  };

  const handleRemoveItem = (item) => {
    console.log('🗑️ Remove item clicked:', item.name, 'ID:', item.id);
    console.log('✅ Directly removing item from cart');
    removeFromCart(item.id);
    console.log('🎉 Item removal completed');
  };

  const handleCheckout = () => {
    // Check if user is guest or not logged in
    if (!user || user.id === 'guest') {
      navigation.navigate("LoginReauth", { fromCheckout: true });
      return;
    }

    // Real user is logged in, proceed to address selection
    navigation.navigate("Address");
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Shopping Cart</Text>

      {cart.length === 0 ? (
        <View style={styles.emptyCart}>
          <Icon name="cart-outline" size={80} color="#D1D5DB" />
          <Text style={styles.emptyText}>Your cart is empty</Text>
          <TouchableOpacity
            style={styles.continueShoppingBtn}
            onPress={() => navigation.navigate("Home")}
          >
            <Text style={styles.continueShoppingText}>Continue Shopping</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <ScrollView showsVerticalScrollIndicator={false}>
            {cart.map((item) => (
              <View key={item.id} style={styles.card}>
                <TouchableOpacity onPress={() => navigation.navigate('ProductDetailScreen', { product: item })}>
                  <Image source={{ uri: item.images[0] }} style={styles.image} />
                </TouchableOpacity>
                <View style={styles.details}>
                  <Text style={styles.name}>{item.name}</Text>
                  <Text style={styles.price}>
                    Rs{item.price}
                    <Text style={styles.unit}>{item.unit}</Text>
                  </Text>
                  <Text style={styles.weight}>{item.weight}</Text>
                  <View style={styles.quantityContainer}>
                    <TouchableOpacity onPress={() => updateQuantity(item.id, item.quantity - 1)}>
                      <Icon name="remove-circle-outline" size={24} color="#16A34A" />
                    </TouchableOpacity>
                    <Text style={styles.quantity}>{item.quantity}</Text>
                    <TouchableOpacity onPress={() => updateQuantity(item.id, item.quantity + 1)}>
                      <Icon name="add-circle-outline" size={24} color="#16A34A" />
                    </TouchableOpacity>
                  </View>
                </View>
                <TouchableOpacity onPress={() => handleRemoveItem(item)}>
                  <Icon name="trash-outline" size={24} color="#EF4444" />
                </TouchableOpacity>
              </View>
            ))}

            {/* Bill Summary */}
            <View style={styles.billBox}>
              <View style={styles.billRow}>
                <Text style={styles.billText}>Subtotal:</Text>
                <Text style={styles.billText}>₹{getTotalPrice().toFixed(2)}</Text>
              </View>
              <View style={styles.billRow}>
                <Text style={styles.billText}>Delivery Fee:</Text>
                <Text style={styles.billText}>₹{deliveryFee.toFixed(2)}</Text>
              </View>
              <View style={styles.billRowTotal}>
                <Text style={styles.totalText}>Total:</Text>
                <Text style={styles.totalText}>
                  ₹{(getTotalPrice() + deliveryFee).toFixed(2)}
                </Text>
              </View>
            </View>

            {/* Proceed Button */}
            <TouchableOpacity
              style={styles.checkoutButton}
              onPress={handleCheckout}
            >
              <Text style={styles.checkoutText}>Proceed to Checkout</Text>
            </TouchableOpacity>
          </ScrollView>
        </>
      )}
    </SafeAreaView>
  );
};

export default CartScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F0FDF4",
    paddingHorizontal: 15,
  },
  header: {
    fontSize: 22,
    fontWeight: "700",
    marginVertical: 15,
    textAlign: "center",
    color: "#111827",
  },
  emptyCart: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#6B7280",
    marginTop: 16,
  },
  continueShoppingBtn: {
    backgroundColor: "#16A34A",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 12,
    marginTop: 20,
  },
  continueShoppingText: {
    color: "#fff",
    textAlign: "center",
    fontSize: 16,
    fontWeight: "600",
  },
  card: {
    flexDirection: "row",
    backgroundColor: "#FEFFFE",
    borderRadius: 12,
    padding: 10,
    marginBottom: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#D1FAE5',
  },
  image: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  details: {
    flex: 1,
    marginLeft: 10,
  },
  name: {
    color: "#111827",
  },
  price: {
    color: "#16A34A",
    fontWeight: "500",
    marginTop: 3,
  },
  unit: {
    fontSize: 13,
    color: "#6B7280",
  },
  weight: {
    fontSize: 14,
    color: "#6B7280",
  },
  delete: {
    fontSize: 18,
    color: "#EF4444",
  },
  quantityContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 5,
  },
  quantity: {
    fontSize: 16,
    fontWeight: "600",
    marginHorizontal: 10,
    color: "#111827",
  },
  billBox: {
    backgroundColor: "#FEFFFE",
    borderRadius: 12,
    padding: 15,
    marginVertical: 15,
    borderWidth: 1,
    borderColor: '#D1FAE5',
  },
  billRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5,
  },
  billRowTotal: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
    borderTopWidth: 1,
    borderColor: "#E5E7EB",
    paddingTop: 8,
  },
  billText: {
    fontSize: 15,
    color: "#374151",
  },
  totalText: {
    fontSize: 17,
    fontWeight: "700",
    color: "#111827",
  },
  checkoutButton: {
    backgroundColor: "#16A34A",
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 25,
  },
  checkoutText: {
    color: "#fff",
    textAlign: "center",
    fontSize: 16,
    fontWeight: "600",
  },
});
