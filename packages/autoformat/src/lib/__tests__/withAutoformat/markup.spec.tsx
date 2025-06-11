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

describe('when match is an array', () => {
  it('should autoformat', () => {
    const input = (
      <fragment>
        <hp>
          _***hello***
          <cursor />
        </hp>
      </fragment>
    ) as any;

    const output = (
      <fragment>
        <hp>
          <htext bold italic underline>
            hello
          </htext>
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
                match: ['_***', '***_'],
                mode: 'mark',
                type: [UnderlinePlugin.key, BoldPlugin.key, ItalicPlugin.key],
              },
            ],
          },
        }),
      ],
      value: input,
    });

    editor.tf.insertText('_');

    expect(input.children).toEqual(output.children);
  });
});

describe('when match is a string', () => {
  it('should autoformat', () => {
    const input = (
      <fragment>
        <hp>
          _***hello***
          <cursor />
        </hp>
      </fragment>
    ) as any;

    const output = (
      <fragment>
        <hp>
          <htext bold italic underline>
            hello
          </htext>
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
                match: '_***',
                mode: 'mark',
                type: [UnderlinePlugin.key, BoldPlugin.key, ItalicPlugin.key],
              },
            ],
          },
        }),
      ],
      value: input,
    });

    editor.tf.insertText('_');

    expect(input.children).toEqual(output.children);
  });
});
