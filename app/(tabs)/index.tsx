import { StyleSheet, View, Dimensions, Switch, Text } from 'react-native';
import * as React from 'react';
import { LinearGradient } from 'expo-linear-gradient';

import CrinzTile from '../components/CrinzTile';
import CommentModal from '../components/CommentModal';
import ShareModal from '../components/ShareModal';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Enhanced static data for the home screen
const homeCrinzData = {
  id: 'crinz-home',
  username: 'Chandu',
  timestamp: '2 days ago',
  message: 'This is a crinz message on the Home Screen. It is now fully interactive with a professional design that maximizes space usage and provides an excellent user experience! ✨',
  comments: [
    { id: 'c1', text: 'Welcome to the new home screen! The design looks amazing!', user: { name: 'Alex' }, timestamp: '2 days ago' },
    { id: 'c2', text: 'The UI looks absolutely stunning. Great work!', user: { name: 'Jane' }, timestamp: '1 day ago' },
    { id: 'c3', text: 'Love the new professional look and feel!', user: { name: 'Mike' }, timestamp: '12 hours ago' },
  ],
  likeCount: 1242,
  commentCount: 3,
  liked: true,
  link: 'https://crinzping.com/home'
};

export default function HomeScreen() {
  // State and handlers for Modals
  const [commentModalVisible, setCommentModalVisible] = React.useState(false);
  const [shareModalVisible, setShareModalVisible] = React.useState(false);
  const [selectedCrinzComments, setSelectedCrinzComments] = React.useState([]);
  const [selectedCrinzLink, setSelectedCrinzLink] = React.useState('');
  const [receiveCrinzes, setReceiveCrinzes] = React.useState(true);

  const handleCommentPress = (comments) => {
    if (!Array.isArray(comments)) {
      comments = [];
    }
    setSelectedCrinzComments(comments);
    setCommentModalVisible(true);
  };

  const handleSharePress = (link) => {
    setSelectedCrinzLink(link);
    setShareModalVisible(true);
  };

  const handleCommentSubmit = async (newComment) => {
    console.log('Submitting comment on home screen:', newComment);
    // Here you would typically add the new comment to your state/backend
    return Promise.resolve();
  };

  const toggleReceiveCrinzes = () => {
    setReceiveCrinzes(previousState => !previousState);
  };

  return (
    <LinearGradient
      colors={['#F0F4FF', '#E7F0FF', '#F8F9FA']}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <View style={styles.content}>
        {/* Main Tile */}
        <View style={styles.tileContainer}>
          <CrinzTile
            username={homeCrinzData.username}
            timestamp={homeCrinzData.timestamp}
            message={homeCrinzData.message}
            initialLikeCount={homeCrinzData.likeCount}
            initialCommentCount={homeCrinzData.commentCount}
            isInitiallyLiked={homeCrinzData.liked}
            onCommentPress={() => handleCommentPress(homeCrinzData.comments)}
            onSharePress={() => handleSharePress(homeCrinzData.link)}
          />
        </View>

        {/* Receive Crinzes Toggle */}
        <View style={styles.toggleContainer}>
          <Text style={styles.toggleLabel}>
            Receive Crinzes
          </Text>
          <Switch
            value={receiveCrinzes}
            onValueChange={toggleReceiveCrinzes}
            trackColor={{ false: '#E2E8F0', true: '#6366F1' }}
            thumbColor={receiveCrinzes ? '#FFFFFF' : '#F8FAFC'}
            ios_backgroundColor="#E2E8F0"
          />
        </View>
      </View>

      {/* Add the modals, ready to be displayed */}
      <CommentModal
        isVisible={commentModalVisible}
        onClose={() => setCommentModalVisible(false)}
        initialComments={selectedCrinzComments}
        onCommentSubmit={handleCommentSubmit}
      />
      <ShareModal
        isVisible={shareModalVisible}
        onClose={() => setShareModalVisible(false)}
        crinzLink={selectedCrinzLink}
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  tileContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    flex: 1,
  },
  // Simplified toggle container style
  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 20, // Give it some space from the bottom edge
  },
  // Simplified label style
  toggleLabel: {
    fontSize: 16,
    color: '#475569', // Softer color
    marginRight: 10, // Space between label and switch
  },
});
