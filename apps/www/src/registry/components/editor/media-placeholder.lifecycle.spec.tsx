import { expect, it } from 'bun:test';

import { act, render, waitFor } from '@testing-library/react';
import { PlaceholderPlugin } from 'platejs/media/react';
import { createEditor, Plate, PlateContent } from 'platejs/react';
import * as React from 'react';

import { PlaceholderElement } from './media-placeholder';

it('keeps one upload and its progress across a real placeholder view remount', async () => {
  let calls = 0;
  let reportProgress: ((value: number) => void) | undefined;
  let resolveUpload: ((result: { url: string }) => void) | undefined;
  const editor = createEditor({
    plugins: [
      PlaceholderPlugin.configure({
        component: PlaceholderElement,
        initialState: {
          upload: (_file, { onProgress }) => {
            calls += 1;
            reportProgress = onProgress;
            return new Promise((resolve) => {
              resolveUpload = resolve;
            });
          },
        },
      }),
    ],
    initialValue: [
      { type: 'placeholder', mediaType: 'file', children: [{ text: '' }] },
    ],
  });
  const content = (
    <Plate editor={editor}>
      <PlateContent />
    </Plate>
  );
  const first = render(content);
  expect(first.getByRole('button', { name: 'Add a file' })).toBeTruthy();
  act(() =>
    editor
      .plugin(PlaceholderPlugin)
      .api.upload(editor.key([0])!, new File(['x'], 'file.txt'))
  );
  act(() => reportProgress?.(42));
  await waitFor(() => expect(first.getByText('42%')).toBeTruthy());
  first.unmount();
  const second = render(content);
  await waitFor(() => expect(second.getByText('42%')).toBeTruthy());
  expect(calls).toBe(1);
  expect(
    second.getByRole('button', { name: /file.txt/ }).hasAttribute('disabled')
  ).toBe(true);
  await act(async () => {
    resolveUpload?.({ url: 'https://example.test/file.txt' });
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
