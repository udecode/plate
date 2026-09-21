import { expect, it } from 'bun:test';

import { act, fireEvent, render, waitFor } from '@testing-library/react';
import type { UploadOutcome } from 'files-sdk/client';
import { FilePlugin } from 'platejs/media/react';
import { createEditor, EditorContent, EditorRoot } from 'platejs/react';
import { UploadPlugin } from 'platejs/upload/react';
import * as React from 'react';

import { UploadElement } from './upload';

it('keeps one upload and its progress across a real upload view remount', async () => {
  let calls = 0;
  let reportProgress:
    | ((value: { fraction: number; loaded: number; total: number }) => void)
    | undefined;
  let resolveUpload: ((result: UploadOutcome) => void) | undefined;
  const editor = createEditor({
    plugins: [
      FilePlugin,
      UploadPlugin.configure({
        component: UploadElement,
        initialState: {
          client: {
            upload: (_file, options) => {
              calls += 1;
              reportProgress = (progress) =>
                options?.onProgress?.(progress, []);
              return new Promise<UploadOutcome>((resolve) => {
                resolveUpload = resolve;
              });
            },
          },
          getUrl: ({ key }) => `https://example.test/${key}`,
        },
      }),
    ],
    initialValue: [{ type: 'upload', kind: 'file', children: [{ text: '' }] }],
  });
  const content = (
    <EditorRoot editor={editor}>
      <EditorContent />
    </EditorRoot>
  );
  const first = render(content);
  expect(first.getByRole('button', { name: 'Add a file' })).toBeTruthy();
  act(() =>
    editor.plugin(UploadPlugin).update.submit([new File(['x'], 'file.txt')], {
      slot: editor.key([0])!,
    })
  );
  act(() => reportProgress?.({ fraction: 0.42, loaded: 42, total: 100 }));
  await waitFor(() => expect(first.getByText('42%')).toBeTruthy());
  first.unmount();
  const second = render(content);
  await waitFor(() => expect(second.getByText('42%')).toBeTruthy());
  expect(calls).toBe(1);
  expect(
    second.getByRole('button', { name: /file.txt/ }).hasAttribute('disabled')
  ).toBe(true);
  await act(async () => {
    resolveUpload?.({ key: 'file.txt', size: 1, type: 'text/plain' });
  });
  await waitFor(() =>
    expect(editor.read.children()[0]).toMatchObject({
      type: 'file',
      url: 'https://example.test/file.txt',
    })
  );
  expect(second.queryByText('42%')).toBeNull();
  expect(calls).toBe(1);
  second.unmount();
});

it('cancels an active upload from the draft without removing the slot', async () => {
  let signal: AbortSignal | undefined;
  const editor = createEditor({
    plugins: [
      FilePlugin,
      UploadPlugin.configure({
        component: UploadElement,
        initialState: {
          client: {
            upload: (_file, options) => {
              signal = options?.signal;
              return new Promise<UploadOutcome>(() => {});
            },
          },
          getUrl: ({ key }) => `https://example.test/${key}`,
        },
      }),
    ],
    initialValue: [{ type: 'upload', kind: 'file', children: [{ text: '' }] }],
  });
  const view = render(
    <EditorRoot editor={editor}>
      <EditorContent />
    </EditorRoot>
  );

  act(() =>
    editor.plugin(UploadPlugin).update.submit([new File(['x'], 'file.txt')], {
      slot: editor.key([0])!,
    })
  );
  await waitFor(() =>
    expect(view.getByRole('button', { name: 'Cancel upload' })).toBeTruthy()
  );
  fireEvent.click(view.getByRole('button', { name: 'Cancel upload' }));
  expect(signal?.aborted).toBe(true);
  expect(editor.read.children()[0]).toMatchObject({ type: 'upload' });
  await waitFor(() =>
    expect(view.getByRole('button', { name: 'Add a file' })).toBeTruthy()
  );
  view.unmount();
});
