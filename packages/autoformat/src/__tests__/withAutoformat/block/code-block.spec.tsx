/** @jsx jsx */

import { jsx } from '@udecode/plate-test-utils';
import { withReact } from 'slate-react';
import { optionsAutoformat } from '../../../../../../docs/src/live/config/pluginOptions';
import { withAutoformat } from '../../../createAutoformatPlugin';
import { ELEMENT_CODE_BLOCK, insertEmptyCodeBlock } from '@udecode/plate-code-block';
import { preFormat } from '../../../../../../docs/src/live/config/autoformat/autoformatUtils';
import { getPlatePluginType, SPEditor } from '@udecode/plate-core';
import { ELEMENT_DEFAULT, getRangeFromBlockStart, getText } from '@udecode/plate-common';
import { Editor, Node, Range } from 'slate';

jsx;

describe('when ``` at block start', () => {
  it('should insert a code block below', () => {
    const input = (
      <editor>
        <hp>
          ``
          <cursor />
          hello
        </hp>
      </editor>
    ) as any;

    const output = (
      <editor>
        <hp>hello</hp>
        <hcodeblock>
          <hcodeline>new</hcodeline>
        </hcodeblock>
      </editor>
    ) as any;

    const editor = withAutoformat(optionsAutoformat)(withReact(input));

    editor.insertText('`');
    editor.insertText('new');

    expect(input.children).toEqual(output.children);
  });
});

describe('when ``` at block start, but customising with query we get the most recent character typed', () => {
  it.only('should insert a code block below', () => {
    const input = (
      <editor>
        <hp>
          ``
          <cursor />
          hello
        </hp>
      </editor>
    ) as any;

    const output = (
      <editor>
        <hp>hello</hp>
        <hcodeblock>
          <hcodeline>inside code-block</hcodeline>
        </hcodeblock>
      </editor>
    ) as any;

    const editor = withAutoformat({
      rules: [{
          mode: 'block',
          type: ELEMENT_CODE_BLOCK,
          match: '```',
          triggerAtBlockStart: false,
          preFormat,
          format: (editor) => {
            insertEmptyCodeBlock(editor as SPEditor, {
              defaultType: getPlatePluginType(editor as SPEditor, ELEMENT_DEFAULT),
              insertNodesOptions: { select: true },
            });
          },
          query: (editor, rule, text): boolean => {
            if (!editor.selection) {
              return false;
            }

            const matchRange = getRangeFromBlockStart(editor) as Range;
            const textFromBlockStart = getText(editor, matchRange);
            const currentNodeText = (textFromBlockStart || '') + text;

            return rule.match === currentNodeText;
          },
      }],
    })
    (withReact(input));

    editor.insertText('`');
    editor.insertText('inside code-block');

    expect(input.children).toEqual(output.children);
  });
});

describe('when ```', () => {
  it('should insert a code block below', () => {
    const input = (
      <editor>
        <hp>
          hello``
          <cursor />
          world
        </hp>
      </editor>
    ) as any;

    const output = (
      <editor>
        <hp>helloworld</hp>
        <hcodeblock>
          <hcodeline>new</hcodeline>
        </hcodeblock>
      </editor>
    ) as any;

    const editor = withAutoformat(optionsAutoformat)(withReact(input));

    editor.insertText('`');
    editor.insertText('new');

    expect(input.children).toEqual(output.children);
  });
});
