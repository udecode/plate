import {
  createTestEditor,
  getTestDeserializeOptions,
} from '../__tests__/createTestEditor';
import type { DeserializeMdContext } from '../types';
import { buildSlateNode } from './convertNodesDeserialize';

describe('convertNodesDeserialize', () => {
  const editor = createTestEditor();

  const baseOptions: DeserializeMdContext = getTestDeserializeOptions(editor);

  describe('disabledNodes option', () => {});

  it('returns an empty array for unknown node types without a registered rule', () => {
    expect(
      buildSlateNode(
        {
          type: 'mysteryNode',
        },
        {},
        baseOptions
      )
    ).toEqual([]);
  });

  describe('MDX nodes', () => {
    afterEach(() => {
      mock.restore();
    });

    it('decodes declared attributes by schema kind and ignores undeclared ones', () => {
      expect(
        buildSlateNode(
          {
            attributes: [
              { name: 'width', type: 'mdxJsxAttribute', value: '50' },
              { name: 'visible', type: 'mdxJsxAttribute', value: 'true' },
            ],
            children: [
              {
                children: [{ type: 'text', value: 'Column content' }],
                type: 'paragraph',
              },
            ],
            name: 'column',
            type: 'mdxJsxFlowElement',
          },
          {},
          getTestDeserializeOptions(editor)
        )
      ).toEqual([
        {
          children: [
            {
              children: [{ text: 'Column content' }],
              type: 'paragraph',
            },
          ],
          type: 'column',
          width: '50',
        },
      ]);
    });

    it('preserves unknown inline MDX as literal text', () => {
      expect(
        buildSlateNode(
          {
            attributes: [
              { name: 'htmlFor', type: 'mdxJsxAttribute', value: 'email' },
            ],
            children: [{ type: 'text', value: 'Email' }],
            name: 'label',
            type: 'mdxJsxTextElement',
          },
          {},
          getTestDeserializeOptions(editor)
        )
      ).toEqual([{ text: '<label for="email">Email</label>' }]);
    });

    it('diagnoses and falls back when the tag name is empty', () => {
      const diagnostics: Array<Parameters<DeserializeMdContext['report']>[0]> =
        [];
      const node = {
        attributes: [],
        children: [{ type: 'text' as const, value: 'New' }],
        name: '',
        type: 'mdxJsxTextElement' as const,
      };

      expect(
        buildSlateNode(
          node,
          {},
          {
            ...getTestDeserializeOptions(editor),
            report: (diagnostic) => diagnostics.push(diagnostic),
          }
        )
      ).toEqual([{ text: '<>New</>' }]);
      expect(diagnostics).toEqual([
        expect.objectContaining({
          action: 'replaced',
          code: 'markdown-unsupported-node',
          nodeType: 'mdxJsxTextElement',
          phase: 'parse',
          severity: 'error',
        }),
      ]);
    });

    it('preserves unknown block MDX in a paragraph', () => {
      expect(
        buildSlateNode(
          {
            attributes: [],
            children: [],
            name: 'Widget',
            type: 'mdxJsxFlowElement',
          },
          {},
          getTestDeserializeOptions(editor)
        )
      ).toEqual([
        {
          children: [{ text: '<Widget />' }],
          type: 'paragraph',
        },
      ]);
    });
  });
});
