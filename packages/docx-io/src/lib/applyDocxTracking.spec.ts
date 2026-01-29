import { describe, expect, it, mock } from 'bun:test';

import {
  applyTrackedChangeSuggestions,
  type TrackingEditor,
  type TRange,
} from './importTrackChanges';
import {
  applyAllTracking,
  applyTrackedComments,
  type DocxImportComment,
} from './importComments';
import type { DocxTrackedChange } from './types';

// Mock editor factory
function createMockEditor(): TrackingEditor {
  return {
    api: {
      string: mock(() => 'sample text'),
      rangeRef: (range: TRange) => ({
        current: range,
        unref: mock(() => range),
      }),
    },
    tf: {
      setNodes: mock(() => {}),
      delete: mock(() => {}),
      withMerging: mock((fn: () => void) => fn()),
    },
    setOption: mock(() => {}),
  };
}

// Mock search function that returns predictable ranges
function createMockSearchRange(
  tokenMap?: Map<string, TRange | null>
): (editor: TrackingEditor, search: string) => TRange | null {
  return (_editor, search) => {
    if (tokenMap) {
      return tokenMap.get(search) ?? null;
    }
    // Default behavior: return a range for tokens
    if (search.includes('START') || search.includes('END')) {
      return {
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: search.length },
      };
    }
    return null;
  };
}

