import React, { useState, useEffect, useRef } from 'react';
import {
  Modal, View, Text, StyleSheet, TouchableOpacity, Share, Alert,
  useWindowDimensions, Animated
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import QRCode from 'react-native-qrcode-svg';

// A generic, reusable Share Modal for all content types
export default function ShareModal({ isVisible, onClose, shareLink, title = "Share" }) {
  const { height: screenHeight } = useWindowDimensions();
  const slideAnim = useRef(new Animated.Value(screenHeight)).current;
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setIsCopied(false); // Reset copy status when modal opens
      Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true, damping: 25, stiffness: 200 }).start();
    } else {
      Animated.timing(slideAnim, { toValue: screenHeight, duration: 300, useNativeDriver: true }).start();
    }
  }, [isVisible, screenHeight, slideAnim]);

  const handleExternalShare = async () => {
    try {
      await Share.share({ 
        message: `Check this out: ${shareLink}`,
        url: shareLink,
      });
    } catch {
      Alert.alert("Error", "Something went wrong while sharing.");
    }
  };

  const handleCopyToClipboard = async () => {
    if (shareLink) {
        await Clipboard.setStringAsync(shareLink);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000); // Reset after 2 seconds
    }
  };

  return (
    <Modal
      animationType="none"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}
    >
      <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={onClose}>
        <Animated.View style={[styles.modalView, {transform: [{ translateY: slideAnim }]}]}>
          <TouchableOpacity activeOpacity={1} style={styles.modalContent}>
            <View style={styles.handleBar} />
            <Text style={styles.modalTitle}>{title}</Text>

            <View style={styles.qrContainer}>
              {shareLink ? (
                <QRCode
                  value={shareLink}
                  size={140}
                  backgroundColor="#FFFFFF"
                  color="#000000"
                />
              ) : <View style={{width: 140, height: 140}} />}
            </View>

            <View style={styles.linkContainer}>
                <Text style={styles.linkText} numberOfLines={1}>{shareLink}</Text>
                <TouchableOpacity onPress={handleCopyToClipboard} style={styles.copyButton}>
                    {isCopied ? (
                        <Ionicons name="checkmark-done" size={24} color="#34D399" />
                    ) : (
                        <Ionicons name="copy-outline" size={24} color="#6B7280" />
                    )}
                </TouchableOpacity>
            </View>

            {/* --- Action Buttons --- */}
            <View style={styles.actionsContainer}>
              <TouchableOpacity style={styles.actionButton} onPress={handleExternalShare}>
                <Ionicons name="share-social-outline" size={30} color="#4A90E2" />
                <Text style={styles.actionText}>Share via...</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionButton} onPress={() => Alert.alert("Coming Soon!", "In-app messaging is on its way.")}>
                <Ionicons name="send-outline" size={30} color="#4A90E2" />
                <Text style={styles.actionText}>Send to Friend</Text>
              </TouchableOpacity>
            </View>

          </TouchableOpacity>
        </Animated.View>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalView: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
  },
  modalContent: {
    backgroundColor: '#F8F9FA',
    paddingBottom: 40,
    paddingTop: 10,
    alignItems: 'center',
  },
  handleBar: { width: 40, height: 5, borderRadius: 2.5, backgroundColor: '#D1D5DB', alignSelf: 'center', marginBottom: 15 },
  modalTitle: { fontSize: 22, fontWeight: 'bold', color: '#333', marginBottom: 20 },
  qrContainer: { 
    backgroundColor: '#FFF', 
    padding: 20, 
    borderRadius: 20, 
    elevation: 4, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 2 }, 
    shadowOpacity: 0.1, 
    shadowRadius: 5, 
    marginBottom: 25 
  },
  linkContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E5E7EB',
    borderRadius: 12,
    paddingLeft: 20,
    paddingRight: 10,
    paddingVertical: 10,
    width: '90%',
    marginBottom: 25,
  },
  linkText: { 
    flex: 1, 
    fontSize: 14, 
    color: '#4B5563' 
  },
  copyButton: { 
    padding: 5,
    marginLeft: 10
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    paddingHorizontal: 30,
  },
  actionButton: {
    alignItems: 'center',
  },
  actionText: {
    marginTop: 8,
    fontSize: 14,
    color: '#555',
    fontWeight: '500',
  },
});
