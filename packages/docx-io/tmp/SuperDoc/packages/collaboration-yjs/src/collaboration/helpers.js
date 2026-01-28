/**
 * Extracts all params for the provider request and websocket connection.
 * @param {import('../types.js').SocketRequest} request - The request object containing the URL and parameters.
 * @returns {Object} An object containing the documentId and any query parameters.
 */
export const generateParams = (request, instance) => {
  const { params } = request;
  const { documentId, ...rest } = params;
  const urlParts = request.url.split('?');
  const queryString = urlParts[1] || '';
  const queryParams = Object.fromEntries(new URLSearchParams(queryString));

  const cookies = parseCookie(request.headers?.cookie);
  const headers = request.headers || {};
  const connection = {};

  return {
    documentId,
    cookies,
    instance,
    headers,
    connection,
    params: { ...rest, ...queryParams },
  };
};

/**
 * Parse a raw Cookie header value into an object.
 * @param {string} rawCookie  The value of request.headers.cookie
 * @returns {{ [key: string]: string }}  Map of cookie names to values
 */
export function parseCookie(rawCookie) {
  if (!rawCookie) return {};

  return rawCookie
    .split(';')
    .map((pair) => pair.trim())
    .reduce((cookies, pair) => {
      const eqIdx = pair.indexOf('=');
      if (eqIdx < 0) return cookies;
      const name = pair.slice(0, eqIdx).trim();
      let value = pair.slice(eqIdx + 1).trim();

      if (value.startsWith('"') && value.endsWith('"')) {
        value = value.slice(1, -1);
      }
      try {
        value = decodeURIComponent(value);
      } catch {}
      cookies[name] = value;
      return cookies;
    }, /** @type {{ [key: string]: string }} */ ({}));
}
