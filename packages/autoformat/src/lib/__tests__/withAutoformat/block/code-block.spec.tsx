/** @jsx jsxt */

import type { SlateEditor } from 'platejs';
import { KEYS } from 'platejs';
import { BaseCodeBlockPlugin, insertEmptyCodeBlock } from '@platejs/code-block';
import { jsxt } from '@platejs/test-utils';

import type { AutoformatQueryOptions } from '../../../types';

import { createAutoformatEditor } from '../createAutoformatEditor';

jsxt;

const createCodeBlockAutoformatEditor = ({
  rules,
  value,
}: {
  rules?: any[];
  value: any;
}) =>
  createAutoformatEditor({
    plugins: [BaseCodeBlockPlugin],
    rules: rules ?? [
      {
        format: (editor: SlateEditor) => {
          insertEmptyCodeBlock(editor, {
            defaultType: KEYS.p,
            insertNodesOptions: { select: true },
          });
        },
        match: '```',
        mode: 'block',
        type: KEYS.codeBlock,
      },
    ],
    value,
  });

describe('AutoformatPlugin code block rules', () => {
  it.each([
    {
      expected: (
        <fragment>
          <hp>hello</hp>
          <hcodeblock>
            <hcodeline>new</hcodeline>
          </hcodeblock>
        </fragment>
      ) as any,
      input: (
        <fragment>
          <hp>
            ``
            <cursor />
            hello
          </hp>
        </fragment>
      ) as any,
      title: 'inserts a code block from the start of a block',
    },
    {
      expected: (
        <fragment>
          <hp>helloworld</hp>
          <hcodeblock>
            <hcodeline>new</hcodeline>
          </hcodeblock>
        </fragment>
      ) as any,
      input: (
        <fragment>
          <hp>
            hello``
            <cursor />
            world
          </hp>
        </fragment>
      ) as any,
      title: 'inserts a code block when the trigger appears mid-paragraph',
    },
  ])('$title', ({ expected, input }) => {
    const editor = createCodeBlockAutoformatEditor({ value: input });

    editor.tf.insertText('`');
    editor.tf.insertText('new');

    expect(input.children).toEqual(expected.children);
  });

  it('uses the current insert text inside a custom query', () => {
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

    const editor = createCodeBlockAutoformatEditor({
      rules: [
        {
          format: (codeEditor: SlateEditor) => {
            insertEmptyCodeBlock(codeEditor, {
              defaultType: KEYS.p,
              insertNodesOptions: { select: true },
            });
          },
          match: '```',
          mode: 'block',
          query: (
            codeEditor: SlateEditor,
            rule: AutoformatQueryOptions
          ): boolean => {
            if (!codeEditor.selection) return false;

            const matchRange = codeEditor.api.range(
              'start',
              codeEditor.selection
            );
            const textFromBlockStart = codeEditor.api.string(matchRange);
            const currentNodeText = (textFromBlockStart || '') + rule.text;

            return rule.match === currentNodeText;
          },
          triggerAtBlockStart: false,
          type: KEYS.codeBlock,
        },
      ],
      value: input,
    });

    editor.tf.insertText('`');
    editor.tf.insertText('inside code-block');

    expect(input.children).toEqual(output.children);
  });
});
