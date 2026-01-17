import React, { useState, useEffect, useContext } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  FlatList,
  ScrollView,
  StyleSheet,
} from "react-native";
import { AppContext } from "../context/AppContext";
import ProductCard from "../component/ProductCard";

const BASE_URL = "https://grocery-backend-3pow.onrender.com";


export default function CategoryPage({ navigation, route }) {
  const { categoryId } = route.params || {};
  const [subcategories, setSubcategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedSubcategory, setSelectedSubcategory] = useState(null);
  const { addToCart } = useContext(AppContext);

  // Fetch subcategories for the selected category
  useEffect(() => {
    const fetchSubcategories = async () => {
      try {
        const res = await fetch(`${BASE_URL}/api/subcategories/category/${categoryId}`);
        const data = await res.json();
        setSubcategories(data);
      } catch (err) {
        console.error("Error fetching subcategories:", err);
      }
    };
    if (categoryId) {
      fetchSubcategories();
    }
  }, [categoryId]);

  // Fetch products when selectedSubcategory changes
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        let url = `${BASE_URL}/api/products`;
        if (selectedSubcategory) {
          url = `${BASE_URL}/api/products/subcategory/${selectedSubcategory}`;
        }
        const res = await fetch(url);
        const data = await res.json();
        setProducts(data);
      } catch (err) {
        console.error("Error fetching products:", err);
      }
    };
    fetchProducts();
  }, [selectedSubcategory]);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Subcategories</Text>

      {/* Horizontal Subcategory List */}
      <FlatList
        data={subcategories}
        horizontal
        keyExtractor={(item) => item._id}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoryList}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.categoryItem,
              selectedSubcategory === item._id && styles.categorySelected,
            ]}
            onPress={() =>
              setSelectedSubcategory(
                selectedSubcategory === item._id ? null : item._id
              )
            }
          >
            <Image
              source={{ uri: item.image }}
              style={styles.categoryImage}
            />
            <Text
              style={[
                styles.categoryText,
                selectedSubcategory === item._id && styles.categoryTextSelected,
              ]}
            >
              {item.name}
            </Text>
          </TouchableOpacity>
        )}
      />

      <Text style={styles.header}>Products</Text>

      {/* Products Grid */}
      <View style={styles.productGrid}>
        {products.map((product) => (
          <ProductCard key={product._id} product={product} />
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F0FDF4", padding: 10 },
  header: { fontSize: 20, fontWeight: "bold", marginVertical: 10 },
  categoryList: { gap: 10, paddingVertical: 5 },
  categoryItem: {
    alignItems: "center",
    marginRight: 10,
    backgroundColor: "#f2f2f2",
    padding: 8,
    borderRadius: 8,
  },
  categorySelected: {
    backgroundColor: "#d6e4ff",
    borderColor: "#4287f5",
    borderWidth: 1,
  },
  categoryImage: { width: 60, height: 60, borderRadius: 10 },
  categoryText: { marginTop: 5, fontSize: 14, color: "#333" },
  categoryTextSelected: { color: "#2a6de8", fontWeight: "bold" },
  productGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  productCard: {
    width: "48%",
    backgroundColor: "#fafafa",
    borderRadius: 10,
    padding: 10,
    marginBottom: 15,
    elevation: 2,
  },
  productImage: { width: "100%", height: 120, borderRadius: 10 },
  productName: { fontWeight: "bold", fontSize: 16, marginTop: 5 },
  productDesc: { color: "#555", fontSize: 12, marginVertical: 4 },
  productPrice: { color: "#28a745", fontWeight: "bold" },
  addBtn: {
    marginTop: 8,
    backgroundColor: "#28a745",
    paddingVertical: 6,
    borderRadius: 6,
  },
  addBtnText: { textAlign: "center", color: "#fff", fontWeight: "bold" },
});
