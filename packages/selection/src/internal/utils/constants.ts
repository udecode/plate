// Determines if the device's primary input supports touch
// See this article: https://css-tricks.com/touch-devices-not-judged-size/
export const isTouchDevice = (): boolean =>
  matchMedia('(hover: none), (pointer: coarse)').matches;

// Determines if the browser is safari
export const isSafariBrowser = (): boolean => 'safari' in window;
