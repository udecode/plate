import assert from 'node:assert/strict';
import fs from 'node:fs';
import http from 'node:http';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';

import {
  configureStaticServer,
  createStaticRequestHandler,
  createStaticSnapshot,
  resolveStaticAsset,
  STATIC_SERVER_HEADERS_TIMEOUT_MS,
  STATIC_SERVER_KEEP_ALIVE_TIMEOUT_BUFFER_MS,
  STATIC_SERVER_KEEP_ALIVE_TIMEOUT_MS,
} from './plite-static-server.mjs';

const createFixture = () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'plite-static-server-'));

  fs.mkdirSync(path.join(root, '_next/static/chunks'), { recursive: true });
  fs.mkdirSync(path.join(root, 'examples/plite'), { recursive: true });
  fs.writeFileSync(path.join(root, 'index.html'), '<main>home</main>');
  fs.writeFileSync(
    path.join(root, 'examples/plite/index.html'),
    '<main>examples</main>'
  );
  fs.writeFileSync(
    path.join(root, '_next/static/chunks/743.hash.js'),
    'globalThis.chunk = 743;'
  );

  return root;
};

test('captures one immutable export generation and resolves clean routes', () => {
  const root = createFixture();

  try {
    const snapshot = createStaticSnapshot(root);
    const chunkPath = path.join(root, '_next/static/chunks/743.hash.js');

    assert.equal(snapshot.files, 3);
    assert.equal(
      resolveStaticAsset(snapshot, '/').body.toString(),
      '<main>home</main>'
    );
    assert.equal(
      resolveStaticAsset(snapshot, '/examples/plite').body.toString(),
      '<main>examples</main>'
    );
    assert.equal(
      resolveStaticAsset(
        snapshot,
        '/_next/static/chunks/743.hash.js?proof=1'
      ).body.toString(),
      'globalThis.chunk = 743;'
    );

    fs.writeFileSync(chunkPath, 'corrupted');
    fs.rmSync(path.join(root, 'examples'), { recursive: true });

    assert.equal(
      resolveStaticAsset(
        snapshot,
        '/_next/static/chunks/743.hash.js'
      ).body.toString(),
      'globalThis.chunk = 743;'
    );
    assert.equal(
      resolveStaticAsset(snapshot, '/examples/plite/').body.toString(),
      '<main>examples</main>'
    );
    assert.equal(resolveStaticAsset(snapshot, '/%2e%2e/secret'), undefined);
  } finally {
    fs.rmSync(root, { force: true, recursive: true });
  }
});

test('serves immutable chunks without touching the filesystem again', () => {
  const root = createFixture();

  try {
    const snapshot = createStaticSnapshot(root);
    const handler = createStaticRequestHandler(snapshot);
    const response = {
      body: undefined,
      end(body) {
        this.body = body;
      },
      writeHead(status, headers) {
        this.headers = headers;
        this.status = status;
      },
    };

    handler(
      {
        method: 'GET',
        url: '/_next/static/chunks/743.hash.js',
      },
      response
    );

    assert.equal(response.status, 200);
    assert.equal(
      response.headers['Cache-Control'],
      'public, max-age=31536000, immutable'
    );
    assert.equal(
      response.headers['Content-Type'],
      'text/javascript; charset=utf-8'
    );
    assert.equal(response.body.toString(), 'globalThis.chunk = 743;');
  } finally {
    fs.rmSync(root, { force: true, recursive: true });
  }
});

test('keeps idle proof sockets alive across delayed lazy chunk loads', () => {
  const server = configureStaticServer(http.createServer());

  assert.equal(server.keepAliveTimeout, STATIC_SERVER_KEEP_ALIVE_TIMEOUT_MS);
  assert.equal(
    server.keepAliveTimeoutBuffer,
    STATIC_SERVER_KEEP_ALIVE_TIMEOUT_BUFFER_MS
  );
  assert.equal(server.headersTimeout, STATIC_SERVER_HEADERS_TIMEOUT_MS);
});
