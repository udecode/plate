import {
  DocumentChange,
  type DocumentChangeJson,
} from '../../core/change/document-change';
import {
  judgeSpan,
  type SetValued,
  viewOfChange,
} from '../../core/change/effect-ledger';
import type { JsonEditorValue } from '../../core/change/tokens';
import type { CompiledEditorSchema } from '../../core/schema-compiler';
import { rebaseOver, type SyncVerdict, sameDocument } from '../protocol';
import type { BatchOrigin, KeptReason } from './outbox';

export type SyncDecision = Readonly<{
  /** The change at `head`, or null when a change it decides reads otherwise. */
  atHead: (head: JsonEditorValue) => DocumentChange | null;
  decidesStructure: boolean;
}>;

export type SyncDecisionStep = Readonly<{
  after: JsonEditorValue;
  before: JsonEditorValue;
  change: DocumentChange;
}>;

/** What `step` decides, or null when the tab cannot decide it again. */
export type SyncDecisionOf = (
  step: SyncDecisionStep,
  actor: string,
  schema: CompiledEditorSchema
) => SyncDecision | null;

/** A decision batch at `head`, rebuilt from its origin or kept on the device. */
export type SyncDecide = (
  origin: BatchOrigin,
  head: JsonEditorValue
) => DocumentChange | KeptReason;

export type SyncJudge = (
  origin: BatchOrigin,
  merged: DocumentChange
) => SyncVerdict;

const failed = (
  check: Extract<KeptReason, { kind: 'decision' }>['check']
): KeptReason => ({ check, kind: 'decision' });

export const MOVED = failed('moved');

const TOKENS_PER_CHANGE = 8000;

export const syncJudge =
  (isSetValued: SetValued): SyncJudge =>
  ({ before, change, since }, merged) =>
    judgeSpan({
      accepted: since.map((json) =>
        viewOfChange(DocumentChange.fromJSON(json))
      ),
      base: before,
      budget: TOKENS_PER_CHANGE * (since.length + 2),
      head: null,
      isSetValued,
      merged: [viewOfChange(merged)],
      own: [viewOfChange(DocumentChange.fromJSON(change))],
    }).kind;

const rebasedAt = (
  { before, change, since }: BatchOrigin,
  head: JsonEditorValue
) => {
  try {
    const rebase = rebaseOver(
      since.map((json) => DocumentChange.fromJSON(json)),
      DocumentChange.fromJSON(change),
      before
    );

    return rebase.kind === 'rebased' ? rebase.change.apply(head) : null;
  } catch {
    return null;
  }
};

const decideAgain = (
  decision: SyncDecision,
  origin: BatchOrigin,
  head: JsonEditorValue,
  judge: SyncJudge
): DocumentChange | KeptReason => {
  const rebuilt = decision.atHead(head);

  if (!rebuilt) return failed('stale');

  const kind = judge(origin, rebuilt);

  if (kind === 'lost' || kind === 'unjudged') return failed('judge');
  if (decision.decidesStructure) {
    const rebased = rebasedAt(origin, head);

    if (!rebased || !sameDocument(rebased, rebuilt.apply(head))) {
      return failed('structure');
    }
  }

  return rebuilt;
};

export const syncDecider = (
  decisionOf: (step: SyncDecisionStep) => SyncDecision | null,
  judge: SyncJudge
): SyncDecide => {
  const decisions = new WeakMap<DocumentChangeJson, SyncDecision | null>();

  return (origin, head) => {
    try {
      let decision = decisions.get(origin.change);

      if (decision === undefined) {
        const change = DocumentChange.fromJSON(origin.change);

        decision = decisionOf({
          after: change.apply(origin.before),
          before: origin.before,
          change,
        });
        decisions.set(origin.change, decision);
      }

      return decision ? decideAgain(decision, origin, head, judge) : MOVED;
    } catch {
      return failed('threw');
    }
  };
};
