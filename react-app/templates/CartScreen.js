import React, { useContext } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { CartContext } from './CartContext';
import { ThemeContext } from './ThemeContext';

export default function CartScreen({ navigation }) {
  const { cartItems, removeFromCart, clearCart } = useContext(CartContext);
  const { isDarkMode } = useContext(ThemeContext);

  const total = cartItems.reduce(
    (s, it) =>
      s + (it.offerPrice || it.product?.price || 0) * (it.quantity || 1),
    0
  );

  const handleRemove = async (item) => {
    try {
      await removeFromCart(item.product.id, item.vendor, item.offerPrice);
    } catch (err) {
      Alert.alert('Error', 'Failed to remove item');
    }
  };

  const handleClear = async () => {
    try {
      await clearCart();
    } catch (err) {
      Alert.alert('Error', 'Failed to clear cart');
    }
  };

  const renderItem = ({ item }) => {
    const p = item.product;
    return (
      <View
        style={[
          styles.row,
          isDarkMode && {
            backgroundColor: '#1a1a1a',
            shadowColor: 'transparent',
            elevation: 0,
            borderWidth: 0,
          },
        ]}
      >
        <Image source={{ uri: p.image }} style={styles.image} />
        <View style={{ flex: 1, paddingHorizontal: 8 }}>
          <Text
            numberOfLines={2}
            style={[styles.title, isDarkMode && { color: '#fff' }]}
          >
            {p.title}
          </Text>
          <Text style={[{ color: isDarkMode ? '#fff' : '#000' }]}>
            ₦{Number(item.offerPrice).toFixed(2)} • {item.vendor}
          </Text>
          <Text style={[{ color: isDarkMode ? '#ddd' : '#444' }]}>
            Qty: {item.quantity}
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => handleRemove(item)}
          style={styles.removeBtn}
        >
          <Text style={{ color: '#fff' }}>Remove</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View
      style={{
        flex: 1,
        padding: 12,
        backgroundColor: isDarkMode ? '#000' : '#fff',
      }}
    >
      {cartItems.length === 0 ? (
        <View style={styles.emptyBox}>
          <Text style={[styles.emptyText, isDarkMode && { color: '#ccc' }]}>
            Your cart is empty
          </Text>
        </View>
      ) : (
        <>
          <FlatList
            data={cartItems}
            keyExtractor={(i, idx) =>
              `₦{i.product.id}-₦{i.vendor}-₦{i.offerPrice}-₦{idx}`
            }
            renderItem={renderItem}
            contentContainerStyle={{ paddingBottom: 100 }}
          />

          <View style={styles.summary}>
            <Text
              style={[
                styles.totalText,
                isDarkMode && { color: '#fff' },
              ]}
            >
              Total: ₦{total.toFixed(2)}
            </Text>
            <TouchableOpacity style={styles.clearBtn} onPress={handleClear}>
              <Text style={{ color: '#fff' }}>Clear Cart</Text>
            </TouchableOpacity>
          </View>

          {/* ✅ Fixed Checkout Button */}
          <View style={styles.checkoutContainer}>
            <TouchableOpacity
              style={styles.checkoutButton}
              onPress={() => navigation.navigate('Checkout')}
            >
              <Text style={styles.checkoutButtonText}>Checkout</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    padding: 10,
    alignItems: 'center',
    backgroundColor: '#fff',
    marginBottom: 8,
    borderRadius: 8,
  },
  image: { width: 70, height: 70, resizeMode: 'contain' },
  title: { fontSize: 14, fontWeight: 'bold', color: '#000' },
  removeBtn: { backgroundColor: 'red', padding: 8, borderRadius: 6 },
  summary: {
    padding: 12,
    borderTopWidth: 1,
    borderColor: '#eee',
    alignItems: 'center',
    marginBottom: 80,
  },
  totalText: { fontSize: 18, fontWeight: 'bold', marginBottom: 8, color: '#000' },
  clearBtn: { backgroundColor: '#333', padding: 10, borderRadius: 8 },
  emptyBox: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { fontSize: 16, color: '#666' },

  // ✅ New Checkout Button Styles
  checkoutContainer: {
    position: 'absolute',
    left: 12,
    right: 12,
    bottom: 16,
  },
  checkoutButton: {
    backgroundColor: '#007bff',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  checkoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
