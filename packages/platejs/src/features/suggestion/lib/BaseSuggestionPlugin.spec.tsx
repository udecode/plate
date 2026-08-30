/** @jsx jsxt */

import { jsxt } from '#platejs-test-internal';

import {
  BaseParagraphPlugin,
  type Editor,
  createEditor,
  defineBasePlugin,
  ElementApi,
  property,
  schema,
  target,
  TextApi,
  PLUGINS,
} from '../../../core';
import {
  BaseSuggestionPlugin,
  type SuggestionData,
  type SuggestionText,
  SUGGESTION_TRANSIENT_KEY,
  SuggestionUpdatePolicy,
  type UpdateSuggestionData,
} from './BaseSuggestionPlugin';

const getTextSelection = (editor: Editor) => {
  const selection = editor.read.selection();

  if (!selection) {
    throw new TypeError('Expected a text selection.');
  }

  return selection;
};

// keeps each merged test source isolated.
{
  describe('BaseSuggestionPlugin.read.activeDescriptions', () => {
    it('builds replacement and insertion descriptions from real editor data', () => {
      const editor = createEditor({
        plugins: [
          BaseSuggestionPlugin.configure({
            initialState: {
              currentUserId: 'user-a',
            },
          }),
        ],
        selection: {
          kind: 'text',
          anchor: { offset: 1, path: [0, 1] },
          focus: { offset: 1, path: [0, 1] },
        },
        initialValue: [
          {
            type: 'paragraph',
            children: [
              {
                text: 'old',
                suggestion: true,
                suggestion_1: {
                  id: '1',
                  createdAt: 1,
                  type: 'remove',
                  userId: 'user-a',
                },
              },
              {
                text: 'new',
                suggestion: true,
                suggestion_1: {
                  id: '1',
                  createdAt: 1,
                  type: 'insert',
                  userId: 'user-a',
                },
                suggestion_2: {
                  id: '2',
                  createdAt: 2,
                  type: 'insert',
                  userId: 'user-b',
                },
              },
            ],
          },
        ],
      });

      expect(
        editor.plugin(BaseSuggestionPlugin).read.activeDescriptions()
      ).toEqual([
        {
          deletedText: 'old',
          insertedText: 'new',
          suggestionId: '1',
          type: 'replacement',
          userId: 'user-a',
        },
        {
          insertedText: 'new',
          suggestionId: '2',
          type: 'insertion',
          userId: 'user-b',
        },
      ]);
    });

    it('returns an empty array when there is no active suggestion node', () => {
      const editor = createEditor({
        plugins: [BaseSuggestionPlugin],
        selection: {
          kind: 'text',
          anchor: { offset: 0, path: [0, 0] },
          focus: { offset: 0, path: [0, 0] },
        },
        initialValue: [{ type: 'paragraph', children: [{ text: 'plain' }] }],
      });

      expect(
        editor.plugin(BaseSuggestionPlugin).read.activeDescriptions()
      ).toEqual([]);
    });

    it('builds deletion descriptions when a suggestion only removes text', () => {
      const editor = createEditor({
        plugins: [BaseSuggestionPlugin],
        selection: {
          kind: 'text',
          anchor: { offset: 1, path: [0, 0] },
          focus: { offset: 1, path: [0, 0] },
        },
        initialValue: [
          {
            type: 'paragraph',
            children: [
              {
                text: 'gone',
                suggestion: true,
                suggestion_3: {
                  id: '3',
                  createdAt: 3,
                  type: 'remove',
                  userId: 'user-c',
                },
              },
            ],
          },
        ],
      });

      expect(
        editor.plugin(BaseSuggestionPlugin).read.activeDescriptions()
      ).toEqual([
        {
          deletedText: 'gone',
          suggestionId: '3',
          type: 'deletion',
          userId: 'user-c',
        },
      ]);
    });
  });
}

{
  const BoldPlugin = defineBasePlugin('bold', {
    schema: {
      mark: property.boolean({ default: false, omitDefault: true }),
    },
  });

  describe('findInlineSuggestionNode', () => {
    it('returns the first inline suggestion text node', () => {
      const editor = createEditor({
        plugins: [BaseSuggestionPlugin, BoldPlugin],
        initialValue: [
          {
            type: 'paragraph',
            children: [
              { text: 'plain' },
              {
                text: 'suggested',
                suggestion: true,
                suggestion_alpha: {
                  createdAt: 1,
                  id: 'alpha',
                  type: 'insert',
                  userId: 'alice',
                },
              },
            ],
          },
        ],
      });

      expect(
        editor
          .plugin(BaseSuggestionPlugin)
          .read.node({ isText: true, at: [] })?.[1]
      ).toEqual([0, 1]);
    });

    it('respects additional match filters', () => {
      const editor = createEditor({
        plugins: [BaseSuggestionPlugin, BoldPlugin],
        initialValue: [
          {
            type: 'paragraph',
            children: [
              {
                bold: true,
                suggestion: true,
                suggestion_alpha: {
                  createdAt: 1,
                  id: 'alpha',
                  type: 'insert',
                  userId: 'alice',
                },
                text: 'bold',
              },
              {
                suggestion: true,
                suggestion_beta: {
                  createdAt: 2,
                  id: 'beta',
                  type: 'insert',
                  userId: 'alice',
                },
                text: 'plain',
              },
            ],
          },
        ],
      });

      expect(
        editor.plugin(BaseSuggestionPlugin).read.node({
          isText: true,
          at: [],
          match: (node) => !!(node as any).bold,
        })?.[1]
      ).toEqual([0, 0]);

      expect(
        editor.plugin(BaseSuggestionPlugin).read.node({
          isText: true,
          at: [],
          match: (node) => !!(node as any).italic,
        })
      ).toBeUndefined();
    });
  });
}

// keeps each merged test source isolated.
{
  describe('BaseSuggestionPlugin.read.findIdentity', () => {
    const MentionPlugin = defineBasePlugin(PLUGINS.mention, {
      schema: {
        element: {
          inline: true,
          properties: {
            label: property.string(),
            ref: property.string({ required: true }),
          },
          void: 'markable-inline',
        },
      },
    });

    it('reuses metadata only for same-type current-user suggestions', () => {
      const editor = createEditor({
        plugins: [
          BaseSuggestionPlugin.configure({
            initialState: {
              currentUserId: 'user-1',
            },
          }),
        ],
        selection: {
          kind: 'text',
          anchor: { offset: 1, path: [0, 0] },
          focus: { offset: 1, path: [0, 0] },
        },
        initialValue: [
          {
            type: 'paragraph',
            children: [
              {
                text: 'a',
                suggestion: true,
                suggestion_same: {
                  id: 'same',
                  createdAt: 11,
                  type: 'insert',
                  userId: 'user-1',
                },
              },
            ],
          },
        ],
      });

      expect(
        editor.plugin(BaseSuggestionPlugin).read.findIdentity({
          at: getTextSelection(editor),
          type: 'insert',
        })
      ).toEqual({
        createdAt: 11,
        id: 'same',
      });

      expect(
        editor.plugin(BaseSuggestionPlugin).read.findIdentity({
          at: getTextSelection(editor),
          type: 'remove',
        })
      ).not.toEqual({
        createdAt: 11,
        id: 'same',
      });
    });

    it('falls back to the previous line-break suggestion at the start of the next block', () => {
      const editor = createEditor({
        plugins: [
          BaseSuggestionPlugin.configure({
            initialState: {
              currentUserId: 'user-1',
            },
          }),
        ],
        selection: {
          kind: 'text',
          anchor: { offset: 0, path: [1, 0] },
          focus: { offset: 0, path: [1, 0] },
        },
        initialValue: [
          {
            type: 'paragraph',
            suggestion: {
              id: 'line-break',
              createdAt: 42,
              isLineBreak: true,
              type: 'insert',
              userId: 'user-1',
            },
            children: [{ text: 'one' }],
          },
          { type: 'paragraph', children: [{ text: '' }] },
        ],
      });

      expect(
        editor.plugin(BaseSuggestionPlugin).read.findIdentity({
          at: getTextSelection(editor),
          type: 'insert',
        })
      ).toEqual({
        createdAt: 42,
        id: 'line-break',
      });
    });

    it('reuses remove metadata from the adjacent inline void suggestion when continuing backward deletion', () => {
      const editor = createEditor({
        plugins: [
          BaseSuggestionPlugin.configure({
            initialState: {
              currentUserId: 'user-1',
            },
          }),
          MentionPlugin,
        ],
        selection: {
          kind: 'text',
          anchor: { offset: 5, path: [0, 0] },
          focus: { offset: 5, path: [0, 0] },
        },
        initialValue: [
          {
            type: 'paragraph',
            children: [
              { text: 'like ' },
              {
                type: 'mention',
                label: 'Alice',
                ref: 'u1',
                suggestion: true,
                suggestion_same: {
                  id: 'same',
                  createdAt: 77,
                  type: 'remove',
                  userId: 'user-1',
                },
                children: [{ text: '' }],
              },
              { text: ',or' },
            ],
          },
        ],
      });

      expect(
        editor.plugin(BaseSuggestionPlugin).read.findIdentity({
          at: getTextSelection(editor),
          type: 'remove',
        })
      ).toEqual({
        createdAt: 77,
        id: 'same',
      });
    });
  });
}

