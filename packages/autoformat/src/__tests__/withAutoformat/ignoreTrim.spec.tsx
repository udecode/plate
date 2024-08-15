/** @jsx jsx */

import {
  BoldPlugin,
  ItalicPlugin,
  UnderlinePlugin,
} from '@udecode/plate-basic-marks';
import { createPlateEditor } from '@udecode/plate-common/react';
import { jsx } from '@udecode/plate-test-utils';

import { AutoformatPlugin } from '../../AutoformatPlugin';

jsx;

describe('when ignoreTrim is true', () => {
  it('should autoformat', () => {
    const input = (
      <fragment>
        <hp>
          * hello
          <cursor />
        </hp>
      </fragment>
    ) as any;

    const output = (
      <fragment>
        <hp>
          <htext italic> hello</htext>
        </hp>
      </fragment>
    ) as any;

    const editor = createPlateEditor({
      plugins: [
        AutoformatPlugin.configure({
          options: {
            rules: [
              {
                ignoreTrim: true,
                match: '*',
                mode: 'mark',
                type: ItalicPlugin.key,
              },
            ],
          },
        }),
      ],
      value: input,
    });

    editor.insertText('*');

    expect(input.children).toEqual(output.children);
  });
});

describe('when ignoreTrim is false', () => {
  describe('when the match text is not trimmed', () => {
    it('should run default', () => {
      const input = (
        <fragment>
          <hp>
            **hello **
            <cursor />
          </hp>
        </fragment>
      ) as any;

      const output = (
        <fragment>
          <hp>**hello ** </hp>
        </fragment>
      ) as any;

      const editor = createPlateEditor({
        plugins: [
          AutoformatPlugin.configure({
            options: {
              rules: [
                {
                  match: { end: '***__', start: '___***' },
                  mode: 'mark',
                  trigger: '_',
                  type: [UnderlinePlugin.key, BoldPlugin.key, ItalicPlugin.key],
                },
              ],
            },
          }),
        ],
        value: input,
      });

      editor.insertText(' ');

      expect(input.children).toEqual(output.children);
    });
  });
});
