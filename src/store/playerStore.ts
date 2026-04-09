import AsyncStorage from '@react-native-async-storage/async-storage';
import { Audio, AVPlaybackStatus } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Song } from '../types';

type RepeatMode = 'off' | 'one' | 'all';

type PlayerState = {
  currentTrack: Song | null;
  queue: Song[];
  isPlaying: boolean;
  isLoading: boolean;
  position: number;
  duration: number;
  shuffle: boolean;
  repeat: RepeatMode;
  localDownloads: Record<string, string>;
  selectTrack: (track: Song, queue?: Song[]) => Promise<void>;
  togglePlayPause: () => Promise<void>;
  seekTo: (seconds: number) => Promise<void>;
  playNext: () => Promise<void>;
  playPrevious: () => Promise<void>;
  toggleShuffle: () => void;
  toggleRepeat: () => void;
  addToQueue: (track: Song) => void;
  removeFromQueue: (trackId: string) => void;
  moveQueueItem: (from: number, to: number) => void;
  downloadTrack: (track: Song) => Promise<void>;
};

let soundInstance: Audio.Sound | null = null;
let isAudioModeConfigured = false;

function sourceForTrack(track: Song): string {
  if (track.localUri) {
    return track.localUri;
  }
  const preferred = track.downloadUrl.find((item) => item.quality === '320kbps') || track.downloadUrl[0];
  return preferred?.link || preferred?.url || '';
}

async function configureAudioMode() {
  if (isAudioModeConfigured) {
    return;
  }
  await Audio.setAudioModeAsync({
    allowsRecordingIOS: false,
    staysActiveInBackground: true,
    playsInSilentModeIOS: true,
    shouldDuckAndroid: true,
    playThroughEarpieceAndroid: false,
  });
  isAudioModeConfigured = true;
}

async function loadSound(track: Song, set: any, getStore: () => any) {
  await configureAudioMode();
  const source = sourceForTrack(track);
  if (!source) {
    set({ isLoading: false });
    return;
  }

  if (soundInstance) {
    try {
      await soundInstance.unloadAsync();
    } catch {
      // ignore unload failures
    }
    soundInstance.setOnPlaybackStatusUpdate(null);
    soundInstance = null;
  }

  soundInstance = new Audio.Sound();
  await soundInstance.loadAsync(
    { uri: source },
    { shouldPlay: true, progressUpdateIntervalMillis: 500 },
    false
  );

  soundInstance.setOnPlaybackStatusUpdate((status) => {
    if (!status) {
      return;
    }
    const playback = status as AVPlaybackStatus;
    if (!playback.isLoaded) {
      return;
    }
    set({
      position: playback.positionMillis / 1000,
      duration: playback.durationMillis ? playback.durationMillis / 1000 : 0,
      isPlaying: playback.isPlaying,
      isLoading: playback.isBuffering,
    });
    if (playback.didJustFinish && !playback.shouldPlay) {
      const state = getStore();
      if (state.repeat === 'one') {
        soundInstance?.replayAsync();
      } else {
        state.playNext();
      }
    }
  });

  await soundInstance.playAsync();
  set({ isLoading: false, isPlaying: true });
}

function getNextIndex(queue: Song[], currentId: string, shuffle: boolean, repeat: RepeatMode) {
  if (!queue.length) return -1;
  const currentIndex = queue.findIndex((item) => item.id === currentId);
  if (shuffle) {
    const nextIndex = Math.floor(Math.random() * queue.length);
    return nextIndex >= 0 ? nextIndex : 0;
  }
  if (currentIndex < 0) {
    return 0;
  }
  if (currentIndex === queue.length - 1) {
    return repeat === 'all' ? 0 : -1;
  }
  return currentIndex + 1;
}

const usePlayerStore = create<PlayerState>()(
  persist(
    (set, get) => ({
      currentTrack: null,
      queue: [],
      isPlaying: false,
      isLoading: false,
      position: 0,
      duration: 0,
      shuffle: false,
      repeat: 'off',
      localDownloads: {},
      selectTrack: async (track, queue) => {
        set({ currentTrack: track, queue: queue ?? get().queue, isLoading: true, position: 0, duration: 0 });
        await loadSound(track, set, get);
      },
      togglePlayPause: async () => {
        const { currentTrack, isPlaying } = get();
        if (!currentTrack || !soundInstance) return;
        try {
          if (isPlaying) {
            await soundInstance.pauseAsync();
            set({ isPlaying: false });
          } else {
            await soundInstance.playAsync();
            set({ isPlaying: true });
          }
        } catch {
          set({ isPlaying: false });
        }
      },
      seekTo: async (seconds) => {
        if (!soundInstance) return;
        await soundInstance.setPositionAsync(Math.floor(seconds * 1000));
        set({ position: seconds });
      },
      playNext: async () => {
        const { queue, currentTrack, shuffle, repeat } = get();
        if (!currentTrack) return;
        const nextIndex = getNextIndex(queue, currentTrack.id, shuffle, repeat);
        if (nextIndex < 0) {
          await soundInstance?.stopAsync();
          set({ isPlaying: false });
          return;
        }
        const nextTrack = queue[nextIndex];
        set({ currentTrack: nextTrack, isLoading: true, position: 0, duration: 0 });
        await loadSound(nextTrack, set, get);
      },
      playPrevious: async () => {
        const { queue, currentTrack } = get();
        if (!currentTrack) return;
        const index = queue.findIndex((item) => item.id === currentTrack.id);
        const previousIndex = index > 0 ? index - 1 : 0;
        const previousTrack = queue[previousIndex];
        set({ currentTrack: previousTrack, isLoading: true, position: 0, duration: 0 });
        await loadSound(previousTrack, set, get);
      },
      toggleShuffle: () => set((state) => ({ shuffle: !state.shuffle })),
      toggleRepeat: () =>
        set((state) => ({
          repeat: state.repeat === 'off' ? 'all' : state.repeat === 'all' ? 'one' : 'off',
        })),
      addToQueue: (track) => set((state) => ({ queue: [...state.queue.filter((item) => item.id !== track.id), track] })),
      removeFromQueue: (trackId) => set((state) => ({ queue: state.queue.filter((item) => item.id !== trackId) })),
      moveQueueItem: (from, to) =>
        set((state) => {
          const next = [...state.queue];
          const [item] = next.splice(from, 1);
          if (item) {
            next.splice(to, 0, item);
          }
          return { queue: next };
        }),
      downloadTrack: async (track) => {
        const uri = sourceForTrack(track);
        if (!uri) return;
        const filename = `${track.id}.mp3`;
        const localUri = `${FileSystem.documentDirectory}${filename}`;
        try {
          const { exists } = await FileSystem.getInfoAsync(localUri);
          if (!exists) {
            await FileSystem.downloadAsync(uri, localUri);
          }
          set((state) => ({
            localDownloads: { ...state.localDownloads, [track.id]: localUri },
            currentTrack: state.currentTrack?.id === track.id ? { ...track, localUri } : state.currentTrack,
          }));
        } catch {
          // ignore download errors
        }
      },
    }),
    {
      name: 'lokal-music-player-storage',
      getStorage: () => AsyncStorage,
      partialize: (state) => ({
        currentTrack: state.currentTrack,
        queue: state.queue,
        shuffle: state.shuffle,
        repeat: state.repeat,
        localDownloads: state.localDownloads,
      }),
    }
  )
);

export default usePlayerStore;
