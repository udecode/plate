/** @jsx jsxt */

import { jsxt } from '@platejs/test-utils';
import { BaseParagraphPlugin, createBasePlateEditor } from 'platejs';

import { getCurrentRuntimeTransforms } from '../../../core/src/internal/currentRuntimeBridge';
import { InputRulesPlugin } from '../../../core/src/lib/plugins/input-rules/internal/InputRulesPlugin';
import { createPlateRuntimeEditor } from '../../../core/src/react/editor/createPlateRuntimeEditor';
import { BaseCodeBlockPlugin } from './BaseCodeBlockPlugin';
import { CodeBlockRules } from './CodeBlockRules';

jsxt;

describe('BaseCodeBlockPlugin input rules', () => {
  it('promotes triple backticks when the markdown group is enabled', () => {
    const input = (
      <fragment>
        <hp>
          ``
          <cursor />
        </hp>
      </fragment>
    ) as any;

    const editor = createBasePlateEditor({
      plugins: [
        BaseCodeBlockPlugin.configure({
          inputRules: [CodeBlockRules.markdown({ on: 'match' })],
        }),
      ],
      value: input,
    } as any);

    editor.update((tx) => {
      tx.text.insert('`');
    });
    editor.update((tx) => {
      tx.text.insert('code');
    });

    expect(input.children).toEqual(
      (
        <fragment>
          <hcodeblock>
            <hcodeline>code</hcodeline>
          </hcodeblock>
        </fragment>
      ).children
    );
  });

  it('replaces the fence paragraph instead of leaving the first two backticks behind', () => {
    const editor = createBasePlateEditor({
      plugins: [
        BaseCodeBlockPlugin.configure({
          inputRules: [CodeBlockRules.markdown({ on: 'match' })],
        }),
      ],
      selection: {
        anchor: { offset: 2, path: [0, 0] },
        focus: { offset: 2, path: [0, 0] },
      },
      value: [{ children: [{ text: '``' }], type: 'p' }],
    } as any);

    editor.update((tx) => {
      tx.text.insert('`');
    });

    expect(editor.read((state) => state.value.root())).toMatchObject([
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
    const editor = createPlateRuntimeEditor({
      initialSelection: {
        anchor: { offset: 3, path: [0, 0] },
        focus: { offset: 3, path: [0, 0] },
      },
      initialValue: [{ children: [{ text: '```' }], type: 'p' }],
      plugins: [
        InputRulesPlugin,
        BaseParagraphPlugin,
        BaseCodeBlockPlugin.configure({
          inputRules: [CodeBlockRules.markdown({ on: 'break' })],
        }),
      ],
    } as any);

    getCurrentRuntimeTransforms(editor).insertBreak();

    expect(editor.read((state) => state.value.root())).toMatchObject([
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
