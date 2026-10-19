import { isUrl } from '../../../../core';

export type EmbedUrlData = {
  id?: string;
  provider?: string;
  sourceKind?: 'allowlisted_snippet' | 'iframe' | 'url';
  sourceUrl?: string;
  url?: string;
};

export type EmbedUrlParser = (url: string) => EmbedUrlData | undefined;

// Unlike the link plugin, there's no legitimate reason for non-HTTP source URLs
const allowedProtocols = new Set(['http:', 'https:']);

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

    return undefined;
  })();

  // Harden against XSS
  if (embed?.url) {
    try {
      const { protocol } = new URL(embed.url);

      if (!allowedProtocols.has(protocol)) {
        return undefined;
      }
    } catch {
      console.warn(`Could not parse URL: ${embed.url}`);

      return undefined;
    }
  }

  return embed;
};

const regexMatchIframeSrc = /<iframe\b[^>]*\bsrc="([^"]*)"/i;
const regexGroupQuotes = /"([^"]*)"/;
const regexTwitterStatusUrl =
  /https?:\/\/(?:twitter|x)\.com\/(?:#!\/)?\w+\/status(?:es)?\/\d+/;

export const parseIframeUrl = (url: string) => {
  if (!url.startsWith('http')) {
    const twitterStatusUrl = url.match(regexTwitterStatusUrl)?.[0];

    if (twitterStatusUrl) return twitterStatusUrl;

    const src = regexMatchIframeSrc.exec(url)?.[0];
    const parsedUrl = src?.match(regexGroupQuotes)?.[1];

    if (parsedUrl) return parsedUrl;
  }

  return url;
};

const twitterRegex =
  /^https?:\/\/(?:twitter|x)\.com\/(?:#!\/)?(\w+)\/status(es)?\/(\d+)/;

export const parseTwitterUrl = (url: string): EmbedUrlData | undefined => {
  const match = twitterRegex.exec(url);

  if (match) {
    return {
      id: match[3],
      provider: 'twitter',
      sourceKind: 'url',
      url,
    };
  }

  return undefined;
};

const VIDEO_PROVIDER_VALUES = [
  'youtube',
  'vimeo',
  'dailymotion',
  'youku',
  'coub',
] as const;

export const VIDEO_PROVIDERS: string[] = [...VIDEO_PROVIDER_VALUES];

type VideoProvider = (typeof VIDEO_PROVIDER_VALUES)[number];

const providerUrls: Record<VideoProvider, string> = {
  coub: 'https://coub.com/embed/',
  dailymotion: 'https://www.dailymotion.com/embed/video/',
  vimeo: 'https://player.vimeo.com/video/',
  youku: 'https://player.youku.com/embed/',
  youtube: 'https://www.youtube.com/embed/',
};

const parseUrl = (url: string) => {
  if (!isUrl(url)) return undefined;

  try {
    return new URL(url);
  } catch {
    // Invalid media URLs are represented by an undefined parse result.
  }

  return undefined;
};

const getPathSegments = (url: URL) => url.pathname.split('/').filter(Boolean);

const getSegmentAfter = (segments: string[], value: string) => {
  const index = segments.indexOf(value);

  return index !== -1 ? segments[index + 1] : undefined;
};

const isAlphaNumeric = (value: string) =>
  value.length > 0 &&
  Array.from(value).every((char) => {
    const code = char.charCodeAt(0);

    return (
      (code >= 48 && code <= 57) ||
      (code >= 65 && code <= 90) ||
      (code >= 97 && code <= 122)
    );
  });

const isNumeric = (value: string) =>
  value.length > 0 &&
  Array.from(value).every((char) => {
    const code = char.charCodeAt(0);

    return code >= 48 && code <= 57;
  });

const isYoutubeId = (value: string | undefined) =>
  value?.length === 11 &&
  Array.from(value).every((char) => {
    const code = char.charCodeAt(0);

    return (
      char === '-' ||
      char === '_' ||
      (code >= 48 && code <= 57) ||
      (code >= 65 && code <= 90) ||
      (code >= 97 && code <= 122)
    );
  });

const stripNonAlphaNumericSuffix = (value: string | undefined) => {
  if (!value) return undefined;

  const index = Array.from(value).findIndex((char) => !isAlphaNumeric(char));

  return index === -1 ? value : value.slice(0, index);
};

const parseYoutubeId = (url: URL) => {
  const host = url.hostname.toLowerCase();
  const segments = getPathSegments(url);

  if (host === 'youtu.be') {
    const id = segments[0];

    return isYoutubeId(id) ? id : undefined;
  }

  if (host !== 'youtube.com' && !host.endsWith('.youtube.com')) {
    return undefined;
  }

  const queryId = url.searchParams.get('v') ?? url.searchParams.get('ci');

  if (queryId && isYoutubeId(queryId)) return queryId;

  const pathId =
    getSegmentAfter(segments, 'embed') ??
    getSegmentAfter(segments, 'v') ??
    getSegmentAfter(segments, 'vi') ??
    getSegmentAfter(segments, 'videos') ??
    getSegmentAfter(segments, 'shorts') ??
    getSegmentAfter(segments, 'live');

  return isYoutubeId(pathId) ? pathId : undefined;
};

const parseVimeoId = (url: URL) => {
  const host = url.hostname.toLowerCase();

  if (
    host !== 'vimeo.com' &&
    !host.endsWith('.vimeo.com') &&
    host !== 'vimeopro.com' &&
    !host.endsWith('.vimeopro.com')
  ) {
    return undefined;
  }

  return [...getPathSegments(url)].reverse().find(isNumeric);
};

const parseDailymotionId = (url: URL) => {
  const host = url.hostname.toLowerCase();

  if (
    host !== 'dai.ly' &&
    host !== 'dailymotion.com' &&
    !host.endsWith('.dailymotion.com')
  ) {
    return undefined;
  }

  const segments = getPathSegments(url);
  const segment =
    host === 'dai.ly' ? segments[0] : getSegmentAfter(segments, 'video');
  const id = stripNonAlphaNumericSuffix(segment);

  return id && isAlphaNumeric(id) ? id : undefined;
};

const parseYoukuId = (url: URL) => {
  const host = url.hostname.toLowerCase();

  if (host !== 'youku.com' && !host.endsWith('.youku.com')) return undefined;

  const segments = getPathSegments(url);
  const videoIdParam = url.searchParams.get('VideoIDS') ?? undefined;
  const pathId =
    getSegmentAfter(segments, 'embed') ??
    getSegmentAfter(segments, 'sid') ??
    segments
      .find((segment) => segment.startsWith('id_'))
      ?.slice('id_'.length)
      .split('.')[0];
  const id = stripNonAlphaNumericSuffix(videoIdParam ?? pathId);

  return id && isAlphaNumeric(id) ? id : undefined;
};

const parseCoubId = (url: URL) => {
  const host = url.hostname.toLowerCase();

  if (host !== 'coub.com' && !host.endsWith('.coub.com')) return undefined;

  const segments = getPathSegments(url);
  const id =
    getSegmentAfter(segments, 'view') ?? getSegmentAfter(segments, 'embed');

  return id && isAlphaNumeric(id) ? id : undefined;
};

const parsers: Record<VideoProvider, (url: URL) => string | undefined> = {
  coub: parseCoubId,
  dailymotion: parseDailymotionId,
  vimeo: parseVimeoId,
  youku: parseYoukuId,
  youtube: parseYoutubeId,
};

export const parseVideoUrl = (url: string): EmbedUrlData | undefined => {
  const parsedUrl = parseUrl(url);

  if (!parsedUrl) return undefined;

  for (const provider of VIDEO_PROVIDER_VALUES) {
    const id = parsers[provider](parsedUrl);

    if (!id) continue;

    const embedUrl = `${providerUrls[provider]}${id}`;

    return {
      id,
      provider,
      sourceKind: 'url',
      sourceUrl: embedUrl === url ? undefined : url,
      url: embedUrl,
    };
  }

  return undefined;
};
