import type { EmbedUrlData } from '../media/parseMediaUrl';

const twitterRegex =
  /^https?:\/\/(?:twitter|x)\.com\/(?:#!\/)?(\w+)\/status(es)?\/(\d+)/;

const TWITTER_ID_INDEX = 3

export const parseTwitterUrl = (url: string): EmbedUrlData | undefined => {
  const match = twitterRegex.exec(url);
  if (match) {
    return {
      id: match[TWITTER_ID_INDEX],
      provider: 'twitter',
      url,
    };
  }
};