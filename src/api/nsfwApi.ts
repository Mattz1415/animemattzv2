import axiosClient from './axiosClient';
import { NsfwItem, NsfwPagination, NekoReleaseItem, NsfwDetail } from '../types/nsfw';

export const nsfwApi = {
  // Latest Hentai
  getLatestHentai: async (page = 1): Promise<{ items: NsfwItem[]; pagination?: NsfwPagination }> => {
    try {
      const res = await axiosClient.get(`/anime/nekopoi/latest-hentai?page=${page}`);
      const data = res.data;
      const list = data?.data || (Array.isArray(data) ? data : []);
      return {
        items: list.map((item: NsfwItem) => ({ ...item, category: 'hentai' as const })),
        pagination: data?.pagination,
      };
    } catch (err) {
      console.error('[nsfwApi.getLatestHentai]', err);
      return { items: [] };
    }
  },

  // Latest JAV / 3D
  getLatestJav: async (page = 1): Promise<{ items: NsfwItem[]; pagination?: NsfwPagination }> => {
    try {
      const res = await axiosClient.get(`/anime/nekopoi/latest-jav?page=${page}`);
      const data = res.data;
      const list = data?.data || (Array.isArray(data) ? data : []);
      return {
        items: list.map((item: NsfwItem) => ({ ...item, category: 'jav' as const })),
        pagination: data?.pagination,
      };
    } catch (err) {
      console.error('[nsfwApi.getLatestJav]', err);
      return { items: [] };
    }
  },

  // Full Hentai List
  getHentaiList: async (): Promise<NsfwItem[]> => {
    try {
      const res = await axiosClient.get('/anime/nekopoi/hentai-list');
      const data = res.data;
      const list = data?.data || (Array.isArray(data) ? data : []);
      return list.map((item: NsfwItem) => ({ ...item, category: 'hentai' as const }));
    } catch (err) {
      console.error('[nsfwApi.getHentaiList]', err);
      return [];
    }
  },

  // Neko Releases
  getNekoReleases: async (page = 1): Promise<{ items: NekoReleaseItem[]; pagination?: NsfwPagination }> => {
    try {
      const res = await axiosClient.get(`/anime/neko/release/${page}`);
      const data = res.data;
      const list = data?.result || data?.data || (Array.isArray(data) ? data : []);
      return {
        items: list,
        pagination: data?.pagination,
      };
    } catch (err) {
      console.error('[nsfwApi.getNekoReleases]', err);
      return { items: [] };
    }
  },

  // Neko Search
  searchNeko: async (query: string): Promise<NsfwItem[]> => {
    try {
      const res = await axiosClient.get(`/anime/neko/search/${encodeURIComponent(query)}`);
      const data = res.data;
      return data?.result || data?.data || (Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('[nsfwApi.searchNeko]', err);
      return [];
    }
  },

  // Neko Detail / Stream
  getNekoDetail: async (url: string): Promise<NsfwDetail | null> => {
    try {
      const res = await axiosClient.get(`/anime/neko/get?url=${encodeURIComponent(url)}`);
      return res.data?.result || res.data?.data || res.data;
    } catch (err) {
      console.error('[nsfwApi.getNekoDetail]', err);
      return null;
    }
  },
};
