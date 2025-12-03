// ProductDetailsScreen.js
import React, { useEffect, useState, useContext } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  FlatList,
} from 'react-native';
import axios from 'axios';
import { CartContext } from './CartContext';

const API_BASE_URL = 'http://10.99.120.246:3000';

export default function ProductDetailsScreen({ route }) {
  const { productId } = route.params || {};
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useContext(CartContext);

  useEffect(() => {
    fetchProduct();
  }, [productId]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE_URL}/products/${productId}`);
      setProduct(res.data);
    } catch (err) {
      console.error('fetchProduct', err?.message || err);
      Alert.alert('Error', 'Could not load product');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (offer) => {
    try {
      await addToCart(product, offer.vendor, offer.price, 1);
      Alert.alert('Added', `${product.title} (${offer.vendor}) added to cart`);
    } catch (err) {
      Alert.alert('Error', 'Could not add to cart');
    }
  };

  if (loading || !product) {
    return <ActivityIndicator style={{ marginTop: 40 }} size="large" />;
  }

  const renderOffer = ({ item }) => (
    <View style={styles.offerRow}>
      <View style={{ flex: 1 }}>
        <Text style={styles.offerVendor}>{item.vendor.toUpperCase()}</Text>
        <Text style={styles.offerPrice}>${Number(item.price).toFixed(2)}</Text>
        <Text style={styles.offerMeta}>
          {item.condition} • {item.shipping} • Seller {item.sellerRating}★
        </Text>
      </View>
      <TouchableOpacity style={styles.addBtn} onPress={() => handleAddToCart(item)}>
        <Text style={{ color: '#fff' }}>Add</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <FlatList
      data={product.offers}
      keyExtractor={(item) => `${item.vendor}-${item.price}`}
      renderItem={renderOffer}
      contentContainerStyle={styles.container}
      ListHeaderComponent={
        <>
          <Image source={{ uri: product.image }} style={styles.image} resizeMode="contain" />
          <Text style={styles.title}>{product.title}</Text>
          <Text style={styles.basePrice}>Base price: ${Number(product.price).toFixed(2)}</Text>
          <Text style={styles.desc}>{product.description}</Text>
          <Text style={styles.offersTitle}>Offers</Text>
        </>
      }
    />
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  image: { width: 250, height: 250, marginVertical: 16, alignSelf: 'center' },
  title: { fontSize: 18, fontWeight: 'bold', marginBottom: 8, textAlign: 'center' },
  basePrice: { fontSize: 16, color: '#666', marginBottom: 8, textAlign: 'center' },
  desc: { textAlign: 'center', color: '#555', marginBottom: 16 },
  offersTitle: { fontSize: 16, fontWeight: 'bold', marginTop: 12, marginBottom: 8 },
  offerRow: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    marginVertical: 6,
    alignItems: 'center',
  },
  offerVendor: { fontSize: 14, fontWeight: 'bold' },
  offerPrice: { fontSize: 16, fontWeight: 'bold', marginTop: 6 },
  offerMeta: { color: '#666', marginTop: 6 },
  addBtn: { backgroundColor: '#0a84ff', padding: 10, borderRadius: 8 },
});
