/** @jsx jsx */

import {
  createPlugin,
  getEditorString,
  insertText,
  wrapNodes,
} from '@udecode/plate-common';
import { createPlateEditor } from "@udecode/plate-common/react";
import { LinkPlugin } from '@udecode/plate-link';
import { jsx } from '@udecode/plate-test-utils';
import { withReact } from 'slate-react';

import type { AutoformatPluginOptions } from '../../../types';

import { withAutoformat } from '../../../withAutoformat';

jsx;

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
  const linkEditor = createPlateEditor({ value: input,
    plugins: [createPlugin<string, AutoformatPluginOptions>({
      options: {
        rules: [
          {
            format: (editor) => {
              const linkInputRange = editor.selection!.focus.path;
              const linkInputText = getEditorString(editor, linkInputRange);
              const [, text, url] = /\[(.+)]\((.*)/.exec(linkInputText)!;
              insertText(editor, text, { at: linkInputRange });
              wrapNodes(
                editor,
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
    }),]
  });

  linkEditor.insertText(')');

  expect(input.children).toEqual(output.children);
});
