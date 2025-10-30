import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, useWindowDimensions, TextInput,
  TouchableOpacity, Modal, ScrollView, Image, Alert, Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TabView, TabBar } from 'react-native-tab-view';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as VideoThumbnails from 'expo-video-thumbnails';
import * as DocumentPicker from 'expo-document-picker';
import { useAudioPlayer } from 'expo-audio';
import { useVideoPlayer, VideoView } from 'expo-video';
import * as MediaLibrary from 'expo-media-library';

// Permission management
class PermissionManager {
  static async ensureMediaPermissions() {
    try {
      const { status: mediaStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (mediaStatus !== 'granted') {
        Alert.alert(
          'Media Access Required',
          'This app needs access to your media library to select photos and videos.',
          [{ text: 'OK' }]
        );
        return false;
      }

      if (Platform.OS === 'ios') {
        const { status: mediaLibraryStatus } = await MediaLibrary.requestPermissionsAsync();
        if (mediaLibraryStatus !== 'granted') {
          Alert.alert(
            'Media Library Access',
            'Access to your media library is needed to select videos.',
            [{ text: 'OK' }]
          );
          return false;
        }
      }

      return true;
    } catch (error) {
      console.error('Permission error:', error);
      return false;
    }
  }
}

// --- Crinz Scene ---
const CrinzScene = ({ onPost, resetToken }) => {
  const [message, setMessage] = useState('');
  const [tags, setTags] = useState('');

  useEffect(() => {
    setMessage('');
    setTags('');
  }, [resetToken]);

  const handlePreview = () => {
    if (!message.trim()) {
      Alert.alert('Message Required', 'Please enter your crinz message');
      return;
    }
    onPost('Crinz', { message: message.trim(), tags: tags.trim() });
  };

  return (
    <ScrollView style={styles.sceneContainer}>
      <View style={styles.section}>
        <Text style={styles.fieldLabel}>
          Message <Text style={styles.required}>*</Text>
        </Text>
        <TextInput
          style={styles.textInput}
          placeholder="What's on your crinz mind? Share your thoughts..."
          multiline
          value={message}
          onChangeText={setMessage}
          placeholderTextColor="#999"
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.fieldLabel}>Tags</Text>
        <TextInput
          style={styles.tagInput}
          placeholder="#crinz #funny #daily #thoughts"
          value={tags}
          onChangeText={setTags}
          placeholderTextColor="#999"
        />
      </View>

      <TouchableOpacity style={styles.postButton} onPress={handlePreview}>
        <Text style={styles.postButtonText}>Preview Post</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

// --- Post Scene ---
const PostScene = ({ onPost, resetToken }) => {
  const [desc, setDesc] = useState('');
  const [tags, setTags] = useState('');
  const [images, setImages] = useState([]);
  const [audio, setAudio] = useState(null);

  useEffect(() => {
    setDesc('');
    setTags('');
    setImages([]);
    setAudio(null);
  }, [resetToken]);

  const handleImageSelect = async () => {
    const hasPermission = await PermissionManager.ensureMediaPermissions();
    if (!hasPermission) return;

    try {
      const remainingSlots = 5 - images.length;
      if (remainingSlots <= 0) {
        Alert.alert('Limit Reached', 'You can only select up to 5 images');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsMultipleSelection: true,
        selectionLimit: remainingSlots,
        quality: 0.8,
        aspect: [4, 3],
      });

      if (!result.canceled && result.assets?.length > 0) {
        const newImages = result.assets.map((a) => a.uri);
        setImages(prev => [...prev, ...newImages]);
      }
    } catch (error) {
      console.error('Error selecting images:', error);
      Alert.alert('Error', 'Failed to select images');
    }
  };

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleAudioSelect = async () => {
    try {
      if (audio) {
        setAudio(null);
        return;
      }

      const result = await DocumentPicker.getDocumentAsync({
        type: ['audio/*']
      });

      if (!result.canceled && result.assets?.[0]) {
        const audioFile = result.assets[0];
        setAudio({
          name: audioFile.name || 'Audio file',
          uri: audioFile.uri,
          size: audioFile.size,
          mimeType: audioFile.mimeType
        });
      }
    } catch (error) {
      console.error('Error selecting audio:', error);
      Alert.alert('Error', 'Failed to select audio file');
    }
  };

  const handlePreview = () => {
    if (!desc.trim() && images.length === 0) {
      Alert.alert('Content Required', 'Please add a description or at least one image');
      return;
    }

    onPost('Post', {
      desc: desc.trim(),
      tags: tags.trim(),
      images,
      audio
    });
  };

  return (
    <ScrollView style={styles.sceneContainer}>
      <View style={styles.section}>
        <Text style={styles.fieldLabel}>
          Description <Text style={styles.required}>*</Text>
          <Text style={styles.optional}>(or add images below)</Text>
        </Text>
        <TextInput
          style={styles.textArea}
          placeholder="Share your story, thoughts, or inspiration..."
          value={desc}
          onChangeText={setDesc}
          multiline
          numberOfLines={4}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.fieldLabel}>Tags</Text>
        <TextInput
          style={styles.tagInput}
          placeholder="#inspiration #daily #motivation #life"
          value={tags}
          onChangeText={setTags}
        />
      </View>

      <View style={styles.section}>
        <View style={styles.fieldHeader}>
          <Text style={styles.fieldLabel}>Media</Text>
          <Text style={styles.counter}>({images.length}/5)</Text>
        </View>
        <Text style={styles.fieldSubtitle}>Add up to 5 images to your post</Text>

        <ScrollView horizontal style={styles.imagePreviewContainer} showsHorizontalScrollIndicator={false}>
          {images.map((uri, index) => (
            <View key={`${uri}-${index}`} style={styles.thumbnailContainer}>
              <Image source={{ uri }} style={styles.thumbnail} />
              <TouchableOpacity style={styles.removeImageButton} onPress={() => removeImage(index)}>
                <Ionicons name="close-circle" size={20} color="#ff4444" />
              </TouchableOpacity>
            </View>
          ))}
          {images.length < 5 && (
            <TouchableOpacity style={styles.addThumbnailButton} onPress={handleImageSelect}>
              <Ionicons name="add" size={32} color="#888" />
              <Text style={styles.addThumbnailText}>Add Image</Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      </View>

      <View style={styles.section}>
        <Text style={styles.fieldLabel}>
          Audio <Text style={styles.optional}>(optional)</Text>
        </Text>
        <Text style={styles.fieldSubtitle}>Add background audio to your post</Text>

        <TouchableOpacity
          style={[styles.audioSelector, audio && styles.audioSelected]}
          onPress={handleAudioSelect}
        >
          <Ionicons name="musical-notes-outline" size={24} color={audio ? '#4630EB' : '#555'} />
          <View style={styles.audioInfo}>
            <Text style={[styles.audioSelectorText, audio && { color: '#4630EB' }]}>
              {audio ? audio.name : 'Select audio file'}
            </Text>
            {audio && (
              <Text style={styles.audioFileSize}>
                {Math.round((audio.size || 0) / 1024)} KB
              </Text>
            )}
          </View>
          {audio ? (
            <TouchableOpacity onPress={() => setAudio(null)}>
              <Ionicons name="close-circle" size={24} color="#4630EB" />
            </TouchableOpacity>
          ) : (
            <Ionicons name="chevron-forward" size={20} color="#999" />
          )}
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.postButton} onPress={handlePreview}>
        <Text style={styles.postButtonText}>Preview Post</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

// --- Reel Scene ---
const ReelScene = ({ onPost, resetToken }) => {
  const [desc, setDesc] = useState('');
  const [tags, setTags] = useState('');
  const [reelUri, setReelUri] = useState(null);
  const [thumbnailUri, setThumbnailUri] = useState(null);

  useEffect(() => {
    setDesc('');
    setTags('');
    setReelUri(null);
    setThumbnailUri(null);
  }, [resetToken]);

  const handleVideoSelect = async () => {
    const hasPermission = await PermissionManager.ensureMediaPermissions();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['videos'],
        videoMaxDuration: 60,
        quality: 0.8,
        aspect: [9, 16],
      });

      if (!result.canceled && result.assets?.[0]) {
        const videoUri = result.assets[0].uri;
        setReelUri(videoUri);

        try {
          const { uri } = await VideoThumbnails.getThumbnailAsync(videoUri, {
            time: 1000,
            quality: 0.8
          });
          setThumbnailUri(uri);
        } catch (e) {
          console.warn('Thumbnail generation failed', e);
          setThumbnailUri(null);
        }
      }
    } catch (error) {
      console.error('Error selecting video:', error);
      Alert.alert('Error', 'Failed to select video');
    }
  };

