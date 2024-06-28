/**
 * return encoded url
 *
 * @param value String
 */
export const encodeUrlIfNeeded = (value: string) => {
  const isEncoedUrl = value !== decodeURIComponent(value);

  return isEncoedUrl ? value : encodeURI(value);
};
