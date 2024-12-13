export const IS_APPLE =
  typeof navigator !== 'undefined' && navigator.userAgent.includes('Mac OS X');

export const IS_SERVER = typeof window === 'undefined';
