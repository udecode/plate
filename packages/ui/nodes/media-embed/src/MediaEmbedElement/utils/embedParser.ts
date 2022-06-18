const twitterUrl = /^https?:\/\/twitter\.com\/(?:#!\/)?(\w+)\/status(es)?\/(?<id>\d+)/;

export type EmbedParseResult = {
  provider: 'twitter' | 'unknown';
  id?: string;
};

export function parse(url: string): EmbedParseResult {
  if (url.match(twitterUrl)) {
    return {
      provider: 'twitter',
      id: twitterUrl.exec(url)?.groups?.id,
    };
  }

  return {
    provider: 'unknown',
  };
}
