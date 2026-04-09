import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { Song } from '../types';

type Props = {
  song: Song;
  onPress: () => void;
  onAddQueue: () => void;
};

export default function SongRow({ song, onPress, onAddQueue }: Props) {
  return (
    <Pressable onPress={onPress} style={styles.container}>
      <Image source={{ uri: song.imageUrl }} style={styles.cover} />
      <View style={styles.info}>
        <Text style={styles.songName}>{song.name}</Text>
        <Text style={styles.meta}>{song.primaryArtists}</Text>
        <Text style={styles.meta}>{song.album.name} • {song.year}</Text>
      </View>
      <Pressable onPress={onAddQueue} style={styles.addButton}>
        <Text style={styles.addText}>+</Text>
      </Pressable>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111827',
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
  },
  cover: {
    width: 64,
    height: 64,
    borderRadius: 14,
    marginRight: 12,
  },
  info: {
    flex: 1,
  },
  songName: {
    color: '#F8FAFC',
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 4,
  },
  meta: {
    color: '#94A3B8',
    fontSize: 12,
  },
  addButton: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: '#2563EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addText: {
    color: '#F8FAFC',
    fontSize: 18,
    fontWeight: '700',
  },
});
