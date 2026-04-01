import type { Descendant } from 'platejs';

import type { SerializeMdOptions } from './serializeMd';

import { createTestEditor } from '../__tests__/createTestEditor';
import { defaultRules } from '../rules';
import { buildMdastNode, convertNodesSerialize } from './convertNodesSerialize';

describe('convertNodesSerialize', () => {
  const editor = createTestEditor();

  const mockParagraphNodeSlate: Descendant = {
    children: [{ text: 'Hello' }],
    type: 'p',
  };

  const mockHeadingNodeSlate: Descendant = {
    children: [{ text: 'Title' }],
    type: 'h1',
  };

  const mockThematicBreakNodeSlate: Descendant = {
    children: [{ text: '' }],
    type: 'hr',
  };

  const mockBoldNodeSlate: Descendant = {
    children: [{ bold: true, text: 'Hello' }, { text: 'World' }],
    type: 'p',
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
  };

  const mockHeadingNodeMd = {
    children: [{ type: 'text', value: 'Title' }],
    depth: 1,
    type: 'heading',
  };

  const mockThematicBreakNodeMd = {
    type: 'thematicBreak',
  };

  const mockBoldNodeMd = {
    children: [
      { children: [{ type: 'text', value: 'Hello' }], type: 'strong' },
      { type: 'text', value: 'World' },
    ],
    type: 'paragraph',
  };

  const mockNodesMd = [
    mockParagraphNodeMd,
    mockHeadingNodeMd,
    mockThematicBreakNodeMd,
    mockBoldNodeMd,
  ];

  const baseOptions: SerializeMdOptions = {
    editor,
    rules: defaultRules,
  };

  describe('allowedNodes option', () => {
    it('throws when allowedNodes and disallowedNodes are both configured', () => {
      expect(() =>
        convertNodesSerialize(mockNodesSlate, {
          ...baseOptions,
          allowedNodes: ['h1'],
          disallowedNodes: ['p'],
        })
      ).toThrow('Cannot combine allowedNodes with disallowedNodes');
    });

    it('only include nodes specified in allowedNodes', () => {
      const options: SerializeMdOptions = {
        ...baseOptions,
        allowedNodes: ['h1', 'text'],
      };

      const result = convertNodesSerialize(mockNodesSlate, options);

      expect(result).toHaveLength(1);
      expect(result).toEqual([mockHeadingNodeMd]);
    });

    it('include all nodes when allowedNodes is null or undefined', () => {
      const options: SerializeMdOptions = {
        ...baseOptions,
        allowedNodes: null,
      };

      const result = convertNodesSerialize(mockNodesSlate, options);
      expect(result).toHaveLength(mockNodesMd.length);
      expect(result).toEqual(mockNodesMd);
    });

    it('include no nodes when allowedNodes is empty', () => {
      const options: SerializeMdOptions = {
        ...baseOptions,
        allowedNodes: [],
      };

      const result = convertNodesSerialize(mockNodesSlate, options);
      expect(result).toHaveLength(0);
    });

    it('drop truthy text marks that are not in allowedNodes even when the parent block is allowed', () => {
      const options: SerializeMdOptions = {
        ...baseOptions,
        allowedNodes: ['p'],
      };

      const result = convertNodesSerialize([mockBoldNodeSlate], options);

      expect(result).toEqual([
        {
          children: [{ type: 'text', value: 'World' }],
          type: 'paragraph',
        },
      ] as any);
    });
  });

  describe('withBlockId option', () => {
    it('wraps top-level block nodes with their id metadata', () => {
      const result = convertNodesSerialize(
        [
          {
            children: [{ text: 'Hello' }],
            id: 'block-1',
            type: 'p',
          } as any,
        ],
        {
          ...baseOptions,
          withBlockId: true,
        },
        true
      );

      expect(result).toEqual([
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
      ] as any);
    });

    it('does not wrap nested block ids when serializing child nodes', () => {
      const result = convertNodesSerialize(
        [
          {
            children: [
              {
                children: [{ text: 'Nested' }],
                id: 'nested-1',
                type: 'p',
              },
            ],
            type: 'blockquote',
          } as any,
        ],
        {
          ...baseOptions,
          withBlockId: true,
        },
        true
      );

      expect(result).toEqual([
        {
          children: [
            {
              children: [
                {
                  children: [{ type: 'text', value: 'Nested' }],
                  type: 'paragraph',
                },
              ],
              type: 'paragraph',
            },
          ],
          type: 'blockquote',
        },
      ] as any);
    });
  });

  describe('buildMdastNode', () => {
    it('normalizes heading plugin keys before selecting the serializer', () => {
      expect(
        buildMdastNode(
          {
            children: [{ text: 'Subtitle' }],
            type: 'h2',
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
      const options: SerializeMdOptions = {
        ...baseOptions,
        disallowedNodes: ['h1'],
      };

      const result = convertNodesSerialize(mockNodesSlate, options);

      expect(result).toEqual([
        mockParagraphNodeMd,
        mockThematicBreakNodeMd,
        mockBoldNodeMd,
      ]);
    });

    it('exclude text marks specified in disallowedNodes', () => {
      const options: SerializeMdOptions = {
        ...baseOptions,
        disallowedNodes: ['bold'],
      };

      const result = convertNodesSerialize(mockNodesSlate, options);

      expect(result).toEqual([
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
      const options: SerializeMdOptions = {
        ...baseOptions,
        plainMarks: ['bold'],
      };

      const result = convertNodesSerialize(mockNodesSlate, options);

      expect(result).toEqual([
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
        type: 'p',
      };

      const options: SerializeMdOptions = {
        ...baseOptions,
        plainMarks: ['bold', 'italic'],
      };

      const result = convertNodesSerialize([mockItalicBoldNodeSlate], options);

      expect(result).toEqual([
        {
          children: [{ type: 'text', value: 'BoldItalic normal' }],
          type: 'paragraph',
        },
      ] as any);
    });

    it('only treat specified marks as plain text', () => {
      const mockItalicBoldNodeSlate: Descendant = {
        children: [
          { bold: true, italic: true, text: 'BoldItalic' },
          { text: ' normal' },
        ],
        type: 'p',
      };

      const options: SerializeMdOptions = {
        ...baseOptions,
        plainMarks: ['bold'],
      };

      const result = convertNodesSerialize([mockItalicBoldNodeSlate], options);

      expect(result).toEqual([
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
      ] as any);
    });
  });

  describe('allowNode option', () => {
    it('exclude nodes specified in allowNode', () => {
      const options: SerializeMdOptions = {
        ...baseOptions,
        allowNode: {
          serialize(node) {
            if (node.type === 'hr') return false;
            return true;
          },
        },
      };

      const result = convertNodesSerialize(mockNodesSlate, options);

      expect(result).toEqual([
        mockParagraphNodeMd,
        mockHeadingNodeMd,
        mockBoldNodeMd,
      ]);
    });

    it('exclude text marks specified in allowNode', () => {
      const options: SerializeMdOptions = {
        ...baseOptions,
        allowNode: {
          serialize(node) {
            if ('bold' in node && node.bold) return false;
            return true;
          },
        },
      };

      const result = convertNodesSerialize(mockNodesSlate, options);

      expect(result).toEqual([
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

  describe('listStyleType handling', () => {
    it('flattens block-id list fragments returned by the list serializer', () => {
      const result = convertNodesSerialize(
        [
          {
            children: [{ text: 'one' }],
            id: 'block-a',
            indent: 1,
            listStart: 1,
            listStyleType: 'decimal',
            type: 'p',
          },
          {
            children: [{ text: 'two' }],
            id: 'block-b',
            indent: 1,
            listStart: 1,
            listStyleType: 'decimal',
            type: 'p',
          },
        ] as any,
        {
          ...baseOptions,
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

    it('split list blocks when listStyleType changes', () => {
      const listNodes: Descendant[] = [
        {
          children: [{ text: 'unordered' }],
          indent: 1,
          listStart: 1,
          listStyleType: 'disc',
          type: 'p',
        },
        {
          children: [{ text: 'todo' }],
          indent: 1,
          listStart: 1,
          listStyleType: 'todo',
          checked: false,
          type: 'p',
        },
        {
          children: [{ text: 'ordered' }],
          indent: 1,
          listStart: 1,
          listStyleType: 'decimal',
          type: 'p',
        },
      ];

      const result = convertNodesSerialize(listNodes, baseOptions);

      expect(result).toEqual([
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
          start: 1,
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
          start: 1,
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
          start: 1,
          type: 'list',
        },
      ] as any);
    });

    it('split nested sibling lists when style changes at same indent', () => {
      const listNodes: Descendant[] = [
        {
          children: [{ text: 'parent bullet' }],
          indent: 1,
          listStart: 1,
          listStyleType: 'disc',
          type: 'p',
        },
        {
          children: [{ text: 'child ordered' }],
          indent: 2,
          listStart: 1,
          listStyleType: 'decimal',
          type: 'p',
        },
        {
          children: [{ text: 'child bullet' }],
          indent: 2,
          listStart: 1,
          listStyleType: 'disc',
          type: 'p',
        },
      ];

      const result = convertNodesSerialize(listNodes, baseOptions);

      expect(result).toEqual([
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
                  start: 1,
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
                  start: 1,
                  type: 'list',
                },
              ],
              spread: false,
              type: 'listItem',
            },
          ],
          ordered: false,
          spread: false,
          start: 1,
          type: 'list',
        },
      ] as any);
    });

    it('split when listStyleType changes across indentation', () => {
      const listNodes: Descendant[] = [
        {
          children: [{ text: 'parent bullet' }],
          indent: 1,
          listStart: 1,
          listStyleType: 'disc',
          type: 'p',
        },
        {
          children: [{ text: 'child bullet' }],
          indent: 2,
          listStart: 1,
          listStyleType: 'disc',
          type: 'p',
        },
        {
          children: [{ text: 'child ordered' }],
          indent: 2,
          listStart: 1,
          listStyleType: 'decimal',
          type: 'p',
        } as any,
      ];

      const result = convertNodesSerialize(listNodes, baseOptions);

      expect(result).toEqual([
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
                  start: 1,
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
                  start: 1,
                  type: 'list',
                },
              ],
              spread: false,
              type: 'listItem',
            },
          ],
          ordered: false,
          spread: false,
          start: 1,
          type: 'list',
        },
      ] as any);
    });
  });
});
