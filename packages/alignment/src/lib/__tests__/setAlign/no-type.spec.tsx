/** @jsx jsxt */

import type { SlateEditor } from '@udecode/plate-common';

import { createSlateEditor } from '@udecode/plate-common';
import { jsxt } from '@udecode/plate-test-utils';

import { BaseAlignPlugin } from '../../BaseAlignPlugin';
import { setAlign } from '../../transforms';

jsxt;

describe('when type (h1) is not in types', () => {
  const input = (
    <editor>
      <hh1>
        test
        <cursor />
      </hh1>
    </editor>
  ) as any as SlateEditor;

  const output = (
    <editor>
      <hh1>test</hh1>
    </editor>
  ) as any as SlateEditor;

  it('should not align', () => {
    const editor = createSlateEditor({
      editor: input,
      plugins: [BaseAlignPlugin],
    });

    setAlign(editor, { value: 'center' });

    expect(input.children).toEqual(output.children);
  });
});
