/** @jsx jsxt */

import { BaseParagraphPlugin, createSlateEditor } from 'platejs';
import { jsxt } from '@platejs/test-utils';

import { BaseMathKit } from '@/registry/components/editor/plugins/math-base-kit';

jsxt;

const createMathEditor = (value: any) =>
  createSlateEditor({
    plugins: [BaseParagraphPlugin, ...BaseMathKit],
    value,
  } as any);

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

    (editor.tf as any).insert.inlineEquation('E=mc^2');

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

    (editor.tf as any).insert.equation();

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
