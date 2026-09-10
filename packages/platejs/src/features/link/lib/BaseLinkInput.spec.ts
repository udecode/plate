import { expect, it, mock } from 'bun:test';

import { createEditor } from '../../../core';
import { BaseLinkPlugin } from './BaseLinkPlugin';

it('prepares a raw URL once before validating and writing it', () => {
  const transformInput = mock((input: string) => `https://${input}`);
  const isUrl = mock((url: string) => url.startsWith('https://example.com/'));
  const editor = createEditor({
    plugins: [
      BaseLinkPlugin.configure({ initialState: { transformInput, isUrl } }),
    ],
    initialValue: [{ type: 'paragraph', children: [{ text: '' }] }],
    selection: {
      kind: 'text',
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 0 },
    },
  });
  expect(
    editor
      .plugin(BaseLinkPlugin)
      .update.upsert({ url: 'example.com/a path%20?q=あ', text: 'Example' })
  ).toBe(true);
  expect(transformInput).toHaveBeenCalledTimes(1);
  expect(transformInput).toHaveBeenCalledWith(
    'example.com/a%20path%20?q=%E3%81%82'
  );
  expect(isUrl).toHaveBeenCalledTimes(1);
  expect(
    editor.read.nodes.find({ at: [], type: BaseLinkPlugin })?.[0]
  ).toMatchObject({ url: 'https://example.com/a%20path%20?q=%E3%81%82' });
  editor.update.history.undo();
  expect(
    editor.read.nodes.find({ at: [], type: BaseLinkPlugin })
  ).toBeUndefined();
});

it('validates the transformed URL and leaves rejected drafts untouched', () => {
  const transformInput = mock(() => 'javascript:noop()');
  const editor = createEditor({
    plugins: [BaseLinkPlugin.configure({ initialState: { transformInput } })],
    initialValue: [{ type: 'paragraph', children: [{ text: 'kept' }] }],
    selection: {
      kind: 'text',
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 4 },
    },
  });
  const before = editor.read.lastCommit();
  expect(
    editor
      .plugin(BaseLinkPlugin)
      .update.upsert({ url: 'https://example.com', text: 'rejected' })
  ).toBeUndefined();
  expect(editor.read.text.string([])).toBe('kept');
  expect(editor.read.lastCommit()).toBe(before);
});

it('keeps pasted text literal when the selection is already inside a link', () => {
  const transformInput = mock((url: string) => `https://${url}`);
  const editor = createEditor({
    plugins: [BaseLinkPlugin.configure({ initialState: { transformInput } })],
    initialValue: [
      {
        type: 'paragraph',
        children: [
          { text: '' },
          {
            type: 'link',
            url: 'https://example.com',
            children: [{ text: 'label' }],
          },
          { text: '' },
        ],
      },
    ],
    selection: {
      kind: 'text',
      anchor: { path: [0, 1, 0], offset: 5 },
      focus: { path: [0, 1, 0], offset: 5 },
    },
  });
  editor
    .plugin(BaseLinkPlugin)
    .update.upsert({ insertTextInLink: true, url: ' raw text' });
  expect(editor.read.text.string([])).toBe('label raw text');
  expect(transformInput).not.toHaveBeenCalled();
});

it.each([
  [
    'https://username:credential@example.com:1234/path?query=value#fragment',
    'https://username:credential@example.com:1234/path?query=value#fragment',
  ],
  [
    'https://example.com/path%20with%20spaces?query=value%2Bencoded',
    'https://example.com/path%20with%20spaces?query=value%2Bencoded',
  ],
  [
    'https://example.com/path%20with%20spaces?query=あ',
    'https://example.com/path%20with%20spaces?query=%E3%81%82',
  ],
  [
    'https://example.com/path?query=あ',
    'https://example.com/path?query=%E3%81%82',
  ],
  ['https://example.com/%', 'https://example.com/%'],
  ['', ''],
  [
    'Just a random string without URI format',
    'Just%20a%20random%20string%20without%20URI%20format',
  ],
])(
  'prepares the submitted input %s without corrupting percent escapes',
  (url, expected) => {
    const editor = createEditor({
      plugins: [BaseLinkPlugin],
      initialValue: [{ type: 'paragraph', children: [{ text: '' }] }],
      selection: {
        kind: 'text',
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 0 },
      },
    });
    editor
      .plugin(BaseLinkPlugin)
      .update.upsert({ url, text: 'label', skipValidation: true });
    expect(
      editor.read.nodes.find({ at: [], type: BaseLinkPlugin })?.[0]
    ).toMatchObject({ url: expected });
  }
);
