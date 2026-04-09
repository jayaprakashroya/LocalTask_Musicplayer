import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Song } from '../types';

type QueueState = {
  queue: Song[];
  setQueue: (tracks: Song[]) => void;
  addToQueue: (track: Song) => void;
  removeFromQueue: (trackId: string) => void;
  moveQueueItem: (from: number, to: number) => void;
  clearQueue: () => void;
};

const useQueueStore = create<QueueState>()(
  persist(
    (set) => ({
      queue: [],
      setQueue: (tracks) => set({ queue: tracks }),
      addToQueue: (track) =>
        set((state) => ({
          queue: [...state.queue.filter((item) => item.id !== track.id), track],
        })),
      removeFromQueue: (trackId) => set((state) => ({ queue: state.queue.filter((item) => item.id !== trackId) })),
      moveQueueItem: (from, to) =>
        set((state) => {
          const next = [...state.queue];
          const [item] = next.splice(from, 1);
          if (!item) return { queue: state.queue };
          const destination = Math.max(0, Math.min(to, next.length));
          next.splice(destination, 0, item);
          return { queue: next };
        }),
      clearQueue: () => set({ queue: [] }),
    }),
    {
      name: 'lokal-queue-store',
      getStorage: () => localStorage as any,
    }
  )
);

export default useQueueStore;
