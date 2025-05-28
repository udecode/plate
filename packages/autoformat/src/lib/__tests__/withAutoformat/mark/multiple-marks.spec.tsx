/** @jsx jsxt */

import { createSlateEditor } from '@udecode/plate';
import {
  BoldPlugin,
  ItalicPlugin,
  UnderlinePlugin,
} from '@udecode/plate-basic-nodes/react';
import { jsxt } from '@udecode/plate-test-utils';
import { AutoformatKit } from 'www/src/registry/components/editor/plugins/autoformat-kit';

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
      plugins: AutoformatKit,
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
        AutoformatKit[0].configure({
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
