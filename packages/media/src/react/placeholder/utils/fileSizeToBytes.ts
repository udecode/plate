import { type FileSize, ErrorCode } from '../type';
import { createUploadError } from './createUploadError';

export const FILESIZE_UNITS = ['B', 'KB', 'MB', 'GB'] as const;

export type FileSizeUnit = (typeof FILESIZE_UNITS)[number];

export const fileSizeToBytes = (fileSize: FileSize, file: File): number => {
  const regex = new RegExp(
    `^(\\d+)(\\.\\d+)?\\s*(${FILESIZE_UNITS.join('|')})$`,
    'i'
  );

  // make sure the string is in the format of 123KB
  const match = fileSize.match(regex);

  if (!match) {
    // eslint-disable-next-line @typescript-eslint/only-throw-error
    throw createUploadError(ErrorCode.INVALID_FILE_SIZE, {
      files: [file],
    });
  }

  const sizeValue = Number.parseFloat(match[1]);
  const sizeUnit = match[3].toUpperCase() as FileSizeUnit;
  const bytes = sizeValue * Math.pow(1024, FILESIZE_UNITS.indexOf(sizeUnit));

  return Math.floor(bytes);
};

export const bytesToFileSize = (bytes: number) => {
  if (bytes === 0 || bytes === -1) {
    return '0B';
  }

  const i = Math.floor(Math.log(bytes) / Math.log(1000));

  return `${(bytes / Math.pow(1000, i)).toFixed(2)}${FILESIZE_UNITS[i]}`;
};