  const handleThumbnailSelect = async () => {
    const hasPermission = await PermissionManager.ensureMediaPermissions();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images']
      });

      if (!result.canceled && result.assets?.[0]) {
        setThumbnailUri(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error selecting thumbnail:', error);
      Alert.alert('Error', 'Failed to select thumbnail');
    }
  };

  const handlePreview = () => {
    if (!reelUri) {
      Alert.alert('Video Required', 'Please select a video for your reel');
      return;
    }

    onPost('Reel', {
      desc: desc.trim(),
      tags: tags.trim(),
      reelUri,
      thumbnailUri: thumbnailUri || 'default'
    });
  };

  return (
    <ScrollView style={styles.sceneContainer}>
      <View style={styles.section}>
        <Text style={styles.fieldLabel}>
          Video <Text style={styles.required}>*</Text>
        </Text>
        <Text style={styles.fieldSubtitle}>Select a video for your reel (max 60 seconds)</Text>

        <TouchableOpacity style={styles.videoSelector} onPress={handleVideoSelect}>
          {reelUri ? (
            <View style={styles.videoSelected}>
              <Ionicons name="checkmark-circle" size={32} color="#4630EB" />
              <Text style={styles.videoSelectedText}>Video Selected</Text>
              <Text style={styles.videoChangeText}>Tap to change video</Text>
            </View>
          ) : (
            <View style={styles.videoPlaceholder}>
              <Ionicons name="videocam-outline" size={48} color="#AAA" />
              <Text style={styles.videoPlaceholderText}>Select Video</Text>
              <Text style={styles.videoPlaceholderSubtext}>Choose from your gallery</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.fieldLabel}>
          Thumbnail <Text style={styles.optional}>(optional)</Text>
        </Text>
        <Text style={styles.fieldSubtitle}>Custom thumbnail for your reel</Text>

        <View style={styles.thumbnailSection}>
          <View style={styles.thumbnailPreview}>
            {thumbnailUri ? (
              <Image source={{ uri: thumbnailUri }} style={styles.customThumbnail} />
            ) : reelUri ? (
              <View style={styles.autoThumbnail}>
                <Ionicons name="image-outline" size={32} color="#666" />
                <Text style={styles.autoThumbnailText}>Auto-generated</Text>
              </View>
            ) : (
              <View style={styles.noThumbnail}>
                <Ionicons name="image-outline" size={32} color="#CCC" />
                <Text style={styles.noThumbnailText}>No video selected</Text>
              </View>
            )}
          </View>

          <TouchableOpacity
            style={[styles.thumbnailButton, !reelUri && styles.thumbnailButtonDisabled]}
            onPress={handleThumbnailSelect}
            disabled={!reelUri}
          >
            <Ionicons name="image-outline" size={20} color={!reelUri ? '#AAA' : '#4630EB'} />
            <Text style={[styles.thumbnailButtonText, !reelUri && { color: '#AAA' }]}>
              Custom Thumbnail
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.fieldLabel}>
          Description <Text style={styles.required}>*</Text>
        </Text>
        <TextInput
          style={styles.textArea}
          placeholder="Describe your reel, add context or hashtags..."
          value={desc}
          onChangeText={setDesc}
          multiline
          numberOfLines={3}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.fieldLabel}>Tags</Text>
        <TextInput
          style={styles.tagInput}
          placeholder="#reel #funny #trending #viral"
          value={tags}
          onChangeText={setTags}
        />
      </View>

      <TouchableOpacity
        style={[styles.postButton, !reelUri && styles.postButtonDisabled]}
        onPress={handlePreview}
        disabled={!reelUri}
      >
        <Text style={styles.postButtonText}>Preview Reel</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

