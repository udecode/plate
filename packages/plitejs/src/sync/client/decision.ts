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
import { rebaseOver, sameDocument } from '../protocol';
import type { DecisionOrigin, KeptReason } from './outbox';

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
  origin: DecisionOrigin,
  head: JsonEditorValue
) => DocumentChange | KeptReason;

const failed = (
  check: 'judge' | 'moved' | 'stale' | 'structure'
): KeptReason => ({ check, kind: 'decision' });

export const MOVED = failed('moved');

const rebasedAt = (
  accepted: readonly DocumentChange[],
  own: DocumentChange,
  before: JsonEditorValue,
  head: JsonEditorValue
) => {
  try {
    const rebase = rebaseOver(accepted, own, before);

    return rebase.kind === 'rebased' ? rebase.change.apply(head) : null;
  } catch {
    return null;
  }
};

const decideAgain = (
  decision: SyncDecision,
  { before, change, since }: DecisionOrigin,
  head: JsonEditorValue,
  isSetValued: SetValued
): DocumentChange | KeptReason => {
  const rebuilt = decision.atHead(head);

  if (!rebuilt) return failed('stale');

  const own = DocumentChange.fromJSON(change);
  const accepted = since.map((json) => DocumentChange.fromJSON(json));
  const { kind } = judgeSpan({
    accepted: accepted.map(viewOfChange),
    base: before,
    head: null,
    isSetValued,
    merged: [viewOfChange(rebuilt)],
    own: [viewOfChange(own)],
  });

  if (kind === 'lost' || kind === 'unjudged') return failed('judge');
  if (decision.decidesStructure) {
    const rebased = rebasedAt(accepted, own, before, head);

    if (!rebased || !sameDocument(rebased, rebuilt.apply(head))) {
      return failed('structure');
    }
  }

  return rebuilt;
};

export const syncDecider = (
  decisionOf: (step: SyncDecisionStep) => SyncDecision | null,
  isSetValued: SetValued
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

      return decision
        ? decideAgain(decision, origin, head, isSetValued)
        : MOVED;
    } catch {
      return MOVED;
    }
  };
};
