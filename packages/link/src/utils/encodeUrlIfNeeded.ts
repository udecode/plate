/**
 * Check the uri is encoded
 *
 * @param uri String
 */
export const isEncoded = (uri: string): boolean => {
  return uri !== decodeURIComponent(uri);
};
