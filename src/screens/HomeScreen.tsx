import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import SongRow from '../components/SongRow';
import { RootStackParamList } from '../navigation/AppNavigator';
import { searchSongs } from '../services/saavnApi';
import usePlayerStore from '../store/playerStore';
import { Song } from '../types';

type HomeNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

export default function HomeScreen() {
  const navigation = useNavigation<HomeNavigationProp>();
  const [query, setQuery] = useState('');
  const [songs, setSongs] = useState<Song[]>([]);
  const [offset, setOffset] = useState(0);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
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

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Search songs</Text>
      <View style={styles.searchRow}>
        <TextInput
          placeholder="Search songs..."
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
      <View style={styles.metaRow}>
        <Text style={styles.metaText}>{songs.length} results</Text>
        <Pressable onPress={() => navigation.navigate('Queue')}>
          <Text style={styles.linkText}>Queue</Text>
        </Pressable>
      </View>
      {loading && songs.length === 0 ? (
        <ActivityIndicator size="large" color="#38BDF8" style={styles.loader} />
      ) : (
        <FlatList
          data={songs}
          keyExtractor={(item) => item.id}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={loading ? <ActivityIndicator color="#38BDF8" /> : null}
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
        />
      )}
      {searching && <Text style={styles.statusText}>Searching…</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    paddingBottom: 110,
  },
  title: {
    color: '#F8FAFC',
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 16,
  },
  searchRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#0F172A',
    borderRadius: 14,
    height: 48,
    paddingHorizontal: 16,
    color: '#F8FAFC',
  },
  searchButton: {
    width: 72,
    backgroundColor: '#38BDF8',
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchButtonText: {
    color: '#020617',
    fontWeight: '700',
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  metaText: {
    color: '#94A3B8',
  },
  linkText: {
    color: '#38BDF8',
    fontWeight: '600',
  },
  loader: {
    marginTop: 32,
  },
  statusText: {
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 8,
  },
});