{
  const InlineSuggestionTargetPlugin = defineBasePlugin(
    'inlineSuggestionTarget',
    {
      schema: {
        element: {
          content: schema.content.text({ default: 'text', min: 1 }),
          inline: true,
        },
      },
    }
  );

  describe('BaseSuggestionPlugin.api.getProps', () => {
    const createTestEditor = () =>
      createEditor({
        plugins: [
          BaseSuggestionPlugin.configure({
            initialState: { currentUserId: 'user-1' },
          }),
          InlineSuggestionTargetPlugin,
        ],
        initialValue: [{ children: [{ text: '' }], type: 'paragraph' }],
      });

    it('returns inline suggestion props for text nodes', () => {
      const editor = createTestEditor();
      const result = editor.plugin(BaseSuggestionPlugin).api.getProps(
        { text: 'hello' },
        {
          createdAt: 123,
          id: 'abc',
        }
      );

      expect(result).toEqual({
        suggestion: true,
        [editor.plugin(BaseSuggestionPlugin).api.key('abc')]: {
          createdAt: 123,
          id: 'abc',
          type: 'insert',
          userId: 'user-1',
        },
      });
    });

    it('returns element suggestion props for element nodes', () => {
      const editor = createTestEditor();
      const result = editor
        .plugin(BaseSuggestionPlugin)
        .api.getProps(
          { children: [], type: 'paragraph' },
          { createdAt: 456, id: 'def', suggestionDeletion: true }
        );

      expect(result).toEqual({
        suggestion: {
          createdAt: 456,
          id: 'def',
          type: 'remove',
          userId: 'user-1',
        },
      });
    });

    it('returns inline suggestion props for inline element nodes', () => {
      const editor = createTestEditor();
      const result = editor.plugin(BaseSuggestionPlugin).api.getProps(
        {
          children: [{ text: '' }],
          type: editor.plugin(InlineSuggestionTargetPlugin).schema.type,
        },
        { createdAt: 456, id: 'def', suggestionDeletion: true }
      );

      expect(result).toEqual({
        suggestion: true,
        [editor.plugin(BaseSuggestionPlugin).api.key('def')]: {
          createdAt: 456,
          id: 'def',
          type: 'remove',
          userId: 'user-1',
        },
      });
    });

    it('marks inline suggestions as transient when requested', () => {
      const editor = createTestEditor();
      const result = editor.plugin(BaseSuggestionPlugin).api.getProps(
        { text: 'hello' },
        {
          createdAt: 789,
          id: 'ghi',
          transient: true,
        }
      );

      expect(result).toHaveProperty(SUGGESTION_TRANSIENT_KEY, true);
    });
  });
}

// keeps each merged test source isolated.
{
  describe('BaseSuggestionPlugin.api.keys', () => {
    it('finds suggestion keys and resolves real user ids from suggestion data', () => {
      const editor = createEditor({ plugins: [BaseSuggestionPlugin] });
      const { api } = editor.plugin(BaseSuggestionPlugin);
      const node = {
        bold: true,
        suggestion: true,
        [api.key('id-1')]: {
          id: 'id-1',
          createdAt: 1,
          type: 'insert',
          userId: 'user-a',
        },
        [api.key('id-2')]: {
          id: 'id-2',
          createdAt: 2,
          type: 'remove',
          userId: 'user-b',
        },
        text: 'x',
      } as any;

      expect(api.key('id-1')).toBe('suggestion_id-1');
      expect(api.keys(node)).toEqual(['suggestion_id-1', 'suggestion_id-2']);
      expect(api.userIds(node)).toEqual(['user-a', 'user-b']);
      expect(api.userId(node)).toBe('user-a');
    });
  });
}

// keeps each merged test source isolated.
{
  describe('BaseSuggestionPlugin.read.nodeEntries', () => {
    it('finds all text nodes for the given suggestion id and respects extra match filters', () => {
      const editor = createEditor({
        plugins: [BaseSuggestionPlugin],
        initialValue: [
          {
            type: 'paragraph',
            children: [
              {
                text: 'old',
                suggestion: true,
                suggestion_1: {
                  id: '1',
                  createdAt: 1,
                  type: 'remove',
                  userId: 'user-a',
                },
              },
              {
                text: 'ignore',
                suggestion: true,
                suggestion_2: {
                  id: '2',
                  createdAt: 2,
                  type: 'insert',
                  userId: 'user-b',
                },
              },
            ],
          },
          {
            type: 'paragraph',
            children: [
              {
                text: 'new',
                suggestion: true,
                suggestion_1: {
                  id: '1',
                  createdAt: 1,
                  type: 'insert',
                  userId: 'user-a',
                },
              },
            ],
          },
        ],
      });

      expect(
        Array.from(
          editor.plugin(BaseSuggestionPlugin).read.nodeEntries('1')
        ).map(([, path]) => path)
      ).toEqual([
        [0, 0],
        [1, 0],
      ]);

      expect(
        Array.from(
          editor.plugin(BaseSuggestionPlugin).read.nodeEntries('1', {
            match: (node) => TextApi.isText(node) && node.text === 'new',
          })
        ).map(([, path]) => path)
      ).toEqual([[1, 0]]);
    });
  });
}

{
  jsxt;

  const suggestionPlugin = BaseSuggestionPlugin.configure({
    initialState: {
      currentUserId: 'testId',
    },
  });

  describe('BaseSuggestionPlugin.api.skipDeletes', () => {
    let editor: Editor;

    beforeEach(() => {
      editor = createEditor({
        plugins: [suggestionPlugin],
      });
    });

    describe('text nodes', () => {
      it('returns full text for node without suggestion', () => {
        const node = { text: 'hello world' };
        const result = editor
          .plugin(BaseSuggestionPlugin)
          .api.skipDeletes(node);
        expect(result).toBe('hello world');
      });

      it('returns empty string for text node with remove suggestion', () => {
        const node: SuggestionText = {
          suggestion: true,
          suggestion_1: {
            id: '1',
            createdAt: Date.now(),
            type: 'remove',
            userId: 'testId',
          },
          text: 'deleted text',
        };
        const result = editor
          .plugin(BaseSuggestionPlugin)
          .api.skipDeletes(node);
        expect(result).toBe('');
      });

      it('returns full text for text node with insert suggestion', () => {
        const node: SuggestionText = {
          suggestion: true,
          suggestion_1: {
            id: '1',
            createdAt: Date.now(),
            type: 'insert',
            userId: 'testId',
          },
          text: 'inserted text',
        };
        const result = editor
          .plugin(BaseSuggestionPlugin)
          .api.skipDeletes(node);
        expect(result).toBe('inserted text');
      });

      it('returns full text for text node with update suggestion', () => {
        const node: SuggestionText = {
          suggestion: true,
          suggestion_1: {
            id: '1',
            createdAt: Date.now(),
            type: 'update',
            userId: 'testId',
          },
          text: 'updated text',
        };
        const result = editor
          .plugin(BaseSuggestionPlugin)
          .api.skipDeletes(node);
        expect(result).toBe('updated text');
      });
    });

    describe('element nodes', () => {
      it('concatenate text from all children', () => {
        const node = {
          children: [
            { text: 'first ' },
            { text: 'second ' },
            { text: 'third' },
          ],
          type: 'paragraph',
        };
        const result = editor
          .plugin(BaseSuggestionPlugin)
          .api.skipDeletes(node);
        expect(result).toBe('first second third');
      });

      it('skip deleted text nodes in children', () => {
        const node = {
          children: [
            { text: 'keep this ' },
            {
              suggestion: true,
              suggestion_1: {
                id: '1',
                createdAt: Date.now(),
                type: 'remove',
                userId: 'testId',
              },
              text: 'delete this ',
            } as SuggestionText,
            { text: 'keep this too' },
          ],
          type: 'paragraph',
        };
        const result = editor
          .plugin(BaseSuggestionPlugin)
          .api.skipDeletes(node);
        expect(result).toBe('keep this keep this too');
      });

      it('handle nested elements', () => {
        const node = {
          children: [
            {
              children: [{ text: 'nested ' }, { text: 'text' }],
              type: 'paragraph',
            },
            {
              children: [{ text: 'another ' }, { text: 'paragraph' }],
              type: 'paragraph',
            },
          ],
          type: 'blockquote',
        };
        const result = editor
          .plugin(BaseSuggestionPlugin)
          .api.skipDeletes(node);
        expect(result).toBe('nested textanother paragraph');
      });

      it('handle deeply nested elements with mixed suggestions', () => {
        const node = {
          children: [
            {
              children: [
                {
                  children: [
                    { text: 'item 1 ' },
                    {
                      suggestion: true,
                      suggestion_1: {
                        id: '1',
                        createdAt: Date.now(),
                        type: 'remove',
                        userId: 'testId',
                      },
                      text: 'deleted ',
                    } as SuggestionText,
                    { text: 'content' },
                  ],
                  type: 'paragraph',
                },
              ],
              type: 'list-item',
            },
            {
              children: [
                {
                  children: [{ text: 'item 2' }],
                  type: 'paragraph',
                },
              ],
              type: 'list-item',
            },
          ],
          type: 'list',
        };
        const result = editor
          .plugin(BaseSuggestionPlugin)
          .api.skipDeletes(node);
        expect(result).toBe('item 1 contentitem 2');
      });

      it('handle empty children array', () => {
        const node = {
          children: [],
          type: 'paragraph',
        };
        const result = editor
          .plugin(BaseSuggestionPlugin)
          .api.skipDeletes(node);
        expect(result).toBe('');
      });

      it('handle children with only deleted text', () => {
        const node = {
          children: [
            {
              suggestion: true,
              suggestion_1: {
                id: '1',
                createdAt: Date.now(),
                type: 'remove',
                userId: 'testId',
              },
              text: 'all deleted',
            } as SuggestionText,
          ],
          type: 'paragraph',
        };
        const result = editor
          .plugin(BaseSuggestionPlugin)
          .api.skipDeletes(node);
        expect(result).toBe('');
      });
    });

    describe('edge cases', () => {
      it('handle empty text node', () => {
        const node = { text: '' };
        const result = editor
          .plugin(BaseSuggestionPlugin)
          .api.skipDeletes(node);
        expect(result).toBe('');
      });

      it('handle text node with suggestion but no suggestion data', () => {
        const node = {
          suggestion: true,
          text: 'text with suggestion flag',
        } as SuggestionText;
        const result = editor
          .plugin(BaseSuggestionPlugin)
          .api.skipDeletes(node);
        expect(result).toBe('text with suggestion flag');
      });

      it('handle multiple suggestion keys on same node', () => {
        const node: SuggestionText = {
          suggestion: true,
          suggestion_1: {
            id: '1',
            createdAt: Date.now() - 1000,
            type: 'insert',
            userId: 'user1',
          },
          suggestion_2: {
            id: '2',
            createdAt: Date.now(),
            type: 'remove',
            userId: 'user2',
          },
          text: 'multiple suggestions',
        };
        // Should use the most recent suggestion (suggestion_2 with type 'remove')
        const result = editor
          .plugin(BaseSuggestionPlugin)
          .api.skipDeletes(node);
        expect(result).toBe('');
      });
    });
  });
}

