import { describe, expect, it } from 'bun:test';

import {
  createSearchRangeFn,
  isElement,
  isText,
  nodeString,
  searchRange,
  searchRanges,
  traverseTextNodes,
  type Descendant,
  type MatchFn,
  type NodeEntry,
  type Path,
  type SearchEditor,
  type TElement,
  type TRange,
} from './searchRange';

// Helper to create a mock editor
function createMockEditor(children: Descendant[]): SearchEditor {
  return {
    children,
    api: {
      *nodes<T extends Descendant>(options: {
        at: Path | TRange | null;
        match?: MatchFn;
      }): Iterable<NodeEntry<T>> {
        const match =
          options.match ?? ((_n: Descendant, p: Path) => p.length === 1);
        function* traverse(
          nodes: Descendant[],
          basePath: Path
        ): Generator<NodeEntry<T>> {
          for (const [index, node] of nodes.entries()) {
            const path = [...basePath, index];
            if (match(node, path)) {
              yield [node as T, path];
            }
            if (isElement(node)) {
              yield* traverse(node.children, path);
            }
          }
        }
        yield* traverse(children, []);
      },
      isVoid: () => false,
    },
  };
}

describe('searchRange', () => {
  describe('utility functions', () => {
    describe('isElement', () => {
      it('returns true for elements with children', () => {
        expect(isElement({ children: [], type: 'p' })).toBe(true);
      });

      it('returns false for text nodes', () => {
        expect(isElement({ text: 'hello' })).toBe(false);
      });

      it('returns false for nodes without children array', () => {
        expect(isElement({ type: 'void' })).toBe(false);
      });
    });

    describe('isText', () => {
      it('returns true for text nodes', () => {
        expect(isText({ text: 'hello' })).toBe(true);
      });

      it('returns true for empty text', () => {
        expect(isText({ text: '' })).toBe(true);
      });

      it('returns false for elements', () => {
        expect(isText({ children: [] })).toBe(false);
      });
    });

    describe('nodeString', () => {
      it('returns text content for text nodes', () => {
        expect(nodeString({ text: 'hello' })).toBe('hello');
      });

      it('returns empty string for empty text', () => {
        expect(nodeString({ text: '' })).toBe('');
      });

      it('concatenates children text for elements', () => {
        const element: TElement = {
          children: [{ text: 'hello ' }, { text: 'world' }],
          type: 'p',
        };
        expect(nodeString(element)).toBe('hello world');
      });

      it('handles nested elements', () => {
        const element: TElement = {
          children: [
            { text: 'start ' },
            {
              children: [{ text: 'middle' }],
              type: 'span',
            } as TElement,
            { text: ' end' },
          ],
          type: 'p',
        };
        expect(nodeString(element)).toBe('start middle end');
      });

      it('returns empty string for unknown node types', () => {
        expect(nodeString({ type: 'unknown' })).toBe('');
      });
    });

    describe('traverseTextNodes', () => {
      it('calls callback for each text node', () => {
        const nodes: Descendant[] = [
          { text: 'a' },
          { text: 'b' },
          { text: 'c' },
        ];
        const visited: string[] = [];
        traverseTextNodes(nodes, (node) => {
          if (isText(node)) visited.push(node.text);
        });
        expect(visited).toEqual(['a', 'b', 'c']);
      });

      it('provides correct paths', () => {
        const nodes: Descendant[] = [{ text: 'a' }, { text: 'b' }];
        const paths: number[][] = [];
        traverseTextNodes(nodes, (_node, path) => {
          paths.push(path);
        });
        expect(paths).toEqual([[0], [1]]);
      });

      it('traverses nested elements', () => {
        const nodes: Descendant[] = [
          {
            children: [{ text: 'nested' }],
            type: 'span',
          } as TElement,
        ];
        const visited: string[] = [];
        traverseTextNodes(nodes, (node) => {
          if (isText(node)) visited.push(node.text);
        });
        expect(visited).toEqual(['nested']);
      });

      it('returns true when callback returns true (early exit)', () => {
        const nodes: Descendant[] = [
          { text: 'a' },
          { text: 'b' },
          { text: 'c' },
        ];
        const visited: string[] = [];
        const result = traverseTextNodes(nodes, (node) => {
          if (isText(node)) {
            visited.push(node.text);
            if (node.text === 'b') return true;
          }
        });
        expect(result).toBe(true);
        expect(visited).toEqual(['a', 'b']);
      });

      it('returns false when traversal completes', () => {
        const nodes: Descendant[] = [{ text: 'a' }];
        const result = traverseTextNodes(nodes, () => {});
        expect(result).toBe(false);
      });

      it('handles deeply nested structures', () => {
        const nodes: Descendant[] = [
          {
            children: [
              {
                children: [
                  {
                    children: [{ text: 'deep' }],
                    type: 'c',
                  } as TElement,
                ],
                type: 'b',
              } as TElement,
            ],
            type: 'a',
          } as TElement,
        ];
        const paths: number[][] = [];
        traverseTextNodes(nodes, (_node, path) => {
          paths.push(path);
        });
        expect(paths).toEqual([[0, 0, 0, 0]]);
      });
    });
  });

  describe('searchRange', () => {
    it('returns null for empty search string', () => {
      const editor = createMockEditor([
        { children: [{ text: 'hello' }], type: 'p' },
      ]);
      expect(searchRange(editor, '')).toBeNull();
    });

    it('returns null for empty array search', () => {
      const editor = createMockEditor([
        { children: [{ text: 'hello' }], type: 'p' },
      ]);
      expect(searchRange(editor, ['', 'end'])).toBeNull();
      expect(searchRange(editor, ['start', ''])).toBeNull();
    });

    it('finds simple string in single text node', () => {
      const editor = createMockEditor([
        { children: [{ text: 'hello world' }], type: 'p' },
      ]);
      const result = searchRange(editor, 'world');
      expect(result).not.toBeNull();
      expect(result?.anchor.path).toEqual([0, 0]);
      expect(result?.anchor.offset).toBe(6);
      expect(result?.focus.path).toEqual([0, 0]);
      expect(result?.focus.offset).toBe(11);
    });

    it('is case insensitive', () => {
      const editor = createMockEditor([
        { children: [{ text: 'Hello World' }], type: 'p' },
      ]);
      const result = searchRange(editor, 'HELLO');
      expect(result).not.toBeNull();
      expect(result?.anchor.offset).toBe(0);
      expect(result?.focus.offset).toBe(5);
    });

    it('returns null when string not found', () => {
      const editor = createMockEditor([
        { children: [{ text: 'hello world' }], type: 'p' },
      ]);
      expect(searchRange(editor, 'xyz')).toBeNull();
    });

    it('finds string spanning multiple text nodes', () => {
      const editor = createMockEditor([
        {
          children: [{ text: 'hel' }, { text: 'lo wor' }, { text: 'ld' }],
          type: 'p',
        },
      ]);
      const result = searchRange(editor, 'hello world');
      expect(result).not.toBeNull();
      expect(result?.anchor.path).toEqual([0, 0]);
      expect(result?.anchor.offset).toBe(0);
      expect(result?.focus.path).toEqual([0, 2]);
      expect(result?.focus.offset).toBe(2);
    });

    it('finds first occurrence', () => {
      const editor = createMockEditor([
        { children: [{ text: 'hello hello hello' }], type: 'p' },
      ]);
      const result = searchRange(editor, 'hello');
      expect(result).not.toBeNull();
      expect(result?.anchor.offset).toBe(0);
      expect(result?.focus.offset).toBe(5);
    });

    it('finds token pair range', () => {
      const editor = createMockEditor([
        {
          children: [{ text: '[[START]]content here[[END]]' }],
          type: 'p',
        },
      ]);
      const result = searchRange(editor, ['[[START]]', '[[END]]']);
      expect(result).not.toBeNull();
      expect(result?.anchor.offset).toBe(0);
      expect(result?.focus.offset).toBe(28); // Full range including tokens
    });

    it('handles DOCX tracking tokens', () => {
      const startToken = '[[DOCX_INS_START:test]]';
      const endToken = '[[DOCX_INS_END:test]]';
      const editor = createMockEditor([
        {
          children: [{ text: `${startToken}inserted text${endToken}` }],
          type: 'p',
        },
      ]);
      const result = searchRange(editor, [startToken, endToken]);
      expect(result).not.toBeNull();
    });

    it('searches across multiple paragraphs', () => {
      const editor = createMockEditor([
        { children: [{ text: 'first paragraph' }], type: 'p' },
        { children: [{ text: 'second paragraph with target' }], type: 'p' },
      ]);
      const result = searchRange(editor, 'target');
      expect(result).not.toBeNull();
      expect(result?.anchor.path[0]).toBe(1); // Second paragraph
    });

    it('uses custom match function', () => {
      const editor = createMockEditor([
        { children: [{ text: 'skip this' }], type: 'heading' },
        { children: [{ text: 'search this' }], type: 'p' },
      ]);
      const result = searchRange(editor, 'this', {
        match: (node) => (node as TElement).type === 'p',
      });
      expect(result).not.toBeNull();
      // Should find in second element (the paragraph)
    });

    it('handles editor without api.nodes', () => {
      const editor: SearchEditor = {
        children: [{ children: [{ text: 'hello world' }], type: 'p' }],
        api: {
          nodes: undefined as unknown as SearchEditor['api']['nodes'],
        },
      };
      const result = searchRange(editor, 'world');
      expect(result).not.toBeNull();
    });

    it('skips void elements when isVoid is provided', () => {
      const children: Descendant[] = [
        {
          children: [
            { text: 'before' },
            { type: 'image', children: [{ text: '' }] } as TElement,
            { text: 'after' },
          ],
          type: 'p',
        },
      ];
      const editor: SearchEditor = {
        children,
        api: {
          *nodes<T extends Descendant>(options: {
            at: Path | TRange | null;
            match?: MatchFn;
          }): Iterable<NodeEntry<T>> {
            const match =
              options.match ?? ((_n: Descendant, p: Path) => p.length === 1);
            for (const [i, node] of children.entries()) {
              if (match(node, [i])) yield [node as T, [i]];
            }
          },
          isVoid: (node) => (node as TElement).type === 'image',
        },
      };
      // Should still find 'after' text
      const result = searchRange(editor, 'after');
      expect(result).not.toBeNull();
    });
  });

  describe('searchRanges', () => {
    it('returns empty array for empty search', () => {
      const editor = createMockEditor([
        { children: [{ text: 'hello' }], type: 'p' },
      ]);
      expect(searchRanges(editor, '')).toEqual([]);
      expect(searchRanges(editor, ['', 'end'])).toEqual([]);
      expect(searchRanges(editor, ['start', ''])).toEqual([]);
    });

    it('finds all occurrences of string', () => {
      const editor = createMockEditor([
        { children: [{ text: 'hello hello hello' }], type: 'p' },
      ]);
      const results = searchRanges(editor, 'hello');
      expect(results).toHaveLength(3);
      expect(results[0].anchor.offset).toBe(0);
      expect(results[1].anchor.offset).toBe(6);
      expect(results[2].anchor.offset).toBe(12);
    });

    it('finds all occurrences across paragraphs', () => {
      const editor = createMockEditor([
        { children: [{ text: 'hello world' }], type: 'p' },
        { children: [{ text: 'hello again' }], type: 'p' },
      ]);
      const results = searchRanges(editor, 'hello');
      expect(results).toHaveLength(2);
      expect(results[0].anchor.path[0]).toBe(0);
      expect(results[1].anchor.path[0]).toBe(1);
    });

    it('finds all token pair ranges', () => {
      const editor = createMockEditor([
        {
          children: [{ text: '[[A]]x[[/A]] and [[A]]y[[/A]]' }],
          type: 'p',
        },
      ]);
      const results = searchRanges(editor, ['[[A]]', '[[/A]]']);
      expect(results).toHaveLength(2);
    });

    it('returns empty array when not found', () => {
      const editor = createMockEditor([
        { children: [{ text: 'hello' }], type: 'p' },
      ]);
      expect(searchRanges(editor, 'xyz')).toEqual([]);
    });

    it('handles editor without api.nodes', () => {
      const editor: SearchEditor = {
        children: [{ children: [{ text: 'hello hello' }], type: 'p' }],
        api: {
          nodes: undefined as unknown as SearchEditor['api']['nodes'],
        },
      };
      const results = searchRanges(editor, 'hello');
      expect(results).toHaveLength(2);
    });

    it('uses custom match function', () => {
      const editor = createMockEditor([
        { children: [{ text: 'hello in heading' }], type: 'heading' },
        { children: [{ text: 'hello in paragraph' }], type: 'p' },
      ]);
      const results = searchRanges(editor, 'hello', {
        match: (node) => (node as TElement).type === 'p',
      });
      // Should only find in paragraph
      expect(results).toHaveLength(1);
    });
  });

  describe('createSearchRangeFn', () => {
    it('creates a bound search function', () => {
      const editor = createMockEditor([
        { children: [{ text: 'hello world' }], type: 'p' },
      ]);
      const boundSearch = createSearchRangeFn(editor);

      const result = boundSearch('world');
      expect(result).not.toBeNull();
      expect(result?.anchor.offset).toBe(6);
    });

    it('works with token pairs', () => {
      const editor = createMockEditor([
        { children: [{ text: '[[START]]content[[END]]' }], type: 'p' },
      ]);
      const boundSearch = createSearchRangeFn(editor);

      const result = boundSearch(['[[START]]', '[[END]]']);
      expect(result).not.toBeNull();
    });
  });

  describe('integration with DOCX tracking tokens', () => {
    it('finds insertion token pairs', () => {
      const payload = encodeURIComponent(
        JSON.stringify({ id: 'ins-1', author: 'John' })
      );
      const startToken = `[[DOCX_INS_START:${payload}]]`;
      const endToken = '[[DOCX_INS_END:ins-1]]';

      const editor = createMockEditor([
        {
          children: [
            {
              text: `Some text ${startToken}inserted content${endToken} more text`,
            },
          ],
          type: 'p',
        },
      ]);

      const result = searchRange(editor, [startToken, endToken]);
      expect(result).not.toBeNull();
    });

    it('finds deletion token pairs', () => {
      const payload = encodeURIComponent(
        JSON.stringify({ id: 'del-1', author: 'Jane' })
      );
      const startToken = `[[DOCX_DEL_START:${payload}]]`;
      const endToken = '[[DOCX_DEL_END:del-1]]';

      const editor = createMockEditor([
        {
          children: [{ text: `${startToken}deleted content${endToken}` }],
          type: 'p',
        },
      ]);

      const result = searchRange(editor, [startToken, endToken]);
      expect(result).not.toBeNull();
    });

    it('finds comment token pairs', () => {
      const payload = encodeURIComponent(
        JSON.stringify({
          id: 'cmt-1',
          authorName: 'Bob',
          text: 'Comment text',
        })
      );
      const startToken = `[[DOCX_CMT_START:${payload}]]`;
      const endToken = '[[DOCX_CMT_END:cmt-1]]';

      const editor = createMockEditor([
        {
          children: [{ text: `${startToken}commented text${endToken}` }],
          type: 'p',
        },
      ]);

      const result = searchRange(editor, [startToken, endToken]);
      expect(result).not.toBeNull();
    });

    it('finds multiple tracking tokens in document', () => {
      const ins1Start = '[[DOCX_INS_START:ins1]]';
      const ins1End = '[[DOCX_INS_END:ins1]]';
      const del1Start = '[[DOCX_DEL_START:del1]]';
      const del1End = '[[DOCX_DEL_END:del1]]';

      const editor = createMockEditor([
        {
          children: [
            {
              text: `${ins1Start}added${ins1End} and ${del1Start}removed${del1End}`,
            },
          ],
          type: 'p',
        },
      ]);

      const insResult = searchRange(editor, [ins1Start, ins1End]);
      const delResult = searchRange(editor, [del1Start, del1End]);

      expect(insResult).not.toBeNull();
      expect(delResult).not.toBeNull();
    });
  });
});
