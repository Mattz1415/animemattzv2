import axiosClient from './axiosClient';
import {
  ComicSummary,
  ComicDetail,
  ChapterDetail,
  ComicGenre,
  ComicPagination,
} from '../types/comic';

export const comicApi = {
  // Latest Comics
  getLatest: async (page = 1): Promise<{ komikList: ComicSummary[]; pagination?: ComicPagination }> => {
    const res = await axiosClient.get(`/comic/komikindo/latest/${page}`);
    const data = res.data;
    return {
      komikList: data?.komikList || data?.data || [],
      pagination: data?.pagination,
    };
  },

  // Comic Detail
  getDetail: async (slug: string): Promise<ComicDetail> => {
    const cleanSlug = slug.replace(/^\/comic\/komikindo\/detail\//, '').replace(/^\/komik\//, '').replace(/^\//, '');
    const res = await axiosClient.get(`/comic/komikindo/detail/${cleanSlug}`);
    return res.data?.data || res.data;
  },

  // Chapter Reader
  getChapter: async (slug: string): Promise<ChapterDetail> => {
    const cleanSlug = slug.replace(/^\/comic\/komikindo\/chapter\//, '').replace(/^\/chapter\//, '').replace(/^\//, '');
    const res = await axiosClient.get(`/comic/komikindo/chapter/${cleanSlug}`);
    return res.data?.data || res.data;
  },

  // Comic Search
  searchComic: async (query: string, page = 1): Promise<{ komikList: ComicSummary[]; pagination?: ComicPagination }> => {
    const res = await axiosClient.get(`/comic/komikindo/search/${encodeURIComponent(query)}/${page}`);
    const data = res.data;
    return {
      komikList: data?.komikList || data?.data || [],
      pagination: data?.pagination,
    };
  },

  // Comic Genres
  getGenres: async (): Promise<ComicGenre[]> => {
    const res = await axiosClient.get('/comic/komikindo/genres');
    const data = res.data;
    const list = data?.genreList || data?.data || data?.genres || (Array.isArray(data) ? data : []);
    return list.map((g: { name: string; value?: string; slug?: string }) => ({
      name: g.name,
      slug: g.value || g.slug || g.name.toLowerCase(),
    }));
  },
};
