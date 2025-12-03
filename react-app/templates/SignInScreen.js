// SignInScreen.js
import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import axios from 'axios';
import { CartContext } from './CartContext';

const API_BASE_URL = 'http://10.99.120.246:3000';

export default function SignInScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { setUserAndPersist } = useContext(CartContext);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Validation', 'Please enter email and password');
      return;
    }
    try {
      setLoading(true);
      const res = await axios.post(`${API_BASE_URL}/auth/login`, { email, password });
      
      await setUserAndPersist({ id: res.data.id, email: res.data.email, name: res.data.name });
      
      navigation.navigate('Home');
    } catch (err) {
      console.error('login error', err?.response?.data || err?.message || err);
      const msg = err?.response?.data?.error || 'Failed to login';
      Alert.alert('Login error', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sign in</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Sign in</Text>}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
        <Text style={styles.link}>Don't have an account? Sign up</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, justifyContent: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 24, alignSelf: 'center' },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  button: { backgroundColor: '#0a84ff', padding: 14, borderRadius: 8, alignItems: 'center', marginVertical: 8 },
  buttonText: { color: '#fff', fontWeight: 'bold' },
  link: { color: '#0a84ff', textAlign: 'center', marginTop: 12 },
});
