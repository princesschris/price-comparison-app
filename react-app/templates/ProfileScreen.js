import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE = 'http://10.99.120.246:3000'; 

export default function ProfileScreen() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    try {
      const raw = await AsyncStorage.getItem('pricecomp_user');
      if (!raw) {
        setLoading(false);
        return;
      }
      const parsed = JSON.parse(raw);
      const id = parsed?.id;
      if (!id) {
        setLoading(false);
        return;
      }
      console.log("📌 Loaded user from AsyncStorage:", raw);

      const res = await fetch(`${API_BASE}/users/${id}`);
      if (!res.ok) throw new Error('Failed to fetch user');
      const data = await res.json();
      setUser(data);
    } catch (err) {
      console.error('loadProfile error', err);
      Alert.alert('Error', 'Could not load profile');
    } finally {
      setLoading(false);
    }
  }

const pickImageAndUpload = async () => {
  try {
    // ✅ Request permission first
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission required', 'Permission to access photos is required.');
      return;
    }

    // ✅ Launch picker with base64 enabled
    const pickerResult = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      base64: true,
      quality: 0.7,
    });

    if (pickerResult.canceled) {
      console.log('User cancelled image picker');
      return;
    }

    // ✅ Get the base64 data
    const asset = pickerResult.assets?.[0];
    if (!asset || !asset.base64) {
      console.log('No base64 data found in asset:', asset);
      Alert.alert('Error', 'Could not read image data');
      return;
    }

    const dataUri = `data:image/jpeg;base64,${asset.base64}`;

    // ✅ Retrieve stored user to get ID
    const raw = await AsyncStorage.getItem('pricecomp_user');
    if (!raw) {
      Alert.alert('Error', 'User not found locally');
      return;
    }

    const parsed = JSON.parse(raw);
    const id = parsed?.id;
    if (!id) {
      Alert.alert('Error', 'User ID not available');
      return;
    }

    setUploading(true);

    // ✅ Upload to backend
    const res = await fetch(`http://10.39.230.246:3000/users/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ profilePic: dataUri }),
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(errText || 'Failed to upload profile picture');
    }

    const json = await res.json();
    setUser(json.user || json);

    // ✅ Update local user copy in AsyncStorage
    const stored = await AsyncStorage.getItem('pricecomp_user');
    if (stored) {
      const storedObj = JSON.parse(stored);
      const merged = { ...storedObj, ...(json.user || json) };
      await AsyncStorage.setItem('pricecomp_user', JSON.stringify(merged));
    }

    Alert.alert('Success', 'Profile picture updated successfully');
  } catch (error) {
    console.error('Upload error:', error);
    Alert.alert('Error', 'Could not upload the profile picture');
  } finally {
    setUploading(false);
  }
};


  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  const displayName = user?.name || 'No name';
  const email = user?.email || 'No email';
  const profilePic = user?.profilePic || null;

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Image
          source={
            profilePic
              ? { uri: profilePic }
              : null
          }
          style={styles.avatar}
        />
        <Text style={styles.name}>{displayName}</Text>
        <Text style={styles.email}>{email}</Text>

        <TouchableOpacity
          style={styles.uploadBtn}
          onPress={pickImageAndUpload}
          disabled={uploading}
        >
          <Text style={styles.uploadText}>{uploading ? 'Uploading...' : 'Change Profile Picture'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 16, paddingTop: 16, paddingBottom: 16, backgroundColor: '#fff' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  card: { alignItems: 'center', padding: 20, borderRadius: 8, backgroundColor: '#fff' },
  avatar: { width: 120, height: 120, borderRadius: 60, marginBottom: 16, backgroundColor: '#eee' },
  name: { fontSize: 20, fontWeight: 'bold', marginBottom: 8 },
  email: { fontSize: 14, color: '#666', marginBottom: 16 },
  uploadBtn: { backgroundColor: '#007bff', paddingVertical: 12, paddingHorizontal: 20, borderRadius: 8 },
  uploadText: { color: '#fff', fontWeight: 'bold' },
});
