/** @jsx jsxt */

import {
  BaseParagraphPlugin,
  createBaseEditor,
  createBasePlugin,
} from '@platejs/core';
import { jsxt, type TestEditor } from '@platejs/test-utils';
import { KEYS } from '@platejs/utils';

import { BaseEquationPlugin } from './BaseEquationPlugin';
import { BaseInlineEquationPlugin } from './BaseInlineEquationPlugin';
import { MathRules } from './MathRules';

jsxt;

const CodeBlockPlugin = createBasePlugin({
  key: KEYS.codeBlock,
  node: { isElement: true },
});

describe('math input rules', () => {
  const createEditor = (
    value: TestEditor,
    {
      blockMathRule = MathRules.markdown({ on: 'break', variant: '$$' }),
      inlineMathRule = MathRules.markdown({ variant: '$' }),
      withCodeBlock = false,
    }: {
      blockMathRule?: ReturnType<typeof MathRules.markdown>;
      inlineMathRule?: ReturnType<typeof MathRules.markdown>;
      withCodeBlock?: boolean;
    } = {}
  ) =>
    createBaseEditor({
      plugins: [
        BaseParagraphPlugin,
        BaseInlineEquationPlugin.configure({
          inputRules: [inlineMathRule],
        }),
        BaseEquationPlugin.configure({
          inputRules: [blockMathRule],
        }),
        ...(withCodeBlock ? [CodeBlockPlugin] : []),
      ],
      selection: value.selection,
      value: value.children,
    });

  it('converts a completed $...$ sequence into an inline equation on the closing delimiter', () => {
    const input = (
      <editor>
        <hp>
          Math: $x
          <cursor />
        </hp>
      </editor>
    ) as TestEditor;

    const editor = createEditor(input);

    editor.update((tx) => tx.text.insert('$'));

    expect(editor.read.value().children).toEqual([
      {
        children: [
          { text: 'Math: ' },
          {
            children: [{ text: '' }],
            texExpression: 'x',
            type: KEYS.inlineEquation,
          },
          { text: '' },
        ],
        type: KEYS.p,
      },
    ]);
  });

  it('promotes a $$ paragraph into a block equation on Enter', () => {
    const input = (
      <editor>
        <hp>
          $$
          <cursor />
        </hp>
      </editor>
    ) as TestEditor;

    const editor = createEditor(input);
    const end = editor.read.points.end([0]);

    if (!end) throw new Error('Expected paragraph end');

    editor.update((tx) => {
      tx.selection.set(end);
      tx.break.insert();
    });

    expect(editor.read.value().children).toMatchObject([
      {
        texExpression: '',
        type: KEYS.equation,
      },
    ]);
  });

  it('promotes a $$ prefix into a block equation on the matching delimiter when configured with on: match', () => {
    const input = (
      <editor>
        <hp>
          $
          <cursor />
        </hp>
      </editor>
    ) as TestEditor;

    const editor = createEditor(input, {
      blockMathRule: MathRules.markdown({ on: 'match', variant: '$$' }),
    });

    editor.update((tx) => {
      tx.selection.set({
        anchor: { offset: 1, path: [0, 0] },
        focus: { offset: 1, path: [0, 0] },
      });
      tx.text.insert('$');
    });

    expect(editor.read.value().children).toMatchObject([
      {
        texExpression: '',
        type: KEYS.equation,
      },
    ]);
  });

  it('keeps $...$ literal inside code blocks', () => {
    const input = (
      <editor>
        <hcodeblock>
          <hcodeline>
            $x
            <cursor />
          </hcodeline>
        </hcodeblock>
      </editor>
    ) as TestEditor;

    const editor = createEditor(input, { withCodeBlock: true });

    editor.update((tx) => tx.text.insert('$'));

    expect(editor.read.value().children).toEqual(
      (
        <editor>
          <hcodeblock>
            <hcodeline>$x$</hcodeline>
          </hcodeblock>
        </editor>
      ).children
    );
  });

  it('converts inline math when an unrelated code block exists', () => {
    const input = (
      <editor>
        <hcodeblock>
          <hcodeline>const value = 1;</hcodeline>
        </hcodeblock>
        <hp>
          Math: $x
          <cursor />
        </hp>
      </editor>
    ) as TestEditor;

    const editor = createEditor(input, { withCodeBlock: true });

    editor.update((tx) => tx.text.insert('$'));

    expect(editor.read.value().children[1]).toEqual({
      children: [
        { text: 'Math: ' },
        {
          children: [{ text: '' }],
          texExpression: 'x',
          type: KEYS.inlineEquation,
        },
        { text: '' },
      ],
      type: KEYS.p,
    });
  });

  it('respects app-level enabled overrides for inline math', () => {
    const input = (
      <editor>
        <hp>
          Math: $x
          <cursor />
        </hp>
      </editor>
    ) as TestEditor;

    const editor = createEditor(input, {
      inlineMathRule: MathRules.markdown({
        enabled: () => false,
        variant: '$',
      }),
    });

    editor.update((tx) => tx.text.insert('$'));

    expect(editor.read.value().children).toEqual(
      (
        <editor>
          <hp>Math: $x$</hp>
        </editor>
      ).children
    );
  });
});
