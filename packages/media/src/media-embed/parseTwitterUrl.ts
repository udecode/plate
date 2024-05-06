import type { EmbedUrlData } from '../media';

const twitterRegex =
  // eslint-disable-next-line regexp/no-unused-capturing-group
  /^https?:\/\/twitter\.com\/(?:#!\/)?(\w+)\/status(es)?\/(?<id>\d+)/;

export const parseTwitterUrl = (url: string): EmbedUrlData | undefined => {
  if (url.match(twitterRegex)) {
    return {
      id: twitterRegex.exec(url)?.groups?.id,
      provider: 'twitter',
      url,
    };
  }
};
