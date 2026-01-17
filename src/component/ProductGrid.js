// src/component/ProductGrid.js
import React, { useContext } from 'react';
import { FlatList, View, StyleSheet } from 'react-native';
import { AppContext } from '../context/AppContext';
import ProductCard from './ProductCard';

export default function ProductGrid({ products: propProducts }) {
  const { products: contextProducts } = useContext(AppContext);
  const products = Array.isArray(propProducts) ? propProducts : (Array.isArray(contextProducts) ? contextProducts : []);

  console.log('ProductGrid - propProducts:', propProducts);
  console.log('ProductGrid - contextProducts:', contextProducts?.length, 'products from context');
  console.log('ProductGrid - final products:', products?.length, 'products to render');

  // Sort products by creation date (latest first) if available, otherwise just use as is
  const sortedProducts = products.filter(p => p).slice().sort((a, b) => {
    if (a.createdAt && b.createdAt) {
      return new Date(b.createdAt) - new Date(a.createdAt);
    }
    return 0;
  });

  console.log('ProductGrid - sortedProducts:', sortedProducts?.length, 'products to render');

  return (
    <FlatList
      data={sortedProducts}
      horizontal
      keyExtractor={(item) => item?._id?.toString() || Math.random().toString()}
      showsHorizontalScrollIndicator={false}
      renderItem={({ item }) => item && <ProductCard product={item} />}
      contentContainerStyle={{ paddingHorizontal: 12 }}
    />
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    flex: 1,
    padding: 8,
  },
});
