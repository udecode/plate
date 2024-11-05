import type { AudioPlugin, FilePlugin, ImagePlugin, VideoPlugin } from '..';

export enum ErrorCode {
  INVALID_FILE_TYPE = 400,
  TOO_MANY_FILES = 402,
  INVALID_FILE_SIZE = 403,
  TOO_LESS_FILES = 405,
  TOO_LARGE = 413,
}

export type Error =
  | {
      data: {
        allowedTypes: string[];
        files: File[];
      };
      code: ErrorCode.INVALID_FILE_TYPE;
    }
  | {
      data: {
        files: File[];
      };
      code: ErrorCode.INVALID_FILE_SIZE;
    }
  | {
      data: {
        files: File[];
        maxFileCount: number;
      };
      code: ErrorCode.TOO_MANY_FILES;
    }
  | {
      data: {
        files: File[];
        maxFileSize: string;
      };
      code: ErrorCode.TOO_LARGE;
    }
  | {
      data: {
        files: File[];
        minFileCount: number;
      };
      code: ErrorCode.TOO_LESS_FILES;
    };

export type MediaKeys =
  | typeof AudioPlugin.key
  | typeof FilePlugin.key
  | typeof ImagePlugin.key
  | typeof VideoPlugin.key;

type PowOf2 = 1 | 2 | 4 | 8 | 16 | 32 | 64 | 128 | 256 | 512 | 1024;

export type SizeUnit = 'B' | 'GB' | 'KB' | 'MB';

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
