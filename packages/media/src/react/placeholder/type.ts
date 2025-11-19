import type { KEYS } from 'platejs';

import type { AllowedFileType } from './internal/mimes';

export const UploadErrorCode = {
  INVALID_FILE_TYPE: 400,
  TOO_MANY_FILES: 402,
  INVALID_FILE_SIZE: 403,
  TOO_LESS_FILES: 405,
  TOO_LARGE: 413,
} as const;

export type UploadErrorCode =
  (typeof UploadErrorCode)[keyof typeof UploadErrorCode];

export type FileSize = `${PowOf2}${SizeUnit}`;

export type MediaItemConfig = {
  // The type of media that this config is for.
  mediaType: MediaKeys;
  // The maximum number of files of this type that can be uploaded.
  maxFileCount?: number;
  // The maximum file size for a file of this type. FileSize is a string that can be parsed as a number followed by a unit of measurement (B, KB, MB, or GB)
  maxFileSize?: FileSize;
  // The minimum number of files of this type that must be uploaded.
  minFileCount?: number;
};

export type MediaKeys =
  | typeof KEYS.audio
  | typeof KEYS.file
  | typeof KEYS.img
  | typeof KEYS.video;

export type SizeUnit = 'B' | 'GB' | 'KB' | 'MB';

export type UploadError =
  | {
      code: typeof UploadErrorCode.INVALID_FILE_SIZE;
      data: {
        files: File[];
      };
    }
  | {
      code: typeof UploadErrorCode.INVALID_FILE_TYPE;
      data: {
        allowedTypes: string[];
        files: File[];
      };
    }
  | {
      code: typeof UploadErrorCode.TOO_LARGE;
      data: {
        files: File[];
        fileType: AllowedFileType;
        maxFileSize: string;
      };
    }
  | {
      code: typeof UploadErrorCode.TOO_LESS_FILES;
      data: {
        files: File[];
        fileType: AllowedFileType;
        minFileCount: number;
      };
    }
  | {
      code: typeof UploadErrorCode.TOO_MANY_FILES;
      data: {
        files: File[];
        fileType: AllowedFileType | null;
        maxFileCount: number;
      };
    };

type PowOf2 = 1 | 2 | 4 | 8 | 16 | 32 | 64 | 128 | 256 | 512 | 1024;
