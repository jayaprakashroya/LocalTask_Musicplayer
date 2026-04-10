import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import SongRow from '../components/SongRow';
import { RootStackParamList } from '../navigation/AppNavigator';
import { searchSongs } from '../services/saavnApi';
import usePlayerStore from '../store/playerStore';
import { Song } from '../types';

type HomeNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

const tabs = ['All', 'Music', 'Podcasts'];

const featuredCollections = [
  {
    id: 'latest-telugu',
    title: 'Latest Telugu',
    subtitle: 'Fresh hits',
    image: 'https://placehold.co/240x240/111827/38BDF8?text=Latest',
  },
  {
    id: 'keervani-hits',
    title: 'Keeravani Hits',
    subtitle: 'Top tracks',
    image: 'https://placehold.co/240x240/111827/10B981?text=Hits',
  },
  {
    id: 'trending-now',
    title: 'Trending Now',
    subtitle: 'Popular picks',
    image: 'https://placehold.co/240x240/111827/F472B6?text=Trend',
  },
];

const pickedForYou = [
  {
    id: 'sad-feels',
    title: 'I-Pop Sad Feels',
    subtitle: 'Playlist',
    image: 'https://placehold.co/360x200/0F172A/38BDF8?text=Sad+Feels',
  },
];

const partyAlbums = [
  {
    id: 'latest-dance-telugu',
    title: 'Latest Dance Telugu',
    image: 'https://placehold.co/220x220/111827/EF4444?text=Dance',
  },
  {
    id: 'hot-hits-telugu',
    title: 'Hot Hits Telugu',
    image: 'https://placehold.co/220x220/111827/F59E0B?text=Hot',
  },
  {
    id: 'devotional',
    title: 'Soul Vibes',
    image: 'https://placehold.co/220x220/111827/14B8A6?text=Vibes',
  },
];

const albums = [
  {
    id: 'album-1',
    title: 'Retro Telugu',
    subtitle: 'Album',
    image: 'https://placehold.co/220x220/111827/3B82F6?text=Retro',
  },
  {
    id: 'album-2',
    title: 'Chill Beats',
    subtitle: 'Album',
    image: 'https://placehold.co/220x220/111827/8B5CF6?text=Chill',
  },
  {
    id: 'album-3',
    title: 'Acoustic Moods',
    subtitle: 'Album',
    image: 'https://placehold.co/220x220/111827/EC4899?text=Acoustic',
  },
];

