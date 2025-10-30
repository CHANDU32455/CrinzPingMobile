import * as React from 'react';
import { useWindowDimensions, StyleSheet, FlatList, View } from 'react-native';
import { TabView, TabBar } from 'react-native-tab-view';
import { useIsFocused } from '@react-navigation/native';

import CrinzTile from '../components/CrinzTile';
import CommentModal from '../components/CommentModal';
import ShareModal from '../components/ShareModal';
import ReelItem from '../components/ReelItem';
import PostTile from '../components/PostTile';

// --- DEMO DATA ---
const crinzesData = [
  { id: 'crinz-1', username: 'Chandu', timestamp: '2 days ago', message: 'This is a crinz message!', comments: [], likeCount: 10, commentCount: 1, isLiked: true, link: 'https://crinzping.com/crinzes/crinz-1' },
  { id: 'crinz-2', username: 'JaneDoe', timestamp: '1 day ago', message: 'Just discovered a cool new cafe.', comments: [], likeCount: 42, commentCount: 3, isLiked: false, link: 'https://crinzping.com/crinzes/crinz-2' },
];

const reelsData = [
    { id: 'reel-1', videoUrl: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4', username: '@MovieMagic', description: 'Behind the scenes! 🎬', userProfileUrl: 'https://randomuser.me/api/portraits/women/75.jpg', likes: 2450, commentCount: 310, isLiked: false, link: 'https://crinzping.com/reels/reel-1' },
    { id: 'reel-2', videoUrl: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4', username: '@SciFiDreams', description: 'A glimpse into a futuristic world.', userProfileUrl: 'https://randomuser.me/api/portraits/men/88.jpg', likes: 8800, commentCount: 1200, isLiked: true, link: 'https://crinzping.com/reels/reel-2' },
];

const personalizedFeedData = [
  {
    type: 'post',
    id: 'post-1',
    username: 'ArtExplorer',
    timestamp: '5 hours ago',
    imageUrls: ['https://picsum.photos/seed/newart1/800/600', 'https://picsum.photos/seed/newart2/800/600'],
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    likeCount: 450,
    commentCount: 55,
    isLiked: true,
    link: 'https://crinzping.com/posts/post-1'
  },
  { type: 'reel', ...reelsData[0] },
  { type: 'crinz', ...crinzesData[1] },
];

// --- INDEPENDENT FEED COMPONENTS ---

const CrinzesFeed = ({ isFocused }) => {
  const [modalState, setModalState] = React.useState({ isVisible: false, type: '', data: {} });

  const handleSharePress = (item) => setModalState({ isVisible: true, type: 'share', data: { shareLink: item.link, title: 'Share Crinz' } });
  const handleCommentPress = (comments) => setModalState({ isVisible: true, type: 'comment', data: { comments } });
  const closeModal = () => setModalState({ isVisible: false, type: '', data: {} });

  return (
    <View style={styles.feedContainer}>
      <FlatList
        data={crinzesData}
        renderItem={({ item }) => (
            <CrinzTile {...item} onCommentPress={() => handleCommentPress(item.comments)} onSharePress={() => handleSharePress(item)} />
        )}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
      />
      <CommentModal isVisible={modalState.type === 'comment'} onClose={closeModal} initialComments={modalState.data.comments || []} onCommentSubmit={() => {}} />
      <ShareModal isVisible={modalState.type === 'share'} onClose={closeModal} shareLink={modalState.data.shareLink} title={modalState.data.title} />
    </View>
  );
};

const ReelsFeed = ({ isFocused }) => {
    const [containerHeight, setContainerHeight] = React.useState(0);
    const [activeReelId, setActiveReelId] = React.useState(reelsData[0]?.id);
    const [modalState, setModalState] = React.useState({ isVisible: false, type: '', data: {} });
    const [isMuted, setIsMuted] = React.useState(true);
    const [reelItems, setReelItems] = React.useState(reelsData);

    const handleToggleLike = (itemId) => {
        setReelItems(reelItems.map(r => r.id === itemId ? {...r, isLiked: !r.isLiked, likes: r.isLiked ? r.likes - 1 : r.likes + 1} : r));
    }

    const handleSharePress = (item) => setModalState({ isVisible: true, type: 'share', data: { shareLink: item.link, title: 'Share Reel' } });
    const handleCommentPress = (comments) => setModalState({ isVisible: true, type: 'comment', data: { comments } });
    const closeModal = () => setModalState({ isVisible: false, type: '', data: {} });

    const onLayout = (event) => {
        setContainerHeight(event.nativeEvent.layout.height);
    }

    const onViewableItemsChanged = React.useRef(({ viewableItems }) => {
        if (viewableItems.length > 0) setActiveReelId(viewableItems[0].item.id);
    }).current;

    return (
        <View style={{ flex: 1 }} onLayout={onLayout}>
            {containerHeight > 0 && (
                <FlatList
                    data={reelItems}
                    renderItem={({ item }) => (
                        <ReelItem 
                            item={item}
                            height={containerHeight} // Use measured height for perfect fit
                            isActive={isFocused && activeReelId === item.id}
                            isMuted={isMuted}
                            isLiked={item.isLiked}
                            likeCount={item.likes}
                            onToggleMute={() => setIsMuted(!isMuted)}
                            onToggleLike={() => handleToggleLike(item.id)}
                            onCommentPress={() => handleCommentPress(item.comments)} 
                            onSharePress={() => handleSharePress(item)} 
                        />
                    )}
                    keyExtractor={item => item.id}
                    pagingEnabled
                    onViewableItemsChanged={onViewableItemsChanged}
                    viewabilityConfig={{ itemVisiblePercentThreshold: 50 }}
                    showsVerticalScrollIndicator={false}
                    getItemLayout={(data, index) => ({ length: containerHeight, offset: containerHeight * index, index })}
                />
            )}
            <CommentModal isVisible={modalState.type === 'comment'} onClose={closeModal} initialComments={modalState.data.comments || []} onCommentSubmit={() => {}} />
            <ShareModal isVisible={modalState.type === 'share'} onClose={closeModal} shareLink={modalState.data.shareLink} title={modalState.data.title} />
        </View>
    );
};

const PersonalizedFeed = ({ isFocused }) => {
  const [activeItemId, setActiveItemId] = React.useState(null);
  const { height: windowHeight } = useWindowDimensions();
  const [modalState, setModalState] = React.useState({ isVisible: false, type: '', data: {} });
  const [isMuted, setIsMuted] = React.useState(true);
  const [feedItems, setFeedItems] = React.useState(personalizedFeedData);

  const handleToggleLike = (itemId) => {
      setFeedItems(feedItems.map(i => i.id === itemId ? {...i, isLiked: !i.isLiked, likeCount: i.isLiked ? i.likeCount - 1 : i.likeCount + 1} : i));
  }

  const handleSharePress = (item) => {
      const title = `Share ${item.type.charAt(0).toUpperCase() + item.type.slice(1)}`;
      setModalState({ isVisible: true, type: 'share', data: { shareLink: item.link, title } });
  }
  const handleCommentPress = (comments) => setModalState({ isVisible: true, type: 'comment', data: { comments } });
  const closeModal = () => setModalState({ isVisible: false, type: '', data: {} });

  const onViewableItemsChanged = React.useRef(({ viewableItems }) => {
    if (viewableItems.length > 0) setActiveItemId(viewableItems[0].item.id);
  }).current;

  const renderItem = ({ item }) => {
    const isActive = isFocused && activeItemId === item.id;
    switch (item.type) {
      case 'crinz':
        return <CrinzTile {...item} onCommentPress={() => handleCommentPress(item.comments)} onSharePress={() => handleSharePress(item)} />;
      case 'post':
        return <PostTile post={item} isActive={isActive} isMuted={isMuted} onToggleMute={() => setIsMuted(!isMuted)} onCommentPress={() => handleCommentPress(item.comments)} onSharePress={() => handleSharePress(item)} />;
      case 'reel':
        return (
          <View style={{ height: windowHeight * 0.75, marginBottom: 12 }}>
            <ReelItem 
                item={item} 
                height={windowHeight * 0.75} 
                isActive={isActive} 
                isMuted={isMuted} 
                isLiked={item.isLiked}
                likeCount={item.likes}
                onToggleMute={() => setIsMuted(!isMuted)}
                onToggleLike={() => handleToggleLike(item.id)}
                onCommentPress={() => handleCommentPress(item.comments)} 
                onSharePress={() => handleSharePress(item)} />
          </View>
        );
      default: return null;
    }
  };

  return (
    <View style={styles.feedContainer}>
      <FlatList
        data={feedItems}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={{ itemVisiblePercentThreshold: 50 }}
      />
      <CommentModal isVisible={modalState.type === 'comment'} onClose={closeModal} initialComments={modalState.data.comments || []} onCommentSubmit={() => {}} />
      <ShareModal isVisible={modalState.type === 'share'} onClose={closeModal} shareLink={modalState.data.shareLink} title={modalState.data.title} />
    </View>
  );
};

export default function FeedScreen() {
  const layout = useWindowDimensions();
  const isScreenFocused = useIsFocused();
  const [index, setIndex] = React.useState(1); // Default to Reels
  const [routes] = React.useState([
    { key: 'personalized', title: 'For You' },
    { key: 'reels', title: 'Reels' },
    { key: 'crinzes', title: 'Crinzes' },
  ]);

  const renderScene = ({ route }) => {
    const isFocused = isScreenFocused && routes[index].key === route.key;
    switch (route.key) {
      case 'personalized':
        return <PersonalizedFeed isFocused={isFocused} />;
      case 'reels':
        return <ReelsFeed isFocused={isFocused} />;
      case 'crinzes':
        return <CrinzesFeed isFocused={isFocused} />;
      default:
        return null;
    }
  };

  return (
    <TabView
      navigationState={{ index, routes }}
      renderScene={renderScene}
      onIndexChange={setIndex}
      initialLayout={{ width: layout.width }}
      renderTabBar={props => (
        <TabBar
          {...props}
          style={{ backgroundColor: 'white' }}
          indicatorStyle={{ backgroundColor: '#4A90E2' }}
          activeColor={'#4A90E2'}
          inactiveColor={'gray'}
          labelStyle={{ fontWeight: 'bold' }}
        />
      )}
    />
  );
}

const styles = StyleSheet.create({
  feedContainer: { flex: 1, backgroundColor: '#F0F4FF' },
  listContent: { paddingVertical: 16, paddingTop: 0 },
});
