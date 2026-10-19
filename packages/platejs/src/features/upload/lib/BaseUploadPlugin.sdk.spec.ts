import { expect, test } from 'bun:test';

import { createFiles } from 'files-sdk';
import { createFilesRouter } from 'files-sdk/api';
import { createFilesClient, type Transport } from 'files-sdk/client';
import { memory } from 'files-sdk/memory';

import { createEditor } from '../../../core';
import { BaseImagePlugin } from '../../media/lib/image/BaseImagePlugin';
import { BaseUploadPlugin } from './BaseUploadPlugin';

test('FilesClient completes a keyless upload into the committed draft', async () => {
  const endpoint = 'https://editor.test/api/files?documentId=one';
  const files = createFiles({ adapter: memory() });
  const router = createFilesRouter({
    files,
    maxUploadSize: 1024,
    operations: ['upload', 'download'],
    secret: 'files-plugin-sdk-test',
  });
  const requests: string[] = [];
  const route = (request: Request) => {
    requests.push(
      `${request.method} ${new URL(request.url).searchParams.get('op') ?? 'json'}`
    );
    return router.handle(request);
  };
  const transport: Transport = async ({ body, headers, method, url }) => {
    if (method !== 'PUT') {
      throw new Error(`Unexpected upload method: ${method}`);
    }
    const response = await route(
      new Request(url, { body: body as Blob, headers, method: 'PUT' })
    );

    return { status: response.status, text: await response.text() };
  };
  const client = createFilesClient({
    endpoint,
    fetchImpl: (input, init) => route(new Request(input, init)),
    transport,
  });
  const editor = createEditor({
    plugins: [
      BaseImagePlugin,
      BaseUploadPlugin.configure({
        initialState: {
          client,
          getUrl: ({ key }) =>
            `${endpoint}&op=download&key=${encodeURIComponent(key)}`,
        },
      }),
    ],
    initialValue: [{ children: [{ text: '' }], type: 'paragraph' }],
  });

  expect(
    editor
      .plugin(BaseUploadPlugin)
      .update.submit([new File(['abc'], 'a.png', { type: 'image/png' })], {
        after: editor.key([0])!,
        replaceEmpty: true,
      })
  ).toBe(true);

  for (let i = 0; i < 20 && editor.read.children()[0]?.type === 'upload'; i++) {
    await new Promise<void>((resolve) => {
      setTimeout(resolve, 0);
    });
  }

  const image = editor.read.children()[0];
  expect(image).toMatchObject({ type: 'image' });
  if (!image || !('url' in image) || typeof image.url !== 'string') {
    throw new Error('Expected an uploaded image URL');
  }
  expect(requests).toEqual(['POST json', 'PUT proxy', 'POST json']);
  const response = await router.handle(new Request(image.url));
  expect(response.status).toBe(200);
  expect(await response.text()).toBe('abc');
});
