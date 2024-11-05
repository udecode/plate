/* eslint-disable @typescript-eslint/only-throw-error */
import type { AllowedFileType, FileRouterInputKey } from '../internal/mimes';

import { lookup } from '../internal/utils';
import { ErrorCode } from '../type';
import { createUploadError } from './createUploadError';

export const matchFileType = (
  file: File,
  allowedTypes: FileRouterInputKey[]
): FileRouterInputKey => {
  // Type might be "" if the browser doesn't recognize the mime type
  const mimeType = file.type || lookup(file.name);

  if (!mimeType) {
    if (allowedTypes.includes('blob')) return 'blob';

    throw createUploadError(ErrorCode.INVALID_FILE_TYPE, {
      allowedTypes: allowedTypes,
      files: [file],
    });
  }
  // If the user has specified a specific mime type, use that
  if (
    allowedTypes.some((type) => type.includes('/')) &&
    allowedTypes.includes(mimeType as FileRouterInputKey)
  ) {
    return mimeType as FileRouterInputKey;
  }

  // Otherwise, we have a "magic" type eg. "image" or "video"
  const type = (
    mimeType.toLowerCase() === 'application/pdf'
      ? 'pdf'
      : mimeType.split('/')[0]
  ) as AllowedFileType;

  if (!allowedTypes.includes(type)) {
    // Blob is a catch-all for any file type not explicitly supported
    if (allowedTypes.includes('blob')) {
      return 'blob';
    } else {
      throw createUploadError(ErrorCode.INVALID_FILE_TYPE, {
        allowedTypes: allowedTypes,
        files: [file],
      });
    }
  }

  return type;
};
