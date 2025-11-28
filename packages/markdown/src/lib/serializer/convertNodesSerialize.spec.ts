import type { Descendant } from 'platejs';

import type { SerializeMdOptions } from './serializeMd';

import { createTestEditor } from '../__tests__/createTestEditor';
import { defaultRules } from '../rules';
import { convertNodesSerialize } from './convertNodesSerialize';

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
    it('should only include nodes specified in allowedNodes', () => {
      const options: SerializeMdOptions = {
        ...baseOptions,
        allowedNodes: ['h1', 'text'],
      };

      const result = convertNodesSerialize(mockNodesSlate, options);

      expect(result).toHaveLength(1);
      expect(result).toEqual([mockHeadingNodeMd]);
    });

    it('should include all nodes when allowedNodes is null or undefined', () => {
      const options: SerializeMdOptions = {
        ...baseOptions,
        allowedNodes: null,
      };

      const result = convertNodesSerialize(mockNodesSlate, options);
      expect(result).toHaveLength(mockNodesMd.length);
      expect(result).toEqual(mockNodesMd);
    });

    it('should include no nodes when allowedNodes is empty', () => {
      const options: SerializeMdOptions = {
        ...baseOptions,
        allowedNodes: [],
      };

      const result = convertNodesSerialize(mockNodesSlate, options);
      expect(result).toHaveLength(0);
    });
  });

  describe('disallowedNodes option', () => {
    it('should exclude nodes specified in disallowedNodes', () => {
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

    it('should exclude text marks specified in disallowedNodes', () => {
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
    it('should treat marks specified in plainMarks as plain text', () => {
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

    it('should treat multiple marks as plain text', () => {
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

    it('should only treat specified marks as plain text', () => {
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
    it('should exclude nodes specified in allowNode', () => {
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

    it('should exclude text marks specified in allowNode', () => {
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
    it('should split list blocks when listStyleType changes', () => {
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

    it('should split nested sibling lists when style changes at same indent', () => {
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
                      type: 'listItem',
                    },
                  ],
                  ordered: false,
                  spread: false,
                  start: 1,
                  type: 'list',
                },
              ],
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

    it('should split when listStyleType changes across indentation', () => {
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
                      type: 'listItem',
                    },
                  ],
                  ordered: true,
                  spread: false,
                  start: 1,
                  type: 'list',
                },
              ],
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
