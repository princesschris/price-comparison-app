import React, { useContext } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Switch } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { CartContext } from './CartContext';
import { ThemeContext } from './ThemeContext';

export default function SettingsScreen() {
  const navigation = useNavigation();
  const { setUserAndPersist } = useContext(CartContext);
  const { isDarkMode, toggleTheme } = useContext(ThemeContext);

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('pricecomp_user');
      await setUserAndPersist(null);
      navigation.reset({
        index: 0,
        routes: [{ name: 'SignIn' }],
      });
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: isDarkMode ? '#000' : '#fff' },
      ]}
    >
      <Text
        style={[
          styles.title,
          { color: isDarkMode ? '#fff' : '#000' },
        ]}
      >
        Settings
      </Text>

      
      <View style={styles.row}>
        <Text style={[styles.text, { color: isDarkMode ? '#fff' : '#000' }]}>
          Dark Mode
        </Text>
        <Switch value={isDarkMode} onValueChange={toggleTheme} />
      </View>

      <TouchableOpacity style={styles.row} onPress={() => navigation.navigate('Profile')}>
        <Text style={[styles.text, isDarkMode && { color: '#fff' }]}>Account</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.row}>
        <Text style={[styles.text, { color: isDarkMode ? '#fff' : '#000' }]}>
          Support
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.row, styles.logoutRow]}
        onPress={handleLogout}
      >
        <View style={styles.logoutContainer}>
  <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
    <Text style={styles.logoutText}>Log Out</Text>
  </TouchableOpacity>
</View>

      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  row: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  text: {
    fontSize: 16,
  },
  logoutContainer: {
  marginTop: 30,
  width: '100%',
  alignItems: 'center', // ✅ Centers the button
},

logoutButton: {
  paddingVertical: 14,
  paddingHorizontal: 30,
  backgroundColor: '#ff4444',
  borderRadius: 8,
  alignItems: 'center', // ✅ Ensures text is centered
  justifyContent: 'center',
},

logoutText: {
  color: '#fff',
  fontSize: 16,
  fontWeight: 'bold',
  textAlign: 'center', // ✅ Centers text inside
},

});
