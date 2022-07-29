import { parseTwitterUrl } from './parseTwitterUrl';
import { parseVideoUrl } from './parseVideoUrl';

export type EmbedProviders =
  | 'twitter'
  | 'youtube'
  | 'vimeo'
  | 'dailymotion'
  | 'youku'
  | 'coub';

export type EmbedUrlData = {
  url?: string;
  provider?: EmbedProviders;
  id?: string;
};

export const parseEmbedUrl = (url: string): EmbedUrlData => {
  const twitterData = parseTwitterUrl(url);
  if (twitterData) return twitterData;

  const videoData = parseVideoUrl(url);
  if (videoData) return videoData;

  return {};
};