{
  jsxt;

  const suggestionPlugin = BaseSuggestionPlugin.configure({
    initialState: {
      currentUserId: 'testId',
    },
  });

  const BoldPlugin = defineBasePlugin('bold', {
    schema: {
      mark: property.boolean({ default: false, omitDefault: true }),
    },
  });

  const ItalicPlugin = defineBasePlugin('italic', {
    schema: {
      mark: property.boolean({ default: false, omitDefault: true }),
    },
  });

  describe('editor.update.suggestion.addMark', () => {
    it('add mark with suggestion data', () => {
      const input = (
        <editor>
          <hp>
            <anchor />
            test
            <focus />
          </hp>
        </editor>
      ) as any;

      const editor = createEditor({
        plugins: [suggestionPlugin, BoldPlugin, ItalicPlugin],
        selection: input.selection,
        initialValue: input.children,
      });

      editor.plugin(BaseSuggestionPlugin).store.set({ isSuggesting: true });
      editor.update.marks.add('bold', true);

      const data = editor
        .plugin(BaseSuggestionPlugin)
        .api.inlineData(
          editor.read.children()[0].children[0] as any
        ) as UpdateSuggestionData;

      expect(editor.read.children()[0].children[0].bold).toBe(true);
      expect(
        editor.read.children()[0].children[0][
          editor.plugin(BaseSuggestionPlugin).schema.key
        ]
      ).toBe(true);
      expect(data).toBeDefined();
      expect(data?.type).toBe('update');
      expect(data?.userId).toBe('testId');
      expect(data?.newProperties).toEqual({ bold: true });
      expect(typeof data?.createdAt).toBe('number');
      expect(typeof data?.id).toBe('string');
    });

    it('tracks a mark added through the semantic toggle command', () => {
      const input = (
        <editor>
          <hp>
            <anchor />
            test
            <focus />
          </hp>
        </editor>
      ) as any;
      const editor = createEditor({
        plugins: [suggestionPlugin, BoldPlugin, ItalicPlugin],
        selection: input.selection,
        initialValue: input.children,
      });

      editor.plugin(BaseSuggestionPlugin).store.set({ isSuggesting: true });
      editor.update.marks.toggle('bold', true);

      const node = editor.read.children()[0].children[0] as any;
      const data = editor
        .plugin(BaseSuggestionPlugin)
        .api.inlineData(node) as UpdateSuggestionData;

      expect(node.bold).toBe(true);
      expect(data.newProperties).toEqual({ bold: true });
    });

    it('add new suggestion mark while preserving existing suggestion mark', () => {
      const existingData = {
        id: '1',
        createdAt: Date.now(),
        newProperties: { bold: true },
        type: 'update' as const,
        userId: 'testId',
      };

      const input = (
        <editor>
          <hp>
            <htext suggestion_1={existingData} suggestion>
              te
              <anchor />
              st
              <focus />
            </htext>
          </hp>
        </editor>
      ) as any;

      const editor = createEditor({
        plugins: [suggestionPlugin, BoldPlugin, ItalicPlugin],
        selection: input.selection,
        initialValue: input.children,
      });

      editor.plugin(BaseSuggestionPlugin).store.set({ isSuggesting: true });
      editor.update.marks.add('italic', true);

      const dataList = editor
        .plugin(BaseSuggestionPlugin)
        .api.dataList(
          editor.read.children()[0].children[1] as any
        ) as UpdateSuggestionData[];

      expect(dataList).toHaveLength(2);
      expect(dataList[0]).toEqual(existingData);
      expect(dataList[1].type).toBe('update');
      expect(dataList[1].newProperties).toEqual({ italic: true });
      expect(dataList[1].id !== existingData.id).toBeTruthy();
      // expect(dataList[1].createdAt !== existingData.createdAt).toBeTruthy();
    });

    it('skips nodes already marked by a non-update suggestion', () => {
      const existingData = {
        createdAt: Date.now(),
        id: '1',
        type: 'insert',
        userId: 'testId',
      };

      const input = (
        <editor>
          <hp>
            <htext suggestion_1={existingData} suggestion>
              <anchor />
              test
              <focus />
            </htext>
          </hp>
        </editor>
      ) as any;

      const editor = createEditor({
        plugins: [suggestionPlugin, BoldPlugin, ItalicPlugin],
        selection: input.selection,
        initialValue: input.children,
      });

      editor.plugin(BaseSuggestionPlugin).store.set({ isSuggesting: true });
      editor.update.marks.add('bold', true);

      const node = editor.read.children()[0].children[0] as any;

      expect(node.bold).toBeUndefined();
      expect(editor.plugin(BaseSuggestionPlugin).api.dataList(node)).toEqual([
        existingData,
      ] as any);
    });
  });
}

{
  const suggestionPlugin = BaseSuggestionPlugin.configure({
    initialState: {
      currentUserId: 'alice',
    },
  });

  const createSuggestionText = ({
    id = 's1',
    text = '',
    type = 'insert',
  }: {
    id?: string;
    text?: string;
    type?: 'insert' | 'remove';
  } = {}): SuggestionText => {
    const suggestionKey = `suggestion_${id}` as const;
    const properties: Partial<Record<`suggestion_${string}`, SuggestionData>> =
      {};

    properties[suggestionKey] = {
      id,
      createdAt: 1,
      type,
      userId: 'alice',
    };

    return {
      ...properties,
      suggestion: true,
      text,
    };
  };

  describe('editor.update.suggestion.delete', () => {
    it('removes empty inserted block suggestions instead of converting them to remove suggestions', () => {
      const editor = createEditor({
        plugins: [suggestionPlugin],
        selection: {
          kind: 'text',
          anchor: { offset: 0, path: [0, 0] },
          focus: { offset: 0, path: [0, 0] },
        },
        initialValue: [
          {
            children: [createSuggestionText()],
            type: 'paragraph',
          },
          {
            children: [{ text: 'next' }],
            type: 'paragraph',
          },
        ],
      });

      editor.update.suggestion.delete({
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 0, path: [1, 0] },
      });

      expect(editor.read.children()).toEqual([
        {
          children: [{ text: 'next' }],
          type: 'paragraph',
        },
      ]);
    });

    it('deletes inline inserted text directly instead of wrapping it in a remove suggestion', () => {
      const editor = createEditor({
        plugins: [suggestionPlugin],
        selection: {
          kind: 'text',
          anchor: { offset: 0, path: [0, 0] },
          focus: { offset: 0, path: [0, 0] },
        },
        initialValue: [
          {
            children: [createSuggestionText({ text: 'x' })],
            type: 'paragraph',
          },
        ],
      });

      editor.update.suggestion.delete({
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 1, path: [0, 0] },
      });

      expect(editor.read.children()).toEqual([
        {
          children: [
            {
              suggestion: true,
              suggestion_s1: {
                id: 's1',
                createdAt: 1,
                type: 'insert',
                userId: 'alice',
              },
              text: '',
            },
          ],
          type: 'paragraph',
        },
      ]);
    });

    it('tracks the anchor block tail before crossing into the next block', () => {
      const editor = createEditor({
        plugins: [suggestionPlugin],
        selection: {
          kind: 'text',
          anchor: { offset: 1, path: [0, 0] },
          focus: { offset: 1, path: [0, 0] },
        },
        initialValue: [
          {
            children: [{ text: 'abc' }],
            type: 'paragraph',
          },
          {
            children: [{ text: 'def' }],
            type: 'paragraph',
          },
        ],
      });

      editor.update.suggestion.delete({
        anchor: { offset: 1, path: [0, 0] },
        focus: { offset: 1, path: [1, 0] },
      });

      const anchorTail = editor.read
        .children()[0]
        .children.find(
          (node) =>
            TextApi.isText(node) &&
            node.text === 'bc' &&
            editor.plugin(BaseSuggestionPlugin).api.inlineData(node)?.type ===
              'remove'
        );

      expect(anchorTail).toBeDefined();
    });

    it('stops cleanly when deletion would cross blocks without a previous block element', () => {
      const editor = createEditor({
        plugins: [suggestionPlugin],
        selection: {
          kind: 'text',
          anchor: { offset: 0, path: [1, 0] },
          focus: { offset: 0, path: [1, 0] },
        },
        initialValue: [
          {
            children: [{ text: 'one' }],
            type: 'paragraph',
          },
          {
            children: [{ text: 'two' }],
            type: 'paragraph',
          },
        ],
      });

      expect(() =>
        editor.update.suggestion.delete({
          anchor: { offset: 0, path: [1, 0] },
          focus: { offset: 0, path: [0, 0] },
        })
      ).not.toThrow();
    });
  });
}

