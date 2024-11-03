import type { MediaConfig } from '../PlaceholderPlugin';

import { getFileExtension } from './getFileExtension';

export const getMediaTypeByFileName = (
  fileName: string,
  config: MediaConfig
): string | null => {
  const extension = getFileExtension(fileName);

  for (const [key, value] of Object.entries(config)) {
    const accept = value?.accept ?? [];

    // user can use both `.mp3` or `mp3` in options
    if (accept.includes(extension) || accept.includes(`.${extension}`)) {
      switch (key) {
        case 'audio': {
          return value.mediaType;
        }
        case 'file': {
          return value.mediaType;
        }
        case 'image': {
          return value.mediaType;
        }
        case 'video': {
          return value.mediaType;
        }
      }
    }
  }

  return null;
};

export const getMediaConfigKeyByFileName = (
  fileName: string,
  config: MediaConfig
): string | null => {
  const extension = getFileExtension(fileName);

  for (const [key, value] of Object.entries(config)) {
    const accept = value?.accept ?? [];

    // user can use both `.mp3` or `mp3` in options
    if (accept.includes(extension) || accept.includes(`.${extension}`)) {
      switch (key) {
        case 'audio': {
          return key;
        }
        case 'file': {
          return key;
        }
        case 'image': {
          return key;
        }
        case 'video': {
          return key;
        }
      }
    }
  }

  return null;
};
