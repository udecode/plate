/** @jsx jsx */

import { PlateEditor } from '@udecode/plate-common';
import { jsx } from '@udecode/plate-test-utils';
import { createPlateUIEditor } from '../../../../ui/plate/src/utils/createPlateUIEditor';
import { createCodeBlockPlugin } from '../createCodeBlockPlugin';
import { insertCodeLine } from './insertCodeLine';

jsx;

describe('insert code line', () => {
  it('should insert code line below selected line', () => {
    const input = ((
      <editor>
        <hcodeblock>
          <hcodeline>
            line 1<cursor />
          </hcodeline>
          <hcodeline>line 2</hcodeline>
        </hcodeblock>
      </editor>
    ) as any) as PlateEditor;

    const output = ((
      <editor>
        <hcodeblock>
          <hcodeline>line 1</hcodeline>
          <hcodeline>
            {'    '}
            <cursor />
          </hcodeline>
          <hcodeline>line 2</hcodeline>
        </hcodeblock>
      </editor>
    ) as any) as PlateEditor;

    const editor = createPlateUIEditor({
      editor: input,
      plugins: [createCodeBlockPlugin()],
    });

    insertCodeLine(editor, 4);

    expect(input.children).toEqual(output.children);
  });
});
