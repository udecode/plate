/* eslint-disable @typescript-eslint/only-throw-error */
import { type FileSize, type MediaItemConfig, UploadErrorCode } from '../type';
import { createUploadError } from './createUploadError';
import { fileSizeToBytes } from './fileSizeToBytes';

export const validateFileItem = (
  files: File[],
  config: MediaItemConfig
): UploadErrorCode | true => {
  const { maxFileCount = Infinity, maxFileSize, minFileCount = 1 } = config;

  if (files.length < minFileCount)
    throw createUploadError(UploadErrorCode.MinFileCountNotMet, {
      invalidateFiles: files,
    });
  if (files.length > maxFileCount)
    throw createUploadError(UploadErrorCode.MaxFileCountExceeded, {
      invalidateFiles: files,
    });

  for (const f of files) {
    const bytes = fileSizeToBytes(maxFileSize as FileSize, f);

    if (f.size > bytes)
      throw createUploadError(UploadErrorCode.MaxFileSizeExceeded, {
        invalidateFiles: [f],
      });
  }

  return true;
};
