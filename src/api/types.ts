export type SaavnSearchImage = {
  quality: string;
  link: string;
  url?: string;
};

export type SaavnDownloadUrl = {
  quality: string;
  link?: string;
  url?: string;
};

export type SaavnSearchSong = {
  id: string;
  name: string;
  album: {
    id: string;
    name: string;
    url?: string;
  };
  year?: string;
  releaseDate?: string | null;
  duration: string | number;
  primaryArtists?: string;
  primaryArtistsId?: string;
  featuredArtists?: string;
  explicitContent?: number;
  playCount?: string;
  language?: string;
  hasLyrics?: string;
  url?: string;
  copyright?: string;
  image?: SaavnSearchImage[];
  downloadUrl?: SaavnDownloadUrl[];
};

export type SaavnSearchResponse = {
  status: string;
  data: {
    results: SaavnSearchSong[];
    total: number;
    start: number;
  };
};
