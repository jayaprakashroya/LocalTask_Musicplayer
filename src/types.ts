export type ImageAsset = {
  quality: string;
  link: string;
  url?: string;
};

export type DownloadUrl = {
  quality: string;
  link?: string;
  url?: string;
};

export type Song = {
  id: string;
  name: string;
  album: {
    id: string;
    name: string;
  };
  primaryArtists: string;
  year?: string;
  duration: number;
  imageUrl: string;
  downloadUrl: DownloadUrl[];
  localUri?: string;
};
