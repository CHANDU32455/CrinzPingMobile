import React from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

// Mock Data for Conversation List
const CONVERSATIONS = [
  { id: '1', name: 'Alex', avatar: 'https://randomuser.me/api/portraits/women/44.jpg', lastMessage: 'Hey, how are you?', timestamp: '10:45 AM' },
  { id: '2', name: 'Samantha', avatar: 'https://randomuser.me/api/portraits/women/65.jpg', lastMessage: 'See you tomorrow!', timestamp: 'Yesterday' },
  { id: '3', name: 'John Doe', avatar: 'https://randomuser.me/api/portraits/men/88.jpg', lastMessage: 'Thanks for the help!', timestamp: '2d ago' },
];

const ConversationItem = ({ item }) => {
  const router = useRouter();
  return (
    <TouchableOpacity style={styles.itemContainer} onPress={() => router.push('/chat')}>
      <Image source={{ uri: item.avatar }} style={styles.avatar} />
      <View style={styles.itemContent}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.lastMessage}>{item.lastMessage}</Text>
      </View>
      <Text style={styles.timestamp}>{item.timestamp}</Text>
    </TouchableOpacity>
  );
};

export default function MessagesScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea}>
       <Stack.Screen options={{ headerShown: false }} />
       {/* Custom Header for Messages */}
       <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
             <Ionicons name="arrow-back" size={28} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Messages</Text>
          <View style={{width: 40}} />{/* Spacer */}
       </View>

      <FlatList
        data={CONVERSATIONS}
        renderItem={({ item }) => <ConversationItem item={item} />}
        keyExtractor={(item) => item.id}
        style={styles.list}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
  header: {
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
  list: { flex: 1 },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  avatar: { width: 55, height: 55, borderRadius: 27.5, marginRight: 15 },
  itemContent: { flex: 1 },
  name: { fontSize: 17, fontWeight: 'bold', marginBottom: 2 },
  lastMessage: { fontSize: 14, color: 'gray' },
  timestamp: { fontSize: 12, color: 'gray' },
});
