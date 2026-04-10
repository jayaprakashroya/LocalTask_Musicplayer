import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { usePlayerStore } from '../../store';
import { formatTime } from '../../utils/time';

type MiniPlayerNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

export default function MiniPlayer() {
  const navigation = useNavigation<MiniPlayerNavigationProp>();
  const currentTrack = usePlayerStore((state) => state.currentTrack);
  const isPlaying = usePlayerStore((state) => state.isPlaying);
  const position = usePlayerStore((state) => state.position);
  const duration = usePlayerStore((state) => state.duration);
  const togglePlayPause = usePlayerStore((state) => state.togglePlayPause);

  if (!currentTrack) {
    return null;
  }

  const progress = duration ? Math.min(position / duration, 1) : 0;

  return (
    <Pressable style={styles.container} onPress={() => navigation.navigate('Player')}> 
      <Image source={{ uri: currentTrack.imageUrl }} style={styles.cover} />
      <View style={styles.info}>
        <Text numberOfLines={1} style={styles.title}>{currentTrack.name}</Text>
        <Text numberOfLines={1} style={styles.artist}>{currentTrack.primaryArtists}</Text>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
        </View>
      </View>
      <Pressable onPress={togglePlayPause} style={styles.controlButton}>
        <Text style={styles.controlText}>{isPlaying ? '❚❚' : '▶️'}</Text>
      </Pressable>
      <Text style={styles.timeText}>{formatTime(position)}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 12,
    right: 12,
    bottom: 12,
    backgroundColor: '#020617',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#334155',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
  },
  cover: {
    width: 56,
    height: 56,
    borderRadius: 16,
  },
  info: {
    flex: 1,
  },
  title: {
    color: '#F8FAFC',
    fontWeight: '700',
    marginBottom: 2,
  },
  artist: {
    color: '#94A3B8',
    fontSize: 12,
  },
  progressBar: {
    height: 4,
    width: '100%',
    backgroundColor: '#1E293B',
    borderRadius: 2,
    marginTop: 8,
  },
  progressFill: {
    height: 4,
    backgroundColor: '#38BDF8',
    borderRadius: 2,
  },
  controlButton: {
    width: 46,
    height: 46,
    borderRadius: 16,
    backgroundColor: '#111827',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  controlText: {
    color: '#38BDF8',
    fontSize: 18,
  },
  timeText: {
    color: '#94A3B8',
    fontSize: 12,
    width: 42,
    textAlign: 'right',
    marginLeft: 12,
  },
});