{
  const suggestionPlugin = BaseSuggestionPlugin.configure({
    initialState: { currentUserId: 'user-1' },
  });

  describe('editor.update.suggestion.insertFragment', () => {
    it('rewrites fragment nodes with the active insert suggestion metadata', () => {
      const editor = createEditor({
        plugins: [suggestionPlugin],
        selection: {
          kind: 'text',
          anchor: { offset: 0, path: [0, 0] },
          focus: { offset: 0, path: [0, 0] },
        },
        initialValue: [{ children: [{ text: '' }], type: 'paragraph' }],
      });
      const suggestionApi = editor.plugin(BaseSuggestionPlugin).api;
      const fragment = [
        {
          suggestion: true,
          [suggestionApi.key('other-user')]: { id: 'other-user' },
          text: 'text',
        },
        {
          children: [{ text: '' }],
          type: 'paragraph',
        },
      ];

      editor.plugin(BaseSuggestionPlugin).store.set({ isSuggesting: true });
      editor.update.suggestion.insertFragment(fragment);

      const suggestionNodes = editor.plugin(BaseSuggestionPlugin).read.nodes();
      const inline = suggestionNodes.find(([node]) =>
        TextApi.isText(node)
      )?.[0];
      const block = suggestionNodes.find(([node]) =>
        ElementApi.isElement(node)
      )?.[0];

      expect(inline && TextApi.isText(inline)).toBe(true);
      expect(block && ElementApi.isElement(block)).toBe(true);

      const inlineData =
        inline && TextApi.isText(inline)
          ? suggestionApi.inlineData(inline)
          : undefined;
      const blockSuggestion =
        block && ElementApi.isElement(block)
          ? suggestionApi.suggestionData(block)
          : undefined;

      expect(fragment[0]).toHaveProperty(suggestionApi.key('other-user'));
      expect(inlineData).toMatchObject({
        type: 'insert',
        userId: 'user-1',
      });
      expect(blockSuggestion).toMatchObject({
        id: inlineData?.id,
        type: 'insert',
        userId: 'user-1',
      });
      expect(suggestionNodes).toHaveLength(2);
    });
  });
}

{
  jsxt;

  const suggestionPlugin = BaseSuggestionPlugin.configure({
    initialState: {
      currentUserId: 'testId',
    },
  });

  const BoldPlugin = defineBasePlugin('bold', {
    schema: {
      mark: property.boolean({ default: false, omitDefault: true }),
    },
  });

  const ItalicPlugin = defineBasePlugin('italic', {
    schema: {
      mark: property.boolean({ default: false, omitDefault: true }),
    },
  });

  describe('editor.update.suggestion.removeMark', () => {
    it('remove mark with suggestion data', () => {
      const input = (
        <editor>
          <hp>
            <htext bold>
              <anchor />
              test
              <focus />
            </htext>
          </hp>
        </editor>
      ) as any;

      const editor = createEditor({
        plugins: [suggestionPlugin, BoldPlugin, ItalicPlugin],
        selection: input.selection,
        initialValue: input.children,
      });

      editor.plugin(BaseSuggestionPlugin).store.set({ isSuggesting: true });
      editor.update.marks.remove('bold');

      const data = editor
        .plugin(BaseSuggestionPlugin)
        .api.inlineData(
          editor.read.children()[0].children[0] as any
        ) as UpdateSuggestionData;

      expect(editor.read.children()[0].children[0].bold).toBeUndefined();
      expect(
        editor.read.children()[0].children[0][
          editor.plugin(BaseSuggestionPlugin).schema.key
        ]
      ).toBe(true);
      expect(data).toBeDefined();
      expect(data?.type).toBe('update');
      expect(data?.userId).toBe('testId');
      expect(data?.properties).toEqual({ bold: true });
      expect(typeof data?.createdAt).toBe('number');
      expect(typeof data?.id).toBe('string');
    });

    it('tracks a mark removed through the semantic toggle command', () => {
      const input = (
        <editor>
          <hp>
            <htext bold>
              <anchor />
              test
              <focus />
            </htext>
          </hp>
        </editor>
      ) as any;
      const editor = createEditor({
        plugins: [suggestionPlugin, BoldPlugin, ItalicPlugin],
        selection: input.selection,
        initialValue: input.children,
      });

      editor.plugin(BaseSuggestionPlugin).store.set({ isSuggesting: true });
      editor.update.marks.toggle('bold', true);

      const node = editor.read.children()[0].children[0] as any;
      const data = editor
        .plugin(BaseSuggestionPlugin)
        .api.inlineData(node) as UpdateSuggestionData;

      expect(node.bold).toBeUndefined();
      expect(data.properties).toEqual({ bold: true });
    });

    it('add new suggestion mark while preserving existing suggestion mark', () => {
      const existingData = {
        id: '1',
        createdAt: Date.now(),
        properties: { italic: true },
        type: 'update' as const,
        userId: 'testId',
      };

      const input = (
        <editor>
          <hp>
            <htext suggestion_1={existingData} bold italic suggestion>
              te
              <anchor />
              st
              <focus />
            </htext>
          </hp>
        </editor>
      ) as any;

      const editor = createEditor({
        plugins: [suggestionPlugin, BoldPlugin, ItalicPlugin],
        selection: input.selection,
        initialValue: input.children,
      });

      editor.plugin(BaseSuggestionPlugin).store.set({ isSuggesting: true });
      editor.update.marks.remove('bold');

      const dataList = editor
        .plugin(BaseSuggestionPlugin)
        .api.dataList(
          editor.read.children()[0].children[0] as any
        ) as UpdateSuggestionData[];

      expect(dataList).toHaveLength(2);
      expect(dataList[0]).toEqual(existingData);
      expect(dataList[1].type).toBe('update');
      expect(dataList[1].properties).toEqual({ bold: true });
      expect(dataList[1].id !== existingData.id).toBeTruthy();
      // expect(dataList[1].createdAt !== existingData.createdAt).toBeTruthy();
    });

    it('skips nodes already marked by a non-update suggestion', () => {
      const existingData = {
        createdAt: Date.now(),
        id: '1',
        type: 'insert',
        userId: 'testId',
      };

      const input = (
        <editor>
          <hp>
            <htext bold suggestion_1={existingData} suggestion>
              <anchor />
              test
              <focus />
            </htext>
          </hp>
        </editor>
      ) as any;

      const editor = createEditor({
        plugins: [suggestionPlugin, BoldPlugin, ItalicPlugin],
        selection: input.selection,
        initialValue: input.children,
      });

      editor.plugin(BaseSuggestionPlugin).store.set({ isSuggesting: true });
      editor.update.marks.remove('bold');

      const node = editor.read.children()[0].children[0] as any;

      expect(node.bold).toBe(true);
      expect(editor.plugin(BaseSuggestionPlugin).api.dataList(node)).toEqual([
        existingData,
      ] as any);
    });
  });
}

// keeps each merged test source isolated.
{
  describe('editor.update.suggestion.removeNodes', () => {
    it('does nothing for an empty node list', () => {
      const editor = createEditor({
        plugins: [BaseSuggestionPlugin],
        selection: {
          kind: 'text',
          anchor: { offset: 0, path: [0, 0] },
          focus: { offset: 0, path: [0, 0] },
        },
        initialValue: [{ type: 'paragraph', children: [{ text: 'one' }] }],
      });

      editor.update.suggestion.removeNodes([]);

      expect(editor.read.children()).toEqual([
        { ...editor.read.children()[0] },
      ]);
    });

    it('reuses one removal id and timestamp across every marked node', () => {
      const editor = createEditor({
        plugins: [
          BaseSuggestionPlugin.configure({
            initialState: {
              currentUserId: 'user-1',
            },
          }),
        ],
        selection: {
          kind: 'text',
          anchor: { offset: 0, path: [0, 0] },
          focus: { offset: 0, path: [0, 0] },
        },
        initialValue: [
          { type: 'paragraph', children: [{ text: 'one' }] },
          { type: 'paragraph', children: [{ text: 'two' }] },
        ],
      });

      const nodes = [
        [editor.read.children()[0], [0]],
        [editor.read.children()[1], [1]],
      ] as any;

      editor.update.suggestion.removeNodes(nodes);

      const firstSuggestion = (editor.read.children()[0] as any).suggestion;
      const secondSuggestion = (editor.read.children()[1] as any).suggestion;

      expect(firstSuggestion).toMatchObject({
        type: 'remove',
        userId: 'user-1',
      });
      expect(secondSuggestion).toMatchObject({
        type: 'remove',
        userId: 'user-1',
      });
      expect(firstSuggestion.id).toBe(secondSuggestion.id);
      expect(firstSuggestion.createdAt).toBe(secondSuggestion.createdAt);
    });
  });
}

