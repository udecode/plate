import { afterEach, expect, it } from 'bun:test';
import {
  createServer,
  type IncomingMessage,
  type ServerResponse,
} from 'node:http';
import type { AddressInfo } from 'node:net';

import { createPlantUmlRenderer } from './code-block-diagram-plantuml';

const originalFetch = globalThis.fetch;

// node:http writes its responses itself; the test preload replaces Response
// with happy-dom's, which Bun.serve cannot send.
const listen = async (
  handler: (request: IncomingMessage, response: ServerResponse) => void
) => {
  const server = createServer(handler);

  await new Promise<void>((resolve) => {
    server.listen(0, resolve);
  });

  return {
    port: (server.address() as AddressInfo).port,
    stop: () =>
      new Promise<void>((resolve) => {
        server.closeAllConnections();
        server.close(() => resolve());
      }),
  };
};

afterEach(() => {
  globalThis.fetch = originalFetch;
});

it('sends the source only to the configured server', async () => {
  const requests: string[] = [];

  globalThis.fetch = (async (input: Request | URL | string) => {
    requests.push(input instanceof Request ? input.url : input.toString());

    return new Response('<svg>uml</svg>');
  }) as typeof fetch;

  const renderer = createPlantUmlRenderer({
    server: 'https://uml.example.com/plantuml/',
  });

  await expect(
    renderer.render('@startuml\nA -> B\n@enduml', {
      signal: new AbortController().signal,
    })
  ).resolves.toBe('<svg>uml</svg>');
  expect(requests).toEqual([
    'https://uml.example.com/plantuml/svg/SoWkIImgAStDuN9KqBLJSE9oICrBAStD0G00',
  ]);
});

it('refuses a redirect away from the configured server', async () => {
  const elsewhere: string[] = [];
  const other = await listen((request, response) => {
    elsewhere.push(request.url ?? '');
    response.end('<svg>elsewhere</svg>');
  });
  const configured = await listen((request, response) => {
    response.writeHead(302, {
      location: `http://localhost:${other.port}${request.url}`,
    });
    response.end();
  });

  // The test preload's happy-dom fetch sends a CORS preflight that follows the
  // redirect, which a browser refuses, so this case runs on Bun's own fetch.
  globalThis.fetch = Bun.fetch;

  try {
    const renderer = createPlantUmlRenderer({
      server: `http://localhost:${configured.port}/plantuml`,
    });

    await expect(
      renderer.render('@startuml\nA -> B\n@enduml', {
        signal: new AbortController().signal,
      })
    ).rejects.toThrow();
    expect(elsewhere).toEqual([]);
  } finally {
    await configured.stop();
    await other.stop();
  }
});
