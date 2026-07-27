/** @jsx jsxt */

import {
  BaseSuggestionPlugin,
  SUGGESTION_TRANSIENT_KEY,
} from './BaseSuggestionPlugin';
import {
  type BaseEditor,
  createBaseEditor,
  createBasePlugin,
} from '@platejs/core';
import { property, schema, TextApi } from '@platejs/plite';
import { jsxt } from '@platejs/test-utils';
import { KEYS, type TSuggestionText } from '@platejs/utils';

// biome-ignore lint/complexity/noUselessLoneBlockStatements: keeps each merged test source isolated.
{
  describe('BaseSuggestionPlugin.read.activeDescriptions', () => {
    it('builds replacement and insertion descriptions from real editor data', () => {
      const editor = createBaseEditor({
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
            type: 'p',
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
      const editor = createBaseEditor({
        plugins: [BaseSuggestionPlugin],
        selection: {
          kind: 'text',
          anchor: { offset: 0, path: [0, 0] },
          focus: { offset: 0, path: [0, 0] },
        },
        initialValue: [{ type: 'p', children: [{ text: 'plain' }] }],
      });

      expect(
        editor.plugin(BaseSuggestionPlugin).read.activeDescriptions()
      ).toEqual([]);
    });

    it('builds deletion descriptions when a suggestion only removes text', () => {
      const editor = createBaseEditor({
        plugins: [BaseSuggestionPlugin],
        selection: {
          kind: 'text',
          anchor: { offset: 1, path: [0, 0] },
          focus: { offset: 1, path: [0, 0] },
        },
        initialValue: [
          {
            type: 'p',
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
  const BoldPlugin = createBasePlugin({
    key: 'bold',
    schema: {
      mark: property.boolean({ default: false, omitDefault: true }),
    },
  });

  describe('findInlineSuggestionNode', () => {
    it('returns the first inline suggestion text node', () => {
      const editor = createBaseEditor({
        plugins: [BaseSuggestionPlugin, BoldPlugin],
        initialValue: [
          {
            type: 'p',
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
      const editor = createBaseEditor({
        plugins: [BaseSuggestionPlugin, BoldPlugin],
        initialValue: [
          {
            type: 'p',
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

// biome-ignore lint/complexity/noUselessLoneBlockStatements: keeps each merged test source isolated.
{
  describe('BaseSuggestionPlugin.read.findIdentity', () => {
    const MentionPlugin = createBasePlugin({
      key: KEYS.mention,
      schema: {
        element: {
          inline: true,
          properties: {
            key: property.string(),
            value: property.string(),
          },
          void: 'markable-inline',
        },
      },
    });

    it('reuses metadata only for same-type current-user suggestions', () => {
      const editor = createBaseEditor({
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
            type: 'p',
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
          at: editor.read.selection()!,
          type: 'insert',
        })
      ).toEqual({
        createdAt: 11,
        id: 'same',
      });

      expect(
        editor.plugin(BaseSuggestionPlugin).read.findIdentity({
          at: editor.read.selection()!,
          type: 'remove',
        })
      ).not.toEqual({
        createdAt: 11,
        id: 'same',
      });
    });

    it('falls back to the previous line-break suggestion at the start of the next block', () => {
      const editor = createBaseEditor({
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
            type: 'p',
            suggestion: {
              id: 'line-break',
              createdAt: 42,
              isLineBreak: true,
              type: 'insert',
              userId: 'user-1',
            },
            children: [{ text: 'one' }],
          },
          { type: 'p', children: [{ text: '' }] },
        ],
      });

      expect(
        editor.plugin(BaseSuggestionPlugin).read.findIdentity({
          at: editor.read.selection()!,
          type: 'insert',
        })
      ).toEqual({
        createdAt: 42,
        id: 'line-break',
      });
    });

    it('reuses remove metadata from the adjacent inline void suggestion when continuing backward deletion', () => {
      const editor = createBaseEditor({
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
            type: 'p',
            children: [
              { text: 'like ' },
              {
                type: KEYS.mention,
                value: 'Alice',
                key: 'u1',
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
          at: editor.read.selection()!,
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
  const InlineSuggestionTargetPlugin = createBasePlugin({
    key: 'inlineSuggestionTarget',
    schema: {
      element: {
        content: schema.content.text({ default: 'text', min: 1 }),
        inline: true,
      },
    },
  });

  describe('BaseSuggestionPlugin.api.getProps', () => {
    const createEditor = () =>
      createBaseEditor({
        plugins: [
          BaseSuggestionPlugin.configure({
            initialState: { currentUserId: 'user-1' },
          }),
          InlineSuggestionTargetPlugin,
        ],
        initialValue: [{ children: [{ text: '' }], type: 'p' }],
      });

    it('returns inline suggestion props for text nodes', () => {
      const editor = createEditor();
      const result = editor.plugin(BaseSuggestionPlugin).api.getProps(
        { text: 'hello' },
        {
          createdAt: 123,
          id: 'abc',
        }
      );

      expect(result).toEqual({
        [KEYS.suggestion]: true,
        [editor.plugin(BaseSuggestionPlugin).api.key('abc')]: {
          createdAt: 123,
          id: 'abc',
          type: 'insert',
          userId: 'user-1',
        },
      });
    });

    it('returns element suggestion props for element nodes', () => {
      const editor = createEditor();
      const result = editor
        .plugin(BaseSuggestionPlugin)
        .api.getProps(
          { children: [], type: 'p' },
          { createdAt: 456, id: 'def', suggestionDeletion: true }
        );

      expect(result).toEqual({
        [KEYS.suggestion]: {
          createdAt: 456,
          id: 'def',
          type: 'remove',
          userId: 'user-1',
        },
      });
    });

    it('returns inline suggestion props for inline element nodes', () => {
      const editor = createEditor();
      const result = editor.plugin(BaseSuggestionPlugin).api.getProps(
        {
          children: [{ text: '' }],
          type: InlineSuggestionTargetPlugin.key,
        },
        { createdAt: 456, id: 'def', suggestionDeletion: true }
      );

      expect(result).toEqual({
        [KEYS.suggestion]: true,
        [editor.plugin(BaseSuggestionPlugin).api.key('def')]: {
          createdAt: 456,
          id: 'def',
          type: 'remove',
          userId: 'user-1',
        },
      });
    });

    it('marks inline suggestions as transient when requested', () => {
      const editor = createEditor();
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

// biome-ignore lint/complexity/noUselessLoneBlockStatements: keeps each merged test source isolated.
{
  describe('BaseSuggestionPlugin.api.keys', () => {
    it('finds suggestion keys and resolves real user ids from suggestion data', () => {
      const editor = createBaseEditor({ plugins: [BaseSuggestionPlugin] });
      const api = editor.plugin(BaseSuggestionPlugin).api;
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

// biome-ignore lint/complexity/noUselessLoneBlockStatements: keeps each merged test source isolated.
{
  describe('BaseSuggestionPlugin.read.nodeEntries', () => {
    it('finds all text nodes for the given suggestion id and respects extra match filters', () => {
      const editor = createBaseEditor({
        plugins: [BaseSuggestionPlugin],
        initialValue: [
          {
            type: 'p',
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
            type: 'p',
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
    let editor: BaseEditor;

    beforeEach(() => {
      editor = createBaseEditor({
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
        const node: TSuggestionText = {
          [KEYS.suggestion]: true,
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
        const node: TSuggestionText = {
          [KEYS.suggestion]: true,
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
        const node: TSuggestionText = {
          [KEYS.suggestion]: true,
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
              [KEYS.suggestion]: true,
              suggestion_1: {
                id: '1',
                createdAt: Date.now(),
                type: 'remove',
                userId: 'testId',
              },
              text: 'delete this ',
            } as TSuggestionText,
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
                      [KEYS.suggestion]: true,
                      suggestion_1: {
                        id: '1',
                        createdAt: Date.now(),
                        type: 'remove',
                        userId: 'testId',
                      },
                      text: 'deleted ',
                    } as TSuggestionText,
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
              [KEYS.suggestion]: true,
              suggestion_1: {
                id: '1',
                createdAt: Date.now(),
                type: 'remove',
                userId: 'testId',
              },
              text: 'all deleted',
            } as TSuggestionText,
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
          [KEYS.suggestion]: true,
          text: 'text with suggestion flag',
        } as TSuggestionText;
        const result = editor
          .plugin(BaseSuggestionPlugin)
          .api.skipDeletes(node);
        expect(result).toBe('text with suggestion flag');
      });

      it('handle multiple suggestion keys on same node', () => {
        const node: TSuggestionText = {
          [KEYS.suggestion]: true,
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
