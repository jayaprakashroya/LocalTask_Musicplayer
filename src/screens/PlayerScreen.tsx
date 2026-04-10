import Slider from '@react-native-community/slider';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import SongRow from '../components/SongRow';
import { RootStackParamList } from '../navigation/AppNavigator';
import { searchSongs } from '../services/saavnApi';
import usePlayerStore from '../store/playerStore';
import { formatTime } from '../utils/time';

type PlayerScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Player'>;

const exploreCards = [
  {
    id: 'card-1',
    title: 'Top Telugu Hits',
    subtitle: 'Playlist',
    image: 'https://placehold.co/160x160/6D28D9/ffffff?text=Telugu',
  },
  {
    id: 'card-2',
    title: 'Romantic Vibes',
    subtitle: 'Album',
    image: 'https://placehold.co/160x160/EC4899/ffffff?text=Romantic',
  },
  {
    id: 'card-3',
    title: 'Party Mix',
    subtitle: 'Playlist',
    image: 'https://placehold.co/160x160/F59E0B/ffffff?text=Party',
  },
];

export default function PlayerScreen() {
  const [sliderValue, setSliderValue] = useState<number | null>(null);
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const navigation = useNavigation<PlayerScreenNavigationProp>();
  const currentTrack = usePlayerStore((state) => state.currentTrack);
  const isPlaying = usePlayerStore((state) => state.isPlaying);
  const position = usePlayerStore((state) => state.position);
  const duration = usePlayerStore((state) => state.duration);
  const isLoading = usePlayerStore((state) => state.isLoading);
  const shuffle = usePlayerStore((state) => state.shuffle);
  const repeat = usePlayerStore((state) => state.repeat);
  const togglePlayPause = usePlayerStore((state) => state.togglePlayPause);
  const playNext = usePlayerStore((state) => state.playNext);
  const playPrevious = usePlayerStore((state) => state.playPrevious);
  const toggleShuffle = usePlayerStore((state) => state.toggleShuffle);
  const toggleRepeat = usePlayerStore((state) => state.toggleRepeat);
  const addToQueue = usePlayerStore((state) => state.addToQueue);
  const downloadTrack = usePlayerStore((state) => state.downloadTrack);
  const seekTo = usePlayerStore((state) => state.seekTo);
  const selectTrack = usePlayerStore((state) => state.selectTrack);

  const progress = useMemo(() => {
    if (!duration) return 0;
    return Math.min(position / duration, 1);
  }, [position, duration]);

  const displayedProgress = sliderValue !== null ? sliderValue : progress;
  const track = currentTrack;

  const handleSearch = async () => {
    if (!query.trim()) return;
    setSearching(true);
    setSearchLoading(true);
    try {
      const result = await searchSongs(query, 0);
      setSearchResults(result.songs);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
      setSearching(false);
    }
  };

  const handleExploreCardPress = async (cardTitle: string) => {
    setQuery(cardTitle);
    setSearching(true);
    setSearchLoading(true);
    try {
      const result = await searchSongs(cardTitle, 0);
      setSearchResults(result.songs);
    } catch (error) {
      console.error('Error searching for songs:', error);
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
      setSearching(false);
    }
  };

  const memoizedSearchResults = useMemo(() => searchResults, [searchResults]);

  if (!track) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Select a song from Home to start playing.</Text>
      </View>
    );
  }

  const renderPlayerContent = useCallback(() => (
    <>
      <View style={styles.topBar}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }} style={styles.iconButton}>
          <Text style={styles.iconText}>〈</Text>
        </Pressable>
        <View style={styles.playingInfo}>
          <Text style={styles.playingLabel}>PLAYING FROM PLAYLIST</Text>
          <Text style={styles.playlistName}>{track.album.name || 'Latest Telugu'}</Text>
        </View>
        <Pressable onPress={() => navigation.navigate('Queue')} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }} style={styles.iconButton}>
          <Text style={styles.iconText}>⋮</Text>
        </Pressable>
      </View>

      <View style={styles.coverWrapper}>
        <Image source={{ uri: track.imageUrl }} style={styles.coverImage} />
      </View>

      <View style={styles.trackDetails}>
        <Text style={styles.songTitle}>{track.name}</Text>
        <Text style={styles.songArtist}>{track.primaryArtists}</Text>
        <Text style={styles.playlistText}>{track.album.name} • {track.year}</Text>
      </View>

      <View style={styles.progressSection}>
        <View style={styles.progressRow}>
          <Text style={styles.progressLabel}>{formatTime(position)}</Text>
          <Text style={styles.progressLabel}>{formatTime(duration)}</Text>
        </View>
        <Slider
          value={displayedProgress}
          minimumValue={0}
          maximumValue={1}
          minimumTrackTintColor="#0EA5E9"
          maximumTrackTintColor="rgba(148, 163, 184, 0.2)"
          thumbTintColor="#0EA5E9"
          onValueChange={(value) => setSliderValue(value)}
          onSlidingComplete={async (value) => {
            setSliderValue(null);
            await seekTo(value * duration);
          }}
        />
      </View>

      <View style={styles.controlsRow}>
        <Pressable onPress={toggleShuffle} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }} style={[styles.smallControl, shuffle && styles.smallControlActive]}>
          <Text style={[styles.smallControlText, shuffle && styles.smallControlTextActive]}>SHUFFLE</Text>
        </Pressable>
        <Pressable onPress={toggleRepeat} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }} style={[styles.smallControl, repeat !== 'off' && styles.smallControlActive]}>
          <Text style={[styles.smallControlText, repeat !== 'off' && styles.smallControlTextActive]}>{repeat === 'off' ? 'REPEAT' : repeat === 'one' ? 'ONE' : 'ALL'}</Text>
        </Pressable>
      </View>

      <View style={styles.transportRow}>
        <Pressable onPress={playPrevious} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }} style={styles.transportButton}>
          <Text style={styles.transportIcon}>⏮️</Text>
        </Pressable>
        <Pressable onPress={togglePlayPause} hitSlop={{ top: 16, bottom: 16, left: 16, right: 16 }} style={styles.playButton}>
          {isLoading ? <ActivityIndicator color="#020617" /> : <Text style={styles.playText}>{isPlaying ? '❚❚' : '▶'}</Text>}
        </Pressable>
        <Pressable onPress={playNext} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }} style={styles.transportButton}>
          <Text style={styles.transportIcon}>⏭️</Text>
        </Pressable>
      </View>

      <View style={styles.iconRow}>
        <Pressable style={({ pressed }) => [styles.bottomIconButton, pressed && styles.bottomIconButtonPressed]} onPress={() => navigation.navigate('Queue')} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
          <Text style={styles.bottomIcon}>📱</Text>
        </Pressable>
        <Pressable style={({ pressed }) => [styles.bottomIconButton, pressed && styles.bottomIconButtonPressed]} onPress={() => track && downloadTrack(track)} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
          <Text style={styles.bottomIcon}>⤴︎</Text>
        </Pressable>
        <Pressable style={({ pressed }) => [styles.bottomIconButton, pressed && styles.bottomIconButtonPressed]} onPress={() => navigation.navigate('Queue')} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
          <Text style={styles.bottomIcon}>≡</Text>
        </Pressable>
      </View>

      <View style={styles.exploreSection}>
        <Text style={styles.exploreTitle}>Explore {track.primaryArtists.split(',')[0]}</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.exploreScroll}>
          {exploreCards.map((item) => (
            <Pressable key={item.id} onPress={() => handleExploreCardPress(item.title)} style={styles.exploreCard}>
              <Image source={{ uri: item.image }} style={styles.exploreImage} />
              <Text style={styles.exploreName}>{item.title}</Text>
              <Text style={styles.exploreSubtitle}>{item.subtitle}</Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>
    </>
  ), [track, position, duration, displayedProgress, shuffle, repeat, toggleShuffle, toggleRepeat, playPrevious, togglePlayPause, playNext, handleExploreCardPress, isLoading]);

  return (
    <View style={styles.container}>
      <View style={styles.searchCard}>
        <TextInput
          placeholder="Search songs, artists or albums"
          placeholderTextColor="#94A3B8"
          value={query}
          onChangeText={setQuery}
          style={styles.searchInput}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
          autoCapitalize="none"
          autoCorrect={false}
          selectTextOnFocus={false}
        />
        <Pressable style={styles.searchButton} onPress={handleSearch}>
          <Text style={styles.searchButtonText}>Go</Text>
        </Pressable>
      </View>

      {searching && <Text style={styles.searchingText}>Searching…</Text>}

      <FlatList
        data={memoizedSearchResults}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderPlayerContent}
        ListFooterComponent={searchLoading ? <ActivityIndicator color="#0EA5E9" style={styles.footerLoader} /> : null}
        ListEmptyComponent={memoizedSearchResults.length === 0 && !searchLoading ? null : undefined}
        renderItem={({ item }) => (
          <SongRow
            song={item}
            onPress={() => {
              selectTrack(item, memoizedSearchResults);
            }}
            onAddQueue={() => addToQueue(item)}
          />
        )}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={memoizedSearchResults.length === 0 ? styles.noResults : undefined}
        removeClippedSubviews={false}
        scrollEventThrottle={16}
        maxToRenderPerBatch={10}
        updateCellsBatchingPeriod={50}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0E27',
  },
  scrollContent: {
    paddingTop: 24,
    paddingBottom: 24,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 24,
    marginTop: 8,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(148, 163, 184, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.2)',
  },
  iconText: {
    color: '#F8FAFC',
    fontSize: 20,
  },
  playingInfo: {
    flex: 1,
    marginHorizontal: 12,
    alignItems: 'center',
  },
  playingLabel: {
    color: '#F8FAFC',
    fontSize: 12,
    letterSpacing: 1,
    marginBottom: 4,
  },
  playlistName: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '800',
  },
  coverWrapper: {
    marginHorizontal: 24,
    marginVertical: 32,
    borderRadius: 32,
    overflow: 'hidden',
    backgroundColor: '#1E293B',
    shadowColor: '#0EA5E9',
    shadowOpacity: 0.25,
    shadowRadius: 40,
    shadowOffset: { width: 0, height: 20 },
    elevation: 20,
  },
  coverImage: {
    width: '100%',
    aspectRatio: 1,
  },
  trackDetails: {
    marginTop: 8,
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  songTitle: {
    color: '#F8FAFC',
    fontSize: 28,
    fontWeight: '900',
    marginBottom: 6,
    letterSpacing: -0.5,
  },
  songArtist: {
    color: '#94A3B8',
    fontSize: 15,
    marginBottom: 4,
    fontWeight: '600',
  },
  playlistText: {
    color: '#64748B',
    fontSize: 13,
  },
  progressSection: {
    marginTop: 20,
    marginHorizontal: 24,
    marginBottom: 12,
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  progressLabel: {
    color: '#94A3B8',
    opacity: 1,
    fontSize: 11,
    fontWeight: '600',
  },
  controlsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    marginTop: 18,
    marginBottom: 12,
  },
  smallControl: {
    flex: 1,
    marginHorizontal: 6,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(148, 163, 184, 0.08)',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(148, 163, 184, 0.15)',
  },
  smallControlActive: {
    backgroundColor: '#0EA5E9',
    borderColor: '#0EA5E9',
  },
  smallControlText: {
    color: '#94A3B8',
    fontWeight: '700',
    fontSize: 11,
    letterSpacing: 0.5,
  },
  smallControlTextActive: {
    color: '#0F172A',
  },
  transportRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 20,
  },
  transportButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(148, 163, 184, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 16,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.2)',
  },
  transportIcon: {
    fontSize: 24,
    color: '#F8FAFC',
  },
  playButton: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#0EA5E9',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#0EA5E9',
    shadowOpacity: 0.4,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 15,
  },
  playText: {
    fontSize: 32,
    color: '#FFFFFF',
    fontWeight: '900',
  },
  iconRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 24,
    marginTop: 12,
    marginBottom: 16,
  },
  bottomIconButton: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: 'rgba(148, 163, 184, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.15)',
  },
  bottomIcon: {
    color: '#94A3B8',
    fontSize: 22,
  },
  bottomIconButtonPressed: {
    backgroundColor: 'rgba(14, 165, 233, 0.2)',
  },
  exploreSection: {
    marginTop: 16,
    marginBottom: 20,
  },
  exploreTitle: {
    color: '#F8FAFC',
    fontSize: 18,
    fontWeight: '800',
    marginLeft: 24,
    marginBottom: 12,
    letterSpacing: -0.3,
  },
  exploreScroll: {
    paddingLeft: 24,
  },
  exploreCard: {
    width: 160,
    borderRadius: 20,
    backgroundColor: 'rgba(30, 41, 59, 0.8)',
    marginRight: 12,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: 'rgba(148, 163, 184, 0.15)',
  },
  exploreImage: {
    width: '100%',
    height: 100,
  },
  exploreName: {
    color: '#F8FAFC',
    fontSize: 13,
    fontWeight: '800',
    marginTop: 10,
    marginHorizontal: 10,
  },
  exploreSubtitle: {
    color: '#64748B',
    fontSize: 11,
    marginTop: 4,
    marginHorizontal: 10,
    marginBottom: 8,
  },
  emptyContainer: {
    flex: 1,
    backgroundColor: '#0A0E27',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyText: {
    color: '#F8FAFC',
    fontSize: 16,
    textAlign: 'center',
  },
  searchCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(30, 41, 59, 0.8)',
    borderRadius: 14,
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 6,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.2)',
  },
  searchInput: {
    flex: 1,
    color: '#F8FAFC',
    fontSize: 15,
    paddingVertical: 0,
  },
  searchButton: {
    backgroundColor: '#0EA5E9',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginLeft: 12,
  },
  searchButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  searchingText: {
    color: '#0EA5E9',
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 6,
    fontWeight: '600',
  },
  footerLoader: {
    marginVertical: 20,
  },
  noResults: {
    flexGrow: 1,
  },
});
