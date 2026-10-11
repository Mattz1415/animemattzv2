// Types for Anime Module (Otakudesu, Donghua, Schedule, Episode)

export interface AnimeHomeData {
  ongoing?: {
    href: string;
    otakudesuUrl: string;
    animeList: AnimeSummary[];
  };
  completed?: {
    href: string;
    otakudesuUrl: string;
    animeList: CompletedAnimeSummary[];
  };
}

export interface AnimeSummary {
  title: string;
  poster: string;
  episodes: number | string;
  releaseDay?: string;
  latestReleaseDate?: string;
  animeId: string;
  href: string;
  otakudesuUrl?: string;
  score?: string;
}

export interface CompletedAnimeSummary {
  title: string;
  poster: string;
  episodes: number | string;
  score: string;
  lastReleaseDate: string;
  animeId: string;
  href: string;
  otakudesuUrl?: string;
}

export interface GenreItem {
  genre: string;
  href: string;
  slug?: string;
  otakudesuUrl?: string;
}

export interface ScheduleAnimeItem {
  title: string;
  animeId?: string;
  slug?: string;
  href?: string;
  url?: string;
  poster?: string;
  otakudesuUrl?: string;
}

export interface ScheduleItem {
  day: string;
  animeList?: ScheduleAnimeItem[];
  anime_list?: ScheduleAnimeItem[];
}

export interface AnimeDetail {
  title: string;
  poster: string;
  japanese?: string;
  score?: string;
  producers?: string;
  type?: string;
  status?: string;
  episodes?: string | number;
  duration?: string;
  aired?: string;
  studios?: string;
  batch?: {
    title: string;
    href: string;
    batchId?: string;
    otakudesuUrl?: string;
  } | null;
  synopsis?: string | { paragraphs?: string[]; connections?: any[] } | any;
  genreList?: {
    title: string;
    href: string;
    genreId?: string;
    otakudesuUrl?: string;
  }[];
  episodeList?: EpisodeListItem[];
  recommendedAnimeList?: {
    title: string;
    poster: string;
    animeId: string;
    href: string;
    otakudesuUrl?: string;
  }[];
  isFallback?: boolean;
  rawSlug?: string;
  relatedMatches?: AnimeSummary[];
  season?: string;
  demographics?: string;
  rating?: string;
  source?: string;
  isDonghua?: boolean;
  voiceActors?: {
    character: string;
    seiyuu: string;
    role: string;
  }[];
}

export interface EpisodeListItem {
  title: string;
  eps: number | string;
  date: string;
  episodeId: string;
  href: string;
  otakudesuUrl?: string;
}

export interface StreamQualityServer {
  title: string;
  serverId: string;
  href: string;
}

export interface StreamQualityGroup {
  title: string;
  serverList: StreamQualityServer[];
}

export interface DownloadUrlItem {
  title: string;
  url: string;
}

export interface DownloadQualityGroup {
  title: string;
  size?: string;
  urls: DownloadUrlItem[];
}

export interface EpisodeDetail {
  title: string;
  animeId?: string;
  releaseTime?: string;
  defaultStreamingUrl: string;
  hasPrevEpisode: boolean;
  prevEpisode?: {
    title: string;
    episodeId: string;
    href: string;
    otakudesuUrl?: string;
  } | null;
  hasNextEpisode: boolean;
  nextEpisode?: {
    title: string;
    episodeId: string;
    href: string;
    otakudesuUrl?: string;
  } | null;
  server?: {
    qualities: StreamQualityGroup[];
  };
  downloadUrl?: {
    qualities: DownloadQualityGroup[];
  };
  info?: {
    credit?: string;
    encoder?: string;
    duration?: string;
    type?: string;
    genre?: string;
    status?: string;
  };
}

export interface BatchDetail {
  title: string;
  animeId?: string;
  downloadUrl?: {
    qualities: DownloadQualityGroup[];
  };
}

export interface DonghuaSummary {
  title: string;
  slug: string;
  poster: string;
  status?: string;
  type?: string;
  current_episode?: string;
  href?: string;
  anichinUrl?: string;
}

export interface DonghuaHomeData {
  latest_release?: DonghuaSummary[];
  completed_donghua?: DonghuaSummary[];
}

export interface DonghuaDetail {
  title: string;
  poster: string;
  synopsis?: string;
  genres?: string[];
  status?: string;
  episodes?: {
    title: string;
    slug: string;
  }[];
}

export interface DonghuaEpisode {
  title: string;
  streamUrl?: string;
  prevEpisode?: string | null;
  nextEpisode?: string | null;
}