{
  const suggestionPlugin = BaseSuggestionPlugin.configure({
    initialState: { currentUserId: 'user-1' },
  });

  const MentionPlugin = defineBasePlugin(PLUGINS.mention, {
    schema: {
      element: {
        inline: true,
        properties: {
          label: property.string(),
          ref: property.string({ required: true }),
        },
        void: 'markable-inline',
      },
    },
  });

  describe('editor.update.suggestion.setNodes', () => {
    it('marks the selection and each inline node with shared suggestion metadata', () => {
      const editor = createEditor({
        plugins: [suggestionPlugin, MentionPlugin],
        selection: {
          kind: 'text',
          anchor: { offset: 1, path: [0, 0] },
          focus: { offset: 1, path: [0, 2] },
        },
        initialValue: [
          {
            children: [
              { text: 'ab ' },
              {
                children: [{ text: '' }],
                label: 'Ada',
                ref: 'u1',
                type: 'mention',
              },
              { text: ' cd' },
            ],
            type: 'paragraph',
          },
        ],
      });

      editor.update.suggestion.setNodes({
        createdAt: 123,
        suggestionId: 's-1',
      });

      const { children } = editor.read.children()[0];
      const markedTextNodes = children.filter(
        (node) =>
          TextApi.isText(node) &&
          editor.plugin(BaseSuggestionPlugin).api.inlineData(node)?.id === 's-1'
      );
      const mentionNode = children.find(
        (node) => 'type' in node && node.type === 'mention'
      );
      const mentionData =
        mentionNode &&
        editor.plugin(BaseSuggestionPlugin).api.inlineData(mentionNode);
      const mentionChild =
        mentionNode && ElementApi.isElement(mentionNode)
          ? mentionNode.children[0]
          : undefined;

      expect(
        markedTextNodes.map((node) =>
          TextApi.isText(node) ? node.text : undefined
        )
      ).toEqual(['b ', ' ']);
      expect(mentionData).toMatchObject({
        createdAt: 123,
        id: 's-1',
        type: 'remove',
        userId: 'user-1',
      });
      expect(
        mentionChild &&
          editor.plugin(BaseSuggestionPlugin).api.inlineData(mentionChild)
      ).toBeUndefined();
    });

    it('can skip marking outer inline elements', () => {
      const editor = createEditor({
        plugins: [suggestionPlugin, MentionPlugin],
        selection: {
          kind: 'text',
          anchor: { offset: 1, path: [0, 0] },
          focus: { offset: 2, path: [0, 0] },
        },
        initialValue: [
          {
            children: [
              { text: 'abc' },
              {
                children: [{ text: '' }],
                label: 'Ada',
                ref: 'u1',
                type: 'mention',
              },
            ],
            type: 'paragraph',
          },
        ],
      });

      editor.update.suggestion.setNodes({
        createdAt: 123,
        includeInlineElements: false,
        suggestionId: 's-1',
      });

      const { children } = editor.read.children()[0];
      const markedTextNode = children.find(
        (node) =>
          editor.plugin(BaseSuggestionPlugin).api.inlineData(node)?.id === 's-1'
      );
      const mentionNode = children.find(
        (node) => 'type' in node && node.type === 'mention'
      );

      expect(
        markedTextNode && TextApi.isText(markedTextNode)
          ? markedTextNode.text
          : undefined
      ).toBe('b');
      expect(
        mentionNode &&
          editor.plugin(BaseSuggestionPlugin).api.inlineData(mentionNode)
      ).toBeUndefined();
    });
  });
}

{
  jsxt;

  const suggestionPlugin = BaseSuggestionPlugin.configure({
    initialState: {
      currentUserId: 'testId',
    },
  });

  const testLineBreakDataInsert = {
    id: '1',
    createdAt: Date.now(),
    isLineBreak: true,
    type: 'insert',
    userId: 'testId',
  };

  const testLineBreakDataRemove = {
    id: '2',
    createdAt: Date.now(),
    type: 'remove',
    userId: 'testId',
  };

  describe('insertBreakSuggestion when isSuggesting is true', () => {
    it('tracks inserted nodes without requiring the slash input plugin', () => {
      const editor = createEditor({
        plugins: [suggestionPlugin],
        initialValue: [{ children: [{ text: 'one' }], type: 'paragraph' }],
      });

      editor.plugin(BaseSuggestionPlugin).store.set({ isSuggesting: true });
      editor.update.nodes.insert({
        children: [{ text: 'two' }],
        type: 'paragraph',
      });

      expect(editor.read.children().at(1)).toMatchObject({
        suggestion: { type: 'insert', userId: 'testId' },
      });
    });

    it('add insertBreakData and split node', () => {
      const input = (
        <editor>
          <hp>
            test1
            <cursor />
            test2
          </hp>
        </editor>
      ) as any;

      const editor = createEditor({
        plugins: [suggestionPlugin],
        selection: input.selection,
        initialValue: input.children,
      });

      editor.plugin(BaseSuggestionPlugin).store.set({ isSuggesting: true });

      editor.update.break.insert();

      const data = editor.read.children()[0][
        BaseSuggestionPlugin.name
      ] as SuggestionData;

      expect(editor.read.children()).toHaveLength(2);
      expect(data).toBeDefined();
      expect(data.id).toBeDefined();
      expect(data.createdAt).toBeDefined();
      expect(data.type).toBe('insert');
      expect(data.userId).toBe('testId');
    });

    it('does not add new suggestion id if the previous node is a line break', () => {
      const input = (
        <editor>
          <hp suggestion={testLineBreakDataInsert}>test1</hp>
          <hp>
            <cursor />
            test2
          </hp>
        </editor>
      ) as any;

      const editor = createEditor({
        plugins: [suggestionPlugin],
        selection: input.selection,
        initialValue: input.children,
      });

      editor.plugin(BaseSuggestionPlugin).store.set({ isSuggesting: true });

      editor.update.text.insert('1');

      const data = editor
        .plugin(BaseSuggestionPlugin)
        .api.inlineData(editor.read.children()[1].children[0] as any);

      expect(data).toBeDefined();
      expect(data?.id === testLineBreakDataInsert.id).toBeTruthy();
      expect(
        data?.createdAt === testLineBreakDataInsert.createdAt
      ).toBeTruthy();
      expect(data?.type === testLineBreakDataInsert.type).toBeTruthy();
      expect(data?.userId === testLineBreakDataInsert.userId).toBeTruthy();
    });

    it('remove the lineBreak when type is insert', () => {
      const input = (
        <editor>
          <hp suggestion={testLineBreakDataInsert}>test1</hp>
          <hp>
            <cursor />
            test2
          </hp>
        </editor>
      ) as any;

      const output = (
        <editor>
          <hp>
            test1
            <cursor />
            test2
          </hp>
        </editor>
      ) as any;

      const editor = createEditor({
        plugins: [suggestionPlugin],
        selection: input.selection,
        initialValue: input.children,
      });

      editor.plugin(BaseSuggestionPlugin).store.set({ isSuggesting: true });

      editor.update.text.deleteBackward();

      expect(editor.read.children()).toEqual(output.children);
    });

    it('does not remove the lineBreak when type is remove', () => {
      const input = (
        <editor>
          <hp suggestion={testLineBreakDataRemove}>test1</hp>
          <hp>
            <cursor />
            test2
          </hp>
        </editor>
      ) as any;

      const output = (
        <editor>
          <hp suggestion={testLineBreakDataRemove}>
            test1
            <cursor />
          </hp>
          <hp>test2</hp>
        </editor>
      ) as any;

      const editor = createEditor({
        plugins: [suggestionPlugin],
        selection: input.selection,
        initialValue: input.children,
      });

      editor.plugin(BaseSuggestionPlugin).store.set({ isSuggesting: true });

      editor.update.text.deleteBackward();

      expect(editor.read.children()).toEqual(output.children);
    });

    it('reuses the same suggestion id when removing across blocks', () => {
      const input = (
        <editor>
          <hp>test1</hp>
          <hp>
            test2
            <cursor />
          </hp>
        </editor>
      ) as any;

      const editor = createEditor({
        plugins: [suggestionPlugin],
        selection: input.selection,
        initialValue: input.children,
      });

      editor.plugin(BaseSuggestionPlugin).store.set({ isSuggesting: true });

      editor.update.text.deleteBackward({ unit: 'line' });
      editor.update.text.deleteBackward({ unit: 'character' });

      const firstBlock = editor.read.children()[0];
      const lineBreakData = editor
        .plugin(BaseSuggestionPlugin)
        .api.isBlockSuggestion(firstBlock)
        ? firstBlock.suggestion
        : undefined;

      const suggestionTextData = editor
        .plugin(BaseSuggestionPlugin)
        .api.inlineData(editor.read.children()[1].children[0] as any);

      expect(lineBreakData).toBeDefined();
      expect(suggestionTextData).toBeDefined();
      expect(lineBreakData?.id === suggestionTextData?.id).toBeTruthy();
      expect(editor.read.children()[1].children[0].text).toBe('test2');
    });
  });

  describe('insertBreakSuggestion when isSuggesting is false', () => {
    it('remove the lineBreak when type is insert', () => {
      const input = (
        <editor>
          <hp suggestion={testLineBreakDataInsert}>test1</hp>
          <hp>
            <cursor />
            test2
          </hp>
        </editor>
      ) as any;

      const output = (
        <editor>
          <hp>
            test1
            <cursor />
            test2
          </hp>
        </editor>
      ) as any;

      const editor = createEditor({
        plugins: [suggestionPlugin],
        selection: input.selection,
        initialValue: input.children,
      });

      editor.plugin(BaseSuggestionPlugin).store.set({ isSuggesting: false });

      editor.update.text.deleteBackward();

      expect(editor.read.children()).toEqual(output.children);
    });

    it('remove the lineBreak when type is remove', () => {
      const input = (
        <editor>
          <hp suggestion={testLineBreakDataRemove}>test1</hp>
          <hp>
            <cursor />
            test2
          </hp>
        </editor>
      ) as any;

      const output = (
        <editor>
          <hp>
            test1
            <cursor />
            test2
          </hp>
        </editor>
      ) as any;

      const editor = createEditor({
        plugins: [suggestionPlugin],
        selection: input.selection,
        initialValue: input.children,
      });

      editor.plugin(BaseSuggestionPlugin).store.set({ isSuggesting: false });

      editor.update.text.deleteBackward();

      expect(editor.read.children()).toEqual(output.children);
    });
  });
}