// --- Preview Modal ---
const FinalPreviewModal = ({ visible, onClose, onConfirm, content }) => {
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [videoKey, setVideoKey] = useState(0);

  const audioPlayer = useAudioPlayer(
    content?.audio?.uri ? { uri: content.audio.uri } : null,
    { updateInterval: 100, downloadFirst: true }
  );

  const videoPlayer = useVideoPlayer(
    content?.reelUri ? { uri: content.reelUri } : null
  );

  const stopAllMedia = useCallback(async () => {
    try {
      if (audioPlayer && content?.audio?.uri) {
        audioPlayer.pause();
        setIsPlayingAudio(false);
      }
      if (videoPlayer && content?.reelUri) {
        try {
          videoPlayer.pause();
        } catch (videoError) {
          console.log('Video player already released');
        }
      }
    } catch (error) {
      console.error('Error stopping media:', error);
    }
  }, [audioPlayer, videoPlayer, content?.audio?.uri, content?.reelUri]);

  const handleClose = useCallback(async () => {
    await stopAllMedia();
    setVideoKey(prev => prev + 1);
    onClose();
  }, [stopAllMedia, onClose]);

  const handleConfirm = useCallback(async () => {
    await stopAllMedia();
    setVideoKey(prev => prev + 1);
    onConfirm();
  }, [stopAllMedia, onConfirm]);

  const playAudio = async () => {
    try {
      if (!audioPlayer || !content?.audio?.uri) return;

      if (isPlayingAudio) {
        audioPlayer.pause();
        setIsPlayingAudio(false);
      } else {
        audioPlayer.play();
        setIsPlayingAudio(true);
      }
    } catch (error) {
      console.error('Error playing audio:', error);
      Alert.alert('Audio Error', 'Could not play the audio file');
    }
  };

  useEffect(() => {
    if (visible && content?.reelUri) {
      setVideoKey(prev => prev + 1);
    }
  }, [visible, content?.reelUri]);

  useEffect(() => {
    if (!visible) {
      stopAllMedia();
    }
  }, [visible, stopAllMedia]);

  useEffect(() => {
    return () => {
      stopAllMedia();
    };
  }, [stopAllMedia]);

  useEffect(() => {
    setIsPlayingAudio(false);
  }, [content?.audio?.uri]);

  if (!visible || !content) return null;

  return (
    <Modal visible={visible} onRequestClose={handleClose} animationType="slide">
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.previewHeader}>
          <Text style={styles.previewTitle}>Final Preview</Text>
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#333" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.previewContainer}>
          {content.type === 'Reel' && content.reelUri && (
            <View style={styles.section}>
              <Text style={styles.previewSectionTitle}>Video Preview</Text>
              <VideoView
                key={`video-${videoKey}`}
                player={videoPlayer}
                style={styles.previewVideo}
                fullscreenOptions={{ visible: true }}
                allowsPictureInPicture
                nativeControls
              />
            </View>
          )}

          {content.type === 'Post' && content.images?.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.previewSectionTitle}>Images ({content.images.length})</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {content.images.map((uri, index) => (
                  <Image key={`${uri}-${index}`} source={{ uri }} style={styles.previewThumbnail} />
                ))}
              </ScrollView>
            </View>
          )}

          {content.type === 'Post' && content.audio && audioPlayer && (
            <View style={styles.section}>
              <Text style={styles.previewSectionTitle}>Audio</Text>
              <TouchableOpacity style={styles.previewAudioPlayer} onPress={playAudio}>
                <Ionicons
                  name={isPlayingAudio ? 'pause-circle' : 'play-circle'}
                  size={36}
                  color="#4630EB"
                />
                <View style={styles.previewAudioInfo}>
                  <Text style={styles.previewAudioName}>{content.audio.name}</Text>
                  <Text style={styles.previewAudioStatus}>
                    {isPlayingAudio ? 'Playing...' : 'Tap to play'}
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.section}>
            <Text style={styles.previewSectionTitle}>
              {content.type === 'Crinz' ? 'Message' : 'Description'}
            </Text>
            <Text style={styles.previewText}>
              {content.desc || content.message || 'No description provided'}
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.previewSectionTitle}>Tags</Text>
            <Text style={styles.previewTags}>
              {content.tags || 'No tags added'}
            </Text>
          </View>
        </ScrollView>

        <View style={styles.previewFooter}>
          <TouchableOpacity style={styles.cancelButton} onPress={handleClose}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.confirmButton} onPress={handleConfirm}>
            <Text style={styles.confirmButtonText}>Post Now</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

