/** @jsx jsxt */

import { BaseParagraphPlugin } from '@udecode/plate';
import { createSlateEditor } from '@udecode/plate';
import {
  BaseCodeBlockPlugin,
  insertEmptyCodeBlock,
} from '@udecode/plate-code-block';
import { jsxt } from '@udecode/plate-test-utils';
import { autoformatPlugin } from 'www/src/registry/default/components/editor/plugins/autoformat-plugin';

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
      plugins: [autoformatPlugin],
      value: input,
    });

    editor.tf.insertText('`');
    editor.tf.insertText('new');

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
        autoformatPlugin.configure({
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
                // preFormat: preFormat as any,
                query: (editor, rule): boolean => {
                  if (!editor.selection) {
                    return false;
                  }

                  const matchRange = editor.api.range(
                    'start',
                    editor.selection
                  );
                  const textFromBlockStart = editor.api.string(matchRange);
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

    codeEditor.tf.insertText('`');
    codeEditor.tf.insertText('inside code-block');

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
      plugins: [autoformatPlugin],
      value: input,
    });

    editor.tf.insertText('`');
    editor.tf.insertText('new');

    expect(input.children).toEqual(output.children);
  });
});