{
  jsxt;

  const suggestionPlugin = BaseSuggestionPlugin.configure({
    initialState: {
      currentUserId: 'testId',
    },
  });

  const BoldPlugin = defineBasePlugin('bold', {
    schema: {
      mark: property.boolean({ default: false, omitDefault: true }),
    },
  });

  describe('editor.update.suggestion.accept', () => {
    it('accept insert suggestion', () => {
      const insertData = {
        id: '1',
        createdAt: Date.now(),
        type: 'insert',
        userId: 'testId',
      };

      const input = (
        <editor>
          <hp>
            test
            <htext suggestion_1={insertData} suggestion>
              inserted
            </htext>
            text
          </hp>
        </editor>
      ) as any;

      const output = (
        <editor>
          <hp>testinsertedtext</hp>
        </editor>
      ) as any;

      const editor = createEditor({
        plugins: [suggestionPlugin, BoldPlugin],
        initialValue: input.children,
      });

      editor.update.suggestion.accept({
        keyId: 'suggestion_1',
        suggestionId: '1',
      } as any);

      expect(editor.read.children()).toEqual(output.children);
    });

    it('accept remove suggestion', () => {
      const removeData = {
        id: '1',
        createdAt: Date.now(),
        type: 'remove',
        userId: 'testId',
      };

      const input = (
        <editor>
          <hp>
            test
            <htext suggestion_1={removeData} suggestion>
              removed
            </htext>
            text
          </hp>
        </editor>
      ) as any;

      const output = (
        <editor>
          <hp>testtext</hp>
        </editor>
      ) as any;

      const editor = createEditor({
        plugins: [suggestionPlugin],
        initialValue: input.children,
      });

      editor.update.suggestion.accept({
        keyId: 'suggestion_1',
        suggestionId: '1',
      } as any);

      expect(editor.read.children()).toEqual(output.children);
    });

    it('accept update suggestion', () => {
      const updateData = {
        id: '1',
        createdAt: Date.now(),
        newProperties: {
          bold: true,
        },
        type: 'update',
        userId: 'testId',
      };

      const input = (
        <editor>
          <hp>
            test
            <htext suggestion_1={updateData} bold suggestion>
              updated
            </htext>
            text
          </hp>
        </editor>
      ) as any;

      const output = (
        <editor>
          <hp>
            test
            <htext bold>updated</htext>
            text
          </hp>
        </editor>
      ) as any;

      const editor = createEditor({
        plugins: [suggestionPlugin, BoldPlugin],
        initialValue: input.children,
      });

      editor.update.suggestion.accept({
        keyId: 'suggestion_1',
        suggestionId: '1',
      } as any);

      expect(editor.read.children()).toEqual(output.children);
    });

    it('accept line break suggestion', () => {
      const lineBreakData = {
        id: '1',
        createdAt: Date.now(),
        isLineBreak: true,
        type: 'insert',
        userId: 'testId',
      };

      const input = (
        <editor>
          <hp suggestion={lineBreakData}>test1</hp>
          <hp>test2</hp>
        </editor>
      ) as any;

      const output = (
        <editor>
          <hp>test1</hp>
          <hp>test2</hp>
        </editor>
      ) as any;

      const editor = createEditor({
        plugins: [suggestionPlugin],
        initialValue: input.children,
      });

      editor.update.suggestion.accept({
        keyId: 'suggestion_1',
        suggestionId: '1',
      } as any);

      expect(editor.read.children()).toEqual(output.children);
    });

    it('merge nodes when accepting line break remove suggestion', () => {
      const lineBreakData = {
        id: '1',
        createdAt: Date.now(),
        isLineBreak: true,
        type: 'remove',
        userId: 'testId',
      };

      const input = (
        <editor>
          <hp suggestion={lineBreakData}>test1</hp>
          <hp>test2</hp>
        </editor>
      ) as any;

      const output = (
        <editor>
          <hp>test1test2</hp>
        </editor>
      ) as any;

      const editor = createEditor({
        plugins: [suggestionPlugin],
        initialValue: input.children,
      });

      editor.update.suggestion.accept({
        keyId: 'suggestion_1',
        suggestionId: '1',
      } as any);

      expect(editor.read.children()).toEqual(output.children);
    });

    it('merges paragraphs after deleteBackward creates a remove line break suggestion', () => {
      const editor = createEditor({
        plugins: [suggestionPlugin],
        selection: {
          kind: 'text',
          anchor: { offset: 0, path: [1, 0] },
          focus: { offset: 0, path: [1, 0] },
        },
        initialValue: [
          { type: 'paragraph', children: [{ text: 'test1' }] },
          { type: 'paragraph', children: [{ text: 'test2' }] },
        ],
      });

      editor.plugin(BaseSuggestionPlugin).store.set({ isSuggesting: true });

      editor.update.text.deleteBackward({ unit: 'character' });

      const lineBreakData = (editor.read.children()[0] as any).suggestion;

      editor.update.suggestion.accept({
        keyId: editor.plugin(BaseSuggestionPlugin).api.key(lineBreakData.id),
        suggestionId: lineBreakData.id,
      } as any);

      expect(editor.read.children()).toEqual(
        (
          <editor>
            <hp>test1test2</hp>
          </editor>
        ).children
      );
    });

    it('accept node with both remove and insert suggestions', () => {
      const time = Date.now();

      const removeData = {
        id: '1',
        createdAt: time,
        type: 'remove',
        userId: 'testId',
      };

      const insertData = {
        id: '1',
        createdAt: time,
        type: 'insert',
        userId: 'testId',
      };

      const input = (
        <editor>
          <hp>
            test
            <htext suggestion_1={removeData} suggestion>
              removed
            </htext>
            <htext suggestion_1={insertData} suggestion>
              inserted
            </htext>
            text
          </hp>
        </editor>
      ) as any;

      const output = (
        <editor>
          <hp>testinsertedtext</hp>
        </editor>
      ) as any;

      const editor = createEditor({
        plugins: [suggestionPlugin],
        initialValue: input.children,
      });

      // Accept should replace the remove suggestion with the insert suggestion
      editor.update.suggestion.accept({
        keyId: 'suggestion_1',
        suggestionId: '1',
      } as any);

      expect(editor.read.children()).toEqual(output.children);
    });

    it('accept remove nodes', () => {
      const removeData = {
        id: '1',
        createdAt: Date.now(),
        type: 'remove',
        userId: 'testId',
      };

      const input = (
        <editor>
          <hp suggestion={removeData}>test1</hp>
          <hp>test2</hp>
        </editor>
      ) as any;

      const output = (
        <editor>
          <hp>test2</hp>
        </editor>
      ) as any;

      const editor = createEditor({
        plugins: [suggestionPlugin],
        initialValue: input.children,
      });

      editor.update.suggestion.accept({
        keyId: 'suggestion_1',
        suggestionId: '1',
      } as any);

      expect(editor.read.children()).toEqual(output.children);
    });

    it('accept insert nodes', () => {
      const insertData = {
        id: '1',
        createdAt: Date.now(),
        type: 'insert',
        userId: 'testId',
      };

      const input = (
        <editor>
          <hp>test1</hp>
          <hp suggestion={insertData}>test2</hp>
        </editor>
      ) as any;

      const output = (
        <editor>
          <hp>test1</hp>
          <hp>test2</hp>
        </editor>
      ) as any;

      const editor = createEditor({
        plugins: [suggestionPlugin],
        initialValue: input.children,
      });

      editor.update.suggestion.accept({
        keyId: 'suggestion_1',
        suggestionId: '1',
      } as any);

      expect(editor.read.children()).toEqual(output.children);
    });
  });
}

