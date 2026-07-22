import assert from 'node:assert/strict';
import type { TCodeBlockElement } from '@platejs/utils';

import { BaseParagraphPlugin, createBaseEditor } from '@platejs/core';

import { BaseCodeBlockPlugin } from '../BaseCodeBlockPlugin';
import { setCodeBlockContent } from './setCodeBlockContent';

describe('setCodeBlockContent', () => {
  it('replaces code block children with code lines', () => {
    const editor = createBaseEditor({
      plugins: [BaseParagraphPlugin, BaseCodeBlockPlugin],
      initialValue: [
        {
          children: [
            {
              children: [{ text: 'before' }],
              type: 'code_line',
            },
          ],
          type: 'code_block',
        },
      ],
    });
    const entry = editor.read.nodes.get<TCodeBlockElement>([0]);
    assert(entry);
    const [element] = entry;

    editor.update((tx) => {
      setCodeBlockContent(editor, tx, {
        code: '{\n  "name": "plate"\n}',
        element,
      });
    });

    const updatedEntry = editor.read.nodes.get<TCodeBlockElement>([0]);
    assert(updatedEntry);
    expect(updatedEntry[0].children).toEqual([
      { children: [{ text: '{' }], type: 'code_line' },
      { children: [{ text: '  "name": "plate"' }], type: 'code_line' },
      { children: [{ text: '}' }], type: 'code_line' },
    ]);
  });
});
