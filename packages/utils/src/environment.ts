export const IS_APPLE =
  typeof navigator !== 'undefined' && /Mac OS X/.test(navigator.userAgent);

export const IS_FIREFOX =
  typeof navigator !== 'undefined' && /Firefox/.test(navigator.userAgent);
