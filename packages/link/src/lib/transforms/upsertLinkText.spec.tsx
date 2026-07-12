import { createBaseEditor } from '@platejs/core';

import { BaseLinkPlugin } from '../BaseLinkPlugin';

const createEditor = () =>
  createBaseEditor({
    plugins: [BaseLinkPlugin],
    selection: {
      anchor: { offset: 3, path: [0, 0, 0] },
      focus: { offset: 3, path: [0, 0, 0] },
    },
    value: [
      {
        children: [
          {
            children: [{ bold: true, text: 'old' }, { text: ' tail' }],
            type: 'a',
            url: 'https://example.com',
          },
        ],
        type: 'p',
      },
    ],
  });

describe('upsertLinkText', () => {
  it('replaces children and preserves first-leaf marks', () => {
    const editor = createEditor();

    editor.update.link.upsertText({
      text: 'new value',
      url: 'https://example.com',
    });

    expect(editor.read.nodes.find({ match: { type: 'a' } })?.[0]).toMatchObject(
      {
        children: [{ bold: true, text: 'new value' }],
        type: 'a',
      }
    );
  });

  it('does nothing without different replacement text', () => {
    const editor = createEditor();
    const before = editor.read.children();

    editor.update.link.upsertText({
      text: 'old tail',
      url: 'https://example.com',
    });
    editor.update.link.upsertText({ url: 'https://example.com' });

    expect(editor.read.children()).toEqual(before);
  });
});
