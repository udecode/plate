/** @jsx jsx */

import type { Range } from 'slate';

import {
  CodeBlockPlugin,
  insertEmptyCodeBlock,
} from '@udecode/plate-code-block';
import {
  ParagraphPlugin,
  getEditorString,
  getRangeFromBlockStart,
} from '@udecode/plate-common';
import { createPlateEditor } from '@udecode/plate-common/react';
import { jsx } from '@udecode/plate-test-utils';
import {
  getAutoformatOptions,
  preFormat,
} from 'www/src/lib/plate/demo/plugins/autoformatOptions';

import { AutoformatPlugin } from '../../../AutoformatPlugin';

jsx;

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

    const editor = createPlateEditor({
      plugins: [
        AutoformatPlugin.configure({ options: getAutoformatOptions() }),
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

    const codeEditor = createPlateEditor({
      plugins: [
        AutoformatPlugin.configure({
          options: {
            rules: [
              {
                format: (editor) => {
                  insertEmptyCodeBlock(editor, {
                    defaultType: editor.getType(ParagraphPlugin),
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
                type: CodeBlockPlugin.key,
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

    const editor = createPlateEditor({
      plugins: [
        AutoformatPlugin.configure({ options: getAutoformatOptions() }),
      ],
      value: input,
    });

    editor.insertText('`');
    editor.insertText('new');

    expect(input.children).toEqual(output.children);
  });
});
