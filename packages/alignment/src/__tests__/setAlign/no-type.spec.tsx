/** @jsx jsx */

import { createAlignPlugin } from '@/packages/alignment/src/createAlignPlugin';
import { setAlign } from '@/packages/alignment/src/transforms/setAlign';
import { PlateEditor, createPlateEditor } from '@udecode/plate-common';
import { jsx } from '@udecode/plate-test-utils';

jsx;

describe('when type (h1) is not in types', () => {
  const input = (
    <editor>
      <hh1>
        test
        <cursor />
      </hh1>
    </editor>
  ) as any as PlateEditor;

  const output = (
    <editor>
      <hh1>test</hh1>
    </editor>
  ) as any as PlateEditor;

  it('should not align', () => {
    const editor = createPlateEditor({
      editor: input,
      plugins: [createAlignPlugin()],
    });

    setAlign(editor, { value: 'center' });

    expect(input.children).toEqual(output.children);
  });
});
