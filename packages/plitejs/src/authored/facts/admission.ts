import {
  createInternalDocumentChange,
  DocumentChange,
  getInternalDocumentChangeRanges,
  getInternalDocumentChangeRecords,
  getInternalDocumentRootChange,
  valueRoot,
  valueRootIndex,
} from '../../core/change/document-change';
import {
  type DocumentIndex,
  type IndexedNodeRange,
  NO_NODES,
  type SparseNodes,
  type NodeList,
} from '../../core/change/document-index';
import { jsonEqual } from '../../core/change/json';
import {
  type KeptRun,
  keptRunsOf,
  RootChange,
  type RootChangeSection,
} from '../../core/change/root-change';
import {
  type JsonEditorValue,
  type JsonNode,
  PreparedTokenSlice,
} from '../../core/change/tokens';
import type { DocumentAdmission } from '../../core/document-admission';
import { getEditorRuntimeOwner } from '../../core/editor-runtime';
import { EditorMissingReferenceError } from '../../core/missing-reference';
import { getCompiledEditorSchema } from '../../core/plugin-registry';
import { getActiveEditorUpdateTags } from '../../core/public-state';
import {
  deriveValue,
  getValueRecords,
  recordOpsBetween,
} from '../../core/record-store';
import type { EditorDocumentValue } from '../../interfaces/editor';
import type { Path } from '../../interfaces/path';
import { getDefined } from '../../internal/get-defined';
import { getReviewLedger } from '../ledger/ledger';
import { rootOf } from '../ledger/roots';
import { relinkCuts } from '../tree/cuts';
import type { KeyReading } from '../tree/layers';
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
import { keyReadingOf, repairKeys, settleValue } from './settle';

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

type Leaf = Readonly<Record<string, unknown>> & { text?: string };

type Part = Readonly<{ node: Leaf; run: KeptRun }>;

const propsOf = ({ text: _text, ...props }: Leaf) => props;

const splitLeaf = (
  node: Leaf,
  contentFrom: number,
  parts: readonly Part[]
): readonly Leaf[] => {
  const text = node.text ?? '';
  const leaves: Leaf[] = [];
  const push = (
    props: Readonly<Record<string, unknown>>,
    start: number,
    end: number
  ) => {
    if (end <= start) return;
    const last = leaves.at(-1);

    if (last && jsonEqual(propsOf(last), props)) {
      leaves[leaves.length - 1] = {
        ...props,
        text: last.text + text.slice(start, end),
      };
    } else leaves.push({ ...props, text: text.slice(start, end) });
  };
  let offset = 0;

  for (const part of parts) {
    const start = part.run.from - contentFrom;

    push(propsOf(node), offset, start);
    push(propsOf(part.node), start, part.run.to - contentFrom);
    offset = part.run.to - contentFrom;
  }
  push(propsOf(node), offset, text.length);

  return leaves;
};

const formatTokensOf = (entry: IndexedNodeRange) =>
  entry.kind === 'text' && entry.contentFrom < entry.contentTo
    ? { from: entry.contentFrom, to: entry.contentTo }
    : { from: entry.from, to: entry.from + 1 };

const repairRejectedTags = (
  change: RootChange,
  ranges: Iterable<readonly [number, number, number, number]>,
  before: DocumentIndex,
  after: DocumentIndex,
  reading: KeyReading
) => {
  const sections: RootChangeSection[] = [];
  const seen = new Set<number>();

  for (const [_fromBefore, _toBefore, from, to] of ranges) {
    for (const entry of after.nodeRangesTouching(from, to)) {
      if (seen.has(entry.from)) continue;
      seen.add(entry.from);

      const node = after.node(entry.path) as Leaf;
      const tokens = formatTokensOf(entry);
      const runs = keptRunsOf(change, tokens.from, tokens.to);
      const parts = runs.flatMap((run): Part[] => {
        const source = before.nodeStartingAt(run.at) ?? before.textAt(run.at);

        return source
          ? [{ run, node: repairKeys(before.node(source.path), node, reading) }]
          : [];
      });

      if (parts.every((part) => part.node === node)) continue;
      const [first] = parts;
      const covered =
        parts.reduce((sum, part) => sum + part.run.to - part.run.from, 0) ===
        tokens.to - tokens.from;

      if (
        covered &&
        parts.every((part) =>
          jsonEqual(propsOf(part.node), propsOf(getDefined(first).node))
        )
      ) {
        const props = propsOf(getDefined(first).node);
        const unset = Object.keys(propsOf(node)).filter(
          (key) => !(key in props)
        );
        const set = Object.fromEntries(
          Object.entries(props).filter(
            ([key, value]) => !jsonEqual(value, node[key])
          )
        );

        sections.push({
          from: entry.from,
          properties: {
            ...(Object.keys(set).length > 0 ? { set } : {}),
            ...(unset.length > 0 ? { unset } : {}),
          },
        });
        continue;
      }

      sections.push({
        from: entry.from,
        insert: PreparedTokenSlice.fromNodes(
          splitLeaf(node, entry.contentFrom, parts) as readonly JsonNode[]
        ),
        to: entry.to,
      });
    }
  }

  return sections.length === 0 ? null : RootChange.create(after, sections);
};

