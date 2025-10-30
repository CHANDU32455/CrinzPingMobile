import { StyleSheet, View, Text, TouchableOpacity, TouchableWithoutFeedback, Animated, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import React, { useState, useRef } from 'react';
import { LinearGradient } from 'expo-linear-gradient';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function CrinzTile({
  username,
  timestamp,
  message,
  initialLikeCount = 0,
  initialCommentCount = 0,
  isInitiallyLiked = false,
  onCommentPress,
  onSharePress
}) {
  const [liked, setLiked] = useState(isInitiallyLiked);
  const [likeCount, setLikeCount] = useState(initialLikeCount);

  const scaleValue = useRef(new Animated.Value(0)).current;
  const opacityValue = useRef(new Animated.Value(0)).current;
  const lastTap = useRef(null);

  const handleDoubleTap = () => {
    const now = Date.now();
    const DOUBLE_PRESS_DELAY = 300;
    if (lastTap.current && (now - lastTap.current) < DOUBLE_PRESS_DELAY) {
      if (!liked) {
        toggleLike();
        triggerAnimation();
      }
    }
    lastTap.current = now;
  };

  const toggleLike = () => {
    const newLikedState = !liked;
    setLiked(newLikedState);
    setLikeCount(newLikedState ? likeCount + 1 : likeCount - 1);
  };

  const triggerAnimation = () => {
    scaleValue.setValue(1);
    opacityValue.setValue(1);

    Animated.parallel([
      Animated.spring(scaleValue, {
        toValue: 2,
        tension: 100,
        friction: 3,
        useNativeDriver: true
      }),
      Animated.timing(opacityValue, {
        toValue: 0,
        duration: 400,
        delay: 150,
        useNativeDriver: true
      })
    ]).start(() => scaleValue.setValue(0));
  };

  const animatedStyle = {
    transform: [{ scale: scaleValue }],
    opacity: opacityValue
  };

  const formatCount = (count) => {
    if (count >= 1000000) {
      return (count / 1000000).toFixed(1) + 'M';
    } else if (count >= 1000) {
      return (count / 1000).toFixed(1) + 'K';
    }
    return count.toString();
  };

  return (
    <TouchableOpacity activeOpacity={0.95} onLongPress={() => { /* Can add menu here */ }}>
      <LinearGradient
        colors={['#FFFFFF', '#F8FAFF', '#F0F4FF']}
        style={styles.tile}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {/* Animated Heart Overlay */}
        <Animated.View style={[styles.animatedHeart, animatedStyle]} pointerEvents="none">
          <Ionicons name="heart" size={100} color="#FF375F" />
        </Animated.View>

        {/* Header Section */}
        <View style={styles.tileHeader}>
          <View style={styles.userInfo}>
            <View style={styles.avatarContainer}>
              <Ionicons name="person-circle" size={44} color="#6366F1" />
              <View style={styles.onlineIndicator} />
            </View>
            <View style={styles.userTextContainer}>
              <Text style={styles.username}>@{username}</Text>
              <Text style={styles.timestamp}>{timestamp}</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.moreButton}>
            <Ionicons name="ellipsis-horizontal" size={20} color="#64748B" />
          </TouchableOpacity>
        </View>

        {/* Message Body - Clean Text Only */}
        <TouchableWithoutFeedback onPress={handleDoubleTap}>
          <View style={styles.tileBody}>
            <Text style={styles.tileText}>{message}</Text>
          </View>
        </TouchableWithoutFeedback>

        {/* Footer Actions - Simplified */}
        <View style={styles.tileFooter}>
          <TouchableOpacity
            style={styles.footerButton}
            onPress={toggleLike}
          >
            <Ionicons
              name={liked ? "heart" : "heart-outline"}
              size={26}
              color={liked ? "#FF375F" : "#64748B"}
            />
            <Text style={[
              styles.footerButtonText,
              { color: liked ? '#FF375F' : '#64748B' }
            ]}>
              {formatCount(likeCount)}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.footerButton}
            onPress={onCommentPress}
          >
            <Ionicons name="chatbubble-ellipses-outline" size={24} color="#64748B" />
            <Text style={styles.footerButtonText}>
              {formatCount(initialCommentCount)}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.footerButton}
            onPress={onSharePress}
          >
            <Ionicons name="paper-plane-outline" size={24} color="#64748B" />
            <Text style={styles.footerButtonText}>
              Share
            </Text>
          </TouchableOpacity>
        </View>

        {/* Decorative Elements */}
        <View style={styles.cornerAccent} />
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  tile: {
    borderRadius: 24,
    width: screenWidth * 0.92,
    maxWidth: 420,
    minHeight: screenHeight * 0.65,
    elevation: 12,
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    marginVertical: 8,
    flexDirection: 'column',
    alignSelf: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    position: 'relative',
  },
  tileHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 16,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarContainer: {
    position: 'relative',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#10B981',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  userTextContainer: {
    marginLeft: 16,
    flex: 1,
  },
  username: {
    fontWeight: '700',
    fontSize: 18,
    color: '#1E293B',
    letterSpacing: -0.5,
  },
  timestamp: {
    fontSize: 13,
    color: '#94A3B8',
    fontWeight: '500',
    marginTop: 2,
  },
  moreButton: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
  },
  tileBody: {
    flex: 1,
    paddingHorizontal: 32,
    paddingVertical: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tileText: {
    fontSize: 20,
    lineHeight: 32,
    textAlign: 'center',
    color: '#334155',
    fontWeight: '500',
    letterSpacing: -0.3,
  },
  tileFooter: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingVertical: 20,
    paddingHorizontal: 24,
    backgroundColor: '#FAFBFF',
  },
  footerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 12,
    minWidth: 80,
    justifyContent: 'center',
  },
  footerButtonText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '600',
  },
  animatedHeart: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  cornerAccent: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 80,
    height: 80,
    borderTopRightRadius: 24,
    borderBottomLeftRadius: 40,
    backgroundColor: 'rgba(99, 102, 241, 0.03)',
  },
});