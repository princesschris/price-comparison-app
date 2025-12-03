import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  FlatList,
  Text,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  StyleSheet,
  Dimensions,
  SafeAreaView,
} from 'react-native';
import axios from 'axios';
import { ThemeContext } from './ThemeContext';

const { width } = Dimensions.get('window');
const API_BASE_URL = 'http://10.99.120.246:3000';

export default function HomeScreen({ navigation }) {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState(['all']);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const { isDarkMode } = useContext(ThemeContext);

  useEffect(() => {
    fetchCategories();
    fetchProducts();
  }, []);

  useEffect(() => {
    if (selectedCategory === 'all') {
      fetchProducts();
    } else {
      fetchProductsByCategory(selectedCategory);
    }
  }, [selectedCategory]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE_URL}/products`);
      setProducts(res.data || []);
    } catch (err) {
      console.error('fetchProducts', err?.message || err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/categories`);
      setCategories(['all', ...(res.data || [])]);
    } catch (err) {
      console.error('fetchCategories', err?.message || err);
    }
  };

  const fetchProductsByCategory = async (cat) => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${API_BASE_URL}/products/category/${encodeURIComponent(cat)}`
      );
      setProducts(res.data || []);
    } catch (err) {
      console.error('fetchProductsByCategory', err?.message || err);
    } finally {
      setLoading(false);
    }
  };

  const renderProduct = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('ProductDetails', { productId: item.id })}
    >
      <Image source={{ uri: item.image }} style={styles.image} resizeMode="contain" />
      <Text numberOfLines={2} style={styles.title}>
        {item.title}
      </Text>
      <Text style={styles.price}>
        From ${Number(item.cheapestOffer).toFixed(2)}
      </Text>
      <Text style={styles.offerCount}>
        {item.offerCount} offers
      </Text>
    </TouchableOpacity>
  );

  const renderCategory = ({ item }) => (
    <TouchableOpacity
      onPress={() => setSelectedCategory(item)}
      style={[
        styles.categoryBtn,
        selectedCategory === item ? styles.categoryBtnActive : null,
      ]}
    >
      <Text
        style={
          selectedCategory === item
            ? styles.categoryTextActive
            : styles.categoryText
        }
      >
        {item}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View
      style={{
        flex: 1,
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 16,
      }}
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.categoryList}>
          <FlatList
            data={categories}
            keyExtractor={(item) => item}
            horizontal
            renderItem={renderCategory}
            showsHorizontalScrollIndicator={false}
          />
        </View>

        {loading ? (
          <ActivityIndicator size="large" style={{ marginTop: 40 }} />
        ) : (
          <FlatList
            data={products}
            keyExtractor={(item) => String(item.id)}
            renderItem={renderProduct}
            numColumns={2}
            contentContainerStyle={{ paddingBottom: 80 }}
          />
        )}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  card: {
    backgroundColor: '#fff',
    width: (width - 40) / 2,
    marginVertical: 8,
    marginHorizontal:2,
    borderRadius: 8,
    padding: 10,
    elevation: 2,
    alignItems: 'center',
  },
  image: { width: '100%', height: 120, marginBottom: 8 },
  title: { fontSize: 14, marginBottom: 6, color: '#000' },
  price: { fontSize: 14, fontWeight: 'bold', color: '#000' },
  offerCount: { fontSize: 12, color: '#666' },
  categoryList: {
    height: 50,
    justifyContent: 'center',
  },
  categoryBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginHorizontal: 6,
    backgroundColor: '#eee',
  },
  categoryBtnActive: { backgroundColor: '#333' },
  categoryText: { color: '#333' },
  categoryTextActive: { color: '#fff' },
});