export default function HomeScreen() {
  const navigation = useNavigation<HomeNavigationProp>();
  const [query, setQuery] = useState('');
  const [songs, setSongs] = useState<Song[]>([]);
  const [offset, setOffset] = useState(0);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [activeTab, setActiveTab] = useState('All');
  const addToQueue = usePlayerStore((state) => state.addToQueue);
  const selectTrack = usePlayerStore((state) => state.selectTrack);

  useEffect(() => {
    fetchSongs(true);
  }, []);

  async function fetchSongs(reset = false) {
    if (!query.trim()) return;
    setLoading(true);
    const nextOffset = reset ? 0 : offset;
    try {
      const result = await searchSongs(query, nextOffset);
      setSongs(reset ? result.songs : [...songs, ...result.songs]);
      setOffset(nextOffset + result.songs.length);
      setTotal(result.total);
    } finally {
      setLoading(false);
    }
  }

  const handleSearch = async () => {
    setSearching(true);
    await fetchSongs(true);
    setSearching(false);
  };

  const handleLoadMore = async () => {
    if (loading || songs.length >= total) return;
    await fetchSongs(false);
  };

  const handleCardPress = async (title: string) => {
    setQuery(title);
    setSearching(true);
    await fetchSongs(true);
    setSearching(false);
  };

  const handlePlayPress = async (title: string) => {
    try {
      const result = await searchSongs(title, 0);
      if (result.songs.length > 0) {
        selectTrack(result.songs[0], result.songs);
        navigation.navigate('Player');
      }
    } catch (error) {
      console.error('Error playing songs:', error);
    }
  };

  const renderHeader = () => (
    <>
      <View style={styles.topRow}>
        <View style={styles.avatarWrapper}>
          <Text style={styles.avatarText}>J</Text>
        </View>
        <View style={styles.tabGroup}>
          {tabs.map((tab) => (
            <Pressable
              key={tab}
              onPress={() => setActiveTab(tab)}
              style={[styles.tabButton, activeTab === tab && styles.tabButtonActive]}
            >
              <Text style={[styles.tabLabel, activeTab === tab && styles.tabLabelActive]}>{tab}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={styles.searchCard}>
        <TextInput
          placeholder="Search songs, artists or albums"
          placeholderTextColor="#94A3B8"
          value={query}
          onChangeText={setQuery}
          style={styles.searchInput}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
        />
        <Pressable style={styles.searchButton} onPress={handleSearch}>
          <Text style={styles.searchButtonText}>Go</Text>
        </Pressable>
      </View>

      <Text style={styles.sectionTitle}>Browse collections</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
        {featuredCollections.map((item) => (
          <Pressable key={item.id} onPress={() => handleCardPress(item.title)} style={styles.collectionCard}>
            <Image source={{ uri: item.image }} style={styles.collectionImage} />
            <Text style={styles.collectionName}>{item.title}</Text>
            <Text style={styles.collectionSubtitle}>{item.subtitle}</Text>
          </Pressable>
        ))}
      </ScrollView>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionLabel}>Picked for you</Text>
        <Pressable style={styles.actionChip} onPress={() => handleCardPress('Sad Feels')}>
          <Text style={styles.actionChipText}>More</Text>
        </Pressable>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
        {pickedForYou.map((item) => (
          <Pressable key={item.id} onPress={() => handleCardPress(item.title)} style={styles.largeCard}>
            <Image source={{ uri: item.image }} style={styles.largeCardImage} />
            <View style={styles.largeCardContent}>
              <Text style={styles.largeCardTitle}>{item.title}</Text>
              <Text style={styles.largeCardSubtitle}>{item.subtitle}</Text>
            </View>
            <Pressable style={styles.playButton} onPress={() => handlePlayPress(item.title)}>
              <Text style={styles.playButtonText}>▶</Text>
            </Pressable>
          </Pressable>
        ))}
      </ScrollView>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionLabel}>Party</Text>
        <Pressable style={styles.actionChip} onPress={() => handleCardPress('Party Mix')}>
          <Text style={styles.actionChipText}>See all</Text>
        </Pressable>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
        {partyAlbums.map((item) => (
          <Pressable key={item.id} onPress={() => handleCardPress(item.title)} style={styles.smallCard}>
            <Image source={{ uri: item.image }} style={styles.smallCardImage} />
            <Text style={styles.smallCardTitle}>{item.title}</Text>
          </Pressable>
        ))}
      </ScrollView>

      <View style={styles.statusRow}>
        <Text style={styles.metaText}>{songs.length} results</Text>
        <Pressable onPress={() => navigation.navigate('Queue')} style={styles.queueCard}>
          <Text style={styles.queueLabel}>Open queue</Text>
        </Pressable>
      </View>

      <Text style={styles.sectionTitle}>New albums</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
        {albums.map((item) => (
          <Pressable key={item.id} onPress={() => handleCardPress(item.title)} style={styles.albumCard}>
            <Image source={{ uri: item.image }} style={styles.albumImage} />
            <Text style={styles.albumTitle}>{item.title}</Text>
            <Text style={styles.albumSubtitle}>{item.subtitle}</Text>
          </Pressable>
        ))}
      </ScrollView>

      <Text style={styles.sectionTitle}>Your playlist</Text>
    </>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={songs}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        ListFooterComponent={loading ? <ActivityIndicator color="#38BDF8" style={styles.footerLoader} /> : null}
        ListEmptyComponent={!loading ? (
          <View style={styles.emptyList}>
            <Text style={styles.emptyText}>Search to find songs, playlists and albums.</Text>
          </View>
        ) : null}
        contentContainerStyle={songs.length === 0 ? styles.flatEmpty : undefined}
        renderItem={({ item }) => (
          <SongRow
            song={item}
            onPress={() => {
              selectTrack(item, songs);
              navigation.navigate('Player');
            }}
            onAddQueue={() => addToQueue(item)}
          />
        )}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        showsVerticalScrollIndicator={false}
      />
      {searching && <Text style={styles.searchingText}>Searching…</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 16,
    backgroundColor: '#080A12',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 18,
  },
  avatarWrapper: {
    width: 48,
    height: 48,
    borderRadius: 18,
    backgroundColor: '#111827',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#38BDF8',
    fontWeight: '800',
    fontSize: 18,
  },
  tabGroup: {
    flexDirection: 'row',
    gap: 8,
  },
  tabButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 999,
    backgroundColor: '#0F172A',
  },
  tabButtonActive: {
    backgroundColor: '#22C55E',
  },
  tabLabel: {
    color: '#F8FAFC',
    fontWeight: '700',
  },
  tabLabelActive: {
    color: '#020617',
  },
  sectionTitle: {
    color: '#F8FAFC',
    fontSize: 22,
    fontWeight: '800',
    marginHorizontal: 16,
    marginBottom: 14,
  },
  collectionCard: {
    width: 180,
    borderRadius: 24,
    backgroundColor: '#0F172A',
    marginLeft: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  collectionImage: {
    width: '100%',
    height: 110,
    borderRadius: 20,
    marginBottom: 14,
  },
  collectionName: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 4,
  },
  collectionSubtitle: {
    color: '#94A3B8',
    fontSize: 12,
  },
  horizontalScroll: {
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sectionLabel: {
    color: '#F8FAFC',
    fontSize: 18,
    fontWeight: '800',
  },
  actionChip: {
    backgroundColor: '#0F172A',
    borderRadius: 16,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  actionChipText: {
    color: '#38BDF8',
    fontWeight: '700',
  },
  largeCard: {
    width: 300,
    borderRadius: 28,
    backgroundColor: '#111827',
    marginLeft: 16,
    overflow: 'hidden',
  },
  largeCardImage: {
    width: '100%',
    height: 160,
  },
  largeCardContent: {
    padding: 16,
  },
  largeCardTitle: {
    color: '#F8FAFC',
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 6,
  },
  largeCardSubtitle: {
    color: '#94A3B8',
    fontSize: 12,
  },
  playButton: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    width: 42,
    height: 42,
    borderRadius: 16,
    backgroundColor: '#38BDF8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButtonText: {
    color: '#020617',
    fontWeight: '800',
  },
  smallCard: {
    width: 180,
    borderRadius: 22,
    backgroundColor: '#0F172A',
    marginLeft: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  smallCardImage: {
    width: '100%',
    height: 120,
    borderRadius: 18,
    marginBottom: 12,
  },
  smallCardTitle: {
    color: '#F8FAFC',
    fontSize: 15,
    fontWeight: '800',
  },
  searchCard: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 14,
    backgroundColor: '#020617',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#1E293B',
    padding: 12,
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#0F172A',
    borderRadius: 14,
    height: 50,
    paddingHorizontal: 18,
    color: '#F8FAFC',
    fontSize: 16,
  },
  searchButton: {
    width: 72,
    backgroundColor: '#38BDF8',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  searchButtonText: {
    color: '#020617',
    fontWeight: '800',
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 10,
  },
  metaText: {
    color: '#94A3B8',
  },
  queueCard: {
    backgroundColor: '#0F172A',
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  queueLabel: {
    color: '#38BDF8',
    fontWeight: '700',
  },
  albumCard: {
    width: 180,
    borderRadius: 24,
    backgroundColor: '#0F172A',
    marginLeft: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  albumImage: {
    width: '100%',
    height: 140,
    borderRadius: 20,
    marginBottom: 12,
  },
  albumTitle: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 4,
  },
  albumSubtitle: {
    color: '#94A3B8',
    fontSize: 12,
  },
  emptyText: {
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 24,
    fontSize: 16,
    paddingHorizontal: 20,
  },
  emptyList: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  flatEmpty: {
    flexGrow: 1,
  },
  footerLoader: {
    marginVertical: 20,
  },
  searchingText: {
    color: '#94A3B8',
    textAlign: 'center',
    marginBottom: 16,
  },
});
