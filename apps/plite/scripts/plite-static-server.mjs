import fs from 'node:fs';
import path from 'node:path';

const contentTypes = new Map([
  ['.avif', 'image/avif'],
  ['.css', 'text/css; charset=utf-8'],
  ['.gif', 'image/gif'],
  ['.html', 'text/html; charset=utf-8'],
  ['.ico', 'image/x-icon'],
  ['.jpeg', 'image/jpeg'],
  ['.jpg', 'image/jpeg'],
  ['.js', 'text/javascript; charset=utf-8'],
  ['.json', 'application/json; charset=utf-8'],
  ['.map', 'application/json; charset=utf-8'],
  ['.mjs', 'text/javascript; charset=utf-8'],
  ['.png', 'image/png'],
  ['.svg', 'image/svg+xml; charset=utf-8'],
  ['.ttf', 'font/ttf'],
  ['.txt', 'text/plain; charset=utf-8'],
  ['.wasm', 'application/wasm'],
  ['.webp', 'image/webp'],
  ['.woff', 'font/woff'],
  ['.woff2', 'font/woff2'],
  ['.xml', 'application/xml; charset=utf-8'],
]);
const PATH_SUFFIX_PATTERN = /[?#]/;

export const STATIC_SERVER_KEEP_ALIVE_TIMEOUT_MS = 300_000;
export const STATIC_SERVER_KEEP_ALIVE_TIMEOUT_BUFFER_MS = 5000;
export const STATIC_SERVER_HEADERS_TIMEOUT_MS = 310_000;

const collectFiles = (directory) =>
  fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = path.join(directory, entry.name);

    return entry.isDirectory() ? collectFiles(entryPath) : [entryPath];
  });

const toURLPath = (publicPath, filePath) =>
  `/${path.relative(publicPath, filePath).split(path.sep).join('/')}`;

const getContentType = (filePath) =>
  contentTypes.get(path.extname(filePath).toLowerCase()) ??
  'application/octet-stream';

export const createStaticSnapshot = (publicPath) => {
  const resolvedPublicPath = path.resolve(publicPath);
  const assets = new Map(
    collectFiles(resolvedPublicPath).map((filePath) => [
      toURLPath(resolvedPublicPath, filePath),
      Object.freeze({
        body: fs.readFileSync(filePath),
        contentType: getContentType(filePath),
      }),
    ])
  );

  return Object.freeze({
    assets,
    bytes: [...assets.values()].reduce(
      (total, asset) => total + asset.body.byteLength,
      0
    ),
    files: assets.size,
  });
};

const parsePathname = (requestURL) => {
  try {
    const pathname = decodeURIComponent(
      (requestURL ?? '/').split(PATH_SUFFIX_PATTERN)[0]
    );

    if (
      pathname.includes('\0') ||
      pathname.includes('\\') ||
      pathname.split('/').includes('..')
    ) {
      return;
    }

    return pathname;
  } catch {
    // Invalid request URLs do not map to a static pathname.
  }
};

export const resolveStaticAsset = (snapshot, requestURL) => {
  const pathname = parsePathname(requestURL);

  if (!pathname) return;

  const candidates = pathname.endsWith('/')
    ? [pathname, `${pathname}index.html`]
    : [pathname, `${pathname}.html`, `${pathname}/index.html`];

  if (pathname === '/') candidates.unshift('/index.html');

  for (const candidate of candidates) {
    const asset = snapshot.assets.get(candidate);

    if (asset) return asset;
  }
};

export const createStaticRequestHandler = (snapshot) => (request, response) => {
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    response.writeHead(405, { Allow: 'GET, HEAD' });
    response.end();

    return;
  }

  const asset = resolveStaticAsset(snapshot, request.url);

  if (!asset) {
    response.writeHead(404, {
      'Cache-Control': 'no-store',
      'Content-Type': 'text/plain; charset=utf-8',
    });
    response.end('Not Found');

    return;
  }

  const pathname = parsePathname(request.url) ?? '';
  const isImmutable = pathname.startsWith('/_next/static/');
  const isHTML = asset.contentType.startsWith('text/html');

  response.writeHead(200, {
    'Cache-Control': isImmutable
      ? 'public, max-age=31536000, immutable'
      : isHTML
        ? 'no-store'
        : 'public, max-age=3600',
    'Content-Length': asset.body.byteLength,
    'Content-Type': asset.contentType,
    'X-Content-Type-Options': 'nosniff',
  });
  response.end(request.method === 'HEAD' ? undefined : asset.body);
};

export const configureStaticServer = (server) => {
  server.keepAliveTimeout = STATIC_SERVER_KEEP_ALIVE_TIMEOUT_MS;
  server.keepAliveTimeoutBuffer = STATIC_SERVER_KEEP_ALIVE_TIMEOUT_BUFFER_MS;
  server.headersTimeout = STATIC_SERVER_HEADERS_TIMEOUT_MS;

  return server;
};
