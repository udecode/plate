import type { Descendant } from '@platejs/plite';

import type { MdRootContent } from '../mdast';
import type { SerializeMdContext } from '../types';

import {
  createTestEditor,
  getTestSerializeOptions,
} from '../__tests__/createTestEditor';
import { buildMdastNode, convertNodesSerialize } from './convertNodesSerialize';

describe('convertNodesSerialize', () => {
  const editor = createTestEditor();

  const mockParagraphNodeSlate: Descendant = {
    children: [{ text: 'Hello' }],
    type: 'paragraph',
  };

  const mockHeadingNodeSlate: Descendant = {
    children: [{ text: 'Title' }],
    level: 1,
    type: 'heading',
  };

  const mockThematicBreakNodeSlate: Descendant = {
    children: [{ text: '' }],
    type: 'horizontalRule',
  };

  const mockBoldNodeSlate: Descendant = {
    children: [{ bold: true, text: 'Hello' }, { text: 'World' }],
    type: 'paragraph',
  };

  const mockNodesSlate = [
    mockParagraphNodeSlate,
    mockHeadingNodeSlate,
    mockThematicBreakNodeSlate,
    mockBoldNodeSlate,
  ];

  const mockParagraphNodeMd = {
    children: [{ type: 'text', value: 'Hello' }],
    type: 'paragraph',
  } satisfies MdRootContent;

  const mockHeadingNodeMd = {
    children: [{ type: 'text', value: 'Title' }],
    depth: 1,
    type: 'heading',
  } satisfies MdRootContent;

  const mockThematicBreakNodeMd = {
    type: 'thematicBreak',
  } satisfies MdRootContent;

  const mockBoldNodeMd = {
    children: [
      { children: [{ type: 'text', value: 'Hello' }], type: 'strong' },
      { type: 'text', value: 'World' },
    ],
    type: 'paragraph',
  } satisfies MdRootContent;

  const mockNodesMd: MdRootContent[] = [
    mockParagraphNodeMd,
    mockHeadingNodeMd,
    mockThematicBreakNodeMd,
    mockBoldNodeMd,
  ];

  const baseOptions: SerializeMdContext = getTestSerializeOptions(editor);

  const expectMdNodes = (actual: MdRootContent[], expected: MdRootContent[]) =>
    expect(actual).toEqual(expected);

  describe('allowedNodes option', () => {
    it('throws when allowedNodes and disallowedNodes are both configured', () => {
      expect(() =>
        convertNodesSerialize(mockNodesSlate, {
          ...baseOptions,
          allowedNodes: ['heading'],
          disallowedNodes: ['p'],
        })
      ).toThrow('Cannot combine allowedNodes with disallowedNodes');
    });

    it('only include nodes specified in allowedNodes', () => {
      const options: SerializeMdContext = {
        ...baseOptions,
        allowedNodes: ['heading', 'text'],
      };

      const result = convertNodesSerialize(mockNodesSlate, options);

      expect(result).toHaveLength(1);
      expectMdNodes(result, [mockHeadingNodeMd]);
    });

    it('include all nodes when allowedNodes is null or undefined', () => {
      const options: SerializeMdContext = {
        ...baseOptions,
        allowedNodes: null,
      };

      const result = convertNodesSerialize(mockNodesSlate, options);
      expect(result).toHaveLength(mockNodesMd.length);
      expectMdNodes(result, mockNodesMd);
    });

    it('include no nodes when allowedNodes is empty', () => {
      const options: SerializeMdContext = {
        ...baseOptions,
        allowedNodes: [],
      };

      const result = convertNodesSerialize(mockNodesSlate, options);
      expect(result).toHaveLength(0);
    });

    it('drop truthy text marks that are not in allowedNodes even when the parent block is allowed', () => {
      const options: SerializeMdContext = {
        ...baseOptions,
        allowedNodes: ['paragraph'],
      };

      const result = convertNodesSerialize([mockBoldNodeSlate], options);

      expectMdNodes(result, [
        {
          children: [{ type: 'text', value: 'World' }],
          type: 'paragraph',
        },
      ]);
    });
  });

  describe('withBlockId option', () => {
    it('wraps top-level block nodes with their id metadata', () => {
      const result = convertNodesSerialize(
        [
          {
            children: [{ text: 'Hello' }],
            id: 'block-1',
            type: 'paragraph',
          },
        ],
        {
          ...baseOptions,
          blockId: (node) =>
            typeof node.id === 'string' ? node.id : undefined,
          withBlockId: true,
        },
        true
      );

      expectMdNodes(result, [
        {
          attributes: [
            {
              name: 'id',
              type: 'mdxJsxAttribute',
              value: 'block-1',
            },
          ],
          children: [
            {
              children: [{ type: 'text', value: 'Hello' }],
              type: 'paragraph',
            },
          ],
          data: {
            _mdxExplicitJsx: true,
          },
          name: 'block',
          type: 'mdxJsxFlowElement',
        },
      ]);
    });

    it('does not wrap nested block ids when serializing child nodes', () => {
      const result = convertNodesSerialize(
        [
          {
            children: [
              {
                children: [{ text: 'Nested' }],
                id: 'nested-1',
                type: 'paragraph',
              },
            ],
            type: 'blockquote',
          },
        ],
        {
          ...baseOptions,
          blockId: (node) =>
            typeof node.id === 'string' ? node.id : undefined,
          withBlockId: true,
        },
        true
      );

      expectMdNodes(result, [
        {
          children: [
            {
              children: [{ type: 'text', value: 'Nested' }],
              type: 'paragraph',
            },
          ],
          type: 'blockquote',
        },
      ]);
    });

    it('wraps legacy inline blockquote children into a paragraph when serializing', () => {
      const result = convertNodesSerialize(
        [
          {
            children: [{ text: 'Legacy quote' }],
            type: 'blockquote',
          },
        ],
        baseOptions,
        true
      );

      expectMdNodes(result, [
        {
          children: [
            {
              children: [{ type: 'text', value: 'Legacy quote' }],
              type: 'paragraph',
            },
          ],
          type: 'blockquote',
        },
      ]);
    });
  });

  describe('buildMdastNode', () => {
    it('normalizes heading plugin names before selecting the serializer', () => {
      expect(
        buildMdastNode(
          {
            children: [{ text: 'Subtitle' }],
            level: 2,
            type: 'heading',
          },
          baseOptions
        )
      ).toEqual({
        children: [{ type: 'text', value: 'Subtitle' }],
        depth: 2,
        type: 'heading',
      });
    });
  });

  describe('disallowedNodes option', () => {
    it('exclude nodes specified in disallowedNodes', () => {
      const options: SerializeMdContext = {
        ...baseOptions,
        disallowedNodes: ['heading'],
      };

      const result = convertNodesSerialize(mockNodesSlate, options);

      expectMdNodes(result, [
        mockParagraphNodeMd,
        mockThematicBreakNodeMd,
        mockBoldNodeMd,
      ]);
    });

    it('exclude text marks specified in disallowedNodes', () => {
      const options: SerializeMdContext = {
        ...baseOptions,
        disallowedNodes: ['bold'],
      };

      const result = convertNodesSerialize(mockNodesSlate, options);

      expectMdNodes(result, [
        mockParagraphNodeMd,
        mockHeadingNodeMd,
        mockThematicBreakNodeMd,
        {
          children: [{ type: 'text', value: 'World' }],
          type: 'paragraph',
        },
      ]);
    });
  });

  describe('plainMarks option', () => {
    it('treat marks specified in plainMarks as plain text', () => {
      const options: SerializeMdContext = {
        ...baseOptions,
        plainMarks: ['bold'],
      };

      const result = convertNodesSerialize(mockNodesSlate, options);

      expectMdNodes(result, [
        mockParagraphNodeMd,
        mockHeadingNodeMd,
        mockThematicBreakNodeMd,
        {
          children: [{ type: 'text', value: 'HelloWorld' }],
          type: 'paragraph',
        },
      ]);
    });

    it('treat multiple marks as plain text', () => {
      const mockItalicBoldNodeSlate: Descendant = {
        children: [
          { bold: true, italic: true, text: 'BoldItalic' },
          { text: ' normal' },
        ],
        type: 'paragraph',
      };

      const options: SerializeMdContext = {
        ...baseOptions,
        plainMarks: ['bold', 'italic'],
      };

      const result = convertNodesSerialize([mockItalicBoldNodeSlate], options);

      expectMdNodes(result, [
        {
          children: [{ type: 'text', value: 'BoldItalic normal' }],
          type: 'paragraph',
        },
      ]);
    });

    it('only treat specified marks as plain text', () => {
      const mockItalicBoldNodeSlate: Descendant = {
        children: [
          { bold: true, italic: true, text: 'BoldItalic' },
          { text: ' normal' },
        ],
        type: 'paragraph',
      };

      const options: SerializeMdContext = {
        ...baseOptions,
        plainMarks: ['bold'],
      };

      const result = convertNodesSerialize([mockItalicBoldNodeSlate], options);

      expectMdNodes(result, [
        {
          children: [
            {
              children: [{ type: 'text', value: 'BoldItalic' }],
              type: 'emphasis',
            },
            { type: 'text', value: ' normal' },
          ],
          type: 'paragraph',
        },
      ]);
    });
  });

  describe('allowNode option', () => {
    it('exclude nodes specified in allowNode', () => {
      const options: SerializeMdContext = {
        ...baseOptions,
        allowNode: {
          serialize(node) {
            if (node.type === 'horizontalRule') return false;
            return true;
          },
        },
      };

      const result = convertNodesSerialize(mockNodesSlate, options);

      expectMdNodes(result, [
        mockParagraphNodeMd,
        mockHeadingNodeMd,
        mockBoldNodeMd,
      ]);
    });

    it('exclude text marks specified in allowNode', () => {
      const options: SerializeMdContext = {
        ...baseOptions,
        allowNode: {
          serialize(node) {
            if ('bold' in node && node.bold) return false;
            return true;
          },
        },
      };

      const result = convertNodesSerialize(mockNodesSlate, options);

      expectMdNodes(result, [
        mockParagraphNodeMd,
        mockHeadingNodeMd,
        mockThematicBreakNodeMd,
        {
          children: [{ type: 'text', value: 'World' }],
          type: 'paragraph',
        },
      ]);
    });
  });

  describe('listType handling', () => {
    it('groups root list items whose indent is omitted', () => {
      const result = convertNodesSerialize(
        [
          {
            children: [{ text: 'one' }],
            listType: 'numbered',
            type: 'paragraph',
          },
          {
            children: [{ text: 'two' }],
            listType: 'numbered',
            type: 'paragraph',
          },
        ],
        baseOptions
      );

      expect(result).toMatchObject([
        {
          children: [{}, {}],
          ordered: true,
          type: 'list',
        },
      ]);
    });

    it('groups explicit and omitted default marker styles', () => {
      const result = convertNodesSerialize(
        [
          {
            children: [{ text: 'one' }],
            listStyle: 'decimal',
            listType: 'numbered',
            type: 'paragraph',
          },
          {
            children: [{ text: 'two' }],
            listType: 'numbered',
            type: 'paragraph',
          },
        ],
        baseOptions
      );

      expect(result).toMatchObject([
        {
          children: [{}, {}],
          ordered: true,
          type: 'list',
        },
      ]);
    });

    it('splits an explicit numbered-list restart into a new MDAST list', () => {
      const result = convertNodesSerialize(
        [
          {
            children: [{ text: 'one' }],
            indent: 1,
            listType: 'numbered',
            type: 'paragraph',
          },
          {
            children: [{ text: 'seven' }],
            indent: 1,
            listRestart: 7,
            listType: 'numbered',
            type: 'paragraph',
          },
        ],
        baseOptions
      );

      expect(result).toMatchObject([
        { ordered: true, type: 'list' },
        { ordered: true, start: 7, type: 'list' },
      ]);
    });

    it('flattens block-id list fragments returned by the list serializer', () => {
      const result = convertNodesSerialize(
        [
          {
            children: [{ text: 'one' }],
            id: 'block-a',
            indent: 1,
            listType: 'numbered',
            type: 'paragraph',
          },
          {
            children: [{ text: 'two' }],
            id: 'block-b',
            indent: 1,
            listType: 'numbered',
            type: 'paragraph',
          },
        ],
        {
          ...baseOptions,
          blockId: (node) =>
            typeof node.id === 'string' ? node.id : undefined,
          withBlockId: true,
        },
        true
      );

      expect(result).toHaveLength(2);
      expect(result[0]).toMatchObject({
        attributes: [{ name: 'id', value: 'block-a' }],
        children: [{ start: 1, type: 'list' }],
        type: 'mdxJsxFlowElement',
      });
      expect(result[1]).toMatchObject({
        attributes: [{ name: 'id', value: 'block-b' }],
        children: [{ start: 2, type: 'list' }],
        type: 'mdxJsxFlowElement',
      });
    });

    it('split list blocks when listType changes', () => {
      const listNodes: Descendant[] = [
        {
          children: [{ text: 'unordered' }],
          indent: 1,
          listType: 'bulleted',
          type: 'paragraph',
        },
        {
          children: [{ text: 'todo' }],
          indent: 1,
          listType: 'task',
          checked: false,
          type: 'paragraph',
        },
        {
          children: [{ text: 'ordered' }],
          indent: 1,
          listType: 'numbered',
          type: 'paragraph',
        },
      ];

      const result = convertNodesSerialize(listNodes, baseOptions);

      expectMdNodes(result, [
        {
          children: [
            {
              checked: null,
              children: [
                {
                  children: [{ type: 'text', value: 'unordered' }],
                  type: 'paragraph',
                },
              ],
              spread: false,
              type: 'listItem',
            },
          ],
          ordered: false,
          spread: false,
          start: undefined,
          type: 'list',
        },
        {
          children: [
            {
              checked: false,
              children: [
                {
                  children: [{ type: 'text', value: 'todo' }],
                  type: 'paragraph',
                },
              ],
              spread: false,
              type: 'listItem',
            },
          ],
          ordered: false,
          spread: false,
          start: undefined,
          type: 'list',
        },
        {
          children: [
            {
              checked: null,
              children: [
                {
                  children: [{ type: 'text', value: 'ordered' }],
                  type: 'paragraph',
                },
              ],
              spread: false,
              type: 'listItem',
            },
          ],
          ordered: true,
          spread: false,
          start: undefined,
          type: 'list',
        },
      ]);
    });

    it('split nested sibling lists when style changes at same indent', () => {
      const listNodes: Descendant[] = [
        {
          children: [{ text: 'parent bullet' }],
          indent: 1,
          listType: 'bulleted',
          type: 'paragraph',
        },
        {
          children: [{ text: 'child ordered' }],
          indent: 2,
          listType: 'numbered',
          type: 'paragraph',
        },
        {
          children: [{ text: 'child bullet' }],
          indent: 2,
          listType: 'bulleted',
          type: 'paragraph',
        },
      ];

      const result = convertNodesSerialize(listNodes, baseOptions);

      expectMdNodes(result, [
        {
          children: [
            {
              checked: null,
              children: [
                {
                  children: [{ type: 'text', value: 'parent bullet' }],
                  type: 'paragraph',
                },
                {
                  children: [
                    {
                      checked: null,
                      children: [
                        {
                          children: [{ type: 'text', value: 'child ordered' }],
                          type: 'paragraph',
                        },
                      ],
                      spread: false,
                      type: 'listItem',
                    },
                  ],
                  ordered: true,
                  spread: false,
                  start: undefined,
                  type: 'list',
                },
                {
                  children: [
                    {
                      checked: null,
                      children: [
                        {
                          children: [{ type: 'text', value: 'child bullet' }],
                          type: 'paragraph',
                        },
                      ],
                      spread: false,
                      type: 'listItem',
                    },
                  ],
                  ordered: false,
                  spread: false,
                  start: undefined,
                  type: 'list',
                },
              ],
              spread: false,
              type: 'listItem',
            },
          ],
          ordered: false,
          spread: false,
          start: undefined,
          type: 'list',
        },
      ]);
    });

    it('split when listType changes across indentation', () => {
      const listNodes: Descendant[] = [
        {
          children: [{ text: 'parent bullet' }],
          indent: 1,
          listType: 'bulleted',
          type: 'paragraph',
        },
        {
          children: [{ text: 'child bullet' }],
          indent: 2,
          listType: 'bulleted',
          type: 'paragraph',
        },
        {
          children: [{ text: 'child ordered' }],
          indent: 2,
          listType: 'numbered',
          type: 'paragraph',
        },
      ];

      const result = convertNodesSerialize(listNodes, baseOptions);

      expectMdNodes(result, [
        {
          children: [
            {
              checked: null,
              children: [
                {
                  children: [{ type: 'text', value: 'parent bullet' }],
                  type: 'paragraph',
                },
                {
                  children: [
                    {
                      checked: null,
                      children: [
                        {
                          children: [{ type: 'text', value: 'child bullet' }],
                          type: 'paragraph',
                        },
                      ],
                      spread: false,
                      type: 'listItem',
                    },
                  ],
                  ordered: false,
                  spread: false,
                  start: undefined,
                  type: 'list',
                },
                {
                  children: [
                    {
                      checked: null,
                      children: [
                        {
                          children: [{ type: 'text', value: 'child ordered' }],
                          type: 'paragraph',
                        },
                      ],
                      spread: false,
                      type: 'listItem',
                    },
                  ],
                  ordered: true,
                  spread: false,
                  start: undefined,
                  type: 'list',
                },
              ],
              spread: false,
              type: 'listItem',
            },
          ],
          ordered: false,
          spread: false,
          start: undefined,
          type: 'list',
        },
      ]);
    });
  });
});
