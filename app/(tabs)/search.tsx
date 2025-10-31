import { Ionicons } from '@expo/vector-icons'
import * as Haptics from 'expo-haptics'
import React, { useState, useEffect, useCallback } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ActivityIndicator,
  TouchableOpacity,
  FlatList,
  Image,
  Dimensions,
  Alert
} from 'react-native'
import { useRouter } from 'expo-router'

const API_URL = 'https://picsum.photos/v2/list?page=2&limit=30'
const numColumns = 3
const { width } = Dimensions.get('window')
const itemSize = width / numColumns

// --- Mock users ---
const MOCK_USERS = [
  { id: '1', name: 'Chandu', username: 'chandu_dev', tagline: 'Building cool things with code.', avatar: 'https://randomuser.me/api/portraits/men/32.jpg' },
  { id: '2', name: 'Alex', username: 'alex_codes', tagline: 'React Native Enthusiast.', avatar: 'https://randomuser.me/api/portraits/women/44.jpg' },
  { id: '3', name: 'Samantha', username: 'sam_designs', tagline: 'UI/UX Designer & Artist.', avatar: 'https://randomuser.me/api/portraits/women/65.jpg' },
  { id: '4', name: 'John Doe', username: 'john_doe', tagline: 'Exploring the digital world.', avatar: 'https://randomuser.me/api/portraits/men/88.jpg' }
]

// --- Grid item ---
const GridItem = React.memo(function GridItem({ item, onPress }: { item: any; onPress: (item: any) => void }) {
  return (
    <TouchableOpacity
      style={styles.gridItem}
      activeOpacity={0.8}
      onPress={async () => {
        await Haptics.selectionAsync()
        onPress(item)
      }}
    >
      <Image source={{ uri: item.imageUrl }} style={styles.gridImage} />
    </TouchableOpacity>
  )
})

// --- User item ---
const UserListItem = React.memo(function UserListItem({ user, onPress }: { user: any; onPress: (user: any) => void }) {
  return (
    <TouchableOpacity
      style={styles.userItem}
      activeOpacity={0.7}
      onPress={async () => {
        await Haptics.selectionAsync()
        onPress(user)
      }}
    >
      <Image source={{ uri: user.avatar }} style={styles.userAvatar} />
      <View style={styles.userInfoContainer}>
        <Text style={styles.userUsername}>{user.username}</Text>
        <Text style={styles.userTagline}>{user.tagline}</Text>
      </View>
    </TouchableOpacity>
  )
})

export default function SearchScreen() {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [searchType, setSearchType] = useState<'grid' | 'people' | 'tags'>('grid')
  const [gridPosts, setGridPosts] = useState<any[]>([])
  const [results, setResults] = useState<any[]>([])

  // Fetch grid data once
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(API_URL)
        const data = await response.json()
        const formatted = data.map((p: any) => ({ id: p.id, imageUrl: p.download_url }))
        setGridPosts(formatted)
        setResults(formatted)
      } catch {
        Alert.alert('Error', 'Failed to fetch grid data.')
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [])

  // Filter logic (only on query change)
  useEffect(() => {
    const handler = setTimeout(() => {
      const q = query.trim()

      if (!q) {
        setSearchType('grid')
        setResults(gridPosts)
        return
      }

      if (q.startsWith('@')) {
        setSearchType('people')
        const searchTerm = q.substring(1).toLowerCase()
        const filteredUsers = MOCK_USERS.filter(
          u =>
            u.username.toLowerCase().includes(searchTerm) ||
            u.name.toLowerCase().includes(searchTerm)
        )
        setResults(filteredUsers)
      } else if (q.startsWith('#')) {
        setSearchType('tags')
        const tag = q.substring(1)
        if (tag) {
          const tagResults = Array.from({ length: 15 }, (_, i) => ({
            id: `${tag}-${i}`,
            imageUrl: `https://picsum.photos/seed/${tag}+${i}/400/600`
          }))
          setResults(tagResults)
        } else setResults([])
      } else {
        setSearchType('grid')
        setResults(gridPosts)
      }
    }, 250)

    return () => clearTimeout(handler)
  }, [query, setResults, gridPosts])

  // Handlers
  const handleUserPress = useCallback(
    user => router.push(`/profile/${user.username}`),
    [router]
  )
  const handleImagePress = useCallback(
    item => router.push({ pathname: '/post/[id]', params: { id: item.id } }),
    [router]
  )
  const handleTagPress = useCallback(tag => router.push(`/explore/${tag}`), [router])

  // Render switch
  const renderContent = () => {
    if (isLoading)
      return <ActivityIndicator style={{ marginTop: 50 }} size="large" color="#4630EB" />

    switch (searchType) {
      case 'people':
        return (
          <FlatList
            key="people"
            data={results}
            renderItem={({ item }) => (
              <UserListItem user={item} onPress={handleUserPress} />
            )}
            keyExtractor={item => item.id}
          />
        )
      case 'tags':
        return (
          <FlatList
            key="tags"
            data={results}
            renderItem={({ item }) => (
              <GridItem item={item} onPress={() => handleTagPress(query.substring(1))} />
            )}
            keyExtractor={item => item.id}
            numColumns={numColumns}
          />
        )
      default:
        return (
          <FlatList
            key="grid"
            data={results}
            renderItem={({ item }) => (
              <GridItem item={item} onPress={handleImagePress} />
            )}
            keyExtractor={item => item.id}
            numColumns={numColumns}
          />
        )
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.searchBarContainer}>
        <Ionicons name="search" size={20} color="#888" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search @people or #tags..."
          value={query}
          onChangeText={setQuery}
          clearButtonMode="while-editing"
        />
      </View>
      {renderContent()}
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F7F7F7',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0'
  },
  searchIcon: { marginRight: 10 },
  searchInput: { flex: 1, fontSize: 16, paddingVertical: 5 },
  gridItem: {
    width: itemSize,
    height: itemSize,
    borderWidth: 1,
    borderColor: '#fff'
  },
  gridImage: { width: '100%', height: '100%' },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0'
  },
  userAvatar: { width: 50, height: 50, borderRadius: 25, marginRight: 15 },
  userInfoContainer: { flex: 1 },
  userUsername: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  userTagline: { fontSize: 14, color: 'gray', marginTop: 2 }
})
