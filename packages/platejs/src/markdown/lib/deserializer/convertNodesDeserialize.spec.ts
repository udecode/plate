import {
  createTestEditor,
  getTestDeserializeOptions,
} from '../__tests__/createTestEditor';
import type { MdHeading, MdRootContent } from '../mdast';
import type { DeserializeMdContext } from '../types';
import {
  buildSlateNode,
  convertNodesDeserialize,
} from './convertNodesDeserialize';

describe('convertNodesDeserialize', () => {
  const editor = createTestEditor();

  const mockParagraphNode: MdRootContent = {
    children: [{ type: 'text', value: 'Hello' }],
    type: 'paragraph',
  };

  const mockHeadingNode: MdHeading = {
    children: [{ type: 'text', value: 'Title' }],
    depth: 1,
    type: 'heading',
  };

  const mockThematicBreakNode: MdRootContent = {
    type: 'thematicBreak',
  };

  const mockBoldNode: MdRootContent = {
    children: [
      { children: [{ type: 'text', value: 'Hello' }], type: 'strong' },
      { type: 'text', value: 'World' },
    ],
    type: 'paragraph',
  };

  const mockNodes = [
    mockParagraphNode,
    mockHeadingNode,
    mockThematicBreakNode,
    mockBoldNode,
  ];

  const baseOptions: DeserializeMdContext = getTestDeserializeOptions(editor);

  const mockParagraphNodeSlate = {
    children: [{ text: 'Hello' }],
    type: 'paragraph',
  };

  const mockHeadingNodeSlate = {
    children: [{ text: 'Title' }],
    level: 1,
    type: 'heading',
  };

  const mockThematicBreakNodeSlate = {
    children: [{ text: '' }],
    type: 'horizontalRule',
  };

  const mockBoldNodeSlate = {
    children: [{ bold: true, text: 'Hello' }, { text: 'World' }],
    type: 'paragraph',
  };

  const mockNodesSlate = [
    mockParagraphNodeSlate,
    mockHeadingNodeSlate,
    mockThematicBreakNodeSlate,
    mockBoldNodeSlate,
  ];

  describe('allowedNodes option', () => {
    it('throws when allowedNodes and disallowedNodes are both configured', () => {
      expect(() =>
        convertNodesDeserialize(
          mockNodes,
          {},
          {
            ...baseOptions,
            allowedNodes: ['heading'],
            disallowedNodes: ['paragraph'],
          }
        )
      ).toThrow('Cannot combine allowedNodes with disallowedNodes');
    });

    it('only include nodes specified in allowedNodes', () => {
      const options: DeserializeMdContext = {
        ...baseOptions,
        allowedNodes: ['heading', 'text'],
      };

      const result = convertNodesDeserialize(mockNodes, {}, options);

      expect(result).toHaveLength(1);
      expect(result).toEqual([mockHeadingNodeSlate]);
    });

    it('include all nodes when allowedNodes is null or undefined', () => {
      const options: DeserializeMdContext = {
        ...baseOptions,
        allowedNodes: null,
      };

      const result = convertNodesDeserialize(mockNodes, {}, options);
      expect(result).toHaveLength(mockNodesSlate.length);
      expect(result).toEqual(mockNodesSlate);
    });

    it('include no nodes when allowedNodes is empty', () => {
      const options: DeserializeMdContext = {
        ...baseOptions,
        allowedNodes: [],
      };

      const result = convertNodesDeserialize(mockNodes, {}, options);
      expect(result).toHaveLength(0);
    });
  });

  describe('disabledNodes option', () => {
    it('exclude nodes specified in disabledNodes', () => {
      const options: DeserializeMdContext = {
        ...baseOptions,
        disallowedNodes: ['heading'],
      };

      const result = convertNodesDeserialize(mockNodes, {}, options);

      expect(result).toEqual([
        mockParagraphNodeSlate,
        mockThematicBreakNodeSlate,
        mockBoldNodeSlate,
      ]);
    });

    it('exclude inline nodes specified in disallowedNodes', () => {
      const options: DeserializeMdContext = {
        ...baseOptions,
        disallowedNodes: ['bold'],
      };

      const result = convertNodesDeserialize(mockNodes, {}, options);

      expect(result).toEqual([
        mockParagraphNodeSlate,
        mockHeadingNodeSlate,
        mockThematicBreakNodeSlate,
        {
          children: [{ text: 'World' }],
          type: 'paragraph',
        },
      ]);
    });
  });

  describe('allowNode option', () => {
    it('exclude nodes specified in allowNode', () => {
      const options: DeserializeMdContext = {
        ...baseOptions,
        allowNode: {
          deserialize(node) {
            if (node.type === 'horizontalRule') return false;

            return true;
          },
        },
      };
      const result = convertNodesDeserialize(mockNodes, {}, options);

      expect(result).toEqual([
        mockParagraphNodeSlate,
        mockHeadingNodeSlate,
        mockBoldNodeSlate,
      ]);
    });

    it('exclude inline nodes specified in allowNode', () => {
      const options: DeserializeMdContext = {
        ...baseOptions,
        allowNode: {
          deserialize(node) {
            if (node.type === 'bold') return false;

            return true;
          },
        },
      };
      const result = convertNodesDeserialize(mockNodes, {}, options);

      expect(result).toEqual([
        mockParagraphNodeSlate,
        mockHeadingNodeSlate,
        mockThematicBreakNodeSlate,
        {
          children: [{ text: 'World' }],
          type: 'paragraph',
        },
      ]);
    });
  });

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

    it('uses a registered rule when the tag name matches', () => {
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
          visible: true,
          width: 50,
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

    it('warns and falls back when the tag name is empty', () => {
      const warn = spyOn(console, 'warn').mockImplementation(() => {});
      const node = {
        attributes: [],
        children: [{ type: 'text' as const, value: 'New' }],
        name: '',
        type: 'mdxJsxTextElement' as const,
      };

      expect(
        buildSlateNode(node, {}, getTestDeserializeOptions(editor))
      ).toEqual([{ text: '<>New</>' }]);
      expect(warn).toHaveBeenCalledWith(
        'This MDX node does not have a parser for deserialization',
        node
      );
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
