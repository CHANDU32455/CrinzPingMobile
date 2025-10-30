import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList, TextInput,
  TouchableOpacity, KeyboardAvoidingView, Platform, Image,
  Modal, Dimensions, Alert, Animated, Keyboard
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useAudioRecorder, useAudioPlayer, AudioModule, RecordingPresets } from 'expo-audio';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Mock Data for a single chat
const MESSAGES = [
  { id: '1', text: 'Hey! 👋', sender: 'other', type: 'text', timestamp: new Date(Date.now() - 300000) },
  { id: '2', text: 'Hi, how are you?', sender: 'me', type: 'text', timestamp: new Date(Date.now() - 240000) },
  { id: '3', text: 'Doing great, thanks! You?', sender: 'other', type: 'text', timestamp: new Date(Date.now() - 180000) },
  { id: '4', text: 'Not too bad. That last crinz was hilarious 😂', sender: 'me', type: 'text', timestamp: new Date(Date.now() - 120000) },
];

const MessageBubble = ({ message, onImagePress }) => {
  const isMyMessage = message.sender === 'me';

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  return (
    <View style={[styles.messageRow, { justifyContent: isMyMessage ? 'flex-end' : 'flex-start' }]}>
      <View style={[
        styles.messageBubble,
        isMyMessage ? styles.myBubble : styles.otherBubble,
        message.type === 'image' && styles.imageBubble
      ]}>
        {message.type === 'image' ? (
          <TouchableOpacity onPress={() => onImagePress(message.uri)}>
            <Image source={{ uri: message.uri }} style={styles.chatImage} />
          </TouchableOpacity>
        ) : (
          <Text style={isMyMessage ? styles.myText : styles.otherText}>
            {message.text}
          </Text>
        )}
        <Text style={[
          styles.timestamp,
          isMyMessage ? styles.myTimestamp : styles.otherTimestamp
        ]}>
          {formatTime(message.timestamp)}
        </Text>
      </View>
    </View>
  );
};

const MediaActionSheet = ({ visible, onClose, onTakePhoto, onChooseFromGallery }) => {
  const slideAnim = useRef(new Animated.Value(300)).current;

  useEffect(() => {
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
  }, [visible]);

  if (!visible) return null;

  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity style={styles.actionSheetOverlay} activeOpacity={1} onPress={onClose}>
        <Animated.View style={[styles.actionSheetContainer, { transform: [{ translateY: slideAnim }] }]}>
          <View style={styles.actionSheetContent}>
            <View style={styles.actionSheetHandle} />
            <Text style={styles.actionSheetTitle}>Share Media</Text>

            <View style={styles.actionSheetButtons}>
              <TouchableOpacity style={styles.actionSheetButton} onPress={onTakePhoto}>
                <View style={[styles.actionSheetIcon, { backgroundColor: '#E3F2FD' }]}>
                  <Ionicons name="camera" size={24} color="#1976D2" />
                </View>
                <Text style={styles.actionSheetButtonText}>Camera</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionSheetButton} onPress={onChooseFromGallery}>
                <View style={[styles.actionSheetIcon, { backgroundColor: '#E8F5E8' }]}>
                  <Ionicons name="images" size={24} color="#388E3C" />
                </View>
                <Text style={styles.actionSheetButtonText}>Gallery</Text>
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

const ImagePreviewModal = ({ visible, imageUri, onClose }) => {
  if (!visible || !imageUri) return null;

  return (
    <Modal transparent visible={visible} animationType="fade" statusBarTranslucent>
      <SafeAreaView style={styles.imagePreviewOverlay}>
        <TouchableOpacity style={styles.imageCloseArea} activeOpacity={1} onPress={onClose}>
          <Ionicons name="close" size={28} color="white" style={styles.closeIcon} />
        </TouchableOpacity>

        <Image source={{ uri: imageUri }} style={styles.fullScreenImage} resizeMode="contain" />
      </SafeAreaView>
    </Modal>
  );
};

