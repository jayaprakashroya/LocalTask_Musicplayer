import Slider from '@react-native-community/slider';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useMemo, useState } from 'react';
import { ActivityIndicator, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { RootStackParamList } from '../navigation/AppNavigator';
import usePlayerStore from '../store/playerStore';
import { formatTime } from '../utils/time';

type PlayerScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Player'>;

export default function PlayerScreen() {
  const [sliderValue, setSliderValue] = useState(0);
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

  const progress = useMemo(() => {
    if (!duration) return 0;
    return Math.min(position / duration, 1);
  }, [position, duration]);

  const track = currentTrack;
  if (!track) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Select a song from Home to start playing.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.artworkFrame}>
        <Image source={{ uri: track.imageUrl }} style={styles.artwork} />
      </View>
      <Text style={styles.title}>{track.name}</Text>
      <Text style={styles.subtitle}>{track.primaryArtists}</Text>
      <Text style={styles.album}>{track.album.name} • {track.year}</Text>
      <View style={styles.seekContainer}>
        <Text style={styles.timeText}>{formatTime(position)}</Text>
        <Text style={styles.timeText}>{formatTime(duration)}</Text>
      </View>
      <Slider
        value={sliderValue || progress}
        minimumValue={0}
        maximumValue={1}
        minimumTrackTintColor="#38BDF8"
        maximumTrackTintColor="#475569"
        thumbTintColor="#38BDF8"
        onValueChange={(value) => setSliderValue(value)}
        onSlidingComplete={async (value) => {
          const seekSeconds = value * duration;
          setSliderValue(0);
          await seekTo(seekSeconds);
        }}
      />
      <View style={styles.controlsRow}>
        <Pressable onPress={toggleShuffle} style={[styles.controlButton, shuffle && styles.controlButtonActive]}>
          <Text style={styles.controlText}>SHUFFLE</Text>
        </Pressable>
        <Pressable onPress={toggleRepeat} style={[styles.controlButton, repeat !== 'off' && styles.controlButtonActive]}>
          <Text style={styles.controlText}>{repeat.toUpperCase()}</Text>
        </Pressable>
      </View>
      <View style={styles.transportRow}>
        <Pressable onPress={playPrevious} style={styles.transportButton}>
          <Text style={styles.transportIcon}>⏮️</Text>
        </Pressable>
        <Pressable onPress={togglePlayPause} style={styles.playPauseButton}>
          {isLoading ? <ActivityIndicator color="#020617" /> : <Text style={styles.playPauseText}>{isPlaying ? 'Pause' : 'Play'}</Text>}
        </Pressable>
        <Pressable onPress={playNext} style={styles.transportButton}>
          <Text style={styles.transportIcon}>⏭️</Text>
        </Pressable>
      </View>
      <View style={styles.actionRow}>
        <Pressable onPress={() => addToQueue(track)} style={styles.actionButton}>
          <Text style={styles.actionText}>Add to queue</Text>
        </Pressable>
        <Pressable onPress={() => downloadTrack(track)} style={styles.actionButton}>
          <Text style={styles.actionText}>Download</Text>
        </Pressable>
      </View>
      <Pressable onPress={() => navigation.navigate('Queue')} style={styles.queueButton}>
        <Text style={styles.queueText}>Open queue</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingBottom: 110,
    justifyContent: 'space-between',
  },
  artworkFrame: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: 28,
    backgroundColor: '#111827',
  },
  artwork: {
    width: '100%',
    height: '100%',
  },
  title: {
    color: '#F8FAFC',
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    color: '#94A3B8',
    fontSize: 16,
    marginBottom: 4,
  },
  album: {
    color: '#94A3B8',
    marginBottom: 20,
  },
  seekContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  timeText: {
    color: '#94A3B8',
    fontSize: 12,
  },
  controlsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  controlButton: {
    flex: 1,
    marginHorizontal: 6,
    borderRadius: 18,
    paddingVertical: 12,
    backgroundColor: '#111827',
    alignItems: 'center',
  },
  controlButtonActive: {
    backgroundColor: '#1D4ED8',
  },
  controlText: {
    color: '#E2E8F0',
    fontWeight: '600',
  },
  transportRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
    marginTop: 28,
  },
  transportButton: {
    padding: 14,
  },
  transportIcon: {
    fontSize: 24,
    color: '#E2E8F0',
  },
  playPauseButton: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 28,
    backgroundColor: '#38BDF8',
  },
  playPauseText: {
    color: '#020617',
    fontWeight: '700',
    fontSize: 16,
  },
  actionRow: {
    marginTop: 26,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 6,
    borderRadius: 18,
    backgroundColor: '#111827',
    paddingVertical: 14,
    alignItems: 'center',
  },
  actionText: {
    color: '#E2E8F0',
    fontWeight: '600',
  },
  queueButton: {
    marginTop: 22,
    backgroundColor: '#0F172A',
    paddingVertical: 16,
    borderRadius: 18,
    alignItems: 'center',
  },
  queueText: {
    color: '#38BDF8',
    fontWeight: '700',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  emptyText: {
    color: '#94A3B8',
    textAlign: 'center',
    fontSize: 16,
  },
});
