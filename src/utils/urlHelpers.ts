/**
 * URL and Slug Helpers for SankaVerse Anime & Comic Streaming
 */

export const cleanEpisodeSlug = (raw?: string): string => {
  if (!raw) return '';
  return raw
    .replace(/^https?:\/\/[^/]+/, '')
    .replace(/^\/anime\/episode\//, '')
    .replace(/^\/episode\//, '')
    .replace(/^\/donghua\/episode\//, '')
    .replace(/^\/watch\//, '')
    .replace(/^\//, '')
    .replace(/\/$/, '')
    .trim();
};

export const formatWatchHref = (raw?: string): string => {
  const cleaned = cleanEpisodeSlug(raw);
  return cleaned ? `/watch/${cleaned}` : '/';
};
