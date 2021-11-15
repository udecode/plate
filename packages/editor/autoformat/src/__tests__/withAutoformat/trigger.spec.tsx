/** @jsx jsx */

import { createPlateEditor } from '@udecode/plate-core';
import { jsx } from '@udecode/plate-test-utils';
import { MARK_BOLD } from '../../../../../marks/basic-marks/src/bold/createBoldPlugin';
import { MARK_ITALIC } from '../../../../../marks/basic-marks/src/italic/createItalicPlugin';
import { MARK_UNDERLINE } from '../../../../../marks/basic-marks/src/underline/createUnderlinePlugin';
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
