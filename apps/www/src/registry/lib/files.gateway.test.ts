import { expect, test } from 'bun:test';

import { FilesError, createFiles } from 'files-sdk';
import { createFilesClient } from 'files-sdk/client';
import { memory } from 'files-sdk/memory';

import {
  createFilesGateway,
  filesDownloadUrl,
  resolveFilesAccess,
  type FilesAccess,
} from './files';

const endpoint = 'https://editor.example.test/api/files?documentId=doc-a';
const secret = 'fixed-installed-sdk-gateway-secret-123456789';
const allowed: FilesAccess = {
  namespace: 'tenant-a/doc-a',
  canRead: true,
  canWrite: true,
};

const post = (op: string, fields: Record<string, unknown> = {}) =>
  new Request(endpoint, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ op, ...fields }),
  });

const presign = () =>
  post('presign', {
    files: [{ name: 'a.png', size: 3, type: 'image/png' }],
  });

const statusOf = async (response: Promise<Response>): Promise<number> => {
  const result = await response;
  return result.status;
};

test('published FilesError and ACL denials keep exact outer-boundary statuses', async () => {
  const adapter = memory();
  const unconfigured = createFilesGateway({
    adapter,
    secret,
    maxUploadSize: 1024,
    resolveAccess: resolveFilesAccess,
  });
  expect(await statusOf(unconfigured.POST(presign()))).toBe(503);

  const noSession = createFilesGateway({
    adapter,
    secret,
    maxUploadSize: 1024,
    resolveAccess: async () => null,
  });
  expect(await statusOf(noSession.POST(presign()))).toBe(401);

  const publicError = createFilesGateway({
    adapter,
    secret,
    maxUploadSize: 1024,
    resolveAccess: async () => {
      throw new FilesError('Unauthorized', 'Session expired');
    },
  });
  const expired = await publicError.POST(presign());
  expect(expired.status).toBe(401);
  const expiredBody = await expired.json();
  expect(expiredBody.error.code).toBe('Unauthorized');

  const readOnly = createFilesGateway({
    adapter,
    secret,
    maxUploadSize: 1024,
    resolveAccess: async () => ({ ...allowed, canWrite: false }),
  });
  expect(await statusOf(readOnly.POST(presign()))).toBe(403);
  const noRead = createFilesGateway({
    adapter,
    secret,
    maxUploadSize: 1024,
    resolveAccess: async () => ({ ...allowed, canRead: false }),
  });
  expect(
    await statusOf(
      noRead.GET(new Request(filesDownloadUrl(endpoint, 'doc-a', 'missing')))
    )
  ).toBe(403);
});

test('keyless upload is scoped; explicit PUT and revoked proxy PUT never store bytes', async () => {
  const adapter = memory();
  let canWrite = true;
  const gateway = createFilesGateway({
    adapter,
    secret,
    maxUploadSize: 3,
    resolveAccess: async () => ({ ...allowed, canWrite }),
  });
  const files = createFiles({ adapter });

  const signed = await gateway.POST(presign());
  expect(signed.status).toBe(200);
  const { uploads } = await signed.json();
  const { id, key, target } = uploads[0];
  expect(key.startsWith('documents/')).toBe(false);
  expect(target.url).toContain('op=proxy');

  canWrite = false;
  expect(
    await statusOf(
      gateway.PUT(new Request(target.url, { method: 'PUT', body: 'abc' }))
    )
  ).toBe(403);
  expect(await files.exists(`documents/${allowed.namespace}/${key}`)).toBe(
    false
  );

  canWrite = true;
  expect(
    await statusOf(
      gateway.PUT(
        new Request(`${endpoint}&op=upload&key=chosen`, {
          method: 'PUT',
          body: 'abc',
        })
      )
    )
  ).toBe(403);
  expect(await files.exists(`documents/${allowed.namespace}/chosen`)).toBe(
    false
  );

  expect(
    await statusOf(
      gateway.PUT(new Request(target.url, { method: 'PUT', body: 'abc' }))
    )
  ).toBe(200);
  const completed = await gateway.POST(
    post('complete', { completions: [{ id, key }] })
  );
  expect(completed.status).toBe(200);
  const completedBody = await completed.json();
  expect(completedBody.files[0].key).toBe(key);
  expect(await files.exists(`documents/${allowed.namespace}/${key}`)).toBe(
    true
  );
});

