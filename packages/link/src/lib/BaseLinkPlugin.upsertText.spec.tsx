import { createBaseEditor, createBasePlugin } from '@platejs/core';
import { property } from '@platejs/plite';

import { BaseLinkPlugin } from './BaseLinkPlugin';

const createEditor = () =>
  createBaseEditor({
    plugins: [
      createBasePlugin({
        key: 'bold',
        schema: {
          mark: property.boolean({ default: false, omitDefault: true }),
        },
      }),
      BaseLinkPlugin,
    ],
    selection: {
      kind: 'text',
      anchor: { offset: 3, path: [0, 1, 0] },
      focus: { offset: 3, path: [0, 1, 0] },
    },
    initialValue: [
      {
        children: [
          { text: '' },
          {
            children: [{ bold: true, text: 'old' }, { text: ' tail' }],
            type: 'a',
            url: 'https://example.com',
          },
          { text: '' },
        ],
        type: 'p',
      },
    ],
  });

describe('editor.update.link.upsertText', () => {
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
