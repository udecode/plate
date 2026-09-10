import type { Descendant, Range } from 'platejs';
import { extractLegacyCommentRanges } from 'platejs/migrations';

declare const document: readonly Descendant[];

const result = extractLegacyCommentRanges(document, {
  threadIds: new Set(['thread-1']),
});

result.document satisfies readonly Descendant[];
result.comments[0]?.id satisfies string | undefined;
result.comments[0]?.ranges satisfies readonly Range[] | undefined;
result.diagnostics[0]?.code satisfies
  | 'anonymous-comment'
  | 'discontinuous-group'
  | 'draft-only'
  | 'invalid-range'
  | 'missing-thread'
  | 'orphan-id'
  | undefined;
