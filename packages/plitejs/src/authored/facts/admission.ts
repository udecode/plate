import {
  createInternalDocumentChange,
  DocumentChange,
  getInternalDocumentChangeRanges,
  getInternalDocumentChangeRecords,
  getInternalDocumentRootChange,
} from '../../core/change/document-change';
import {
  type DocumentIndex,
  NO_NODES,
  type SparseNodes,
  type NodeList,
} from '../../core/change/document-index';
import type { RootChange } from '../../core/change/root-change';
import type { JsonEditorValue } from '../../core/change/tokens';
import type { DocumentAdmission } from '../../core/document-admission';
import { getEditorRuntimeOwner } from '../../core/editor-runtime';
import { EditorMissingReferenceError } from '../../core/missing-reference';
import { getValueRecords, recordOpsBetween } from '../../core/record-store';
import type { EditorDocumentValue } from '../../interfaces/editor';
import type { Path } from '../../interfaces/path';
import { getDefined } from '../../internal/get-defined';
import { getReviewLedger } from '../ledger/ledger';
import {
  AuthoredMarkError,
  createAuthoredMarksValidator,
  isAuthoredSetValued,
} from '../tree/marks';
import { compactClaims } from './compact';
import {
  addCounts,
  assertRecordStore,
  assertRecordWrites,
  contentRootsOf,
  factsOf,
  insertionsIn,
  insertionsOf,
  rememberInsertions,
} from './facts';
import { CONTEXTS, VERDICTS, verdictIncarnationsOf } from './records';
import { settleValue } from './settle';

const firstChildEndingAfter = (index: DocumentIndex, position: number) => {
  let low = 0;
  let high = index.size;

  while (low < high) {
    const middle = Math.floor((low + high) / 2);

    if (index.childPosition([], middle + 1) <= position) low = middle + 1;
    else high = middle;
  }

  return low;
};

/**
 * The top-level children of `root` a change can touch: `from` to `to` after it,
 * and `from` to `beforeTo` before it, since every child outside them is
 * unchanged. One child more on each side covers a change at a boundary.
 */
const changedSpan = (
  change: DocumentChange,
  root: string,
  before: NodeList<unknown>,
  after: NodeList<unknown>,
  index: DocumentIndex
) => {
  if (change.createRoots.has(root) || change.deleteRoots.has(root)) {
    return { beforeTo: before.length, from: 0, to: after.length };
  }

  let from = after.length;
  let to = 0;

  for (const range of getInternalDocumentChangeRanges(change, root)) {
    from = Math.min(
      from,
      Math.max(0, firstChildEndingAfter(index, range[2]) - 1)
    );
    to = Math.max(
      to,
      Math.min(after.length, firstChildEndingAfter(index, range[3]) + 1)
    );
  }

  return from >= to
    ? null
    : { beforeTo: before.length - (after.length - to), from, to };
};

const repairOf = (
  after: JsonEditorValue,
  settled: JsonEditorValue,
  scope: ReadonlyMap<string, Iterable<number>>,
  indexOf: (root: string) => DocumentIndex
) => {
  const changes = new Map<string, RootChange>();
  const settledRoots = contentRootsOf(settled);

  for (const [root, nodes] of contentRootsOf(after)) {
    const next = settledRoots.get(root) ?? NO_NODES;

    if (next === nodes) continue;

    let index = indexOf(root);
    let composed: RootChange | null = null;
    const at = [...(scope.get(root) ?? [])].sort((left, right) => left - right);

    for (const child of at) {
      if (next.at(child) === nodes.at(child)) continue;

      const step = getDefined(
        getInternalDocumentRootChange(
          DocumentChange.between(
            { children: [getDefined(nodes.at(child))] },
            { children: [getDefined(next.at(child))] },
            { isSetValued: isAuthoredSetValued }
          ),
          'main'
        )
      ).embed(index.length, index.childPosition([], child));

      index = step.apply(index);
      composed = composed ? composed.compose(step) : step;
    }
    if (composed) changes.set(root, composed);
  }

  return createInternalDocumentChange(changes, {
    records: recordOpsBetween(getValueRecords(after), getValueRecords(settled)),
  });
};