{
  jsxt;

  const suggestionPlugin = BaseSuggestionPlugin.configure({
    initialState: {
      currentUserId: 'testId',
    },
  });

  const BoldPlugin = defineBasePlugin('bold', {
    schema: {
      mark: property.boolean({ default: false, omitDefault: true }),
    },
  });

  const ItalicPlugin = defineBasePlugin('italic', {
    schema: {
      mark: property.boolean({ default: false, omitDefault: true }),
    },
  });

  const ExplicitFalseItalicPlugin = defineBasePlugin('italic', {
    schema: {
      mark: property.boolean({ default: true, omitDefault: true }),
    },
  });

  describe('editor.update.suggestion.reject', () => {
    it('reject insert suggestion', () => {
      const insertData = {
        id: '1',
        createdAt: Date.now(),
        type: 'insert',
        userId: 'testId',
      };

      const input = (
        <editor>
          <hp>
            test
            <htext suggestion_1={insertData} suggestion>
              inserted
            </htext>
            text
          </hp>
        </editor>
      ) as any;

      const output = (
        <editor>
          <hp>testtext</hp>
        </editor>
      ) as any;

      const editor = createEditor({
        plugins: [suggestionPlugin, BoldPlugin, ItalicPlugin],
        initialValue: input.children,
      });

      editor.update.suggestion.reject({
        keyId: 'suggestion_1',
        suggestionId: '1',
      } as any);

      expect(editor.read.children()).toEqual(output.children);
    });

    it('reject remove suggestion', () => {
      const removeData = {
        id: '1',
        createdAt: Date.now(),
        type: 'remove',
        userId: 'testId',
      };

      const input = (
        <editor>
          <hp>
            test
            <htext suggestion_1={removeData} suggestion>
              removed
            </htext>
            text
          </hp>
        </editor>
      ) as any;

      const output = (
        <editor>
          <hp>testremovedtext</hp>
        </editor>
      ) as any;

      const editor = createEditor({
        plugins: [suggestionPlugin, BoldPlugin, ItalicPlugin],
        initialValue: input.children,
      });

      editor.update.suggestion.reject({
        keyId: 'suggestion_1',
        suggestionId: '1',
      } as any);

      expect(editor.read.children()).toEqual(output.children);
    });

    it('reject update suggestion', () => {
      const updateData = {
        id: '1',
        createdAt: Date.now(),
        newProperties: {
          bold: true,
        },
        type: 'update',
        userId: 'testId',
      };

      const input = (
        <editor>
          <hp>
            test
            <htext suggestion_1={updateData} bold suggestion>
              updated
            </htext>
            text
          </hp>
        </editor>
      ) as any;

      const output = (
        <editor>
          <hp>testupdatedtext</hp>
        </editor>
      ) as any;

      const editor = createEditor({
        plugins: [suggestionPlugin, BoldPlugin, ItalicPlugin],
        initialValue: input.children,
      });

      editor.update.suggestion.reject({
        keyId: 'suggestion_1',
        suggestionId: '1',
      } as any);

      expect(editor.read.children()).toEqual(output.children);
    });

    it('restores falsy previous properties from update suggestions', () => {
      const updateData = {
        createdAt: Date.now(),
        id: '1',
        properties: {
          italic: false,
        },
        type: 'update',
        userId: 'testId',
      };

      const input = (
        <editor>
          <hp>
            test
            <htext suggestion_1={updateData} suggestion>
              updated
            </htext>
            text
          </hp>
        </editor>
      ) as any;

      const editor = createEditor({
        plugins: [suggestionPlugin, BoldPlugin, ExplicitFalseItalicPlugin],
        initialValue: input.children,
      });

      editor.update.suggestion.reject({
        keyId: 'suggestion_1',
        suggestionId: '1',
      } as any);

      expect(editor.read.children()).toEqual([
        {
          children: [
            { text: 'test' },
            { italic: false, text: 'updated' },
            { text: 'text' },
          ],
          type: 'paragraph',
        },
      ]);
    });

    it('reject line break suggestion', () => {
      const lineBreakData = {
        id: '1',
        createdAt: Date.now(),
        isLineBreak: true,
        type: 'insert',
        userId: 'testId',
      };

      const input = (
        <editor>
          <hp suggestion={lineBreakData}>test1</hp>
          <hp>test2</hp>
        </editor>
      ) as any;

      const output = (
        <editor>
          <hp>test1test2</hp>
        </editor>
      ) as any;

      const editor = createEditor({
        plugins: [suggestionPlugin],
        initialValue: input.children,
      });

      editor.update.suggestion.reject({
        keyId: 'suggestion_1',
        suggestionId: '1',
      } as any);

      expect(editor.read.children()).toEqual(output.children);
    });

    it('merge nodes when rejecting line break insert suggestion', () => {
      const lineBreakData = {
        id: '1',
        createdAt: Date.now(),
        isLineBreak: true,
        type: 'insert',
        userId: 'testId',
      };

      const input = (
        <editor>
          <hp suggestion={lineBreakData}>test1</hp>
          <hp>test2</hp>
        </editor>
      ) as any;

      const output = (
        <editor>
          <hp>test1test2</hp>
        </editor>
      ) as any;

      const editor = createEditor({
        plugins: [suggestionPlugin],
        initialValue: input.children,
      });

      editor.update.suggestion.reject({
        keyId: 'suggestion_1',
        suggestionId: '1',
      } as any);

      expect(editor.read.children()).toEqual(output.children);
    });

    it('reject node with both remove and insert suggestions', () => {
      const time = Date.now();

      const removeData = {
        id: '1',
        createdAt: time,
        type: 'remove',
        userId: 'testId',
      };

      const insertData = {
        id: '1',
        createdAt: time,
        type: 'insert',
        userId: 'testId',
      };

      const input = (
        <editor>
          <hp>
            test
            <htext suggestion_1={removeData} suggestion>
              removed
            </htext>
            <htext suggestion_1={insertData} suggestion>
              inserted
            </htext>
            text
          </hp>
        </editor>
      ) as any;

      const output = (
        <editor>
          <hp>testremovedtext</hp>
        </editor>
      ) as any;

      const editor = createEditor({
        plugins: [suggestionPlugin],
        initialValue: input.children,
      });

      // Reject should keep the remove suggestion and remove the insert suggestion
      editor.update.suggestion.reject({
        keyId: 'suggestion_1',
        suggestionId: '1',
      } as any);

      expect(editor.read.children()).toEqual(output.children);
    });

    it('reject remove nodes', () => {
      const removeData = {
        id: '1',
        createdAt: Date.now(),
        type: 'remove',
        userId: 'testId',
      };

      const input = (
        <editor>
          <hp suggestion={removeData}>test1</hp>
          <hp>test2</hp>
        </editor>
      ) as any;

      const output = (
        <editor>
          <hp>test1</hp>
          <hp>test2</hp>
        </editor>
      ) as any;

      const editor = createEditor({
        plugins: [suggestionPlugin],
        initialValue: input.children,
      });

      editor.update.suggestion.reject({
        keyId: 'suggestion_1',
        suggestionId: '1',
      } as any);

      expect(editor.read.children()).toEqual(output.children);
    });

    it('reject insert nodes', () => {
      const insertData = {
        id: '1',
        createdAt: Date.now(),
        type: 'insert',
        userId: 'testId',
      };

      const input = (
        <editor>
          <hp>test1</hp>
          <hp suggestion={insertData}>test2</hp>
        </editor>
      ) as any;

      const output = (
        <editor>
          <hp>test1</hp>
        </editor>
      ) as any;

      const editor = createEditor({
        plugins: [suggestionPlugin],
        initialValue: input.children,
      });

      editor.update.suggestion.reject({
        keyId: 'suggestion_1',
        suggestionId: '1',
      } as any);

      expect(editor.read.children()).toEqual(output.children);
    });
  });
}

{
  const SuggestionTargetPlugin = defineBasePlugin('suggestionTarget', {
    schema: {
      element: {
        content: schema.content.text({ default: 'text', min: 1 }),
      },
    },
  });

  const InlineSuggestionTargetPlugin = defineBasePlugin(
    'inlineSuggestionTarget',
    {
      schema: {
        element: {
          content: schema.content.text({ default: 'text', min: 1 }),
          inline: true,
        },
      },
    }
  );

  describe('BaseSuggestionPlugin', () => {
    const inlineSuggestion = {
      createdAt: 1,
      id: 'inline',
      type: 'insert' as const,
      userId: 'alice',
    };
    const blockSuggestion = {
      createdAt: 2,
      id: 'block',
      type: 'remove' as const,
      userId: 'alice',
    };

    const createTestEditor = () =>
      createEditor({
        plugins: [
          BaseParagraphPlugin,
          SuggestionTargetPlugin,
          InlineSuggestionTargetPlugin,
          BaseSuggestionPlugin,
        ],
        initialValue: [
          {
            children: [
              {
                suggestion: true,
                suggestion_inline: inlineSuggestion,
                text: 'inline',
              },
            ],
            type: 'paragraph',
          },
          {
            children: [{ text: 'block' }],
            suggestion: blockSuggestion,
            type: 'paragraph',
          },
          {
            children: [
              {
                [SUGGESTION_TRANSIENT_KEY]: true,
                suggestion: true,
                suggestion_transient: {
                  createdAt: 3,
                  id: 'transient',
                  type: 'insert' as const,
                  userId: 'alice',
                },
                text: 'transient',
              },
            ],
            type: 'paragraph',
          },
        ],
      } as any);

    it('canonicalizes false base suggestion marks to the absent default', () => {
      const editor = createTestEditor();

      expect(
        editor.read.schema.fitDocument({
          children: [
            {
              children: [{ suggestion: false, text: 'plain' }],
              type: 'paragraph',
            },
          ],
        })
      ).toEqual({
        children: [{ children: [{ text: 'plain' }], type: 'paragraph' }],
      });
    });

    it('compiles suggestion placement, namespace, lifecycle, and merge laws', () => {
      const editor = createTestEditor();
      const paragraph = { children: [{ text: '' }], type: 'paragraph' };
      const replacement = {
        createdAt: 4,
        id: 'replacement',
        type: 'remove' as const,
        userId: 'alice',
      };

      expect(
        editor.read.schema.property({
          key: 'suggestion',
          placement: 'element',
          type: 'paragraph',
        })
      ).toMatchObject({ value: { kind: 'json' } });
      expect(
        editor.read.schema.property({
          key: 'suggestion_any',
          placement: 'element',
          type: 'paragraph',
        })
      ).toBeNull();
      expect(
        editor.read.schema.property({
          key: 'suggestion',
          placement: 'element',
          type: editor.plugin(InlineSuggestionTargetPlugin).schema.type,
        })
      ).toMatchObject({ value: { kind: 'boolean' } });
      expect(
        editor.read.schema.property({
          key: 'suggestion_any',
          placement: 'element',
          type: editor.plugin(InlineSuggestionTargetPlugin).schema.type,
        })
      ).toMatchObject({ value: { kind: 'json' } });
      expect(
        editor.read.schema.property({
          key: 'suggestion',
          placement: 'text',
          type: 'paragraph',
        })
      ).toMatchObject({
        lifecycle: {
          split: 'preserve',
          typeChange: 'preserve-if-allowed',
        },
        merge: 'replace',
        value: { kind: 'boolean' },
      });
      expect(
        editor.read.schema.property({
          key: 'suggestion_any',
          placement: 'text',
          type: 'paragraph',
        })
      ).toMatchObject({
        lifecycle: {
          split: 'preserve',
          typeChange: 'preserve-if-allowed',
        },
        merge: 'replace',
        value: { kind: 'json' },
      });
      expect(
        editor.read.schema.property({
          key: SUGGESTION_TRANSIENT_KEY,
          placement: 'text',
          type: 'paragraph',
        })
      ).toMatchObject({ value: { kind: 'boolean' } });
      expect(
        editor.read.schema.property({
          key: 'suggestion_any',
          placement: 'text',
          type: paragraph.type,
        })
      ).not.toBeNull();
      expect(
        editor.read.schema.property({
          key: 'suggestion_any',
          placement: 'text',
          type: 'missing',
        })
      ).toBeNull();
      expect(
        editor.read.schema.property({
          key: 'suggestion_any',
          placement: 'element',
          type: editor.plugin(InlineSuggestionTargetPlugin).schema.type,
        })?.role
      ).toBe('content');

      editor.update.nodes.set({ type: 'suggestionTarget' }, { at: [0] });

      expect(editor.read.nodes.get([0, 0])?.[0]).toMatchObject({
        suggestion: true,
        suggestion_inline: inlineSuggestion,
        text: 'inline',
      });

      editor.update.selection.set({
        kind: 'text',
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 6, path: [0, 0] },
      });
      editor.update.marks.add('suggestion_inline', replacement);

      expect(editor.read.nodes.get([0, 0])?.[0]).toMatchObject({
        suggestion_inline: replacement,
      });
    });

    it('validates block and inline suggestion payloads', () => {
      const editor = createTestEditor();
      const block = editor.read.schema.property({
        key: 'suggestion',
        placement: 'element',
        type: 'paragraph',
      })?.value.validate;
      const inline = editor.read.schema.property({
        key: 'suggestion_any',
        placement: 'text',
        type: 'paragraph',
      })?.value.validate;

      expect(block?.(blockSuggestion)).toBe(true);
      expect(block?.({ ...blockSuggestion, createdAt: 'invalid' })).toBe(false);
      expect(inline?.(inlineSuggestion)).toBe(true);
      expect(inline?.({ ...inlineSuggestion, userId: null })).toBe(false);
    });

    it('finds inline and block suggestion nodes by id', () => {
      const editor = createTestEditor();
      const { read } = editor.plugin(BaseSuggestionPlugin);

      expect(read.node({ at: [], id: 'inline', isText: true })?.[1]).toEqual([
        0, 0,
      ]);
      expect(read.node({ at: [], id: 'block' })?.[1]).toEqual([1]);
    });

    it('returns suggestion ids for inline and block nodes', () => {
      const editor = createTestEditor();
      const { api } = editor.plugin(BaseSuggestionPlugin);

      expect(api.id(editor.read.children()[0].children[0] as any)).toBe(
        'inline'
      );
      expect(api.id(editor.read.children()[1] as any)).toBe('block');
      expect(
        api.id({
          children: [{ text: '' }],
          suggestion: null,
          type: 'paragraph',
        } as any)
      ).toBeUndefined();
    });

    it('filters transient suggestion nodes when requested', () => {
      const editor = createTestEditor();
      const { read } = editor.plugin(BaseSuggestionPlugin);

      expect(read.nodes({ transient: true }).map(([, path]) => path)).toEqual([
        [2, 0],
      ]);
    });

    it('returns suggestion data', () => {
      const editor = createTestEditor();
      const { api } = editor.plugin(BaseSuggestionPlugin);

      expect(
        api.suggestionData(editor.read.children()[0].children[0] as any)
      ).toEqual(inlineSuggestion);
      expect(api.suggestionData(editor.read.children()[1] as any)).toEqual(
        blockSuggestion
      );
    });

    it('bypasses suggestion tracking with the skip policy', () => {
      const editor = createEditor({
        plugins: [BaseParagraphPlugin, BaseSuggestionPlugin],
        initialValue: [{ children: [{ text: 'plain' }], type: 'paragraph' }],
      } as any);

      editor.plugin(BaseSuggestionPlugin).store.set({ isSuggesting: true });
      editor.update.selection.set({ offset: 5, path: [0, 0] });
      editor.update(SuggestionUpdatePolicy.skip).text.insert('!');

      expect(editor.read.children()[0].children).toEqual([{ text: 'plain!' }]);
      expect(Object.isFrozen(SuggestionUpdatePolicy)).toBe(true);
      expect(Object.isFrozen(SuggestionUpdatePolicy.skip)).toBe(true);
      expect(Object.isFrozen(SuggestionUpdatePolicy.skip.tags)).toBe(true);
    });

    it('disables suggestion tracking without a current user', () => {
      const editor = createEditor({
        plugins: [
          BaseParagraphPlugin,
          BaseSuggestionPlugin.configure({
            initialState: {
              currentUserId: null,
              isSuggesting: true,
            },
          }),
        ],
        initialValue: [{ children: [{ text: 'plain' }], type: 'paragraph' }],
      } as any);
      const suggestion = editor.plugin(BaseSuggestionPlugin);

      expect(suggestion.api.isTracking([])).toBe(false);
      expect(
        suggestion.api.getProps(
          { text: 'inserted' },
          { id: 'suggestion-1', createdAt: 1 }
        )
      ).toEqual({});
      expect(
        suggestion.api.createFragment(
          [{ children: [{ text: 'inserted' }], type: 'paragraph' }],
          { id: 'suggestion-1', createdAt: 1 }
        )
      ).toEqual([{ children: [{ text: 'inserted' }], type: 'paragraph' }]);

      editor.update.selection.set({ offset: 5, path: [0, 0] });
      editor.update.text.insert('!');

      expect(editor.read.children()[0].children).toEqual([{ text: 'plain!' }]);

      const value = structuredClone(editor.read.children());

      suggestion.update.addMark('bold', true);
      suggestion.update.delete({
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 1, path: [0, 0] },
      });
      suggestion.update.insertFragment([{ text: '?' }]);
      suggestion.update.insertText('?');
      suggestion.update.removeMark('bold');
      suggestion.update.setNodes();

      expect(editor.read.children()).toEqual(value);
    });
  });
}

