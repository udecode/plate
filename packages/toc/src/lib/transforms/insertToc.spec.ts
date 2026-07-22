import { createBaseEditor } from '@platejs/core';
import { KEYS } from '@platejs/utils';

import { BaseTocPlugin } from '../BaseTocPlugin';
import { insertToc } from './insertToc';

describe('insertToc', () => {
  it('inserts the default toc node shape', () => {
    const editor = createBaseEditor({
      plugins: [BaseTocPlugin],
      value: [
        {
          children: [{ text: 'a' }],
          type: KEYS.p,
        },
      ],
    });

    editor.update((tx) => insertToc(editor, tx, { at: [1] }));

    expect(editor.read.children()).toMatchObject([
      {
        children: [{ text: 'a' }],
        type: KEYS.p,
      },
      {
        children: [{ text: '' }],
        type: KEYS.toc,
      },
    ]);
  });

  it('respects the configured node type', () => {
    const editor = createBaseEditor({
      plugins: [BaseTocPlugin.configure({ type: 'custom-toc' })],
      value: [
        {
          children: [{ text: 'a' }],
          type: KEYS.p,
        },
      ],
    });

    editor.update((tx) => insertToc(editor, tx, { at: [1] }));

    expect(editor.read.children()[1]).toMatchObject({
      children: [{ text: '' }],
      type: 'custom-toc',
    });
  });
});