export const createDocumentMarksValidator = () => {
  const { authorOf, validate } = createAuthoredMarksValidator();
  /** Validate the given nodes of `value`'s roots, each listed at its index. */
  const validateIn = (
    value: EditorDocumentValue,
    roots: Iterable<SparseNodes<unknown>>
  ) => {
    const facts = factsOf(value);
    const restsOn = (ctx: string, path: Path) => {
      if (!facts.contexts.has(ctx)) {
        throw new AuthoredMarkError(
          `Review context ${ctx} is missing. Save the whole read.value(), not only its children, so review contexts travel with the text.`,
          path,
          { cause: new EditorMissingReferenceError(ctx) }
        );
      }
    };

    for (const nodes of roots) validate(nodes, restsOn);
  };

  return {
    authorOf,
    validate: (value: EditorDocumentValue) =>
      validateIn(value, contentRootsOf(value).values()),
    validateIn,
  };
};

/**
 * Refuse a change that drops a context text still rests on. Contexts are never
 * removed while a room is live, so the record cannot arrive later and the
 * binding must not wait for it.
 */
const assertDroppedContextsUnused = (
  after: EditorDocumentValue,
  dropped: ReadonlySet<string>
) => {
  const { validate } = createAuthoredMarksValidator();
  const restsOn = (ctx: string, path: Path) => {
    if (dropped.has(ctx)) {
      throw new AuthoredMarkError(
        `Review context ${ctx} was dropped while text rests on it.`,
        path
      );
    }
  };

  for (const children of contentRootsOf(after).values()) {
    validate(children, restsOn);
  }
};

export const authoredAdmission: DocumentAdmission = {
  commit: ({ after, before, change, editor, indexOf }) => {
    const records = getInternalDocumentChangeRecords(change);
    const dropped = new Set(
      [...(records.get(CONTEXTS) ?? [])].flatMap(([ctx, json]) =>
        json === null ? [ctx] : []
      )
    );

    assertRecordWrites(getValueRecords(after), records);
    if (dropped.size > 0) assertDroppedContextsUnused(after, dropped);

    const previous = insertionsOf(before);
    const counts = new Map(previous.counts);
    const flipped = new Set<string>();
    const roots = contentRootsOf(after);
    const scope = new Map<string, readonly number[]>();
    const beforeFacts = factsOf(before);
    const facts = factsOf(after);

    for (const root of new Set([...previous.roots.keys(), ...roots.keys()])) {
      const old = previous.roots.get(root) ?? [];
      const next = roots.get(root) ?? [];

      if (old === next) continue;

      const span = changedSpan(change, root, old, next, indexOf(root));

      if (!span) continue;
      for (const node of old.slice(span.from, span.beforeTo)) {
        addCounts(counts, insertionsIn(node, beforeFacts), -1, flipped);
      }
      for (const node of next.slice(span.from, span.to)) {
        addCounts(counts, insertionsIn(node, facts), 1, flipped);
      }
      scope.set(
        root,
        Array.from(
          { length: span.to - span.from },
          (_, child) => span.from + child
        )
      );
    }
    rememberInsertions(after, counts);

    const compacted = compactClaims(after, scope);
    const compactedFacts = factsOf(compacted);
    // A verdict, or an incarnation a verdict names starting or stopping to
    // insert, settles claims in every block naming that incarnation.
    const decided = [
      ...verdictIncarnationsOf(records.get(VERDICTS)?.keys() ?? []),
      ...[...flipped].filter((incarnation) => facts.hasVerdict(incarnation)),
    ];
    const settled = new Map(
      [...scope].map(([root, at]) => [root, new Set(at)])
    );

    if (decided.length > 0) {
      const ledger = getDefined(getReviewLedger(getEditorRuntimeOwner(editor)));

      for (const [root, ranks] of ledger.ranksNaming(after, decided)) {
        const at = settled.get(root) ?? new Set<number>();

        for (const rank of ranks) at.add(rank);
        settled.set(root, at);
      }
    }

    const inserting = { has: (incarnation: string) => counts.has(incarnation) };
    const admitted =
      settleValue(
        compacted,
        { ...compactedFacts, insertedIncarnations: () => inserting },
        settled,
        { returnsHeld: true }
      ).value ?? compacted;

    return admitted === after
      ? null
      : repairOf(after, admitted, settled, indexOf);
  },
  load: (document) => {
    assertRecordStore(getValueRecords(document));
    createDocumentMarksValidator().validate(document);

    const compacted = compactClaims(document);
    const facts = factsOf(compacted);
    const value = settleValue(compacted, facts, 'document').value ?? compacted;

    return value === document
      ? null
      : {
          change: DocumentChange.between(document, value, {
            isSetValued: isAuthoredSetValued,
          }),
          value,
        };
  },
};
