import { createServer } from 'node:http';
import { fileURLToPath, pathToFileURL } from 'node:url';
import handler from 'serve-handler';

const root = fileURLToPath(new URL('../site/out', import.meta.url));
const portValue = process.env.PORT || '3101';
const port = Number(portValue);

if (!Number.isInteger(port) || port < 1 || port > 65_535) {
  console.error(
    `Invalid PORT "${portValue}". PORT must be an integer from 1 to 65535.`
  );
  process.exit(1);
}

export const createPlaywrightRequestListener =
  (requestHandler = handler) =>
  (request, response) => {
    Promise.resolve()
      .then(() =>
        requestHandler(request, response, {
          cleanUrls: true,
          directoryListing: false,
          public: root,
        })
      )
      .catch((error) => {
        console.error('Playwright server request failed:', error);

        if (response.headersSent) {
          response.destroy();
          return;
        }

        response.statusCode = 500;
        response.end('Internal Server Error');
      });
  };

export const createPlaywrightServer = (requestHandler = handler) =>
  createServer(createPlaywrightRequestListener(requestHandler));

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  const server = createPlaywrightServer();

  server.listen(port, () => {
    console.log(`Playwright server listening on http://localhost:${port}`);
  });
}
