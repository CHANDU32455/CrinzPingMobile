import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'expo-router';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check for stored authentication data
    checkStoredAuth();
  }, []);

  const checkStoredAuth = async () => {
    try {
      // Simulate checking for stored auth data (token, user info, etc.)
      // You can replace this with actual AsyncStorage or SecureStore logic
      const storedUser = await getStoredUser();

      if (storedUser) {
        setUser(storedUser);
      }
    } catch (error) {
      console.error('Error checking stored auth:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Simulate getting stored user data
  const getStoredUser = async () => {
    // Replace with actual storage retrieval
    // const token = await AsyncStorage.getItem('authToken');
    // const userData = await AsyncStorage.getItem('userData');

    // For demo purposes, return null to show login screen
    return null;

    // If you want to auto-login, you could return:
    // return userData ? JSON.parse(userData) : null;
  };

  const login = async (userData) => {
    try {
      setIsLoading(true);

      // Simulate API call for login
      // const response = await yourAuthAPI.login(userData);

      // For demo, just set the user after a delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      const authenticatedUser = {
        id: '1',
        email: userData.email,
        name: userData.name || userData.email.split('@')[0],
        profilePic: 'https://randomuser.me/api/portraits/men/32.jpg',
        // Add other user properties as needed
      };

      setUser(authenticatedUser);

      // Store auth data (in a real app)
      // await AsyncStorage.setItem('authToken', response.token);
      // await AsyncStorage.setItem('userData', JSON.stringify(authenticatedUser));

      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);

      // Simulate API call for logout (if needed)
      // await yourAuthAPI.logout();

      // Clear stored data
      await clearStoredAuth();

      // Clear user state
      setUser(null);

      // Navigate to auth screen
      router.replace('/(auth)/sign-in');

      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  const clearStoredAuth = async () => {
    try {
      // Clear all stored auth data
      // await AsyncStorage.multiRemove(['authToken', 'userData']);
      // Or use SecureStore equivalent
    } catch (error) {
      console.error('Error clearing stored auth:', error);
    }
  };

  const signup = async (userData) => {
    try {
      setIsLoading(true);

      // Simulate API call for signup
      // const response = await yourAuthAPI.signup(userData);

      // For demo, just set the user after a delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      const newUser = {
        id: '1',
        email: userData.email,
        name: userData.name || userData.email.split('@')[0],
        profilePic: 'https://randomuser.me/api/portraits/men/32.jpg',
        // Add other user properties as needed
      };

      setUser(newUser);

      // Store auth data (in a real app)
      // await AsyncStorage.setItem('authToken', response.token);
      // await AsyncStorage.setItem('userData', JSON.stringify(newUser));

      return { success: true };
    } catch (error) {
      console.error('Signup error:', error);
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  const updateUser = async (userData) => {
    try {
      setUser(prev => ({ ...prev, ...userData }));

      // Update stored user data if needed
      // await AsyncStorage.setItem('userData', JSON.stringify({ ...user, ...userData }));

      return { success: true };
    } catch (error) {
      console.error('Update user error:', error);
      return { success: false, error: error.message };
    }
  };

  const value = {
    user,
    setUser,
    isLoading,
    login,
    logout,
    signup,
    updateUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};