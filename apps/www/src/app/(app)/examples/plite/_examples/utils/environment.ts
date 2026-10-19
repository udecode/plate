export const IS_MAC =
  typeof navigator !== 'undefined' && navigator.userAgent.includes('Mac OS X');

export const IS_ANDROID =
  typeof navigator !== 'undefined' && navigator.userAgent.includes('Android');
