import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { SafeAreaView as SafeAreaViewContext } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import RazorpayCheckout from 'react-native-razorpay';
import CustomAlert from '../components/CustomAlert';
import { AppContext } from '../context/AppContext';
import { AuthContext } from '../context/AuthContext';
import { useNavigation } from '@react-navigation/native';

const BASE_URL = 'https://grocery-backend-3pow.onrender.com';

export default function PaymentScreen({ navigation, route }) {
  const { selectedAddress } = route.params || {};
  const [loading, setLoading] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);
  const [alertConfig, setAlertConfig] = useState({
    visible: false,
    title: '',
    message: '',
    type: 'info',
    onConfirm: null,
  });
  const { cart, getTotalPrice, clearCart, markOrderAsNew } = useContext(AppContext);
  const { authToken } = useContext(AuthContext);

  const showAlert = (title, message, type = 'info', onConfirm = null) => {
    setAlertConfig({
      visible: true,
      title,
      message,
      type,
      onConfirm,
    });
  };

  const hideAlert = () => {
    setAlertConfig(prev => ({ ...prev, visible: false }));
  };

  const deliveryFee = 3.99;
  const subtotal = parseFloat(getTotalPrice().toFixed(2));
  const total = parseFloat((subtotal + deliveryFee).toFixed(2));

  const paymentMethods = [
    {
      id: 'cash_on_delivery',
      title: 'Cash on Delivery',
      subtitle: 'Pay when you receive your order',
      icon: 'cash-outline'
    },
    {
      id: 'online',
      title: 'Online Payment',
      subtitle: 'Pay securely with Razorpay',
      icon: 'card-outline'
    },
  ];

  const handleCashOnDelivery = async () => {
    console.log('Cash on Delivery button pressed');
    console.log('Selected address:', selectedAddress);
    console.log('Cart:', cart);
    console.log('Auth token:', authToken);

    setLoading(true);
    try {
      // Create order with cash on delivery
      const orderData = {
        addressId: selectedAddress._id,
        items: cart.map(item => ({
          productId: item.id || item._id,
          quantity: item.quantity,
          price: item.price,
        })),
        totalAmount: total,
        paymentMethod: 'cash_on_delivery',
      };

      console.log('Order data:', orderData);

      const res = await fetch(`${BASE_URL}/api/order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify(orderData),
      });

      console.log('Response status:', res.status);
      
      // Parse response safely
      let data;
      try {
        const text = await res.text();
        data = text ? JSON.parse(text) : {};
        console.log('Response data:', data);
      } catch (parseError) {
        console.error('JSON parse error:', parseError);
        data = { message: 'Invalid response from server' };
      }

      if (res.ok && res.status >= 200 && res.status < 300) {
        // Get order ID safely
        const orderId = data.order?._id || data._id || data.orderId || 'placed';
        const orderIdShort = typeof orderId === 'string' && orderId.length >= 6 
          ? orderId.slice(-6) 
          : 'placed';
        
        // Clear the cart after successful order
        clearCart();
        // Mark that there's a new order
        markOrderAsNew();
        
        setLoading(false);
        
        // Show success alert for cash on delivery
        setTimeout(() => {
          showAlert(
            '🎉 Order Placed Successfully!',
            `Your order #${orderIdShort} has been placed successfully! You'll pay ₹${total.toFixed(2)} when your order arrives.`,
            'success',
            () => {
              hideAlert();
              navigation.reset({
                index: 0,
                routes: [{ name: 'Home' }],
              });
            }
          );
        }, 100);
      } else {
        setLoading(false);
        const errorMsg = data.message || data.error || `Server error (${res.status}). Please try again.`;
        console.error('Order failed:', errorMsg);
        
        // Check if it's an email configuration error
        const isEmailError = errorMsg.includes('sendOrderConfirmationEmail') || 
                            errorMsg.includes('is not defined');
        
        setTimeout(() => {
          showAlert(
            'Order Failed',
            isEmailError 
              ? 'Order creation failed due to backend email configuration issue. Please contact support or try again later.'
              : errorMsg,
            'error'
          );
        }, 100);
      }
    } catch (err) {
      console.error('Order error:', err);
      setLoading(false);
      setTimeout(() => {
        showAlert(
          'Order Failed',
          err.message || 'Failed to place order. Please check your connection and try again.',
          'error'
        );
      }, 100);
    }
  };

  const handleOnlinePayment = async () => {
    console.log('Online Payment button pressed');
    console.log('Total amount:', total);

    setLoading(true);
    try {
      // 1️⃣ Create order from your backend
      const res = await fetch(`${BASE_URL}/api/payment/order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ amount: total }),
      });

      const order = await res.json();
      console.log('Order from backend:', order);

      if (order.error) {
        throw new Error(order.error);
      }

      // 2️⃣ Razorpay Checkout options
      const options = {
        description: 'Blinkit Order Payment',
        image: 'https://cdn.jsdelivr.net/npm/razorpay@2.0.0/dist/razorpay-logo.png',
        currency: 'INR',
        key: 'rzp_test_Rdc6BMsOO1d57G', // same as backend key_id
        amount: order.amount,
        name: 'Blinkit',
        order_id: order.id, // from backend response
        prefill: {
          email: 'user@example.com',
          contact: '9999999999',
          name: 'User Name'
        },
        theme: { color: '#16A34A' }
      };

      console.log('Opening Razorpay with options:', options);

      const data = await RazorpayCheckout.open(options);
      console.log('Razorpay success:', data);
      // Payment success - create order and show success screen
      await handlePaymentSuccess(data);
    } catch (error) {
      console.log('Razorpay error:', error);
      setLoading(false);
      // Payment failed - use setTimeout to ensure alert shows properly
      setTimeout(() => {
        showAlert(
          'Payment Failed',
          error.description || 'Payment was cancelled',
          'error'
        );
      }, 100);
    }
  };

  const handlePaymentSuccess = async (paymentData) => {
    try {
      // Create order with online payment
      const orderData = {
        addressId: selectedAddress._id,
        items: cart.map(item => ({
          productId: item.id || item._id,
          quantity: item.quantity,
          price: item.price,
        })),
        totalAmount: total,
        paymentMethod: 'online',
        paymentId: paymentData.razorpay_payment_id,
      };

      const res = await fetch(`${BASE_URL}/api/order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify(orderData),
      });

      console.log('Order creation response status:', res.status);
      
      // Parse response safely
      let data;
      try {
        const text = await res.text();
        data = text ? JSON.parse(text) : {};
        console.log('Order creation response data:', data);
      } catch (parseError) {
        console.error('JSON parse error:', parseError);
        data = { message: 'Invalid response from server' };
      }

      if (res.ok && res.status >= 200 && res.status < 300) {
        // Get order ID safely
        const orderId = data.order?._id || data._id || data.orderId || 'placed';
        const orderIdShort = typeof orderId === 'string' && orderId.length >= 6 
          ? orderId.slice(-6) 
          : 'placed';
        
        // Clear the cart after successful order
        clearCart();
        // Mark that there's a new order
        markOrderAsNew();
        
        setLoading(false);
        
        // Show success alert for online payment
        setTimeout(() => {
          showAlert(
            '🎉 Payment Successful!',
            `Your order #${orderIdShort} has been placed successfully! Payment of ₹${total.toFixed(2)} was completed.`,
            'success',
            () => {
              hideAlert();
              navigation.reset({
                index: 0,
                routes: [{ name: 'Home' }],
              });
            }
          );
        }, 100);
      } else {
        setLoading(false);
        const errorMsg = data.message || data.error || `Server error (${res.status}). Please try again.`;
        console.error('Order failed:', errorMsg);
        
        // Check if it's an email configuration error
        const isEmailError = errorMsg.includes('sendOrderConfirmationEmail') || 
                            errorMsg.includes('is not defined');
        
        setTimeout(() => {
          showAlert(
            'Order Failed',
            isEmailError 
              ? 'Order creation failed due to backend email configuration issue. Please contact support or try again later.'
              : errorMsg,
            'error'
          );
        }, 100);
      }
    } catch (err) {
      console.error('Order error:', err);
      setLoading(false);
      setTimeout(() => {
        showAlert(
          'Order Failed',
          err.message || 'Failed to place order. Please check your connection and try again.',
          'error'
        );
      }, 100);
    }
  };

  if (loading) {
    return (
      <SafeAreaViewContext style={styles.loadingContainer}>
        <View style={styles.loadingContent}>
          <ActivityIndicator size="large" color="#16A34A" />
          <Text style={styles.loadingText}>Processing your order...</Text>
        </View>
      </SafeAreaViewContext>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="chevron-back" size={28} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.title}>Payment</Text>
        <View style={{ width: 28 }} />
      </View>

      {/* Order Summary */}
      <View style={styles.summaryContainer}>
        <Text style={styles.summaryTitle}>Order Summary</Text>

        <View style={styles.summaryRow}>
          <Text style={styles.summaryText}>Subtotal:</Text>
          <Text style={styles.summaryText}>₹{subtotal.toFixed(2)}</Text>
        </View>

        <View style={styles.summaryRow}>
          <Text style={styles.summaryText}>Delivery Fee:</Text>
          <Text style={styles.summaryText}>₹{deliveryFee.toFixed(2)}</Text>
        </View>

        <View style={styles.summaryRowTotal}>
          <Text style={styles.totalText}>Total:</Text>
          <Text style={styles.totalText}>₹{total.toFixed(2)}</Text>
        </View>
      </View>

      {/* Delivery Address */}
      <View style={styles.addressContainer}>
        <Text style={styles.addressTitle}>Delivery Address</Text>
        <View style={styles.addressCard}>
          <Text style={styles.addressLabel}>{selectedAddress.label}</Text>
          <Text style={styles.addressText}>{selectedAddress.fullAddress}</Text>
          <Text style={styles.addressText}>
            {selectedAddress.city}, {selectedAddress.state} {selectedAddress.pincode}
          </Text>
        </View>
      </View>

      {/* Payment Options */}
      <View style={styles.paymentContainer}>
        <Text style={styles.paymentTitle}>Choose Payment Method</Text>

        {paymentMethods.map(method => (
          <TouchableOpacity
            key={method.id}
            style={[
              styles.paymentOption,
              selectedPaymentMethod?.id === method.id && styles.selectedPayment,
            ]}
            onPress={() => setSelectedPaymentMethod(method)}
          >
            <View style={styles.paymentRow}>
              <Icon 
                name={method.icon} 
                size={24} 
                color={selectedPaymentMethod?.id === method.id ? "#fff" : "green"} 
              />
              <View style={styles.paymentTextContainer}>
                <Text
                  style={[
                    styles.paymentOptionTitle,
                    selectedPaymentMethod?.id === method.id && styles.selectedText,
                  ]}
                >
                  {method.title}
                </Text>
                <Text
                  style={[
                    styles.paymentOptionSubtitle,
                    selectedPaymentMethod?.id === method.id && styles.selectedText,
                  ]}
                >
                  {method.subtitle}
                </Text>
              </View>
            </View>
            <Icon 
              name="chevron-forward" 
              size={20} 
              color={selectedPaymentMethod?.id === method.id ? "#fff" : "green"} 
            />
          </TouchableOpacity>
        ))}
      </View>

      {/* Pay Button */}
      <TouchableOpacity
        style={[styles.payButton, !selectedPaymentMethod && styles.disabledButton]}
        onPress={selectedPaymentMethod?.id === 'cash_on_delivery' ? handleCashOnDelivery : handleOnlinePayment}
        disabled={!selectedPaymentMethod}
      >
        <Text style={styles.payText}>
          {selectedPaymentMethod ? `Pay ₹${total.toFixed(2)}` : "Select Payment Method"}
        </Text>
      </TouchableOpacity>

      <CustomAlert
        visible={alertConfig.visible}
        onClose={hideAlert}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
        onConfirm={alertConfig.onConfirm}
        confirmText="OK"
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0FDF4',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#F0FDF4',
  },
  loadingContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FEFFFE',
    borderBottomWidth: 1,
    borderColor: '#D1FAE5',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
  summaryContainer: {
    backgroundColor: '#FEFFFE',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D1FAE5',
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryRowTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderColor: '#E5E7EB',
  },
  summaryText: {
    fontSize: 14,
    color: '#374151',
  },
  totalText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#16A34A',
  },
  addressContainer: {
    backgroundColor: '#FEFFFE',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D1FAE5',
  },
  addressTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  addressCard: {
    backgroundColor: '#ECFDF5',
    padding: 12,
    borderRadius: 8,
  },
  addressLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  addressText: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 2,
  },
  paymentContainer: {
    backgroundColor: '#FEFFFE',
    marginHorizontal: 16,
    marginBottom: 20,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D1FAE5',
  },
  paymentTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#D1FAE5',
    borderRadius: 8,
    marginBottom: 12,
    backgroundColor: '#ECFDF5',
  },
  paymentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  paymentTextContainer: {
    marginLeft: 12,
    flex: 1,
    color: '#111827',
  },
  paymentOptionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  paymentOptionSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  selectedPayment: {
    backgroundColor: '#16A34A',
    borderColor: '#16A34A',
  },
  selectedText: {
    color: '#fff',
  },
  payButton: {
    backgroundColor: '#16A34A',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 30,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#9CA3AF',
  },
  payText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});
