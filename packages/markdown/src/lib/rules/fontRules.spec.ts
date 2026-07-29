import type { MdMdxJsxTextElement } from '../mdast';

import {
  createTestEditor,
  getTestDeserializeOptions,
} from '../__tests__/createTestEditor';
import { fontRules } from './fontRules';

describe('fontRules', () => {
  const editor = createTestEditor();
  const options = getTestDeserializeOptions(editor);

  it('deserializes supported style properties', () => {
    const node: MdMdxJsxTextElement = {
      attributes: [
        {
          name: 'style',
          type: 'mdxJsxAttribute',
          value:
            'background-color: #FE9900; color: #FEFF00; font-family: Inter; font-size: 16px; font-weight: bold;',
        },
      ],
      children: [{ type: 'text', value: 'Styled' }],
      name: 'span',
      type: 'mdxJsxTextElement',
    };

    expect(fontRules.span.deserialize(node, {}, options)).toEqual([
      {
        backgroundColor: '#FE9900',
        color: '#FEFF00',
        fontFamily: 'Inter',
        fontSize: '16px',
        fontWeight: 'bold',
        text: 'Styled',
      },
    ]);
  });

  it('ignores missing style properties', () => {
    const node: MdMdxJsxTextElement = {
      attributes: [
        {
          name: 'class',
          type: 'mdxJsxAttribute',
          value: 'some-class',
        },
      ],
      children: [{ type: 'text', value: 'Plain' }],
      name: 'span',
      type: 'mdxJsxTextElement',
    };

    expect(fontRules.span.deserialize(node, {}, options)).toEqual([
      { text: 'Plain' },
    ]);
  });
});
