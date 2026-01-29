export const isRegExp = (value) => {
  return Object.prototype.toString.call(value) === '[object RegExp]';
};
