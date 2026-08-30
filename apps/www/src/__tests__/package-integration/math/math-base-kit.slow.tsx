/** @jsx jsxt */

import { jsxt } from '@platejs/test';
import { type Value, BaseParagraphPlugin, createEditor } from 'platejs';
import { BaseEquationPlugin, BaseInlineEquationPlugin } from 'platejs/math';

import { BaseMathKit } from '@/registry/components/editor/math-static';

jsxt;

const mathPlugins = [BaseParagraphPlugin, ...BaseMathKit] as const;

const createMathEditor = (value: Value) =>
  createEditor({
    plugins: mathPlugins,
    initialValue: value,
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

    editor.plugin(BaseInlineEquationPlugin).update.insert({ latex: 'E=mc^2' });

    expect(input.children).toEqual(
      (
        <fragment>
          <hp>
            Einstein: <hinlineequation latex="E=mc^2" />
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

    editor.plugin(BaseEquationPlugin).update.insert({}, { at: [1] });

    expect(editor.read.children()).toMatchObject([
      {
        type: 'paragraph',
      },
      {
        latex: '',
        type: 'equation',
      },
    ]);
  });
});
