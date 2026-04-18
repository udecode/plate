/** @jsx jsxt */

import { BaseParagraphPlugin, KEYS, createSlatePlugin } from 'platejs';
import { jsxt } from '@platejs/test-utils';
import { createSlateEditor } from 'platejs';

import { BaseEquationPlugin } from './BaseEquationPlugin';
import { BaseInlineEquationPlugin } from './BaseInlineEquationPlugin';
import { MathRules } from './MathRules';

jsxt;

const CodeBlockPlugin = createSlatePlugin({
  key: KEYS.codeBlock,
  node: { isElement: true },
});

describe('math input rules', () => {
  const createEditor = (
    value: any,
    {
      blockMathRule = MathRules.markdown({ on: 'break', variant: '$$' }),
      inlineMathRule = MathRules.markdown({ variant: '$' }),
      plugins = [],
    }: {
      blockMathRule?: ReturnType<typeof MathRules.markdown>;
      inlineMathRule?: ReturnType<typeof MathRules.markdown>;
      plugins?: any[];
    } = {}
  ) =>
    createSlateEditor({
      plugins: [
        BaseParagraphPlugin,
        BaseInlineEquationPlugin.configure({
          inputRules: [inlineMathRule],
        }),
        BaseEquationPlugin.configure({
          inputRules: [blockMathRule],
        }),
        ...plugins,
      ],
      value,
    } as any);

  it('converts a completed $...$ sequence into an inline equation on the closing delimiter', () => {
    const input = (
      <fragment>
        <hp>
          Math: $x
          <cursor />
        </hp>
      </fragment>
    ) as any;

    const editor = createEditor(input);

    editor.tf.insertText('$');

    expect(input.children).toEqual(
      (
        <fragment>
          <hp>
            Math: <hinlineequation texExpression="x" />
          </hp>
        </fragment>
      ).children
    );
  });

  it('promotes a $$ paragraph into a block equation on Enter', () => {
    const input = (
      <fragment>
        <hp>
          $$
          <cursor />
        </hp>
      </fragment>
    ) as any;

    const editor = createEditor(input);
    editor.tf.select(editor.api.end([0])!);

    editor.tf.insertBreak();

    expect(editor.children).toMatchObject([
      {
        texExpression: '',
        type: KEYS.equation,
      },
    ]);
  });

  it('promotes a $$ prefix into a block equation on the matching delimiter when configured with on: match', () => {
    const input = (
      <fragment>
        <hp>
          $
          <cursor />
        </hp>
      </fragment>
    ) as any;

    const editor = createEditor(input, {
      blockMathRule: MathRules.markdown({ on: 'match', variant: '$$' }),
    });

    editor.tf.select({
      anchor: { offset: 1, path: [0, 0] },
      focus: { offset: 1, path: [0, 0] },
    });
    editor.tf.insertText('$');

    expect(editor.children).toMatchObject([
      {
        texExpression: '',
        type: KEYS.equation,
      },
    ]);
  });

  it('keeps $...$ literal inside code blocks', () => {
    const input = (
      <fragment>
        <hcodeblock>
          <hcodeline>
            $x
            <cursor />
          </hcodeline>
        </hcodeblock>
      </fragment>
    ) as any;

    const editor = createEditor(input, { plugins: [CodeBlockPlugin] });

    editor.tf.insertText('$');

    expect(input.children).toEqual(
      (
        <fragment>
          <hcodeblock>
            <hcodeline>$x$</hcodeline>
          </hcodeblock>
        </fragment>
      ).children
    );
  });

  it('respects app-level enabled overrides for inline math', () => {
    const input = (
      <fragment>
        <hp>
          Math: $x
          <cursor />
        </hp>
      </fragment>
    ) as any;

    const editor = createEditor(input, {
      inlineMathRule: MathRules.markdown({
        enabled: () => false,
        variant: '$',
      }),
    });

    editor.tf.insertText('$');

    expect(input.children).toEqual(
      (
        <fragment>
          <hp>Math: $x$</hp>
        </fragment>
      ).children
    );
  });
});
