// Types for NSFW / 18+ Module (Nekopoi & Hentai)

export interface NsfwPagination {
  current_page: number;
  total_pages: number;
  has_next: boolean;
}

export interface NsfwItem {
  title: string;
  slug: string;
  url: string;
  thumbnail: string;
  date?: string;
  description?: string;
  type?: string;
  category?: 'hentai' | 'jav' | 'neko';
}

export interface NekoReleaseItem {
  title: string;
  url: string;
  thumb?: string;
  thumbnail?: string;
  type?: string;
  upload_date?: string;
}

export interface NsfwDetail {
  title: string;
  thumb?: string;
  thumbnail?: string;
  synopsis?: string;
  genre?: string[];
  streamUrl?: string;
  streamServers?: {
    name: string;
    url: string;
  }[];
  downloadLinks?: {
    quality: string;
    links: { name: string; url: string }[];
  }[];
}
