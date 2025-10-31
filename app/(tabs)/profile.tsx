import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, Image, TouchableOpacity, 
  ScrollView, Modal, TouchableWithoutFeedback, Animated, useWindowDimensions,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import ShareModal from '../components/ShareModal';
import { useAuth } from '@/context/AuthContext';

// --- Hamburger Drawer Component (with proper safe area and close button) ---
const HamburgerDrawer = ({ visible, onClose }) => {
  const { width } = useWindowDimensions();
  const drawerWidth = width * 0.8;
  const slideAnim = useRef(new Animated.Value(-drawerWidth)).current;
  const { logout, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (visible) {
      Animated.timing(slideAnim, { toValue: 0, duration: 250, useNativeDriver: false }).start();
    } else {
      Animated.timing(slideAnim, { toValue: -drawerWidth, duration: 250, useNativeDriver: false }).start();
    }
  }, [visible, drawerWidth, slideAnim]);

// In your HamburgerDrawer component, update the handleLogout function:
const handleLogout = () => {
  Alert.alert(
    "Logout",
    "Are you sure you want to logout?",
    [
      {
        text: "Cancel",
        style: "cancel"
      },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          try {
            onClose(); // Close drawer first
            const result = await logout(); // Call logout from AuthContext

            if (!result.success) {
              Alert.alert("Error", result.error || "Failed to logout");
            }
          } catch (error) {
            console.error('Logout error:', error);
            Alert.alert("Error", "Failed to logout. Please try again.");
          }
        }
      }
    ]
  );
};

  const handleMenuItemPress = (itemName) => {
    onClose(); // Close drawer when any menu item is pressed

    switch(itemName) {
      case 'Settings & Privacy':
        router.push('/settings');
        break;
      case 'Your Activity':
        router.push('/activity');
        break;
      case 'Archived':
        router.push('/archived');
        break;
      case 'QR Code':
        router.push('/qr-code');
        break;
      case 'Saved':
        router.push('/saved');
        break;
      default:
        break;
    }
  };

  const menuItems = [
    { icon: 'settings-outline', name: 'Settings & Privacy' },
    { icon: 'time-outline', name: 'Your Activity' },
    { icon: 'archive-outline', name: 'Archived' },
    { icon: 'qr-code-outline', name: 'QR Code' },
    { icon: 'bookmark-outline', name: 'Saved' },
  ];

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.drawerOverlay}>
          <Animated.View style={[styles.drawerContainer, { width: drawerWidth, transform: [{ translateX: slideAnim }] }]}>
            <TouchableWithoutFeedback>
                <SafeAreaView style={{flex: 1}} edges={['right', 'left']}>
                    {/* Drawer Header with Close Button */}
                    <View style={styles.drawerHeader}>
                      <TouchableOpacity onPress={onClose} style={styles.headerButton}>
                        <Ionicons name="close" size={32} color="#333" />
                      </TouchableOpacity>
                    </View>

                    {/* User Info Section */}
                    <View style={styles.drawerUserInfo}>
                      <Image
                        source={{ uri: 'https://randomuser.me/api/portraits/men/32.jpg' }}
                        style={styles.drawerProfileImage}
                      />
                      <View style={styles.drawerUserDetails}>
                        <Text style={styles.drawerUserName}>{user?.name || 'Chandu'}</Text>
                        <Text style={styles.drawerUserEmail}>{user?.email || 'chandu@example.com'}</Text>
                      </View>
                    </View>

                    {/* Menu Items */}
                    <ScrollView style={styles.menuScrollView}>
                      {menuItems.map(item => (
                        <TouchableOpacity
                          key={item.name}
                          style={styles.drawerItem}
                          onPress={() => handleMenuItemPress(item.name)}
                        >
                          <Ionicons name={item.icon} size={24} color="#333" />
                          <Text style={styles.drawerItemText}>{item.name}</Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>

                    {/* Logout Button */}
                    <View style={styles.logoutContainer}>
                      <TouchableOpacity
                        onPress={handleLogout}
                        style={styles.logoutButton}
                      >
                        <Ionicons name="log-out-outline" size={24} color="#ff4444" />
                        <Text style={styles.logoutButtonText}>Logout</Text>
                      </TouchableOpacity>
                    </View>
                </SafeAreaView>
            </TouchableWithoutFeedback>
          </Animated.View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

// --- Main Profile Screen ---
export default function ProfileScreen() {
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [shareModalVisible, setShareModalVisible] = useState(false);
  const router = useRouter();
  const { user } = useAuth();

  const userData = {
      name: user?.name || 'Chandu',
      tagline: 'CrinzPing Enthusiast - "A crinz a day keeps the doctor away!"',
      profilePic: 'https://randomuser.me/api/portraits/men/32.jpg',
      languages: 'English,Telugu',
      profileId: 'chandu',
  };

  const handleEditProfile = () => {
      router.push({
          pathname: '/edit-profile',
          params: userData,
      });
  };

  const handleShareProfile = () => {
      setShareModalVisible(true);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Custom Header */}
      <View style={styles.customHeader}>
        <TouchableOpacity onPress={() => setDrawerVisible(true)} style={styles.headerButton}>
          <Ionicons name="menu-outline" size={32} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{userData.name}</Text>
        <TouchableOpacity onPress={handleShareProfile} style={styles.headerButton}>
          <Ionicons name="share-outline" size={28} color="#333" />
        </TouchableOpacity>
      </View>

      <HamburgerDrawer visible={drawerVisible} onClose={() => setDrawerVisible(false)} />

      <ScrollView style={styles.container}>
        <View style={styles.profileHeader}>
          <Image
            source={{ uri: userData.profilePic }}
            style={styles.profileImage}
          />
          <View style={styles.statsContainer}>
            <View style={styles.stat}><Text style={styles.statNumber}>12</Text><Text style={styles.statLabel}>Posts</Text></View>
            <View style={styles.stat}><Text style={styles.statNumber}>1.2M</Text><Text style={styles.statLabel}>Followers</Text></View>
            <View style={styles.stat}><Text style={styles.statNumber}>210</Text><Text style={styles.statLabel}>Following</Text></View>
          </View>
        </View>

        <View style={styles.userInfoSection}>
          <Text style={styles.tagline}>{userData.tagline}</Text>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.editButton} onPress={handleEditProfile}><Text style={styles.editButtonText}>Edit Profile</Text></TouchableOpacity>
          <TouchableOpacity style={styles.iconButton} onPress={handleShareProfile}><Ionicons name="share-social-outline" size={20} color="#333" /></TouchableOpacity>
        </View>

        <View style={styles.contentGrid}>
          <Text style={styles.gridPlaceholder}>User posts will appear here.</Text>
        </View>
      </ScrollView>

      <ShareModal
        isVisible={shareModalVisible}
        onClose={() => setShareModalVisible(false)}
        shareLink={`https://crinzping.com/profiles/${userData.profileId}`}
        title="Share Profile"
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
  container: { flex: 1 },
  customHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#333' },
  headerButton: { padding: 5 },
  drawerOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' },
  drawerContainer: {
    height: '100%',
    backgroundColor: 'white',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  drawerHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  drawerUserInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  drawerProfileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: '#4630EB',
  },
  drawerUserDetails: {
    marginLeft: 12,
    flex: 1,
  },
  drawerUserName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  drawerUserEmail: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  menuScrollView: {
    flex: 1,
  },
  drawerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  drawerItemText: {
    marginLeft: 15,
    fontSize: 16,
    fontWeight: '500',
    color: '#333'
  },
  logoutContainer: {
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    paddingVertical: 10,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
  },
  logoutButtonText: {
    marginLeft: 15,
    fontSize: 16,
    fontWeight: '500',
    color: '#ff4444'
  },
  profileHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  profileImage: { width: 80, height: 80, borderRadius: 40, borderWidth: 3, borderColor: '#4630EB' },
  statsContainer: { flexDirection: 'row', flex: 1, justifyContent: 'space-around', marginLeft: 10 },
  stat: { alignItems: 'center' },
  statNumber: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  statLabel: { fontSize: 12, color: 'gray', marginTop: 4 },
  userInfoSection: {
    paddingHorizontal: 20,
    paddingBottom: 10
  },
  tagline: { fontSize: 14, color: 'gray', lineHeight: 20 },
  buttonContainer: { flexDirection: 'row', paddingHorizontal: 20, paddingBottom: 15 },
  editButton: { flex: 1, backgroundColor: '#EFEFEF', paddingVertical: 10, borderRadius: 8, alignItems: 'center', marginRight: 8 },
  editButtonText: { fontSize: 14, fontWeight: 'bold', color: '#333' },
  iconButton: { backgroundColor: '#EFEFEF', padding: 10, borderRadius: 8 },
  contentGrid: { borderTopWidth: 1, borderTopColor: '#E0E0E0', padding: 16, alignItems: 'center', minHeight: 200 },
  gridPlaceholder: { fontSize: 16, color: 'gray' },
});