import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, TextInput, Switch, Alert,
  Modal, Animated, Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';

const PREFERRED_CATEGORIES = [
  'Technology', 'Food & Cooking', 'Travel', 'Art & Design', 'Sports', 'Music', 'Gaming', 'Science'
];

const PREFERRED_LANGUAGES = [
    'English', 'Telugu', 'Spanish', 'French', 'German', 'Mandarin', 'Hindi', 'Arabic'
];

// Media Action Sheet Component
const MediaActionSheet = ({ visible, onClose, onTakePhoto, onChooseFromGallery }) => {
  const slideAnim = useRef(new Animated.Value(300)).current;

  React.useEffect(() => {
    if (visible) {
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        damping: 20,
        stiffness: 300,
      }).start();
    } else {
      Animated.spring(slideAnim, {
        toValue: 300,
        useNativeDriver: true,
        damping: 20,
        stiffness: 300,
      }).start();
    }
  }, [visible, slideAnim]);

  if (!visible) return null;

  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity style={styles.actionSheetOverlay} activeOpacity={1} onPress={onClose}>
        <Animated.View style={[styles.actionSheetContainer, { transform: [{ translateY: slideAnim }] }]}>
          <View style={styles.actionSheetContent}>
            <View style={styles.actionSheetHandle} />
            <Text style={styles.actionSheetTitle}>Change Profile Photo</Text>

            <View style={styles.actionSheetButtons}>
              <TouchableOpacity style={styles.actionSheetButton} onPress={onTakePhoto}>
                <View style={[styles.actionSheetIcon, { backgroundColor: '#E3F2FD' }]}>
                  <Ionicons name="camera" size={24} color="#1976D2" />
                </View>
                <Text style={styles.actionSheetButtonText}>Take Photo</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionSheetButton} onPress={onChooseFromGallery}>
                <View style={[styles.actionSheetIcon, { backgroundColor: '#E8F5E8' }]}>
                  <Ionicons name="images" size={24} color="#388E3C" />
                </View>
                <Text style={styles.actionSheetButtonText}>Choose from Gallery</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </TouchableOpacity>
    </Modal>
  );
};

