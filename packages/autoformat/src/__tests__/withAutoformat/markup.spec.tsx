/** @jsx jsx */

import {
  MARK_BOLD,
  MARK_ITALIC,
  MARK_UNDERLINE,
} from '@udecode/plate-basic-marks';
import { createPlateEditor } from '@udecode/plate-common/react';
import { jsx } from '@udecode/plate-test-utils';

import { AutoformatPlugin } from '../../AutoformatPlugin';

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
        AutoformatPlugin.configure({
          rules: [
            {
              ignoreTrim: true,
              match: ['_***', '***_'],
              mode: 'mark',
              type: [MARK_UNDERLINE, MARK_BOLD, MARK_ITALIC],
            },
          ],
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
        AutoformatPlugin.configure({
          rules: [
            {
              ignoreTrim: true,
              match: '_***',
              mode: 'mark',
              type: [MARK_UNDERLINE, MARK_BOLD, MARK_ITALIC],
            },
          ],
        }),
      ],
    });

    editor.insertText('_');

    expect(input.children).toEqual(output.children);
  });
});
