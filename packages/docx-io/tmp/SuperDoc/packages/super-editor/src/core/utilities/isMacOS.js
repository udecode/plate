export const isMacOS = () => {
  return typeof navigator !== 'undefined' ? /Mac/.test(navigator.platform) : false;
};
