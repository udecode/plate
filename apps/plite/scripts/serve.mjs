import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import handler from 'serve-handler';

import { resolvePliteBrowserBaseURL } from './plite-browser-runner.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicPath = path.resolve(__dirname, '../out');
const defaultBaseURL = new URL(resolvePliteBrowserBaseURL());
const port = Number(process.env.PORT ?? defaultBaseURL.port);

const server = http.createServer((request, response) =>
  handler(request, response, {
    public: publicPath,
  })
);

server.listen(port, defaultBaseURL.hostname, () => {
  console.log(
    `plite serving ${publicPath} on http://${defaultBaseURL.hostname}:${port}`
  );
});
