import { createTestEditor } from '../__tests__/createTestEditor';
import { columnRules } from './columnRules';

describe('columnRules', () => {
  it('deserializes column props and children', () => {
    const editor = createTestEditor();
    const columnRule = columnRules.column!;

    const result = columnRule.deserialize!(
      {
        attributes: [
          { name: 'width', type: 'mdxJsxAttribute', value: '50' },
          { name: 'sticky', type: 'mdxJsxAttribute', value: 'true' },
        ],
        children: [
          {
            children: [{ type: 'text', value: 'A' }],
            type: 'paragraph',
          },
        ],
      } as any,
      {},
      { editor }
    );

    expect(result as any).toEqual({
      children: [
        {
          children: [{ text: 'A' }],
          type: 'p',
        },
      ],
      sticky: true,
      type: 'column',
      width: 50,
    });
  });

  it('serializes column_group props without leaking id', () => {
    const editor = createTestEditor();
    const columnGroupRule = columnRules.column_group!;

    const result = columnGroupRule.serialize!(
      {
        children: [{ children: [{ text: 'B' }], type: 'p' }],
        count: 2,
        id: 'ignore-me',
        type: 'column_group',
      } as any,
      { editor, rules: {} as any }
    );

    expect(result).toEqual({
      attributes: [
        {
          name: 'count',
          type: 'mdxJsxAttribute',
          value: '2',
        },
      ],
      children: [
        {
          children: [{ type: 'text', value: 'B' }],
          type: 'paragraph',
        },
      ],
      name: 'column_group',
      type: 'mdxJsxFlowElement',
    });
  });
});
