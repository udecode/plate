/** @jsx jsx */

import {
  BoldPlugin,
  ItalicPlugin,
  UnderlinePlugin,
} from '@udecode/plate-basic-marks';
import { createSlateEditor } from '@udecode/plate-common';
import { jsx } from '@udecode/plate-test-utils';

import { BaseAutoformatPlugin } from '../../BaseAutoformatPlugin';

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

    const editor = createSlateEditor({
      plugins: [
        BaseAutoformatPlugin.configure({
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

      const editor = createSlateEditor({
        plugins: [
          BaseAutoformatPlugin.configure({
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
