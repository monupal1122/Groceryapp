import React, { useContext } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { AppContext } from '../context/AppContext';

export default function BlinkitNavbar() {
  const navigation = useNavigation();
  const { cart } = useContext(AppContext);
  const cartItemCount = cart?.length || 0;

  return (
    <View style={styles.container}>
      {/* Logo Section */}
      <TouchableOpacity 
        style={styles.logoButton}
        onPress={() => navigation.navigate('Home')}
      >
        <View style={styles.logoCircle}>
          <Ionicons name="storefront" size={24} color="#16A34A" />
        </View>
      </TouchableOpacity>

      {/* Search Bar */}
      <TouchableOpacity
        style={styles.searchContainer}
        onPress={() => navigation.navigate('Search')}
      >
        <Ionicons name="search" size={20} color="#9CA3AF" />
        <Text style={styles.searchPlaceholder}>Search products...</Text>
      </TouchableOpacity>

      {/* Cart Button */}
      <TouchableOpacity
        style={styles.iconButton}
        onPress={() => navigation.navigate('Cart')}
      >
        <Ionicons name="cart" size={24} color="#1F2937" />
        {cartItemCount > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              {cartItemCount > 9 ? '9+' : cartItemCount}
            </Text>
          </View>
        )}
      </TouchableOpacity>

      {/* Profile Button */}
      <TouchableOpacity
        style={styles.iconButton}
        onPress={() => navigation.navigate('Profile')}
      >
        <Ionicons name="person-circle" size={24} color="#1F2937" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#138d00',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  logoButton: {
    marginRight: 12,
  },
  logoCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F0FDF4',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#BBF7D0',
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#eff1f3',
    borderRadius: 12,
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  searchPlaceholder: {
    marginLeft: 10,
    fontSize: 14,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  iconButton: {
    position: 'relative',
    marginLeft: 8,
    padding: 6,
  },
  badge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#16A34A',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
});