import type { TCodeBlockElement } from 'platejs';

import { BaseParagraphPlugin, createSlateEditor } from 'platejs';

import { BaseCodeBlockPlugin } from '../BaseCodeBlockPlugin';
import { setCodeBlockContent } from './setCodeBlockContent';

describe('setCodeBlockContent', () => {
  it('replaces code block children with code lines and redecorates', () => {
    const editor = createSlateEditor({
      plugins: [BaseParagraphPlugin, BaseCodeBlockPlugin],
      value: [
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
    } as any);
    const element = editor.children[0] as TCodeBlockElement;
    let redecorateCalls = 0;

    editor.api.redecorate = () => {
      redecorateCalls += 1;
    };

    setCodeBlockContent(editor, {
      code: '{\n  "name": "plate"\n}',
      element,
    });

    expect((editor.children[0] as TCodeBlockElement).children).toEqual([
      { children: [{ text: '{' }], type: 'code_line' },
      { children: [{ text: '  "name": "plate"' }], type: 'code_line' },
      { children: [{ text: '}' }], type: 'code_line' },
    ]);
    expect(redecorateCalls).toBe(1);
  });
});
