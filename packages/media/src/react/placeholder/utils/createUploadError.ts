import type { Error, ErrorCode } from '../type';
// 首先定义一个类型,用于获取指定错误码对应的data类型
type ErrorDataType<T extends ErrorCode> = Extract<Error, { code: T }>['data'];

// 改写createUploadError函数
export const createUploadError = <T extends ErrorCode>(
  code: T,
  data: ErrorDataType<T>
): Error => {
  return { code, data } as Error;
};

export const isUploadError = (error: unknown): error is Error => {
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
