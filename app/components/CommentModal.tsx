import React, { useState } from 'react';
import { Modal, View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const CommentModal = ({ isVisible, onClose, initialComments = [], onCommentSubmit }) => {
  const [comments, setComments] = useState(initialComments);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddComment = async () => {
    if (newComment.trim() === '') return;
    setIsSubmitting(true);
    try {
      await onCommentSubmit(newComment);
      const newCommentObject = {
        id: `comment-${Date.now()}`,
        text: newComment,
        user: { name: 'You', profilePicUrl: '' }, // Placeholder for current user
        timestamp: 'Just now',
      };
      setComments(prevComments => [newCommentObject, ...prevComments]);
      setNewComment('');
      Keyboard.dismiss();
    } catch (error) {
      console.error("Failed to submit comment:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderComment = ({ item }) => (
    <View style={styles.commentContainer}>
      <Ionicons name="person-circle" size={40} color="#4A90E2" />
      <View style={styles.commentTextContainer}>
        <Text style={styles.commentUser}>{item.user.name}</Text>
        <Text style={styles.commentText}>{item.text}</Text>
        <Text style={styles.commentTimestamp}>{item.timestamp}</Text>
      </View>
    </View>
  );

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"} 
        style={styles.keyboardAvoidingView}
      >
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={styles.modalOverlay} />
        </TouchableWithoutFeedback>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Comments</Text>
          <FlatList
            data={comments}
            renderItem={renderComment}
            keyExtractor={(item) => item.id}
            style={styles.commentsList}
          />
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Add a comment..."
              value={newComment}
              onChangeText={setNewComment}
              placeholderTextColor="#999"
            />
            <TouchableOpacity onPress={handleAddComment} style={styles.sendButton} disabled={isSubmitting}>
              <Ionicons name="paper-plane" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  keyboardAvoidingView: { flex: 1, justifyContent: 'flex-end' },
  modalOverlay: { position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(0,0,0,0.5)' },
  modalContent: { height: '75%', backgroundColor: '#FFFFFF', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, shadowColor: '#000', shadowOffset: { width: 0, height: -2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 5 },
  modalTitle: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, color: '#333', textAlign: 'center' },
  commentsList: { flex: 1 },
  commentContainer: { flexDirection: 'row', marginBottom: 15, alignItems: 'flex-start' },
  commentTextContainer: { marginLeft: 12, flex: 1, padding: 10, backgroundColor: '#F1F1F1', borderRadius: 10 },
  commentUser: { fontWeight: 'bold', fontSize: 16, color: '#333' },
  commentText: { fontSize: 15, color: '#555', marginTop: 4 },
  commentTimestamp: { fontSize: 12, color: '#999', marginTop: 6 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#EAEAEA', paddingTop: 10, marginTop: 10 },
  input: { flex: 1, height: 50, backgroundColor: '#F1F1F1', borderRadius: 25, paddingHorizontal: 20, fontSize: 16, color: '#333' },
  sendButton: { marginLeft: 12, width: 50, height: 50, borderRadius: 25, backgroundColor: '#4A90E2', justifyContent: 'center', alignItems: 'center' },
});

export default CommentModal;
