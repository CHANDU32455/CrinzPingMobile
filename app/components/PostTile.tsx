import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, Text, Image, FlatList, useWindowDimensions, TouchableOpacity, TouchableWithoutFeedback, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAudioPlayer } from 'expo-audio';
import { LinearGradient } from 'expo-linear-gradient';

const AudioPlayback = ({ audioUrl, isActive, isMuted }) => {
  const player = useAudioPlayer(audioUrl);

  useEffect(() => {
    if (player) {
      if (isActive) {
        player.play();
      } else {
        player.pause();
      }
    }
  }, [isActive, player]);

  useEffect(() => {
    if (player) {
      player.volume = isMuted ? 0 : 1;
    }
  }, [isMuted, player]);

  return null;
};

const PostTile = ({ post, isActive, isMuted, onToggleMute, onCommentPress, onSharePress }) => {
  const { width } = useWindowDimensions();
  const flatListRef = useRef(null);
  const [liked, setLiked] = useState(post.isLiked);
  const [likeCount, setLikeCount] = useState(post.likeCount);
  const [activeIndex, setActiveIndex] = useState(0);

  const scaleValue = useRef(new Animated.Value(0)).current;
  const opacityValue = useRef(new Animated.Value(0)).current;
  const tapTimeout = useRef(null);
  const lastTap = useRef(null);

  useEffect(() => {
    return () => {
      if (tapTimeout.current) clearTimeout(tapTimeout.current);
    };
  }, []);

  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems.length > 0) setActiveIndex(viewableItems[0].index);
  }).current;

  const handleScroll = (direction) => {
    const newIndex = direction === 'next' ? activeIndex + 1 : activeIndex - 1;
    if (newIndex >= 0 && newIndex < post.imageUrls.length) {
      flatListRef.current.scrollToIndex({ index: newIndex, animated: true });
    }
  };

  const toggleLike = () => {
    setLiked(current => !current);
    setLikeCount(current => (liked ? current - 1 : current + 1));
  };

  const triggerAnimation = () => {
    scaleValue.setValue(1.2);
    opacityValue.setValue(0.8);
    Animated.parallel([
      Animated.spring(scaleValue, { toValue: 2, friction: 3, useNativeDriver: true }),
      Animated.timing(opacityValue, { toValue: 0, duration: 300, delay: 150, useNativeDriver: true })
    ]).start(() => scaleValue.setValue(0));
  };

  const handleTap = () => {
    const now = Date.now();
    const DOUBLE_PRESS_DELAY = 300;
    if (lastTap.current && (now - lastTap.current) < DOUBLE_PRESS_DELAY) {
      clearTimeout(tapTimeout.current);
      lastTap.current = null;
      if (!liked) {
        toggleLike();
        triggerAnimation();
      }
    } else {
      lastTap.current = now;
      tapTimeout.current = setTimeout(() => {
        // A single tap now calls the function passed from the parent feed
        if(onToggleMute) onToggleMute();
        lastTap.current = null;
      }, DOUBLE_PRESS_DELAY);
    }
  };

  const animatedStyle = { transform: [{ scale: scaleValue }], opacity: opacityValue };

  return (
    <TouchableWithoutFeedback onPress={handleTap}>
      <View style={styles.container}>
        {post.audioUrl && <AudioPlayback audioUrl={post.audioUrl} isActive={isActive} isMuted={isMuted} />}

        <Animated.View style={[styles.animatedHeart, animatedStyle]} pointerEvents="none">
          <Ionicons name="heart" size={100} color="#FF4B4B" />
        </Animated.View>

        <LinearGradient colors={['#FFFFFF', '#F9F9F9']} style={styles.tile}>
          <View style={styles.tileHeader}>
            <View style={styles.userInfo}>
              <Ionicons name="person-circle" size={40} color="#4A90E2" />
              <View style={styles.usernameContainer}>
                <Text style={styles.username}>{post.username}</Text>
                <Text style={styles.timestamp}>{post.timestamp}</Text>
              </View>
            </View>
            {/* The icon now reflects the shared mute state from the parent */}
            {post.audioUrl && <Ionicons name={isMuted ? "volume-off" : "volume-medium"} size={24} color="#4A90E2" />}
          </View>

          <View style={styles.galleryContainer}>
            <FlatList
              ref={flatListRef}
              data={post.imageUrls}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              keyExtractor={(item, index) => `${post.id}-img-${index}`}
              renderItem={({ item }) => <Image source={{ uri: item }} style={{ width, height: 400 }} />}
              onViewableItemsChanged={onViewableItemsChanged}
              viewabilityConfig={{ itemVisiblePercentThreshold: 50 }}
            />
            {post.imageUrls.length > 1 && (
              <>
                {activeIndex > 0 && (
                  <TouchableOpacity style={[styles.navArrow, styles.leftArrow]} onPress={() => handleScroll('prev')}>
                    <Ionicons name="chevron-back" size={30} color="white" />
                  </TouchableOpacity>
                )}
                {activeIndex < post.imageUrls.length - 1 && (
                  <TouchableOpacity style={[styles.navArrow, styles.rightArrow]} onPress={() => handleScroll('next')}>
                    <Ionicons name="chevron-forward" size={30} color="white" />
                  </TouchableOpacity>
                )}
                <View style={styles.pagination}>
                  {post.imageUrls.map((_, index) => (
                    <View key={index} style={[styles.dot, index === activeIndex ? styles.activeDot : {}]} />
                  ))}
                </View>
              </>
            )}
          </View>

          <View style={styles.tileFooter}>
            <TouchableOpacity style={styles.footerButton} onPress={toggleLike}>
              <Ionicons name={liked ? "heart" : "heart-outline"} size={28} color={liked ? "#FF4B4B" : "#4A90E2"} />
              <Text style={[styles.footerButtonText, { color: liked ? '#FF4B4B' : '#4A90E2' }]}>{likeCount}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.footerButton} onPress={() => onCommentPress(post.comments)}>
              <Ionicons name="chatbubble-ellipses-outline" size={28} color="#4A90E2" />
              <Text style={styles.footerButtonText}>{post.commentCount}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.footerButton} onPress={() => onSharePress(post.link)}>
              <Ionicons name="paper-plane-outline" size={28} color="#4A90E2" />
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, position: 'relative' },
  tile: { 
    elevation: 8, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 4 }, 
    shadowOpacity: 0.1, 
    shadowRadius: 12, 
    marginBottom: 20, 
    borderBottomWidth: 1, 
    borderColor: '#EFEFEF',
    width: '100%', // Full width
  },
  tileHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingTop: 16, paddingBottom: 12 },
  userInfo: { flexDirection: 'row', alignItems: 'center' },
  usernameContainer: { marginLeft: 12 },
  username: { fontWeight: 'bold', fontSize: 18, color: '#333' },
  timestamp: { fontSize: 12, color: '#999' },
  galleryContainer: { height: 400, backgroundColor: '#DDD' },
  navArrow: { position: 'absolute', top: '50%', marginTop: -22, width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center', zIndex: 10 },
  leftArrow: { left: 10 },
  rightArrow: { right: 10 },
  pagination: { flexDirection: 'row', position: 'absolute', bottom: 15, alignSelf: 'center' },
  dot: { height: 8, width: 8, borderRadius: 4, backgroundColor: 'rgba(255, 255, 255, 0.6)', marginHorizontal: 4 },
  activeDot: { backgroundColor: '#FFFFFF', width: 16 },
  tileFooter: { flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 12, paddingHorizontal: 20 },
  footerButton: { flexDirection: 'row', alignItems: 'center' },
  footerButtonText: { marginLeft: 8, fontSize: 16, fontWeight: '600', color: '#4A90E2' },
  animatedHeart: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
  },
});

export default PostTile;
