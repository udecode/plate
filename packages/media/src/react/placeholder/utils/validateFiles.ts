import {
  AudioPlugin,
  FilePlugin,
  ImagePlugin,
  VideoPlugin,
} from '@udecode/plate-media/react';

import type {
  MediaConfig,
  MediaItemConfig,
  MediaType,
} from '../PlaceholderPlugin';

interface ValidationResult {
  errorMessage: string | null;
  isValid: boolean;
}

export const validateFiles = (
  fileList: FileList,
  config: MediaConfig
): ValidationResult => {
  const unknown: File[] = [];

  const map: Record<MediaType, File[]> = {
    [AudioPlugin.key]: [],
    [FilePlugin.key]: [],
    [ImagePlugin.key]: [],
    [VideoPlugin.key]: [],
  };

  Array.from(fileList).forEach((file) => {
    // group files by acceptExtension
    const mediaType = getMediaTypeByFileName(file.name, config);

    if (!mediaType) {
      unknown.push(file);
    }
  });

  if (unknown.length > 0) {
    return {
      errorMessage: `The files: ${unknown.map((file) => file.name).join(',')} is not support`,
      isValid: false,
    };
  }

  const keys = Object.keys(map) as (keyof typeof map)[];

  for (const key of keys) {
    const result = validateFileItem(map[key], config[key]!, {
      debugName: key,
    });

    if (!result.isValid) {
      return result;
    }
  }

  return { errorMessage: null, isValid: true };
};

const validateFileItem = (
  fileList: File[],
  config: MediaItemConfig,
  options: { debugName: string }
): ValidationResult => {
  if (fileList.length === 0) return { errorMessage: null, isValid: true };

  const { debugName } = options;
  // validate file count
  const minFileCount = config.minFileCount ?? 1;
  const maxFileCount = config.maxFileCount ?? 3;

  if (fileList.length < minFileCount) {
    return {
      errorMessage: `Minimum ${debugName} file count is ${minFileCount}`,
      isValid: false,
    };
  }
  if (fileList.length > maxFileCount) {
    return {
      errorMessage: `Maximum ${debugName} file count is ${maxFileCount}`,
      isValid: false,
    };
  }

  // validate file size
  const maxFileSize = config.maxFileSize ?? '10MB';

  fileList.forEach((file) => {
    if (file.size > parseFileSize(maxFileSize)) {
      return {
        errors: `Maximum ${debugName} file size is ${maxFileSize}`,
        isValid: false,
      };
    }
  });

  return { errorMessage: null, isValid: true };
};

export const getMediaTypeByFileName = (
  fileName: string,
  config: MediaConfig
): MediaType | null => {
  const extension = getFileExtension(fileName);

  for (const [key, value] of Object.entries(config)) {
    const accept = value?.accept ?? [];

    // user can use both `.mp3` or `mp3` in options
    if (accept.includes(extension) || accept.includes(`.${extension}`)) {
      switch (key) {
        case AudioPlugin.key: {
          return AudioPlugin.key;
        }
        case FilePlugin.key: {
          return FilePlugin.key;
        }
        case ImagePlugin.key: {
          return ImagePlugin.key;
        }
        case VideoPlugin.key: {
          return VideoPlugin.key;
        }
      }
    }
  }

  return null;
};

/** Convert string like 1B to 1024 number */
const parseFileSize = (size: string): number => {
  const match = /^(\d+(?:\.\d+)?)\s*(b|kb|mb|gb)$/i.exec(size);

  if (!match) {
    throw new Error('Invalid file size format');
  }

  const [, value, unit] = match;
  const sizes = { B: 0, GB: 3, KB: 1, MB: 2 };
  const k = 1024;

  return Math.floor(
    Number.parseFloat(value) *
      Math.pow(k, sizes[unit.toUpperCase() as keyof typeof sizes])
  );
};

const getFileExtension = (filename: string) => {
  if (!filename || typeof filename !== 'string') {
    return '';
  }

  filename = filename.trim();

  if (filename.endsWith('.')) {
    return '';
  }

  const ext = filename.split('.').pop();

  if (ext === filename || filename.startsWith('.')) {
    return '';
  }

  return ext?.toLowerCase() ?? '';
};
