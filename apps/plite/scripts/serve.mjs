import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { resolvePliteBrowserBaseURL } from './plite-browser-runner.mjs';
import {
  configureStaticServer,
  createStaticRequestHandler,
  createStaticSnapshot,
} from './plite-static-server.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicPath = path.resolve(__dirname, '../out');
const defaultBaseURL = new URL(resolvePliteBrowserBaseURL());
const host = process.env.PLITE_SERVE_HOST ?? defaultBaseURL.hostname;
const port = Number(process.env.PORT ?? defaultBaseURL.port);
const snapshot = createStaticSnapshot(publicPath);

const server = configureStaticServer(
  http.createServer(createStaticRequestHandler(snapshot))
);

server.listen(port, host, () => {
  console.log(
    `plite serving ${snapshot.files} files (${snapshot.bytes} bytes) from ${publicPath} on http://${host}:${port}`
  );
});
