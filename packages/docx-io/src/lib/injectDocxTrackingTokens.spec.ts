import { describe, expect, it } from 'bun:test';

import {
  buildUserNameMap,
  injectDocxTrackingTokens,
  normalizeDate,
  toInitials,
  type DocxExportDiscussion,
  type DocxExportSuggestionMeta,
} from './exportTrackChanges';

describe('injectDocxTrackingTokens', () => {
  describe('utility functions', () => {
    describe('toInitials', () => {
      it('returns empty string for null/undefined', () => {
        expect(toInitials(null)).toBe('');
        expect(toInitials(undefined)).toBe('');
      });

      it('returns single initial for single name', () => {
        expect(toInitials('John')).toBe('J');
      });

      it('returns two initials for full name', () => {
        expect(toInitials('John Doe')).toBe('JD');
      });

      it('handles multiple names (takes first two)', () => {
        expect(toInitials('John Michael Doe')).toBe('JM');
      });

      it('handles extra whitespace', () => {
        expect(toInitials('  John   Doe  ')).toBe('JD');
      });
    });

    describe('normalizeDate', () => {
      it('returns undefined for null/undefined', () => {
        expect(normalizeDate(null)).toBeUndefined();
        expect(normalizeDate(undefined)).toBeUndefined();
      });

      it('converts Date object to ISO string', () => {
        const date = new Date('2024-01-15T12:00:00Z');
        expect(normalizeDate(date)).toBe('2024-01-15T12:00:00.000Z');
      });

      it('converts valid string to ISO string', () => {
        expect(normalizeDate('2024-01-15')).toMatch(/^2024-01-15/);
      });

      it('converts timestamp to ISO string', () => {
        const timestamp = new Date('2024-01-15T12:00:00Z').getTime();
        expect(normalizeDate(timestamp)).toBe('2024-01-15T12:00:00.000Z');
      });

      it('returns undefined for invalid date', () => {
        expect(normalizeDate('invalid-date')).toBeUndefined();
      });
    });

    describe('buildUserNameMap', () => {
      it('returns empty map for null/undefined', () => {
        expect(buildUserNameMap(null).size).toBe(0);
        expect(buildUserNameMap(undefined).size).toBe(0);
      });

      it('extracts user names from discussions', () => {
        const discussions: DocxExportDiscussion[] = [
          {
            id: 'disc-1',
            user: { id: 'user-1', name: 'Alice' },
            userId: 'user-1',
          },
        ];
        const map = buildUserNameMap(discussions);
        expect(map.get('user-1')).toBe('Alice');
      });

      it('extracts user names from comments', () => {
        const discussions: DocxExportDiscussion[] = [
          {
            id: 'disc-1',
            comments: [
              {
                user: { id: 'user-2', name: 'Bob' },
                userId: 'user-2',
              },
            ],
          },
        ];
        const map = buildUserNameMap(discussions);
        expect(map.get('user-2')).toBe('Bob');
      });
    });
  });

  describe('token injection', () => {
    it('returns empty array for empty input', () => {
      const result = injectDocxTrackingTokens([]);
      expect(result).toEqual([]);
    });

    it('does not modify nodes without marks', () => {
      const value = [
        {
          type: 'p',
          children: [{ text: 'Hello World' }],
        },
      ];
      const result = injectDocxTrackingTokens(value);
      expect((result[0] as any).children[0].text).toBe('Hello World');
    });

    it('injects suggestion tokens for insertions', () => {
      const value = [
        {
          type: 'p',
          children: [
            {
              text: 'Hello',
              suggestion_abc123: {
                id: 'abc123',
                type: 'insert',
                userId: 'user-1',
              } as DocxExportSuggestionMeta,
            },
          ],
        },
      ];

      const result = injectDocxTrackingTokens(value);
      const text = (result[0] as any).children[0].text;

      expect(text).toContain('[[DOCX_INS_START:');
      expect(text).toContain('[[DOCX_INS_END:');
      expect(text).toContain('Hello');
    });

    it('injects suggestion tokens for deletions', () => {
      const value = [
        {
          type: 'p',
          children: [
            {
              text: 'Deleted',
              suggestion_def456: {
                id: 'def456',
                type: 'remove',
                userId: 'user-1',
              } as DocxExportSuggestionMeta,
            },
          ],
        },
      ];

      const result = injectDocxTrackingTokens(value);
      const text = (result[0] as any).children[0].text;

      expect(text).toContain('[[DOCX_DEL_START:');
      expect(text).toContain('[[DOCX_DEL_END:');
      expect(text).toContain('Deleted');
    });

    it('injects comment tokens', () => {
      const discussions: DocxExportDiscussion[] = [
        {
          id: 'cmt-1',
          documentContent: 'Test comment',
          user: { id: 'user-1', name: 'Alice' },
        },
      ];

      const value = [
        {
          type: 'p',
          children: [
            {
              text: 'Commented text',
              comment_cmt1: true,
            },
          ],
        },
      ];

      const result = injectDocxTrackingTokens(value, {
        discussions,
        getCommentIds: (node) => {
          const ids: string[] = [];
          for (const key of Object.keys(node)) {
            if (key.startsWith('comment_')) {
              ids.push('cmt-1'); // Map comment_cmt1 to cmt-1
            }
          }
          return ids;
        },
      });
      const text = (result[0] as any).children[0].text;

      expect(text).toContain('[[DOCX_CMT_START:');
      expect(text).toContain('[[DOCX_CMT_END:');
      expect(text).toContain('Commented text');
    });

    it('handles multiple text nodes with same suggestion', () => {
      const value = [
        {
          type: 'p',
          children: [
            {
              text: 'Hello ',
              suggestion_abc: { id: 'abc', type: 'insert' },
            },
            {
              text: 'World',
              suggestion_abc: { id: 'abc', type: 'insert' },
            },
          ],
        },
      ];

      const result = injectDocxTrackingTokens(value);
      const text1 = (result[0] as any).children[0].text;
      const text2 = (result[0] as any).children[1].text;

      // Start token should be at beginning of first node
      expect(text1).toContain('[[DOCX_INS_START:');
      expect(text1).not.toContain('[[DOCX_INS_END:');

      // End token should be at end of last node
      expect(text2).toContain('[[DOCX_INS_END:');
      expect(text2).not.toContain('[[DOCX_INS_START:');
    });

    it('handles nested suggestions and comments', () => {
      const value = [
        {
          type: 'p',
          children: [
            {
              text: 'Text',
              suggestion_sugg1: { id: 'sugg1', type: 'insert' },
              comment_cmt1: true,
            },
          ],
        },
      ];

      const result = injectDocxTrackingTokens(value, {
        getCommentIds: (node) => {
          if ('comment_cmt1' in node) return ['cmt1'];
          return [];
        },
      });
      const text = (result[0] as any).children[0].text;

      // Both suggestion and comment tokens should be present
      expect(text).toContain('[[DOCX_INS_START:');
      expect(text).toContain('[[DOCX_INS_END:');
      expect(text).toContain('[[DOCX_CMT_START:');
      expect(text).toContain('[[DOCX_CMT_END:');
    });

    it('does not mutate original value', () => {
      const original = [
        {
          type: 'p',
          children: [
            {
              text: 'Original',
              suggestion_abc: { id: 'abc', type: 'insert' },
            },
          ],
        },
      ];

      const originalText = original[0].children[0].text;
      injectDocxTrackingTokens(original);

      expect(original[0].children[0].text).toBe(originalText);
    });

    it('handles block-level suggestions', () => {
      const value = [
        {
          type: 'p',
          suggestion: { id: 'block-sugg', type: 'insert', userId: 'user-1' },
          children: [{ text: 'Block suggestion text' }],
        },
      ];

      const result = injectDocxTrackingTokens(value);
      const text = (result[0] as any).children[0].text;

      expect(text).toContain('[[DOCX_INS_START:');
      expect(text).toContain('[[DOCX_INS_END:');
    });

    it('uses custom getSuggestions function', () => {
      const value = [
        {
          type: 'p',
          children: [
            {
              text: 'Custom',
              customSuggestionKey: { id: 'custom-1', type: 'insert' },
            },
          ],
        },
      ];

      const result = injectDocxTrackingTokens(value, {
        getSuggestions: (node) => {
          const customData = (node as Record<string, unknown>)
            .customSuggestionKey as DocxExportSuggestionMeta | undefined;
          if (customData?.id) {
            return [customData];
          }
          return [];
        },
      });
      const text = (result[0] as any).children[0].text;

      expect(text).toContain('[[DOCX_INS_START:');
    });

    it('resolves author names from userNameMap', () => {
      const userNameMap = new Map<string, string>();
      userNameMap.set('user-123', 'John Smith');

      const value = [
        {
          type: 'p',
          children: [
            {
              text: 'Authored text',
              suggestion_abc: {
                id: 'abc',
                type: 'insert',
                userId: 'user-123',
              },
            },
          ],
        },
      ];

      const result = injectDocxTrackingTokens(value, { userNameMap });
      const text = (result[0] as any).children[0].text;

      // The token should contain the resolved author name
      expect(text).toContain('John%20Smith');
    });

    it('handles mixed content with and without marks', () => {
      const value = [
        {
          type: 'p',
          children: [
            { text: 'Normal ' },
            { text: 'marked', suggestion_abc: { id: 'abc', type: 'insert' } },
            { text: ' normal again' },
          ],
        },
      ];

      const result = injectDocxTrackingTokens(value);

      expect((result[0] as any).children[0].text).toBe('Normal ');
      expect((result[0] as any).children[1].text).toContain(
        '[[DOCX_INS_START:'
      );
      expect((result[0] as any).children[1].text).toContain('[[DOCX_INS_END:');
      expect((result[0] as any).children[2].text).toBe(' normal again');
    });

    it('handles deeply nested elements', () => {
      const value = [
        {
          type: 'blockquote',
          children: [
            {
              type: 'p',
              children: [
                {
                  text: 'Nested',
                  suggestion_abc: { id: 'abc', type: 'insert' },
                },
              ],
            },
          ],
        },
      ];

      const result = injectDocxTrackingTokens(value);
      const text = (result[0] as any).children[0].children[0].text;

      expect(text).toContain('[[DOCX_INS_START:');
      expect(text).toContain('[[DOCX_INS_END:');
    });
  });
});
