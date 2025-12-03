import React, { useContext, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import {ThemeContext} from './ThemeContext.js'; // adjust if needed

export default function CheckoutScreen({ navigation }) {
  const { isDarkMode } = useContext(ThemeContext);

  const [fullName, setFullName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [address, setAddress] = useState('');

  const handlePay = () => {
    navigation.navigate('PaymentSuccess');
  };

  return (
    <ScrollView
      contentContainerStyle={[
        styles.container,
        {
          backgroundColor: isDarkMode ? '#000' : '#fff',
          paddingHorizontal: 16,
          paddingTop: 16,
          paddingBottom: 16,
        },
      ]}
    >
      <Text style={[styles.header, isDarkMode && { color: '#fff' }]}>
        Checkout
      </Text>

      <TextInput
        style={[styles.input, isDarkMode && styles.inputDark]}
        placeholder="Full Name"
        placeholderTextColor={isDarkMode ? '#aaa' : '#666'}
        value={fullName}
        onChangeText={setFullName}
      />

      <TextInput
        style={[styles.input, isDarkMode && styles.inputDark]}
        placeholder="Card Number"
        placeholderTextColor={isDarkMode ? '#aaa' : '#666'}
        keyboardType="numeric"
        value={cardNumber}
        onChangeText={setCardNumber}
      />

      <TextInput
        style={[styles.input, isDarkMode && styles.inputDark]}
        placeholder="Expiry Date (MM/YY)"
        placeholderTextColor={isDarkMode ? '#aaa' : '#666'}
        value={expiryDate}
        onChangeText={setExpiryDate}
      />

      <TextInput
        style={[styles.input, isDarkMode && styles.inputDark]}
        placeholder="CVV"
        placeholderTextColor={isDarkMode ? '#aaa' : '#666'}
        keyboardType="numeric"
        value={cvv}
        onChangeText={setCvv}
      />

      <TextInput
        style={[styles.input, isDarkMode && styles.inputDark]}
        placeholder="Address"
        placeholderTextColor={isDarkMode ? '#aaa' : '#666'}
        value={address}
        onChangeText={setAddress}
      />

      <TouchableOpacity style={styles.payButton} onPress={handlePay}>
        <Text style={styles.payButtonText}>Proceed to Pay</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 24,
    color: '#000',
  },
  input: {
    backgroundColor: '#fff',
    color: '#000',
    padding: 14,
    borderRadius: 8,
    marginBottom: 16,
    elevation: 2,
  },
  inputDark: {
    backgroundColor: '#1a1a1a',
    color: '#fff',
    shadowColor: 'transparent',
    elevation: 0,
  },
  payButton: {
    backgroundColor: '#007bff',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  payButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
