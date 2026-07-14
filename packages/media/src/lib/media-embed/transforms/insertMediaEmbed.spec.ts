import { createBaseEditor } from '@platejs/core';
import { KEYS } from '@platejs/utils';

import { BaseMediaEmbedPlugin } from '../BaseMediaEmbedPlugin';
import { insertMediaEmbed } from './insertMediaEmbed';

describe('insertMediaEmbed', () => {
  it('does nothing without a selection', () => {
    const editor = createBaseEditor({
      plugins: [BaseMediaEmbedPlugin],
      value: [{ children: [{ text: '' }], type: KEYS.p }],
    });

    insertMediaEmbed(editor, { url: 'https://platejs.org/embed' });

    expect(editor.read.children()).toHaveLength(1);
  });

  it('inserts after the selected block', () => {
    const editor = createBaseEditor({
      plugins: [BaseMediaEmbedPlugin],
      selection: {
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 0, path: [0, 0] },
      },
      value: [{ children: [{ text: '' }], type: KEYS.p }],
    });

    insertMediaEmbed(editor, { url: 'https://platejs.org/embed' });

    expect(editor.read.children()[1]).toMatchObject({
      children: [{ text: '' }],
      type: KEYS.mediaEmbed,
      url: 'https://platejs.org/embed',
    });
  });

  it('inserts after an explicit block target without a selection', () => {
    const editor = createBaseEditor({
      plugins: [BaseMediaEmbedPlugin],
      value: [{ children: [{ text: '' }], type: KEYS.p }],
    });

    insertMediaEmbed(editor, { url: 'https://platejs.org/embed' }, { at: [0] });

    expect(editor.read.children()[1]).toMatchObject({
      type: KEYS.mediaEmbed,
      url: 'https://platejs.org/embed',
    });
  });
});
