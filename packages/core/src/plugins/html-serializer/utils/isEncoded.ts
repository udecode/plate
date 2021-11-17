export const isEncoded = (str = '') => {
  try {
    return str !== decodeURIComponent(str);
  } catch (error) {
    return false;
  }
};
