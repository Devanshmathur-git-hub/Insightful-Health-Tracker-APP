import React, { useEffect } from 'react';
import { Provider, useDispatch } from 'react-redux';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { store } from './src/store';
import AppNavigator from './src/navigation/AppNavigator';
import { setToken } from './src/store/slices/authSlice';

function RootComponent() {
  const dispatch = useDispatch();

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = await AsyncStorage.getItem('authToken');
        if (token) {
          dispatch(setToken(token));
        }
      } catch (error) {
        console.error('Failed to restore auth token:', error);
      }
    };
    initializeAuth();
  }, [dispatch]);

  return (
    <>
      <StatusBar style="light" />
      <AppNavigator />
    </>
  );
}

export default function App() {
  return (
    <Provider store={store}>
      <RootComponent />
    </Provider>
  );
}