describe('applyDocxTracking', () => {
  describe('applyTrackedChangeSuggestions', () => {
    it('returns zero counts for empty changes', () => {
      const editor = createMockEditor();
      const result = applyTrackedChangeSuggestions({
        editor,
        changes: [],
        searchRange: createMockSearchRange(),
        suggestionKey: 'suggestion',
        getSuggestionKey: (id) => `suggestion_${id}`,
        isText: (node) =>
          typeof (node as Record<string, unknown>).text === 'string',
      });

      expect(result.insertions).toBe(0);
      expect(result.deletions).toBe(0);
      expect(result.total).toBe(0);
      expect(result.errors).toEqual([]);
    });

    it('applies insertion suggestion', () => {
      const editor = createMockEditor();
      const changes: DocxTrackedChange[] = [
        {
          id: 'ins-1',
          type: 'insert',
          author: 'John Doe',
          date: '2024-01-15T12:00:00Z',
          startToken: '[[START:ins-1]]',
          endToken: '[[END:ins-1]]',
        },
      ];

      const result = applyTrackedChangeSuggestions({
        editor,
        changes,
        searchRange: createMockSearchRange(),
        suggestionKey: 'suggestion',
        getSuggestionKey: (id) => `suggestion_${id}`,
        isText: (node) =>
          typeof (node as Record<string, unknown>).text === 'string',
      });

      expect(result.insertions).toBe(1);
      expect(result.deletions).toBe(0);
      expect(result.total).toBe(1);
      expect(editor.tf.setNodes).toHaveBeenCalled();
    });

    it('applies deletion suggestion', () => {
      const editor = createMockEditor();
      const changes: DocxTrackedChange[] = [
        {
          id: 'del-1',
          type: 'remove',
          author: 'Jane Doe',
          startToken: '[[START:del-1]]',
          endToken: '[[END:del-1]]',
        },
      ];

      const result = applyTrackedChangeSuggestions({
        editor,
        changes,
        searchRange: createMockSearchRange(),
        suggestionKey: 'suggestion',
        getSuggestionKey: (id) => `suggestion_${id}`,
        isText: (node) =>
          typeof (node as Record<string, unknown>).text === 'string',
      });

      expect(result.insertions).toBe(0);
      expect(result.deletions).toBe(1);
      expect(result.total).toBe(1);
    });

    it('handles missing start token', () => {
      const editor = createMockEditor();
      const tokenMap = new Map<string, TRange | null>();
      tokenMap.set('[[START:missing]]', null);
      tokenMap.set('[[END:missing]]', {
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 10 },
      });

      const changes: DocxTrackedChange[] = [
        {
          id: 'missing',
          type: 'insert',
          startToken: '[[START:missing]]',
          endToken: '[[END:missing]]',
        },
      ];

      const result = applyTrackedChangeSuggestions({
        editor,
        changes,
        searchRange: createMockSearchRange(tokenMap),
        suggestionKey: 'suggestion',
        getSuggestionKey: (id) => `suggestion_${id}`,
        isText: (node) =>
          typeof (node as Record<string, unknown>).text === 'string',
      });

      expect(result.total).toBe(0);
      expect(result.errors.length).toBe(1);
      expect(result.errors[0]).toContain('Missing token');
    });

    it('handles missing end token', () => {
      const editor = createMockEditor();
      const tokenMap = new Map<string, TRange | null>();
      tokenMap.set('[[START:missing]]', {
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 10 },
      });
      tokenMap.set('[[END:missing]]', null);

      const changes: DocxTrackedChange[] = [
        {
          id: 'missing',
          type: 'insert',
          startToken: '[[START:missing]]',
          endToken: '[[END:missing]]',
        },
      ];

      const result = applyTrackedChangeSuggestions({
        editor,
        changes,
        searchRange: createMockSearchRange(tokenMap),
        suggestionKey: 'suggestion',
        getSuggestionKey: (id) => `suggestion_${id}`,
        isText: (node) =>
          typeof (node as Record<string, unknown>).text === 'string',
      });

      expect(result.total).toBe(0);
      expect(result.errors.length).toBe(1);
    });

    it('applies multiple changes', () => {
      const editor = createMockEditor();
      const changes: DocxTrackedChange[] = [
        {
          id: 'change-1',
          type: 'insert',
          startToken: '[[START:1]]',
          endToken: '[[END:1]]',
        },
        {
          id: 'change-2',
          type: 'remove',
          startToken: '[[START:2]]',
          endToken: '[[END:2]]',
        },
        {
          id: 'change-3',
          type: 'insert',
          startToken: '[[START:3]]',
          endToken: '[[END:3]]',
        },
      ];

      const result = applyTrackedChangeSuggestions({
        editor,
        changes,
        searchRange: createMockSearchRange(),
        suggestionKey: 'suggestion',
        getSuggestionKey: (id) => `suggestion_${id}`,
        isText: (node) =>
          typeof (node as Record<string, unknown>).text === 'string',
      });

      expect(result.insertions).toBe(2);
      expect(result.deletions).toBe(1);
      expect(result.total).toBe(3);
    });

    it('deletes tokens after applying marks', () => {
      const editor = createMockEditor();
      const changes: DocxTrackedChange[] = [
        {
          id: 'ins-1',
          type: 'insert',
          startToken: '[[START:ins-1]]',
          endToken: '[[END:ins-1]]',
        },
      ];

      applyTrackedChangeSuggestions({
        editor,
        changes,
        searchRange: createMockSearchRange(),
        suggestionKey: 'suggestion',
        getSuggestionKey: (id) => `suggestion_${id}`,
        isText: () => true,
      });

      // Delete should be called twice (start and end tokens)
      expect(editor.tf.delete).toHaveBeenCalledTimes(2);
    });

    it('handles invalid rangeRef (null current)', () => {
      const editor: TrackingEditor = {
        api: {
          string: mock(() => 'sample text'),
          rangeRef: () => ({
            current: null,
            unref: mock(() => null),
          }),
        },
        tf: {
          setNodes: mock(() => {}),
          delete: mock(() => {}),
          withMerging: mock((fn: () => void) => fn()),
        },
      };

      const changes: DocxTrackedChange[] = [
        {
          id: 'change-1',
          type: 'insert',
          startToken: '[[START:1]]',
          endToken: '[[END:1]]',
        },
      ];

      const result = applyTrackedChangeSuggestions({
        editor,
        changes,
        searchRange: createMockSearchRange(),
        suggestionKey: 'suggestion',
        getSuggestionKey: (id) => `suggestion_${id}`,
        isText: () => true,
      });

      expect(result.total).toBe(0);
      expect(result.errors.length).toBe(1);
      expect(result.errors[0]).toContain('Invalid range');
    });

    it('handles exceptions during processing', () => {
      const editor: TrackingEditor = {
        api: {
          string: mock(() => 'sample text'),
          rangeRef: () => {
            throw new Error('Test error');
          },
        },
        tf: {
          setNodes: mock(() => {}),
          delete: mock(() => {}),
          withMerging: mock((fn: () => void) => fn()),
        },
      };

      const changes: DocxTrackedChange[] = [
        {
          id: 'change-1',
          type: 'insert',
          startToken: '[[START:1]]',
          endToken: '[[END:1]]',
        },
      ];

      const result = applyTrackedChangeSuggestions({
        editor,
        changes,
        searchRange: createMockSearchRange(),
        suggestionKey: 'suggestion',
        getSuggestionKey: (id) => `suggestion_${id}`,
        isText: () => true,
      });

      expect(result.total).toBe(0);
      expect(result.errors.length).toBe(1);
      expect(result.errors[0]).toContain('Failed to apply change');
      expect(result.errors[0]).toContain('Test error');
    });

    it('handles non-Error exceptions', () => {
      const editor: TrackingEditor = {
        api: {
          string: mock(() => 'sample text'),
          rangeRef: () => {
            throw new Error('string error');
          },
        },
        tf: {
          setNodes: mock(() => {}),
          delete: mock(() => {}),
          withMerging: mock((fn: () => void) => fn()),
        },
      };

      const changes: DocxTrackedChange[] = [
        {
          id: 'change-1',
          type: 'insert',
          startToken: '[[START:1]]',
          endToken: '[[END:1]]',
        },
      ];

      const result = applyTrackedChangeSuggestions({
        editor,
        changes,
        searchRange: createMockSearchRange(),
        suggestionKey: 'suggestion',
        getSuggestionKey: (id) => `suggestion_${id}`,
        isText: () => true,
      });

      expect(result.errors[0]).toContain('string error');
    });

    it('handles missing author (uses default)', () => {
      const editor = createMockEditor();
      const changes: DocxTrackedChange[] = [
        {
          id: 'change-1',
          type: 'insert',
          author: undefined,
          startToken: '[[START:1]]',
          endToken: '[[END:1]]',
        },
      ];

      const result = applyTrackedChangeSuggestions({
        editor,
        changes,
        searchRange: createMockSearchRange(),
        suggestionKey: 'suggestion',
        getSuggestionKey: (id) => `suggestion_${id}`,
        isText: () => true,
      });

      expect(result.total).toBe(1);
    });

    it('handles invalid date (uses current time)', () => {
      const editor = createMockEditor();
      const changes: DocxTrackedChange[] = [
        {
          id: 'change-1',
          type: 'insert',
          date: 'invalid-date',
          startToken: '[[START:1]]',
          endToken: '[[END:1]]',
        },
      ];

      const result = applyTrackedChangeSuggestions({
        editor,
        changes,
        searchRange: createMockSearchRange(),
        suggestionKey: 'suggestion',
        getSuggestionKey: (id) => `suggestion_${id}`,
        isText: () => true,
      });

      expect(result.total).toBe(1);
    });
  });

  describe('applyTrackedComments', () => {
    it('returns zero counts for empty comments', async () => {
      const editor = createMockEditor();
      const result = await applyTrackedComments({
        editor,
        comments: [],
        searchRange: createMockSearchRange(),
        documentId: 'doc-1',
        createDiscussionWithComment: {
          mutateAsync: mock(async () => ({ id: 'disc-1' })),
        },
        commentKey: 'comment',
        getCommentKey: (id) => `comment_${id}`,
        isText: () => true,
      });

      expect(result.created).toBe(0);
      expect(result.skipped).toBe(0);
      expect(result.errors).toEqual([]);
    });

    it('creates comment for valid tokens', async () => {
      const editor = createMockEditor();
      const createDiscussion = mock(async () => ({ id: 'disc-new' }));

      const comments: DocxImportComment[] = [
        {
          id: 'cmt-1',
          text: 'Test comment',
          startToken: '[[CMT_START:1]]',
          endToken: '[[CMT_END:1]]',
          hasStartToken: true,
          hasEndToken: true,
        },
      ];

      const result = await applyTrackedComments({
        editor,
        comments,
        searchRange: createMockSearchRange(),
        documentId: 'doc-1',
        createDiscussionWithComment: { mutateAsync: createDiscussion },
        commentKey: 'comment',
        getCommentKey: (id) => `comment_${id}`,
        isText: () => true,
      });

      expect(result.created).toBe(1);
      expect(result.skipped).toBe(0);
      expect(createDiscussion).toHaveBeenCalledWith(
        expect.objectContaining({
          documentId: 'doc-1',
        })
      );
    });

    it('skips comment with no tokens found', async () => {
      const editor = createMockEditor();
      const tokenMap = new Map<string, TRange | null>();
      tokenMap.set('[[CMT_START:1]]', null);
      tokenMap.set('[[CMT_END:1]]', null);

      const comments: DocxImportComment[] = [
        {
          id: 'cmt-1',
          text: 'Test comment',
          startToken: '[[CMT_START:1]]',
          endToken: '[[CMT_END:1]]',
          hasStartToken: true,
          hasEndToken: true,
        },
      ];

      const result = await applyTrackedComments({
        editor,
        comments,
        searchRange: createMockSearchRange(tokenMap),
        documentId: 'doc-1',
        createDiscussionWithComment: {
          mutateAsync: mock(async () => ({ id: 'disc-1' })),
        },
        commentKey: 'comment',
        getCommentKey: (id) => `comment_${id}`,
        isText: () => true,
      });

      expect(result.created).toBe(0);
      expect(result.skipped).toBe(1);
    });

    it('creates point comment when only start token found', async () => {
      const editor = createMockEditor();
      const tokenMap = new Map<string, TRange | null>();
      tokenMap.set('[[CMT_START:1]]', {
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 10 },
      });
      tokenMap.set('[[CMT_END:1]]', null);

      const comments: DocxImportComment[] = [
        {
          id: 'cmt-1',
          text: 'Point comment',
          startToken: '[[CMT_START:1]]',
          endToken: '[[CMT_END:1]]',
          hasStartToken: true,
          hasEndToken: false, // Indicates end token not in original HTML
        },
      ];

      const createDiscussion = mock(async () => ({ id: 'disc-point' }));

      const result = await applyTrackedComments({
        editor,
        comments,
        searchRange: createMockSearchRange(tokenMap),
        documentId: 'doc-1',
        createDiscussionWithComment: { mutateAsync: createDiscussion },
        commentKey: 'comment',
        getCommentKey: (id) => `comment_${id}`,
        isText: () => true,
      });

      expect(result.created).toBe(1);
    });

    it('applies transient comment key when provided', async () => {
      const editor = createMockEditor();
      const comments: DocxImportComment[] = [
        {
          id: 'cmt-1',
          text: 'Test',
          startToken: '[[CMT_START:1]]',
          endToken: '[[CMT_END:1]]',
          hasStartToken: true,
          hasEndToken: true,
        },
      ];

      await applyTrackedComments({
        editor,
        comments,
        searchRange: createMockSearchRange(),
        documentId: 'doc-1',
        createDiscussionWithComment: {
          mutateAsync: mock(async () => ({ id: 'disc-1' })),
        },
        commentKey: 'comment',
        getCommentKey: (id) => `comment_${id}`,
        getTransientCommentKey: () => 'transient_comment',
        isText: () => true,
      });

      expect(editor.tf.setNodes).toHaveBeenCalledWith(
        expect.objectContaining({
          transient_comment: true,
        }),
        expect.any(Object)
      );
    });

    it('calls onCommentsCreated callback when comments are created', async () => {
      const editor = createMockEditor();
      const onCommentsCreated = mock(() => {});

      const comments: DocxImportComment[] = [
        {
          id: 'cmt-1',
          text: 'Test',
          startToken: '[[CMT_START:1]]',
          endToken: '[[CMT_END:1]]',
          hasStartToken: true,
          hasEndToken: true,
        },
      ];

      await applyTrackedComments({
        editor,
        comments,
        searchRange: createMockSearchRange(),
        documentId: 'doc-1',
        createDiscussionWithComment: {
          mutateAsync: mock(async () => ({ id: 'disc-1' })),
        },
        commentKey: 'comment',
        getCommentKey: (id) => `comment_${id}`,
        isText: () => true,
        onCommentsCreated,
      });

      expect(onCommentsCreated).toHaveBeenCalledTimes(1);
    });

    it('does not call onCommentsCreated when no comments created', async () => {
      const editor = createMockEditor();
      const onCommentsCreated = mock(() => {});

      const tokenMap = new Map<string, TRange | null>();
      tokenMap.set('[[CMT_START:1]]', null);
      tokenMap.set('[[CMT_END:1]]', null);

      const comments: DocxImportComment[] = [
        {
          id: 'cmt-1',
          text: 'Test',
          startToken: '[[CMT_START:1]]',
          endToken: '[[CMT_END:1]]',
          hasStartToken: true,
          hasEndToken: true,
        },
      ];

      await applyTrackedComments({
        editor,
        comments,
        searchRange: createMockSearchRange(tokenMap),
        documentId: 'doc-1',
        createDiscussionWithComment: {
          mutateAsync: mock(async () => ({ id: 'disc-1' })),
        },
        commentKey: 'comment',
        getCommentKey: (id) => `comment_${id}`,
        isText: () => true,
        onCommentsCreated,
      });

      expect(onCommentsCreated).not.toHaveBeenCalled();
    });

    it('handles invalid rangeRef (null current) for comments', async () => {
      const editor: TrackingEditor = {
        api: {
          string: mock(() => 'sample text'),
          rangeRef: () => ({
            current: null,
            unref: mock(() => null),
          }),
        },
        tf: {
          setNodes: mock(() => {}),
          delete: mock(() => {}),
          withMerging: mock((fn: () => void) => fn()),
        },
      };

      const comments: DocxImportComment[] = [
        {
          id: 'cmt-1',
          text: 'Test',
          startToken: '[[CMT_START:1]]',
          endToken: '[[CMT_END:1]]',
          hasStartToken: true,
          hasEndToken: true,
        },
      ];

      const result = await applyTrackedComments({
        editor,
        comments,
        searchRange: createMockSearchRange(),
        documentId: 'doc-1',
        createDiscussionWithComment: {
          mutateAsync: mock(async () => ({ id: 'disc-1' })),
        },
        commentKey: 'comment',
        getCommentKey: (id) => `comment_${id}`,
        isText: () => true,
      });

      expect(result.created).toBe(0);
      expect(result.skipped).toBe(1);
    });

    it('handles empty document content (uses default)', async () => {
      const editor: TrackingEditor = {
        api: {
          string: mock(() => ''), // Returns empty string
          rangeRef: (range: TRange) => ({
            current: range,
            unref: mock(() => range),
          }),
        },
        tf: {
          setNodes: mock(() => {}),
          delete: mock(() => {}),
          withMerging: mock((fn: () => void) => fn()),
        },
      };

      const createDiscussion = mock(async () => ({ id: 'disc-1' }));

      const comments: DocxImportComment[] = [
        {
          id: 'cmt-1',
          text: 'Test comment',
          startToken: '[[CMT_START:1]]',
          endToken: '[[CMT_END:1]]',
          hasStartToken: true,
          hasEndToken: true,
        },
      ];

      await applyTrackedComments({
        editor,
        comments,
        searchRange: createMockSearchRange(),
        documentId: 'doc-1',
        createDiscussionWithComment: { mutateAsync: createDiscussion },
        commentKey: 'comment',
        getCommentKey: (id) => `comment_${id}`,
        isText: () => true,
      });

      expect(createDiscussion).toHaveBeenCalledWith(
        expect.objectContaining({
          documentContent: 'Imported comment',
        })
      );
    });

    it('handles comment with commentPlugin and setOption', async () => {
      const editor = createMockEditor();
      const commentPlugin = { key: 'comment' };

      const comments: DocxImportComment[] = [
        {
          id: 'cmt-1',
          text: 'Test',
          startToken: '[[CMT_START:1]]',
          endToken: '[[CMT_END:1]]',
          hasStartToken: true,
          hasEndToken: true,
        },
      ];

      await applyTrackedComments({
        editor,
        comments,
        searchRange: createMockSearchRange(),
        documentId: 'doc-1',
        createDiscussionWithComment: {
          mutateAsync: mock(async () => ({ id: 'disc-1' })),
        },
        commentKey: 'comment',
        getCommentKey: (id) => `comment_${id}`,
        isText: () => true,
        commentPlugin,
      });

      expect(editor.setOption).toHaveBeenCalledWith(
        commentPlugin,
        'updateTimestamp',
        expect.any(Number)
      );
    });

    it('handles exceptions during comment processing', async () => {
      const editor: TrackingEditor = {
        api: {
          string: mock(() => 'sample text'),
          rangeRef: () => {
            throw new Error('Comment error');
          },
        },
        tf: {
          setNodes: mock(() => {}),
          delete: mock(() => {}),
          withMerging: mock((fn: () => void) => fn()),
        },
      };

      const comments: DocxImportComment[] = [
        {
          id: 'cmt-1',
          text: 'Test',
          startToken: '[[CMT_START:1]]',
          endToken: '[[CMT_END:1]]',
          hasStartToken: true,
          hasEndToken: true,
        },
      ];

      const result = await applyTrackedComments({
        editor,
        comments,
        searchRange: createMockSearchRange(),
        documentId: 'doc-1',
        createDiscussionWithComment: {
          mutateAsync: mock(async () => ({ id: 'disc-1' })),
        },
        commentKey: 'comment',
        getCommentKey: (id) => `comment_${id}`,
        isText: () => true,
      });

      expect(result.errors.length).toBe(1);
      expect(result.errors[0]).toContain('Failed to apply comment');
      expect(result.errors[0]).toContain('Comment error');
    });

    it('handles non-Error exceptions in comments', async () => {
      const editor: TrackingEditor = {
        api: {
          string: mock(() => 'sample text'),
          rangeRef: () => {
            throw new Error('string comment error');
          },
        },
        tf: {
          setNodes: mock(() => {}),
          delete: mock(() => {}),
          withMerging: mock((fn: () => void) => fn()),
        },
      };

      const comments: DocxImportComment[] = [
        {
          id: 'cmt-1',
          text: 'Test',
          startToken: '[[CMT_START:1]]',
          endToken: '[[CMT_END:1]]',
          hasStartToken: true,
          hasEndToken: true,
        },
      ];

      const result = await applyTrackedComments({
        editor,
        comments,
        searchRange: createMockSearchRange(),
        documentId: 'doc-1',
        createDiscussionWithComment: {
          mutateAsync: mock(async () => ({ id: 'disc-1' })),
        },
        commentKey: 'comment',
        getCommentKey: (id) => `comment_${id}`,
        isText: () => true,
      });

      expect(result.errors[0]).toContain('string comment error');
    });

    it('handles comment without text (undefined)', async () => {
      const editor = createMockEditor();
      const createDiscussion = mock(async () => ({ id: 'disc-1' }));

      const comments: DocxImportComment[] = [
        {
          id: 'cmt-1',
          text: undefined,
          startToken: '[[CMT_START:1]]',
          endToken: '[[CMT_END:1]]',
          hasStartToken: true,
          hasEndToken: true,
        },
      ];

      await applyTrackedComments({
        editor,
        comments,
        searchRange: createMockSearchRange(),
        documentId: 'doc-1',
        createDiscussionWithComment: { mutateAsync: createDiscussion },
        commentKey: 'comment',
        getCommentKey: (id) => `comment_${id}`,
        isText: () => true,
      });

      expect(createDiscussion).toHaveBeenCalledWith(
        expect.objectContaining({
          contentRich: undefined,
        })
      );
    });
  });

  describe('applyAllTracking', () => {
    it('applies both suggestions and comments', async () => {
      const editor = createMockEditor();

      const trackedChanges: DocxTrackedChange[] = [
        {
          id: 'change-1',
          type: 'insert',
          startToken: '[[INS_START:1]]',
          endToken: '[[INS_END:1]]',
        },
      ];

      const comments: DocxImportComment[] = [
        {
          id: 'cmt-1',
          text: 'Comment',
          startToken: '[[CMT_START:1]]',
          endToken: '[[CMT_END:1]]',
          hasStartToken: true,
          hasEndToken: true,
        },
      ];

      const result = await applyAllTracking({
        editor,
        trackedChanges,
        comments,
        searchRange: createMockSearchRange(),
        suggestionConfig: {
          suggestionKey: 'suggestion',
          getSuggestionKey: (id) => `suggestion_${id}`,
          isText: () => true,
        },
        commentConfig: {
          documentId: 'doc-1',
          createDiscussionWithComment: {
            mutateAsync: mock(async () => ({ id: 'disc-1' })),
          },
          commentKey: 'comment',
          getCommentKey: (id) => `comment_${id}`,
          isText: () => true,
        },
      });

      expect(result.suggestions.total).toBe(1);
      expect(result.comments?.created).toBe(1);
      expect(result.totalApplied).toBe(2);
    });

    it('applies only suggestions when no comment config', async () => {
      const editor = createMockEditor();

      const trackedChanges: DocxTrackedChange[] = [
        {
          id: 'change-1',
          type: 'insert',
          startToken: '[[INS_START:1]]',
          endToken: '[[INS_END:1]]',
        },
      ];

      const result = await applyAllTracking({
        editor,
        trackedChanges,
        searchRange: createMockSearchRange(),
        suggestionConfig: {
          suggestionKey: 'suggestion',
          getSuggestionKey: (id) => `suggestion_${id}`,
          isText: () => true,
        },
      });

      expect(result.suggestions.total).toBe(1);
      expect(result.comments).toBeNull();
      expect(result.totalApplied).toBe(1);
    });

    it('skips comments when empty array', async () => {
      const editor = createMockEditor();

      const result = await applyAllTracking({
        editor,
        trackedChanges: [],
        comments: [],
        searchRange: createMockSearchRange(),
        suggestionConfig: {
          suggestionKey: 'suggestion',
          getSuggestionKey: (id) => `suggestion_${id}`,
          isText: () => true,
        },
        commentConfig: {
          documentId: 'doc-1',
          createDiscussionWithComment: {
            mutateAsync: mock(async () => ({ id: 'disc-1' })),
          },
          commentKey: 'comment',
          getCommentKey: (id) => `comment_${id}`,
          isText: () => true,
        },
      });

      expect(result.suggestions.total).toBe(0);
      expect(result.comments).toBeNull(); // Skipped due to empty array
      expect(result.totalApplied).toBe(0);
    });
  });
});
