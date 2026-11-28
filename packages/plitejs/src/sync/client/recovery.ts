import {
  bindV4DocumentChange,
  DocumentChange,
} from '../../core/change/document-change';
import { jsonEqual } from '../../core/change/json';
import {
  isElementNode,
  type JsonEditorValue,
  type JsonElementNode,
  type JsonNode,
} from '../../core/change/tokens';
import { toV4TextStream } from '../../core/change/v4/apply';
import type { V4Step } from '../../core/change/v4/types';
import { rebaseOver, sameDocument } from '../protocol';
import { isShown, shownValue } from './chain';
import type { OutboxRecord, SavedBatch } from './outbox';
import { recoverScopedOrigin } from './scoped-origin';

const findElementById = (
  value: JsonEditorValue,
  id: string
): JsonElementNode | null => {
  const walk = (nodes: readonly JsonNode[]): JsonElementNode | null => {
    for (const node of nodes) {
      if (!isElementNode(node)) continue;
      if (node.id === id) return node;

      const found = walk(node.children);

      if (found) return found;
    }

    return null;
  };

  const main = walk(value.children);

  if (main) return main;
  if (value.roots) {
    for (const nodes of Object.values(value.roots)) {
      const found = walk(nodes);

      if (found) return found;
    }
  }

  return null;
};

const dropOrphanedInheritedAuthoredMarks = (
  change: DocumentChange,
  view: JsonEditorValue
): DocumentChange => {
  const json = change.toJSON();

  if (!json.steps || json.steps.length === 0) return change;

  let modified = false;
  const nextSteps: V4Step[] = json.steps.map((step) => {
    if (
      step.op !== 'insert_text' ||
      !step.marks ||
      !Array.isArray(step.marks.authored) ||
      step.marks.authored.length === 0
    ) {
      return step;
    }

    const target = findElementById(view, step.target);

    if (!target) return step;

    const stream = toV4TextStream(target.children);
    const neighborAt = (index: number) => {
      const unit = stream.units[index];

      return unit && unit.kind === 'char' && Array.isArray(unit.marks.authored)
        ? unit.marks.authored
        : [];
    };
    const surrounding = [
      ...neighborAt(step.offset - 1),
      ...neighborAt(step.offset),
    ];
    const kept = step.marks.authored.filter((mark) =>
      surrounding.some((existing) => jsonEqual(existing, mark))
    );

    if (kept.length === step.marks.authored.length) return step;
    modified = true;

    const { authored: _removed, ...otherMarks } = step.marks;
    const nextMarks =
      kept.length > 0 ? { ...otherMarks, authored: kept } : otherMarks;
    const { marks: _oldMarks, ...restStep } = step;

    return Object.keys(nextMarks).length > 0
      ? { ...restStep, marks: nextMarks }
      : restStep;
  });

  if (!modified) return change;

  return DocumentChange.fromJSON({
    ...(json.records ? { records: json.records } : {}),
    steps: nextSteps,
    version: 4,
  });
};

export type SyncKeptAction = 'apply' | 'discard';

export type SyncKeptRefusal =
  | 'blocked'
  | 'conflict'
  | 'decision'
  | 'failed'
  | 'gap'
  | 'missing'
  | 'rewritten'
  | 'stale'
  | 'stopped'
  | 'suggesting'
  | 'unchanged'
  | 'view';

export type SyncKeptResult =
  | Readonly<{ status: 'applied'; seq: number; threw?: true }>
  | Readonly<{ status: 'discarded' }>
  | Readonly<{ reason: SyncKeptRefusal; status: 'refused'; threw?: true }>;

export const refused = (
  reason: SyncKeptRefusal,
  threw = false
): SyncKeptResult => ({
  reason,
  status: 'refused',
  ...(threw ? { threw } : {}),
});

export const rebasedKept = (
  record: OutboxRecord,
  kept: Extract<SavedBatch, { state: 'kept' }>,
  writesAuthored: (change: DocumentChange) => boolean
):
  | Readonly<{
      authored: boolean;
      change: DocumentChange;
      draft: JsonEditorValue;
      view: JsonEditorValue;
    }>
  | Readonly<{ refused: SyncKeptRefusal }> => {
  const { origin, seq } = kept;

  if (!origin || origin.gap) return { refused: 'gap' };

  const later = record.batches.flatMap((batch) =>
    batch.seq > seq && isShown(batch) ? [batch.change] : []
  );
  const at = shownValue(
    record.confirmed.document,
    record.batches.filter((batch) => batch.seq < seq)
  );
  const view = shownValue(record.confirmed.document, record.batches);

  if (origin.before === undefined) {
    let own: DocumentChange;

    try {
      own = DocumentChange.fromJSON(origin.change);
    } catch {
      return { refused: 'gap' };
    }

    const recovered = recoverScopedOrigin(origin, at, later, view);

    if (!recovered.ok) return { refused: recovered.refused };

    const authored = writesAuthored(
      bindV4DocumentChange(own, recovered.scopedBase)
    );
    const recoveredChange = authored
      ? recovered.change
      : dropOrphanedInheritedAuthoredMarks(recovered.change, view);
    const draft =
      recoveredChange === recovered.change
        ? recovered.draft
        : recoveredChange.apply(view);

    return {
      authored,
      change: recoveredChange,
      draft,
      view,
    };
  }

  let own: DocumentChange;

  try {
    own = DocumentChange.fromJSON(origin.change);

    const reached = origin.since.reduce(
      (value, json) => DocumentChange.fromJSON(json).apply(value),
      origin.before
    );

    if (!sameDocument(reached, at)) return { refused: 'gap' };
  } catch {
    return { refused: 'gap' };
  }

  try {
    const rebase = rebaseOver(
      [...origin.since, ...later].map((json) => DocumentChange.fromJSON(json)),
      own,
      origin.before
    );

    if (rebase.kind !== 'rebased') return { refused: 'conflict' };

    const authored = writesAuthored(bindV4DocumentChange(own, origin.before));
    const recoveredChange = authored
      ? rebase.change
      : dropOrphanedInheritedAuthoredMarks(rebase.change, view);

    return {
      authored,
      change: recoveredChange,
      draft: recoveredChange.apply(view),
      view,
    };
  } catch {
    return { refused: 'conflict' };
  }
};
