// src/component/SubCategoryList.js
import React, { useContext } from 'react';
import { View, Image, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { AppContext } from '../context/AppContext';

export default function SubCategoryList() {
  const { subcategories } = useContext(AppContext);

  return (
    <FlatList
      data={subcategories}
      keyExtractor={(item) => item.id.toString()}
      showsVerticalScrollIndicator={false}
      renderItem={({ item }) => (
        <TouchableOpacity style={styles.card}>
          <Image source={item.image} style={styles.image} />
        </TouchableOpacity>
      )}
    />
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
    marginVertical: 10,
  },
  image: {
    width: 50,
    height: 50,
    borderRadius: 10,
  },
});
