import type {
  MediaConfig,
  MediaItemConfig,
  MediaType,
} from '../PlaceholderPlugin';

import { getMediaConfigKeyByFileName } from './getMediaTypeByFileName';
import { parseFileSize } from './parseFileSize';

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
    audio: [],
    file: [],
    image: [],
    video: [],
  };

  Array.from(fileList).forEach((file) => {
    // group files by acceptExtension
    const mediaType = getMediaConfigKeyByFileName(file.name, config);

    if (mediaType && mediaType in map) {
      map[mediaType as MediaType].push(file);
    } else {
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
    const itemFiles = map[key];

    const result = validateFileItem(itemFiles, config[key]!, {
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
  console.log('🚀 ~ maxFileCount:', maxFileCount);

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
