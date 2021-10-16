/** @jsx jsx */

import {
  ELEMENT_CODE_BLOCK,
  insertEmptyCodeBlock,
} from '@udecode/plate-code-block';
import {
  ELEMENT_DEFAULT,
  getRangeFromBlockStart,
  getText,
} from '@udecode/plate-common';
import { getPlatePluginType, SPEditor } from '@udecode/plate-core';
import { jsx } from '@udecode/plate-test-utils';
import { Range } from 'slate';
import { withReact } from 'slate-react';
import { clearBlockFormat } from '../../../../../../docs/src/live/config/autoformat/autoformatUtils';
import { CONFIG } from '../../../../../../docs/src/live/config/config';
import { withAutoformat } from '../../../createAutoformatPlugin';

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

    const editor = withAutoformat(CONFIG.autoformat)(withReact(input));

    editor.insertText('`');
    editor.insertText('new');

    expect(input.children).toEqual(output.children);
  });
});

describe('when ``` at block start, but customising with query we get the most recent character typed', () => {
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
          <hcodeline>inside code-block</hcodeline>
        </hcodeblock>
      </editor>
    ) as any;

    const codeEditor = withAutoformat({
      rules: [
        {
          mode: 'block',
          type: ELEMENT_CODE_BLOCK,
          match: '```',
          triggerAtBlockStart: false,
          preFormat: clearBlockFormat,
          format: (editor) => {
            insertEmptyCodeBlock(editor as SPEditor, {
              defaultType: getPlatePluginType(
                editor as SPEditor,
                ELEMENT_DEFAULT
              ),
              insertNodesOptions: { select: true },
            });
          },
          query: (editor, rule): boolean => {
            if (!editor.selection) {
              return false;
            }

            const matchRange = getRangeFromBlockStart(editor) as Range;
            const textFromBlockStart = getText(editor, matchRange);
            const currentNodeText = (textFromBlockStart || '') + rule.text;

            return rule.match === currentNodeText;
          },
        },
      ],
    })(withReact(input));

    codeEditor.insertText('`');
    codeEditor.insertText('inside code-block');

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

    const editor = withAutoformat(CONFIG.autoformat)(withReact(input));

    editor.insertText('`');
    editor.insertText('new');

    expect(input.children).toEqual(output.children);
  });
});
