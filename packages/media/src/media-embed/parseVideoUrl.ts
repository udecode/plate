import { isUrl } from '@udecode/plate-common';
import videoParser from 'js-video-url-parser';

import { EmbedUrlData } from '../media';

const YOUTUBE_PREFIX = 'https://www.youtube.com/embed/';
const VIMEO_PREFIX = 'https://player.vimeo.com/video/';
const DAILYMOTION_PREFIX = 'https://www.dailymotion.com/embed/video/';
const YOUKU_PREFIX = 'https://player.youku.com/embed/';
const COUB_PREFIX = 'https://coub.com/embed/';

export const VIDEO_PROVIDERS = [
  'youtube',
  'vimeo',
  'dailymotion',
  'youku',
  'coub',
];

export const parseVideoUrl = (url: string): EmbedUrlData | undefined => {
  if (!isUrl(url)) return;

  const videoData = videoParser.parse(url);
  if (videoData?.provider && videoData.id) {
    const { id, provider } = videoData;

    const providerUrls: Record<string, string> = {
      youtube: `${YOUTUBE_PREFIX}${id}`,
      vimeo: `${VIMEO_PREFIX}${id}`,
      dailymotion: `${DAILYMOTION_PREFIX}${id}`,
      youku: `${YOUKU_PREFIX}${id}`,
      coub: `${COUB_PREFIX}${id}`,
    };

    return {
      id,
      provider,
      url: providerUrls[provider],
    };
  }
};
