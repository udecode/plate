import { expect, it } from 'bun:test';

import { waitFor } from '@testing-library/react';
import { DndPlugin } from 'platejs/dnd/react';
import { FilePlugin } from 'platejs/media/react';
import { createEditor } from 'platejs/react';
import { UploadPlugin } from 'platejs/upload/react';

import { DndKit } from './dnd';

it('ignores a file drop when the editor has no Upload plugin', () => {
  const editor = createEditor({
    plugins: DndKit,
    initialValue: [{ type: 'paragraph', children: [{ text: 'Keep' }] }],
  });
  const onDropFiles = editor.plugin(DndPlugin).store.get('onDropFiles');

  expect(onDropFiles).not.toBeNull();
  expect(() =>
    onDropFiles?.({
      dragItem: { files: [new File(['x'], 'file.txt')] },
      edge: 'after',
      editor,
      key: editor.key([0])!,
    } as unknown as Parameters<NonNullable<typeof onDropFiles>>[0])
  ).not.toThrow();
  expect(editor.read.children()[0]).toMatchObject({
    type: 'paragraph',
    children: [{ text: 'Keep' }],
  });
});

it('submits dropped files through the installed Upload plugin', async () => {
  let uploads = 0;
  const editor = createEditor({
    plugins: [
      FilePlugin,
      UploadPlugin.configure({
        initialState: {
          client: {
            upload: async (file: File) => {
              uploads += 1;
              return {
                key: 'stored/file.txt',
                size: file.size,
                type: file.type,
              };
            },
          },
          getUrl: ({ key }) => `https://example.test/${key}`,
        },
      }),
      ...DndKit,
    ],
    initialValue: [{ type: 'paragraph', children: [{ text: 'Keep' }] }],
  });
  const onDropFiles = editor.plugin(DndPlugin).store.get('onDropFiles');

  onDropFiles?.({
    dragItem: { files: [new File(['x'], 'file.txt', { type: 'text/plain' })] },
    edge: 'after',
    editor,
    key: editor.key([0])!,
  } as unknown as Parameters<NonNullable<typeof onDropFiles>>[0]);

  await waitFor(() =>
    expect(Array.from(editor.read.children())[1]).toMatchObject({
      type: 'file',
      url: 'https://example.test/stored/file.txt',
    })
  );
  expect(uploads).toBe(1);
});
