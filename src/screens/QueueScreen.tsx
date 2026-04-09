import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { RootStackParamList } from '../navigation/AppNavigator';
import usePlayerStore from '../store/playerStore';
import { Song } from '../types';

type QueueNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Queue'>;

function QueueItem({ song, index }: { song: Song; index: number }) {
  const navigation = useNavigation<QueueNavigationProp>();
  const moveQueueItem = usePlayerStore((state) => state.moveQueueItem);
  const removeFromQueue = usePlayerStore((state) => state.removeFromQueue);
  const selectTrack = usePlayerStore((state) => state.selectTrack);

  return (
    <View style={styles.itemRow}>
      <View style={styles.itemTextBlock}>
        <Text style={styles.itemTitle}>{song.name}</Text>
        <Text style={styles.itemSubtitle}>{song.primaryArtists}</Text>
      </View>
      <View style={styles.itemActions}>
        <Pressable onPress={() => moveQueueItem(index, Math.max(index - 1, 0))} style={styles.actionButton}>
          <Text style={styles.actionLabel}>↑</Text>
        </Pressable>
        <Pressable onPress={() => moveQueueItem(index, index + 1)} style={styles.actionButton}>
          <Text style={styles.actionLabel}>↓</Text>
        </Pressable>
        <Pressable onPress={() => removeFromQueue(song.id)} style={styles.actionButton}>
          <Text style={styles.actionLabel}>✕</Text>
        </Pressable>
        <Pressable
          onPress={() => {
            selectTrack(song);
            navigation.navigate('Player');
          }}
          style={styles.playButton}
        >
          <Text style={styles.playLabel}>Play</Text>
        </Pressable>
      </View>
    </View>
  );
}

export default function QueueScreen() {
  const queue = usePlayerStore((state) => state.queue);
  const currentTrack = usePlayerStore((state) => state.currentTrack);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Your queue</Text>
      {queue.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Add a song from Home to build your playback queue.</Text>
        </View>
      ) : (
        <FlatList
          data={queue}
          keyExtractor={(item) => item.id}
          renderItem={({ item, index }) => <QueueItem song={item} index={index} />}
          ListHeaderComponent={
            currentTrack ? (
              <Text style={styles.nowPlaying}>Now playing: {currentTrack.name}</Text>
            ) : null
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    paddingBottom: 110,
  },
  header: {
    color: '#F8FAFC',
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: '#94A3B8',
    fontSize: 16,
    textAlign: 'center',
  },
  itemRow: {
    backgroundColor: '#0F172A',
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
  },
  itemTextBlock: {
    marginBottom: 10,
  },
  itemTitle: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '700',
  },
  itemSubtitle: {
    color: '#94A3B8',
    marginTop: 4,
  },
  itemActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  actionButton: {
    marginRight: 8,
    backgroundColor: '#1E293B',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  actionLabel: {
    color: '#E2E8F0',
    fontWeight: '700',
  },
  playButton: {
    marginTop: 6,
    backgroundColor: '#2563EB',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  playLabel: {
    color: '#F8FAFC',
    fontWeight: '700',
  },
  nowPlaying: {
    color: '#38BDF8',
    marginBottom: 14,
    fontWeight: '600',
  },
});