test('durable URL checks current read access and only trusted types render inline', async () => {
  const adapter = memory();
  const files = createFiles({ adapter });
  await files.upload(`documents/${allowed.namespace}/safe.png`, 'abc', {
    contentType: 'text/html',
  });
  let canRead = true;
  let trusted = false;
  const gateway = createFilesGateway({
    adapter,
    secret,
    maxUploadSize: 1024,
    resolveAccess: async () => ({ ...allowed, canRead }),
    trustedInlineType: async () => (trusted ? 'image/png' : 'text/html'),
  });
  const url = filesDownloadUrl(endpoint, 'doc-a', 'safe.png');
  expect(url).toContain('op=download');

  const attachment = await gateway.GET(new Request(url));
  expect(attachment.status).toBe(200);
  expect(attachment.headers.get('content-disposition')).toBe('attachment');

  trusted = true;
  const inline = await gateway.GET(new Request(url));
  expect(inline.status).toBe(200);
  expect(inline.headers.get('content-disposition')).toBe('inline');
  expect(inline.headers.get('content-type')).toBe('image/png');
  expect(inline.headers.get('x-content-type-options')).toBe('nosniff');
  expect(inline.headers.get('cache-control')).toBe('private, no-store');

  const ranged = await gateway.GET(
    new Request(url, { headers: { range: 'bytes=1-2' } })
  );
  expect(ranged.status).toBe(206);
  expect(ranged.headers.get('content-range')).toBe('bytes 1-2/3');
  expect(await ranged.text()).toBe('bc');

  const invalidRange = await gateway.GET(
    new Request(url, { headers: { range: 'bytes=5-' } })
  );
  expect(invalidRange.status).toBe(416);

  canRead = false;
  expect(await statusOf(gateway.GET(new Request(url)))).toBe(403);
});

test('bounded proxy upload rejects an oversized body without storing it', async () => {
  const adapter = memory();
  const gateway = createFilesGateway({
    adapter,
    secret,
    maxUploadSize: 3,
    resolveAccess: async () => allowed,
  });
  const signed = await gateway.POST(presign());
  const { uploads } = await signed.json();
  const { key, target } = uploads[0];
  const oversized = await gateway.PUT(
    new Request(target.url, { method: 'PUT', body: 'abcd' })
  );
  expect(oversized.status).toBe(422);
  expect(
    await createFiles({ adapter }).exists(
      `documents/${allowed.namespace}/${key}`
    )
  ).toBe(false);
});

test('the installed client completes a keyless upload through the copied gateway', async () => {
  const adapter = memory();
  const gateway = createFilesGateway({
    adapter,
    secret,
    maxUploadSize: 1024,
    resolveAccess: async () => allowed,
  });
  const methods: string[] = [];
  const fetchImpl: typeof fetch = Object.assign(
    (
      input: Parameters<typeof fetch>[0],
      init?: Parameters<typeof fetch>[1]
    ) => {
      const req = new Request(input, init);
      methods.push(req.method);
      return gateway[req.method as 'GET' | 'POST' | 'PUT'](req);
    },
    { preconnect: fetch.preconnect }
  );
  const browserXhr = globalThis.XMLHttpRequest;
  globalThis.XMLHttpRequest = undefined as never;
  const client = createFilesClient({ endpoint, fetchImpl });
  globalThis.XMLHttpRequest = browserXhr;

  const outcome = await client.upload(
    new File(['abc'], 'a.png', { type: 'image/png' })
  );
  expect(outcome.size).toBe(3);
  expect(methods).toEqual(['POST', 'PUT', 'POST']);
  expect(
    await createFiles({ adapter }).exists(
      `documents/${allowed.namespace}/${outcome.key}`
    )
  ).toBe(true);
});
