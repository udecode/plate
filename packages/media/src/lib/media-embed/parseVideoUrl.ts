import { isUrl } from 'platejs';

import type { EmbedUrlData } from '../media';

const YOUTUBE_PREFIX = 'https://www.youtube.com/embed/';
const VIMEO_PREFIX = 'https://player.vimeo.com/video/';
const DAILYMOTION_PREFIX = 'https://www.dailymotion.com/embed/video/';
const COUB_PREFIX = 'https://coub.com/embed/';
const YOUKU_PREFIX = 'https://player.youku.com/embed/';

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
  coub: COUB_PREFIX,
  dailymotion: DAILYMOTION_PREFIX,
  vimeo: VIMEO_PREFIX,
  youku: YOUKU_PREFIX,
  youtube: YOUTUBE_PREFIX,
};

const parseUrl = (url: string) => {
  if (!isUrl(url)) return;

  try {
    return new URL(url);
  } catch {
    return;
  }
};

const getPathSegments = (url: URL) => url.pathname.split('/').filter(Boolean);

const getSegmentAfter = (segments: string[], value: string) => {
  const index = segments.indexOf(value);

  return index >= 0 ? segments[index + 1] : undefined;
};

const isAlphaNumeric = (value: string) =>
  value.length > 0 &&
  [...value].every((char) => {
    const code = char.charCodeAt(0);

    return (
      (code >= 48 && code <= 57) ||
      (code >= 65 && code <= 90) ||
      (code >= 97 && code <= 122)
    );
  });

const isNumeric = (value: string) =>
  value.length > 0 &&
  [...value].every((char) => {
    const code = char.charCodeAt(0);

    return code >= 48 && code <= 57;
  });

const isYoutubeId = (value: string | undefined) =>
  value?.length === 11 &&
  [...value].every((char) => {
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
  if (!value) return;

  const id = [...value].findIndex((char) => !isAlphaNumeric(char));

  return id === -1 ? value : value.slice(0, id);
};

const parseYoutubeId = (url: URL) => {
  const host = url.hostname.toLowerCase();
  const segments = getPathSegments(url);

  if (host === 'youtu.be') {
    const id = segments[0];

    return isYoutubeId(id) ? id : undefined;
  }

  if (host !== 'youtube.com' && !host.endsWith('.youtube.com')) return;

  const queryId = url.searchParams.get('v') ?? url.searchParams.get('ci');

  if (isYoutubeId(queryId ?? undefined)) return queryId!;

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
    return;
  }

  const segments = getPathSegments(url);

  return [...segments].reverse().find(isNumeric);
};

const parseDailymotionId = (url: URL) => {
  const host = url.hostname.toLowerCase();

  if (
    host !== 'dai.ly' &&
    host !== 'dailymotion.com' &&
    !host.endsWith('.dailymotion.com')
  ) {
    return;
  }

  const segments = getPathSegments(url);
  const segment =
    host === 'dai.ly' ? segments[0] : getSegmentAfter(segments, 'video');
  const id = stripNonAlphaNumericSuffix(segment);

  return id && isAlphaNumeric(id) ? id : undefined;
};

const parseYoukuId = (url: URL) => {
  const host = url.hostname.toLowerCase();

  if (host !== 'youku.com' && !host.endsWith('.youku.com')) return;

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

  if (host !== 'coub.com' && !host.endsWith('.coub.com')) return;

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

  if (!parsedUrl) return;

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
};
