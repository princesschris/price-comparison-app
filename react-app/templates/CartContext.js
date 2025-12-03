// CartContext.js
import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const CartContext = createContext();

const API_BASE_URL = 'http://10.99.120.246:3000';
const STORAGE_KEY = 'pricecomp_user';

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [loadingCart, setLoadingCart] = useState(false);
  const [user, setUser] = useState(null); // { id, email, name } or null

  // Load user from AsyncStorage on mount
  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          setUser(parsed);
        }
      } catch (err) {
        console.error('CartContext: failed to load user from storage', err);
      }
    })();
  }, []);

  // Whenever user changes, fetch their cart (or clear)
  useEffect(() => {
    if (user && user.id) {
      fetchCart(user.id);
    } else {
      setCartItems([]);
    }
  }, [user]);

  const fetchCart = async (userId) => {
    try {
      setLoadingCart(true);
      const res = await axios.get(`${API_BASE_URL}/cart/${userId}`);
      setCartItems(res.data.items || []);
    } catch (err) {
      console.error('fetchCart error', err?.response?.data || err.message);
    } finally {
      setLoadingCart(false);
    }
  };

  // Called by SignIn/SignUp after successful auth to set user in context + storage
  const setUserAndPersist = async (userObj) => {
    try {
      setUser(userObj);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(userObj));
      // fetchCart will be triggered by useEffect
    } catch (err) {
      console.error('setUserAndPersist error', err);
    }
  };

  const signOut = async () => {
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
      setUser(null);
      setCartItems([]);
    } catch (err) {
      console.error('signOut error', err);
    }
  };

  // Add item to cart
  const addToCart = async (product, vendor, offerPrice, quantity = 1) => {
    if (!user || !user.id) throw new Error('Not authenticated');
    try {
      const res = await axios.post(`${API_BASE_URL}/cart/add`, {
        userId: user.id,
        product,
        vendor,
        offerPrice,
        quantity,
      });
      setCartItems(res.data.items || []);
      return res.data;
    } catch (err) {
      console.error('addToCart error', err?.response?.data || err.message);
      throw err;
    }
  };

  const removeFromCart = async (productId, vendor, offerPrice) => {
    if (!user || !user.id) throw new Error('Not authenticated');
    try {
      const res = await axios.post(`${API_BASE_URL}/cart/remove`, {
        userId: user.id,
        productId,
        vendor,
        offerPrice,
      });
      setCartItems(res.data.items || []);
      return res.data;
    } catch (err) {
      console.error('removeFromCart error', err?.response?.data || err.message);
      throw err;
    }
  };

  const clearCart = async () => {
    if (!user || !user.id) throw new Error('Not authenticated');
    try {
      const res = await axios.post(`${API_BASE_URL}/cart/clear`, {
        userId: user.id,
      });
      setCartItems(res.data.items || []);
      return res.data;
    } catch (err) {
      console.error('clearCart error', err?.response?.data || err.message);
      throw err;
    }
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        loadingCart,
        user,
        setUserAndPersist,
        signOut,
        fetchCart,
        addToCart,
        removeFromCart,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
