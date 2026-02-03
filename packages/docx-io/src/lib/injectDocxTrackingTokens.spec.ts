import { describe, expect, it } from 'bun:test';

import {
  buildUserNameMap,
  createDiscussionsForTransientComments,
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

  describe('transient comment export', () => {
    describe('createDiscussionsForTransientComments', () => {
      it('returns empty array for nodes without transient marks', () => {
        const value = [
          {
            type: 'p',
            children: [{ text: 'Hello World' }],
          },
        ];
        const discussions = createDiscussionsForTransientComments(value);
        expect(discussions).toEqual([]);
      });

      it('creates discussion for single transient text node', () => {
        const value = [
          {
            type: 'p',
            children: [{ text: 'Transient comment', commentTransient: true }],
          },
        ];
        const discussions = createDiscussionsForTransientComments(value);

        expect(discussions.length).toBe(1);
        expect(discussions[0].documentContent).toBe('Transient comment');
        expect(discussions[0].user?.name).toBe('Draft');
        expect(discussions[0].id).toBeDefined();
      });

      it('uses custom author name', () => {
        const value = [
          {
            type: 'p',
            children: [{ text: 'Transient', commentTransient: true }],
          },
        ];
        const discussions = createDiscussionsForTransientComments(value, {
          defaultAuthor: 'Anonymous User',
        });

        expect(discussions[0].user?.name).toBe('Anonymous User');
      });

      it('uses custom transient key', () => {
        const value = [
          {
            type: 'p',
            children: [{ text: 'Custom key', myTransientKey: true }],
          },
        ];
        const discussions = createDiscussionsForTransientComments(value, {
          transientKey: 'myTransientKey',
        });

        expect(discussions.length).toBe(1);
        expect(discussions[0].documentContent).toBe('Custom key');
      });

      it('groups consecutive transient nodes into single discussion', () => {
        const value = [
          {
            type: 'p',
            children: [
              { text: 'Part 1 ', commentTransient: true },
              { text: 'Part 2', commentTransient: true },
            ],
          },
        ];
        const discussions = createDiscussionsForTransientComments(value);

        expect(discussions.length).toBe(1);
        expect(discussions[0].documentContent).toBe('Part 1 Part 2');
      });

      it('creates separate discussions for non-consecutive transient nodes', () => {
        const value = [
          {
            type: 'p',
            children: [
              { text: 'First', commentTransient: true },
              { text: ' normal ' },
              { text: 'Second', commentTransient: true },
            ],
          },
        ];
        const discussions = createDiscussionsForTransientComments(value);

        expect(discussions.length).toBe(2);
        expect(discussions[0].documentContent).toBe('First');
        expect(discussions[1].documentContent).toBe('Second');
      });

      it('mutates nodes to add comment_<id> marks', () => {
        const value = [
          {
            type: 'p',
            children: [{ text: 'Transient', commentTransient: true }],
          },
        ];
        const discussions = createDiscussionsForTransientComments(value);

        const node = (value[0] as any).children[0];
        const commentKey = `comment_${discussions[0].id}`;
        expect(node[commentKey]).toBe(true);
      });

      it('handles transient marks across multiple paragraphs', () => {
        const value = [
          {
            type: 'p',
            children: [{ text: 'First para', commentTransient: true }],
          },
          {
            type: 'p',
            children: [{ text: 'Second para', commentTransient: true }],
          },
        ];
        const discussions = createDiscussionsForTransientComments(value);

        // Different paragraphs should create separate discussions
        expect(discussions.length).toBe(2);
      });
    });

    describe('injectDocxTrackingTokens with includeTransientComments', () => {
      it('ignores transient comments when option is false', () => {
        const value = [
          {
            type: 'p',
            children: [{ text: 'Transient', commentTransient: true }],
          },
        ];

        const result = injectDocxTrackingTokens(value, {
          includeTransientComments: false,
        });
        const text = (result[0] as any).children[0].text;

        expect(text).not.toContain('[[DOCX_CMT_START:');
        expect(text).toBe('Transient');
      });

      it('exports transient comments when option is true', () => {
        const value = [
          {
            type: 'p',
            children: [{ text: 'Transient comment', commentTransient: true }],
          },
        ];

        const result = injectDocxTrackingTokens(value, {
          includeTransientComments: true,
        });
        const text = (result[0] as any).children[0].text;

        expect(text).toContain('[[DOCX_CMT_START:');
        expect(text).toContain('[[DOCX_CMT_END:');
        expect(text).toContain('Transient comment');
      });

      it('uses defaultTransientAuthor option', () => {
        const value = [
          {
            type: 'p',
            children: [{ text: 'Authored', commentTransient: true }],
          },
        ];

        const result = injectDocxTrackingTokens(value, {
          includeTransientComments: true,
          defaultTransientAuthor: 'Custom Author',
        });
        const text = (result[0] as any).children[0].text;

        expect(text).toContain('Custom%20Author');
      });

      it('uses transientCommentKey option', () => {
        const value = [
          {
            type: 'p',
            children: [{ text: 'Custom key', myKey: true }],
          },
        ];

        const result = injectDocxTrackingTokens(value, {
          includeTransientComments: true,
          transientCommentKey: 'myKey',
        });
        const text = (result[0] as any).children[0].text;

        expect(text).toContain('[[DOCX_CMT_START:');
      });

      it('merges transient discussions with provided discussions', () => {
        const existingDiscussions: DocxExportDiscussion[] = [
          {
            id: 'existing-1',
            documentContent: 'Existing comment',
            user: { id: 'user-1', name: 'Alice' },
          },
        ];

        const value = [
          {
            type: 'p',
            children: [
              { text: 'Existing', comment_existing1: true },
              { text: ' and transient', commentTransient: true },
            ],
          },
        ];

        const result = injectDocxTrackingTokens(value, {
          discussions: existingDiscussions,
          includeTransientComments: true,
          getCommentIds: (node) => {
            if ('comment_existing1' in node) return ['existing-1'];
            const ids: string[] = [];
            for (const key of Object.keys(node)) {
              if (key.startsWith('comment_') && key !== 'comment_existing1') {
                ids.push(key.slice('comment_'.length));
              }
            }
            return ids;
          },
        });

        const text1 = (result[0] as any).children[0].text;
        const text2 = (result[0] as any).children[1].text;

        // Both existing and transient comments should have tokens
        expect(text1).toContain('[[DOCX_CMT_START:');
        expect(text2).toContain('[[DOCX_CMT_START:');
      });

      it('does not mutate original value', () => {
        const original = [
          {
            type: 'p',
            children: [{ text: 'Original', commentTransient: true }],
          },
        ];

        const originalText = original[0].children[0].text;
        injectDocxTrackingTokens(original, { includeTransientComments: true });

        expect(original[0].children[0].text).toBe(originalText);
      });
    });
  });
});
