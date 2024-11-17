/** @jsx jsxt */

import type { Range } from 'slate';

import {
  BaseCodeBlockPlugin,
  insertEmptyCodeBlock,
} from '@udecode/plate-code-block';
import {
  BaseParagraphPlugin,
  getEditorString,
  getRangeFromBlockStart,
} from '@udecode/plate-common';
import { createSlateEditor } from '@udecode/plate-common';
import { jsxt } from '@udecode/plate-test-utils';
import {
  getAutoformatOptions,
  preFormat,
} from 'www/src/lib/plate/demo/plugins/autoformatOptions';

import { BaseAutoformatPlugin } from '../../../BaseAutoformatPlugin';

jsxt;

describe('when ``` at block start', () => {
  it('should insert a code block below', () => {
    const input = (
      <fragment>
        <hp>
          ``
          <cursor />
          hello
        </hp>
      </fragment>
    ) as any;

    const output = (
      <fragment>
        <hp>hello</hp>
        <hcodeblock>
          <hcodeline>new</hcodeline>
        </hcodeblock>
      </fragment>
    ) as any;

    const editor = createSlateEditor({
      plugins: [
        BaseAutoformatPlugin.configure({ options: getAutoformatOptions() }),
      ],
      value: input,
    });

    editor.insertText('`');
    editor.insertText('new');

    expect(input.children).toEqual(output.children);
  });
});

describe('when ``` at block start, but customising with query we get the most recent character typed', () => {
  it('should insert a code block below', () => {
    const input = (
      <fragment>
        <hp>
          ``
          <cursor />
          hello
        </hp>
      </fragment>
    ) as any;

    const output = (
      <fragment>
        <hp>hello</hp>
        <hcodeblock>
          <hcodeline>inside code-block</hcodeline>
        </hcodeblock>
      </fragment>
    ) as any;

    const codeEditor = createSlateEditor({
      plugins: [
        BaseAutoformatPlugin.configure({
          options: {
            rules: [
              {
                format: (editor) => {
                  insertEmptyCodeBlock(editor, {
                    defaultType: editor.getType(BaseParagraphPlugin),
                    insertNodesOptions: { select: true },
                  });
                },
                match: '```',
                mode: 'block',
                preFormat: preFormat as any,
                query: (editor, rule): boolean => {
                  if (!editor.selection) {
                    return false;
                  }

                  const matchRange = getRangeFromBlockStart(editor) as Range;
                  const textFromBlockStart = getEditorString(
                    editor,
                    matchRange
                  );
                  const currentNodeText =
                    (textFromBlockStart || '') + rule.text;

                  return rule.match === currentNodeText;
                },
                triggerAtBlockStart: false,
                type: BaseCodeBlockPlugin.key,
              },
            ],
          },
        }),
      ],
      value: input,
    });

    codeEditor.insertText('`');
    codeEditor.insertText('inside code-block');

    expect(input.children).toEqual(output.children);
  });
});

describe('when ```', () => {
  it('should insert a code block below', () => {
    const input = (
      <fragment>
        <hp>
          hello``
          <cursor />
          world
        </hp>
      </fragment>
    ) as any;

    const output = (
      <fragment>
        <hp>helloworld</hp>
        <hcodeblock>
          <hcodeline>new</hcodeline>
        </hcodeblock>
      </fragment>
    ) as any;

    const editor = createSlateEditor({
      plugins: [
        BaseAutoformatPlugin.configure({ options: getAutoformatOptions() }),
      ],
      value: input,
    });

    editor.insertText('`');
    editor.insertText('new');

    expect(input.children).toEqual(output.children);
  });
});
