import type { Descendant } from '../../../core';
import {
  createTestEditor,
  getTestSerializeOptions,
  withTestSerializeDocument,
} from '../__tests__/createTestEditor';
import type { MdRootContent } from '../mdast';
import type { SerializeMdContext } from '../types';
import {
  buildMdastNode as buildMdastNodeWithContext,
  convertNodesSerialize as convertNodesSerializeWithContext,
} from './convertNodesSerialize';

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

  const baseOptions: SerializeMdContext = getTestSerializeOptions(editor);

  const convertNodesSerialize = (
    nodes: Parameters<typeof convertNodesSerializeWithContext>[0],
    options: SerializeMdContext
  ) =>
    convertNodesSerializeWithContext(
      nodes,
      withTestSerializeDocument(options, nodes)
    );
  const buildMdastNode = (
    node: Parameters<typeof buildMdastNodeWithContext>[0],
    options: SerializeMdContext
  ) =>
    buildMdastNodeWithContext(node, withTestSerializeDocument(options, [node]));

  const expectMdNodes = (actual: MdRootContent[], expected: MdRootContent[]) =>
    expect(actual).toEqual(expected);

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
