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
        <Text numberOfLines={1} style={styles.meta}>{song.primaryArtists}</Text>
        <Text numberOfLines={1} style={styles.meta}>{song.album.name} • {song.year}</Text>
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
    backgroundColor: '#0F172A',
    borderRadius: 20,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  cover: {
    width: 64,
    height: 64,
    borderRadius: 18,
    marginRight: 14,
  },
  info: {
    flex: 1,
  },
  songName: {
    color: '#F8FAFC',
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 4,
  },
  meta: {
    color: '#94A3B8',
    fontSize: 12,
  },
  addButton: {
    width: 38,
    height: 38,
    borderRadius: 14,
    backgroundColor: '#2563EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addText: {
    color: '#F8FAFC',
    fontSize: 20,
    fontWeight: '800',
    lineHeight: 20,
  },
});
