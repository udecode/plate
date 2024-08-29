/** @jsx jsx */

import type { SlateEditor } from '@udecode/plate-common';

import { createSlateEditor } from '@udecode/plate-common';
import { jsx } from '@udecode/plate-test-utils';

import { AlignPlugin } from '../../AlignPlugin';
import { setAlign } from '../../transforms';

jsx;

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
      plugins: [AlignPlugin],
    });

    setAlign(editor, { value: 'center' });

    expect(input.children).toEqual(output.children);
  });
});
