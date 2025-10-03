/** @jsx jsxt */

import type { SlateEditor, TSuggestionText } from 'platejs';

import { jsxt } from '@platejs/test-utils';
import { createSlateEditor, KEYS } from 'platejs';

import { BaseSuggestionPlugin } from '../BaseSuggestionPlugin';
import { SkipSuggestionDeletes } from './SkipSuggestionDeletes';

jsxt;

const suggestionPlugin = BaseSuggestionPlugin.configure({
  options: {
    currentUserId: 'testId',
  },
});

describe('SkipSuggestionDeletes', () => {
  let editor: SlateEditor;

  beforeEach(() => {
    editor = createSlateEditor({
      plugins: [suggestionPlugin],
    });
  });

  describe('text nodes', () => {
    it('should return full text for node without suggestion', () => {
      const node = { text: 'hello world' };
      const result = SkipSuggestionDeletes(editor, node);
      expect(result).toBe('hello world');
    });

    it('should return empty string for text node with remove suggestion', () => {
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
      const result = SkipSuggestionDeletes(editor, node);
      expect(result).toBe('');
    });

    it('should return full text for text node with insert suggestion', () => {
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
      const result = SkipSuggestionDeletes(editor, node);
      expect(result).toBe('inserted text');
    });

    it('should return full text for text node with update suggestion', () => {
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
      const result = SkipSuggestionDeletes(editor, node);
      expect(result).toBe('updated text');
    });
  });

  describe('element nodes', () => {
    it('should concatenate text from all children', () => {
      const node = {
        children: [{ text: 'first ' }, { text: 'second ' }, { text: 'third' }],
        type: 'paragraph',
      };
      const result = SkipSuggestionDeletes(editor, node);
      expect(result).toBe('first second third');
    });

    it('should skip deleted text nodes in children', () => {
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
      const result = SkipSuggestionDeletes(editor, node);
      expect(result).toBe('keep this keep this too');
    });

    it('should handle nested elements', () => {
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
      const result = SkipSuggestionDeletes(editor, node);
      expect(result).toBe('nested textanother paragraph');
    });

    it('should handle deeply nested elements with mixed suggestions', () => {
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
      const result = SkipSuggestionDeletes(editor, node);
      expect(result).toBe('item 1 contentitem 2');
    });

    it('should handle empty children array', () => {
      const node = {
        children: [],
        type: 'paragraph',
      };
      const result = SkipSuggestionDeletes(editor, node);
      expect(result).toBe('');
    });

    it('should handle children with only deleted text', () => {
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
      const result = SkipSuggestionDeletes(editor, node);
      expect(result).toBe('');
    });
  });

  describe('edge cases', () => {
    it('should handle empty text node', () => {
      const node = { text: '' };
      const result = SkipSuggestionDeletes(editor, node);
      expect(result).toBe('');
    });

    it('should handle text node with suggestion but no suggestion data', () => {
      const node = {
        [KEYS.suggestion]: true,
        text: 'text with suggestion flag',
      } as TSuggestionText;
      const result = SkipSuggestionDeletes(editor, node);
      expect(result).toBe('text with suggestion flag');
    });

    it('should handle multiple suggestion keys on same node', () => {
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
      const result = SkipSuggestionDeletes(editor, node);
      expect(result).toBe('');
    });
  });
});
