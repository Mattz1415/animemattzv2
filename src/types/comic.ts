// Types for Comic / Manga / Manhwa Module (Komikindo & Kiryuu)

export interface ComicPagination {
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
  nextPage?: number;
}

export interface ComicSummary {
  title: string;
  slug: string;
  image: string;
  type?: 'Manga' | 'Manhwa' | 'Manhua' | string;
  color?: boolean;
  latestChapter?: string;
  rating?: string;
  score?: string;
  status?: string;
}

export interface ComicGenre {
  name: string;
  slug: string;
}

export interface ComicChapterItem {
  title: string;
  slug: string;
  releaseTime?: string;
}

export interface ComicDetail {
  id: string;
  title: string;
  image: string;
  rating?: string;
  votes?: string;
  detail?: {
    alternativeTitle?: string;
    status?: string;
    author?: string;
    illustrator?: string;
    type?: string;
    theme?: string | null;
  };
  genres?: ComicGenre[];
  description?: string;
  firstChapter?: {
    title: string;
    slug: string;
  };
  latestChapter?: {
    title: string;
    slug: string;
  };
  chapters?: ComicChapterItem[];
  spoilerImages?: string[];
  similarManga?: {
    title: string;
    slug: string;
    image: string;
  }[];
}

export interface ChapterImage {
  id: number | string;
  url: string;
}

export interface ChapterDetail {
  id?: string;
  title: string;
  navigation?: {
    prev?: string | null;
    next?: string | null;
  };
  allChapterSlug?: string;
  images: ChapterImage[];
  thumbnail?: string;
  komikInfo?: {
    title: string;
    slug: string;
  };
}
