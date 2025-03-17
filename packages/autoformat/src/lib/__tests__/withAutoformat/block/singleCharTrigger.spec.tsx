/** @jsx jsxt */

import { createSlatePlugin } from '@udecode/plate';
import { createSlateEditor } from '@udecode/plate';
import { LinkPlugin } from '@udecode/plate-link/react';
import { jsxt } from '@udecode/plate-test-utils';
import type { AutoformatConfig } from '../../../BaseAutoformatPlugin';

jsxt;

const input = (
  <fragment>
    <hp>
      [Example site](https://example.com
      <cursor />
    </hp>
  </fragment>
) as any;

const output = (
  <fragment>
    <hp>
      <ha url="https://example.com">Example site</ha>
    </hp>
  </fragment>
) as any;

it('autoformats a block with a single character trigger', () => {
  const linkEditor = createSlateEditor({
    plugins: [
      createSlatePlugin<string, AutoformatConfig['options']>({
        options: {
          rules: [
            {
              format: (editor) => {
                const linkInputRange = editor.selection!.focus.path;
                const linkInputText = editor.api.string(linkInputRange);
                const [, text, url] = /\[(.+)]\((.*)/.exec(linkInputText)!;
                editor.tf.insertText(text, { at: linkInputRange });
                editor.tf.wrapNodes(
                  { children: [], type: LinkPlugin.key, url },
                  { at: linkInputRange }
                );
              },
              match: ')',
              mode: 'block',
              triggerAtBlockStart: false,
              type: LinkPlugin.key,
            },
          ],
        },
      }),
    ],
    value: input,
  });

  linkEditor.tf.insertText(')');

  expect(input.children).toEqual(output.children);
});
