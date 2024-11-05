/* eslint-disable @typescript-eslint/only-throw-error */
import { type FileSize, type MediaItemConfig, ErrorCode } from '../type';
import { createUploadError } from './createUploadError';
import { bytesToFileSize, fileSizeToBytes } from './fileSizeToBytes';

export const validateFileItem = (
  files: File[],
  config: MediaItemConfig
): ErrorCode | true => {
  const { maxFileCount = Infinity, maxFileSize, minFileCount = 1 } = config;

  if (files.length < minFileCount)
    throw createUploadError(ErrorCode.TOO_LESS_FILES, {
      files: files,
      minFileCount: minFileCount,
    });
  if (files.length > maxFileCount)
    throw createUploadError(ErrorCode.TOO_MANY_FILES, {
      files: files,
      maxFileCount: maxFileCount,
    });

  for (const f of files) {
    const bytes = fileSizeToBytes(maxFileSize as FileSize, f);

    if (f.size > bytes)
      throw createUploadError(ErrorCode.TOO_LARGE, {
        files: [f],
        maxFileSize: bytesToFileSize(bytes),
      });
  }

  return true;
};
