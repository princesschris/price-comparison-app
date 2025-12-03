// Category.js
import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';

export default function CategoryScreen({ route, navigation }) {
  // This screen expects to be used if you want a dedicated category page.
  // The HomeScreen already lists categories; adapt as needed.
  const { category } = route.params || { category: 'all' };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Category: {category}</Text>

      <View style={styles.infoBox}>
        <Text>Use the home screen categories to browse items, or implement a dedicated category fetch here.</Text>
      </View>

      <TouchableOpacity style={styles.button} onPress={() => navigation.goBack()}>
        <Text style={styles.buttonText}>Back</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, paddingTop: 32},
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 12 },
  infoBox: { padding: 12, backgroundColor: '#fafafa', borderRadius: 8 },
  button: {
    marginTop: 20,
    backgroundColor: '#007bff',
    padding:10,
    alignItems: 'center',
  },
  buttonText: { color: '#fff' },
});
