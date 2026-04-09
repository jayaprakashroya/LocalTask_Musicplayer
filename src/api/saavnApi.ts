import { Song } from '../types';
import { SaavnSearchResponse } from './types';

const BASE_URL = 'https://saavn.sumit.co';

function parseSong(song: any): Song {
  const imageItem = (song.image ?? song.imageUrl ?? []).find((item: any) => item.quality === '500x500') || (song.image ?? song.imageUrl ?? [])[0];

  return {
    id: song.id,
    name: song.name,
    album: {
      id: song.album?.id ?? '',
      name: song.album?.name ?? song.album?.title ?? 'Unknown Album',
    },
    primaryArtists: song.primaryArtists || song.artists?.primary?.map((artist: any) => artist.name).join(', ') || 'Unknown Artist',
    year: song.year || '',
    duration: Number(song.duration) || 0,
    imageUrl: imageItem?.link || imageItem?.url || '',
    downloadUrl: song.downloadUrl || song.download_url || [],
  };
}

export async function searchSongs(query: string, offset = 0, limit = 20): Promise<{ songs: Song[]; total: number }> {
  const encoded = encodeURIComponent(query.trim());
  const url = `${BASE_URL}/api/search/songs?query=${encoded}&limit=${limit}&offset=${offset}`;
  const response = await fetch(url);
  const json = (await response.json()) as SaavnSearchResponse;
  const results = json?.data?.results ?? [];

  return {
    songs: results.map(parseSong),
    total: Number(json?.data?.total ?? results.length),
  };
}

export async function getSongDetails(id: string): Promise<Song | null> {
  const response = await fetch(`${BASE_URL}/api/songs/${id}`);
  const json = await response.json();
  const data = json?.data?.[0];
  return data ? parseSong(data) : null;
}
