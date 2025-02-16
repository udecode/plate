import type {
  AudioPlugin,
  FilePlugin,
  ImagePlugin,
  VideoPlugin,
} from '../plugins';
import type { AllowedFileType } from './internal/mimes';

export enum UploadErrorCode {
  INVALID_FILE_TYPE = 400,
  TOO_MANY_FILES = 402,
  INVALID_FILE_SIZE = 403,
  TOO_LESS_FILES = 405,
  TOO_LARGE = 413,
}

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
  | typeof AudioPlugin.key
  | typeof FilePlugin.key
  | typeof ImagePlugin.key
  | typeof VideoPlugin.key;

export type SizeUnit = 'B' | 'GB' | 'KB' | 'MB';

export type UploadError =
  | {
      code: UploadErrorCode.INVALID_FILE_SIZE;
      data: {
        files: File[];
      };
    }
  | {
      code: UploadErrorCode.INVALID_FILE_TYPE;
      data: {
        allowedTypes: string[];
        files: File[];
      };
    }
  | {
      code: UploadErrorCode.TOO_LARGE;
      data: {
        files: File[];
        fileType: AllowedFileType;
        maxFileSize: string;
      };
    }
  | {
      code: UploadErrorCode.TOO_LESS_FILES;
      data: {
        files: File[];
        fileType: AllowedFileType;
        minFileCount: number;
      };
    }
  | {
      code: UploadErrorCode.TOO_MANY_FILES;
      data: {
        files: File[];
        fileType: AllowedFileType | null;
        maxFileCount: number;
      };
    };

type PowOf2 = 1 | 2 | 4 | 8 | 16 | 32 | 64 | 128 | 256 | 512 | 1024;
