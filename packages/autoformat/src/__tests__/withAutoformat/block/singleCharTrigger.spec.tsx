/** @jsx jsx */

import { AutoformatPlugin } from '@/packages/autoformat/src/types';
import { withAutoformat } from '@/packages/autoformat/src/withAutoformat';
import {
  getEditorString,
  insertText,
  mockPlugin,
  wrapNodes,
} from '@udecode/plate-common';
import { ELEMENT_LINK } from '@udecode/plate-link';
import { jsx } from '@udecode/plate-test-utils';
import { withReact } from 'slate-react';

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
    mockPlugin<AutoformatPlugin>({
      options: {
        rules: [
          {
            mode: 'block',
            type: ELEMENT_LINK,
            match: ')',
            triggerAtBlockStart: false,
            format: (editor) => {
              const linkInputRange = editor.selection!.focus.path;
              const linkInputText = getEditorString(editor, linkInputRange);
              const [, text, url] = /\[(.+)]\((.*)/.exec(linkInputText)!;
              insertText(editor, text, { at: linkInputRange });
              wrapNodes(
                editor,
                { type: ELEMENT_LINK, url, children: [] },
                { at: linkInputRange }
              );
            },
          },
        ],
      },
    })
  );

  linkEditor.insertText(')');

  expect(input.children).toEqual(output.children);
});
