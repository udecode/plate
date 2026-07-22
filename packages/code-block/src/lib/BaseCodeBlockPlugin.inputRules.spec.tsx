/** @jsx jsxt */

import { createBaseEditor } from '@platejs/core';
import { jsxt, type TestEditor } from '@platejs/test-utils';

import { BaseCodeBlockPlugin } from './BaseCodeBlockPlugin';
import { CodeBlockRules } from './CodeBlockRules';

jsxt;

describe('BaseCodeBlockPlugin input rules', () => {
  it('promotes triple backticks when the markdown group is enabled', () => {
    const input = (
      <editor>
        <hp>
          ``
          <cursor />
        </hp>
      </editor>
    ) as TestEditor;

    const editor = createBaseEditor({
      plugins: [
        BaseCodeBlockPlugin.configure({
          inputRules: [CodeBlockRules.markdown({ on: 'match' })],
        }),
      ],
      selection: input.selection,
      initialValue: input.children,
    });

    editor.update.text.insert('`');
    editor.update.text.insert('code');

    expect(editor.read.children()).toEqual(
      (
        <editor>
          <hcodeblock>
            <hcodeline>code</hcodeline>
          </hcodeblock>
        </editor>
      ).children
    );
  });

  it('replaces the fence paragraph instead of leaving the first two backticks behind', () => {
    const editor = createBaseEditor({
      plugins: [
        BaseCodeBlockPlugin.configure({
          inputRules: [CodeBlockRules.markdown({ on: 'match' })],
        }),
      ],
      selection: {
        kind: 'text',
        anchor: { offset: 2, path: [0, 0] },
        focus: { offset: 2, path: [0, 0] },
      },
      initialValue: [{ children: [{ text: '``' }], type: 'p' }],
    });

    editor.update.text.insert('`');

    expect(editor.read.children()).toMatchObject([
      {
        children: [
          {
            children: [{ text: '' }],
            type: 'code_line',
          },
        ],
        type: 'code_block',
      },
    ]);
  });

  it('promotes a ``` paragraph on Enter when configured with on: break', () => {
    const input = (
      <editor>
        <hp>
          ```
          <cursor />
        </hp>
      </editor>
    ) as TestEditor;

    const editor = createBaseEditor({
      plugins: [
        BaseCodeBlockPlugin.configure({
          inputRules: [CodeBlockRules.markdown({ on: 'break' })],
        }),
      ],
      selection: input.selection,
      initialValue: input.children,
    });

    editor.update.selection.set({
      kind: 'text',
      anchor: { offset: 3, path: [0, 0] },
      focus: { offset: 3, path: [0, 0] },
    });
    editor.update.break.insert();

    expect(editor.read.children()).toMatchObject([
      {
        children: [
          {
            children: [{ text: '' }],
            type: 'code_line',
          },
        ],
        type: 'code_block',
      },
    ]);
  });
});