const AudioRecorder = ({ onRecordingComplete, onCancel }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const durationRef = useRef(0);

  // Use expo-audio recorder
  const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);

  useEffect(() => {
    let interval;
    if (isRecording) {
      interval = setInterval(() => {
        durationRef.current += 1;
        setRecordingDuration(durationRef.current);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  const startRecording = async () => {
    try {
      const status = await AudioModule.requestRecordingPermissionsAsync();
      if (!status.granted) {
        Alert.alert('Microphone permission required');
        return;
      }

      await audioRecorder.prepareToRecordAsync();
      audioRecorder.record();
      setIsRecording(true);
      durationRef.current = 0;
      setRecordingDuration(0);
    } catch (err) {
      Alert.alert('Failed to start recording');
    }
  };

  const stopRecording = async () => {
    try {
      await audioRecorder.stop();
      setIsRecording(false);

      if (audioRecorder.uri && durationRef.current > 1) {
        onRecordingComplete(audioRecorder.uri, durationRef.current);
      } else {
        onCancel();
      }
    } catch (err) {
      Alert.alert('Failed to stop recording');
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <View style={styles.audioRecorderContainer}>
      {!isRecording ? (
        <TouchableOpacity style={styles.startRecordButton} onPress={startRecording}>
          <Ionicons name="mic" size={24} color="#4630EB" />
          <Text style={styles.startRecordText}>Tap to Record</Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.recordingContainer}>
          <View style={styles.recordingIndicator}>
            <View style={styles.recordingPulse} />
            <Text style={styles.recordingTimer}>{formatTime(recordingDuration)}</Text>
          </View>
          <TouchableOpacity style={styles.stopRecordButton} onPress={stopRecording}>
            <Ionicons name="stop" size={20} color="white" />
            <Text style={styles.stopRecordText}>Stop</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const AudioPreview = ({ audioUri, duration, onSend, onCancel }) => {
  const [isPlaying, setIsPlaying] = useState(false);

  // Use expo-audio player
  const audioPlayer = useAudioPlayer(
    { uri: audioUri },
    {
      updateInterval: 100,
      downloadFirst: true
    }
  );

  const playSound = async () => {
    try {
      if (isPlaying) {
        audioPlayer.pause();
        setIsPlaying(false);
      } else {
        audioPlayer.play();
        setIsPlaying(true);
      }
    } catch (err) {
      Alert.alert('Failed to play audio');
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <View style={styles.audioPreviewContainer}>
      <TouchableOpacity style={styles.audioPreviewPlayer} onPress={playSound}>
        <Ionicons name={isPlaying ? "pause-circle" : "play-circle"} size={32} color="#4630EB" />
        <View style={styles.audioPreviewInfo}>
          <Text style={styles.audioPreviewDuration}>{formatTime(duration)}</Text>
          <View style={styles.audioWave}>
            <View style={[styles.audioWaveBar, { width: isPlaying ? '80%' : '60%' }]} />
          </View>
        </View>
      </TouchableOpacity>

      <View style={styles.audioPreviewActions}>
        <TouchableOpacity style={styles.cancelAudioButton} onPress={onCancel}>
          <Ionicons name="close" size={20} color="#FF3B30" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.sendAudioButton} onPress={onSend}>
          <Ionicons name="send" size={20} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default function ChatScreen() {
  const router = useRouter();
  const [messages, setMessages] = useState(MESSAGES);
  const [inputText, setInputText] = useState('');
  const [showMediaSheet, setShowMediaSheet] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedAudio, setRecordedAudio] = useState(null);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const flatListRef = useRef(null);
  const inputRef = useRef(null);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  // Improved keyboard handling
  useEffect(() => {
    const keyboardWillShow = (e) => {
      setKeyboardHeight(e.endCoordinates.height);
      // Scroll to bottom when keyboard appears
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    };

    const keyboardWillHide = () => {
      setKeyboardHeight(0);
    };

    if (Platform.OS === 'ios') {
      const showSubscription = Keyboard.addListener('keyboardWillShow', keyboardWillShow);
      const hideSubscription = Keyboard.addListener('keyboardWillHide', keyboardWillHide);

      return () => {
        showSubscription.remove();
        hideSubscription.remove();
      };
    } else {
      const showSubscription = Keyboard.addListener('keyboardDidShow', keyboardWillShow);
      const hideSubscription = Keyboard.addListener('keyboardDidHide', keyboardWillHide);

      return () => {
        showSubscription.remove();
        hideSubscription.remove();
      };
    }
  }, []);

  // Improved auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 150);
    }
  }, [messages.length]);

  const handleSend = () => {
    if (!inputText.trim()) return;

    const newMessage = {
      id: Date.now().toString(),
      text: inputText.trim(),
      sender: 'me',
      type: 'text',
      timestamp: new Date()
    };

    setInputText('');
    setMessages(prev => [...prev, newMessage]);

    // Focus input after sending
    inputRef.current?.focus();
  };

  const takePhoto = async () => {
    setShowMediaSheet(false);

    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Camera permission required');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: 'images',
      allowsEditing: false,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      const newMessage = {
        id: Date.now().toString(),
        uri: result.assets[0].uri,
        sender: 'me',
        type: 'image',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, newMessage]);
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
      allowsEditing: false,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      const newMessage = {
        id: Date.now().toString(),
        uri: result.assets[0].uri,
        sender: 'me',
        type: 'image',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, newMessage]);
    }
  };

  const handleImagePress = (imageUri) => {
    setPreviewImage(imageUri);
  };

  const handleImagePreviewClose = () => {
    setPreviewImage(null);
  };

  const handleRecordingComplete = (audioUri, duration) => {
    setRecordedAudio(audioUri);
    setRecordingDuration(duration);
    setIsRecording(false);
  };

  const handleRecordingCancel = () => {
    setIsRecording(false);
    setRecordedAudio(null);
  };

  const sendAudioMessage = () => {
    const newMessage = {
      id: Date.now().toString(),
      uri: recordedAudio,
      sender: 'me',
      type: 'audio',
      duration: recordingDuration,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, newMessage]);
    setRecordedAudio(null);
    setRecordingDuration(0);
  };

  const cancelAudioMessage = () => {
    setRecordedAudio(null);
    setRecordingDuration(0);
  };

  const startRecording = () => {
    setIsRecording(true);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: () => (
            <View style={styles.headerContent}>
              <View style={styles.avatar} />
              <View style={styles.headerText}>
                <Text style={styles.headerTitle}>Alex Johnson</Text>
                <Text style={styles.headerStatus}>Online</Text>
              </View>
            </View>
          ),
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
              <Ionicons name="chevron-back" size={24} color="#333" />
            </TouchableOpacity>
          ),
          headerRight: () => (
            <TouchableOpacity style={styles.headerButton}>
              {/* <Ionicons name="videocam" size={24} color="#333" /> */}
            </TouchableOpacity>
          ),
          headerStyle: {
            backgroundColor: '#FFFFFF',
            shadowColor: 'transparent',
          },
        }}
      />

      <KeyboardAvoidingView
        style={styles.chatContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={({ item }) => <MessageBubble message={item} onImagePress={handleImagePress} />}
          keyExtractor={(item) => item.id}
          style={styles.messageList}
          contentContainerStyle={[
            styles.messageListContent,
            { paddingBottom: keyboardHeight > 0 ? keyboardHeight + 100 : 100 }
          ]}
          showsVerticalScrollIndicator={false}
          keyboardDismissMode="interactive"
          maintainVisibleContentPosition={{
            minIndexForVisible: 0,
            autoscrollToTopThreshold: 10,
          }}
          onContentSizeChange={() => {
            if (messages.length > 0) {
              setTimeout(() => {
                flatListRef.current?.scrollToEnd({ animated: false });
              }, 50);
            }
          }}
        />

        {/* Fixed Input Area - Always visible above keyboard */}
        <View style={[styles.inputArea, { bottom: keyboardHeight }]}>
          {isRecording ? (
            <AudioRecorder
              onRecordingComplete={handleRecordingComplete}
              onCancel={handleRecordingCancel}
            />
          ) : recordedAudio ? (
            <AudioPreview
              audioUri={recordedAudio}
              duration={recordingDuration}
              onSend={sendAudioMessage}
              onCancel={cancelAudioMessage}
            />
          ) : (
            <View style={styles.inputContainer}>
              <TouchableOpacity
                style={styles.attachButton}
                onPress={() => setShowMediaSheet(true)}
              >
                <Ionicons name="add" size={24} color="#666" />
              </TouchableOpacity>

              <View style={styles.textInputContainer}>
                <TextInput
                  ref={inputRef}
                  style={styles.textInput}
                  placeholder="Message..."
                  value={inputText}
                  onChangeText={setInputText}
                  multiline
                  maxLength={1000}
                  returnKeyType="send"
                  onSubmitEditing={handleSend}
                />
              </View>

              {inputText.trim() ? (
                <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
                  <Ionicons name="send" size={20} color="white" />
                </TouchableOpacity>
              ) : (
                <TouchableOpacity style={styles.voiceButton} onPress={startRecording}>
                  <Ionicons name="mic" size={20} color="#666" />
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
      </KeyboardAvoidingView>

      <MediaActionSheet
        visible={showMediaSheet}
        onClose={() => setShowMediaSheet(false)}
        onTakePhoto={takePhoto}
        onChooseFromGallery={selectFromGallery}
      />

      <ImagePreviewModal
        visible={!!previewImage}
        imageUri={previewImage}
        onClose={handleImagePreviewClose}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFBFC',
  },
  chatContainer: {
      marginBottom:30,
    flex: 1,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#4630EB',
    marginRight: 12,
  },
  headerText: {
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  headerStatus: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  headerButton: {
    padding: 8,
  },
  messageList: {
    flex: 1,
  },
  messageListContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 100, // Increased padding to ensure messages are visible above input
  },
  messageRow: {
    flexDirection: 'row',
    marginVertical: 4,
  },
  messageBubble: {
    maxWidth: '75%',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginBottom: 4,
  },
  myBubble: {
    backgroundColor: '#4630EB',
    borderBottomRightRadius: 6,
  },
  otherBubble: {
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  imageBubble: {
    padding: 0,
    backgroundColor: 'transparent',
  },
  myText: {
    color: '#FFFFFF',
    fontSize: 16,
    lineHeight: 20,
  },
  otherText: {
    color: '#1A1A1A',
    fontSize: 16,
    lineHeight: 20,
  },
  timestamp: {
    fontSize: 11,
    marginTop: 4,
    opacity: 0.7,
  },
  myTimestamp: {
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'right',
  },
  otherTimestamp: {
    color: '#666',
  },
  chatImage: {
    width: 200,
    height: 200,
    borderRadius: 12,
    backgroundColor: '#F5F5F5',
  },
  inputArea: {
    position: 'absolute',
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    paddingBottom: Platform.OS === 'ios' ? 20 : 0,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  attachButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 20,
    marginRight: 12,
  },
  textInputContainer: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E8E8E8',
    minHeight: 40,
    maxHeight: 100,
  },
  textInput: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    lineHeight: 20,
    color: '#1A1A1A',
  },
  sendButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#4630EB',
    borderRadius: 20,
    marginLeft: 12,
  },
  voiceButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 20,
    marginLeft: 12,
  },
  // Audio Recorder Styles
  audioRecorderContainer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  startRecordButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F0F4FF',
    paddingVertical: 16,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: '#4630EB',
    borderStyle: 'dashed',
  },
  startRecordText: {
    color: '#4630EB',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  recordingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFE5E5',
    padding: 16,
    borderRadius: 25,
  },
  recordingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  recordingPulse: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#FF3B30',
    marginRight: 12,
  },
  recordingTimer: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF3B30',
  },
  stopRecordButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF3B30',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
  },
  stopRecordText: {
    color: 'white',
    fontWeight: '600',
    marginLeft: 6,
  },
  // Audio Preview Styles
  audioPreviewContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#F8F9FA',
  },
  audioPreviewPlayer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 20,
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  audioPreviewInfo: {
    flex: 1,
    marginLeft: 12,
  },
  audioPreviewDuration: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  audioWave: {
    height: 4,
    backgroundColor: '#E8E8E8',
    borderRadius: 2,
    overflow: 'hidden',
  },
  audioWaveBar: {
    height: '100%',
    backgroundColor: '#4630EB',
    borderRadius: 2,
  },
  audioPreviewActions: {
    flexDirection: 'row',
  },
  cancelAudioButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFE5E5',
    borderRadius: 22,
    marginRight: 8,
  },
  sendAudioButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#4630EB',
    borderRadius: 22,
  },
  // Media Action Sheet
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
  // Image Preview
  imagePreviewOverlay: {
    flex: 1,
    backgroundColor: '#000000',
  },
  imageCloseArea: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 40,
    left: 20,
    zIndex: 1000,
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeIcon: {
    opacity: 0.9,
  },
  fullScreenImage: {
    width: screenWidth,
    height: '100%',
  },
});