// --- Main Component ---
export default function AddScreen() {
  const layout = useWindowDimensions();
  const [index, setIndex] = useState(0);
  const [routes] = useState([
    { key: 'crinz', title: 'Crinz' },
    { key: 'post', title: 'Post' },
    { key: 'reel', title: 'Reel' }
  ]);
  const [previewModalVisible, setPreviewModalVisible] = useState(false);
  const [previewContent, setPreviewContent] = useState(null);
  const [toastVisible, setToastVisible] = useState(false);
  const [resetToken, setResetToken] = useState(0);

  useEffect(() => {
    PermissionManager.ensureMediaPermissions();
  }, []);

  const handlePreview = (type, content) => {
    setPreviewContent({ type, ...content });
    setPreviewModalVisible(true);
  };

  const handleConfirmPost = () => {
    setPreviewModalVisible(false);
    console.log('✅ Submitted:', previewContent.type, previewContent);
    setToastVisible(true);
    setTimeout(() => {
      setToastVisible(false);
      setResetToken((p) => p + 1);
    }, 2000);
  };

  const renderScene = useCallback(({ route }) => {
    switch (route.key) {
      case 'crinz':
        return <CrinzScene key={`crinz-${resetToken}`} onPost={handlePreview} resetToken={resetToken} />;
      case 'post':
        return <PostScene key={`post-${resetToken}`} onPost={handlePreview} resetToken={resetToken} />;
      case 'reel':
        return <ReelScene key={`reel-${resetToken}`} onPost={handlePreview} resetToken={resetToken} />;
      default: return null;
    }
  }, [resetToken]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <TabView
        navigationState={{ index, routes }}
        renderScene={renderScene}
        onIndexChange={setIndex}
        initialLayout={{ width: layout.width }}
        renderTabBar={(props) => (
          <TabBar
            {...props}
            indicatorStyle={styles.indicator}
            style={styles.tabBar}
            labelStyle={styles.label}
            activeColor="#4630EB"
            inactiveColor="#666"
          />
        )}
      />

      <FinalPreviewModal
        visible={previewModalVisible}
        onClose={() => setPreviewModalVisible(false)}
        onConfirm={handleConfirmPost}
        content={previewContent}
      />

      <Modal transparent visible={toastVisible} animationType="fade">
        <View style={styles.toastContainer}>
          <View style={styles.toastContent}>
            <Ionicons name="checkmark-circle" size={24} color="white" />
            <Text style={styles.toastText}>Posted Successfully!</Text>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// --- Styles ---
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: 'white' },
  sceneContainer: { flex: 1, backgroundColor: '#FFFFFF' },
  tabBar: { backgroundColor: 'white', borderBottomWidth: 1, borderBottomColor: '#E8E8E8', elevation: 0 },
  indicator: { backgroundColor: '#4630EB', height: 3, borderRadius: 1.5 },
  label: { fontWeight: '600', fontSize: 14, textTransform: 'none', margin: 0 },

  section: { padding: 20, borderBottomWidth: 1, borderBottomColor: '#F5F5F5' },
  fieldHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  fieldLabel: { fontSize: 16, fontWeight: '600', color: '#333', marginBottom: 8 },
  fieldSubtitle: { fontSize: 14, color: '#666', marginBottom: 12 },
  required: { color: '#FF3B30', fontSize: 16 },
  optional: { color: '#666', fontSize: 14, fontWeight: 'normal' },
  counter: { fontSize: 14, color: '#666', fontWeight: 'normal' },

  // Input styles
  textInput: {
    height: 120,
    textAlignVertical: 'top',
    fontSize: 16,
    padding: 16,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E9ECEF',
    color: '#333',
  },
  textArea: {
    textAlignVertical: 'top',
    fontSize: 16,
    padding: 16,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E9ECEF',
    color: '#333',
    minHeight: 100,
  },
  tagInput: {
    height: 50,
    fontSize: 16,
    paddingHorizontal: 16,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E9ECEF',
    color: '#333',
  },

  // Button styles
  postButton: {
    backgroundColor: '#4630EB',
    paddingVertical: 16,
    margin: 20,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#4630EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  postButtonDisabled: {
    backgroundColor: '#CCC',
    shadowColor: 'transparent',
  },
  postButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },

  // Image styles
  imagePreviewContainer: {
    minHeight: 100,
  },
  thumbnailContainer: {
    position: 'relative',
    marginRight: 12,
  },
  thumbnail: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  removeImageButton: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: 'white',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  addThumbnailButton: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#F8F9FA',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E9ECEF',
    borderStyle: 'dashed',
  },
  addThumbnailText: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    textAlign: 'center',
  },

  // Audio selector
  audioSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E9ECEF',
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#F8F9FA',
  },
  audioSelected: {
    borderColor: '#4630EB',
    backgroundColor: '#F0F4FF',
  },
  audioInfo: {
    flex: 1,
    marginLeft: 12,
  },
  audioSelectorText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  audioFileSize: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },

  // Reel styles
  videoSelector: {
    height: 160,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderWidth: 2,
    borderColor: '#E9ECEF',
    borderStyle: 'dashed',
  },
  videoSelected: {
    alignItems: 'center',
  },
  videoSelectedText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4630EB',
    marginTop: 8,
  },
  videoChangeText: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  videoPlaceholder: {
    alignItems: 'center',
  },
  videoPlaceholderText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginTop: 8,
  },
  videoPlaceholderSubtext: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },

  // Thumbnail section
  thumbnailSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  thumbnailPreview: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#F8F9FA',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  customThumbnail: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  autoThumbnail: {
    alignItems: 'center',
  },
  autoThumbnailText: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    textAlign: 'center',
  },
  noThumbnail: {
    alignItems: 'center',
  },
  noThumbnailText: {
    fontSize: 12,
    color: '#CCC',
    marginTop: 4,
    textAlign: 'center',
  },
  thumbnailButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  thumbnailButtonDisabled: {
    opacity: 0.5,
  },
  thumbnailButtonText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#4630EB',
    fontWeight: '500',
  },

  // Preview Modal styles
  modalContainer: { flex: 1, backgroundColor: '#FFFFFF' },
  previewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E8E8E8',
  },
  previewTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  closeButton: {
    padding: 4,
  },
  previewContainer: {
    flex: 1,
  },
  previewSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  previewVideo: {
    width: '100%',
    height: 300,
    backgroundColor: '#000',
    borderRadius: 12,
  },
  previewThumbnail: {
    width: 120,
    height: 120,
    borderRadius: 8,
    marginRight: 12,
  },
  previewAudioPlayer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  previewAudioInfo: {
    flex: 1,
    marginLeft: 12,
  },
  previewAudioName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  previewAudioStatus: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  previewText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
    backgroundColor: '#F8F9FA',
    padding: 16,
    borderRadius: 8,
  },
  previewTags: {
    fontSize: 16,
    color: '#666',
    fontStyle: 'italic',
    backgroundColor: '#F8F9FA',
    padding: 16,
    borderRadius: 8,
  },
  previewFooter: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E8E8E8',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E9ECEF',
    backgroundColor: 'white',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#666',
  },
  confirmButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: '#4630EB',
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: 'white',
  },

  // Toast styles
  toastContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)'
  },
  toastContent: {
    flexDirection: 'row',
    backgroundColor: '#333',
    borderRadius: 25,
    padding: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  toastText: {
    color: 'white',
    fontWeight: '600',
    marginLeft: 8,
    fontSize: 16,
  },
});