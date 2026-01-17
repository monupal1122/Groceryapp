import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import SweetAlert from '../utils/AlertManager';
import { AuthContext } from '../context/AuthContext';

const BASE_URL = 'https://grocery-backend-3pow.onrender.com';

export default function AddAddressScreen({ navigation }) {
  const [formData, setFormData] = useState({
    label: 'Home',
    fullAddress: '',
    city: '',
    state: '',
    pincode: '',
    isDefault: false,
  });
  const [loading, setLoading] = useState(false);
  const { authToken } = useContext(AuthContext);

  const handleAddAddress = async () => {
    if (!formData.fullAddress || !formData.city || !formData.state || !formData.pincode) {
      SweetAlert.showAlertWithOptions({
        title: 'Missing Information',
        subTitle: 'Please fill all required fields',
        style: 'warning',
        confirmButtonTitle: 'OK',
        confirmButtonColor: '#F59E0B'
      });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/api/address`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (res.ok) {
        SweetAlert.showAlertWithOptions({
          title: '🏠 Address Added!',
          subTitle: 'Your new address has been saved successfully',
          style: 'success',
          confirmButtonTitle: 'Great!',
          confirmButtonColor: '#16A34A'
        }, () => {
          navigation.goBack(); // Go back to AddressScreen
        });
      } else {
        SweetAlert.showAlertWithOptions({
          title: 'Failed to Add Address',
          subTitle: data.message || 'Please try again',
          style: 'error',
          confirmButtonTitle: 'OK',
          confirmButtonColor: '#EF4444'
        });
      }
    } catch (err) {
      console.error('Add address error:', err);
      SweetAlert.showAlertWithOptions({
        title: 'Network Error',
        subTitle: 'Please check your connection and try again',
        style: 'error',
        confirmButtonTitle: 'OK',
        confirmButtonColor: '#EF4444'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="chevron-back" size={28} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.title}>Add Address</Text>
        <TouchableOpacity onPress={handleAddAddress} disabled={loading}>
          {loading ? (
            <ActivityIndicator size="small" color="#16A34A" />
          ) : (
            <Text style={styles.saveText}>Save</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.formContainer}>
        <TextInput
          style={styles.input}
          placeholder="Label (e.g., Home, Office)"
          value={formData.label}
          onChangeText={(text) => setFormData({ ...formData, label: text })}
          placeholderTextColor="#9CA3AF"
        />
        <TextInput
          style={[styles.input, { height: 80 }]}
          placeholder="Full Address"
          value={formData.fullAddress}
          onChangeText={(text) => setFormData({ ...formData, fullAddress: text })}
          placeholderTextColor="#9CA3AF"
          multiline
        />
        <TextInput
          style={styles.input}
          placeholder="City"
          value={formData.city}
          onChangeText={(text) => setFormData({ ...formData, city: text })}
          placeholderTextColor="#9CA3AF"
        />
        <TextInput
          style={styles.input}
          placeholder="State"
          value={formData.state}
          onChangeText={(text) => setFormData({ ...formData, state: text })}
          placeholderTextColor="#9CA3AF"
        />
        <TextInput
          style={styles.input}
          placeholder="Pincode"
          value={formData.pincode}
          onChangeText={(text) => setFormData({ ...formData, pincode: text })}
          placeholderTextColor="#9CA3AF"
          keyboardType="number-pad"
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
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
  saveText: {
    fontSize: 16,
    color: '#16A34A',
    fontWeight: '600',
  },
  formContainer: {
    padding: 16,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 12,
    fontSize: 16,
    color: '#111827',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
});
