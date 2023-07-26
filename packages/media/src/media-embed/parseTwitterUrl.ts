import { EmbedUrlData } from '../media';

const twitterRegex =
  /^https?:\/\/twitter\.com\/(?:#!\/)?(\w+)\/status(es)?\/(?<id>\d+)/;

export const parseTwitterUrl = (url: string): EmbedUrlData | undefined => {
  if (url.match(twitterRegex)) {
    return {
      provider: 'twitter',
      id: twitterRegex.exec(url)?.groups?.id,
      url,
    };
  }
};
