/** @jsx jsxt */

import { createSlateEditor } from 'platejs';
import { BaseCodeBlockPlugin, insertEmptyCodeBlock } from '@platejs/code-block';
import { jsxt } from '@platejs/test-utils';
import { AutoformatKit } from 'www/src/registry/components/editor/plugins/autoformat-kit';
import { KEYS } from 'platejs';

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
      plugins: AutoformatKit,
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
        AutoformatKit[0].configure({
          options: {
            rules: [
              {
                format: (editor) => {
                  insertEmptyCodeBlock(editor, {
                    defaultType: editor.getType(KEYS.p),
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
      plugins: AutoformatKit,
      value: input,
    });

    editor.tf.insertText('`');
    editor.tf.insertText('new');

    expect(input.children).toEqual(output.children);
  });
});
