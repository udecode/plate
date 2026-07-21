import {
  createTestEditor,
  getTestMarkdownRuntime,
} from '../__tests__/createTestEditor';
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
        name: 'column',
        type: 'mdxJsxFlowElement',
      },
      {},
      { runtime: getTestMarkdownRuntime(editor) }
    );

    expect(result).toMatchObject({
      children: [
        {
          children: [{ text: 'A' }],
          type: 'p',
        },
      ],
      type: 'column',
    });
    expect('sticky' in result ? result.sticky : undefined).toBe(true);
    expect('width' in result ? result.width : undefined).toBe(50);
  });

  it('serializes column_group props without leaking id', () => {
    const editor = createTestEditor();
    const columnGroupRule = columnRules.column_group!;

    const result = columnGroupRule.serialize!(
      {
        children: [],
        count: 2,
        id: 'ignore-me',
        type: 'column_group',
      },
      { rules: {}, runtime: getTestMarkdownRuntime(editor) }
    );

    expect(result).toEqual({
      attributes: [
        {
          name: 'count',
          type: 'mdxJsxAttribute',
          value: '2',
        },
      ],
      children: [],
      name: 'column_group',
      type: 'mdxJsxFlowElement',
    });
  });
});
