/** True when the current browser user agent is iOS. */
export const IS_IOS =
  typeof navigator !== 'undefined' &&
  typeof window !== 'undefined' &&
  /iPad|iPhone|iPod/.test(navigator.userAgent) &&
  !(window as Window & { MSStream?: boolean }).MSStream;

export const IS_APPLE =
  typeof navigator !== 'undefined' && /Mac OS X/.test(navigator.userAgent);

/** True when the current browser user agent is Android. */
export const IS_ANDROID =
  typeof navigator !== 'undefined' && /Android/.test(navigator.userAgent);

/** True when the current browser user agent is Firefox. */
export const IS_FIREFOX =
  typeof navigator !== 'undefined' &&
  /^(?!.*Seamonkey)(?=.*Firefox).*/i.test(navigator.userAgent);

/** True when the current browser engine reports Apple WebKit outside Chrome. */
export const IS_WEBKIT =
  typeof navigator !== 'undefined' &&
  /AppleWebKit(?!.*Chrome)/i.test(navigator.userAgent);

/** True when the current browser user agent is Chrome. */
export const IS_CHROME =
  typeof navigator !== 'undefined' && /Chrome/i.test(navigator.userAgent);

// UC mobile browser
/** True when the current browser user agent is UC Browser. */
export const IS_UC_MOBILE =
  typeof navigator !== 'undefined' && /.*UCBrowser/.test(navigator.userAgent);

// Wechat browser (not including mac wechat)
/** True when the current browser user agent is WeChat Browser, excluding Mac WeChat. */
export const IS_WECHATBROWSER =
  typeof navigator !== 'undefined' &&
  /.*Wechat/.test(navigator.userAgent) &&
  !/.*MacWechat/.test(navigator.userAgent);
// Check if DOM is available as React does internally.
// https://github.com/facebook/react/blob/master/packages/shared/ExecutionEnvironment.js
/** True when the current environment exposes the browser DOM APIs Plite needs. */
export const CAN_USE_DOM = !!(
  typeof window !== 'undefined' &&
  typeof window.document !== 'undefined' &&
  typeof window.document.createElement !== 'undefined'
);

/** True when `InputEvent.getTargetRanges()` is available. */
export const HAS_BEFORE_INPUT_SUPPORT =
  typeof globalThis !== 'undefined' &&
  globalThis.InputEvent &&
  typeof (
    globalThis.InputEvent.prototype as InputEvent & {
      getTargetRanges?: unknown;
    }
  ).getTargetRanges === 'function';
