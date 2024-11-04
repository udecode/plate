import type { UploadError } from '../PlaceholderPlugin';
import type { UploadErrorCode } from '../type';

export const createUploadError = (
  code: UploadErrorCode,
  data: { invalidateFiles: File[] }
): UploadError => {
  return { code, data } as UploadError;
};

export const isUploadError = (error: unknown): error is UploadError => {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    'data' in error &&
    typeof error.data === 'object' &&
    error.data !== null &&
    'invalidateFiles' in error.data &&
    Array.isArray(error.data.invalidateFiles)
  );
};
