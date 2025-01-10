/** @jsx jsxt */

import { createSlateEditor } from '@udecode/plate';
import {
  BoldPlugin,
  ItalicPlugin,
  UnderlinePlugin,
} from '@udecode/plate-basic-marks/react';
import { jsxt } from '@udecode/plate-test-utils';
import { autoformatPlugin } from 'www/src/registry/default/components/editor/plugins/autoformat-plugin';

jsxt;

describe('when inserting ***', () => {
  it('should autoformat to italic bold', () => {
    const input = (
      <fragment>
        <hp>
          ***hello
          <cursor />
        </hp>
      </fragment>
    ) as any;

    const output = (
      <fragment>
        <hp>
          <htext bold italic>
            hello
          </htext>
        </hp>
      </fragment>
    ) as any;

    const editor = createSlateEditor({
      plugins: [autoformatPlugin],
      value: input,
    });

    editor.tf.insertText('*');
    editor.tf.insertText('*');
    editor.tf.insertText('*');

    expect(input.children).toEqual(output.children);
  });
});

describe('when inserting ***___', () => {
  it('should autoformat to italic bold', () => {
    const input = (
      <fragment>
        <hp>
          ___***hello
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
        autoformatPlugin.configure({
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

    editor.tf.insertText('*');
    editor.tf.insertText('*');
    editor.tf.insertText('*');
    editor.tf.insertText('_');
    editor.tf.insertText('_');
    editor.tf.insertText('_');

    expect(input.children).toEqual(output.children);
  });
});
