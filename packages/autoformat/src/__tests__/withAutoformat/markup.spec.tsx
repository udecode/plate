/** @jsx jsx */

import { createAutoformatPlugin } from '@/packages/autoformat/src/createAutoformatPlugin';
import { MARK_BOLD } from '@/packages/basic-marks/src/createBoldPlugin';
import { MARK_ITALIC } from '@/packages/basic-marks/src/createItalicPlugin';
import { MARK_UNDERLINE } from '@/packages/basic-marks/src/createUnderlinePlugin';
import { createPlateEditor } from '@udecode/plate-common';
import { jsx } from '@udecode/plate-test-utils';

jsx;

describe('when match is an array', () => {
  it('should autoformat', () => {
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

    const editor = createPlateEditor({
      editor: input,
      plugins: [
        createAutoformatPlugin({
          options: {
            rules: [
              {
                mode: 'mark',
                type: [MARK_UNDERLINE, MARK_BOLD, MARK_ITALIC],
                match: ['_***', '***_'],
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

describe('when match is a string', () => {
  it('should autoformat', () => {
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

    const editor = createPlateEditor({
      editor: input,
      plugins: [
        createAutoformatPlugin({
          options: {
            rules: [
              {
                mode: 'mark',
                type: [MARK_UNDERLINE, MARK_BOLD, MARK_ITALIC],
                match: '_***',
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
