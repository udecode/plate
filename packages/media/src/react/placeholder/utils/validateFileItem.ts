/* eslint-disable @typescript-eslint/only-throw-error */
import type { AllowedFileType } from '../internal/mimes';

import { type FileSize, type MediaItemConfig, UploadErrorCode } from '../type';
import { createUploadError } from './createUploadError';
import { fileSizeToBytes } from './fileSizeToBytes';

export const validateFileItem = (
  files: File[],
  config: MediaItemConfig,
  key: AllowedFileType
): UploadErrorCode | true => {
  const { maxFileCount = Infinity, maxFileSize, minFileCount = 1 } = config;

  if (files.length < minFileCount)
    throw createUploadError(UploadErrorCode.TOO_LESS_FILES, {
      fileType: key,
      files: files,
      minFileCount: minFileCount,
    });
  if (files.length > maxFileCount)
    throw createUploadError(UploadErrorCode.TOO_MANY_FILES, {
      fileType: key,
      files: files,
      maxFileCount: maxFileCount,
    });

  for (const f of files) {
    const bytes = fileSizeToBytes(maxFileSize as FileSize, f);

    if (f.size > bytes)
      throw createUploadError(UploadErrorCode.TOO_LARGE, {
        fileType: key,
        files: [f],
        maxFileSize: maxFileSize!,
      });
  }

  return true;
};
