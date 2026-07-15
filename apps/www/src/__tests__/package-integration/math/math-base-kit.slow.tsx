/** @jsx jsxt */

import { type Value, BaseParagraphPlugin, createBaseEditor } from 'platejs';
import { BaseEquationPlugin, BaseInlineEquationPlugin } from '@platejs/math';
import { jsxt } from '@platejs/test-utils';

import { BaseMathKit } from '@/registry/components/editor/plugins/math-base-kit';

jsxt;

const mathPlugins = [BaseParagraphPlugin, ...BaseMathKit] as const;

const createMathEditor = (value: Value) =>
  createBaseEditor({
    plugins: mathPlugins,
    value,
  });

describe('BaseMathKit', () => {
  it('inserts inline equations through the base insert transform', () => {
    const input = (
      <fragment>
        <hp>
          Einstein: <cursor />
        </hp>
      </fragment>
    ) as any;

    const editor = createMathEditor(input);

    editor
      .plugin(BaseInlineEquationPlugin)
      .update.insert({ texExpression: 'E=mc^2' });

    expect(input.children).toEqual(
      (
        <fragment>
          <hp>
            Einstein: <hinlineequation texExpression="E=mc^2" />
          </hp>
        </fragment>
      ).children
    );
  });

  it('inserts block equations through the base insert transform', () => {
    const input = (
      <fragment>
        <hp>
          Before
          <cursor />
        </hp>
      </fragment>
    ) as any;

    const editor = createMathEditor(input);

    editor.plugin(BaseEquationPlugin).update.insert();

    expect(editor.read.children()).toMatchObject([
      {
        type: 'p',
      },
      {
        texExpression: '',
        type: 'equation',
      },
    ]);
  });
});
