export type EmbedUrlData = {
  id?: string;
  provider?: string;
  url?: string;
};

export type EmbedUrlParser = (url: string) => EmbedUrlData | undefined;

// Unlike the link plugin, there's no legitimate reason for non-HTTP source URLs
const allowedProtocols = new Set(['https:', 'http:']);

export const parseMediaUrl = (
  url: string,
  {
    urlParsers,
  }: {
    urlParsers: EmbedUrlParser[];
  }
): EmbedUrlData | undefined => {
  const embed = (() => {
    for (const parser of urlParsers) {
      const data = parser(url);

      if (data) {
        return data;
      }
    }
  })();

  // Harden against XSS
  if (embed?.url) {
    try {
      const { protocol } = new URL(embed.url);

      if (!allowedProtocols.has(protocol)) {
        return undefined;
      }
    } catch {
      // eslint-disable-next-line no-console
      console.warn('Could not parse URL: ' + embed.url);

      return undefined;
    }
  }

  return embed;
};
