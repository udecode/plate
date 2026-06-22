/** @jsx jsxt */

import { type Value, BaseParagraphPlugin, createSlateEditor } from 'platejs';
import { jsxt } from '@platejs/test-utils';

import { BaseMathKit } from '@/registry/components/editor/plugins/math-base-kit';

jsxt;

const mathPlugins = [BaseParagraphPlugin, ...BaseMathKit] as const;

const createMathEditor = (value: Value) =>
  createSlateEditor({
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

    editor.tf.insert.inlineEquation('E=mc^2');

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

    editor.tf.insert.equation();

    expect(editor.children).toMatchObject([
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
