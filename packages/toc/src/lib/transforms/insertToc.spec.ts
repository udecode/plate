import { createSlateEditor, KEYS } from 'platejs';

import { BaseTocPlugin } from '../BaseTocPlugin';
import { insertToc } from './insertToc';

describe('insertToc', () => {
  it('inserts the default toc node shape', () => {
    const editor = createSlateEditor({
      plugins: [BaseTocPlugin],
      value: [
        {
          children: [{ text: 'a' }],
          type: KEYS.p,
        },
      ],
    });

    insertToc(editor, { at: [1] });

    expect(editor.children).toMatchObject([
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
    const editor = createSlateEditor({
      plugins: [BaseTocPlugin.configure({ node: { type: 'custom-toc' } })],
      value: [
        {
          children: [{ text: 'a' }],
          type: KEYS.p,
        },
      ],
    });

    insertToc(editor, { at: [1] });

    expect(editor.children[1]).toMatchObject({
      children: [{ text: '' }],
      type: 'custom-toc',
    });
  });
});
