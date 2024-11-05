import type { UploadError, UploadErrorCode } from '../type';
// 首先定义一个类型,用于获取指定错误码对应的data类型
type ErrorDataType<T extends UploadErrorCode> = Extract<
  UploadError,
  { code: T }
>['data'];

// 改写createUploadError函数
export const createUploadError = <T extends UploadErrorCode>(
  code: T,
  data: ErrorDataType<T>
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
    'files' in error.data &&
    Array.isArray(error.data.files)
  );
};
