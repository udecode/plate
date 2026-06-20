import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import handler from 'serve-handler';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicPath = path.resolve(__dirname, '../out');
const port = Number(process.env.PORT ?? 3102);

const server = http.createServer((request, response) =>
  handler(request, response, {
    public: publicPath,
  })
);

server.listen(port, () => {
  console.log(`slate serving ${publicPath} on http://localhost:${port}`);
});