export default function EditProfileScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const [name, setName] = useState(params.name || 'Chandu');
  const [tagline, setTagline] = useState(params.tagline || '');
  const [profilePic, setProfilePic] = useState(params.profilePic || 'https://randomuser.me/api/portraits/men/32.jpg');
  const [roastNotifications, setRoastNotifications] = useState(true);
  const [preferredCategories, setPreferredCategories] = useState(new Set(['Technology', 'Food & Cooking']));
  const [preferredLanguages, setPreferredLanguages] = useState(new Set((params.languages || 'English,Telugu').split(',')));
  const [showMediaSheet, setShowMediaSheet] = useState(false);

  const takePhoto = async () => {
    setShowMediaSheet(false);

    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Camera permission required');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: 'images',
      allowsEditing: false, // No cropping
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setProfilePic(result.assets[0].uri);
    }
  };

  const selectFromGallery = async () => {
    setShowMediaSheet(false);

    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Gallery permission required');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'images',
      allowsEditing: false, // No cropping
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setProfilePic(result.assets[0].uri);
    }
  };

  const handleProfilePicPress = () => {
    setShowMediaSheet(true);
  };

  const toggleCategory = (category) => {
    const newCategories = new Set(preferredCategories);
    if (newCategories.has(category)) {
      newCategories.delete(category);
    } else {
      newCategories.add(category);
    }
    setPreferredCategories(newCategories);
  };

  const toggleLanguage = (language) => {
    const newLanguages = new Set(preferredLanguages);
    if (newLanguages.has(language)) {
        newLanguages.delete(language);
    } else {
        newLanguages.add(language);
    }
    setPreferredLanguages(newLanguages);
  };

  const handleSave = () => {
    // Save logic here
    console.log('Saving profile:', { name, tagline, profilePic, preferredCategories, preferredLanguages });
    router.back();
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerTitle: 'Edit Profile',
          headerRight: () => (
            <TouchableOpacity onPress={handleSave}>
              <Text style={styles.saveText}>Save</Text>
            </TouchableOpacity>
          ),
        }}
      />
      <SafeAreaView style={styles.safeArea} edges={['bottom', 'left', 'right']}>
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
          {/* Profile Picture Section */}
          <View style={styles.profilePicContainer}>
            <TouchableOpacity onPress={handleProfilePicPress} style={styles.profileImageWrapper}>
              <Image source={{ uri: profilePic }} style={styles.profileImage} />
              <View style={styles.cameraIconOverlay}>
                <Ionicons name="camera" size={24} color="white" />
              </View>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleProfilePicPress}>
              <Text style={styles.changePicText}>Change profile photo</Text>
            </TouchableOpacity>
          </View>

          {/* Basic Information Section */}
          <View style={styles.inputSection}>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Name</Text>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="Enter your name"
                placeholderTextColor="#999"
              />
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Tagline</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={tagline}
                onChangeText={setTagline}
                multiline
                numberOfLines={3}
                placeholder="Describe yourself in a few words..."
                placeholderTextColor="#999"
                textAlignVertical="top"
              />
            </View>
          </View>

          {/* Preferences Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Preferences</Text>
            <View style={styles.preferenceRow}>
              <View style={styles.preferenceInfo}>
                <Ionicons name="notifications-outline" size={24} color="#555" />
                <Text style={styles.preferenceText}>&ldquo;Roast&rdquo; Notifications</Text>
              </View>
              <Switch
                value={roastNotifications}
                onValueChange={setRoastNotifications}
                trackColor={{ false: '#E2E8F0', true: '#6366F1' }}
                thumbColor={roastNotifications ? '#FFFFFF' : '#F8FAFC'}
                ios_backgroundColor="#E2E8F0"
              />
            </View>
          </View>

          {/* Preferred Categories Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Preferred Categories</Text>
            <Text style={styles.sectionSubtitle}>Select categories to personalize your feed</Text>
            <View style={styles.categoriesContainer}>
              {PREFERRED_CATEGORIES.map(category => (
                <TouchableOpacity
                  key={category}
                  style={[
                    styles.categoryChip,
                    preferredCategories.has(category) && styles.categoryChipSelected
                  ]}
                  onPress={() => toggleCategory(category)}
                >
                  <Text style={[
                    styles.categoryChipText,
                    preferredCategories.has(category) && styles.categoryChipTextSelected
                  ]}>
                    {category}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Preferred Languages Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Preferred Languages</Text>
            <Text style={styles.sectionSubtitle}>Select languages for your content feed</Text>
            <View style={styles.categoriesContainer}>
              {PREFERRED_LANGUAGES.map(language => (
                <TouchableOpacity
                  key={language}
                  style={[
                    styles.categoryChip,
                    preferredLanguages.has(language) && styles.categoryChipSelected
                  ]}
                  onPress={() => toggleLanguage(language)}
                >
                  <Text style={[
                    styles.categoryChipText,
                    preferredLanguages.has(language) && styles.categoryChipTextSelected
                  ]}>
                    {language}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Bottom Spacing */}
          <View style={styles.bottomSpacing} />
        </ScrollView>

        {/* Media Action Sheet */}
        <MediaActionSheet
          visible={showMediaSheet}
          onClose={() => setShowMediaSheet(false)}
          onTakePhoto={takePhoto}
          onChooseFromGallery={selectFromGallery}
        />
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8F9FA'
  },
  container: {
    flex: 1
  },
  saveText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6366F1'
  },
  profilePicContainer: {
    alignItems: 'center',
    paddingVertical: 30,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    backgroundColor: '#FFFFFF'
  },
  profileImageWrapper: {
    position: 'relative',
    marginBottom: 15,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: '#F1F5F9'
  },
  cameraIconOverlay: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    backgroundColor: '#6366F1',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  changePicText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6366F1'
  },
  inputSection: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    marginBottom: 10,
  },
  inputContainer: {
    marginBottom: 20
  },
  label: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '600',
    marginBottom: 8
  },
  input: {
    fontSize: 16,
    padding: 12,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    color: '#1E293B',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  section: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 5
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 20
  },
  preferenceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  preferenceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  preferenceText: {
    fontSize: 16,
    color: '#334155',
    marginLeft: 15,
    flex: 1
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  categoryChip: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    backgroundColor: '#F1F5F9',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  categoryChipSelected: {
    backgroundColor: '#6366F1',
    borderColor: '#6366F1',
  },
  categoryChipText: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  categoryChipTextSelected: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  bottomSpacing: {
    height: 20,
  },
  // Media Action Sheet Styles
  actionSheetOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-end',
  },
  actionSheetContainer: {
    backgroundColor: 'transparent',
  },
  actionSheetContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 8,
    paddingBottom: Platform.OS === 'ios' ? 34 : 24,
  },
  actionSheetHandle: {
    width: 36,
    height: 4,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  actionSheetTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    textAlign: 'center',
    marginBottom: 24,
  },
  actionSheetButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  actionSheetButton: {
    alignItems: 'center',
    padding: 16,
  },
  actionSheetIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionSheetButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1A1A1A',
  },
  cancelButton: {
    backgroundColor: '#F8F9FA',
    marginHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4630EB',
  },
});