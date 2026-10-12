import { expect, it } from 'bun:test';

import { createEditor } from '../../../core';
import { BaseLinkPlugin } from './BaseLinkPlugin';

it('prepares a raw URL before admitting and writing it', () => {
  const editor = createEditor({
    plugins: [BaseLinkPlugin],
    initialValue: [{ type: 'paragraph', children: [{ text: '' }] }],
    selection: {
      kind: 'text',
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 0 },
    },
  });
  expect(
    editor.plugin(BaseLinkPlugin).update.upsert({
      url: 'https://example.com/a path%20?q=あ',
      text: 'Example',
    })
  ).toBe(true);
  expect(
    editor.read.nodes.find({ at: [], type: BaseLinkPlugin })?.[0]
  ).toMatchObject({ url: 'https://example.com/a%20path%20?q=%E3%81%82' });
  editor.api.history.undo();
  expect(
    editor.read.nodes.find({ at: [], type: BaseLinkPlugin })
  ).toBeUndefined();
});

it('leaves the document untouched when admission refuses the URL', () => {
  const editor = createEditor({
    plugins: [BaseLinkPlugin],
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
      .update.upsert({ url: 'javascript:noop()', text: 'rejected' })
  ).toBeUndefined();
  expect(editor.read.text.string([])).toBe('kept');
  expect(editor.read.lastCommit()).toBe(before);
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
    editor.plugin(BaseLinkPlugin).update.upsert({ url, text: 'label' });
    expect(
      editor.read.nodes.find({ at: [], type: BaseLinkPlugin })?.[0]
    ).toMatchObject({ url: expected });
  }
);
