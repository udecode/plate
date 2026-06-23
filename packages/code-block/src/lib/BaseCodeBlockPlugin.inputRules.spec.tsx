/** @jsx jsxt */

import { jsxt } from '@platejs/test-utils';
import { createSlateEditor } from 'platejs';

import { getCurrentRuntimeTransforms } from '../../../core/src/internal/currentRuntimeBridge';
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

    const editor = createSlateEditor({
      plugins: [
        BaseCodeBlockPlugin.configure({
          inputRules: [CodeBlockRules.markdown({ on: 'match' })],
        }),
      ],
      value: input,
    } as any);

    getCurrentRuntimeTransforms(editor).insertText('`');
    getCurrentRuntimeTransforms(editor).insertText('code');

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
    const editor = createSlateEditor({
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

    getCurrentRuntimeTransforms(editor).insertText('`');

    expect(editor.children).toMatchObject([
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
      <fragment>
        <hp>
          ```
          <cursor />
        </hp>
      </fragment>
    ) as any;

    const editor = createSlateEditor({
      plugins: [
        BaseCodeBlockPlugin.configure({
          inputRules: [CodeBlockRules.markdown({ on: 'break' })],
        }),
      ],
      value: input,
    } as any);

    getCurrentRuntimeTransforms(editor).select({
      anchor: { offset: 3, path: [0, 0] },
      focus: { offset: 3, path: [0, 0] },
    });
    getCurrentRuntimeTransforms(editor).insertBreak();

    expect(editor.children).toMatchObject([
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
