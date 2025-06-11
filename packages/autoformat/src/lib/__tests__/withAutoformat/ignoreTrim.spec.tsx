/** @jsx jsxt */

import { createSlateEditor } from 'platejs';
import {
  BoldPlugin,
  ItalicPlugin,
  UnderlinePlugin,
} from '@platejs/basic-nodes/react';
import { jsxt } from '@platejs/test-utils';

import { AutoformatPlugin } from '../../AutoformatPlugin';

jsxt;

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

    editor.tf.insertText('*');

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

      editor.tf.insertText(' ');

      expect(input.children).toEqual(output.children);
    });
  });
});
