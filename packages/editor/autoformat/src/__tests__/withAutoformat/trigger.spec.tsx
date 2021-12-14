/** @jsx jsx */

import { createPlateEditor } from '@udecode/plate-core';
import { jsx } from '@udecode/plate-test-utils';
import { MARK_BOLD } from '../../../../../nodes/basic-marks/src/createBoldPlugin';
import { MARK_ITALIC } from '../../../../../nodes/basic-marks/src/createItalicPlugin';
import { MARK_UNDERLINE } from '../../../../../nodes/basic-marks/src/createUnderlinePlugin';
import { createAutoformatPlugin } from '../../createAutoformatPlugin';

jsx;

const input = (
  <editor>
    <hp>
      _***hello***
      <cursor />
    </hp>
  </editor>
) as any;

const output = (
  <editor>
    <hp>
      <htext bold italic underline>
        hello
      </htext>
    </hp>
  </editor>
) as any;

describe('when trigger is defined', () => {
  it('should autoformat', () => {
    const editor = createPlateEditor({
      editor: input,
      plugins: [
        createAutoformatPlugin({
          options: {
            rules: [
              {
                mode: 'mark',
                type: [MARK_UNDERLINE, MARK_BOLD, MARK_ITALIC],
                match: { start: '_***', end: '***' },
                trigger: '_',
                ignoreTrim: true,
              },
            ],
          },
        }),
      ],
    });

    editor.insertText('_');

    expect(input.children).toEqual(output.children);
  });
});
