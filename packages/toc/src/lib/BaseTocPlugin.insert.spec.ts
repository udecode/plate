import { createBaseEditor } from '@platejs/core';
import { KEYS } from '@platejs/utils';

import { BaseTocPlugin } from './BaseTocPlugin';

describe('BaseTocPlugin.update.insert', () => {
  it('inserts the default toc node shape', () => {
    const editor = createBaseEditor({
      plugins: [BaseTocPlugin],
      initialValue: [
        {
          children: [{ text: 'a' }],
          type: KEYS.p,
        },
      ],
    });

    editor.plugin(BaseTocPlugin).update.insert({ at: [1] });

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
      initialValue: [
        {
          children: [{ text: 'a' }],
          type: KEYS.p,
        },
      ],
    });

    editor.plugin(BaseTocPlugin).update.insert({ at: [1] });

    expect(editor.read.children()[1]).toMatchObject({
      children: [{ text: '' }],
      type: 'custom-toc',
    });
  });
});
