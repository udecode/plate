import type { EmbedUrlData } from '../media/parseMediaUrl';

const twitterRegex =
  // eslint-disable-next-line regexp/no-unused-capturing-group
  /^https?:\/\/(?:twitter|x)\.com\/(?:#!\/)?(\w+)\/status(es)?\/(\d+)/;

export const parseTwitterUrl = (url: string): EmbedUrlData | undefined => {
  if (twitterRegex.exec(url)) {
    return {
      id: twitterRegex.exec(url)?.groups?.id,
      provider: 'twitter',
      url,
    };
  }
};
