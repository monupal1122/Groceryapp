import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { AuthContext } from '../context/AuthContext';
import CustomAlert from '../components/CustomAlert';

const BASE_URL = 'https://grocery-backend-3pow.onrender.com';

export default function OrdersScreen({ navigation }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alertConfig, setAlertConfig] = useState({
    visible: false,
    title: '',
    message: '',
    type: 'info',
  });
  const { authToken } = useContext(AuthContext);

  const showAlert = (title, message, type = 'info') => {
    setAlertConfig({
      visible: true,
      title,
      message,
      type,
    });
  };

  const hideAlert = () => {
    setAlertConfig(prev => ({ ...prev, visible: false }));
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${BASE_URL}/api/order/my`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
      });
      const data = await res.json();
      if (res.ok) {
        setOrders(data.orders || []);
      } else {
        console.error('Failed to fetch orders:', data.message);
      }
    } catch (err) {
      console.error('Fetch orders error:', err);
    } finally {
      setLoading(false);
    }
  };
console.log(orders);

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending':
        return '#FFA500';
      case 'Confirmed':
        return '#3B82F6';
      case 'Out for delivery':
        return '#10B981';
      case 'Delivered':
        return '#16A34A';
      case 'Cancelled':
        return '#EF4444';
      default:
        return '#6B7280';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Pending':
        return 'time-outline';
      case 'Confirmed':
        return 'checkmark-circle-outline';
      case 'Out for delivery':
        return 'truck-outline';
      case 'Delivered':
        return 'checkmark-done-circle-outline';
      case 'Cancelled':
        return 'close-circle-outline';
      default:
        return 'help-circle-outline';
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContent}>
          <ActivityIndicator size="large" color="#16A34A" />
          <Text style={styles.loadingText}>Loading your orders...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="chevron-back" size={28} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.title}>My Orders</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.ordersCountContainer}>
          <Text style={styles.ordersCountText}>Total Orders: {orders.length}</Text>
        </View>

        {orders.length === 0 ? (
          <View style={styles.emptyState}>
            <Icon name="bag-outline" size={64} color="#D1D5DB" />
            <Text style={styles.emptyText}>No orders yet</Text>
            <Text style={styles.emptySubtext}>Start shopping to place your first order</Text>
          </View>
        ) : (
          orders.map((order) => (
            <TouchableOpacity key={order._id} style={styles.orderCard}>
              <View style={styles.orderHeader}>
                <View>
                  <Text style={styles.orderId}>Order #{order._id?.slice(-6)}</Text>
                  <Text style={styles.orderDate}>
                    {new Date(order.createdAt).toLocaleDateString()}
                  </Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.deliveryStatus) }]}>
                  <Icon
                    name={getStatusIcon(order.deliveryStatus)}
                    size={16}
                    color="#fff"
                    style={{ marginRight: 4 }}
                  />
                  <Text style={styles.statusText}>
                    {order.deliveryStatus?.toUpperCase()}
                    </Text>
                </View>
              </View>

              <View style={styles.divider} />

              <View style={styles.orderDetails}>
                <Text style={styles.itemCount}>Items: {order.items?.length || 0}</Text>
                <Text style={styles.totalAmount}>₹{order.totalAmount?.toFixed(2) || '0.00'}</Text>
              </View>

              {/* Payment Information */}
              <View style={styles.paymentSection}>
                <Text style={styles.paymentLabel}>Payment Method:</Text>
                <Text style={styles.paymentText}>
                  {order.paymentMethod === 'online' ? 'Online Payment' : 'Cash on Delivery'}
                </Text>
                <Text style={styles.paymentStatus}>
                  Status: {order.paymentStatus}
                </Text>
              </View>

              <View style={styles.divider} />

              {order.addressId && (
                <View style={styles.addressSection}>
                  <Text style={styles.addressLabel}>Delivery To:</Text>
                  <Text style={styles.addressText}>{order.addressId.label}</Text>
                  <Text style={styles.addressText}>{order.addressId.fullAddress}</Text>
                  <Text style={styles.addressText}>
                    {order.addressId.city}, {order.addressId.state} {order.addressId.pincode}
                  </Text>
                </View>
              )}

              {/* Display cart items */}
              {order.items && order.items.length > 0 && (
                <View style={styles.itemsSection}>
                  <Text style={styles.itemsLabel}>Items Ordered:</Text>
                  {order.items.map((item, index) => {
                    // Fix image URL construction
                    let imageUrl = null;
                    
                    if (item.productId?.images && Array.isArray(item.productId.images) && item.productId.images.length > 0) {
                      const rawPath = item.productId.images[0]; // Get first image
                      imageUrl = rawPath.startsWith('http') 
                        ? rawPath 
                        : `${BASE_URL}${rawPath}`;
                    }
                    
                    console.log('Order item:', item.productId?.name, 'Image URL:', imageUrl);

                    return (
                      <View key={index} style={styles.itemRow}>
                        <View style={styles.itemLeft}>
                          {imageUrl ? (
                            <Image 
                              source={{ uri: imageUrl }} 
                              style={styles.itemImage}
                              onError={() => console.log('Image load error for:', imageUrl)}
                            />
                          ) : (
                            <View style={styles.itemImagePlaceholder}>
                              <Icon name="image-outline" size={20} color="#9CA3AF" />
                            </View>
                          )}
                          <Text style={styles.itemName} numberOfLines={2}>
                            {item.productId?.name || 'Product'} x{item.quantity}
                          </Text>
                        </View>
                        <Text style={styles.itemPrice}>
                          ₹{(item.productId?.price * item.quantity || 0).toFixed(2)}
                        </Text>
                      </View>
                    );
                  })}
                </View>
              )}

              <TouchableOpacity
                style={styles.viewDetailsButton}
                onPress={() => {
                  const orderDate = new Date(order.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  });
                  
                  const details = `Order ID: #${order._id?.slice(-6)}\n\n Order Date: ${orderDate}\n\n Payment Method: ${order.paymentMethod === 'online' ? 'Online Payment' : 'Cash on Delivery'}\n\n Payment Status: ${order.paymentStatus}\n\n Delivery Status: ${order.deliveryStatus}\n\n Items Ordered: ${order.items?.length || 0} item(s)\n\n Total Amount: ₹${order.totalAmount?.toFixed(2) || '0.00'}`;
                  
                  showAlert('Order Details', details, 'info');
                }}
              >
                <Text style={styles.viewDetailsText}>View Details</Text>
                <Icon name="chevron-forward" size={16} color="#16A34A" />
              </TouchableOpacity>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      <CustomAlert
        visible={alertConfig.visible}
        onClose={hideAlert}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
        confirmText="OK"
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0FDF4',
  },
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
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 100,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6B7280',
    marginTop: 16,
  },
  loadingContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 8,
  },
  orderCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  orderId: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  orderDate: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 4,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 12,
  },
  orderDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  itemCount: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  totalAmount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#16A34A',
  },
  addressSection: {
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
  },
  addressLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '600',
    marginBottom: 4,
  },
  addressText: {
    fontSize: 13,
    color: '#374151',
    marginBottom: 2,
  },
  viewDetailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderColor: '#E5E7EB',
    marginTop: 12,
  },
  viewDetailsText: {
    color: '#16A34A',
    fontSize: 14,
    fontWeight: '600',
    marginRight: 4,
  },
  itemsSection: {
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
  },
  itemsLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '600',
    marginBottom: 4,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  itemImage: {
    width: 50,
    height: 50,
    borderRadius: 6,
    marginRight: 10,
    backgroundColor: '#F3F4F6',
  },
  itemImagePlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 6,
    marginRight: 10,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemName: {
    fontSize: 13,
    color: '#374151',
    flex: 1,
  },
  itemPrice: {
    fontSize: 13,
    color: '#16A34A',
    fontWeight: '600',
  },
  paymentSection: {
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
  },
  paymentLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '600',
    marginBottom: 4,
  },
  paymentText: {
    fontSize: 14,
    color: '#111827',
    fontWeight: '500',
    marginBottom: 2,
  },
  paymentStatus: {
    fontSize: 13,
    color: '#16A34A',
    fontWeight: '600',
  },
  ordersCountContainer: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 8,
    borderBottomWidth: 1,
    borderColor: '#E5E7EB',
  },
  ordersCountText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
});
