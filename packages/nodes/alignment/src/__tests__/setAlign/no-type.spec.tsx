/** @jsx jsx */

import { PlateEditor } from '@udecode/plate-common';
import { jsx } from '@udecode/plate-test-utils';
import { createPlateUIEditor } from '../../../../../ui/plate/src/utils/createPlateUIEditor';
import { createAlignPlugin } from '../../createAlignPlugin';
import { setAlign } from '../../transforms/setAlign';

jsx;

describe('when type (h1) is not in types', () => {
  const input = ((
    <editor>
      <hh1>
        test
        <cursor />
      </hh1>
    </editor>
  ) as any) as PlateEditor;

  const output = ((
    <editor>
      <hh1>test</hh1>
    </editor>
  ) as any) as PlateEditor;

  it('should not align', () => {
    const editor = createPlateUIEditor({
      editor: input,
      plugins: [createAlignPlugin()],
    });

    setAlign(editor, { value: 'center' });

    expect(input.children).toEqual(output.children);
  });
});