const repairOf = (
  after: JsonEditorValue,
  settled: JsonEditorValue,
  scope: ReadonlyMap<string, Iterable<number>>,
  indexOf: (root: string) => DocumentIndex
) => {
  const changes = new Map<string, RootChange>();
  const indexes = new Map<string, DocumentIndex>();
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
    if (composed) {
      changes.set(root, composed);
      indexes.set(root, index);
    }
  }

  const repair = createInternalDocumentChange(changes, {
    records: recordOpsBetween(getValueRecords(after), getValueRecords(settled)),
  });
  const relink = relinkCuts(
    repair,
    after,
    settled,
    (root) => indexes.get(root) ?? indexOf(root),
    indexOf
  );

  return relink ? repair.compose(relink.change) : repair;
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

    const repairs = new Map<string, RootChange>();

    if (getActiveEditorUpdateTags(editor).includes('historic')) {
      const reading = keyReadingOf(facts);

      for (const root of scope.keys()) {
        const rootChange = getInternalDocumentRootChange(change, root);

        if (!rootChange || !previous.roots.has(root)) continue;
        const repair = repairRejectedTags(
          rootChange,
          getInternalDocumentChangeRanges(change, root),
          rootOf(before, root),
          indexOf(root),
          reading
        );

        if (repair) repairs.set(root, repair);
      }
    }

    const replayed =
      repairs.size === 0
        ? after
        : createInternalDocumentChange(repairs).apply(after);
    const compacted = compactClaims(replayed, scope);
    const compactedFacts = factsOf(compacted);
    // A verdict, or an incarnation a verdict names starting or stopping to
    // insert, settles claims in every block naming that incarnation.
    const decided = [
      ...verdictIncarnationsOf(records.get(VERDICTS)?.keys() ?? []),
      ...[...flipped].filter(
        (incarnation) =>
          // A replaced block takes its insertions away and back, so only an
          // incarnation whose count changed sign across the commit flipped.
          (previous.counts.get(incarnation) ?? 0) > 0 !==
            (counts.get(incarnation) ?? 0) > 0 && facts.hasVerdict(incarnation)
      ),
    ];
    const settled = new Map(
      [...scope].map(([root, at]) => [root, new Set(at)])
    );
    const restoreMissingFormats =
      getActiveEditorUpdateTags(editor).includes('collaboration');

    if (!compactedFacts.hasVerdicts && restoreMissingFormats) {
      for (const root of scope.keys()) {
        if (!previous.roots.has(root) || !roots.has(root)) continue;
        const changed = rootOf(before, root).changedChildren(
          rootOf(compacted, root)
        );
        settled.set(
          root,
          new Set(
            changed.flatMap((range) =>
              Array.from(
                { length: range[3] - range[2] },
                (_, offset) => range[2] + offset
              )
            )
          )
        );
      }
    }

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
        {
          returnsHeld: true,
          restoreMissingFormats,
          schema: getCompiledEditorSchema(editor),
        }
      ).value ?? compacted;

    return admitted === after
      ? null
      : repairOf(after, admitted, settled, indexOf);
  },
  load: (document, schema) => {
    assertRecordStore(getValueRecords(document));
    createDocumentMarksValidator().validate(document);

    const compacted = compactClaims(document);
    const facts = factsOf(compacted);
    const value =
      settleValue(compacted, facts, 'document', { schema }).value ?? compacted;

    if (value === document) return null;

    const change = DocumentChange.between(document, value, {
      isSetValued: isAuthoredSetValued,
    });
    const relink = relinkCuts(change, document, value, (root) =>
      valueRootIndex(value, root)
    );

    if (!relink) return { change, value };

    const relinked = (root: string) =>
      relink.indexes.get(root)?.value ?? valueRoot(value, root);

    return {
      change: change.compose(relink.change),
      value: deriveValue(value, {
        children: relinked('main'),
        ...(value.roots && {
          roots: Object.fromEntries(
            Object.keys(value.roots).map((root) => [root, relinked(root)])
          ),
        }),
      } as Partial<typeof value>),
    };
  },
};
