import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import SweetAlert from '../utils/AlertManager';
import { AuthContext } from '../context/AuthContext';

const BASE_URL = 'https://grocery-backend-3pow.onrender.com';

export default function AddressScreen({ navigation }) {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const { authToken } = useContext(AuthContext);

  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${BASE_URL}/api/address`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
      });
      const data = await res.json();
      if (res.ok) {
        setAddresses(data.addresses || []);
      } else {
        SweetAlert.showAlertWithOptions({
          title: 'Failed to Load Addresses',
          subTitle: data.message || 'Please try again',
          style: 'error',
          confirmButtonTitle: 'OK',
          confirmButtonColor: '#EF4444'
        });
      }
    } catch (err) {
      console.error('Fetch addresses error:', err);
      SweetAlert.showAlertWithOptions({
        title: 'Network Error',
        subTitle: 'Please check your connection',
        style: 'error',
        confirmButtonTitle: 'OK',
        confirmButtonColor: '#EF4444'
      });
    } finally {
      setLoading(false);
    }
  };



  const handleDeleteAddress = async (id) => {
    SweetAlert.showAlertWithOptions({
      title: 'Delete Address',
      subTitle: 'Are you sure you want to delete this address?',
      confirmButtonTitle: 'Delete',
      confirmButtonColor: '#EF4444',
      otherButtonTitle: 'Cancel',
      otherButtonColor: '#6B7280',
      style: 'warning',
      cancellable: true
    }, async (callback) => {
      if (callback === 'confirm') {
        try {
          const res = await fetch(`${BASE_URL}/api/address/${id}`, {
            method: 'DELETE',
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
          });
          if (res.ok) {
            SweetAlert.showAlertWithOptions({
              title: '🗑️ Address Deleted',
              subTitle: 'Address removed successfully',
              style: 'success',
              confirmButtonTitle: 'OK',
              confirmButtonColor: '#16A34A'
            });
            fetchAddresses();
          }
        } catch (err) {
          SweetAlert.showAlertWithOptions({
            title: 'Delete Failed',
            subTitle: 'Failed to delete address. Please try again.',
            style: 'error',
            confirmButtonTitle: 'OK',
            confirmButtonColor: '#EF4444'
          });
        }
      }
    });
  };

  const handleSelectAddress = (address) => {
    setSelectedAddress(address);
    // Navigate to payment screen with selected address
    navigation.navigate('Payment', { selectedAddress: address });
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.containerLoading}>
        <ActivityIndicator size="large" color="#16A34A" />
      </SafeAreaView>
    );
  }

  return (
    <>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon name="chevron-back" size={28} color="#111827" />
          </TouchableOpacity>
          <Text style={styles.title}>Delivery Addresses</Text>
          <View style={{ width: 28 }} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          {addresses.length === 0 ? (
            <View style={styles.emptyState}>
              <Icon name="location-outline" size={64} color="#D1D5DB" />
              <Text style={styles.emptyText}>No addresses yet</Text>
              <Text style={styles.emptySubtext}>Add an address to continue</Text>
            </View>
          ) : (
            addresses.map((addr) => (
              <TouchableOpacity
                key={addr._id}
                style={[
                  styles.addressCard,
                  selectedAddress?._id === addr._id && styles.selectedCard,
                ]}
                onPress={() => handleSelectAddress(addr)}
              >
                <View style={styles.addressHeader}>
                  <View>
                    <Text style={styles.addressName}>{addr.label}</Text>
                    {addr.isDefault && (
                      <Text style={styles.defaultBadge}>Default</Text>
                    )}
                  </View>
                  <TouchableOpacity onPress={() => handleDeleteAddress(addr._id)}>
                    <Icon name="trash-outline" size={20} color="#EF4444" />
                  </TouchableOpacity>
                </View>
                <Text style={styles.addressText}>{addr.fullAddress}</Text>
                <Text style={styles.addressText}>
                  {addr.city}, {addr.state} {addr.pincode}
                </Text>
              </TouchableOpacity>
            ))
          )}

        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('AddAddress')}
        >
          <Icon name="add-circle-outline" size={24} color="#fff" />
          <Text style={styles.addButtonText}>Add New Address</Text>
        </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>


    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0FDF4',
  },
  containerLoading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',},
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
    paddingVertical: 80,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6B7280',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 8,
  },
  addressCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  selectedCard: {
    borderColor: '#16A34A',
    backgroundColor: '#F0FDF4',
  },
  addressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  addressName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  defaultBadge: {
    fontSize: 12,
    color: '#16A34A',
    fontWeight: '600',
    marginTop: 2,
  },
  addressText: {
    fontSize: 14,
    color: '#374151',
    marginTop: 4,
  },
  addButton: {
    backgroundColor: '#16A34A',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 16,
    marginVertical: 20,
    paddingVertical: 14,
    borderRadius: 12,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },

});
