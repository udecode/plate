/**
 * If a URL has not already been encoded and contains characters that require
 * encoding, encode the URL.
 *
 * @param url URL to encode
 */
export const encodeUrlIfNeeded = (url: string) => {
  try {
    const isEncoded = url !== decodeURIComponent(url);

    return isEncoded ? url : encodeURI(url);
  } catch (error) {
    if (error instanceof URIError) {
      return url;
    }

    throw error;
  }
};
