import React, { useContext } from 'react';
import {
  View,
  Text,
  TextInput,
  Image,
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
      {/* Left Section - Logo & Location */}
      <View style={styles.leftSection}>
        <TouchableOpacity onPress={() => navigation.navigate('Home')}>
          <Image
            source={{ uri: 'https://i.pinimg.com/736x/1b/9a/b7/1b9ab754b22522b4056538b89e441961.jpg' }}
            style={styles.logo}
          />
        </TouchableOpacity>
        
      </View>

      {/* Right Section - Search & Cart */}
      <View style={styles.rightSection}>
        {/* Search Bar */}
        <TouchableOpacity
          style={styles.searchContainer}
          onPress={() => navigation.navigate('Search')}
        >
          <Ionicons name="search-outline" size={20} color="#6B7280" />
          <Text style={styles.searchPlaceholder}>Search for items</Text>
        </TouchableOpacity>

        {/* Cart Button */}
        <TouchableOpacity
          style={styles.cartButton}
          onPress={() => navigation.navigate('Cart')}
        >
          <Ionicons name="bag-outline" size={24} color="#16A34A" />
          {cartItemCount > 0 && (
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>
                {cartItemCount > 99 ? '99+' : cartItemCount}
              </Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Profile Button */}
        <TouchableOpacity
          style={styles.profileButton}
          onPress={() => navigation.navigate('Profile')}
        >
          <Ionicons name="person-outline" size={24} color="#16A34A" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#158e19ff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingVertical: 10,
    elevation: 4,
    shadowColor: '#1a1515ff',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  logo: {
    width: 56,
    height: 45,
    resizeMode: 'contain',
    backgroundColor: '#f1f5f2ff',
    borderRadius: 22.5,
  },
  locationContainer: {
    marginLeft: 12,
  },
  deliveryText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  locationText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'flex-end',
  },
  searchContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 25,
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    minWidth: 100,
  },
  searchPlaceholder: {
    marginLeft: 8,
    fontSize: 14,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  cartButton: {
    position: 'relative',
    marginRight: 16,
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  cartBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#EF4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  cartBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
    textAlign: 'center',
  },
  profileButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
});
