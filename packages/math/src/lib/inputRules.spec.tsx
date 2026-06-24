/** @jsx jsxt */

import { BaseParagraphPlugin, KEYS, createEditorPlugin } from 'platejs';
import { jsxt } from '@platejs/test-utils';

import { getCurrentRuntimeTransforms } from '../../../core/src/internal/currentRuntimeBridge';
import { InputRulesPlugin } from '../../../core/src/lib/plugins/input-rules/internal/InputRulesPlugin';
import { createPlateRuntimeEditor } from '../../../core/src/react/editor/createPlateRuntimeEditor';
import { BaseEquationPlugin } from './BaseEquationPlugin';
import { BaseInlineEquationPlugin } from './BaseInlineEquationPlugin';
import { MathRules } from './MathRules';

jsxt;

const CodeBlockPlugin = createEditorPlugin({
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
    createPlateRuntimeEditor({
      initialSelection: value.selection,
      initialValue: value.children ?? value,
      plugins: [
        BaseParagraphPlugin,
        BaseInlineEquationPlugin.configure({
          inputRules: [inlineMathRule],
        }),
        BaseEquationPlugin.configure({
          inputRules: [blockMathRule],
        }),
        InputRulesPlugin,
        ...plugins,
      ],
    } as any);

  const root = (editor: ReturnType<typeof createEditor>) =>
    editor.read((state) => state.value.root());

  it('converts a completed $...$ sequence into an inline equation on the closing delimiter', () => {
    const input = (
      <editor>
        <hp>
          Math: $x
          <cursor />
        </hp>
      </editor>
    ) as any;

    const editor = createEditor(input);
    const runtimeTransforms = getCurrentRuntimeTransforms(editor);

    runtimeTransforms.insertText('$');

    expect(root(editor)).toEqual(
      <fragment>
        <hp>
          Math:{' '}
          <hinlineequation texExpression="x">
            <htext />
          </hinlineequation>
          <htext />
        </hp>
      </fragment>
    );
  });

  it('promotes a $$ paragraph into a block equation on Enter', () => {
    const input = (
      <editor>
        <hp>
          $$
          <cursor />
        </hp>
      </editor>
    ) as any;

    const editor = createEditor(input);
    const runtimeTransforms = getCurrentRuntimeTransforms(editor);
    runtimeTransforms.select(editor.api.end([0])!);

    runtimeTransforms.insertBreak();

    expect(root(editor)).toMatchObject([
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
    ) as any;

    const editor = createEditor(input, {
      blockMathRule: MathRules.markdown({ on: 'match', variant: '$$' }),
    });
    const runtimeTransforms = getCurrentRuntimeTransforms(editor);

    runtimeTransforms.select({
      anchor: { offset: 1, path: [0, 0] },
      focus: { offset: 1, path: [0, 0] },
    });
    runtimeTransforms.insertText('$');

    expect(root(editor)).toMatchObject([
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
    ) as any;

    const editor = createEditor(input, { plugins: [CodeBlockPlugin] });
    const runtimeTransforms = getCurrentRuntimeTransforms(editor);

    runtimeTransforms.insertText('$');

    expect(root(editor)).toEqual(
      <fragment>
        <hcodeblock>
          <hcodeline>$x$</hcodeline>
        </hcodeblock>
      </fragment>
    );
  });

  it('respects app-level enabled overrides for inline math', () => {
    const input = (
      <editor>
        <hp>
          Math: $x
          <cursor />
        </hp>
      </editor>
    ) as any;

    const editor = createEditor(input, {
      inlineMathRule: MathRules.markdown({
        enabled: () => false,
        variant: '$',
      }),
    });
    const runtimeTransforms = getCurrentRuntimeTransforms(editor);

    runtimeTransforms.insertText('$');

    expect(root(editor)).toEqual(
      <fragment>
        <hp>Math: $x$</hp>
      </fragment>
    );
  });
});
