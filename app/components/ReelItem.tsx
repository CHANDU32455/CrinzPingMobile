import React, { useRef, useEffect } from 'react';
import { View, StyleSheet, Text, Image, TouchableOpacity, TouchableWithoutFeedback, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useVideoPlayer, VideoView } from 'expo-video';
import { useEvent } from 'expo';
import { LinearGradient } from 'expo-linear-gradient';

export default function ReelItem({ 
  item,
  height,
  isActive,
  isLiked,
  likeCount,
  isMuted,
  onToggleLike,
  onToggleMute,
  onCommentPress, 
  onSharePress 
}) {
  const player = useVideoPlayer(item.videoUrl, player => {
    player.loop = true;
    player.muted = isMuted;
  });

  const { isPlaying } = useEvent(player, 'playingChange', { isPlaying: player.playing });

  const scaleValue = useRef(new Animated.Value(0)).current;
  const opacityValue = useRef(new Animated.Value(0)).current;
  const tapTimeout = useRef(null);
  const lastTap = useRef(null);

  useEffect(() => {
    if (isActive) {
      player.play();
    } else {
      player.pause();
    }
  }, [isActive, player]);

  useEffect(() => {
    player.muted = isMuted;
  }, [isMuted, player]);

  useEffect(() => {
    return () => {
      if (tapTimeout.current) {
        clearTimeout(tapTimeout.current);
      }
      // The useVideoPlayer hook handles its own cleanup.
      // No need to manually call player.release() here.
    };
  }, []);

  const triggerAnimation = () => {
    scaleValue.setValue(1.2);
    opacityValue.setValue(0.8);
    Animated.parallel([
      Animated.spring(scaleValue, { toValue: 2, friction: 3, useNativeDriver: true }),
      Animated.timing(opacityValue, { toValue: 0, duration: 300, delay: 150, useNativeDriver: true })
    ]).start(() => scaleValue.setValue(0));
  };

  const togglePlayPause = () => {
    if (isPlaying) {
      player.pause();
    } else {
      player.play();
    }
  };

  const handleTap = () => {
    const now = Date.now();
    const DOUBLE_PRESS_DELAY = 300;

    if (lastTap.current && (now - lastTap.current) < DOUBLE_PRESS_DELAY) {
      clearTimeout(tapTimeout.current);
      lastTap.current = null;
      if (!isLiked) {
        if(onToggleLike) onToggleLike();
        triggerAnimation();
      }
    } else {
      lastTap.current = now;
      tapTimeout.current = setTimeout(() => {
        togglePlayPause();
        lastTap.current = null;
      }, DOUBLE_PRESS_DELAY);
    }
  };

  const animatedStyle = {
    transform: [{ scale: scaleValue }],
    opacity: opacityValue
  };

  return (
    <TouchableWithoutFeedback onPress={handleTap}>
      <View style={[styles.container, { height: height }]}>
        {/* VISUAL FIX: Using contentFit="contain" to prevent cropping */}
        <VideoView 
          style={styles.video}
          player={player} 
          nativeControls={false} 
          contentFit="contain" 
        />

        {!isPlaying && (
          <View style={styles.playPauseIconContainer}>
            <Ionicons name="play-circle" size={90} color="rgba(255, 255, 255, 0.7)" />
          </View>
        )}

        <Animated.View style={[styles.animatedHeart, animatedStyle]} pointerEvents="none">
          <Ionicons name="heart" size={100} color="#FF4B4B" />
        </Animated.View>

        <LinearGradient colors={['transparent', 'rgba(0,0,0,0.6)']} style={styles.overlay}>
          <View style={styles.userInfoContainer}>
            <Image source={{ uri: item.userProfileUrl }} style={styles.profilePicture} />
            <Text style={styles.username}>{item.username}</Text>
          </View>
          <Text style={styles.description} numberOfLines={2}>{item.description}</Text>
        </LinearGradient>

        <View style={styles.sideBar}>
          <TouchableOpacity style={styles.sideBarButton} onPress={onToggleLike}>
            <Ionicons name={isLiked ? "heart" : "heart-outline"} size={38} color="white" />
            <Text style={styles.sideBarText}>{likeCount}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.sideBarButton} onPress={onCommentPress}>
            <Ionicons name="chatbubble-ellipses-outline" size={38} color="white" />
            <Text style={styles.sideBarText}>{item.commentCount}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.sideBarButton} onPress={onToggleMute}>
            <Ionicons name={isMuted ? "volume-mute-outline" : "volume-high-outline"} size={38} color="white" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.sideBarButton} onPress={onSharePress}>
            <Ionicons name="paper-plane-outline" size={38} color="white" />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: { width: '100%', backgroundColor: 'black', justifyContent: 'center', alignItems: 'center' },
  video: { ...StyleSheet.absoluteFillObject },
  playPauseIconContainer: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center', zIndex: 1 },
  overlay: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 20, paddingTop: 60, zIndex: 1 },
  userInfoContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  profilePicture: { width: 50, height: 50, borderRadius: 25, borderWidth: 2, borderColor: 'white' },
  username: { color: 'white', fontWeight: 'bold', fontSize: 18, marginLeft: 12 },
  description: { color: 'white', fontSize: 15, marginTop: 5 },
  sideBar: { position: 'absolute', right: 10, bottom: 30, alignItems: 'center', zIndex: 2 },
  sideBarButton: { alignItems: 'center', marginBottom: 30 },
  sideBarText: { color: 'white', marginTop: 5, fontSize: 16, fontWeight: '600' },
  animatedHeart: { position: 'absolute', justifyContent: 'center', alignItems: 'center', top: 0, bottom: 0, left: 0, right: 0, zIndex: 10 },
});
