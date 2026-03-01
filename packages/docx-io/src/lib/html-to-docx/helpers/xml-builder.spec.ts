import { describe, expect, it, mock } from 'bun:test';
import { buildRunsFromTextWithTokens } from './xml-builder';

// Mock types
type MockDocxDocumentInstance = {
  _trackingState?: any;
  comments: any[];
  commentIdMap: Map<string, number>;
  lastCommentId: number;
  revisionIdMap: Map<string, number>;
  lastRevisionId: number;
  ensureComment: (data: any, parentParaId?: string) => number;
  getCommentId: (id: string) => number;
  getRevisionId: (id?: string) => number;
};

describe('buildRunsFromTextWithTokens', () => {
  it('should emit commentRangeEnd for reply with custom ID', () => {
    const parentId = 'parent-1';
    const replyId = 'custom-reply-id';
    // xml-builder constructs composite reply ID: `${parentId}-reply-${replyId}`
    const compositeReplyId = `${parentId}-reply-${replyId}`;
    const parentNumericId = 100;
    const replyNumericId = 200;

    const mockInstance: MockDocxDocumentInstance = {
      comments: [],
      commentIdMap: new Map(),
      lastCommentId: 0,
      revisionIdMap: new Map(),
      lastRevisionId: 0,
      ensureComment: (data: any, _parentParaId?: string) => {
        if (data.id === parentId) return parentNumericId;
        if (data.id === compositeReplyId) return replyNumericId;
        return 999;
      },
      getCommentId: (id: string) => {
        if (id === parentId) return parentNumericId;
        return 0;
      },
      getRevisionId: (_id?: string) => 0,
    };

    // Populate commentIdMap as it would be during execution
    mockInstance.commentIdMap.set(parentId, parentNumericId);
    mockInstance.commentIdMap.set(compositeReplyId, replyNumericId);

    const tokenText = `[[DOCX_CMT_START:${encodeURIComponent(
      JSON.stringify({
        id: parentId,
        replies: [{ id: replyId, text: 'Reply' }],
      })
    )}]]Comment Text[[DOCX_CMT_END:${encodeURIComponent(parentId)}]]`;

    const fragments = buildRunsFromTextWithTokens(
      tokenText,
      {},
      mockInstance as any
    );

    expect(fragments).not.toBeNull();
    if (!fragments) return;

    // Convert fragments to XML strings for inspection
    const xmlStrings = fragments.map((f) => f.toString());
    const combinedXml = xmlStrings.join('');

    // Check for Parent Start (using regex to be namespace-agnostic)
    expect(combinedXml).toMatch(
      new RegExp(`commentRangeStart[^>]*id="${parentNumericId}"`)
    );

    // Check for Reply Start
    expect(combinedXml).toMatch(
      new RegExp(`commentRangeStart[^>]*id="${replyNumericId}"`)
    );

    // Check for Parent End
    expect(combinedXml).toMatch(
      new RegExp(`commentRangeEnd[^>]*id="${parentNumericId}"`)
    );

    // Check for Reply End - THIS IS THE FIX VERIFICATION
    // This asserts that the fix logic correctly found the reply ID and emitted the end tag
    expect(combinedXml).toMatch(
      new RegExp(`commentRangeEnd[^>]*id="${replyNumericId}"`)
    );
  });

  it('should fallback to generated ID when reply.id is missing', () => {
    const parentId = 'parent-1';
    const parentNumericId = 100;
    const expectedGeneratedId = `${parentId}-reply-0`;
    const replyNumericId = 200;

    const mockInstance: MockDocxDocumentInstance = {
      comments: [],
      commentIdMap: new Map(),
      lastCommentId: 0,
      revisionIdMap: new Map(),
      lastRevisionId: 0,
      ensureComment: (data: any, _parentParaId?: string) => {
        if (data.id === parentId) return parentNumericId;
        if (data.id === expectedGeneratedId) return replyNumericId;
        return 999;
      },
      getCommentId: (id: string) => {
        if (id === parentId) return parentNumericId;
        return 0;
      },
      getRevisionId: (_id?: string) => 0,
    };

    mockInstance.commentIdMap.set(parentId, parentNumericId);
    mockInstance.commentIdMap.set(expectedGeneratedId, replyNumericId);

    const tokenText = `[[DOCX_CMT_START:${encodeURIComponent(
      JSON.stringify({
        id: parentId,
        replies: [{ text: 'Reply without ID' }], // No ID provided
      })
    )}]]Comment Text[[DOCX_CMT_END:${encodeURIComponent(parentId)}]]`;

    const fragments = buildRunsFromTextWithTokens(
      tokenText,
      {},
      mockInstance as any
    );

    expect(fragments).not.toBeNull();
    if (!fragments) return;

    const xmlStrings = fragments.map((f) => f.toString());
    const combinedXml = xmlStrings.join('');

    // Check for Reply Start with expected generated ID
    expect(combinedXml).toMatch(
      new RegExp(`commentRangeStart[^>]*id="${replyNumericId}"`)
    );

    // Check for Reply End
    expect(combinedXml).toMatch(
      new RegExp(`commentRangeEnd[^>]*id="${replyNumericId}"`)
    );
  });
});
