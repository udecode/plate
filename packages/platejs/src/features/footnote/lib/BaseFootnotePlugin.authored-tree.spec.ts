import { createAuthoredPlugin } from 'plitejs/authored';

import { createEditor } from '../../../core';
import {
  BaseFootnoteDefinitionPlugin,
  BaseFootnotePlugin,
} from './BaseFootnotePlugin';

const struck = { at: 1, author: 'bob', change: 'bob:1', kind: 'delete' };

describe('footnote navigation beside a struck block', () => {
  it('returns and selects the definition where the document holds it', () => {
    const editor = createEditor({
      initialValue: [
        {
          authored: [struck],
          children: [{ authored: [struck], text: 'gone' }],
          type: 'paragraph',
        },
        {
          children: [
            { text: 'a' },
            {
              children: [{ text: '' }],
              ref: '1',
              type: 'footnoteReference',
            },
            { text: 'b' },
          ],
          type: 'paragraph',
        },
        {
          children: [{ children: [{ text: 'body' }], type: 'paragraph' }],
          ref: '1',
          type: 'footnoteDefinition',
        },
      ] as never,
      plugins: [
        BaseFootnotePlugin,
        BaseFootnoteDefinitionPlugin,
        createAuthoredPlugin({
          authorId: 'alice',
          createChangeId: () => 'alice:1',
          intent: 'edit',
          now: () => 1,
        }),
      ],
    });

    expect(editor.update.footnote.selectDefinition({ ref: '1' })).toEqual({
      point: { offset: 0, path: [2, 0, 0] },
      targetPath: [2],
    });
    expect(editor.read.selection()).toEqual({
      anchor: { offset: 0, path: [2, 0, 0] },
      focus: { offset: 0, path: [2, 0, 0] },
    });
  });
});
