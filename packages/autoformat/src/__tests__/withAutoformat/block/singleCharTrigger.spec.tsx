/** @jsx jsx */

import {
  createPlugin,
  getEditorString,
  insertText,
  wrapNodes,
} from '@udecode/plate-common';
import { ELEMENT_LINK } from '@udecode/plate-link';
import { jsx } from '@udecode/plate-test-utils';
import { withReact } from 'slate-react';

import type { AutoformatPluginOptions } from '../../../types';

import { withAutoformat } from '../../../withAutoformat';

jsx;

const input = (
  <editor>
    <hp>
      [Example site](https://example.com
      <cursor />
    </hp>
  </editor>
) as any;

const output = (
  <editor>
    <hp>
      <ha url="https://example.com">Example site</ha>
    </hp>
  </editor>
) as any;

it('autoformats a block with a single character trigger', () => {
  const linkEditor = withAutoformat(
    withReact(input),
    createPlugin<'autoformat', AutoformatPluginOptions>({
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
                { children: [], type: ELEMENT_LINK, url },
                { at: linkInputRange }
              );
            },
            match: ')',
            mode: 'block',
            triggerAtBlockStart: false,
            type: ELEMENT_LINK,
          },
        ],
      },
    })
  );

  linkEditor.insertText(')');

  expect(input.children).toEqual(output.children);
});