{
  const DiffMetadataPlugin = defineBasePlugin('diffMetadata', {
    schema: {
      properties: {
        identity: schema.elementProperty('blockId', property.string(), {
          role: 'metadata',
          target: target.group('element'),
        }),
      },
    },
  });
  const createSuggestionEditor = () =>
    createEditor({
      plugins: [
        BaseParagraphPlugin,
        DiffMetadataPlugin,
        BaseSuggestionPlugin.configure({
          initialState: {
            currentUserId: 'user-1',
          },
        }),
      ],
    });

  describe('diffToSuggestions', () => {
    it('ignores schema metadata through its physical property key', () => {
      const editor = createSuggestionEditor();
      const value = editor.plugin(BaseSuggestionPlugin).api.diff(
        [
          {
            blockId: 'before',
            children: [{ text: 'same' }],
            type: 'paragraph',
          },
        ],
        [
          {
            blockId: 'after',
            children: [{ text: 'same' }],
            type: 'paragraph',
          },
        ]
      );

      expect(value).toEqual([
        {
          blockId: 'after',
          children: [{ text: 'same' }],
          type: 'paragraph',
        },
      ]);
    });

    it('marks inserted text and leaves untouched text alone', () => {
      const editor = createSuggestionEditor();

      const value = editor
        .plugin(BaseSuggestionPlugin)
        .api.diff(
          [{ type: 'paragraph', children: [{ text: 'a' }] }],
          [{ type: 'paragraph', children: [{ text: 'ab' }] }]
        );

      expect(value[0].children).toHaveLength(2);
      expect(value[0].children[0]).toEqual({ text: 'a' });
      expect(value[0].children[1]).toMatchObject({
        suggestion: true,
        text: 'b',
      });
      expect(
        editor
          .plugin(BaseSuggestionPlugin)
          .api.inlineData(value[0].children[1] as any)
      ).toMatchObject({
        type: 'insert',
        userId: 'user-1',
      });
    });

    it('reuses the same id and timestamp for adjacent remove and insert replacements', () => {
      const editor = createSuggestionEditor();

      const value = editor
        .plugin(BaseSuggestionPlugin)
        .api.diff(
          [{ type: 'paragraph', children: [{ text: 'ab' }] }],
          [{ type: 'paragraph', children: [{ text: 'ac' }] }]
        );

      const removed = value[0].children[1];
      const inserted = value[0].children[2];
      const removedData = editor
        .plugin(BaseSuggestionPlugin)
        .api.inlineData(removed as any)!;
      const insertedData = editor
        .plugin(BaseSuggestionPlugin)
        .api.inlineData(inserted as any)!;

      expect(removed).toMatchObject({ suggestion: true, text: 'b' });
      expect(inserted).toMatchObject({ suggestion: true, text: 'c' });
      expect(removedData.type).toBe('remove');
      expect(insertedData.type).toBe('insert');
      expect(insertedData.id).toBe(removedData.id);
      expect(insertedData.createdAt).toBe(removedData.createdAt);
    });

    it('recursively traverses nested element children', () => {
      const editor = createSuggestionEditor();

      const value = editor.plugin(BaseSuggestionPlugin).api.diff(
        [
          {
            type: 'blockquote',
            children: [{ type: 'paragraph', children: [{ text: 'a' }] }],
          },
        ],
        [
          {
            type: 'blockquote',
            children: [{ type: 'paragraph', children: [{ text: 'ab' }] }],
          },
        ]
      );

      const inserted = (value[0] as any).children[0].children[1];

      expect(inserted).toMatchObject({
        suggestion: true,
        text: 'b',
      });
      expect(
        editor.plugin(BaseSuggestionPlugin).api.inlineData(inserted)
      ).toMatchObject({
        type: 'insert',
        userId: 'user-1',
      });
    });

    it('keeps separate replacement groups distinct when they are not adjacent', () => {
      const editor = createSuggestionEditor();

      const value = editor.plugin(BaseSuggestionPlugin).api.diff(
        [
          { type: 'paragraph', children: [{ text: 'ab' }] },
          { type: 'paragraph', children: [{ text: 'cd' }] },
        ],
        [
          { type: 'paragraph', children: [{ text: 'ac' }] },
          { type: 'paragraph', children: [{ text: 'ce' }] },
        ]
      );

      const firstRemovedData = editor
        .plugin(BaseSuggestionPlugin)
        .api.inlineData(value[0].children[1] as any)!;
      const firstInsertedData = editor
        .plugin(BaseSuggestionPlugin)
        .api.inlineData(value[0].children[2] as any)!;
      const secondRemovedData = editor
        .plugin(BaseSuggestionPlugin)
        .api.inlineData(value[1].children[1] as any)!;
      const secondInsertedData = editor
        .plugin(BaseSuggestionPlugin)
        .api.inlineData(value[1].children[2] as any)!;

      expect(firstInsertedData.id).toBe(firstRemovedData.id);
      expect(secondInsertedData.id).toBe(secondRemovedData.id);
      expect(firstInsertedData.id).not.toBe(secondInsertedData.id);
    });
  });
}
