import {
  bindV4DocumentChange,
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
  matchesRebased?: (
    rebased: JsonEditorValue,
    decided: JsonEditorValue
  ) => boolean;
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
  ({ before, change, since }, merged) => {
    if (!before) return 'held';

    let cursor = before;
    const accepted = since.map((json) => {
      const bound = bindV4DocumentChange(DocumentChange.fromJSON(json), cursor);

      cursor = bound.apply(cursor);
      return viewOfChange(bound);
    });

    return judgeSpan({
      accepted,
      base: before,
      budget: TOKENS_PER_CHANGE * (since.length + 2),
      head: null,
      isSetValued,
      merged: [viewOfChange(bindV4DocumentChange(merged, cursor))],
      own: [
        viewOfChange(
          bindV4DocumentChange(DocumentChange.fromJSON(change), before)
        ),
      ],
    }).kind;
  };

type IncrementalRebaseState = Readonly<{
  at: JsonEditorValue;
  count: number;
  failed: boolean;
  moved: DocumentChange;
}>;

const rebasedAtIncremental = (
  origin: BatchOrigin,
  head: JsonEditorValue,
  cache: WeakMap<DocumentChangeJson, IncrementalRebaseState>
) => {
  if (!origin.before) return null;

  try {
    let state = cache.get(origin.change);

    if (!state || state.count > origin.since.length) {
      state = {
        at: origin.before,
        count: 0,
        failed: false,
        moved: DocumentChange.fromJSON(origin.change),
      };
    }
    if (state.failed) return null;

    if (state.count < origin.since.length) {
      const pending = origin.since
        .slice(state.count)
        .map((json) => DocumentChange.fromJSON(json));
      const rebase = rebaseOver(pending, state.moved, state.at);

      if (rebase.kind !== 'rebased') {
        cache.set(origin.change, {
          ...state,
          count: origin.since.length,
          failed: true,
        });

        return null;
      }

      let nextAt = state.at;

      for (const entry of pending) nextAt = entry.apply(nextAt);

      state = {
        at: nextAt,
        count: origin.since.length,
        failed: false,
        moved: rebase.change,
      };
      cache.set(origin.change, state);
    }

    return state.moved.apply(head);
  } catch {
    return null;
  }
};

const decideAgain = (
  decision: SyncDecision,
  origin: BatchOrigin,
  head: JsonEditorValue,
  judge: SyncJudge,
  rebaseCache: WeakMap<DocumentChangeJson, IncrementalRebaseState>
): DocumentChange | KeptReason => {
  const rebuilt = decision.atHead(head);

  if (!rebuilt) return failed('stale');

  const kind = judge(origin, rebuilt);

  if (kind === 'lost' || kind === 'unjudged') return failed('judge');
  if (decision.decidesStructure) {
    const rebased = rebasedAtIncremental(origin, head, rebaseCache);
    const matches = decision.matchesRebased ?? sameDocument;

    if (!rebased || !matches(rebased, rebuilt.apply(head))) {
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
  const rebaseCache = new WeakMap<DocumentChangeJson, IncrementalRebaseState>();

  return (origin, head) => {
    try {
      if (!origin.before) return MOVED;

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
        ? decideAgain(decision, origin, head, judge, rebaseCache)
        : MOVED;
    } catch {
      return failed('threw');
    }
  };
};
